using System;
using System.IO;
using System.IO.Enumeration;
using System.Linq;
using System.Net.Http;
using System.Text.Json;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using File = System.IO.File;
using Http = OnaCore.Http;

HttpClient MainClient = new();

WebApplicationBuilder builder = WebApplication.CreateBuilder(args);
builder.Services.AddResponseCaching();
builder.Services.AddResponseCompression(options => { options.EnableForHttps = true; });
builder.Services.AddRequestTimeouts(options => { options.DefaultPolicy = new() { Timeout = TimeSpan.FromMinutes(10) }; });
builder.Services.AddDirectoryBrowser();
builder.Services.AddOpenApi("API");

WebApplication app = builder.Build();
app.UseHttpsRedirection();
app.UseResponseCaching();
app.UseResponseCompression();
app.UseRequestTimeouts();
app.UseFileServer(true);
app.MapOpenApi("/private/{documentName}.json");
app.UseSwaggerUI(options =>
{
    options.SwaggerEndpoint("/private/API.json", "API");
    options.RoutePrefix = "api";
    options.DocumentTitle = "SpaceTime Server API";
});

app.MapGet("/api/generate", async (string domain = "wikipedia.org") =>
{
    string generateDomain = domain.Replace("http://", string.Empty).Replace("https://", string.Empty).Trim().TrimEnd('/');

    if (JsonDocument.Parse(await Http.GetAsync<string>($"https://ns.net.kg/dns-query?name={generateDomain}", MainClient)).RootElement.TryGetProperty("Answer", out JsonElement arashiAnswers))
        return $@"[[""*{generateDomain}""],"""",""{arashiAnswers.EnumerateArray().Last().GetProperty("data")}""]";
    else
        return "生不出来，我很抱歉";
});
app.MapGet("/api/search", (IWebHostEnvironment env, string domain = "wikipedia.org") =>
{
    using FileStream hostStream = new(Path.Combine(env.WebRootPath, "files", "Cealing-Host.json"), FileMode.OpenOrCreate, FileAccess.Read, FileShare.ReadWrite | FileShare.Delete);
    JsonDocumentOptions hostOptions = new() { AllowTrailingCommas = true, CommentHandling = JsonCommentHandling.Skip };
    JsonElement hostArray = JsonDocument.Parse(hostStream, hostOptions).RootElement;
    string searchDomain = domain.Replace("http://", string.Empty).Replace("https://", string.Empty).Trim().TrimEnd('/');

    foreach (JsonElement hostItem in hostArray.EnumerateArray())
        foreach (JsonElement hostName in hostItem[0].EnumerateArray())
            if (FileSystemName.MatchesSimpleExpression(hostName.ToString(), searchDomain))
                return hostItem.ToString();

    return "没有找到匹配的规则哦";
});
app.MapGet("/api/check", () =>
{
    int transPathIndex = Array.FindIndex(args, arg => arg.Equals("-t", StringComparison.OrdinalIgnoreCase)) + 1;
    string transPath = transPathIndex == 0 || transPathIndex == args.Length ? Path.Combine(AppDomain.CurrentDomain.SetupInformation.ApplicationBase!, "Trans.log") : args[transPathIndex];

    return File.ReadAllText(transPath);
});
app.MapGet("/api/download", (IWebHostEnvironment env, string? mime, string? name, string file = "Cealing-Host.json") =>
{
    string filePath = new(Path.Combine(env.WebRootPath, "files", file));

    if (File.Exists(filePath))
        return Results.File(filePath, mime, name);
    else
        return Results.NotFound();
});
app.MapGet("/api/download/{file}", (IWebHostEnvironment env, string? mime, string? name, string file) =>
{
    string filePath = new(Path.Combine(env.WebRootPath, "files", file));

    if (File.Exists(filePath))
        return Results.File(filePath, mime, name);
    else
        return Results.NotFound();
});

app.Run();