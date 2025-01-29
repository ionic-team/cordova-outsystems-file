import OSFilesystemLib

class OSSinglePathFileOptions: Decodable {
    let path: String
    let directory: OSFILESearchPath

    enum CodingKeys: CodingKey {
        case path
        case directory
    }

    init(path: String, directory: OSFILESearchPath) {
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

class OSSinglePathRecursiveFileOptions: OSSinglePathFileOptions {
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

class OSReadFileOptions: OSSinglePathFileOptions {
    let encoding: OSFILEEncoding

    enum CodingKeys: CodingKey {
        case encoding
    }

    required init(from decoder: any Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)

        let encodingText = try container.decodeIfPresent(String.self, forKey: .encoding)
        encoding = .create(from: encodingText)

        try super.init(from: decoder)
    }
}

class OSReadFileInChunksOptions: OSReadFileOptions {
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

class OSSinglePathRecursiveEncodingMapperFileOptions: OSSinglePathRecursiveFileOptions {
    let encodingMapper: OSFILEEncodingValueMapper?

    enum CodingKeys: CodingKey {
        case data
        case encoding
    }

    required init(from decoder: any Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)

        let dataText = try container.decode(String.self, forKey: .data)
        let encodingText = try container.decodeIfPresent(String.self, forKey: .encoding)
        encodingMapper = .create(from: encodingText, usingValue: dataText)

        try super.init(from: decoder)
    }
}
