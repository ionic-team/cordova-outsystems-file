package com.outsystems.plugins.file

import android.content.pm.PackageManager
import io.ionic.libs.ionfilesystemlib.IONFILEController
import io.ionic.libs.ionfilesystemlib.model.IONFILECreateOptions
import io.ionic.libs.ionfilesystemlib.model.IONFILEDeleteOptions
import io.ionic.libs.ionfilesystemlib.model.IONFILEUri
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.cancel
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.catch
import kotlinx.coroutines.flow.launchIn
import kotlinx.coroutines.flow.onCompletion
import kotlinx.coroutines.flow.onEach
import kotlinx.coroutines.launch
import org.apache.cordova.CallbackContext
import org.apache.cordova.CordovaInterface
import org.apache.cordova.CordovaPlugin
import org.apache.cordova.CordovaWebView
import org.json.JSONArray
import org.json.JSONObject

/**
 * Cordova bridge, inherits from CordovaPlugin
 */
class OSFilePlugin : CordovaPlugin() {

    private lateinit var controller: IONFILEController
    private lateinit var coroutineScope: CoroutineScope

    private val permissionFlowsMap: MutableMap<Int, MutableSharedFlow<Boolean>> = mutableMapOf()

    override fun initialize(cordova: CordovaInterface, webView: CordovaWebView) {
        super.initialize(cordova, webView)
        controller = IONFILEController(context = cordova.context.applicationContext)
        coroutineScope = CoroutineScope(Dispatchers.Main)
    }

    override fun onDestroy() {
        super.onDestroy()
        coroutineScope.cancel()
        permissionFlowsMap.clear()
    }

    override fun execute(
        action: String,
        args: JSONArray,
        callbackContext: CallbackContext
    ): Boolean {
        val optionsObject: JSONObject
        try {
            optionsObject = args.getJSONObject(0)
        } catch (e: Exception) {
            callbackContext.sendError(OSFileErrors.invalidInputMethod(action))
            return true
        }
        when (action) {
            OSFileMethod.READ.methodName -> readFile(optionsObject, callbackContext)

            OSFileMethod.READ_IN_CHUNKS.methodName ->
                readFileInChunks(optionsObject, callbackContext)

            OSFileMethod.WRITE.methodName ->
                writeFile(optionsObject, callbackContext, append = false)

            OSFileMethod.APPEND.methodName ->
                writeFile(optionsObject, callbackContext, append = true)

            OSFileMethod.DELETE_FILE.methodName -> deleteFile(optionsObject, callbackContext)

            OSFileMethod.CREATE_DIRECTORY.methodName -> mkdir(optionsObject, callbackContext)

            OSFileMethod.REMOVE_DIRECTORY.methodName -> rmdir(optionsObject, callbackContext)

            OSFileMethod.LIST_DIRECTORY.methodName -> readdir(optionsObject, callbackContext)

            OSFileMethod.GET_URI.methodName -> getUri(optionsObject, callbackContext)

            OSFileMethod.STAT.methodName -> stat(optionsObject, callbackContext)

            OSFileMethod.RENAME.methodName -> rename(optionsObject, callbackContext)

            OSFileMethod.COPY.methodName -> copy(optionsObject, callbackContext)

            else -> return false
        }
        return true
    }

    // region actions
    private fun readFile(args: JSONObject, callbackContext: CallbackContext) {
        val input = args.getReadFileOptions() ?: run {
            callbackContext.sendError(OSFileErrors.invalidInputMethod(OSFileMethod.READ.methodName))
            return
        }
        runWithPermission(input.uri, OSFileMethod.READ, callbackContext) { uri ->
            controller.readFile(uri, input.options)
                .onSuccess { callbackContext.sendSuccess(result = createReadResultObject(it)) }
                .onFailure { callbackContext.sendError(it.toFilesystemError(OSFileMethod.READ)) }
        }
    }

    private fun readFileInChunks(args: JSONObject, callbackContext: CallbackContext) {
        val input = args.getReadFileInChunksOptions() ?: run {
            callbackContext.sendError(OSFileErrors.invalidInputMethod(OSFileMethod.READ_IN_CHUNKS.methodName))
            return
        }
        runWithPermission(input.uri, OSFileMethod.READ_IN_CHUNKS, callbackContext) { uri ->
            controller.readFileByChunks(uri, input.options)
                .onEach { chunk ->
                    callbackContext.sendSuccess(
                        result = createReadResultObject(chunk),
                        keepCallback = true
                    )
                }
                .onCompletion { callbackContext.sendSuccess(result = createReadResultObject("")) }
                .catch { callbackContext.sendError(it.toFilesystemError(OSFileMethod.READ_IN_CHUNKS)) }
                .launchIn(coroutineScope)
        }
    }

