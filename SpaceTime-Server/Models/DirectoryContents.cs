using Microsoft.Extensions.FileProviders;
using System.Collections;
using System.Collections.Generic;

namespace SpaceTime_Server.Models;

internal sealed class DirectoryContents(IEnumerable<IFileInfo> items) : IDirectoryContents
{
    public bool Exists => true;

    public IEnumerator<IFileInfo> GetEnumerator() => items.GetEnumerator();

    IEnumerator IEnumerable.GetEnumerator() => GetEnumerator();
}