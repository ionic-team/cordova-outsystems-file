import IONFilesystemLib

extension IONFILEStringEncoding {
    static func create(from text: String?) -> Self? {
        switch text {
        case Constants.StringEncodingValue.ascii: .ascii
        case Constants.StringEncodingValue.utf16: .utf16
        case Constants.StringEncodingValue.utf8: .utf8
        default: nil
        }
    }
}

extension IONFILEDirectoryType {
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

extension IONFILESearchPath {
    static func create(from text: String?, withDefaultSearchPath defaultSearchPath: Self) -> Self {
        if let type = IONFILEDirectoryType.create(from: text) {
            .directory(type: type)
        } else {
            defaultSearchPath
        }
    }
}

extension IONFILEEncoding {
    static func create(from text: String?) -> Self {
        if let stringEncoding = IONFILEStringEncoding.create(from: text) {
            .string(encoding: stringEncoding)
        } else {
            .byteBuffer
        }
    }
}

extension IONFILEEncodingValueMapper {
    static func create(from encodingText: String?, usingValue dataText: String) -> Self? {
        switch IONFILEEncoding.create(from: encodingText) {
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

    var textValue: String {
        switch self {
        case .byteBuffer(let data): data.base64EncodedString()
        case .string(_, let text): text
        @unknown default: ""
        }
    }
}

extension IONFILEItemAttributeModel {
    typealias JSResult = [String: Any]
    func toJSResult(with url: URL) -> JSResult {
        [
            Constants.ItemAttributeJSONKey.name: url.lastPathComponent,
            Constants.ItemAttributeJSONKey.type: type.description,
            Constants.ItemAttributeJSONKey.size: size,
            Constants.ItemAttributeJSONKey.ctime: UInt64(creationDateTimestamp.rounded()),
            Constants.ItemAttributeJSONKey.mtime: UInt64(modificationDateTimestamp.rounded()),
            Constants.ItemAttributeJSONKey.uri: url.absoluteString
        ]
    }
}

extension IONFILEItemType {
    var description: String {
        switch self {
        case .directory: Constants.FileItemTypeValue.directory
        case .file: Constants.FileItemTypeValue.file
        @unknown default: Constants.FileItemTypeValue.fallback
        }
    }
}
