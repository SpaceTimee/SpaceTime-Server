using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Scalar.AspNetCore;
using System;

WebApplicationBuilder builder = WebApplication.CreateBuilder(args);

builder.AddServiceDefaults().
    Services.AddResponseCaching().
    AddResponseCompression(static options => options.EnableForHttps = true).
    AddRequestTimeouts(static options => options.DefaultPolicy = new() { Timeout = TimeSpan.FromMinutes(10) }).
    AddDirectoryBrowser().
    AddOpenApi();

WebApplication app = builder.Build();

app.UseHttpsRedirection().
    UseResponseCaching().
    UseResponseCompression().
    UseRequestTimeouts().
    UseFileServer(new FileServerOptions { EnableDirectoryBrowsing = true });

app.MapStaticAssets();
app.MapDefaultEndpoints();
app.MapOpenApi();
app.MapScalarApiReference("/api/");
app.Run();