using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TeamBites.Domain.Entities;

namespace TeamBites.Infrastructure.Data.Configurations;

public class SessionMenuItemConfiguration : IEntityTypeConfiguration<SessionMenuItem>
{
    public void Configure(EntityTypeBuilder<SessionMenuItem> builder)
    {
        builder.ToTable("SessionMenuItems");
        builder.HasKey(sm => new { sm.SessionId, sm.MenuItemId });
        builder.HasOne(sm => sm.Session).WithMany(s => s.SessionMenuItems).HasForeignKey(sm => sm.SessionId);
        builder.HasOne(sm => sm.MenuItem).WithMany(m => m.SessionMenuItems).HasForeignKey(sm => sm.MenuItemId);
    }
}
