using TeamBites.Domain.Enums;

namespace TeamBites.Domain.Entities;

public class OrderSession : ITenantEntity
{
    public Guid Id { get; set; }
    public Guid CompanyId { get; set; }
    public string Title { get; set; } = string.Empty;
    public DateTime Deadline { get; set; }
    public SessionStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
    public Guid CreatedByUserId { get; set; }

    public Company Company { get; set; } = null!;
    public AppUser CreatedByUser { get; set; } = null!;
    public ICollection<SessionMenuItem> SessionMenuItems { get; set; } = new List<SessionMenuItem>();
    public ICollection<Order> Orders { get; set; } = new List<Order>();
}
