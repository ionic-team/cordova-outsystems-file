package com.outsystems.plugins.file

import org.apache.cordova.CallbackContext
import org.apache.cordova.PluginResult
import org.json.JSONObject

/**
 * Extension function to return a successful plugin result
 * @param result JSONObject with the JSON content to return, or null if there's no json data
 * @param keepCallback whether the callback should be kept or not. By default, false
 */
internal fun CallbackContext.sendSuccess(
    result: JSONObject? = null,
    keepCallback: Boolean = false
) {
    val pluginResult = if (result != null) {
        PluginResult(PluginResult.Status.OK, result)
    } else {
        PluginResult(PluginResult.Status.OK)
    }
    pluginResult.keepCallback = keepCallback
    this.sendPluginResult(pluginResult)
}

/**
 * Extension function to return a unsuccessful plugin result
 * @param error error class representing the error to return, containing a code and message
 */
internal fun CallbackContext.sendError(error: OSFileErrors.ErrorInfo) {
    val pluginResult = PluginResult(
        PluginResult.Status.ERROR,
        JSONObject().apply {
            put("code", error.code)
            put("message", error.message)
        }
    )
    this.sendPluginResult(pluginResult)
}