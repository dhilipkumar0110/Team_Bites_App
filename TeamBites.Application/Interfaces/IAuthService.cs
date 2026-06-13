using TeamBites.Application.DTOs;

namespace TeamBites.Application.Interfaces;

public interface IAuthService
{
    Task<AuthResponseDto> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default);
    Task<EmployeeDto> InviteAsync(InviteRequest request, CancellationToken cancellationToken = default);

    Task<AcceptInviteResponseDto> AcceptInviteAsync(AcceptInviteRequestDto request, CancellationToken cancellationToken = default);

    Task ResetPasswordFromInviteAsync(ResetPasswordRequestDto request, CancellationToken cancellationToken = default);
}
