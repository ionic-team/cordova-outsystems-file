package com.outsystems.plugins.file

import io.ionic.libs.ionfilesystemlib.model.IONFILEConstants
import io.ionic.libs.ionfilesystemlib.model.IONFILEEncoding
import io.ionic.libs.ionfilesystemlib.model.IONFILEFolderType
import io.ionic.libs.ionfilesystemlib.model.IONFILEReadInChunksOptions
import io.ionic.libs.ionfilesystemlib.model.IONFILEReadOptions
import io.ionic.libs.ionfilesystemlib.model.IONFILESaveMode
import io.ionic.libs.ionfilesystemlib.model.IONFILESaveOptions
import io.ionic.libs.ionfilesystemlib.model.IONFILEUri
import org.json.JSONException
import org.json.JSONObject

private const val INPUT_PATH = "path"
private const val INPUT_DIRECTORY = "directory"
private const val INPUT_ENCODING = "encoding"
private const val INPUT_OFFSET = "offset"
private const val INPUT_LENGTH = "length"
private const val INPUT_CHUNK_SIZE = "chunkSize"
private const val INPUT_DATA = "data"
private const val INPUT_RECURSIVE = "recursive"
private const val INPUT_FROM = "from"
private const val INPUT_FROM_DIRECTORY = "directory"
private const val INPUT_TO = "to"
private const val INPUT_TO_DIRECTORY = "toDirectory"

internal data class OSFileReadOptions(
    val uri: IONFILEUri.Unresolved,
    val options: IONFILEReadOptions
)

internal data class OSFileReadInChunksOptions(
    val uri: IONFILEUri.Unresolved,
    val options: IONFILEReadInChunksOptions
)

internal data class OSFileWriteOptions(
    val uri: IONFILEUri.Unresolved,
    val options: IONFILESaveOptions
)

internal data class OSFileSingleUriWithRecursiveOptions(
    val uri: IONFILEUri.Unresolved,
    val recursive: Boolean
)

internal data class OSFileDoubleUri(
    val fromUri: IONFILEUri.Unresolved,
    val toUri: IONFILEUri.Unresolved,
)

/**
 * @return [OSFileReadOptions] from JSON inside [JSONObject], or null if input is invalid
 */
internal fun JSONObject.getReadFileOptions(): OSFileReadOptions? {
    try {
        val uri = getSingleIONFILEUri() ?: return null
        val encoding = IONFILEEncoding.fromEncodingName(optString(INPUT_ENCODING))
        val offsetAndLength = getOffsetAndLength()
        return OSFileReadOptions(
            uri = uri,
            options = IONFILEReadOptions(
                encoding,
                offset = offsetAndLength.first,
                length = offsetAndLength.second
            )
        )
    } catch (ex: JSONException) {
        return null
    }
}

/**
 * @return [OSFileReadInChunksOptions] from JSON inside [JSONObject], or null if input is invalid
 */
internal fun JSONObject.getReadFileInChunksOptions(): OSFileReadInChunksOptions? {
    try {
        val uri = getSingleIONFILEUri() ?: return null
        val encoding = IONFILEEncoding.fromEncodingName(optString(INPUT_ENCODING))
        val chunkSize = getInt(INPUT_CHUNK_SIZE).takeIf { it > 0 } ?: return null
        val offsetAndLength = getOffsetAndLength()
        return OSFileReadInChunksOptions(
            uri = uri,
            options =
                IONFILEReadInChunksOptions(
                    encoding = encoding,
                    chunkSize = chunkSize,
                    offset = offsetAndLength.first,
                    length = offsetAndLength.second
                )
        )
    } catch (ex: JSONException) {
        return null
    }
}

/**
 * @return [OSFileReadOptions] from JSON inside [JSONObject], or null if input is invalid
 */
internal fun JSONObject.getWriteFileOptions(append: Boolean): OSFileWriteOptions? {
    try {
        val uri = getSingleIONFILEUri() ?: return null
        val data = getString(INPUT_DATA) ?: return null
        val recursive = optBoolean(INPUT_RECURSIVE, true)
        val encoding = IONFILEEncoding.fromEncodingName(optString(INPUT_ENCODING))
        val saveMode = if (append) IONFILESaveMode.APPEND else IONFILESaveMode.WRITE
        return OSFileWriteOptions(
            uri = uri,
            options = IONFILESaveOptions(
                data = data,
                encoding = encoding,
                mode = saveMode,
                createFileRecursive = recursive
            )
        )
    } catch (ex: JSONException) {
        return null
    }
}

/**
 * @return [OSFileSingleUriWithRecursiveOptions] from JSON inside [JSONObject], or null if input is invalid
 */
internal fun JSONObject.getSingleUriWithRecursiveOptions(): OSFileSingleUriWithRecursiveOptions? {
    try {
        val uri = getSingleIONFILEUri() ?: return null
        val recursive = optBoolean(INPUT_RECURSIVE, true)
        return OSFileSingleUriWithRecursiveOptions(uri = uri, recursive = recursive)
    } catch (ex: JSONException) {
        return null
    }
}

/**
 * @return two uris in form of [OSFileDoubleUri] from JSON inside [JSONObject], or null if input is invalid
 */
internal fun JSONObject.getDoubleIONFILEUri(): OSFileDoubleUri? {
    try {
        val fromPath = getString(INPUT_FROM) ?: return null
        val fromFolder = IONFILEFolderType.fromStringAlias(optString(INPUT_FROM_DIRECTORY))
        val toPath = getString(INPUT_TO) ?: return null
        val toFolder = optString(INPUT_TO_DIRECTORY).let { toDirectory ->
            IONFILEFolderType.fromStringAlias(toDirectory)
        } ?: fromFolder
        return OSFileDoubleUri(
            fromUri = IONFILEUri.Unresolved(fromFolder, fromPath),
            toUri = IONFILEUri.Unresolved(toFolder, toPath),
        )
    } catch (ex: JSONException) {
        return null
    }
}

/**
 * return a single [IONFILEUri.Unresolved] from JSON inside [JSONObject], or null if input is invalid
 */
internal fun JSONObject.getSingleIONFILEUri(): IONFILEUri.Unresolved? {
    try {
        val path = getString(INPUT_PATH) ?: return null
        val directoryAlias = optString(INPUT_DIRECTORY)
        return unresolvedUri(path, directoryAlias)
    } catch (ex: JSONException) {
        return null
    }
}

private fun JSONObject.getOffsetAndLength(): Pair<Int, Int> = Pair(
    optInt(INPUT_OFFSET, 0).takeIf { it >= 0 } ?: 0,
    optInt(INPUT_LENGTH, -1).takeIf { it > 0 } ?: IONFILEConstants.LENGTH_READ_TIL_EOF
)

private fun unresolvedUri(path: String, directoryAlias: String?) = IONFILEUri.Unresolved(
    parentFolder = IONFILEFolderType.fromStringAlias(directoryAlias),
    uriPath = path
)
