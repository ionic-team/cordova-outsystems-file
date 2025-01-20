import { require } from "cordova";
import { AppendFileOptions, CopyResult, DeleteFileOptions, GetUriOptions, GetUriResult, MkdirOptions, PluginError, ReaddirOptions, ReaddirResult, ReadFileOptions, ReadFileResult, RenameOptions, StatResult, WriteFileResult } from "./definitions";
import { CopyOptions, RmDirOptions, StatOptions, WriteFileOptions } from "fs";

var exec = require('cordova/exec');

/** FILE API */
function readFile(success: (output: ReadFileResult) => void, error: (error: PluginError) => void, options: ReadFileOptions): void {
  exec(success, error, 'OSFilePlugin', 'readFile', [options]);
}

function writeFile(success: (output: WriteFileResult) => void, error: (error: PluginError) => void, options: WriteFileOptions): void {
  exec(success, error, 'OSFilePlugin', 'writeFile', [options]);
}

function appendFile(success: () => void, error: (error: PluginError) => void, options: AppendFileOptions): void {
  exec(success, error, 'OSFilePlugin', 'appendFile', [options]);
}

function deleteFile(success: () => void, error: (error: PluginError) => void, options: DeleteFileOptions): void {
  exec(success, error, 'OSFilePlugin', 'deleteFile', [options]);
}

/** DIRECTORY API */

function mkdir(success: () => void, error: (error: PluginError) => void, options: MkdirOptions): void {
  exec(success, error, 'OSFilePlugin', 'mkdir', [options]);
}

function rmdir(success: () => void, error: (error: PluginError) => void, options: RmDirOptions): void {
  exec(success, error, 'OSFilePlugin', 'rmdir', [options]);
}

function readdir(success: (output: ReaddirResult) => void, error: (error: PluginError) => void, options: ReaddirOptions): void {
  exec(success, error, 'OSFilePlugin', 'readdir', [options]);
}

/** ACTIONS */

function getUri(success: (output: GetUriResult) => void, error: (error: PluginError) => void, options: GetUriOptions): void {
  exec(success, error, 'OSFilePlugin', 'getUri', [options]);
}

function stat(success: (output: StatResult) => void, error: (error: PluginError) => void, options: StatOptions): void {
  exec(success, error, 'OSFilePlugin', 'stat', [options]);
}

function rename(success: () => void, error: (error: PluginError) => void, options: RenameOptions): void {
  exec(success, error, 'OSFilePlugin', 'rename', [options]);
}

function copy(success: (output: CopyResult) => void, error: (error: PluginError) => void, options: CopyOptions): void {
  exec(success, error, 'OSFilePlugin', 'copy', [options]);
}

module.exports = {
  readFile,
  writeFile,
  appendFile,
  deleteFile,
  mkdir,
  rmdir,
  readdir,
  getUri,
  stat,
  rename,
  copy
};