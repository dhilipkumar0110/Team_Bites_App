namespace TeamBites.Domain.Entities;

public class OrderLineItem
{
    public Guid Id { get; set; }
    public Guid OrderId { get; set; }
    public Guid? MenuItemId { get; set; }
    public int Quantity { get; set; }

    public Order Order { get; set; } = null!;
    public MenuItem MenuItem { get; set; } = null!;

    public bool IsCustom { get; set; }
    public string? DishName { get; set; }   // filled only when IsCustom = true
    public string? Type { get; set; }

}
