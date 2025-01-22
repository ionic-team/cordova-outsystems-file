import { PluginError, Directory, WriteFileOptions, MkdirOptions, WriteFileResult, ReadFileResult, ReadFileOptions, DeleteFileOptions } from "../../src/definitions";

class LegacyCordovaBridge {
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

    createDirectory(success: () => void, error: (err: PluginError) => void, name: string, path: string, isInternal: boolean, isTemporary: boolean): string {
        let directory: Directory = this.getDirectoryTypeFrom(isInternal, isTemporary);

        let options: MkdirOptions = {
            path: `${path}/${name}`,
            directory: directory,
            recursive: true
        }

        // @ts-ignore
        CapacitorUtils.Synapse.Filesystem.mkdir(success, error, options)
        return `${directory}/${path}/${name}`
    }

    writeFile(success: (res: WriteFileResult) => void, error: (err: PluginError) => void, data: string | Blob, path: string, name: string, isInternal: boolean, isTemporary: boolean,): void {

        let directory: Directory = this.getDirectoryTypeFrom(isInternal, isTemporary);
        let options: WriteFileOptions = {
            path: `${path}/${name}`,
            data: data,
            directory: directory
        }
        // @ts-ignore
        CapacitorUtils.Synapse.Filesystem.writeFile(success, error, options)
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