# 请参阅 https://aka.ms/customizecontainer 以了解如何自定义调试容器，以及 Visual Studio 如何使用此 Dockerfile 生成映像以更快地进行调试。

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
USER $APP_UID
WORKDIR /app
EXPOSE 8080
EXPOSE 8081

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS publish
WORKDIR /src
COPY ["SpaceTime-Defaults/SpaceTime-Defaults.csproj", "SpaceTime-Defaults/"]
COPY ["SpaceTime-Server/SpaceTime-Server.csproj", "SpaceTime-Server/"]
RUN dotnet restore "./SpaceTime-Server/SpaceTime-Server.csproj"
COPY . .
WORKDIR "/src/SpaceTime-Server"
RUN dotnet publish "./SpaceTime-Server.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "SpaceTime-Server.dll"]