    private fun writeFile(args: JSONObject, callbackContext: CallbackContext, append: Boolean) {
        val method = if (append) OSFileMethod.APPEND else OSFileMethod.WRITE
        val input = args.getWriteFileOptions(append) ?: run {
            callbackContext.sendError(OSFileErrors.invalidInputMethod(method.methodName))
            return
        }
        runWithPermission(input.uri, method, callbackContext) { uri ->
            controller.saveFile(uri, input.options)
                .onSuccess { uriSaved ->
                    callbackContext.sendSuccess(
                        result = createWriteResultObject(
                            uriSaved,
                            input.options.mode
                        )
                    )
                }
                .onFailure { callbackContext.sendError(it.toFilesystemError(method)) }
        }
    }

    private fun deleteFile(args: JSONObject, callbackContext: CallbackContext) {
        val input = args.getSingleIONFILEUri() ?: run {
            callbackContext.sendError(OSFileErrors.invalidInputMethod(OSFileMethod.DELETE_FILE.methodName))
            return
        }
        runWithPermission(input, OSFileMethod.DELETE_FILE, callbackContext) { uri ->
            controller.delete(uri, IONFILEDeleteOptions(recursive = false))
                .onSuccess { callbackContext.sendSuccess() }
                .onFailure { callbackContext.sendError(it.toFilesystemError(OSFileMethod.DELETE_FILE)) }
        }
    }

    private fun mkdir(args: JSONObject, callbackContext: CallbackContext) {
        val input = args.getSingleUriWithRecursiveOptions() ?: run {
            callbackContext.sendError(OSFileErrors.invalidInputMethod(OSFileMethod.CREATE_DIRECTORY.methodName))
            return
        }
        runWithPermission(input.uri, OSFileMethod.CREATE_DIRECTORY, callbackContext) { uri ->
            controller.createDirectory(uri, IONFILECreateOptions(input.recursive))
                .onSuccess { callbackContext.sendSuccess() }
                .onFailure { callbackContext.sendError(it.toFilesystemError(OSFileMethod.CREATE_DIRECTORY)) }
        }
    }

    private fun rmdir(args: JSONObject, callbackContext: CallbackContext) {
        val input = args.getSingleUriWithRecursiveOptions() ?: run {
            callbackContext.sendError(OSFileErrors.invalidInputMethod(OSFileMethod.REMOVE_DIRECTORY.methodName))
            return
        }
        runWithPermission(input.uri, OSFileMethod.REMOVE_DIRECTORY, callbackContext) { uri ->
            controller.delete(uri, IONFILEDeleteOptions(input.recursive))
                .onSuccess { callbackContext.sendSuccess() }
                .onFailure { callbackContext.sendError(it.toFilesystemError(OSFileMethod.REMOVE_DIRECTORY)) }
        }
    }

    private fun readdir(args: JSONObject, callbackContext: CallbackContext) {
        val input = args.getSingleIONFILEUri() ?: run {
            callbackContext.sendError(OSFileErrors.invalidInputMethod(OSFileMethod.LIST_DIRECTORY.methodName))
            return
        }
        runWithPermission(input, OSFileMethod.LIST_DIRECTORY, callbackContext) { uri ->
            controller.listDirectory(uri)
                .onSuccess { callbackContext.sendSuccess(result = createReadDirResultObject(it)) }
                .onFailure { callbackContext.sendError(it.toFilesystemError(OSFileMethod.LIST_DIRECTORY)) }
        }
    }

    private fun getUri(args: JSONObject, callbackContext: CallbackContext) {
        val input = args.getSingleIONFILEUri() ?: run {
            callbackContext.sendError(OSFileErrors.invalidInputMethod(OSFileMethod.GET_URI.methodName))
            return
        }
        coroutineScope.launch {
            controller.getFileUri(input)
                .onSuccess { callbackContext.sendSuccess(result = createUriResultObject(it.uri)) }
                .onFailure { callbackContext.sendError(it.toFilesystemError(OSFileMethod.GET_URI)) }
        }
    }

    private fun stat(args: JSONObject, callbackContext: CallbackContext) {
        val input = args.getSingleIONFILEUri() ?: run {
            callbackContext.sendError(OSFileErrors.invalidInputMethod(OSFileMethod.STAT.methodName))
            return
        }
        runWithPermission(input, OSFileMethod.STAT, callbackContext) { uri ->
            controller.listDirectory(uri)
                .onSuccess { callbackContext.sendSuccess(result = createReadDirResultObject(it)) }
                .onFailure { callbackContext.sendError(it.toFilesystemError(OSFileMethod.STAT)) }
        }
    }

