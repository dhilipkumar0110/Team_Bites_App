namespace TeamBites.Domain.Entities;

public class SessionMenuItem
{
    public Guid SessionId { get; set; }
    public Guid MenuItemId { get; set; }

    public OrderSession Session { get; set; } = null!;
    public MenuItem MenuItem { get; set; } = null!;
}
