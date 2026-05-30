using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TeamBites.Domain.Entities;

namespace TeamBites.Infrastructure.Data.Configurations;

public class MenuItemConfiguration : IEntityTypeConfiguration<MenuItem>
{
    public void Configure(EntityTypeBuilder<MenuItem> builder)
    {
        builder.ToTable("MenuItems");
        builder.HasKey(m => m.Id);
        builder.Property(m => m.DishName).HasMaxLength(200).IsRequired();
        builder.Property(m => m.Category).HasMaxLength(100).IsRequired();
        builder.Property(m => m.Type).HasConversion<string>().HasMaxLength(16);
        builder.Property(m => m.Description).HasMaxLength(500);
        builder.HasOne(m => m.Company).WithMany(c => c.MenuItems).HasForeignKey(m => m.CompanyId);
    }
}
