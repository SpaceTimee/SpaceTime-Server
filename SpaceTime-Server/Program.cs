using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Scalar.AspNetCore;
using System;

WebApplicationBuilder builder = WebApplication.CreateBuilder(args);

builder.AddServiceDefaults();
builder.Services.AddResponseCaching();
builder.Services.AddResponseCompression(static options => options.EnableForHttps = true);
builder.Services.AddRequestTimeouts(static options => options.DefaultPolicy = new() { Timeout = TimeSpan.FromMinutes(10) });
builder.Services.AddDirectoryBrowser();
builder.Services.AddOpenApi();

WebApplication app = builder.Build();

app.UseHttpsRedirection();
app.UseResponseCaching();
app.UseResponseCompression();
app.UseRequestTimeouts();
app.UseFileServer(new FileServerOptions { EnableDirectoryBrowsing = true });
app.MapStaticAssets();
app.MapDefaultEndpoints();
app.MapOpenApi();
app.MapScalarApiReference("/api/");

app.Run();