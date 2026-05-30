using TeamBites.Domain.Enums;

namespace TeamBites.Domain.Entities;

public class Company
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public SubscriptionPlan PlanName { get; set; }
    public int SeatLimit { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? RenewalDate { get; set; }

    public ICollection<AppUser> Users { get; set; } = new List<AppUser>();
    public ICollection<MenuItem> MenuItems { get; set; } = new List<MenuItem>();
    public ICollection<OrderSession> Sessions { get; set; } = new List<OrderSession>();
    public ICollection<AuditLog> AuditLogs { get; set; } = new List<AuditLog>();
}
