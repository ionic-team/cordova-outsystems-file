import Foundation
import OSFilesystemLib

struct OSFileOperationExecutor {
    let service: FileService
    let commandDelegate: CDVCommandDelegate

    func execute(_ operation: OSFileOperation, _ command: CDVInvokedUrlCommand) {
        let status: PluginStatus

        do {
            var resultData: PluginResultData?

            switch operation {
            case .read(let url, let encoding):
                let data = try service.readFile(atURL: url, withEncoding: encoding)
                resultData = [Constants.ResultDataKey.data: data]
            case .write(let url, let encodingMapper, let recursive):
                let path = try service.saveFile(atURL: url, withEncodingAndData: encodingMapper, includeIntermediateDirectories: recursive)
                resultData = [Constants.ResultDataKey.uri: path]
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

            status = .success(resultData)
        } catch {
            status = .failure(mapError(error, for: operation))
        }

        commandDelegate.handle(command, status: status)
    }

    private func mapError(_ error: Error, for operation: OSFileOperation) -> OSFileError {
        return switch operation {
        case .read: .operationFailed(method: .readFile, error)
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

    private func fetchItemAttributesJSObject(using service: FileService, atURL url: URL, isDirectory: Bool = false) throws -> OSFILEItemAttributeModel.JSResult {
        let attributes = try service.getItemAttributes(atPath: url.urlPath)
        let conversionMethod = isDirectory ? attributes.toDirectoryJSResult : attributes.toStatsJSResult
        return conversionMethod(url)
    }
}
