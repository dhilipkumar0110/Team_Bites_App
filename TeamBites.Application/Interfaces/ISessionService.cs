using TeamBites.Application.DTOs;

namespace TeamBites.Application.Interfaces;

public interface ISessionService
{
    Task<SessionDto> CreateSessionAsync(CreateSessionRequest request, CancellationToken cancellationToken = default);
    Task<SessionDto?> GetActiveSessionAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<SessionResponseDto>> GetSessionResponsesAsync(Guid sessionId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<DishSummaryDto>> GetSessionSummaryAsync(Guid sessionId, CancellationToken cancellationToken = default);
    Task CloseSessionAsync(Guid sessionId, CancellationToken cancellationToken = default);
}
