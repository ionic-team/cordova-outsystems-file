import { AppendFileOptions, CopyOptions, DeleteFileOptions, Encoding, MkdirOptions, ReaddirOptions, ReadFileOptions, RmdirOptions, WriteFileOptions } from "./definitions";

export const ReadFileDefaultOptions: ReadFileOptions = {
    path: "",
}

export const WriteFileDefaultOptions: WriteFileOptions = {
    path: "",
    data: "string",
    recursive: true
}

export const AppendFileDefaultOptions: AppendFileOptions = {
    path: "",
    data: ""
}

export const DeleteFileDefaultOptions: DeleteFileOptions = {
    path: ""
}

export const RmdirDefaultOptions: RmdirOptions = {
    path: ""
}

export const MkdirDefaultOptions: MkdirOptions = {
    path: ""
}

export const ReaddirDefaultOptions: ReaddirOptions = {
    path: ""
}

export const CopyDefaultOptions: CopyOptions = {
    from: "",
    to: ""
}