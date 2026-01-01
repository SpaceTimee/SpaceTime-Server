using Amazon.S3;
using Amazon.S3.Model;
using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.Primitives;
using SpaceTime_Server.Models;
using System;
using System.Collections.Generic;
using System.IO;
using System.Net;
using System.Threading.Tasks;
using FileInfo = SpaceTime_Server.Models.FileInfo;

namespace SpaceTime_Server.Providers;

internal class FileProvider(IAmazonS3 client, string bucketName) : IFileProvider
{
    internal async Task<IDirectoryContents> GetDirectoryContentsAsync(string subpath)
    {
        ListObjectsV2Response response = await client.ListObjectsV2Async(new ListObjectsV2Request { BucketName = bucketName, Prefix = string.IsNullOrEmpty(subpath) ? subpath : $"{subpath}/", Delimiter = "/" });
        List<IFileInfo> itemList = new((response.CommonPrefixes?.Count ?? 0) + (response.S3Objects?.Count ?? 0));

        foreach (string directory in response.CommonPrefixes ?? [])
            itemList.Add(new FileInfo(Path.GetFileName(directory.TrimEnd('/')), true, DateTimeOffset.MinValue, 0));

        foreach (S3Object @object in response.S3Objects ?? [])
        {
            if (@object.Key.TrimEnd('/') == subpath)
                continue;

            itemList.Add(new FileInfo(Path.GetFileName(@object.Key), false, @object.LastModified ?? DateTime.MinValue, @object.Size ?? 0));
        }

        return itemList.Count != 0 ? new DirectoryContents(itemList) : NotFoundDirectoryContents.Singleton;
    }

    public IDirectoryContents GetDirectoryContents(string subpath) => GetDirectoryContentsAsync(subpath).GetAwaiter().GetResult();

    internal async Task<IFileInfo> GetFileInfoAsync(string subpath)
    {
        try
        {
            GetObjectMetadataResponse response = await client.GetObjectMetadataAsync(new GetObjectMetadataRequest { BucketName = bucketName, Key = subpath });

            return new FileInfo(Path.GetFileName(subpath), false, response.LastModified ?? DateTime.MinValue, response.ContentLength);
        }
        catch (AmazonS3Exception ex) when (ex.StatusCode == HttpStatusCode.NotFound)
        {
            ListObjectsV2Response response = await client.ListObjectsV2Async(new ListObjectsV2Request { BucketName = bucketName, Prefix = $"{subpath}/", MaxKeys = 1 });

            return (response.S3Objects?.Count ?? 0) != 0 || (response.CommonPrefixes?.Count ?? 0) != 0 ?
                new FileInfo(Path.GetFileName(subpath), true, DateTimeOffset.MinValue, 0) : new NotFoundFileInfo(Path.GetFileName(subpath));
        }
    }

    public IFileInfo GetFileInfo(string subpath) => GetFileInfoAsync(subpath).GetAwaiter().GetResult();

    public IChangeToken Watch(string filter) => NullChangeToken.Singleton;
}