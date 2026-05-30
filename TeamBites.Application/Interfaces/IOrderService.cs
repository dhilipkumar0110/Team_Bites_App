using TeamBites.Application.DTOs;

namespace TeamBites.Application.Interfaces;

public interface IOrderService
{
    Task SubmitOrderAsync(SubmitOrderRequest request, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<MyOrderDto>> GetMyOrdersAsync(CancellationToken cancellationToken = default);
}
