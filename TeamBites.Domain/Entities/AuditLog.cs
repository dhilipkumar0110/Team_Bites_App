namespace TeamBites.Domain.Entities;

public class AuditLog
{
    public Guid Id { get; set; }
    public Guid? CompanyId { get; set; }
    public Guid? UserId { get; set; }
    public string Action { get; set; } = string.Empty;
    public string ActorDisplayName { get; set; } = string.Empty;
    public string? CompanyName { get; set; }
    public DateTime Timestamp { get; set; }

    public Company? Company { get; set; }
    public AppUser? User { get; set; }
}
