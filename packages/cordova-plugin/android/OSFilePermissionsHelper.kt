package com.outsystems.plugins.file

import android.Manifest
import android.os.Build
import org.apache.cordova.CordovaPlugin
import org.apache.cordova.PermissionHelper

private val permissionList = listOf(
    Manifest.permission.READ_EXTERNAL_STORAGE,
    Manifest.permission.WRITE_EXTERNAL_STORAGE
)

/**
 * Helper function to determine Location permission state
 * @return Boolean indicating if permissions are granted or not
 */
internal fun hasFilePermissions(plugin: CordovaPlugin): Boolean {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
        // EXTERNAL_STORAGE permissions are no longer granted on Android 13 and above; so will ignore permission request
        return true
    }
    for (permission in permissionList) {
        if (!PermissionHelper.hasPermission(plugin, permission)) {
            return false
        }
    }
    return true
}

/**
 * Helper function to request location permissions
 */
internal fun requestFilePermissions(plugin: CordovaPlugin, requestCode: Int) {
    PermissionHelper.requestPermissions(
        plugin,
        requestCode,
        permissionList.toTypedArray()
    )
}