import { require } from "cordova";
import { PluginError } from "./definitions";

var exec = require('cordova/exec');

function ping(success: (output: string) => void, error: (error: PluginError) => void): void {
  exec(success, error, 'OSFilePlugin', 'ping', []);
}

module.exports = {
  ping
};