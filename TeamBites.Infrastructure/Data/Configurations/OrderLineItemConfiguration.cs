using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TeamBites.Domain.Entities;

namespace TeamBites.Infrastructure.Data.Configurations;

public class OrderLineItemConfiguration : IEntityTypeConfiguration<OrderLineItem>
{
    public void Configure(EntityTypeBuilder<OrderLineItem> builder)
    {
        builder.ToTable("OrderLineItems");
        builder.HasKey(l => l.Id);
        builder.HasOne(l => l.Order).WithMany(o => o.LineItems).HasForeignKey(l => l.OrderId);
        builder.HasOne(l => l.MenuItem).WithMany(m => m.OrderLineItems).HasForeignKey(l => l.MenuItemId);
    }
}
