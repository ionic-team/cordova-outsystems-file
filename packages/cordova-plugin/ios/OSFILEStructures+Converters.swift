import OSFilesystemLib

extension OSFILEStringEncoding {
    static func create(from text: String?) -> Self? {
        switch text {
        case Constants.StringEncodingValue.ascii: .ascii
        case Constants.StringEncodingValue.utf16: .utf16
        case Constants.StringEncodingValue.utf8: .utf8
        default: nil
        }
    }
}

extension OSFILEDirectoryType {
    static func create(from text: String?) -> Self? {
        switch text {
        case Constants.DirectoryTypeValue.cache: .cache
        case Constants.DirectoryTypeValue.data, Constants.DirectoryTypeValue.documents, Constants.DirectoryTypeValue.external, Constants.DirectoryTypeValue.externalCache, Constants.DirectoryTypeValue.externalStorage: .document
        case Constants.DirectoryTypeValue.library: .library
        case Constants.DirectoryTypeValue.libraryNoCloud: .notSyncedLibrary
        case Constants.DirectoryTypeValue.temporary: .temporary
        default: nil
        }
    }
}

extension OSFILESearchPath {
    static func create(from text: String?, withDefaultSearchPath defaultSearchPath: OSFILESearchPath) -> Self {
        if let type = OSFILEDirectoryType.create(from: text) {
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
