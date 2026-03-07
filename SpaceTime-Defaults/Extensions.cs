using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.Extensions.Logging;
using OpenTelemetry;
using OpenTelemetry.Metrics;
using OpenTelemetry.Trace;

namespace Microsoft.Extensions.Hosting;

public static class Extensions
{
    public static TBuilder AddServiceDefaults<TBuilder>(this TBuilder builder) where TBuilder : IHostApplicationBuilder
    {
        builder.Services.AddLogging(static logging => logging.AddOpenTelemetry(static options => options.IncludeFormattedMessage = options.IncludeScopes = true)).
            AddOpenTelemetry().
            WithMetrics(static metrics => metrics.AddAspNetCoreInstrumentation().AddHttpClientInstrumentation().AddRuntimeInstrumentation()).
            WithTracing(tracing => tracing.AddSource(builder.Environment.ApplicationName).
                AddAspNetCoreInstrumentation(static tracing => tracing.Filter = static context => context.Request.Path.Value is not ("/health" or "/alive")).
                AddHttpClientInstrumentation()).
            Services.AddHealthChecks().
            AddCheck("self", static () => HealthCheckResult.Healthy(), ["live"]).
            Services.AddServiceDiscovery().
            ConfigureHttpClientDefaults(static http =>
            {
                http.AddStandardResilienceHandler();
                http.AddServiceDiscovery();
            });

        if (!string.IsNullOrWhiteSpace(builder.Configuration["OTEL_EXPORTER_OTLP_ENDPOINT"]))
            builder.Services.AddOpenTelemetry().UseOtlpExporter();

        return builder;
    }

    public static WebApplication MapDefaultEndpoints(this WebApplication app)
    {
        app.MapHealthChecks("/health");
        app.MapHealthChecks("/alive", new() { Predicate = static registration => registration.Tags.Contains("live") });

        return app;
    }
}