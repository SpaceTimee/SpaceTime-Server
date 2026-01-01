using Microsoft.Extensions.FileProviders;
using System;
using System.IO;

namespace SpaceTime_Server.Models;

internal sealed class FileInfo(string name, bool isDirectory, DateTimeOffset lastModified, long length) : IFileInfo
{
    public bool Exists => true;
    public long Length => length;
    public string? PhysicalPath => null;
    public string Name => name;
    public DateTimeOffset LastModified => lastModified;
    public bool IsDirectory => isDirectory;

    public Stream CreateReadStream() => throw new NotSupportedException();
}