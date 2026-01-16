import Combine
import Foundation
import IONFilesystemLib

class OSFileOperationExecutor {
    let service: FileService
    let commandDelegate: CDVCommandDelegate
    private var cancellables = Set<AnyCancellable>()

    init(service: FileService, commandDelegate: CDVCommandDelegate) {
        self.service = service
        self.commandDelegate = commandDelegate
    }

    func execute(_ operation: OSFileOperation, _ command: CDVInvokedUrlCommand) {
        let status: PluginStatus

        do {
            var resultData: PluginResultData?

            switch operation {
            case .readFile(let url, let encoding, let offset, let length):
                let fullData = try service.readEntireFile(atURL: url, withEncoding: encoding, andOffset: offset, andLength: length).textValue
                resultData = [OSFileConstants.ResultDataKey.data: fullData]
            case .readFileInChunks(let url, let encoding, let chunkSize, let offset, let length):
                try processFileInChunks(at: url, withEncoding: encoding, chunkSize: chunkSize, offset: offset, length: length, for: operation, command)
                return
            case .write(let url, let encodingMapper, let recursive):
                try service.saveFile(atURL: url, withEncodingAndData: encodingMapper, includeIntermediateDirectories: recursive)
                resultData = [OSFileConstants.ResultDataKey.uri: url.absoluteString]
            case .append(let url, let encodingMapper, let recursive):
                try service.appendData(encodingMapper, atURL: url, includeIntermediateDirectories: recursive)
            case .delete(let url):
                try service.deleteFile(atURL: url)
            case .mkdir(let url, let recursive):
                try service.createDirectory(atURL: url, includeIntermediateDirectories: recursive)
            case .rmdir(let url, let recursive):
                try service.removeDirectory(atURL: url, includeIntermediateDirectories: recursive)
            case .readdir(let url):
                let directoryAttributes = try service.listDirectory(atURL: url)
                    .map { try fetchItemAttributesJSObject(using: service, atURL: $0) }
                resultData = [OSFileConstants.ResultDataKey.files: directoryAttributes]
            case .stat(let url):
                resultData = try fetchItemAttributesJSObject(using: service, atURL: url)
            case .getUri(let url):
                resultData = [OSFileConstants.ResultDataKey.uri: url.absoluteString]
            case .rename(let source, let destination):
                try service.renameItem(fromURL: source, toURL: destination)
            case .copy(let source, let destination):
                try service.copyItem(fromURL: source, toURL: destination)
                resultData = [OSFileConstants.ResultDataKey.uri: destination.absoluteString]
            }

            status = .success(data: resultData)
        } catch {
            status = .failure(mapError(error, for: operation))
        }

        commandDelegate.handle(command, status: status)
    }
}

private extension OSFileOperationExecutor {
    func processFileInChunks(at url: URL, withEncoding encoding: IONFILEEncoding, chunkSize: Int, offset: Int, length: Int, for operation: OSFileOperation, _ command: CDVInvokedUrlCommand) throws {
        let chunkSizeToUse = chunkSizeToUse(basedOn: chunkSize, and: encoding)
        try service.readFileInChunks(atURL: url, withEncoding: encoding, andChunkSize: chunkSizeToUse, andOffset: offset, andLength: length)
            .sink(receiveCompletion: { completion in
                switch completion {
                case .finished:
                    self.commandDelegate.handle(command, status: .success(data: [OSFileConstants.ResultDataKey.data: OSFileConstants.ConfigurationValue.endOfFile]))
                case .failure(let error):
                    self.commandDelegate.handle(command, status: .failure(self.mapError(error, for: operation)))
                }
            }, receiveValue: {
                self.commandDelegate.handle(command, status: .success(shouldKeepCallback: true, data: [OSFileConstants.ResultDataKey.data: $0.textValue]))
            })
            .store(in: &cancellables)
    }

    private func chunkSizeToUse(basedOn chunkSize: Int, and encoding: IONFILEEncoding) -> Int {
        // When dealing with byte buffers, we need chunk size that are multiply of 3
        // This is a requirement since we're treating byte buffers as base64 data.
        encoding == .byteBuffer ? chunkSize - chunkSize % 3 + 3 : chunkSize
    }

    func mapError(_ error: Error, for operation: OSFileOperation) -> OSFileError {
        var path = ""
        var method: OSFileMethod = OSFileMethod.getUri
        switch operation {
        case .readFile(let url, _, _, _): path = url.absoluteString; method = .readFile
        case .readFileInChunks(let url, _, _, _, _): path = url.absoluteString; method = .readFileInChunks
        case .write(let url, _, _): path = url.absoluteString; method = .writeFile
        case .append(let url, _, _): path = url.absoluteString; method = .appendFile
        case .delete(let url): path = url.absoluteString; method = .deleteFile
        case .mkdir(let url, _): path = url.absoluteString; method = .mkdir
        case .rmdir(let url, _): path = url.absoluteString; method = .rmdir
        case .readdir(let url): path = url.absoluteString; method = .readdir
        case .stat(let url): path = url.absoluteString; method = .stat
        case .getUri(let url): return OSFileError.invalidPath(url.absoluteString)
        case .rename(let sourceUrl, _): path = sourceUrl.absoluteString; method = .rename
        case .copy(let sourceUrl, _): path = sourceUrl.absoluteString; method = .copy
        }
        
        return mapError(error, withPath: path, andMethod: method)
    }
    
    private func mapError(_ error: Error, withPath path: String, andMethod method: OSFileMethod) -> OSFileError {
        return switch error {
        case IONFILEDirectoryManagerError.notEmpty: .cannotDeleteChildren
        case IONFILEDirectoryManagerError.alreadyExists: .directoryAlreadyExists(path)
        case IONFILEFileManagerError.missingParentFolder: .parentDirectoryMissing
        case IONFILEFileManagerError.fileNotFound: .fileNotFound(method: method, path)
        default: .operationFailed(method: method, error)
        }
    }

    func fetchItemAttributesJSObject(using service: FileService, atURL url: URL) throws -> IONFILEItemAttributeModel.JSResult {
        let attributes = try service.getItemAttributes(atURL: url)
        return attributes.toJSResult(with: url)
    }
}
