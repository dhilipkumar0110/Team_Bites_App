using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using TeamBites.Application.Interfaces;
using TeamBites.Domain.Enums;
using TeamBites.Infrastructure.Identity;

namespace TeamBites.Infrastructure.Services;

public class CurrentUserService : ICurrentUserService
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CurrentUserService(IHttpContextAccessor httpContextAccessor) =>
        _httpContextAccessor = httpContextAccessor;

    private ClaimsPrincipal? User => _httpContextAccessor.HttpContext?.User;

    public bool IsAuthenticated => User?.Identity?.IsAuthenticated == true;

    public Guid? UserId =>
        Guid.TryParse(
            User?.FindFirstValue(JwtRegisteredClaimNames.Sub)
                ?? User?.FindFirstValue(ClaimTypes.NameIdentifier),
            out var id)
            ? id
            : null;

    public Guid? CompanyId =>
        Guid.TryParse(User?.FindFirstValue(AuthConstants.CompanyIdClaim), out var id) ? id : null;

    public UserRole? Role
    {
        get
        {
            var role = User?.FindFirstValue(AuthConstants.RoleClaim);
            return Enum.TryParse<UserRole>(role, out var parsed) ? parsed : null;
        }
    }

    public bool IsSuperAdmin => Role == UserRole.SuperAdmin;
}
