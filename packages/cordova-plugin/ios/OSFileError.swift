enum OSFileMethod: String {
    case readFile
    case readFileInChunks
    case writeFile
    case appendFile
    case deleteFile
    case mkdir
    case rmdir
    case readdir
    case stat
    case getUri
    case rename
    case copy
}

enum OSFileError: Error {
    case bridgeNotInitialised
    case invalidInput(method: OSFileMethod)
    case invalidPath(_ path: String)
    case fileNotFound(method: OSFileMethod, _ path: String)
    case directoryAlreadyExists(_ path: String)
    case parentDirectoryMissing
    case cannotDeleteChildren
    case operationFailed(method: OSFileMethod, _ error: Error)

    func toDictionary() -> [String: String] {
            [
                Constants.ErrorKey.code: "OS-PLUG-FILE-\(String(format: "%04d", code))",
                Constants.ErrorKey.message: description
            ]
        }
}

private extension OSFileError {
    var code: Int {
        switch self {
        case .bridgeNotInitialised: 4
        case .invalidInput: 5
        case .invalidPath: 6
        case .fileNotFound: 8
        case .directoryAlreadyExists: 10
        case .parentDirectoryMissing: 11
        case .cannotDeleteChildren: 12
        case .operationFailed: 13
        }
    }

    var description: String {
        switch self {
        case .bridgeNotInitialised: "Capacitor bridge isn't initialized."
        case .invalidInput(let method): "The '\(method.rawValue)' input parameters aren't valid."
        case .invalidPath(let path): "Invalid \(!path.isEmpty ? "'" + path + "' " : "")path."
        case .fileNotFound(let method, let path): "'\(method.rawValue)' failed because file\(!path.isEmpty ? " at '" + path + "' " : "") does not exist."
        case .directoryAlreadyExists(let path): "Directory\(!path.isEmpty ? " at '" + path + "' " : "") already exists, cannot be overwritten."
        case .parentDirectoryMissing: "Missing parent directory - possibly recursive=false was passed or parent directory creation failed."
        case .cannotDeleteChildren: "Cannot delete directory with children; received recursive=false but directory has contents."
        case .operationFailed(let method, let error): "'\(method.rawValue)' failed with: \(error.localizedDescription)"
        }
    }
}
