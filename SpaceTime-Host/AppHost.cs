using Aspire.Hosting;
using Projects;

IDistributedApplicationBuilder builder = DistributedApplication.CreateBuilder(args);

builder.AddProject<SpaceTime_Server>("spacetime-server");

builder.Build().Run();