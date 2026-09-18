// swift-tools-version:5.9
import PackageDescription

let package = Package(
    name: "com.outsystems.plugins.filesystem",
    platforms: [
        .iOS(.v15)
    ],
    products: [
        .library(
            name: "com.outsystems.plugins.filesystem",
            targets: ["OSFilePlugin"]
        )
    ],
    dependencies: [
        .package(url: "https://github.com/apache/cordova-ios.git", branch: "master"),
        .package(url: "https://github.com/ionic-team/ion-ios-filesystem.git", exact: "2.0.0")
    ],
    targets: [
        .target(
            name: "OSFilePlugin",
            dependencies: [
                .product(name: "Cordova", package: "cordova-ios"),
                .product(name: "IONFilesystemLib", package: "ion-ios-filesystem")
            ],
            path: "packages/cordova-plugin/ios"
        )
    ]
)
