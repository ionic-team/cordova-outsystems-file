import { PluginError, Directory, WriteFileOptions, MkdirOptions, WriteFileResult, GetUriOptions, GetUriResult, ReaddirOptions, ReaddirResult, RmdirOptions} from "../../src/definitions";

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

    deleteDirectory(success: () => void, error: (err: PluginError) => void, path: string, isInternal: boolean, isTemporary: boolean): void {
        let directory: Directory = this.getDirectoryTypeFrom(isInternal, isTemporary)
        let options: RmdirOptions = {
            path: path,
            directory: directory,
            recursive: true
        }

        // @ts-ignore
        CapacitorUtils.Synapse.Filesystem.rmdir(success, error, options)
    }

    listDirectory(success: (directoryList: string[], fileList: string[]) => void, error: (error: PluginError) => void, path: string, isInternal: boolean, isTemporary: boolean): void {
        let directory: Directory = this.getDirectoryTypeFrom(isInternal, isTemporary)
        let options: ReaddirOptions = {
            path: path,
            directory: directory
        }

        let synapseSuccess = (res: ReaddirResult) => {
            success(
                res.files.filter(fileInfo => fileInfo.type == 'directory').map(fileInfo => fileInfo.name), 
                res.files.filter(fileInfo => fileInfo.type == 'file').map(fileInfo => fileInfo.name)
            )
        }

        // @ts-ignore
        CapacitorUtils.Synapse.Filesystem.readdir(synapseSuccess, error, options)
    }

    writeFile(success: (fs: WriteFileResult) => void, error: (err: PluginError) => void, isInternal: boolean, isTemporary: boolean, data: string | Blob, path: string): void {
        let directory: Directory = this.getDirectoryTypeFrom(isInternal, isTemporary)
        let options: WriteFileOptions = {
            path: path,
            data: data,
            directory: directory
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
}

export const LegacyMigration = new LegacyCordovaBridge()