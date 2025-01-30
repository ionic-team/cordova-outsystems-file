import Foundation
import IONFilesystemLib

struct IONFileLocationResolver {
    let service: FileService

    func resolveSinglePath(from options: IONSinglePathFileOptions) -> Result<URL, IONFileError> {
        resolveURL(path: options.path, directory: options.directory)
    }

    func resolveDualPaths(from options: IONDualPathFileOptions) -> Result<(source: URL, destination: URL), IONFileError> {
        resolveURL(path: options.from.path, directory: options.from.directory)
            .flatMap { sourceURL in
                resolveURL(path: options.to.path, directory: options.to.directory)
                    .map { (source: sourceURL, destination: $0) }
            }
    }

    private func resolveURL(path: String, directory: IONFILESearchPath) -> Result<URL, IONFileError> {
        return if let url = try? service.getFileURL(atPath: path, withSearchPath: directory) {
            .success(url)
        } else {
            .failure(.invalidPath(path))
        }
    }
}
