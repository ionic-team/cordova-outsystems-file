import IONFilesystemLib

class OSDualPathFileOptions: Decodable {
    let from: OSSinglePathFileOptions
    let to: OSSinglePathFileOptions

    enum CodingKeys: CodingKey {
        case from
        case directory

        case to
        case toDirectory
    }

    required init(from decoder: any Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)

        let fromPath = try container.decode(String.self, forKey: .from)
        let fromDirectoryText = try container.decodeIfPresent(String.self, forKey: .directory)
        let fromDirectory = IONFILESearchPath.create(from: fromDirectoryText, withDefaultSearchPath: .raw)
        from = .init(path: fromPath, directory: fromDirectory)

        let toPath = try container.decode(String.self, forKey: .to)
        let toDirectoryText = try container.decodeIfPresent(String.self, forKey: .toDirectory)
        let toDirectory = IONFILESearchPath.create(from: toDirectoryText, withDefaultSearchPath: fromDirectory)
        to = .init(path: toPath, directory: toDirectory)
    }
}
