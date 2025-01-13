package com.outsystems.plugins.osgeolocation

import com.google.android.gms.location.LocationServices
import com.google.gson.Gson
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import org.apache.cordova.CallbackContext
import org.apache.cordova.CordovaInterface
import org.apache.cordova.CordovaPlugin
import org.apache.cordova.CordovaWebView
import org.apache.cordova.PermissionHelper
import org.apache.cordova.PluginResult
import org.json.JSONArray
import org.json.JSONObject
import android.Manifest
import android.content.pm.PackageManager
import androidx.activity.result.contract.ActivityResultContracts
import com.outsystems.plugins.osgeolocation.controller.OSGLOCController
import com.outsystems.plugins.osgeolocation.model.OSGLOCException
import com.outsystems.plugins.osgeolocation.model.OSGLOCLocationOptions
import kotlinx.coroutines.cancel
import kotlinx.coroutines.flow.MutableSharedFlow

/**
 * Cordova bridge, inherits from CordovaPlugin
 */
class OSFilePlugin : CordovaPlugin() {

  
    override fun initialize(cordova: CordovaInterface, webView: CordovaWebView) {
        super.initialize(cordova, webView)
    }

    override fun onDestroy() {
        super.onDestroy()
    }

    override fun execute(
        action: String,
        args: JSONArray,
        callbackContext: CallbackContext
    ): Boolean {
        when (action) {
            "ping" -> {
                TODO()
            }
        }
        return true
    }

}