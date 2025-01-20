enum OSFileMethod: String {
    case mkdir
}


enum OSFileError: Error {
    case inputArgumentsIssue(target: OSFileMethod)

    case bridgeNotInitialised
    case invalidPathParameter
    case invalidPath(_ path: String)
    case readFileFailed(_ error: Error)
    case createDirectoryFailed(_ error: Error)
    case removeDirectoryFailed(_ error: Error)
    case invalidDataParameter
    case saveFileFailed(_ error: Error?)
    case appendFileFailed(_ error: Error?)
    case deleteFileFailed(_ error: Error)
    case readDirectoryFailed(_ error: Error)
    case readFileAttributesFailed(_ error: Error)
    case bothPathsRequired
    case renameFileFailed(_ error: Error)
    case copyFileFailed(_ error: Error)

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
        case .inputArgumentsIssue(let target):
            switch target {
            case .mkdir: 0

            }

        case .bridgeNotInitialised: 0
        case .invalidPathParameter: 0
        case .invalidPath: 0
        case .readFileFailed: 0
        case .createDirectoryFailed: 0
        case .removeDirectoryFailed: 0
        case .invalidDataParameter: 0
        case .saveFileFailed: 0
        case .appendFileFailed: 0
        case .deleteFileFailed: 0
        case .readDirectoryFailed: 0
        case .readFileAttributesFailed: 0
        case .bothPathsRequired: 0
        case .renameFileFailed: 0
        case .copyFileFailed: 0
        }
    }

    var description: String {
        switch self {
        case .inputArgumentsIssue(let target): "The '\(target.rawValue)' input parameters aren't valid."

        case .bridgeNotInitialised: "Capacitor bridge isn't initialized."
        case .invalidPathParameter: "'path' must be provided and must be a string."
        case .invalidPath(let path): "Invalid \(!path.isEmpty ? "'" + path + "' " : "")path"
        case .readFileFailed(let error): "Couldn't read file: \(error.localizedDescription)."
        case .createDirectoryFailed(let error): "Couldn't create directory: \(error.localizedDescription)."
        case .removeDirectoryFailed(let error): "Couldn't remove directory: \(error.localizedDescription)."
        case .invalidDataParameter: "'data' must be provided and must be a string."
        case .saveFileFailed(let error): "Couldn't save file: \(error?.localizedDescription ?? "couldn't create byte buffer")."
        case .appendFileFailed(let error): "Couldn't append data to file: \(error?.localizedDescription ?? "couldn't create byte buffer")."
        case .deleteFileFailed(let error): "Couldn't delete file: \(error.localizedDescription)."
        case .readDirectoryFailed(let error): "Couldn't read directory: \(error.localizedDescription)."
        case .readFileAttributesFailed(let error): "Couldn't read the file's attributes: \(error.localizedDescription)."
        case .bothPathsRequired: "Both 'to' and 'from' must be provided."
        case .renameFileFailed(let error): "Couldn't rename file: \(error.localizedDescription)."
        case .copyFileFailed(let error): "Couldn't copy file: \(error.localizedDescription)."
        }
    }
}
