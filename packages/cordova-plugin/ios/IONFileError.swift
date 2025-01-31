enum IONFileMethod: String {
    case readEntireFile
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

enum IONFileError: Error {
    case bridgeNotInitialised
    case invalidInput(method: IONFileMethod)
    case invalidPath(_ path: String)
    case operationFailed(method: IONFileMethod, _ error: Error?)

    func toDictionary() -> [String: String] {
            [
                Constants.ErrorKey.code: "OS-PLUG-FILE-\(String(format: "%04d", code))",
                Constants.ErrorKey.message: description
            ]
        }
}

private extension IONFileError {
    var code: Int {
        switch self {
        case .bridgeNotInitialised: 0
        case .invalidInput: 0
        case .invalidPath: 0
        case .operationFailed: 0
        }
    }

    var description: String {
        switch self {
        case .bridgeNotInitialised: "Capacitor bridge isn't initialized."
        case .invalidInput(let method): "The '\(method.rawValue)' input parameters aren't valid."
        case .invalidPath(let path): "Invalid \(!path.isEmpty ? "'" + path + "' " : "")path."
        case .operationFailed(let method, let error): "'\(method.rawValue) failed: \(error?.localizedDescription ?? "couldn't create byte buffer")."
        }
    }
}
