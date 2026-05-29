## [1.1.1]

### Fixes

- **iOS**: Bump `IONFilesystemLib` to `1.1.2` to fix inconsistent error codes when file is missing.

## [1.1.0]

### 21-01-2026

### Feature

- Allow reading parts of a file with `offset` and `length`.

## [1.0.3]

### 13-01-2026

### Chores

- **android**: Remove unused dependencies to `oscore` and `oscordova`.

## [1.0.2]

### 01-09-2025

### Fixes

- **iOS** Do not add trailing slash to files
- Usage of Synapse in OutSystems wrapper.

## [1.0.1]

### 27-05-2025

- Fix: Duplicated `Constants` struct build error on iOS.

## [1.0.0]

### 26-05-2025

- Feat: Implement plugin methods: `readFile`, `readFileInChunks`, `writeFile`, `appendFile`, `deleteFile`, `mkdir`, `rmdir`, `readdir`, `getUri`, `stat`, `rename`, `copy`.