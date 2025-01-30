typealias PluginResultData = [String: Any]

enum PluginStatus {
    case success(shouldKeepCallback: Bool = false, data: PluginResultData?)
    case failure(IONFileError)

    var pluginResult: CDVPluginResult {
        var keepCallback = false
        let result: CDVPluginResult

        switch self {
        case .success(let shouldKeepCallback, let data):
            keepCallback = shouldKeepCallback
            result = CDVPluginResult(status: .ok, messageAs: data)
        case .failure(let error):
            result = CDVPluginResult(status: .error, messageAs: error.toDictionary())
        }
        result.keepCallback = NSNumber(booleanLiteral: keepCallback)
        
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
