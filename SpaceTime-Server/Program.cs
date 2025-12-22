using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Scalar.AspNetCore;
using System;
using System.IO;
using System.Reflection;
using System.Threading.Tasks;

WebApplicationBuilder builder = WebApplication.CreateBuilder(args);

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
    }));

WebApplication app = builder.Build();

app.UseHttpsRedirection().
    UseResponseCaching().
    UseResponseCompression().
    UseRequestTimeouts().
    UseFileServer(new FileServerOptions
    {
        RequestPath = "/files",
        EnableDirectoryBrowsing = true
    });


app.MapGet("/", () => Results.File(Path.Combine(builder.Environment.ContentRootPath, "dashboard.html"), "text/html")).ExcludeFromDescription();
app.MapGet("/favicon.ico", () => Results.File(Path.Combine(builder.Environment.ContentRootPath, "favicon.ico"), "image/x-icon")).ExcludeFromDescription();

app.MapStaticAssets();
app.MapDefaultEndpoints();
app.MapOpenApi();
app.MapScalarApiReference("/api");
app.Run();