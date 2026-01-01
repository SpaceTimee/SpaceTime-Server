using System;

namespace SpaceTime_Server.Utilities;

internal static class FileIconResolver
{
    internal static string Resolve(string mime) => string.IsNullOrEmpty(mime) ? "icon-folder" : mime switch
    {
        _ when mime.StartsWith("image/", StringComparison.Ordinal) => "icon-image",
        _ when mime.StartsWith("video/", StringComparison.Ordinal) || mime is "application/mp4" => "icon-video",
        _ when mime.StartsWith("audio/", StringComparison.Ordinal) => "icon-audio",
        _ when mime is "application/zip" or "application/gzip" or "application/x-gzip"
            or "application/x-tar" or "application/x-bzip2" or "application/x-xz"
            or "application/x-7z-compressed" or "application/x-rar-compressed" or "application/vnd.rar"
            or "application/java-archive" or "application/vnd.android.package-archive"
            or "application/x-apple-diskimage" or "application/x-iso9660-image" => "icon-archive",
        _ when mime is "text/html" or "text/css" or "text/xml"
            or "text/javascript" or "text/ecmascript" or "text/typescript"
            or "text/x-python" or "text/x-java" or "text/x-c" or "text/x-csrc" or "text/x-c++" or "text/x-c++src"
            or "text/x-csharp" or "text/x-go" or "text/x-rust" or "text/x-php" or "text/x-ruby"
            or "text/x-swift" or "text/x-kotlin" or "text/x-scala" or "text/x-perl" or "text/x-r"
            or "text/x-lua" or "text/x-dart" or "text/x-sh" or "text/x-shellscript" or "text/x-powershell"
            or "application/javascript" or "application/ecmascript" or "application/typescript"
            or "application/json" or "application/xml" or "application/yaml" or "application/toml"
            or "application/sql" or "application/wasm"
            or "application/x-python" or "application/x-perl" or "application/x-ruby"
            or "application/x-httpd-php" or "application/x-sh" or "application/x-powershell" => "icon-code",
        _ when mime.StartsWith("text/", StringComparison.Ordinal) => "icon-text",
        _ => "icon-file"
    };
}
