import Foundation
import OSFilesystemLib

enum FilesystemOperation {
    case read(url: URL, encoding: OSFILEEncoding)
    case write(url: URL, encodingMapper: OSFILEEncodingValueMapper, recursive: Bool)
    case append(url: URL, encodingMapper: OSFILEEncodingValueMapper, recursive: Bool)
    case delete(url: URL)
    case mkdir(url: URL, recursive: Bool)
    case rmdir(url: URL, recursive: Bool)
    case readdir(url: URL)
    case stat(url: URL)
    case getUri(url: URL)
    case rename(source: URL, destination: URL)
    case copy(source: URL, destination: URL)
}