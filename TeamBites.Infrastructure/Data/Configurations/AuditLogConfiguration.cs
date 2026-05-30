using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TeamBites.Domain.Entities;

namespace TeamBites.Infrastructure.Data.Configurations;

public class AuditLogConfiguration : IEntityTypeConfiguration<AuditLog>
{
    public void Configure(EntityTypeBuilder<AuditLog> builder)
    {
        builder.ToTable("AuditLogs");
        builder.HasKey(a => a.Id);
        builder.Property(a => a.Action).HasMaxLength(500).IsRequired();
        builder.Property(a => a.ActorDisplayName).HasMaxLength(200).IsRequired();
        builder.Property(a => a.CompanyName).HasMaxLength(200);
        builder.HasIndex(a => a.Timestamp);
    }
}
