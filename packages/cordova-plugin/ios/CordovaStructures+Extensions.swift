typealias PluginResultData = [String: Any]

enum PluginStatus {
    case success(PluginResultData?)
    case failure(OSFileError)

    var pluginResult: CDVPluginResult {
        switch self {
        case .success(let data):
            return CDVPluginResult(status: .ok, messageAs: data)
        case .failure(let error):
            return CDVPluginResult(status: .error, messageAs: error.toDictionary())
        }
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
