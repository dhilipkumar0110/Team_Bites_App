using Microsoft.EntityFrameworkCore;
using TeamBites.Application.DTOs;
using TeamBites.Application.Interfaces;
using TeamBites.Domain.Entities;
using TeamBites.Domain.Enums;
using TeamBites.Infrastructure.Data;
using TeamBites.Infrastructure.Mapping;

namespace TeamBites.Infrastructure.Services;

public class SessionService : ISessionService
{
    private readonly AppDbContext _db;
    private readonly ICurrentUserService _currentUser;
    private readonly AuditService _audit;

    public SessionService(AppDbContext db, ICurrentUserService currentUser, AuditService audit)
    {
        _db = db;
        _currentUser = currentUser;
        _audit = audit;
    }

    public async Task<SessionDto> CreateSessionAsync(CreateSessionRequest request, CancellationToken cancellationToken = default)
    {
        if (_currentUser.CompanyId is null || _currentUser.UserId is null)
            throw new InvalidOperationException("Company context required.");

        var menuIds = request.MenuItemIds.Distinct().ToList();
        var validCount = await _db.MenuItems.CountAsync(m => menuIds.Contains(m.Id), cancellationToken);
        if (validCount != menuIds.Count)
            throw new InvalidOperationException("One or more menu items are invalid.");

        var session = new OrderSession
        {
            Id = Guid.NewGuid(),
            CompanyId = _currentUser.CompanyId.Value,
            Title = request.Title.Trim(),
            Deadline = request.Deadline.ToUniversalTime(),
            Status = SessionStatus.Open,
            CreatedAt = DateTime.UtcNow,
            CreatedByUserId = _currentUser.UserId.Value,
            SessionMenuItems = menuIds.Select(id => new SessionMenuItem { MenuItemId = id }).ToList()
        };

        foreach (var sm in session.SessionMenuItems)
            sm.SessionId = session.Id;

        _db.Sessions.Add(session);
        await _audit.LogAsync($"Session opened: {session.Title}", ct: cancellationToken);
        await _db.SaveChangesAsync(cancellationToken);

        return new SessionDto(session.Id, session.Title, session.Deadline, session.Status.ToString());
    }

    public async Task<SessionDto?> GetActiveSessionAsync(CancellationToken cancellationToken = default)
    {
        var session = await _db.Sessions
            .AsNoTracking()
            .Include(s => s.SessionMenuItems)
            .ThenInclude(sm => sm.MenuItem)
            .Where(s => s.Status == SessionStatus.Open)
            .OrderByDescending(s => s.CreatedAt)
            .FirstOrDefaultAsync(cancellationToken);

        if (session is null) return null;

        var menu = session.SessionMenuItems.Select(sm => sm.MenuItem).Select(EntityMapper.ToMenuItemDto).ToList();
        return new SessionDto(session.Id, session.Title, session.Deadline, session.Status.ToString(), menu);
    }

    public async Task<IReadOnlyList<SessionDto>> GetRecentSessionsAsync(int count, CancellationToken ct)
    {
        var sessions = await _db.Sessions
            .AsNoTracking()
            .Include(s => s.SessionMenuItems)
            .ThenInclude(sm => sm.MenuItem)
            .OrderByDescending(s => s.CreatedAt)
            .Take(count)
            .ToListAsync(ct);

        return sessions.Select(session =>
        {
            var menu = session.SessionMenuItems
                .Select(sm => sm.MenuItem)
                .Select(EntityMapper.ToMenuItemDto)
                .ToList();

            return new SessionDto(
                session.Id,
                session.Title,
                session.Deadline,
                session.Status.ToString(),
                menu
            );
        }).ToList();
    }

    public async Task<IReadOnlyList<SessionResponseDto>> GetSessionResponsesAsync(
        Guid sessionId,
        CancellationToken cancellationToken = default)
    {
        var orders = await _db.Orders
            .AsNoTracking()
            .Include(o => o.User)
            .Include(o => o.LineItems)
            .ThenInclude(l => l.MenuItem)
            .Where(o => o.SessionId == sessionId)
            .OrderBy(o => o.SubmittedAt)
            .ToListAsync(cancellationToken);

        return orders.Select(o => new SessionResponseDto(
            o.UserId,
            o.User.Name,
            o.SubmittedAt,
            o.LineItems.Select(l => new OrderLineDto(l.MenuItem?.DishName ?? l.DishName ?? "Custom dish", l.Quantity)).ToList()
        )).ToList();
    }

    public async Task<IReadOnlyList<DishSummaryDto>> GetSessionSummaryAsync(
        Guid sessionId,
        CancellationToken cancellationToken = default)
    {
        var orders = await _db.Orders
            .AsNoTracking()
            .Include(o => o.User)
            .Include(o => o.LineItems)
            .ThenInclude(l => l.MenuItem)
            .Where(o => o.SessionId == sessionId)
            .ToListAsync(cancellationToken);

        var map = new Dictionary<string, (MenuItem Item, int Qty, HashSet<string> Users)>();

        foreach (var order in orders)
        {
            foreach (var line in order.LineItems)
            {
                var key = line.MenuItem?.DishName ?? line.DishName ?? "Custom dish";
                if (!map.TryGetValue(key, out var entry))
                {
                    entry = (line.MenuItem, 0, new HashSet<string>());
                    map[key] = entry;
                }

                entry.Users.Add(order.User.Name);
                map[key] = (entry.Item, entry.Qty + line.Quantity, entry.Users);
            }
        }

        return map
            .Select(kvp => new DishSummaryDto(
                kvp.Value.Item?.DishName ?? kvp.Key,          // actual dish name from key
                kvp.Value.Item?.Category ?? "Custom",          // "Custom" for custom dishes
                kvp.Value.Item?.Type == MenuItemType.Veg ? "Veg" : "Non-Veg",
                kvp.Value.Qty,
                kvp.Value.Users.OrderBy(n => n).ToList()))
            .OrderByDescending(d => d.TotalQty)
            .ToList();
    }

    public async Task CloseSessionAsync(Guid sessionId, CancellationToken cancellationToken = default)
    {
        var session = await _db.Sessions.FirstOrDefaultAsync(s => s.Id == sessionId, cancellationToken)
            ?? throw new KeyNotFoundException("Session not found.");

        session.Status = SessionStatus.Closed;
        await _audit.LogAsync($"Session closed: {session.Title}", ct: cancellationToken);
        await _db.SaveChangesAsync(cancellationToken);
    }
}
