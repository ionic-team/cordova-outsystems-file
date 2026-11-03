import Foundation
import IONFilesystemLib

struct OSFileLocationResolver {
    let service: FileService

    func resolveSinglePath(from options: OSSinglePathFileOptions) -> Result<URL, OSFileError> {
        resolveURL(path: options.path, directory: options.directory)
    }

    func resolveDualPaths(from options: OSDualPathFileOptions) -> Result<(source: URL, destination: URL), OSFileError> {
        resolveURL(path: options.from.path, directory: options.from.directory)
            .flatMap { sourceURL in
                resolveURL(path: options.to.path, directory: options.to.directory)
                    .map { (source: sourceURL, destination: $0) }
            }
    }

    private func resolveURL(path: String, directory: IONFILESearchPath) -> Result<URL, OSFileError> {
        do {
            return .success(try service.getFileURL(atPath: path, withSearchPath: directory))
        } catch {
            return .failure(.invalidPath(path, reason: error))
        }
    }
}
