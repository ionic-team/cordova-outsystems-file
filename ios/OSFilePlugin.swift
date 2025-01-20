import OSFilesystemLib

typealias FileService = any OSFILEDirectoryManager & OSFILEFileManager

@objc(OSFilePlugin)
final class OSFilePlugin: CDVPlugin {
    private var fileService: FileService?

    override func pluginInitialize() {
        fileService = OSFILEManager()
    }

    func getService() -> Result<FileService, OSFileError> {
        fileService.map(Result.success) ?? .failure(.bridgeNotInitialised)
    }
}

// MARK: - Public API Methods
private extension OSFilePlugin {
    @objc(mkdir:)
    func mkdir(command: CDVInvokedUrlCommand) {
        guard let options: OSFileMkdirOptions = command.createModel()
        else {
            return commandDelegate.handleError(command, error: .inputArgumentsIssue(target: .mkdir))
        }

        performSinglePathOperation(command, options) {
            .mkdir(url: $0, recursive: options.recursive)
        }
    }
}

extension CDVCommandDelegate {
    func handleError(_ command: CDVInvokedUrlCommand, error: OSFileError) {
        let pluginResult = CDVPluginResult(status: .error, messageAs: error.toDictionary())
        send(pluginResult, callbackId: command.callbackId)
    }

    func handleSuccess(_ command: CDVInvokedUrlCommand, data: PluginResultData?) {
        let pluginResult = CDVPluginResult(status: .ok, messageAs: data)
        send(pluginResult, callbackId: command.callbackId)
    }
}

class OSSinglePathFileOptions: Decodable {
    let path: String
    let directory: OSFILESearchPath

    enum CodingKeys: CodingKey {
        case path
        case directory
    }

    init(path: String, directory: OSFILESearchPath) {
        self.path = path
        self.directory = directory
    }

    required init(from decoder: any Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)

        path = try container.decode(String.self, forKey: .path)
        let directoryText = try container.decode(String.self, forKey: .directory)
        directory = .create(from: directoryText, withDefaultSearchPath: .raw, andDefaultDirectoryType: .document)
    }
}

class OSDualPathFileOptions: Decodable {
    let from: OSSinglePathFileOptions
    let to: OSSinglePathFileOptions

    enum CodingKeys: CodingKey {
        case from
        case directory

        case to
        case toDirectory
    }

    required init(from decoder: any Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)

        let fromPath = try container.decode(String.self, forKey: .from)
        let fromDirectoryText = try container.decode(String.self, forKey: .directory)
        let fromDirectory = OSFILESearchPath.create(from: fromDirectoryText, withDefaultSearchPath: .raw, andDefaultDirectoryType: .document)
        from = .init(path: fromPath, directory: fromDirectory)

        let toPath = try container.decode(String.self, forKey: .to)
        let toDirectoryText = try container.decode(String.self, forKey: .toDirectory)
        let toDirectory = OSFILESearchPath.create(from: toDirectoryText, withDefaultSearchPath: fromDirectory)
        to = .init(path: toPath, directory: toDirectory)
    }
}

class OSFileMkdirOptions: OSSinglePathFileOptions {
    let recursive: Bool

    enum CodingKeys: String, CodingKey {
        case recursive
    }

    required init(from decoder: any Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)

        recursive = try container.decodeIfPresent(Bool.self, forKey: .recursive) ?? false

        try super.init(from: decoder)
    }
}

extension CDVInvokedUrlCommand {
    func createModel<T: Decodable>() -> T? {
        guard let argumentsDictionary = argument(at: 0) as? [String: Any],
              let argumentsData = try? JSONSerialization.data(withJSONObject: argumentsDictionary),
              let argumentsModel = try? JSONDecoder().decode(T.self, from: argumentsData)
        else { return nil }
        return argumentsModel
    }
}

// MARK: - Operation Execution
private extension OSFilePlugin {
    func performSinglePathOperation(_ command: CDVInvokedUrlCommand, _ options: OSSinglePathFileOptions, operationBuilder: (URL) -> FilesystemOperation) {
        executeOperation(command) { service in
            FilesystemLocationResolver(service: service)
                .resolveSinglePath(from: options)
                .map { operationBuilder($0) }
        }
    }

    func performDualPathOperation(_ command: CDVInvokedUrlCommand, _ options: OSDualPathFileOptions, operationBuilder: (URL, URL) -> FilesystemOperation) {
        executeOperation(command) { service in
            FilesystemLocationResolver(service: service)
                .resolveDualPaths(from: options)
                .map { operationBuilder($0.source, $0.destination) }
        }
    }

    func executeOperation(_ command: CDVInvokedUrlCommand, operationProvider: (FileService) -> Result<FilesystemOperation, OSFileError>) {
        switch getService() {
        case .success(let service):
            switch operationProvider(service) {
            case .success(let operation):
                let executor = FilesystemOperationExecutor(service: service, commandDelegate: commandDelegate)
                executor.execute(operation, command)
            case .failure(let error):
                commandDelegate.handleError(command, error: error)
            }
        case .failure(let error):
            commandDelegate.handleError(command, error: error)
        }
    }
}
