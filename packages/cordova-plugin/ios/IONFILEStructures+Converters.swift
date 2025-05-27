import IONFilesystemLib

extension IONFILEStringEncoding {
    static func create(from text: String?) -> Self? {
        switch text {
        case OSFileConstants.StringEncodingValue.ascii: .ascii
        case OSFileConstants.StringEncodingValue.utf16: .utf16
        case OSFileConstants.StringEncodingValue.utf8: .utf8
        default: nil
        }
    }
}

extension IONFILEDirectoryType {
    static func create(from text: String?) -> Self? {
        switch text {
        case OSFileConstants.DirectoryTypeValue.cache: .cache
        case OSFileConstants.DirectoryTypeValue.data, OSFileConstants.DirectoryTypeValue.documents, OSFileConstants.DirectoryTypeValue.external, OSFileConstants.DirectoryTypeValue.externalCache, OSFileConstants.DirectoryTypeValue.externalStorage: .document
        case OSFileConstants.DirectoryTypeValue.library: .library
        case OSFileConstants.DirectoryTypeValue.libraryNoCloud: .notSyncedLibrary
        case OSFileConstants.DirectoryTypeValue.temporary: .temporary
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
            OSFileConstants.ItemAttributeJSONKey.name: url.lastPathComponent,
            OSFileConstants.ItemAttributeJSONKey.type: type.description,
            OSFileConstants.ItemAttributeJSONKey.size: size,
            OSFileConstants.ItemAttributeJSONKey.ctime: UInt64(creationDateTimestamp.rounded()),
            OSFileConstants.ItemAttributeJSONKey.mtime: UInt64(modificationDateTimestamp.rounded()),
            OSFileConstants.ItemAttributeJSONKey.uri: url.absoluteString
        ]
    }
}

extension IONFILEItemType {
    var description: String {
        switch self {
        case .directory: OSFileConstants.FileItemTypeValue.directory
        case .file: OSFileConstants.FileItemTypeValue.file
        @unknown default: OSFileConstants.FileItemTypeValue.fallback
        }
    }
}
