package com.outsystems.plugins.file

import android.net.Uri
import io.ionic.libs.ionfilesystemlib.model.IONFILEFileType
import io.ionic.libs.ionfilesystemlib.model.IONFILEMetadataResult
import io.ionic.libs.ionfilesystemlib.model.IONFILESaveMode
import io.ionic.libs.ionfilesystemlib.model.IONFILEUri
import org.json.JSONArray
import org.json.JSONObject

private const val OUTPUT_DATA = "data"
private const val OUTPUT_NAME = "name"
private const val OUTPUT_TYPE = "type"
private const val OUTPUT_SIZE = "size"
private const val OUTPUT_MODIFIED_TIME = "mtime"
private const val OUTPUT_CREATED_TIME = "ctime"
private const val OUTPUT_URI = "uri"
private const val OUTPUT_FILES = "files"

/**
 * @return a result [JSONObject] for reading a file
 */
fun createReadResultObject(readData: String): JSONObject =
    JSONObject().also { it.putOpt(OUTPUT_DATA, readData) }


/**
 * @return a result [JSONObject] for writing/append a file
 */
fun createWriteResultObject(uri: Uri, mode: IONFILESaveMode): JSONObject? =
    if (mode == IONFILESaveMode.APPEND) {
        null
    } else {
        createUriResultObject(uri)
    }

/**
 * @return a result [JSONObject] for the list of a directories contents
 */
fun createReadDirResultObject(list: List<IONFILEMetadataResult>): JSONObject = JSONObject().also {
    it.put(OUTPUT_FILES, JSONArray(list.map { child -> child.toResultObject() }))
}

/**
 * @return a result [JSONObject] for stat, from the [IONFILEMetadataResult] object
 */
fun IONFILEMetadataResult.toResultObject(): JSONObject = JSONObject().apply {
    put(OUTPUT_NAME, name)
    put(OUTPUT_TYPE, if (type is IONFILEFileType.Directory) "directory" else "file")
    put(OUTPUT_SIZE, size)
    put(OUTPUT_MODIFIED_TIME, lastModifiedTimestamp)
    if (createdTimestamp != null) {
        put(OUTPUT_CREATED_TIME, createdTimestamp)
    } else {
        put(OUTPUT_CREATED_TIME, null)
    }
    put(OUTPUT_URI, uri)
}

/**
 * @return a result [JSONObject] based on a resolved uri [IONFILEUri.Resolved]
 */
fun IONFILEUri.Resolved.toResultObject(): JSONObject = createUriResultObject(this.uri)

/**
 * @return a result [JSONObject] for an Android [Uri]
 */
fun createUriResultObject(uri: Uri): JSONObject =
    JSONObject().also { it.put(OUTPUT_URI, uri.toString()) }