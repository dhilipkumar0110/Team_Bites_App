using Microsoft.EntityFrameworkCore;
using TeamBites.Application.DTOs;
using TeamBites.Application.Interfaces;
using TeamBites.Domain.Entities;
using TeamBites.Domain.Enums;
using TeamBites.Infrastructure.Data;

namespace TeamBites.Infrastructure.Services;

public class OrderService : IOrderService
{
    private readonly AppDbContext _db;
    private readonly ICurrentUserService _currentUser;
    private readonly AuditService _audit;

    public OrderService(AppDbContext db, ICurrentUserService currentUser, AuditService audit)
    {
        _db = db;
        _currentUser = currentUser;
        _audit = audit;
    }

    public async Task SubmitOrderAsync(SubmitOrderRequest request, CancellationToken cancellationToken = default)
    {
        if (_currentUser.UserId is null)
            throw new InvalidOperationException("User not authenticated.");

        var session = await _db.Sessions
            .Include(s => s.SessionMenuItems)
            .FirstOrDefaultAsync(s => s.Id == request.SessionId, cancellationToken)
            ?? throw new KeyNotFoundException("Session not found.");

        if (session.Status != SessionStatus.Open)
            throw new InvalidOperationException("Session is not open for orders.");

        if (session.Deadline < DateTime.UtcNow)
            throw new InvalidOperationException("Order deadline has passed.");

        var allowedMenuIds = session.SessionMenuItems.Select(sm => sm.MenuItemId).ToHashSet();
        var lines = request.Items.Where(i => i.Qty > 0).ToList();
        if (lines.Count == 0)
            throw new InvalidOperationException("Order must contain at least one item.");

        if (lines.Any(l => !allowedMenuIds.Contains(l.MenuItemId)))
            throw new InvalidOperationException("Invalid menu item for this session.");

        var existing = await _db.Orders
            .FirstOrDefaultAsync(o => o.SessionId == request.SessionId && o.UserId == _currentUser.UserId, cancellationToken);

        if (existing is not null)
        {
            _db.OrderLineItems.RemoveRange(existing.LineItems);
            _db.Orders.Remove(existing);
        }

        var order = new Order
        {
            Id = Guid.NewGuid(),
            SessionId = request.SessionId,
            UserId = _currentUser.UserId.Value,
            SubmittedAt = DateTime.UtcNow,
            LineItems = lines.Select(l => new OrderLineItem
            {
                Id = Guid.NewGuid(),
                MenuItemId = l.MenuItemId,
                Quantity = l.Qty
            }).ToList()
        };

        foreach (var line in order.LineItems)
            line.OrderId = order.Id;

        _db.Orders.Add(order);
        await _audit.LogAsync($"Order submitted for session: {session.Title}", ct: cancellationToken);
        await _db.SaveChangesAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<MyOrderDto>> GetMyOrdersAsync(CancellationToken cancellationToken = default)
    {
        if (_currentUser.UserId is null)
            throw new InvalidOperationException("User not authenticated.");

        var orders = await _db.Orders
            .AsNoTracking()
            .Include(o => o.Session)
            .Include(o => o.LineItems)
            .ThenInclude(l => l.MenuItem)
            .Where(o => o.UserId == _currentUser.UserId)
            .OrderByDescending(o => o.SubmittedAt)
            .ToListAsync(cancellationToken);

        return orders.Select(o => new MyOrderDto(
            o.Id,
            o.SessionId,
            o.Session.Title,
            o.SubmittedAt,
            o.LineItems.Select(l => new OrderLineDto(l.MenuItem.DishName, l.Quantity)).ToList(),
            o.Session.Status == SessionStatus.Closed ? "Closed" : "Submitted"
        )).ToList();
    }
}
