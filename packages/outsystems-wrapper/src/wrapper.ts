import { AppendFileOptions, CopyOptions, CopyResult, DeleteFileOptions, GetUriOptions, GetUriResult, MkdirOptions, PluginError, ReaddirOptions, ReaddirResult, ReadFileOptions, ReadFileResult, RenameOptions, RmdirOptions, StatOptions, StatResult, WriteFileOptions, WriteFileResult } from "../../cordova-plugin/src/definitions";
import { FilesystemWeb } from "../../cordova-plugin/src/web";

class OSFilePlugin {

    private webPlugin: FilesystemWeb
    constructor() {
        this.webPlugin = new FilesystemWeb()
    }

    readFile(success: (file: ReadFileResult) => void, error: (err: PluginError) => void, options: ReadFileOptions): void {
        // @ts-ignore
        if (typeof (CapacitorUtils) === 'undefined') {
            this.webPlugin.readFile(options)
                .then(file => success(file))
                .catch(err => error(err))
        }

        // @ts-ignore
        CapacitorUtils.Synapse.Filesystem.readFile(success, error, options)
    }
    writeFile(success: (result: WriteFileResult) => void, error: (err: PluginError) => void, options: WriteFileOptions): void {
        // @ts-ignore
        if (typeof (CapacitorUtils) === 'undefined') {
            this.webPlugin.writeFile(options)
                .then(result => success(result))
                .catch(err => error(err))
        }

        // @ts-ignore
        CapacitorUtils.Synapse.Filesystem.writeFile(success, error, options)
    }
    appendFile(success: () => void, error: (err: PluginError) => void, options: AppendFileOptions): void {
        // @ts-ignore
        if (typeof (CapacitorUtils) === 'undefined') {
            this.webPlugin.appendFile(options)
                .then(() => success())
                .catch(err => error(err))
        }
        // @ts-ignore
        CapacitorUtils.Synapse.Filesystem.appendFile(success, error, options)
    }
    deleteFile(success: () => void, error: (err: PluginError) => void, options: DeleteFileOptions): void {
        // @ts-ignore
        if (typeof (CapacitorUtils) === 'undefined') {
            this.webPlugin.deleteFile(options)
                .then(() => success())
                .catch(err => error(err))
        }
        // @ts-ignore
        CapacitorUtils.Synapse.Filesystem.deleteFile(success, error, options)
    }
    mkdir(success: () => void, error: (err: PluginError) => void, options: MkdirOptions): void {
        // @ts-ignore
        if (typeof (CapacitorUtils) === 'undefined') {
            this.webPlugin.mkdir(options)
                .then(() => success())
                .catch(err => error(err))
        }
        // @ts-ignore
        CapacitorUtils.Synapse.Filesystem.mkdir(success, error, options)
    }
    rmdir(success: () => void, error: (err: PluginError) => void, options: RmdirOptions): void {
        // @ts-ignore
        if (typeof (CapacitorUtils) === 'undefined') {
            this.webPlugin.rmdir(options)
                .then(() => success())
                .catch(err => error(err))
        }
        // @ts-ignore
        CapacitorUtils.Synapse.Filesystem.rmdir(success, error, options)
    }
    readdir(success: (res: ReaddirResult) => void, error: (err: PluginError) => void, options: ReaddirOptions): void {
        // @ts-ignore
        if (typeof (CapacitorUtils) === 'undefined') {
            this.webPlugin.readdir(options)
                .then((res) => success(res))
                .catch(err => error(err))
        }
        // @ts-ignore
        CapacitorUtils.Synapse.Filesystem.readdir(success, error, options)
    }
    getUri(success: (res: GetUriResult) => void, error: (err: PluginError) => void, options: GetUriOptions): void {
        // @ts-ignore
        if (typeof (CapacitorUtils) === 'undefined') {
            this.webPlugin.getUri(options)
                .then((res) => success(res))
                .catch(err => error(err))
        }
        // @ts-ignore
        CapacitorUtils.Synapse.Filesystem.getUri(success, error, options)
    }
    stat(success: (res: StatResult) => void, error: (err: PluginError) => void, options: StatOptions): void {
        // @ts-ignore
        if (typeof (CapacitorUtils) === 'undefined') {
            this.webPlugin.stat(options)
                .then((res) => success(res))
                .catch(err => error(err))
        }
        // @ts-ignore
        CapacitorUtils.Synapse.Filesystem.stat(success, error, options)
    }
    rename(success: () => void, error: (err: PluginError) => void, options: RenameOptions): void {
        // @ts-ignore
        if (typeof (CapacitorUtils) === 'undefined') {
            this.webPlugin.rename(options)
                .then(() => success())
                .catch(err => error(err))
        }
        // @ts-ignore
        CapacitorUtils.Synapse.Filesystem.rename(success, error, options)
    }

    copy(success: (res: CopyResult) => void, error: (err: PluginError) => void, options: CopyOptions): void {
        // @ts-ignore
        if (typeof (CapacitorUtils) === 'undefined') {
            this.webPlugin.copy(options)
                .then((res) => success(res))
                .catch(err => error(err))
        }
        // @ts-ignore
        CapacitorUtils.Synapse.Filesystem.copy(success, error, options)
    }

}
export const Instance = new OSFilePlugin()