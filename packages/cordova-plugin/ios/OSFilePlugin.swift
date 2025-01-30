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
    @objc(readFile:)
    func readFile(command: CDVInvokedUrlCommand) {
        guard let options: OSReadFileOptions = command.createModel() else {
            return commandDelegate.handle(command, status: .failure(.invalidInput(method: .readEntireFile)))
        }

        performSinglePathOperation(command, options) {
            .readEntireFile(url: $0, encoding: options.encoding)
        }
    }

    @objc(readFileInChunks:)
    func readFileInChunks(command: CDVInvokedUrlCommand) {
        guard let options: OSReadFileInChunksOptions = command.createModel() else {
            return commandDelegate.handle(command, status: .failure(.invalidInput(method: .readFileInChunks)))
        }

        performSinglePathOperation(command, options) {
            .readFileInChunks(url: $0, encoding: options.encoding, chunkSize: options.chunkSize)
        }
    }

    @objc(writeFile:)
    func writeFile(command: CDVInvokedUrlCommand) {
        guard let options: OSSinglePathRecursiveEncodingMapperFileOptions = command.createModel() else {
            return commandDelegate.handle(command, status: .failure(.invalidInput(method: .writeFile)))
        }

        guard let encodingMapper = options.encodingMapper else {
            return commandDelegate.handle(command, status: .failure(.operationFailed(method: .writeFile, nil)))
        }

        performSinglePathOperation(command, options) {
            .write(url: $0, encodingMapper: encodingMapper, recursive: options.recursive)
        }
    }

    @objc(appendFile:)
    func appendFile(command: CDVInvokedUrlCommand) {
        guard let options: OSSinglePathRecursiveEncodingMapperFileOptions = command.createModel() else {
            return commandDelegate.handle(command, status: .failure(.invalidInput(method: .appendFile)))
        }

        guard let encodingMapper = options.encodingMapper else {
            return commandDelegate.handle(command, status: .failure(.operationFailed(method: .appendFile, nil)))
        }

        performSinglePathOperation(command, options) {
            .append(url: $0, encodingMapper: encodingMapper, recursive: options.recursive)
        }
    }

    @objc(deleteFile:)
    func deleteFile(command: CDVInvokedUrlCommand) {
        guard let options: OSSinglePathFileOptions = command.createModel() else {
            return commandDelegate.handle(command, status: .failure(.invalidInput(method: .deleteFile)))
        }

        performSinglePathOperation(command, options) {
            .delete(url: $0)
        }
    }

    @objc(mkdir:)
    func mkdir(command: CDVInvokedUrlCommand) {
        guard let options: OSSinglePathRecursiveFileOptions = command.createModel()
        else {
            return commandDelegate.handle(command, status: .failure(.invalidInput(method: .mkdir)))
        }

        performSinglePathOperation(command, options) {
            .mkdir(url: $0, recursive: options.recursive)
        }
    }

    @objc(rmdir:)
    func rmdir(command: CDVInvokedUrlCommand) {
        guard let options: OSSinglePathRecursiveFileOptions = command.createModel()
        else {
            return commandDelegate.handle(command, status: .failure(.invalidInput(method: .rmdir)))
        }

        performSinglePathOperation(command, options) {
            .rmdir(url: $0, recursive: options.recursive)
        }
    }

    @objc(readdir:)
    func readdir(command: CDVInvokedUrlCommand) {
        guard let options: OSSinglePathFileOptions = command.createModel() else {
            return commandDelegate.handle(command, status: .failure(.invalidInput(method: .readdir)))
        }

        performSinglePathOperation(command, options) {
            .readdir(url: $0)
        }
    }

    @objc(stat:)
    func stat(command: CDVInvokedUrlCommand) {
        guard let options: OSSinglePathFileOptions = command.createModel() else {
            return commandDelegate.handle(command, status: .failure(.invalidInput(method: .stat)))
        }

        performSinglePathOperation(command, options) {
            .stat(url: $0)
        }
    }

    @objc(getUri:)
    func getUri(command: CDVInvokedUrlCommand) {
        guard let options: OSSinglePathFileOptions = command.createModel() else {
            return commandDelegate.handle(command, status: .failure(.invalidInput(method: .getUri)))
        }

        performSinglePathOperation(command, options) {
            .getUri(url: $0)
        }
    }

    @objc(rename:)
    func rename(command: CDVInvokedUrlCommand) {
        guard let options: OSDualPathFileOptions = command.createModel() else {
            return commandDelegate.handle(command, status: .failure(.invalidInput(method: .rename)))
        }

        performDualPathOperation(command, options) {
            .rename(source: $0, destination: $1)
        }
    }

    @objc(copy:)
    func copy(command: CDVInvokedUrlCommand) {
        guard let options: OSDualPathFileOptions = command.createModel() else {
            return commandDelegate.handle(command, status: .failure(.invalidInput(method: .copy)))
        }

        performDualPathOperation(command, options) {
            .copy(source: $0, destination: $1)
        }
    }
}

// MARK: - Operation Execution
private extension OSFilePlugin {
    func performSinglePathOperation(_ command: CDVInvokedUrlCommand, _ options: OSSinglePathFileOptions, operationBuilder: @escaping (URL) -> OSFileOperation) {
        commandDelegate.run { [weak self] in
            self?.executeOperation(command) { service in
                OSFileLocationResolver(service: service)
                    .resolveSinglePath(from: options)
                    .map { operationBuilder($0) }
            }
        }

    }

    func performDualPathOperation(_ command: CDVInvokedUrlCommand, _ options: OSDualPathFileOptions, operationBuilder: @escaping (URL, URL) -> OSFileOperation) {
        commandDelegate.run { [weak self] in
            self?.executeOperation(command) { service in
                OSFileLocationResolver(service: service)
                    .resolveDualPaths(from: options)
                    .map { operationBuilder($0.source, $0.destination) }
            }
        }
    }

    func executeOperation(_ command: CDVInvokedUrlCommand, operationProvider: (FileService) -> Result<OSFileOperation, OSFileError>) {
        switch getService() {
        case .success(let service):
            switch operationProvider(service) {
            case .success(let operation):
                let executor = OSFileOperationExecutor(service: service, commandDelegate: commandDelegate)
                executor.execute(operation, command)
            case .failure(let error):
                commandDelegate.handle(command, status: .failure(error))
            }
        case .failure(let error):
            commandDelegate.handle(command, status: .failure(error))
        }
    }
}
