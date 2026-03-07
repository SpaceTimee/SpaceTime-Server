using System;

namespace SpaceTime_Server.Utilities;

internal static class FileIconResolver
{
    internal static string Resolve(string mime) => string.IsNullOrEmpty(mime) ? "icon-folder" : mime switch
    {
        _ when mime.StartsWith("image/", StringComparison.Ordinal)
            || mime is "application/postscript" => "icon-image",

        _ when mime.StartsWith("video/", StringComparison.Ordinal)
            || mime is "application/mp4" or "application/vnd.rn-realmedia" or "application/vnd.rn-realmedia-vbr"
            or "application/x-shockwave-flash" or "model/vnd.mts" => "icon-video",

        _ when mime.StartsWith("audio/", StringComparison.Ordinal) => "icon-audio",

        "application/zip" or "application/gzip"
            or "application/x-tar" or "application/x-bzip" or "application/x-bzip2" or "application/x-xz"
            or "application/x-7z-compressed" or "application/vnd.rar"
            or "application/java-archive" or "application/vnd.android.package-archive"
            or "application/vnd.ms-cab-compressed" or "application/x-redhat-package-manager"
            or "application/appx" or "application/msix"
            or "application/x-debian-package" or "application/x-freearc" => "icon-archive",

        "text/html" or "text/css"
            or "text/javascript" or "text/jsx" or "text/coffeescript" or "text/x-java-source" or "text/x-asm" or "text/yaml"
            or "application/javascript" or "application/ecmascript"
            or "application/json" or "application/ld+json" or "application/xml" or "application/toml"
            or "application/sql" or "application/wasm"
            or "application/x-perl" or "application/x-httpd-php" or "application/x-sh" or "application/x-csh"
            or "application/java-vm" or "application/vnd.dart" or "application/x-msdownload" => "icon-code",

        _ when mime.StartsWith("text/", StringComparison.Ordinal)
            || mime is "application/rtf" or "application/x-subrip" => "icon-text",

        _ => "icon-file"
    };
}