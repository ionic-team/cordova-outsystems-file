package com.outsystems.plugins.file

enum class OSFileMethod(val methodName: String, val permissionRequestCode: Int) {
    READ("readFile", 1),
    READ_IN_CHUNKS("readFileInChunks", 2),
    WRITE("writeFile", 3),
    APPEND("appendFile", 3), // same code as writeFile because it's the same operation
    DELETE_FILE("deleteFile", 4),
    CREATE_DIRECTORY("mkdir", 5),
    REMOVE_DIRECTORY("rmdir", 6),
    LIST_DIRECTORY("readdir", 7),
    GET_URI("getUri", 8),
    STAT("stat", 9),
    RENAME("rename", 10),
    COPY("copy", 11)
}