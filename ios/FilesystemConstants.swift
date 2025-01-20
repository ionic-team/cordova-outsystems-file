struct Constants {
    struct MethodParameter {
        static let data = "data"
        static let directory = "directory"
        static let encoding = "encoding"
        static let from = "from"
        static let path = "path"
        static let recursive = "recursive"
        static let to = "to"
        static let toDirectory = "toDirectory"
    }

    struct ResultDataKey {
        static let data = "data"
        static let files = "files"
        static let uri = "uri"
        static let publicStorage = "publicStorage"
    }

    struct ResultDataValue {
        static let granted = "granted"
    }

    struct ItemAttributeJSONKey {
        static let ctime = "ctime"
        static let mtime = "mtime"
        static let name = "name"
        static let size = "size"
        static let type = "type"
        static let url = "url"
    }
}
