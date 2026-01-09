import { AppendFileOptions, CopyOptions, CopyResult, DeleteFileOptions, FileInfo, GetUriOptions, GetUriResult, MkdirOptions, PluginError, ReaddirOptions, ReaddirResult, ReadFileOptions, ReadFileResult, RenameOptions, RmdirOptions, StatOptions, WriteFileOptions, WriteFileResult } from "../../cordova-plugin/src/definitions";
import { FilesystemWeb } from "../../cordova-plugin/src/web";

class OSFilePlugin {

    private webPlugin: FilesystemWeb
    constructor() {
        this.webPlugin = new FilesystemWeb()
    }

    readFile(success: (file: ReadFileResult) => void, error: (err: PluginError) => void, options: ReadFileOptions): void {
        if (this.shouldUseCordovaWebImplementation()) {
            this.webPlugin.readFile(options)
                .then(file => success(file))
                .catch(err => error(err))
            return
        }

        if (this.isCordovaPluginDefined()) {
            // @ts-ignore
            cordova.plugins.Filesystem.readFile(success, error, options)
        } else {
            // @ts-ignore
            window.CapacitorPlugins.Filesystem.readFile(options)
                .then(success)
                .catch(error)
        }
    }

    writeFile(success: (result: WriteFileResult) => void, error: (err: PluginError) => void, options: WriteFileOptions): void {
        if (this.shouldUseCordovaWebImplementation()) {
            this.webPlugin.writeFile(options)
                .then(result => success(result))
                .catch(err => error(err))
            return
        }

        if (this.isCordovaPluginDefined()) {
            // @ts-ignore
            cordova.plugins.Filesystem.writeFile(success, error, options)
        } else {
            // @ts-ignore
            window.CapacitorPlugins.Filesystem.writeFile(options)
                .then(success)
                .catch(error)
        }
    }

    appendFile(success: () => void, error: (err: PluginError) => void, options: AppendFileOptions): void {
        if (this.shouldUseCordovaWebImplementation()) {
            this.webPlugin.appendFile(options)
                .then(() => success())
                .catch(err => error(err))
            return
        }

        if (this.isCordovaPluginDefined()) {
            // @ts-ignore
            cordova.plugins.Filesystem.appendFile(success, error, options)
        } else {
            // @ts-ignore
            window.CapacitorPlugins.Filesystem.appendFile(options)
                .then(success)
                .catch(error)
        }
    }

    deleteFile(success: () => void, error: (err: PluginError) => void, options: DeleteFileOptions): void {
        // @ts-ignore
        if (this.shouldUseCordovaWebImplementation()) {
            this.webPlugin.deleteFile(options)
                .then(() => success())
                .catch(err => error(err))
            return
        }

        if (this.isCordovaPluginDefined()) {
            // @ts-ignore
            cordova.plugins.Filesystem.deleteFile(success, error, options)
        } else {
            // @ts-ignore
            window.CapacitorPlugins.Filesystem.deleteFile(options)
                .then(success)
                .catch(error)
        }
    }

    mkdir(success: () => void, error: (err: PluginError) => void, options: MkdirOptions): void {
        if (this.shouldUseCordovaWebImplementation()) {
            this.webPlugin.mkdir(options)
                .then(() => success())
                .catch(err => error(err))
            return
        }

        if (this.isCordovaPluginDefined()) {
            // @ts-ignore
            cordova.plugins.Filesystem.mkdir(success, error, options)
        } else {
            // @ts-ignore
            window.CapacitorPlugins.Filesystem.mkdir(options)
                .then(success)
                .catch(error)
        }
    }

    rmdir(success: () => void, error: (err: PluginError) => void, options: RmdirOptions): void {
        if (this.shouldUseCordovaWebImplementation()) {
            this.webPlugin.rmdir(options)
                .then(() => success())
                .catch(err => error(err))
            return
        }
        
        if (this.isCordovaPluginDefined()) {
            // @ts-ignore
            cordova.plugins.Filesystem.rmdir(success, error, options)
        } else {
            // @ts-ignore
            window.CapacitorPlugins.Filesystem.rmdir(options)
                .then(success)
                .catch(error)
        }
    }

