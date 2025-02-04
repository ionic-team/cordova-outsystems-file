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
            case .readEntireFile(let url, let encoding):
                let fullData = try service.readEntireFile(atURL: url, withEncoding: encoding).textValue
                resultData = [Constants.ResultDataKey.data: fullData]
            case .readFileInChunks(let url, let encoding, let chunkSize):
                try processFileInChunks(at: url, withEncoding: encoding, chunkSize: chunkSize, for: operation, command)
                return
            case .write(let url, let encodingMapper, let recursive):
                try service.saveFile(atURL: url, withEncodingAndData: encodingMapper, includeIntermediateDirectories: recursive)
                resultData = [Constants.ResultDataKey.uri: url.absoluteString]
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
                resultData = [Constants.ResultDataKey.files: directoryAttributes]
            case .stat(let url):
                resultData = try fetchItemAttributesJSObject(using: service, atURL: url)
            case .getUri(let url):
                resultData = [Constants.ResultDataKey.uri: url.absoluteString]
            case .rename(let source, let destination):
                try service.renameItem(fromURL: source, toURL: destination)
            case .copy(let source, let destination):
                try service.copyItem(fromURL: source, toURL: destination)
                resultData = [Constants.ResultDataKey.uri: destination.absoluteString]
            }

            status = .success(data: resultData)
        } catch {
            status = .failure(mapError(error, for: operation))
        }

        commandDelegate.handle(command, status: status)
    }
}

private extension OSFileOperationExecutor {
    func processFileInChunks(at url: URL, withEncoding encoding: IONFILEEncoding, chunkSize: Int, for operation: OSFileOperation, _ command: CDVInvokedUrlCommand) throws {
        let chunkSizeToUse = chunkSizeToUse(basedOn: chunkSize, and: encoding)
        try service.readFileInChunks(atURL: url, withEncoding: encoding, andChunkSize: chunkSizeToUse)
            .sink(receiveCompletion: { completion in
                switch completion {
                case .finished:
                    self.commandDelegate.handle(command, status: .success(data: [Constants.ResultDataKey.data: Constants.ConfigurationValue.endOfFile]))
                case .failure(let error):
                    self.commandDelegate.handle(command, status: .failure(self.mapError(error, for: operation)))
                }
            }, receiveValue: {
                self.commandDelegate.handle(command, status: .success(shouldKeepCallback: true, data: [Constants.ResultDataKey.data: $0.textValue]))
            })
            .store(in: &cancellables)
    }

    private func chunkSizeToUse(basedOn chunkSize: Int, and encoding: IONFILEEncoding) -> Int {
        // When dealing with byte buffers, we need chunk size that are multiply of 3
        // This is a requirement since we're treating byte buffers as base64 data.
        encoding == .byteBuffer ? chunkSize - chunkSize % 3 + 3 : chunkSize
    }

    func mapError(_ error: Error, for operation: OSFileOperation) -> OSFileError {
        return switch operation {
        case .readEntireFile: .operationFailed(method: .readEntireFile, error)
        case .readFileInChunks: .operationFailed(method: .readFileInChunks, error)
        case .write: .operationFailed(method: .writeFile, error)
        case .append: .operationFailed(method: .appendFile, error)
        case .delete: .operationFailed(method: .deleteFile, error)
        case .mkdir: .operationFailed(method: .mkdir, error)
        case .rmdir: .operationFailed(method: .rmdir, error)
        case .readdir: .operationFailed(method: .readdir, error)
        case .stat: .operationFailed(method: .stat, error)
        case .getUri: .invalidPath("")
        case .rename: .operationFailed(method: .rename, error)
        case .copy: .operationFailed(method: .copy, error)
        }
    }

    func fetchItemAttributesJSObject(using service: FileService, atURL url: URL) throws -> IONFILEItemAttributeModel.JSResult {
        let attributes = try service.getItemAttributes(atURL: url)
        return attributes.toJSResult(with: url)
    }
}
