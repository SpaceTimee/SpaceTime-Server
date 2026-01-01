using Amazon.S3;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Options;
using MimeMapping;
using Scalar.AspNetCore;
using SpaceTime_Server.Models;
using SpaceTime_Server.Providers;
using SpaceTime_Server.Utilities;
using System;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using FileInfo = SpaceTime_Server.Models.FileInfo;

WebApplicationBuilder builder = WebApplication.CreateBuilder(args);

string contentRootPath = builder.Environment.ContentRootPath;

builder.AddServiceDefaults().
    Services.AddResponseCaching().
    AddResponseCompression(static options => options.EnableForHttps = true).
    AddRequestTimeouts(static options => options.DefaultPolicy = new() { Timeout = TimeSpan.FromMinutes(10) }).
    AddDirectoryBrowser().
    AddOpenApi(options => options.AddDocumentTransformer((document, _, _) =>
    {
        document.Info.Title = "SpaceTime Server";
        document.Info.Version = Assembly.GetExecutingAssembly().GetCustomAttribute<AssemblyInformationalVersionAttribute>()!.InformationalVersion;

        return Task.CompletedTask;
    })).
    AddSingleton<IAmazonS3>(provider =>
    {
        StorageOptions options = provider.GetRequiredService<IOptions<StorageOptions>>().Value;

        return new AmazonS3Client(options.AccessKeyId, options.SecretAccessKey, new AmazonS3Config { ServiceURL = options.ServiceUrl });
    }).
    AddOptionsWithValidateOnStart<StorageOptions>().
    BindConfiguration("Storage").
    ValidateDataAnnotations();

WebApplication app = builder.Build();

app.UseHttpsRedirection().
    UseResponseCaching().
    UseResponseCompression().
    UseRequestTimeouts().
    UseStaticFiles(new StaticFileOptions
    {
        FileProvider = new PhysicalFileProvider(Path.Combine(contentRootPath, "Icons")),
        RequestPath = "/icons"
    });

app.MapGet("/files/{*path}", async (string? path, IAmazonS3 client, IOptions<StorageOptions> options) =>
{
    path = path?.Trim('/', ' ') ?? string.Empty;

    FileProvider provider = new(client, options.Value.BucketName);

    return !string.IsNullOrEmpty(path) && await provider.GetFileInfoAsync(path) is FileInfo file && file.Exists && !file.IsDirectory ?
        Results.Redirect($"{options.Value.PublicDomain}/{path}") :
        Results.Content(new StringBuilder(await File.ReadAllTextAsync(Path.Combine(contentRootPath, "Templates", "files.html"))).
        Replace("{{TITLE}}", $"Index of /{path}").
        Replace("{{PATH}}", $"/{path}").
        Replace("{{PARENT_LINK}}", string.IsNullOrEmpty(path) ? "#" : $"/files/{Path.GetDirectoryName(path)?.Replace('\\', '/')}").
        Replace("{{PARENT_DISABLED}}", string.IsNullOrEmpty(path) ? "disabled" : string.Empty).
        Replace("{{FILES_JSON}}", JsonSerializer.Serialize((await provider.GetDirectoryContentsAsync(path)).Select(file =>
        {
            bool isDir = file.IsDirectory;

            return new
            {
                name = file.Name,
                link = $"/files/{(string.IsNullOrEmpty(path) ? string.Empty : $"{path}/")}{file.Name}",
                isDir,
                icon = FileIconResolver.Resolve(isDir ? string.Empty : MimeUtility.GetMimeMapping(file.Name)),
                size = isDir ? "-" : FileSizeFormatter.Format(file.Length),
                date = isDir ? "-" : file.LastModified.ToString("yyyy-MM-dd HH:mm:ss")
            };
        }))).ToString(), "text/html");
}).
WithSummary("Download Files").
WithDescription("Browse directories and download files").
WithTags("Files").
Produces<string>(StatusCodes.Status200OK, "text/html").
Produces(StatusCodes.Status302Found).
ProducesProblem(StatusCodes.Status500InternalServerError);

app.MapGet("/", () => Results.File(Path.Combine(contentRootPath, "Templates", "dashboard.html"), "text/html")).ExcludeFromDescription();
app.MapGet("/favicon.ico", () => Results.File(Path.Combine(contentRootPath, "favicon.ico"), "image/x-icon")).ExcludeFromDescription();
app.MapFallback(() => Results.File(Path.Combine(contentRootPath, "Templates", "dashboard.html"), "text/html"));

app.MapDefaultEndpoints();
app.MapOpenApi();
app.MapScalarApiReference("/api");
app.Run();