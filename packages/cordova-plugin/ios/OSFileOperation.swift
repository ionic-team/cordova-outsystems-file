import Foundation
import OSFilesystemLib

enum OSFileOperation {
    // Read Operations
    case readEntireFile(url: URL, encoding: OSFILEEncoding)
    case readFileInChunks(url: URL, encoding: OSFILEEncoding, chunkSize: Int)
    case readdir(url: URL)
    case stat(url: URL)
    case getUri(url: URL)

    // Write Operations
    case write(url: URL, encodingMapper: OSFILEEncodingValueMapper, recursive: Bool)
    case append(url: URL, encodingMapper: OSFILEEncodingValueMapper, recursive: Bool)

    // Directory Operations
    case mkdir(url: URL, recursive: Bool)
    case rmdir(url: URL, recursive: Bool)

    // File Management Operations
    case delete(url: URL)
    case rename(source: URL, destination: URL)
    case copy(source: URL, destination: URL)
}