    private fun rename(args: JSONObject, callbackContext: CallbackContext) {
        val input = args.getDoubleIONFILEUri() ?: run {
            callbackContext.sendError(OSFileErrors.invalidInputMethod(OSFileMethod.RENAME.methodName))
            return
        }
        runWithPermission(
            input.fromUri,
            input.toUri,
            OSFileMethod.RENAME,
            callbackContext
        ) { source, destination ->
            controller.move(source, destination)
                .onSuccess { callbackContext.sendSuccess() }
                .onFailure { callbackContext.sendError(it.toFilesystemError(OSFileMethod.RENAME)) }
        }
    }

    private fun copy(args: JSONObject, callbackContext: CallbackContext) {
        val input = args.getDoubleIONFILEUri() ?: run {
            callbackContext.sendError(OSFileErrors.invalidInputMethod(OSFileMethod.COPY.methodName))
            return
        }
        runWithPermission(
            input.fromUri,
            input.toUri,
            OSFileMethod.COPY,
            callbackContext
        ) { source, destination ->
            controller.move(source, destination)
                .onSuccess { callbackContext.sendSuccess() }
                .onFailure { callbackContext.sendError(it.toFilesystemError(OSFileMethod.COPY)) }
        }
    }
    // endregion actions

    // region resolve uri / permission logic
    /**
     * Runs a suspend code if the app has permission to access the uri
     *
     * Will ask for permission if it has not been granted.
     *
     * May return an error if the uri is not resolvable.
     *
     * @param uri the uri pointing to the file / directory
     * @param method the method of the file plugin that was called
     * @param callbackContext the cordova plugin callback context
     * @param onPermissionGranted the callback to run the suspending code
     */
    private fun runWithPermission(
        uri: IONFILEUri.Unresolved,
        method: OSFileMethod,
        callbackContext: CallbackContext,
        onPermissionGranted: suspend (resolvedUri: IONFILEUri.Resolved) -> Unit
    ) {
        coroutineScope.launch {
            controller.getFileUri(uri)
                .onSuccess { resolvedUri ->
                    if (resolvedUri.inExternalStorage && !hasFilePermissions(this@OSFilePlugin)) {
                        requestPermission(method, callbackContext) {
                            onPermissionGranted(resolvedUri)
                        }
                    } else {
                        onPermissionGranted(resolvedUri)
                    }
                }
                .onFailure { callbackContext.sendError(it.toFilesystemError(method)) }
        }
    }

    /**
     * Runs a suspend code if the app has permission to access both to and from uris
     *
     * Will ask for permission if it has not been granted.
     *
     * May return an error if the uri is not resolvable.
     *
     * @param fromUri the source uri pointing to the file / directory
     * @param toUri the destination uri pointing to the file / directory
     * @param method the method of the file plugin that was called
     * @param callbackContext the cordova plugin callback context
     * @param onPermissionGranted the callback to run the suspending code
     */
    private fun runWithPermission(
        fromUri: IONFILEUri.Unresolved,
        toUri: IONFILEUri.Unresolved,
        method: OSFileMethod,
        callbackContext: CallbackContext,
        onPermissionGranted: suspend (resolvedSourceUri: IONFILEUri.Resolved, resolvedDestinationUri: IONFILEUri.Resolved) -> Unit
    ) {
        runWithPermission(fromUri, method, callbackContext) { resolvedSourceUri ->
            runWithPermission(toUri, method, callbackContext) { resolvedDestinationUri ->
                onPermissionGranted(resolvedSourceUri, resolvedDestinationUri)
            }
        }
    }

    /**
     * Requests permissions and collects the flow for permission request.
     * Will send error if permission was denied
     *
     * @param method the method of the file plugin that was called
     * @param callbackContext the cordova plugin callback context
     * @param onPermissionGranted a callback to run suspending code after permission has been granted
     */
    private suspend fun requestPermission(
        method: OSFileMethod,
        callbackContext: CallbackContext,
        onPermissionGranted: suspend () -> Unit
    ) {
        val newFlow = MutableSharedFlow<Boolean>(replay = 1)
        permissionFlowsMap[method.permissionRequestCode] = newFlow
        requestFilePermissions(this, method.permissionRequestCode)
        newFlow.collect { permissionGranted ->
            if (permissionGranted) {
                onPermissionGranted()
            } else {
                callbackContext.sendError(OSFileErrors.filePermissionsDenied)
            }
        }
    }

    override fun onRequestPermissionResult(
        requestCode: Int,
        permissions: Array<out String>,
        grantResults: IntArray
    ) {
        permissionFlowsMap[requestCode]?.let { flow ->
            coroutineScope.launch {
                flow.emit(grantResults.contains(PackageManager.PERMISSION_GRANTED))
            }
        }
    }
    // endregion resolve uri / permission logic
}