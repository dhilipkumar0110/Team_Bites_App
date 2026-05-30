namespace TeamBites.Infrastructure.Identity;

public class JwtSettings
{
    public const string SectionName = "Jwt";
    public string Secret { get; set; } = string.Empty;
    public string Issuer { get; set; } = "TeamBites";
    public string Audience { get; set; } = "TeamBites";
    public int ExpirationMinutes { get; set; } = 480;
}
