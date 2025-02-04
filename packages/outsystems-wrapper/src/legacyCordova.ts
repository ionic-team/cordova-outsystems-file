import { PluginError, Directory, WriteFileOptions, MkdirOptions, WriteFileResult, GetUriOptions, GetUriResult, ReaddirOptions, ReaddirResult, RmdirOptions, DeleteFileOptions, ReadFileInChunksOptions, ReadFileResult, StatResult} from "../../cordova-plugin/src/definitions";


class LegacyCordovaBridge {

    createDirectory(success: (uri: string) => void, error: (err: PluginError) => void, name: string, path: string, isInternal: boolean, isTemporary: boolean): void {
        let directory: Directory = this.getDirectoryTypeFrom(isInternal, isTemporary)
        let options: MkdirOptions = {
            path: path != '' ? `${path}/${name}` : name,
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
        let type = this.getMimeType(name)
        let synapseSuccess = (res: string | Blob) => {
            let blobUrl = this.dataToBlobUrl(res, type)
            success(blobUrl)
        }
        this.readFile(synapseSuccess, error, `${path}/${name}`, isInternal, isTemporary)
    }

    getFileUrlFromUri(success: (url: string) => void, error: (err: PluginError) => void, path: string): void {
        let type: string;

        let synapseSuccess = (res: string | Blob) => {
            let blobUrl = this.dataToBlobUrl(res, type)
            success(blobUrl)
        }
        let statSuccess = (res: StatResult) => {
            type = this.getMimeType(res.name)
            this.readFile(synapseSuccess, error, path, undefined, undefined)
        }
        
        // @ts-ignore
        CapacitorUtils.Synapse.Filesystem.stat(statSuccess, error, {path: path})
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

    private dataToBlobUrl(data: string | Blob, mimeType: string): string {
        let blob: Blob
        if (data instanceof Blob) {
            // If the input is already a Blob, simply create a Blob URL
            blob = data
        } else {
            // Decode the Base64 data to binary
            let binaryString = atob(data) // Decodes the Base64 string            
            let binaryArray = new Uint8Array(
                Array.from(binaryString, char => char.charCodeAt(0))
            );
        
            // Create a Blob object from the binary data
            blob = new Blob([binaryArray], { type: mimeType })
        }

        // Generate and return the Blob URL
        return URL.createObjectURL(blob)
    }

    private getMimeType(fromName: string) {
        const mimeTypes: {[id:string]:string} = {
            'txt': 'text/plain',
            'html': 'text/html',
            'htm': 'text/html',
            'css': 'text/css',
            'js': 'text/javascript',
            'json': 'application/json',
            'png': 'image/png',
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'gif': 'image/gif',
            'svg': 'image/svg+xml',
            'pdf': 'application/pdf',
            'doc': 'application/msword',
            'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'xls': 'application/vnd.ms-excel',
            'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'ppt': 'application/vnd.ms-powerpoint',
            'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'zip': 'application/zip',
            'mp3': 'audio/mpeg',
            'mp4': 'video/mp4',
            'mov': 'video/quicktime',
            'webm': 'video/webm',
            'ogg': 'audio/ogg'
        };
    
        // Extract the extension
        const extension = fromName.split('.').pop()!.toLowerCase();
    
        // Return the MIME type or a default
        return mimeTypes[extension] || 'application/octet-stream';  // Default for unknown files
    }
    
    
}

export const LegacyMigration = new LegacyCordovaBridge()