struct Constants {
    struct ConfigurationValue {
        static let endOfFile = ""
    }

    struct DirectoryTypeValue {
        static let cache = "CACHE"
        static let data = "DATA"
        static let documents = "DOCUMENTS"
        static let external = "EXTERNAL"
        static let externalCache = "EXTERNAL_CACHE"
        static let externalStorage = "EXTERNAL_STORAGE"
        static let library = "LIBRARY"
        static let libraryNoCloud = "LIBRARY_NO_CLOUD"
        static let temporary = "TEMPORARY"
    }

    struct ItemAttributeJSONKey {
        static let ctime = "ctime"
        static let mtime = "mtime"
        static let name = "name"
        static let size = "size"
        static let type = "type"
        static let uri = "uri"
    }

    struct ResultDataKey {
        static let data = "data"
        static let files = "files"
        static let uri = "uri"
    }

    struct StringEncodingValue {
        static let ascii = "ascii"
        static let utf16 = "utf16"
        static let utf8 = "utf8"
    }
}
