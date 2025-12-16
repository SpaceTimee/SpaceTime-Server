var builder = DistributedApplication.CreateBuilder(args);

builder.AddProject<Projects.SpaceTime_Server_Server>("spacetime-server-server");

builder.Build().Run();
