enum OSFileMethod: String {
    case readFile
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
    case operationFailed(method: OSFileMethod, _ error: Error?)

    func toDictionary() -> [String: String] {
            [
                "code": "OS-PLUG-FILE-\(String(format: "%04d", code))",
                "message": description
            ]
        }
}

private extension OSFileError {
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
