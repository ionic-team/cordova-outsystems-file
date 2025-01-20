import OSFilesystemLib

extension OSFILEStringEncoding {
    static func create(from text: String) -> Self {
        switch text {
        case "ascii": .ascii
        case "utf16": .utf16
        default: .utf8
        }
    }
}

extension OSFILEDirectoryType {
    static func create(from text: String) -> Self? {
        switch text {
        case "CACHE": .cache
        case "DATA", "DOCUMENTS", "EXTERNAL", "EXTERNAL_STORAGE": .document
        case "LIBRARY": .library
        default: nil
        }
    }
}

extension OSFILESearchPath {
    static func create(from text: String, withDefaultSearchPath defaultSearchPath: OSFILESearchPath, andDefaultDirectoryType defaultDirectoryType: OSFILEDirectoryType? = nil) -> Self {
        if let type = OSFILEDirectoryType.create(from: text) ?? defaultDirectoryType {
            .directory(type: type)
        } else {
            defaultSearchPath
        }
    }
}

extension OSFILEItemAttributeModel {
    typealias JSResult = [String: Any]
    func toDirectoryJSResult(with url: URL) -> JSResult {
        toStatsJSResult(with: url).merging([Constants.ItemAttributeJSONKey.name: url.lastPathComponent]) { current, _ in current }
    }

    func toStatsJSResult(with url: URL) -> JSResult {
        [
            Constants.ItemAttributeJSONKey.type: type.description,
            Constants.ItemAttributeJSONKey.size: size,
            Constants.ItemAttributeJSONKey.ctime: UInt64(creationDateTimestamp.rounded()),
            Constants.ItemAttributeJSONKey.mtime: UInt64(modificationDateTimestamp.rounded()),
            Constants.ItemAttributeJSONKey.url: url.absoluteString
        ]
    }
}

extension OSFILEItemType {
    var description: String {
        switch self {
        case .directory: "directory"
        case .file: "file"
        @unknown default: ""
        }
    }
}
