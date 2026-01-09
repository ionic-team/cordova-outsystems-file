"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
var Directory = /* @__PURE__ */ ((Directory2) => {
  Directory2["Documents"] = "DOCUMENTS";
  Directory2["Data"] = "DATA";
  Directory2["Library"] = "LIBRARY";
  Directory2["Cache"] = "CACHE";
  Directory2["External"] = "EXTERNAL";
  Directory2["ExternalStorage"] = "EXTERNAL_STORAGE";
  Directory2["ExternalCache"] = "EXTERNAL_CACHE";
  Directory2["LibraryNoCloud"] = "LIBRARY_NO_CLOUD";
  Directory2["Temporary"] = "TEMPORARY";
  return Directory2;
})(Directory || {});
var Encoding = /* @__PURE__ */ ((Encoding2) => {
  Encoding2["UTF8"] = "utf8";
  Encoding2["ASCII"] = "ascii";
  Encoding2["UTF16"] = "utf16";
  return Encoding2;
})(Encoding || {});
class LegacyCordovaBridge {
  createDirectory(success, error, name, path, isInternal, isTemporary) {
    let directory = this.getDirectoryTypeFrom(isInternal, isTemporary);
    let options = {
      path: path != "" ? `${path}/${name}` : name,
      directory,
      recursive: true
    };
    let getUriSuccess = (uri) => {
      success(uri);
    };
    let mkDirSuccess = () => {
      this.getFileUri(getUriSuccess, error, name, path, isInternal, isTemporary);
    };
    if (this.isNewCordovaPluginDefined()) {
      cordova.plugins.Filesystem.mkdir(mkDirSuccess, error, options);
    } else {
      window.CapacitorPlugins.Filesystem.mkdir(options).then(mkDirSuccess).catch(error);
    }
  }
  deleteDirectory(success, error, path, isInternal, isTemporary) {
    let directory = this.getDirectoryTypeFrom(isInternal, isTemporary);
    let options = {
      path,
      directory,
      recursive: true
    };
    if (this.isNewCordovaPluginDefined()) {
      cordova.plugins.Filesystem.rmdir(success, error, options);
    } else {
      window.CapacitorPlugins.Filesystem.rmdir(options).then(success).catch(error);
    }
  }
  listDirectory(success, error, path, isInternal, isTemporary) {
    let directory = this.getDirectoryTypeFrom(isInternal, isTemporary);
    let options = {
      path,
      directory
    };
    let readDirSuccess = (res) => {
      let { directories, files } = res.files.reduce(
        (acc, fileInfo) => {
          if (fileInfo.type === "directory") {
            acc.directories.push(fileInfo.name);
          } else if (fileInfo.type === "file") {
            acc.files.push(fileInfo.name);
          }
          return acc;
        },
        { directories: [], files: [] }
      );
      success(directories, files);
    };
    if (this.isNewCordovaPluginDefined()) {
      cordova.plugins.Filesystem.readdir(readDirSuccess, error, options);
    } else {
      window.CapacitorPlugins.Filesystem.readdir(options).then(readDirSuccess).catch(error);
    }
  }
  getFileData(success, error, name, path, isInternal, isTemporary) {
    this.readFile(success, error, `${path}/${name}`, isInternal, isTemporary);
  }
  getFileDataFromUri(success, error, path) {
    this.readFile(success, error, path, void 0, void 0);
  }
  getFileUrl(success, error, name, path, isInternal, isTemporary) {
    let type = this.getMimeType(name);
    let readFileSuccess = (res) => {
      let blobUrl = this.dataToBlobUrl(res, type);
      success(blobUrl);
    };
    this.readFile(readFileSuccess, error, `${path}/${name}`, isInternal, isTemporary);
  }
  getFileUrlFromUri(success, error, path) {
    let type;
    let readFileSuccess = (res) => {
      let blobUrl = this.dataToBlobUrl(res, type);
      success(blobUrl);
    };
    let statSuccess = (res) => {
      type = this.getMimeType(res.name);
      this.readFile(readFileSuccess, error, path, void 0, void 0);
    };
    if (this.isNewCordovaPluginDefined()) {
      cordova.plugins.Filesystem.stat(statSuccess, error, { path });
    } else {
      window.CapacitorPlugins.Filesystem.stat({ path }).then(statSuccess).catch(error);
    }
  }
  getFileUri(success, error, name, path, isInternal, isTemporary) {
    let directory = this.getDirectoryTypeFrom(isInternal, isTemporary);
    let options = {
      path: `${path}/${name}`,
      directory
    };
    let getUriSuccess = (res) => {
      success(res.uri);
    };
    if (this.isNewCordovaPluginDefined()) {
      cordova.plugins.Filesystem.getUri(getUriSuccess, error, options);
    } else {
      window.CapacitorPlugins.Filesystem.getUri(options).then(getUriSuccess).catch(error);
    }
  }
  writeFile(success, error, name, path, data, isInternal, isTemporary) {
    let directory = this.getDirectoryTypeFrom(isInternal, isTemporary);
    let options = {
      path: `${path}/${name}`,
      data,
      directory,
      recursive: true
    };
    if (this.isNewCordovaPluginDefined()) {
      cordova.plugins.Filesystem.writeFile(success, error, options);
    } else {
      window.CapacitorPlugins.Filesystem.writeFile(options).then(success).catch(error);
    }
  }
  deleteFile(success, error, path, name, isInternal, isTemporary) {
    let directory = this.getDirectoryTypeFrom(isInternal, isTemporary);
    let options = {
      path: `${path}/${name}`,
      directory
    };
    if (this.isNewCordovaPluginDefined()) {
      cordova.plugins.Filesystem.deleteFile(success, error, options);
    } else {
      window.CapacitorPlugins.Filesystem.deleteFile(options).then(success).catch(error);
    }
  }
  getOptionalDirectoryTypeFrom(isInternal, isTemporary) {
    if (isInternal === void 0 || isTemporary === void 0) {
      return void 0;
    } else {
      return this.getDirectoryTypeFrom(!!isInternal, !!isTemporary);
    }
  }
  getDirectoryTypeFrom(isInternal, isTemporary) {
    if (this.getPlatformId() == "android") {
      if (isInternal) {
        return isTemporary ? Directory.Cache : Directory.Data;
      }
      return isTemporary ? Directory.ExternalCache : Directory.External;
    }
    return isTemporary ? Directory.Temporary : Directory.LibraryNoCloud;
  }
  readFile(success, error, path, isInternal, isTemporary) {
    let directory = this.getOptionalDirectoryTypeFrom(isInternal, isTemporary);
    let options = {
      path,
      directory,
      chunkSize: 256 * 1024
    };
    let chunks = [];
    let readInChunksSuccessCallback = (res) => {
      if (res === null || res.data === "") {
        success(chunks.join(""));
      } else if (typeof res.data === "string") {
        chunks.push(res.data);
      } else {
        chunks.push(res.data.toString());
      }
    };
    if (this.isCapacitorPluginDefined()) {
      let readInChunksCapacitorCallback = (res, err) => {
        if (err) {
          error(err);
        } else {
          readInChunksSuccessCallback(res);
        }
      };
      window.CapacitorPlugins.Filesystem.readFileInChunks(options, readInChunksCapacitorCallback);
    } else {
      cordova.plugins.Filesystem.readFileInChunks(readInChunksSuccessCallback, error, options);
    }
  }
  dataToBlobUrl(data, mimeType) {
    let blob;
    if (data instanceof Blob) {
      blob = data;
    } else {
      let binaryString = atob(data);
      let binaryArray = new Uint8Array(
        Array.from(binaryString, (char) => char.charCodeAt(0))
      );
      blob = new Blob([binaryArray], { type: mimeType });
    }
    return URL.createObjectURL(blob);
  }
  getMimeType(fromName) {
    const mimeTypes = {
      "txt": "text/plain",
      "html": "text/html",
      "htm": "text/html",
      "css": "text/css",
      "js": "text/javascript",
      "json": "application/json",
      "png": "image/png",
      "jpg": "image/jpeg",
      "jpeg": "image/jpeg",
      "gif": "image/gif",
      "svg": "image/svg+xml",
      "pdf": "application/pdf",
      "doc": "application/msword",
      "docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "xls": "application/vnd.ms-excel",
      "xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "ppt": "application/vnd.ms-powerpoint",
      "pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "zip": "application/zip",
      "mp3": "audio/mpeg",
      "mp4": "video/mp4",
      "mov": "video/quicktime",
      "webm": "video/webm",
      "ogg": "audio/ogg"
    };
    const extension = fromName.split(".").pop().toLowerCase();
    return mimeTypes[extension] || "application/octet-stream";
  }
  /**
   * @returns true if filesystem capacitor plugin is available; false otherwise
   */
  isCapacitorPluginDefined() {
    return typeof window !== "undefined" && typeof window.CapacitorPlugins !== "undefined" && typeof window.CapacitorPlugins.Filesystem !== "undefined";
  }
  /**
   * @returns true if file cordova plugin is available; false otherwise
   */
  isNewCordovaPluginDefined() {
    return typeof cordova !== "undefined" && typeof cordova.plugins !== "undefined" && typeof cordova.plugins.Filesystem !== "undefined";
  }
  /**
   * @return the platform id that the app is running on
   */
  getPlatformId() {
    if (typeof Capacitor !== "undefined") {
      return Capacitor.getPlatform();
    }
    return cordova.platformId;
  }
}
const LegacyMigration = new LegacyCordovaBridge();
function resolve(path) {
  const posix = path.split("/").filter((item) => item !== ".");
  const newPosix = [];
  posix.forEach((item) => {
    if (item === ".." && newPosix.length > 0 && newPosix[newPosix.length - 1] !== "..") {
      newPosix.pop();
    } else {
      newPosix.push(item);
    }
  });
  return newPosix.join("/");
}
function isPathParent(parent, children) {
  parent = resolve(parent);
  children = resolve(children);
  const pathsA = parent.split("/");
  const pathsB = children.split("/");
  return parent !== children && pathsA.every((value, index) => value === pathsB[index]);
}
const _FilesystemWeb = class _FilesystemWeb {
  constructor() {
    this.DB_VERSION = 1;
    this.DB_NAME = "Disc";
    this._writeCmds = ["add", "put", "delete"];
  }
  async initDb() {
    if (this._db !== void 0) {
      return this._db;
    }
    if (!("indexedDB" in window)) {
      throw new Error("This browser doesn't support IndexedDB");
    }
    return new Promise((resolve2, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);
      request.onupgradeneeded = _FilesystemWeb.doUpgrade;
      request.onsuccess = () => {
        this._db = request.result;
        resolve2(request.result);
      };
      request.onerror = () => reject(request.error);
      request.onblocked = () => {
        console.warn("db blocked");
      };
    });
  }
  static doUpgrade(event) {
    const eventTarget = event.target;
    const db = eventTarget.result;
    switch (event.oldVersion) {
      case 0:
      case 1:
      default: {
        if (db.objectStoreNames.contains("FileStorage")) {
          db.deleteObjectStore("FileStorage");
        }
        const store = db.createObjectStore("FileStorage", { keyPath: "path" });
        store.createIndex("by_folder", "folder");
      }
    }
  }
  async dbRequest(cmd, args) {
    const readFlag = this._writeCmds.indexOf(cmd) !== -1 ? "readwrite" : "readonly";
    return this.initDb().then((conn) => {
      return new Promise((resolve2, reject) => {
        const tx = conn.transaction(["FileStorage"], readFlag);
        const store = tx.objectStore("FileStorage");
        const req = store[cmd](...args);
        req.onsuccess = () => resolve2(req.result);
        req.onerror = () => reject(req.error);
      });
    });
  }
  async dbIndexRequest(indexName, cmd, args) {
    const readFlag = this._writeCmds.indexOf(cmd) !== -1 ? "readwrite" : "readonly";
    return this.initDb().then((conn) => {
      return new Promise((resolve2, reject) => {
        const tx = conn.transaction(["FileStorage"], readFlag);
        const store = tx.objectStore("FileStorage");
        const index = store.index(indexName);
        const req = index[cmd](...args);
        req.onsuccess = () => resolve2(req.result);
        req.onerror = () => reject(req.error);
      });
    });
  }
  getPath(directory, uriPath) {
    const cleanedUriPath = uriPath !== void 0 ? uriPath.replace(/^[/]+|[/]+$/g, "") : "";
    let fsPath = "";
    if (directory !== void 0) fsPath += "/" + directory;
    if (uriPath !== "") fsPath += "/" + cleanedUriPath;
    return fsPath;
  }
  async clear() {
    const conn = await this.initDb();
    const tx = conn.transaction(["FileStorage"], "readwrite");
    const store = tx.objectStore("FileStorage");
    store.clear();
  }
  /**
   * Not available in web
   */
  readFileInChunks(options, success, error) {
    throw new Error("Method not implemented.");
  }
  /**
   * Read a file from disk
   * @param options options for the file read
   * @return a promise that resolves with the read file data result
   */
  async readFile(options) {
    const path = this.getPath(options.directory, options.path);
    const entry = await this.dbRequest("get", [path]);
    if (entry === void 0) throw Error("File does not exist.");
    return { data: entry.content ? entry.content : "" };
  }
  /**
   * Write a file to disk in the specified location on device
   * @param options options for the file write
   * @return a promise that resolves with the file write result
   */
  async writeFile(options) {
    const path = this.getPath(options.directory, options.path);
    let data = options.data;
    const encoding = options.encoding;
    const doRecursive = options.recursive;
    const occupiedEntry = await this.dbRequest("get", [path]);
    if (occupiedEntry && occupiedEntry.type === "directory")
      throw Error("The supplied path is a directory.");
    const parentPath = path.substring(0, path.lastIndexOf("/"));
    const parentEntry = await this.dbRequest("get", [parentPath]);
    if (parentEntry === void 0) {
      const subDirIndex = parentPath.indexOf("/", 1);
      if (subDirIndex !== -1) {
        const parentArgPath = parentPath.substring(subDirIndex);
        await this.mkdir({
          path: parentArgPath,
          directory: options.directory,
          recursive: doRecursive
        });
      }
    }
    if (!encoding && !(data instanceof Blob)) {
      data = data.indexOf(",") >= 0 ? data.split(",")[1] : data;
      if (!this.isBase64String(data))
        throw Error("The supplied data is not valid base64 content.");
    }
    const now = Date.now();
    const pathObj = {
      path,
      folder: parentPath,
      type: "file",
      size: data instanceof Blob ? data.size : data.length,
      ctime: now,
      mtime: now,
      content: data
    };
    await this.dbRequest("put", [pathObj]);
    return {
      uri: pathObj.path
    };
  }
  /**
   * Append to a file on disk in the specified location on device
   * @param options options for the file append
   * @return a promise that resolves with the file write result
   */
  async appendFile(options) {
    const path = this.getPath(options.directory, options.path);
    let data = options.data;
    const encoding = options.encoding;
    const parentPath = path.substr(0, path.lastIndexOf("/"));
    const now = Date.now();
    let ctime = now;
    const occupiedEntry = await this.dbRequest("get", [path]);
    if (occupiedEntry && occupiedEntry.type === "directory")
      throw Error("The supplied path is a directory.");
    const parentEntry = await this.dbRequest("get", [parentPath]);
    if (parentEntry === void 0) {
      const subDirIndex = parentPath.indexOf("/", 1);
      if (subDirIndex !== -1) {
        const parentArgPath = parentPath.substr(subDirIndex);
        await this.mkdir({
          path: parentArgPath,
          directory: options.directory,
          recursive: true
        });
      }
    }
    if (!encoding && !this.isBase64String(data))
      throw Error("The supplied data is not valid base64 content.");
    if (occupiedEntry !== void 0) {
      if (occupiedEntry.content instanceof Blob) {
        throw Error(
          "The occupied entry contains a Blob object which cannot be appended to."
        );
      }
      if (occupiedEntry.content !== void 0 && !encoding) {
        data = btoa(atob(occupiedEntry.content) + atob(data));
      } else {
        data = occupiedEntry.content + data;
      }
      ctime = occupiedEntry.ctime;
    }
    const pathObj = {
      path,
      folder: parentPath,
      type: "file",
      size: data.length,
      ctime,
      mtime: now,
      content: data
    };
    await this.dbRequest("put", [pathObj]);
  }
  /**
   * Delete a file from disk
   * @param options options for the file delete
   * @return a promise that resolves with the deleted file data result
   */
  async deleteFile(options) {
    const path = this.getPath(options.directory, options.path);
    const entry = await this.dbRequest("get", [path]);
    if (entry === void 0) throw Error("File does not exist.");
    const entries = await this.dbIndexRequest("by_folder", "getAllKeys", [
      IDBKeyRange.only(path)
    ]);
    if (entries.length !== 0) throw Error("Folder is not empty.");
    await this.dbRequest("delete", [path]);
  }
  /**
   * Create a directory.
   * @param options options for the mkdir
   * @return a promise that resolves with the mkdir result
   */
  async mkdir(options) {
    const path = this.getPath(options.directory, options.path);
    const doRecursive = options.recursive;
    const parentPath = path.substr(0, path.lastIndexOf("/"));
    const depth = (path.match(/\//g) || []).length;
    const parentEntry = await this.dbRequest("get", [parentPath]);
    const occupiedEntry = await this.dbRequest("get", [path]);
    if (depth === 1) throw Error("Cannot create Root directory");
    if (occupiedEntry !== void 0)
      throw Error("Current directory does already exist.");
    if (!doRecursive && depth !== 2 && parentEntry === void 0)
      throw Error("Parent directory must exist");
    if (doRecursive && depth !== 2 && parentEntry === void 0) {
      const parentArgPath = parentPath.substr(parentPath.indexOf("/", 1));
      await this.mkdir({
        path: parentArgPath,
        directory: options.directory,
        recursive: doRecursive
      });
    }
    const now = Date.now();
    const pathObj = {
      path,
      folder: parentPath,
      type: "directory",
      size: 0,
      ctime: now,
      mtime: now
    };
    await this.dbRequest("put", [pathObj]);
  }
  /**
   * Remove a directory
   * @param options the options for the directory remove
   */
  async rmdir(options) {
    const { path, directory, recursive } = options;
    const fullPath = this.getPath(directory, path);
    const entry = await this.dbRequest("get", [fullPath]);
    if (entry === void 0) throw Error("Folder does not exist.");
    if (entry.type !== "directory")
      throw Error("Requested path is not a directory");
    const readDirResult = await this.readdir({ path, directory });
    if (readDirResult.files.length !== 0 && !recursive)
      throw Error("Folder is not empty");
    for (const entry2 of readDirResult.files) {
      const entryPath = `${path}/${entry2.name}`;
      const entryObj = await this.stat({ path: entryPath, directory });
      if (entryObj.type === "file") {
        await this.deleteFile({ path: entryPath, directory });
      } else {
        await this.rmdir({ path: entryPath, directory, recursive });
      }
    }
    await this.dbRequest("delete", [fullPath]);
  }
  /**
   * Return a list of files from the directory (not recursive)
   * @param options the options for the readdir operation
   * @return a promise that resolves with the readdir directory listing result
   */
  async readdir(options) {
    const path = this.getPath(options.directory, options.path);
    const entry = await this.dbRequest("get", [path]);
    if (options.path !== "" && entry === void 0)
      throw Error("Folder does not exist.");
    const entries = await this.dbIndexRequest(
      "by_folder",
      "getAllKeys",
      [IDBKeyRange.only(path)]
    );
    const files = await Promise.all(
      entries.map(async (e) => {
        let subEntry = await this.dbRequest("get", [e]);
        if (subEntry === void 0) {
          subEntry = await this.dbRequest("get", [e + "/"]);
        }
        return {
          name: e.substring(path.length + 1),
          type: subEntry.type,
          size: subEntry.size,
          ctime: subEntry.ctime,
          mtime: subEntry.mtime,
          uri: subEntry.path
        };
      })
    );
    return { files };
  }
  /**
   * Return full File URI for a path and directory
   * @param options the options for the stat operation
   * @return a promise that resolves with the file stat result
   */
  async getUri(options) {
    const path = this.getPath(options.directory, options.path);
    let entry = await this.dbRequest("get", [path]);
    if (entry === void 0) {
      entry = await this.dbRequest("get", [path + "/"]);
    }
    return {
      uri: entry?.path || path
    };
  }
  /**
   * Return data about a file
   * @param options the options for the stat operation
   * @return a promise that resolves with the file stat result
   */
  async stat(options) {
    const path = this.getPath(options.directory, options.path);
    let entry = await this.dbRequest("get", [path]);
    if (entry === void 0) {
      entry = await this.dbRequest("get", [path + "/"]);
    }
    if (entry === void 0) throw Error("Entry does not exist.");
    return {
      name: entry.path.substring(entry.path.lastIndexOf("/") + 1),
      type: entry.type,
      size: entry.size,
      ctime: entry.ctime,
      mtime: entry.mtime,
      uri: entry.path
    };
  }
  /**
   * Rename a file or directory
   * @param options the options for the rename operation
   * @return a promise that resolves with the rename result
   */
  async rename(options) {
    await this._copy(options, true);
    return;
  }
  /**
   * Copy a file or directory
   * @param options the options for the copy operation
   * @return a promise that resolves with the copy result
   */
  async copy(options) {
    return this._copy(options, false);
  }
  /**
   * Function that can perform a copy or a rename
   * @param options the options for the rename operation
   * @param doRename whether to perform a rename or copy operation
   * @return a promise that resolves with the result
   */
  async _copy(options, doRename = false) {
    let { toDirectory } = options;
    const { to, from, directory: fromDirectory } = options;
    if (!to || !from) {
      throw Error("Both to and from must be provided");
    }
    if (!toDirectory) {
      toDirectory = fromDirectory;
    }
    const fromPath = this.getPath(fromDirectory, from);
    const toPath = this.getPath(toDirectory, to);
    if (fromPath === toPath) {
      return {
        uri: toPath
      };
    }
    if (isPathParent(fromPath, toPath)) {
      throw Error("To path cannot contain the from path");
    }
    let toObj;
    try {
      toObj = await this.stat({
        path: to,
        directory: toDirectory
      });
    } catch (e) {
      const toPathComponents = to.split("/");
      toPathComponents.pop();
      const toPath2 = toPathComponents.join("/");
      if (toPathComponents.length > 0) {
        const toParentDirectory = await this.stat({
          path: toPath2,
          directory: toDirectory
        });
        if (toParentDirectory.type !== "directory") {
          throw new Error("Parent directory of the to path is a file");
        }
      }
    }
    if (toObj && toObj.type === "directory") {
      throw new Error("Cannot overwrite a directory with a file");
    }
    const fromObj = await this.stat({
      path: from,
      directory: fromDirectory
    });
    const updateTime = async (path, ctime2, mtime) => {
      const fullPath = this.getPath(toDirectory, path);
      const entry = await this.dbRequest("get", [fullPath]);
      entry.ctime = ctime2;
      entry.mtime = mtime;
      await this.dbRequest("put", [entry]);
    };
    const ctime = fromObj.ctime ? fromObj.ctime : Date.now();
    switch (fromObj.type) {
      case "file": {
        const file = await this.readFile({
          path: from,
          directory: fromDirectory
        });
        if (doRename) {
          await this.deleteFile({
            path: from,
            directory: fromDirectory
          });
        }
        let encoding;
        if (!(file.data instanceof Blob) && !this.isBase64String(file.data)) {
          encoding = Encoding.UTF8;
        }
        const writeResult = await this.writeFile({
          path: to,
          directory: toDirectory,
          data: file.data,
          encoding
        });
        if (doRename) {
          await updateTime(to, ctime, fromObj.mtime);
        }
        return writeResult;
      }
      case "directory": {
        if (toObj) {
          throw Error("Cannot move a directory over an existing object");
        }
        try {
          await this.mkdir({
            path: to,
            directory: toDirectory,
            recursive: false
          });
          if (doRename) {
            await updateTime(to, ctime, fromObj.mtime);
          }
        } catch (e) {
        }
        const contents = (await this.readdir({
          path: from,
          directory: fromDirectory
        })).files;
        for (const filename of contents) {
          await this._copy(
            {
              from: `${from}/${filename.name}`,
              to: `${to}/${filename.name}`,
              directory: fromDirectory,
              toDirectory
            },
            doRename
          );
        }
        if (doRename) {
          await this.rmdir({
            path: from,
            directory: fromDirectory
          });
        }
      }
    }
    return {
      uri: toPath
    };
  }
  isBase64String(str) {
    try {
      return btoa(atob(str)) == str;
    } catch (err) {
      return false;
    }
  }
};
_FilesystemWeb._debug = true;
let FilesystemWeb = _FilesystemWeb;
class OSFilePlugin {
  constructor() {
    this.webPlugin = new FilesystemWeb();
  }
  readFile(success, error, options) {
    if (this.shouldUseCordovaWebImplementation()) {
      this.webPlugin.readFile(options).then((file) => success(file)).catch((err) => error(err));
      return;
    }
    if (this.isCordovaPluginDefined()) {
      cordova.plugins.Filesystem.readFile(success, error, options);
    } else {
      window.CapacitorPlugins.Filesystem.readFile(options).then(success).catch(error);
    }
  }
  writeFile(success, error, options) {
    if (this.shouldUseCordovaWebImplementation()) {
      this.webPlugin.writeFile(options).then((result) => success(result)).catch((err) => error(err));
      return;
    }
    if (this.isCordovaPluginDefined()) {
      cordova.plugins.Filesystem.writeFile(success, error, options);
    } else {
      window.CapacitorPlugins.Filesystem.writeFile(options).then(success).catch(error);
    }
  }
  appendFile(success, error, options) {
    if (this.shouldUseCordovaWebImplementation()) {
      this.webPlugin.appendFile(options).then(() => success()).catch((err) => error(err));
      return;
    }
    if (this.isCordovaPluginDefined()) {
      cordova.plugins.Filesystem.appendFile(success, error, options);
    } else {
      window.CapacitorPlugins.Filesystem.appendFile(options).then(success).catch(error);
    }
  }
  deleteFile(success, error, options) {
    if (this.shouldUseCordovaWebImplementation()) {
      this.webPlugin.deleteFile(options).then(() => success()).catch((err) => error(err));
      return;
    }
    if (this.isCordovaPluginDefined()) {
      cordova.plugins.Filesystem.deleteFile(success, error, options);
    } else {
      window.CapacitorPlugins.Filesystem.deleteFile(options).then(success).catch(error);
    }
  }
  mkdir(success, error, options) {
    if (this.shouldUseCordovaWebImplementation()) {
      this.webPlugin.mkdir(options).then(() => success()).catch((err) => error(err));
      return;
    }
    if (this.isCordovaPluginDefined()) {
      cordova.plugins.Filesystem.mkdir(success, error, options);
    } else {
      window.CapacitorPlugins.Filesystem.mkdir(options).then(success).catch(error);
    }
  }
  rmdir(success, error, options) {
    if (this.shouldUseCordovaWebImplementation()) {
      this.webPlugin.rmdir(options).then(() => success()).catch((err) => error(err));
      return;
    }
    if (this.isCordovaPluginDefined()) {
      cordova.plugins.Filesystem.rmdir(success, error, options);
    } else {
      window.CapacitorPlugins.Filesystem.rmdir(options).then(success).catch(error);
    }
  }
  readdir(success, error, options) {
    if (this.shouldUseCordovaWebImplementation()) {
      this.webPlugin.readdir(options).then((res) => success(res)).catch((err) => error(err));
      return;
    }
    if (this.isCordovaPluginDefined()) {
      cordova.plugins.Filesystem.readdir(success, error, options);
    } else {
      window.CapacitorPlugins.Filesystem.readdir(options).then(success).catch(error);
    }
  }
  getUri(success, error, options) {
    if (this.shouldUseCordovaWebImplementation()) {
      this.webPlugin.getUri(options).then((res) => success(res)).catch((err) => error(err));
      return;
    }
    if (this.isCordovaPluginDefined()) {
      cordova.plugins.Filesystem.getUri(success, error, options);
    } else {
      window.CapacitorPlugins.Filesystem.getUri(options).then(success).catch(error);
    }
  }
  stat(success, error, options) {
    if (this.shouldUseCordovaWebImplementation()) {
      this.webPlugin.stat(options).then((res) => success(res)).catch((err) => error(err));
      return;
    }
    if (this.isCordovaPluginDefined()) {
      cordova.plugins.Filesystem.stat(success, error, options);
    } else {
      window.CapacitorPlugins.Filesystem.stat(options).then(success).catch(error);
    }
  }
  rename(success, error, options) {
    if (this.shouldUseCordovaWebImplementation()) {
      this.webPlugin.rename(options).then(() => success()).catch((err) => error(err));
      return;
    }
    if (this.isCordovaPluginDefined()) {
      cordova.plugins.Filesystem.rename(success, error, options);
    } else {
      window.CapacitorPlugins.Filesystem.rename(options).then(success).catch(error);
    }
  }
  copy(success, error, options) {
    if (this.shouldUseCordovaWebImplementation()) {
      this.webPlugin.copy(options).then((res) => success(res)).catch((err) => error(err));
      return;
    }
    if (this.isCordovaPluginDefined()) {
      cordova.plugins.Filesystem.copy(success, error, options);
    } else {
      window.CapacitorPlugins.Filesystem.copy(options).then(success).catch(error);
    }
  }
  /**
   * @returns true if should use the web implementation
   */
  shouldUseCordovaWebImplementation() {
    return !(this.isCapacitorPluginDefined() || this.isCordovaPluginDefined());
  }
  /**
   * @returns true if filesystem capacitor plugin is available; false otherwise
   */
  isCapacitorPluginDefined() {
    return typeof window !== "undefined" && typeof window.CapacitorPlugins !== "undefined" && typeof window.CapacitorPlugins.Filesystem !== "undefined";
  }
  /**
   * @returns true if file cordova plugin is available; false otherwise
   */
  isCordovaPluginDefined() {
    return typeof cordova !== "undefined" && typeof cordova.plugins !== "undefined" && typeof cordova.plugins.Filesystem !== "undefined";
  }
}
const Instance = new OSFilePlugin();
exports.Instance = Instance;
exports.LegacyMigration = LegacyMigration;
