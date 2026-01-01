using System.ComponentModel.DataAnnotations;

namespace SpaceTime_Server.Models;

internal sealed class StorageOptions
{
    [Required]
    public string AccessKeyId { get; set; } = null!;

    [Required]
    public string SecretAccessKey { get; set; } = null!;

    [Required]
    public string ServiceUrl { get; set; } = null!;

    [Required]
    public string BucketName { get; set; } = null!;

    [Required]
    public string PublicDomain { get; set; } = null!;
}