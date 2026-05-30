using TeamBites.Domain.Enums;

namespace TeamBites.Application.Interfaces;

public interface ICurrentUserService
{
    Guid? UserId { get; }
    Guid? CompanyId { get; }
    UserRole? Role { get; }
    bool IsAuthenticated { get; }
    bool IsSuperAdmin { get; }
}
