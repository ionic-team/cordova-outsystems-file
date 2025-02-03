import { PluginError, Directory, WriteFileOptions, MkdirOptions, WriteFileResult, GetUriOptions, GetUriResult, ReaddirOptions, ReaddirResult, RmdirOptions, DeleteFileOptions, ReadFileInChunksOptions, ReadFileResult} from "../../cordova-plugin/src/definitions";

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
            this.getFileUri(getUriSuccess, error, name, path, isInternal, isTemporary)
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
            let { directories, files } = res.files.reduce(
                (acc, fileInfo) => {
                    if (fileInfo.type === 'directory') {
                        acc.directories.push(fileInfo.name);
                    } else if (fileInfo.type === 'file') {
                        acc.files.push(fileInfo.name);
                    }
                    return acc;
                },
                { directories: [] as string[], files: [] as string[] }
            );

            success(directories, files);
        }

        // @ts-ignore
        CapacitorUtils.Synapse.Filesystem.readdir(synapseSuccess, error, options)
    }

    getFileData(success: (data: string | Blob) => void, error: (err: PluginError) => void, name: string, path: string, isInternal: boolean, isTemporary: boolean): void {
        this.readFile(success, error, `${path}/${name}`, isInternal, isTemporary)
    }

    getFileDataFromUri(success: (data: string | Blob) => void, error: (err: PluginError) => void, path: string): void {
        this.readFile(success, error, path, undefined, undefined)
    }

    getFileUrl(success: (url: string) => void, error: (err: PluginError) => void, name: string, path: string, isInternal: boolean, isTemporary: boolean): void {
        let synapseSuccess = (res: string | Blob) => {
            let blobUrl = this.dataToBlobUrl(res)
            success(blobUrl)
        }
        this.readFile(synapseSuccess, error, `${path}/${name}`, isInternal, isTemporary)
    }

    getFileUrlFromUri(success: (url: string) => void, error: (err: PluginError) => void, path: string): void {
        let synapseSuccess = (res: string | Blob) => {
            let blobUrl = this.dataToBlobUrl(res)
            success(blobUrl)
        }
        this.readFile(synapseSuccess, error, path, undefined, undefined)
    }
    
    getFileUri(success: (uri: string) => void, error: (err: PluginError) => void, name: string, path: string, isInternal: boolean, isTemporary: boolean): void {
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

    deleteFile(success: () => void, error: (err: PluginError) => void, path: string, name: string, isInternal: boolean, isTemporary: boolean): void {
        let directory = this.getDirectoryTypeFrom(isInternal, isTemporary)
        let options: DeleteFileOptions = {
          path: `${path}/${name}`,
          directory
        }

        // @ts-ignore
        CapacitorUtils.Synapse.Filesystem.deleteFile(success, error, options)
    }

    private getOptionalDirectoryTypeFrom(isInternal: boolean | undefined, isTemporary: boolean | undefined): Directory | undefined {
        // Handle the case where both parameters are undefined
        if (isInternal === undefined || isTemporary === undefined) {
            return undefined
        } else {
            return this.getDirectoryTypeFrom(!!isInternal, !!isTemporary)
        }
    }

    private getDirectoryTypeFrom(isInternal: boolean, isTemporary: boolean): Directory {
        // @ts-ignore
        if (cordova.platformId == 'android') {
            if (isInternal) {
                return isTemporary ? Directory.Cache : Directory.Data
            }
            return isTemporary ? Directory.ExternalCache : Directory.External
        }
        return isTemporary ? Directory.Temporary : Directory.LibraryNoCloud;
    }

    private readFile(success: (res: string | Blob) => void, error: (err: PluginError) => void, path: string, isInternal: boolean | undefined, isTemporary: boolean | undefined): void {
        let directory: Directory | undefined = this.getOptionalDirectoryTypeFrom(isInternal, isTemporary);
        let options: ReadFileInChunksOptions = {
            path: path,
            directory: directory,
            chunkSize: 256 * 1024
        }

        let chunks: string[] = []        
        let synapseSuccess = (res: ReadFileResult) => {
            if (res.data === "") {
                success(chunks.join(''))
            } else if (typeof res.data === 'string') {
                chunks.push(res.data)
            } else {
                chunks.push(res.data.toString())
            }
        }

        // @ts-ignore
        CapacitorUtils.Synapse.Filesystem.readFileInChunks(synapseSuccess, error, options)
    }

    private dataToBlobUrl(data: string | Blob): string {
        let blob: Blob
        if (data instanceof Blob) {
            // If the input is already a Blob, simply create a Blob URL
            blob = data
        } else {
            // Decode the Base64 data to binary
            let binaryString = atob(data) // Decodes the Base64 string
            let binaryLength = binaryString.length
            let binaryArray = new Uint8Array(binaryLength)
        
            for (let i = 0; i < binaryLength; i++) {
                binaryArray[i] = binaryString.charCodeAt(i)
            }
        
            // Create a Blob object from the binary data
            blob = new Blob([binaryArray], { type: "application/octet-stream" })
        }

        // Generate and return the Blob URL
        return URL.createObjectURL(blob)
    }
}

export const LegacyMigration = new LegacyCordovaBridge()