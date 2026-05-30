using Microsoft.EntityFrameworkCore;
using TeamBites.Application.DTOs;
using TeamBites.Application.Interfaces;
using TeamBites.Domain.Entities;
using TeamBites.Infrastructure.Data;
using TeamBites.Infrastructure.Mapping;

namespace TeamBites.Infrastructure.Services;

public class MenuService : IMenuService
{
    private readonly AppDbContext _db;
    private readonly ICurrentUserService _currentUser;
    private readonly AuditService _audit;

    public MenuService(AppDbContext db, ICurrentUserService currentUser, AuditService audit)
    {
        _db = db;
        _currentUser = currentUser;
        _audit = audit;
    }

    public async Task<IReadOnlyList<MenuItemDto>> GetCompanyMenuAsync(CancellationToken cancellationToken = default)
    {
        var items = await _db.MenuItems
            .AsNoTracking()
            .Where(m => m.IsActive)
            .OrderBy(m => m.Category)
            .ThenBy(m => m.DishName)
            .ToListAsync(cancellationToken);

        return items.Select(EntityMapper.ToMenuItemDto).ToList();
    }

    public async Task<IReadOnlyList<MenuItemDto>> GetSessionMenuAsync(Guid sessionId, CancellationToken cancellationToken = default)
    {
        var session = await _db.Sessions
            .AsNoTracking()
            .Include(s => s.SessionMenuItems)
            .ThenInclude(sm => sm.MenuItem)
            .FirstOrDefaultAsync(s => s.Id == sessionId, cancellationToken)
            ?? throw new KeyNotFoundException("Session not found.");

        return session.SessionMenuItems
            .Select(sm => sm.MenuItem)
            .Where(m => m.IsActive)
            .Select(EntityMapper.ToMenuItemDto)
            .ToList();
    }

    public async Task<MenuItemDto> CreateMenuItemAsync(CreateMenuItemRequest request, CancellationToken cancellationToken = default)
    {
        if (_currentUser.CompanyId is null)
            throw new InvalidOperationException("Company context required.");

        var item = new MenuItem
        {
            Id = Guid.NewGuid(),
            CompanyId = _currentUser.CompanyId.Value,
            DishName = request.DishName.Trim(),
            Category = request.Category.Trim(),
            Type = EntityMapper.ParseMenuType(request.Type),
            Description = string.IsNullOrWhiteSpace(request.Description) ? null : request.Description.Trim(),
            CreatedAt = DateTime.UtcNow
        };

        _db.MenuItems.Add(item);
        await _audit.LogAsync($"Menu item added: {item.DishName}", ct: cancellationToken);
        await _db.SaveChangesAsync(cancellationToken);

        return EntityMapper.ToMenuItemDto(item);
    }
}
