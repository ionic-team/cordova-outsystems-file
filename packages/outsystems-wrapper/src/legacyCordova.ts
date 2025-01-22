import { PluginError, Directory, WriteFileOptions, MkdirOptions, WriteFileResult, GetUriOptions, GetUriResult, ReaddirOptions, ReaddirResult, ReadFileOptions, DeleteFileOptions, ReadFileResult } from "../../cordova-plugin/src/definitions";

class LegacyCordovaBridge {
    createDirectory(success: (uri: string) => void, error: (err: PluginError) => void, name: string, path: string, isInternal: boolean, isTemporary: boolean): void {
        let directory: Directory = this.getDirectoryTypeFrom(isInternal, isTemporary)
        let options: MkdirOptions = {
            path: `${path}/${name}`,
            directory: directory,
            recursive: true
        }

        let getUriSuccess = (uri: string) => {
            success(uri)
        }
        let mkDirSuccess = () => {
            this.getUri(getUriSuccess, error, name, path, isInternal, isTemporary)
        }

        // @ts-ignore
        CapacitorUtils.Synapse.Filesystem.mkdir(mkDirSuccess, error, options)
    }

    listDirectory(success: (directoryList: string[], fileList: string[]) => void, error: (error: PluginError) => void, path: string, isInternal: boolean, isTemporary: boolean): void {
        let directory: Directory = this.getDirectoryTypeFrom(isInternal, isTemporary)
        let options: ReaddirOptions = {
            path: path,
            directory: directory
        }

        const synapseSuccess = (res: ReaddirResult) => {
            success(
                res.files.filter(fileInfo => fileInfo.type == 'directory').map(fileInfo => fileInfo.name),
                res.files.filter(fileInfo => fileInfo.type == 'file').map(fileInfo => fileInfo.name)
            )
        }

        // @ts-ignore
        CapacitorUtils.Synapse.Filesystem.readdir(synapseSuccess, error, options)
    }

    writeFile(success: (fs: WriteFileResult) => void, error: (err: PluginError) => void, name: string, path: string, data: string | Blob, isInternal: boolean, isTemporary: boolean): void {
        let directory: Directory = this.getDirectoryTypeFrom(isInternal, isTemporary)
        let options: WriteFileOptions = {
            path: `${path}/${name}`,
            data: data,
            directory: directory,
            recursive: true
        }
        // @ts-ignore
        CapacitorUtils.Synapse.Filesystem.writeFile(success, error, options)
    }

    private getDirectoryTypeFrom(isInternal: boolean, isTemporary: boolean): Directory {
        // @ts-ignore
        if (cordova.platformId == 'android') {
            if (isInternal) {
                return isTemporary ? Directory.Cache : Directory.Data
            }
            return isTemporary ? Directory.ExternalCache : Directory.ExternalStorage
        }
        return isTemporary ? Directory.Temporary : Directory.LibraryNoCloud;
    }

    private getUri(success: (uri: string) => void, error: (err: PluginError) => void, name: string, path: string, isInternal: boolean, isTemporary: boolean): void {
        let directory: Directory = this.getDirectoryTypeFrom(isInternal, isTemporary)
        let options: GetUriOptions = {
            path: `${path}/${name}`,
            directory: directory
        }

        let synapseSuccess = (res: GetUriResult) => {
            success(res.uri)
        }
        // @ts-ignore
        CapacitorUtils.Synapse.Filesystem.getUri(synapseSuccess, error, options)
    }

    readFile(success: (res: ReadFileResult) => void, error: (err: PluginError) => void, path: string, name: string, isInternal: boolean, isTemporary: boolean,): void {
        let directory: Directory = this.getDirectoryTypeFrom(isInternal, isTemporary);
        let options: ReadFileOptions = {
            path: `${path}/${name}`,
            directory: directory
        }
        // @ts-ignore
        CapacitorUtils.Synapse.Filesystem.readFile(success, error, options)
    }

    deleteFile(success: () => void, error: (err: PluginError) => void, path: string, name: string, isInternal: boolean, isTemporary: boolean,): void {
        let directory: Directory = this.getDirectoryTypeFrom(isInternal, isTemporary);
        let options: DeleteFileOptions = {
            path: `${path}/${name}`,
            directory: directory
        }
        // @ts-ignore
        CapacitorUtils.Synapse.Filesystem.deleteFile(success, error, options)
    }

}

export const LegacyMigration = new LegacyCordovaBridge()