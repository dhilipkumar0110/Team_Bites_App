using TeamBites.Application.Interfaces;
using TeamBites.Domain.Entities;
using TeamBites.Infrastructure.Data;

namespace TeamBites.Infrastructure.Services;

public class AuditService
{
    private readonly AppDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public AuditService(AppDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task LogAsync(string action, string? companyName = null, Guid? companyId = null, CancellationToken ct = default)
    {
        var user = _currentUser.UserId.HasValue
            ? await _db.Users.FindAsync([_currentUser.UserId.Value], ct)
            : null;

        _db.AuditLogs.Add(new AuditLog
        {
            Id = Guid.NewGuid(),
            Action = action,
            ActorDisplayName = user?.Name ?? "System",
            UserId = user?.Id,
            CompanyId = companyId ?? user?.CompanyId,
            CompanyName = companyName ?? user?.Company?.Name,
            Timestamp = DateTime.UtcNow
        });
    }
}
