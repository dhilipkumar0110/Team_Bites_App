using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
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
    private readonly IEmailService _email;

    public AuthService(
        AppDbContext db,
        JwtTokenService jwt,
        ICurrentUserService currentUser,
        AuditService audit, IEmailService email)
    {
        _db = db;
        _jwt = jwt;
        _currentUser = currentUser;
        _audit = audit;
        _email = email;
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

        var rawToken = Convert.ToHexString(RandomNumberGenerator.GetBytes(32));

        _db.InviteTokens.Add(new InviteToken
        {
            Id        = Guid.NewGuid(),
            UserId    = user.Id,
            Token     = rawToken,
            ExpiresAt = DateTime.UtcNow.AddHours(48),
            Used      = false
        });

        await _audit.LogAsync($"User invited: {email}", ct: cancellationToken);
        await _db.SaveChangesAsync(cancellationToken);


        try
        {
            await _email.SendInviteEmailAsync(email, user.Name, rawToken, cancellationToken);
        }
        catch (Exception ex)
        {
            // Log but swallow — user is saved; admin can resend manually
            Console.Error.WriteLine($"[Email] Failed to send invite to {email}: {ex.Message}");
        }

        return EntityMapper.ToEmployeeDto(user);
    }

    public async Task<AcceptInviteResponseDto> AcceptInviteAsync(
        AcceptInviteRequestDto request, CancellationToken cancellationToken = default)
    {
        var token = await _db.InviteTokens
            .IgnoreQueryFilters()
            .Include(t => t.User)
            .FirstOrDefaultAsync(t => t.Token == request.Token, cancellationToken)
            ?? throw new InvalidOperationException("Invalid or expired invite link.");

        if (token.Used)
            throw new InvalidOperationException("This invite link has already been used.");

        if (token.ExpiresAt < DateTime.UtcNow)
            throw new InvalidOperationException("This invite link has expired. Ask your admin to resend the invite.");

        token.Used        = true;
        token.User.Status = UserStatus.PendingPasswordReset;

        await _db.SaveChangesAsync(cancellationToken);

        return new AcceptInviteResponseDto(
            Name: token.User.Name,
            Email: token.User.Email,
            Token: request.Token   
        );
    }

    public async Task ResetPasswordFromInviteAsync(
        ResetPasswordRequestDto request, CancellationToken cancellationToken = default)
    {
        if (request.NewPassword != request.ConfirmPassword)
            throw new InvalidOperationException("Passwords do not match.");

        if (request.NewPassword.Length < 8)
            throw new InvalidOperationException("Password must be at least 8 characters.");

        var token = await _db.InviteTokens
            .IgnoreQueryFilters()
            .Include(t => t.User)
            .FirstOrDefaultAsync(t => t.Token == request.Token, cancellationToken)
            ?? throw new InvalidOperationException("Invalid token.");

        if (token.User.Status != UserStatus.PendingPasswordReset)
            throw new InvalidOperationException("Account is already active or in an unexpected state.");

        token.User.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        token.User.Status       = UserStatus.Active;

        await _audit.LogAsync(
            $"User activated via invite: {token.User.Email}", ct: cancellationToken);

        await _db.SaveChangesAsync(cancellationToken);

        try
        {
            await _email.SendPasswordResetConfirmationAsync(
                token.User.Email, token.User.Name, cancellationToken);
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"[Email] Confirmation email failed for {token.User.Email}: {ex.Message}");
        }
    }
}
