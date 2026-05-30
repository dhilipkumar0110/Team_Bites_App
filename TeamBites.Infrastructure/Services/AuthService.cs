using Microsoft.EntityFrameworkCore;
using TeamBites.Application.DTOs;
using TeamBites.Application.Interfaces;
using TeamBites.Domain.Entities;
using TeamBites.Domain.Enums;
using TeamBites.Infrastructure.Data;
using TeamBites.Infrastructure.Identity;
using TeamBites.Infrastructure.Mapping;

namespace TeamBites.Infrastructure.Services;

public class AuthService : IAuthService
{
    private readonly AppDbContext _db;
    private readonly JwtTokenService _jwt;
    private readonly ICurrentUserService _currentUser;
    private readonly AuditService _audit;

    public AuthService(
        AppDbContext db,
        JwtTokenService jwt,
        ICurrentUserService currentUser,
        AuditService audit)
    {
        _db = db;
        _jwt = jwt;
        _currentUser = currentUser;
        _audit = audit;
    }

    public async Task<AuthResponseDto> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        var user = await _db.Users
            .IgnoreQueryFilters()
            .Include(u => u.Company)
            .FirstOrDefaultAsync(u => u.Email.ToLower() == email, cancellationToken);

        if (user is null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            throw new UnauthorizedAccessException("Invalid email or password.");

        if (user.Status == UserStatus.Inactive)
            throw new UnauthorizedAccessException("Account is inactive.");

        var token = _jwt.CreateToken(user);
        return new AuthResponseDto(token, EntityMapper.ToAuthUserDto(user));
    }

    public async Task<EmployeeDto> InviteAsync(InviteRequest request, CancellationToken cancellationToken = default)
    {
        if (_currentUser.CompanyId is null)
            throw new InvalidOperationException("Company context required.");

        var email = request.Email.Trim().ToLowerInvariant();
        var exists = await _db.Users.IgnoreQueryFilters()
            .AnyAsync(u => u.Email.ToLower() == email, cancellationToken);
        if (exists)
            throw new InvalidOperationException("A user with this email already exists.");

        var user = new AppUser
        {
            Id = Guid.NewGuid(),
            CompanyId = _currentUser.CompanyId,
            Name = request.Name.Trim(),
            Email = email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("ChangeMe123!"),
            Role = UserRole.Employee,
            Status = UserStatus.Invited,
            CreatedAt = DateTime.UtcNow
        };

        _db.Users.Add(user);
        await _audit.LogAsync($"User invited: {email}", ct: cancellationToken);
        await _db.SaveChangesAsync(cancellationToken);

        return EntityMapper.ToEmployeeDto(user);
    }
}
