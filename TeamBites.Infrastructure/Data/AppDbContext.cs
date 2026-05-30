using Microsoft.EntityFrameworkCore;
using TeamBites.Application.Interfaces;
using TeamBites.Domain.Entities;

namespace TeamBites.Infrastructure.Data;

public class AppDbContext : DbContext
{
    private readonly Guid? _tenantId;
    private readonly bool _isSuperAdmin;

    public AppDbContext(DbContextOptions<AppDbContext> options, ICurrentUserService currentUser)
        : base(options)
    {
        _tenantId = currentUser.CompanyId;
        _isSuperAdmin = currentUser.IsSuperAdmin;
    }

    public DbSet<Company> Companies => Set<Company>();
    public DbSet<AppUser> Users => Set<AppUser>();
    public DbSet<MenuItem> MenuItems => Set<MenuItem>();
    public DbSet<OrderSession> Sessions => Set<OrderSession>();
    public DbSet<SessionMenuItem> SessionMenuItems => Set<SessionMenuItem>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderLineItem> OrderLineItems => Set<OrderLineItem>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);

        modelBuilder.Entity<MenuItem>().HasQueryFilter(e =>
            _isSuperAdmin || (_tenantId != null && e.CompanyId == _tenantId));

        modelBuilder.Entity<OrderSession>().HasQueryFilter(e =>
            _isSuperAdmin || (_tenantId != null && e.CompanyId == _tenantId));

        modelBuilder.Entity<Order>().HasQueryFilter(o =>
            _isSuperAdmin || (_tenantId != null && o.Session.CompanyId == _tenantId));

        base.OnModelCreating(modelBuilder);
    }
}
