namespace TeamBites.Application.DTOs;

public record SubmitOrderRequest(Guid SessionId, IReadOnlyList<SubmitOrderLineRequest> Items);

public record SubmitOrderLineRequest(
    Guid? MenuItemId,   // nullable — null for custom dishes
    int Qty,
    bool IsCustom = false,
    string? DishName = null,
    string? Type = null);
public record MyOrderDto(
    Guid Id,
    Guid SessionId,
    string SessionTitle,
    DateTime OrderedAt,
    IReadOnlyList<OrderLineDto> Items,
    string Status);
