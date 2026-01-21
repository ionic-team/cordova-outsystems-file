import IONFilesystemLib

class OSSinglePathFileOptions: Decodable {
    let path: String
    let directory: IONFILESearchPath

    enum CodingKeys: CodingKey {
        case path
        case directory
    }

    init(path: String, directory: IONFILESearchPath) {
        self.path = path
        self.directory = directory
    }

    required init(from decoder: any Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)

        path = try container.decode(String.self, forKey: .path)
        let directoryText = try container.decodeIfPresent(String.self, forKey: .directory)
        directory = .create(from: directoryText, withDefaultSearchPath: .raw)
    }
}

class IONSinglePathRecursiveFileOptions: OSSinglePathFileOptions {
    let recursive: Bool

    enum CodingKeys: CodingKey {
        case recursive
    }

    required init(from decoder: any Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)

        recursive = try container.decodeIfPresent(Bool.self, forKey: .recursive) ?? false

        try super.init(from: decoder)
    }
}

class IONReadFileOptions: OSSinglePathFileOptions {
    let encoding: IONFILEEncoding
    let offset: Int
    let length: Int

    enum CodingKeys: CodingKey {
        case encoding
        case offset
        case length
    }

    required init(from decoder: any Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)

        let encodingText = try container.decodeIfPresent(String.self, forKey: .encoding)
        encoding = .create(from: encodingText)
        if let decodedOffset = try container.decodeIfPresent(Int.self, forKey: .offset) {
            offset = decodedOffset
        } else {
            offset = 0
        }
        if let decodedLength = try container.decodeIfPresent(Int.self, forKey: .length) {
            length = decodedLength
        } else {
            length = -1
        }

        try super.init(from: decoder)
    }
}

class IONReadFileInChunksOptions: IONReadFileOptions {
    let chunkSize: Int

    enum CodingKeys: CodingKey {
        case chunkSize
    }

    required init(from decoder: any Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)

        chunkSize = try container.decode(Int.self, forKey: .chunkSize)

        try super.init(from: decoder)
    }
}

class IONSinglePathRecursiveEncodingMapperFileOptions: IONSinglePathRecursiveFileOptions {
    let encodingMapper: IONFILEEncodingValueMapper

    enum CodingKeys: CodingKey {
        case data
        case encoding
    }

    required init(from decoder: any Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)

        let dataText = try container.decode(String.self, forKey: .data)
        let encodingText = try container.decodeIfPresent(String.self, forKey: .encoding)
        guard let mapper = IONFILEEncodingValueMapper.create(from: encodingText, usingValue: dataText) else {
            throw IONFILEEncodingValueMapperError.cantDecode
        }
        encodingMapper = mapper

        try super.init(from: decoder)
    }
}

private enum IONFILEEncodingValueMapperError: Error {
    case cantDecode
}
