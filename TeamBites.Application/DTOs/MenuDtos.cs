namespace TeamBites.Application.DTOs;

public record MenuItemDto(
    Guid Id,
    string DishName,
    string Category,
    string Type,
    string? Description);

public record CreateMenuItemRequest(string DishName, string Category, string Type, string? Description);
