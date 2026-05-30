using TeamBites.Domain.Enums;

namespace TeamBites.Domain.Entities;

public class MenuItem : ITenantEntity
{
    public Guid Id { get; set; }
    public Guid CompanyId { get; set; }
    public string DishName { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public MenuItemType Type { get; set; }
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; }

    public Company Company { get; set; } = null!;
    public ICollection<SessionMenuItem> SessionMenuItems { get; set; } = new List<SessionMenuItem>();
    public ICollection<OrderLineItem> OrderLineItems { get; set; } = new List<OrderLineItem>();
}
