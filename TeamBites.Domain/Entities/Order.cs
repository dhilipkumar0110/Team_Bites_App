namespace TeamBites.Domain.Entities;

public class Order
{
    public Guid Id { get; set; }
    public Guid SessionId { get; set; }
    public Guid UserId { get; set; }
    public DateTime SubmittedAt { get; set; }

    public OrderSession Session { get; set; } = null!;
    public AppUser User { get; set; } = null!;
    public ICollection<OrderLineItem> LineItems { get; set; } = new List<OrderLineItem>();
}
