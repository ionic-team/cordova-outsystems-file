# FilesystemPlugin - Cordova

*This plugin is SUPPORTED by OutSystems. Customers entitled to Support Services may obtain assistance through Support.*

## Installation

```console
cordova plugin add <path-to-repo-local-clone>
```

## API

<docgen-index>

* [`readFile(...)`](#readfile)
* [`readFileInChunks(...)`](#readfileinchunks)
* [`writeFile(...)`](#writefile)
* [`appendFile(...)`](#appendfile)
* [`deleteFile(...)`](#deletefile)
* [`mkdir(...)`](#mkdir)
* [`rmdir(...)`](#rmdir)
* [`readdir(...)`](#readdir)
* [`getUri(...)`](#geturi)
* [`stat(...)`](#stat)
* [`rename(...)`](#rename)
* [`copy(...)`](#copy)
* [Interfaces](#interfaces)
* [Type Aliases](#type-aliases)
* [Enums](#enums)

</docgen-index>

<docgen-api>
<!--Update the source file JSDoc comments and rerun docgen to update the docs below-->

### readFile(...)

```typescript
readFile(options: ReadFileOptions) => Promise<ReadFileResult>
```

Read a file from disk

| Param         | Type                                                        |
| ------------- | ----------------------------------------------------------- |
| **`options`** | <code><a href="#readfileoptions">ReadFileOptions</a></code> |

**Returns:** <code>Promise&lt;<a href="#readfileresult">ReadFileResult</a>&gt;</code>

**Since:** 1.0.0

--------------------


### readFileInChunks(...)

```typescript
readFileInChunks(options: ReadFileInChunksOptions, success: (chunkRead: ReadFileResult) => void, error: (error: PluginError) => void) => Promise<void>
```

Read a file from disk, in chunks.
Native only (not available in web).
Use the callback to receive each read chunk.
If empty chunk is returned, it means file has been completely read.

| Param         | Type                                                                              |
| ------------- | --------------------------------------------------------------------------------- |
| **`options`** | <code><a href="#readfileinchunksoptions">ReadFileInChunksOptions</a></code>       |
| **`success`** | <code>(chunkRead: <a href="#readfileresult">ReadFileResult</a>) =&gt; void</code> |
| **`error`**   | <code>(error: <a href="#pluginerror">PluginError</a>) =&gt; void</code>           |

**Since:** 1.0.0

--------------------


### writeFile(...)

```typescript
writeFile(options: WriteFileOptions) => Promise<WriteFileResult>
```

Write a file to disk in the specified location on device

| Param         | Type                                                          |
| ------------- | ------------------------------------------------------------- |
| **`options`** | <code><a href="#writefileoptions">WriteFileOptions</a></code> |

**Returns:** <code>Promise&lt;<a href="#writefileresult">WriteFileResult</a>&gt;</code>

**Since:** 1.0.0

--------------------


### appendFile(...)

```typescript
appendFile(options: AppendFileOptions) => Promise<void>
```

Append to a file on disk in the specified location on device

| Param         | Type                                                            |
| ------------- | --------------------------------------------------------------- |
| **`options`** | <code><a href="#appendfileoptions">AppendFileOptions</a></code> |

**Since:** 1.0.0

--------------------


### deleteFile(...)

```typescript
deleteFile(options: DeleteFileOptions) => Promise<void>
```

Delete a file from disk

| Param         | Type                                                            |
| ------------- | --------------------------------------------------------------- |
| **`options`** | <code><a href="#deletefileoptions">DeleteFileOptions</a></code> |

**Since:** 1.0.0

--------------------


### mkdir(...)

```typescript
mkdir(options: MkdirOptions) => Promise<void>
```

Create a directory.

| Param         | Type                                                  |
| ------------- | ----------------------------------------------------- |
| **`options`** | <code><a href="#mkdiroptions">MkdirOptions</a></code> |

**Since:** 1.0.0

--------------------


### rmdir(...)

```typescript
rmdir(options: RmdirOptions) => Promise<void>
```

Remove a directory

| Param         | Type                                                  |
| ------------- | ----------------------------------------------------- |
| **`options`** | <code><a href="#rmdiroptions">RmdirOptions</a></code> |

**Since:** 1.0.0

--------------------


### readdir(...)

```typescript
readdir(options: ReaddirOptions) => Promise<ReaddirResult>
```

Return a list of files from the directory (not recursive)

| Param         | Type                                                      |
| ------------- | --------------------------------------------------------- |
| **`options`** | <code><a href="#readdiroptions">ReaddirOptions</a></code> |

**Returns:** <code>Promise&lt;<a href="#readdirresult">ReaddirResult</a>&gt;</code>

**Since:** 1.0.0

--------------------


### getUri(...)

```typescript
getUri(options: GetUriOptions) => Promise<GetUriResult>
```

Return full File URI for a path and directory

| Param         | Type                                                    |
| ------------- | ------------------------------------------------------- |
| **`options`** | <code><a href="#geturioptions">GetUriOptions</a></code> |

**Returns:** <code>Promise&lt;<a href="#geturiresult">GetUriResult</a>&gt;</code>

**Since:** 1.0.0

--------------------


### stat(...)

```typescript
stat(options: StatOptions) => Promise<StatResult>
```

Return data about a file

| Param         | Type                                                |
| ------------- | --------------------------------------------------- |
| **`options`** | <code><a href="#statoptions">StatOptions</a></code> |

**Returns:** <code>Promise&lt;<a href="#fileinfo">FileInfo</a>&gt;</code>

**Since:** 1.0.0

--------------------


### rename(...)

```typescript
rename(options: RenameOptions) => Promise<void>
```

Rename a file or directory

| Param         | Type                                                |
| ------------- | --------------------------------------------------- |
| **`options`** | <code><a href="#copyoptions">CopyOptions</a></code> |

**Since:** 1.0.0

--------------------


### copy(...)

```typescript
copy(options: CopyOptions) => Promise<CopyResult>
```

Copy a file or directory

| Param         | Type                                                |
| ------------- | --------------------------------------------------- |
| **`options`** | <code><a href="#copyoptions">CopyOptions</a></code> |

**Returns:** <code>Promise&lt;<a href="#copyresult">CopyResult</a>&gt;</code>

**Since:** 1.0.0

--------------------


### Interfaces


#### ReadFileResult

| Prop       | Type                        | Description                                                                                                                            | Since |
| ---------- | --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ----- |
| **`data`** | <code>string \| Blob</code> | The representation of the data contained in the file Note: Blob is only available on Web. On native, the data is returned as a string. | 1.0.0 |


#### ReadFileOptions

| Prop            | Type                                            | Description                                                                                                                                                                 | Since |
| --------------- | ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- |
| **`path`**      | <code>string</code>                             | The path of the file to read                                                                                                                                                | 1.0.0 |
| **`directory`** | <code><a href="#directory">Directory</a></code> | The <a href="#directory">`Directory`</a> to read the file from                                                                                                              | 1.0.0 |
| **`encoding`**  | <code><a href="#encoding">Encoding</a></code>   | The encoding to read the file in, if not provided, data is read as binary and returned as base64 encoded. Pass <a href="#encoding">Encoding.UTF8</a> to read data as string | 1.0.0 |


#### ReadFileInChunksOptions

| Prop            | Type                | Description                                     | Since |
| --------------- | ------------------- | ----------------------------------------------- | ----- |
| **`chunkSize`** | <code>number</code> | Size of the chunks to read at a time, in bytes. | 1.0.0 |


#### WriteFileResult

| Prop      | Type                | Description                             | Since |
| --------- | ------------------- | --------------------------------------- | ----- |
| **`uri`** | <code>string</code> | The uri where the file was written into | 1.0.0 |


#### WriteFileOptions

| Prop            | Type                                            | Description                                                                                                                                               | Default            | Since |
| --------------- | ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ | ----- |
| **`path`**      | <code>string</code>                             | The path of the file to write                                                                                                                             |                    | 1.0.0 |
| **`data`**      | <code>string \| Blob</code>                     | The data to write Note: Blob data is only supported on Web.                                                                                               |                    | 1.0.0 |
| **`directory`** | <code><a href="#directory">Directory</a></code> | The <a href="#directory">`Directory`</a> to store the file in                                                                                             |                    | 1.0.0 |
| **`encoding`**  | <code><a href="#encoding">Encoding</a></code>   | The encoding to write the file in. If not provided, data is written as base64 encoded. Pass <a href="#encoding">Encoding.UTF8</a> to write data as string |                    | 1.0.0 |
| **`recursive`** | <code>boolean</code>                            | Whether to create any missing parent directories.                                                                                                         | <code>false</code> | 1.0.0 |


#### AppendFileOptions

| Prop            | Type                                            | Description                                                                                                                                               | Since |
| --------------- | ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- |
| **`path`**      | <code>string</code>                             | The path of the file to append                                                                                                                            | 1.0.0 |
| **`data`**      | <code>string</code>                             | The data to write                                                                                                                                         | 1.0.0 |
| **`directory`** | <code><a href="#directory">Directory</a></code> | The <a href="#directory">`Directory`</a> to store the file in                                                                                             | 1.0.0 |
| **`encoding`**  | <code><a href="#encoding">Encoding</a></code>   | The encoding to write the file in. If not provided, data is written as base64 encoded. Pass <a href="#encoding">Encoding.UTF8</a> to write data as string | 1.0.0 |


#### DeleteFileOptions

| Prop            | Type                                            | Description                                                      | Since |
| --------------- | ----------------------------------------------- | ---------------------------------------------------------------- | ----- |
| **`path`**      | <code>string</code>                             | The path of the file to delete                                   | 1.0.0 |
| **`directory`** | <code><a href="#directory">Directory</a></code> | The <a href="#directory">`Directory`</a> to delete the file from | 1.0.0 |


#### MkdirOptions

| Prop            | Type                                            | Description                                                           | Default            | Since |
| --------------- | ----------------------------------------------- | --------------------------------------------------------------------- | ------------------ | ----- |
| **`path`**      | <code>string</code>                             | The path of the new directory                                         |                    | 1.0.0 |
| **`directory`** | <code><a href="#directory">Directory</a></code> | The <a href="#directory">`Directory`</a> to make the new directory in |                    | 1.0.0 |
| **`recursive`** | <code>boolean</code>                            | Whether to create any missing parent directories as well.             | <code>false</code> | 1.0.0 |


#### RmdirOptions

| Prop            | Type                                            | Description                                                           | Default            | Since |
| --------------- | ----------------------------------------------- | --------------------------------------------------------------------- | ------------------ | ----- |
| **`path`**      | <code>string</code>                             | The path of the directory to remove                                   |                    | 1.0.0 |
| **`directory`** | <code><a href="#directory">Directory</a></code> | The <a href="#directory">`Directory`</a> to remove the directory from |                    | 1.0.0 |
| **`recursive`** | <code>boolean</code>                            | Whether to recursively remove the contents of the directory           | <code>false</code> | 1.0.0 |


#### ReaddirResult

| Prop        | Type                    | Description                                        | Since |
| ----------- | ----------------------- | -------------------------------------------------- | ----- |
| **`files`** | <code>FileInfo[]</code> | List of files and directories inside the directory | 1.0.0 |


#### FileInfo

| Prop        | Type                               | Description                                                                          | Since |
| ----------- | ---------------------------------- | ------------------------------------------------------------------------------------ | ----- |
| **`name`**  | <code>string</code>                | Name of the file or directory.                                                       |       |
| **`type`**  | <code>'directory' \| 'file'</code> | Type of the file.                                                                    | 1.0.0 |
| **`size`**  | <code>number</code>                | Size of the file in bytes.                                                           | 1.0.0 |
| **`ctime`** | <code>number</code>                | Time of creation in milliseconds. It's not available on Android 7 and older devices. | 1.0.0 |
| **`mtime`** | <code>number</code>                | Time of last modification in milliseconds.                                           | 1.0.0 |
| **`uri`**   | <code>string</code>                | The uri of the file.                                                                 | 1.0.0 |


#### ReaddirOptions

| Prop            | Type                                            | Description                                                 | Since |
| --------------- | ----------------------------------------------- | ----------------------------------------------------------- | ----- |
| **`path`**      | <code>string</code>                             | The path of the directory to read                           | 1.0.0 |
| **`directory`** | <code><a href="#directory">Directory</a></code> | The <a href="#directory">`Directory`</a> to list files from | 1.0.0 |


#### GetUriResult

| Prop      | Type                | Description         | Since |
| --------- | ------------------- | ------------------- | ----- |
| **`uri`** | <code>string</code> | The uri of the file | 1.0.0 |


#### GetUriOptions

| Prop            | Type                                            | Description                                                    | Since |
| --------------- | ----------------------------------------------- | -------------------------------------------------------------- | ----- |
| **`path`**      | <code>string</code>                             | The path of the file to get the URI for                        | 1.0.0 |
| **`directory`** | <code><a href="#directory">Directory</a></code> | The <a href="#directory">`Directory`</a> to get the file under | 1.0.0 |


#### StatOptions

| Prop            | Type                                            | Description                                                    | Since |
| --------------- | ----------------------------------------------- | -------------------------------------------------------------- | ----- |
| **`path`**      | <code>string</code>                             | The path of the file to get data about                         | 1.0.0 |
| **`directory`** | <code><a href="#directory">Directory</a></code> | The <a href="#directory">`Directory`</a> to get the file under | 1.0.0 |


#### CopyOptions

| Prop              | Type                                            | Description                                                                                                                                                  | Since |
| ----------------- | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----- |
| **`from`**        | <code>string</code>                             | The existing file or directory                                                                                                                               | 1.0.0 |
| **`to`**          | <code>string</code>                             | The destination file or directory                                                                                                                            | 1.0.0 |
| **`directory`**   | <code><a href="#directory">Directory</a></code> | The <a href="#directory">`Directory`</a> containing the existing file or directory                                                                           | 1.0.0 |
| **`toDirectory`** | <code><a href="#directory">Directory</a></code> | The <a href="#directory">`Directory`</a> containing the destination file or directory. If not supplied will use the 'directory' parameter as the destination | 1.0.0 |


#### CopyResult

| Prop      | Type                | Description                            | Since |
| --------- | ------------------- | -------------------------------------- | ----- |
| **`uri`** | <code>string</code> | The uri where the file was copied into | 1.0.0 |


### Type Aliases


#### PluginError

<code>{ code: string, message: string }</code>


#### StatResult

<code><a href="#fileinfo">FileInfo</a></code>


#### RenameOptions

<code><a href="#copyoptions">CopyOptions</a></code>


### Enums


#### Directory

| Members               | Value                           | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | Since |
| --------------------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----- |
| **`Documents`**       | <code>'DOCUMENTS'</code>        | The Documents directory. On iOS it's the app's documents directory. Use this directory to store user-generated content. On Android it's the Public Documents folder, so it's accessible from other apps. It's not accessible on Android 10 unless the app enables legacy External Storage by adding `android:requestLegacyExternalStorage="true"` in the `application` tag in the `AndroidManifest.xml`. On Android 11 or newer the app can only access the files/folders the app created. | 1.0.0 |
| **`Data`**            | <code>'DATA'</code>             | The Data directory. On iOS it will use the Documents directory. On Android it's the directory holding application files. Files will be deleted when the application is uninstalled.                                                                                                                                                                                                                                                                                                        | 1.0.0 |
| **`Library`**         | <code>'LIBRARY'</code>          | The Library directory. On iOS it will use the Library directory. On Android it's the directory holding application files. Files will be deleted when the application is uninstalled.                                                                                                                                                                                                                                                                                                       | 1.0.0 |
| **`Cache`**           | <code>'CACHE'</code>            | The Cache directory. Can be deleted in cases of low memory, so use this directory to write app-specific files. that your app can re-create easily.                                                                                                                                                                                                                                                                                                                                         | 1.0.0 |
| **`External`**        | <code>'EXTERNAL'</code>         | The external directory. On iOS it will use the Documents directory. On Android it's the directory on the primary shared/external storage device where the application can place persistent files it owns. These files are internal to the applications, and not typically visible to the user as media. Files will be deleted when the application is uninstalled.                                                                                                                         | 1.0.0 |
| **`ExternalStorage`** | <code>'EXTERNAL_STORAGE'</code> | The external storage directory. On iOS it will use the Documents directory. On Android it's the primary shared/external storage directory. It's not accessible on Android 10 unless the app enables legacy External Storage by adding `android:requestLegacyExternalStorage="true"` in the `application` tag in the `AndroidManifest.xml`. It's not accessible on Android 11 or newer.                                                                                                     | 1.0.0 |
| **`ExternalCache`**   | <code>'EXTERNAL_CACHE'</code>   | The external cache directory. On iOS it will use the Documents directory. On Android it's the primary shared/external cache.                                                                                                                                                                                                                                                                                                                                                               | 1.0.0 |
| **`LibraryNoCloud`**  | <code>'LIBRARY_NO_CLOUD'</code> | The Library directory without cloud backup. Used in iOS. On Android it's the directory holding application files.                                                                                                                                                                                                                                                                                                                                                                          | 1.0.0 |
| **`Temporary`**       | <code>'TEMPORARY'</code>        | A temporary directory for iOS. On Android it's the directory holding the application cache.                                                                                                                                                                                                                                                                                                                                                                                                | 1.0.0 |


#### Encoding

| Members     | Value                | Description                                                                                                                              | Since |
| ----------- | -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ----- |
| **`UTF8`**  | <code>'utf8'</code>  | Eight-bit UCS Transformation Format                                                                                                      | 1.0.0 |
| **`ASCII`** | <code>'ascii'</code> | Seven-bit ASCII, a.k.a. ISO646-US, a.k.a. the Basic Latin block of the Unicode character set This encoding is only supported on Android. | 1.0.0 |
| **`UTF16`** | <code>'utf16'</code> | Sixteen-bit UCS Transformation Format, byte order identified by an optional byte-order mark This encoding is only supported on Android.  | 1.0.0 |

</docgen-api>