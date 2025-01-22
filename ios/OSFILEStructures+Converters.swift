import OSFilesystemLib

extension OSFILEStringEncoding {
    static func create(from text: String?) -> Self? {
        switch text {
        case "ascii": .ascii
        case "utf16": .utf16
        case "utf8": .utf8
        default: nil
        }
    }
}

extension OSFILEDirectoryType {
    static func create(from text: String?) -> Self? {
        switch text {
        case "CACHE": .cache
        case "DATA", "DOCUMENTS", "EXTERNAL", "EXTERNAL_CACHE", "EXTERNAL_STORAGE": .document
        case "LIBRARY": .library
        case "LIBRARY_NO_CLOUD": .notSyncedLibrary
        case "TEMPORARY_IOS": .temporary
        default: nil
        }
    }
}

extension OSFILESearchPath {
    static func create(from text: String?, withDefaultSearchPath defaultSearchPath: OSFILESearchPath, andDefaultDirectoryType defaultDirectoryType: OSFILEDirectoryType? = nil) -> Self {
        if let type = OSFILEDirectoryType.create(from: text) ?? defaultDirectoryType {
            .directory(type: type)
        } else {
            defaultSearchPath
        }
    }
}

extension OSFILEEncoding {
    static func create(from text: String?) -> Self {
        if let stringEncoding = OSFILEStringEncoding.create(from: text) {
            .string(encoding: stringEncoding)
        } else {
            .byteBuffer
        }
    }
}

extension OSFILEEncodingValueMapper {
    static func create(from encodingText: String?, usingValue dataText: String) -> Self? {
        switch OSFILEEncoding.create(from: encodingText) {
        case .byteBuffer:
            if let base64Data = Data(base64Encoded: dataText) {
                .byteBuffer(value: base64Data)
            } else {
                nil
            }
        case .string(encoding: let stringEncoding):
            .string(encoding: stringEncoding, value: dataText)
        @unknown default:
            nil
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
            Constants.ItemAttributeJSONKey.uri: url.absoluteString
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
