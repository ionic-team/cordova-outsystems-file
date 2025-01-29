typealias PluginResultData = [String: Any]

enum PluginStatus {
    case success(shouldKeepCallback: Bool = false, data: PluginResultData?)
    case failure(OSFileError)

    var pluginResult: CDVPluginResult {
        let result: CDVPluginResult

        switch self {
        case .success(let shouldKeepCallback, let data):
            result = CDVPluginResult(status: .ok, messageAs: data)
            result.keepCallback = NSNumber(booleanLiteral: shouldKeepCallback)
        case .failure(let error):
            result = CDVPluginResult(status: .error, messageAs: error.toDictionary())
        }

        return result
    }
}

extension CDVCommandDelegate {
    func handle(_ command: CDVInvokedUrlCommand, status: PluginStatus) {
        send(status.pluginResult, callbackId: command.callbackId)
    }
}

extension CDVInvokedUrlCommand {
    func createModel<T: Decodable>() -> T? {
        guard let argumentsDictionary = argument(at: 0) as? [String: Any],
              let argumentsData = try? JSONSerialization.data(withJSONObject: argumentsDictionary),
              let argumentsModel = try? JSONDecoder().decode(T.self, from: argumentsData)
        else { return nil }
        return argumentsModel
    }
}
