# Build Actions

This folder contains .json files for configuring build actions to use in a plugin on ODC with Capacitor. The purpose of these build actions is to provide the same functionality as cordova hooks, but on a Capacitor shell.

## Contents

The file setRequestLegacyStorageAndroid.json contains one build action:

- Android specific. Sets the `android:requestLegacyExternalStorage` to `true` in the `<application>` tag of the app's `AndroidManifest.xml`. This is to ensure [expected external storage behavior](https://developer.android.com/training/data-storage/use-cases#opt-out-in-production-app) in specific Android versions, mainly Android 10.


## Outsystems' Usage

1. Copy the build action json file (which can contain multiple build actions inside) into the ODC Plugin, placing them in "Data" -> "Resources" and set "Deploy Action" to "Deploy to Target Directory", with target directory empty.
2. Update the Plugin's Extensibility configuration to use the build action.

```json
{
    "buildConfigurations": {
        "buildAction": {
            "config": $resources.buildActionFileName.json,
            "parameters": {
                // parameters go here; if there are no parameters then the block can be ommited
            }
        }
    }
}
```