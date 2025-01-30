import Combine
import Foundation
import IONFilesystemLib

class IONFileOperationExecutor {
    let service: FileService
    let commandDelegate: CDVCommandDelegate
    private var cancellables = Set<AnyCancellable>()

    init(service: FileService, commandDelegate: CDVCommandDelegate) {
        self.service = service
        self.commandDelegate = commandDelegate
    }

    func execute(_ operation: IONFileOperation, _ command: CDVInvokedUrlCommand) {
        let status: PluginStatus

        do {
            var resultData: PluginResultData?

            switch operation {
            case .readEntireFile(let url, let encoding):
                let fullData = try service.readEntireFile(atURL: url, withEncoding: encoding)
                resultData = [Constants.ResultDataKey.data: fullData]
            case .readFileInChunks(let url, let encoding, let chunkSize):
                try processFileInChunks(at: url, withEncoding: encoding, chunkSize: chunkSize, for: operation, command)
                return
            case .write(let url, let encodingMapper, let recursive):
                let resultURL = try service.saveFile(atURL: url, withEncodingAndData: encodingMapper, includeIntermediateDirectories: recursive)
                resultData = [Constants.ResultDataKey.uri: resultURL.absoluteString]
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
                    .map { try fetchItemAttributesJSObject(using: service, atURL: $0, isDirectory: true) }
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

private extension IONFileOperationExecutor {
    func processFileInChunks(at url: URL, withEncoding encoding: IONFILEEncoding, chunkSize: Int, for operation: IONFileOperation, _ command: CDVInvokedUrlCommand) throws {
        try service.readFileInChunks(atURL: url, withEncoding: encoding, andChunkSize: chunkSize)
            .sink(receiveCompletion: { completion in
                switch completion {
                case .finished:
                    self.commandDelegate.handle(command, status: .success(data: [Constants.ResultDataKey.data: Constants.ConfigurationValue.endOfFile]))
                case .failure(let error):
                    self.commandDelegate.handle(command, status: .failure(self.mapError(error, for: operation)))
                }
            }, receiveValue: { value in
                self.commandDelegate.handle(command, status: .success(shouldKeepCallback: true, data: [Constants.ResultDataKey.data: value]))
            })
            .store(in: &cancellables)
    }

    func mapError(_ error: Error, for operation: IONFileOperation) -> IONFileError {
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

    func fetchItemAttributesJSObject(using service: FileService, atURL url: URL, isDirectory: Bool = false) throws -> IONFILEItemAttributeModel.JSResult {
        let attributes = try service.getItemAttributes(atPath: url.urlPath)
        let conversionMethod = isDirectory ? attributes.toDirectoryJSResult : attributes.toStatsJSResult
        return conversionMethod(url)
    }
}
