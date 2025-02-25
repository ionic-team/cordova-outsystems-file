package com.outsystems.plugins.file

import io.ionic.libs.ionfilesystemlib.model.IONFILEExceptions

object OSFileErrors {
    private fun formatErrorCode(number: Int): String {
        return "OS-PLUG-FILE-" + number.toString().padStart(4, '0')
    }

    data class ErrorInfo(
        val code: String,
        val message: String
    )

    fun invalidInputMethod(methodName: String): ErrorInfo = ErrorInfo(
        code = formatErrorCode(5),
        message = "The '$methodName' input. parameters aren't valid."
    )

    fun invalidPath(path: String): ErrorInfo = ErrorInfo(
        code = formatErrorCode(6),
        message = "Invalid ${if (path.isNotBlank()) "'$path' " else ""}path."
    )

    val filePermissionsDenied: ErrorInfo = ErrorInfo(
        code = formatErrorCode(7),
        message = "Unable to do file operation, user denied permission request."
    )

    fun doesNotExist(methodName: String, path: String): ErrorInfo = ErrorInfo(
        code = formatErrorCode(8),
        message = "'$methodName' failed because file ${if (path.isNotBlank()) "at '$path' " else ""}does not exist."
    )

    fun notAllowed(methodName: String, notAllowedFor: String): ErrorInfo = ErrorInfo(
        code = formatErrorCode(9),
        message = "'$methodName' not supported for $notAllowedFor."
    )

    fun directoryCreationAlreadyExists(path: String): ErrorInfo = ErrorInfo(
        code = formatErrorCode(10),
        message = "Directory ${if (path.isNotBlank()) "at '$path' " else ""}already exists, cannot be overwritten."
    )

    val missingParentDirectories: ErrorInfo = ErrorInfo(
        code = formatErrorCode(11),
        message = "Missing parent directory – possibly recursive=false was passed or parent directory creation failed."
    )

    val cannotDeleteChildren: ErrorInfo = ErrorInfo(
        code = formatErrorCode(12),
        message = "Cannot delete directory with children; received recursive=false but directory has contents."
    )

    fun operationFailed(methodName: String, errorMessage: String): ErrorInfo = ErrorInfo(
        code = formatErrorCode(13),
        message = "'$methodName' failed with${if (errorMessage.isNotBlank()) ": $errorMessage" else "an unknown error."}"
    )
}

fun Throwable.toFilesystemError(method: OSFileMethod): OSFileErrors.ErrorInfo = when (this) {

    is IONFILEExceptions.UnresolvableUri -> OSFileErrors.invalidPath(this.uri)

    is IONFILEExceptions.DoesNotExist -> OSFileErrors.doesNotExist(method.methodName, this.path)

    is IONFILEExceptions.NotSupportedForContentScheme -> OSFileErrors.notAllowed(
        method.methodName,
        notAllowedFor = "content:// URIs"
    )

    is IONFILEExceptions.NotSupportedForDirectory -> OSFileErrors.notAllowed(
        method.methodName,
        notAllowedFor = "directories"
    )

    is IONFILEExceptions.NotSupportedForFiles -> OSFileErrors.notAllowed(
        method.methodName,
        notAllowedFor = "files, only directories are supported"
    )

    is IONFILEExceptions.CreateFailed.AlreadyExists ->
        OSFileErrors.directoryCreationAlreadyExists(this.path)

    is IONFILEExceptions.CreateFailed.NoParentDirectory -> OSFileErrors.missingParentDirectories

    is IONFILEExceptions.DeleteFailed.CannotDeleteChildren -> OSFileErrors.cannotDeleteChildren

    is IONFILEExceptions.CopyRenameFailed.MixingFilesAndDirectories,
    is IONFILEExceptions.CopyRenameFailed.LocalToContent,
    is IONFILEExceptions.CopyRenameFailed.SourceAndDestinationContent ->
        OSFileErrors.notAllowed(method.methodName, "the provided source and destinations")

    is IONFILEExceptions.CopyRenameFailed.DestinationDirectoryExists ->
        OSFileErrors.directoryCreationAlreadyExists(this.path)

    is IONFILEExceptions.CopyRenameFailed.NoParentDirectory ->
        OSFileErrors.missingParentDirectories

    else -> OSFileErrors.operationFailed(method.methodName, this.localizedMessage ?: "")
}