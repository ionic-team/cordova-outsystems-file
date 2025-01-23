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
    let options2 = {
      path: `${path}/${name}`,
      directory,
      recursive: true
    };
    let getUriSuccess = (uri) => {
      success(uri);
    };
    let mkDirSuccess = () => {
      this.getUri(getUriSuccess, error, name, path, isInternal, isTemporary);
    };
    CapacitorUtils.Synapse.Filesystem.mkdir(mkDirSuccess, error, options2);
  }
  deleteDirectory(success, error, path, isInternal, isTemporary) {
    let directory = this.getDirectoryTypeFrom(isInternal, isTemporary);
    let options2 = {
      path,
      directory,
      recursive: true
    };
    CapacitorUtils.Synapse.Filesystem.rmdir(success, error, options2);
  }
  listDirectory(success, error, path, isInternal, isTemporary) {
    let directory = this.getDirectoryTypeFrom(isInternal, isTemporary);
    let options2 = {
      path,
      directory
    };
    let synapseSuccess = (res) => {
      success(
        res.files.filter((fileInfo) => fileInfo.type == "directory").map((fileInfo) => fileInfo.name),
        res.files.filter((fileInfo) => fileInfo.type == "file").map((fileInfo) => fileInfo.name)
      );
    };
    CapacitorUtils.Synapse.Filesystem.readdir(synapseSuccess, error, options2);
  }
  getFileData(success, error, name, path, isInternal, isTemporary) {
    let synapseSuccess = (res) => {
      success(res.data);
    };
    this.readFile(synapseSuccess, error, `${path}/${name}`, isInternal, isTemporary);
    CapacitorUtils.Synapse.Filesystem.readFile(synapseSuccess, error, options);
  }
  writeFile(success, error, isInternal, isTemporary, data, path) {
    let directory = this.getDirectoryTypeFrom(isInternal, isTemporary);
    let options2 = {
      path,
      data,
      directory
    };
    CapacitorUtils.Synapse.Filesystem.writeFile(success, error, options2);
  }
  getDirectoryTypeFrom(isInternal, isTemporary) {
    if (cordova.platformId == "android") {
      if (isInternal) {
        return isTemporary ? Directory.Cache : Directory.Data;
      }
      return isTemporary ? Directory.ExternalCache : Directory.ExternalStorage;
    }
    return isTemporary ? Directory.Temporary : Directory.LibraryNoCloud;
  }
  getUri(success, error, name, path, isInternal, isTemporary) {
    let directory = this.getDirectoryTypeFrom(isInternal, isTemporary);
    let options2 = {
      path: `${path}/${name}`,
      directory
    };
    let synapseSuccess = (res) => {
      success(res.uri);
    };
    CapacitorUtils.Synapse.Filesystem.getUri(synapseSuccess, error, options2);
  }
  readFile(success, error, path, isInternal, isTemporary) {
    let directory = this.getDirectoryTypeFrom(isInternal, isTemporary);
    let options2 = {
      path,
      directory
    };
    CapacitorUtils.Synapse.Filesystem.readFile(success, error, options2);
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
const _FilePluginWeb = class _FilePluginWeb {
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
      request.onupgradeneeded = _FilePluginWeb.doUpgrade;
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
   * Read a file from disk
   * @param options options for the file read
   * @return a promise that resolves with the read file data result
   */
  async readFile(options2) {
    const path = this.getPath(options2.directory, options2.path);
    const entry = await this.dbRequest("get", [path]);
    if (entry === void 0) throw Error("File does not exist.");
    return { data: entry.content ? entry.content : "" };
  }
  /**
   * Write a file to disk in the specified location on device
   * @param options options for the file write
   * @return a promise that resolves with the file write result
   */
  async writeFile(options2) {
    const path = this.getPath(options2.directory, options2.path);
    let data = options2.data;
    const encoding = options2.encoding;
    const doRecursive = options2.recursive;
    const occupiedEntry = await this.dbRequest("get", [path]);
    if (occupiedEntry && occupiedEntry.type === "directory")
      throw Error("The supplied path is a directory.");
    const parentPath = path.substr(0, path.lastIndexOf("/"));
    const parentEntry = await this.dbRequest("get", [parentPath]);
    if (parentEntry === void 0) {
      const subDirIndex = parentPath.indexOf("/", 1);
      if (subDirIndex !== -1) {
        const parentArgPath = parentPath.substr(subDirIndex);
        await this.mkdir({
          path: parentArgPath,
          directory: options2.directory,
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
  async appendFile(options2) {
    const path = this.getPath(options2.directory, options2.path);
    let data = options2.data;
    const encoding = options2.encoding;
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
          directory: options2.directory,
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
  async deleteFile(options2) {
    const path = this.getPath(options2.directory, options2.path);
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
  async mkdir(options2) {
    const path = this.getPath(options2.directory, options2.path);
    const doRecursive = options2.recursive;
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
        directory: options2.directory,
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
  async rmdir(options2) {
    const { path, directory, recursive } = options2;
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
  async readdir(options2) {
    const path = this.getPath(options2.directory, options2.path);
    const entry = await this.dbRequest("get", [path]);
    if (options2.path !== "" && entry === void 0)
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
          creationTime: subEntry.ctime,
          modificationTime: subEntry.mtime,
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
  async getUri(options2) {
    const path = this.getPath(options2.directory, options2.path);
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
  async stat(options2) {
    const path = this.getPath(options2.directory, options2.path);
    let entry = await this.dbRequest("get", [path]);
    if (entry === void 0) {
      entry = await this.dbRequest("get", [path + "/"]);
    }
    if (entry === void 0) throw Error("Entry does not exist.");
    return {
      type: entry.type,
      size: entry.size,
      creationTime: entry.ctime,
      modificationTime: entry.mtime,
      uri: entry.path
    };
  }
  /**
   * Rename a file or directory
   * @param options the options for the rename operation
   * @return a promise that resolves with the rename result
   */
  async rename(options2) {
    await this._copy(options2, true);
    return;
  }
  /**
   * Copy a file or directory
   * @param options the options for the copy operation
   * @return a promise that resolves with the copy result
   */
  async copy(options2) {
    return this._copy(options2, false);
  }
  /**
   * Function that can perform a copy or a rename
   * @param options the options for the rename operation
   * @param doRename whether to perform a rename or copy operation
   * @return a promise that resolves with the result
   */
  async _copy(options2, doRename = false) {
    let { toDirectory } = options2;
    const { to, from, directory: fromDirectory } = options2;
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
    const ctime = fromObj.creationTime ? fromObj.creationTime : Date.now();
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
          await updateTime(to, ctime, fromObj.modificationTime);
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
            await updateTime(to, ctime, fromObj.modificationTime);
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
_FilePluginWeb._debug = true;
let FilePluginWeb = _FilePluginWeb;
class OSFilePlugin {
  constructor() {
    this.webPlugin = new FilePluginWeb();
  }
  readFile(success, error, options2) {
    if (typeof CapacitorUtils === "undefined") {
      this.webPlugin.readFile(options2).then((file) => success(file)).catch((err) => error(err));
    }
    CapacitorUtils.Synapse.Filesystem.readFile(success, error, options2);
  }
  writeFile(success, error, options2) {
    if (typeof CapacitorUtils === "undefined") {
      this.webPlugin.writeFile(options2).then((result) => success(result)).catch((err) => error(err));
    }
    CapacitorUtils.Synapse.Filesystem.writeFile(success, error, options2);
  }
  appendFile(success, error, options2) {
    if (typeof CapacitorUtils === "undefined") {
      this.webPlugin.appendFile(options2).then(() => success()).catch((err) => error(err));
    }
    CapacitorUtils.Synapse.Filesystem.appendFile(success, error, options2);
  }
  deleteFile(success, error, options2) {
    if (typeof CapacitorUtils === "undefined") {
      this.webPlugin.deleteFile(options2).then(() => success()).catch((err) => error(err));
    }
    CapacitorUtils.Synapse.Filesystem.deleteFile(success, error, options2);
  }
  mkdir(success, error, options2) {
    if (typeof CapacitorUtils === "undefined") {
      this.webPlugin.mkdir(options2).then(() => success()).catch((err) => error(err));
    }
    CapacitorUtils.Synapse.Filesystem.mkdir(success, error, options2);
  }
  rmdir(success, error, options2) {
    if (typeof CapacitorUtils === "undefined") {
      this.webPlugin.rmdir(options2).then(() => success()).catch((err) => error(err));
    }
    CapacitorUtils.Synapse.Filesystem.rmdir(success, error, options2);
  }
  readdir(success, error, options2) {
    if (typeof CapacitorUtils === "undefined") {
      this.webPlugin.readdir(options2).then((res) => success(res)).catch((err) => error(err));
    }
    CapacitorUtils.Synapse.Filesystem.readdir(success, error, options2);
  }
  getUri(success, error, options2) {
    if (typeof CapacitorUtils === "undefined") {
      this.webPlugin.getUri(options2).then((res) => success(res)).catch((err) => error(err));
    }
    CapacitorUtils.Synapse.Filesystem.getUri(success, error, options2);
  }
  stat(success, error, options2) {
    if (typeof CapacitorUtils === "undefined") {
      this.webPlugin.stat(options2).then((res) => success(res)).catch((err) => error(err));
    }
    CapacitorUtils.Synapse.Filesystem.stat(success, error, options2);
  }
  rename(success, error, options2) {
    if (typeof CapacitorUtils === "undefined") {
      this.webPlugin.rename(options2).then(() => success()).catch((err) => error(err));
    }
    CapacitorUtils.Synapse.Filesystem.rename(success, error, options2);
  }
  copy(success, error, options2) {
    if (typeof CapacitorUtils === "undefined") {
      this.webPlugin.copy(options2).then((res) => success(res)).catch((err) => error(err));
    }
    CapacitorUtils.Synapse.Filesystem.copy(success, error, options2);
  }
}
const Instance = new OSFilePlugin();
exports.Instance = Instance;
exports.LegacyMigration = LegacyMigration;
