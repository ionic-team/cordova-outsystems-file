import { require as require2 } from "cordova";
function s(t) {
  t.CapacitorUtils.Synapse = new Proxy(
    {},
    {
      get(e, o) {
        return new Proxy({}, {
          get(w, r) {
            return (c, p, n) => {
              const i = t.Capacitor.Plugins[o];
              if (i === void 0) {
                n(new Error(`Capacitor plugin ${o} not found`));
                return;
              }
              if (typeof i[r] != "function") {
                n(new Error(`Method ${r} not found in Capacitor plugin ${o}`));
                return;
              }
              (async () => {
                try {
                  const a = await i[r](c);
                  p(a);
                } catch (a) {
                  n(a);
                }
              })();
            };
          }
        });
      }
    }
  );
}
function u(t) {
  t.CapacitorUtils.Synapse = new Proxy(
    {},
    {
      get(e, o) {
        return t.cordova.plugins[o];
      }
    }
  );
}
function y(t = false) {
  window.CapacitorUtils = window.CapacitorUtils || {}, window.Capacitor !== void 0 && !t ? s(window) : window.cordova !== void 0 && u(window);
}
var exec = require2("cordova/exec");
function readFile(success, error, options) {
  exec(success, error, "OSFilePlugin", "readFile", [options]);
}
function readFileInChunks(success, error, options) {
  exec(success, error, "OSFilePlugin", "readFileInChunks", [options]);
}
function writeFile(success, error, options) {
  exec(success, error, "OSFilePlugin", "writeFile", [options]);
}
function appendFile(success, error, options) {
  exec(success, error, "OSFilePlugin", "appendFile", [options]);
}
function deleteFile(success, error, options) {
  exec(success, error, "OSFilePlugin", "deleteFile", [options]);
}
function mkdir(success, error, options) {
  exec(success, error, "OSFilePlugin", "mkdir", [options]);
}
function rmdir(success, error, options) {
  exec(success, error, "OSFilePlugin", "rmdir", [options]);
}
function readdir(success, error, options) {
  exec(success, error, "OSFilePlugin", "readdir", [options]);
}
function getUri(success, error, options) {
  exec(success, error, "OSFilePlugin", "getUri", [options]);
}
function stat(success, error, options) {
  exec(success, error, "OSFilePlugin", "stat", [options]);
}
function rename(success, error, options) {
  exec(success, error, "OSFilePlugin", "rename", [options]);
}
function copy(success, error, options) {
  exec(success, error, "OSFilePlugin", "copy", [options]);
}
module.exports = {
  readFile,
  readFileInChunks,
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
y(true);
export {
  Directory,
  Encoding
};
