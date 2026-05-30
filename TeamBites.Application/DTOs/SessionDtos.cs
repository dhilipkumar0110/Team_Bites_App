namespace TeamBites.Application.DTOs;

public record CreateSessionRequest(string Title, DateTime Deadline, IReadOnlyList<Guid> MenuItemIds);

public record SessionDto(
    Guid SessionId,
    string Title,
    DateTime Deadline,
    string Status,
    IReadOnlyList<MenuItemDto>? Menu = null);

public record SessionResponseDto(
    Guid UserId,
    string UserName,
    DateTime SubmittedAt,
    IReadOnlyList<OrderLineDto> Items);

public record OrderLineDto(string DishName, int Qty);

public record DishSummaryDto(
    string DishName,
    string Category,
    string Type,
    int TotalQty,
    IReadOnlyList<string> OrderedBy);