    readdir(success: (res: ReaddirResult) => void, error: (err: PluginError) => void, options: ReaddirOptions): void {
        if (this.shouldUseCordovaWebImplementation()) {
            this.webPlugin.readdir(options)
                .then((res) => success(res))
                .catch(err => error(err))
            return
        }

        if (this.isCordovaPluginDefined()) {
            // @ts-ignore
            cordova.plugins.Filesystem.readdir(success, error, options)
        } else {
            // @ts-ignore
            window.CapacitorPlugins.Filesystem.readdir(options)
                .then(success)
                .catch(error)
        }
    }

    getUri(success: (res: GetUriResult) => void, error: (err: PluginError) => void, options: GetUriOptions): void {
        if (this.shouldUseCordovaWebImplementation()) {
            this.webPlugin.getUri(options)
                .then((res) => success(res))
                .catch(err => error(err))
            return
        }

        if (this.isCordovaPluginDefined()) {
            // @ts-ignore
            cordova.plugins.Filesystem.getUri(success, error, options)
        } else {
            // @ts-ignore
            window.CapacitorPlugins.Filesystem.getUri(options)
                .then(success)
                .catch(error)
        }
    }

    stat(success: (res: FileInfo) => void, error: (err: PluginError) => void, options: StatOptions): void {
        if (this.shouldUseCordovaWebImplementation()) {
            this.webPlugin.stat(options)
                .then((res) => success(res))
                .catch(err => error(err))
            return
        }

        if (this.isCordovaPluginDefined()) {
            // @ts-ignore
            cordova.plugins.Filesystem.stat(success, error, options)
        } else {
            // @ts-ignore
            window.CapacitorPlugins.Filesystem.stat(options)
                .then(success)
                .catch(error)
        }
    }

    rename(success: () => void, error: (err: PluginError) => void, options: RenameOptions): void {
        if (this.shouldUseCordovaWebImplementation()) {
            this.webPlugin.rename(options)
                .then(() => success())
                .catch(err => error(err))
            return
        }

        if (this.isCordovaPluginDefined()) {
            // @ts-ignore
            cordova.plugins.Filesystem.rename(success, error, options)
        } else {
            // @ts-ignore
            window.CapacitorPlugins.Filesystem.rename(options)
                .then(success)
                .catch(error)
        }
    }

    copy(success: (res: CopyResult) => void, error: (err: PluginError) => void, options: CopyOptions): void {
        if (this.shouldUseCordovaWebImplementation()) {
            this.webPlugin.copy(options)
                .then((res) => success(res))
                .catch(err => error(err))
            return
        }
        
        if (this.isCordovaPluginDefined()) {
            // @ts-ignore
            cordova.plugins.Filesystem.copy(success, error, options)
        } else {
            // @ts-ignore
            window.CapacitorPlugins.Filesystem.copy(options)
                .then(success)
                .catch(error)
        }
    }

    /**
     * @returns true if should use the web implementation
     */
    private shouldUseCordovaWebImplementation(): boolean {
        return !(this.isCapacitorPluginDefined() || this.isCordovaPluginDefined())
    }

    /**
     * @returns true if filesystem capacitor plugin is available; false otherwise
     */
    private isCapacitorPluginDefined(): boolean {
        // @ts-ignore
        return (typeof(window) !== "undefined" && typeof(window.CapacitorPlugins) !== "undefined" && typeof(window.CapacitorPlugins.Filesystem) !== "undefined")
    }

    /**
     * @returns true if file cordova plugin is available; false otherwise
     */
    private isCordovaPluginDefined(): boolean {
        // @ts-ignore
        return (typeof(cordova) !== "undefined" && typeof(cordova.plugins) !== "undefined" && typeof(cordova.plugins.Filesystem) !== "undefined")
    }
}
export const Instance = new OSFilePlugin()