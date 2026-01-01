namespace SpaceTime_Server.Utilities;

internal static class FileSizeFormatter
{
    private static readonly string[] UnitArray = ["B", "KB", "MB", "GB", "TB"];

    internal static string Format(double size)
    {
        int unitIndex = 0;

        while (size >= 1024 && unitIndex < UnitArray.Length - 1)
        {
            size /= 1024;
            unitIndex++;
        }

        return $"{size:0.##} {UnitArray[unitIndex]}";
    }
}