namespace TeamBites.Application.DTOs;

public record SubmitOrderRequest(Guid SessionId, IReadOnlyList<SubmitOrderLineRequest> Items);

public record SubmitOrderLineRequest(Guid MenuItemId, int Qty);

public record MyOrderDto(
    Guid Id,
    Guid SessionId,
    string SessionTitle,
    DateTime OrderedAt,
    IReadOnlyList<OrderLineDto> Items,
    string Status);
