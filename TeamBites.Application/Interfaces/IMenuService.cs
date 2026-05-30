using TeamBites.Application.DTOs;

namespace TeamBites.Application.Interfaces;

public interface IMenuService
{
    Task<IReadOnlyList<MenuItemDto>> GetCompanyMenuAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<MenuItemDto>> GetSessionMenuAsync(Guid sessionId, CancellationToken cancellationToken = default);
    Task<MenuItemDto> CreateMenuItemAsync(CreateMenuItemRequest request, CancellationToken cancellationToken = default);
}
