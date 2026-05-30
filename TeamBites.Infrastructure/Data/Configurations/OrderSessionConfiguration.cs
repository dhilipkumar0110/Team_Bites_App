using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TeamBites.Domain.Entities;

namespace TeamBites.Infrastructure.Data.Configurations;

public class OrderSessionConfiguration : IEntityTypeConfiguration<OrderSession>
{
    public void Configure(EntityTypeBuilder<OrderSession> builder)
    {
        builder.ToTable("OrderSessions");
        builder.HasKey(s => s.Id);
        builder.Property(s => s.Title).HasMaxLength(300).IsRequired();
        builder.Property(s => s.Status).HasConversion<string>().HasMaxLength(16);
        builder.HasOne(s => s.Company).WithMany(c => c.Sessions).HasForeignKey(s => s.CompanyId);
        builder.HasOne(s => s.CreatedByUser).WithMany().HasForeignKey(s => s.CreatedByUserId);
    }
}
