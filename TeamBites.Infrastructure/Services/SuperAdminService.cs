using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using TeamBites.Application.DTOs;
using TeamBites.Application.Interfaces;
using TeamBites.Domain.Entities;
using TeamBites.Domain.Enums;
using TeamBites.Infrastructure.Data;
using TeamBites.Infrastructure.Mapping;

namespace TeamBites.Infrastructure.Services;

public class SuperAdminService : ISuperAdminService
{
    private readonly AppDbContext _db;
    private readonly AuditService _audit;
    private readonly IEmailService _email;

    public SuperAdminService(AppDbContext db, AuditService audit, IEmailService email)
    {
        _db = db;
        _audit = audit;
        _email=email;
    }

    public async Task<IReadOnlyList<CompanyDto>> GetCompaniesAsync(CancellationToken cancellationToken = default)
    {
        var companies = await _db.Companies
            .AsNoTracking()
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync(cancellationToken);

        var adminEmails = await _db.Users
            .IgnoreQueryFilters()
            .Where(u => u.Role == UserRole.CompanyAdmin && u.CompanyId != null)
            .ToListAsync(cancellationToken);

        return companies.Select(c =>
        {
            var admin = adminEmails.FirstOrDefault(u => u.CompanyId == c.Id);
            return new CompanyDto(
                c.Id,
                c.Name,
                EntityMapper.PlanToString(c.PlanName),
                c.CreatedAt,
                admin?.Email ?? "—",
                c.SeatLimit);
        }).ToList();
    }

    public async Task<CompanyDto> CreateCompanyAsync(CreateCompanyRequest request, CancellationToken cancellationToken = default)
    {
        var plan = EntityMapper.ParsePlan(request.Plan);
        var companyId = Guid.NewGuid();
        var company = new Company
        {
            Id = companyId,
            Name = request.Name.Trim(),
            PlanName = plan,
            SeatLimit = EntityMapper.SeatLimitForPlan(plan),
            CreatedAt = DateTime.UtcNow,
            RenewalDate = DateTime.UtcNow.AddMonths(1)
        };

        var admin = new AppUser
        {
            Id = Guid.NewGuid(),
            CompanyId = companyId,
            Name = request.AdminEmail.Split('@')[0],
            Email = request.AdminEmail.Trim().ToLowerInvariant(),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("ChangeMe123!"),
            Role = UserRole.CompanyAdmin,
            Status = UserStatus.Invited,
            CreatedAt = DateTime.UtcNow
        };

        _db.Companies.Add(company);
        _db.Users.Add(admin);
        await _audit.LogAsync($"Company created: {company.Name}", company.Name, companyId, cancellationToken);
        await _db.SaveChangesAsync(cancellationToken);

        var rawToken = Convert.ToHexString(RandomNumberGenerator.GetBytes(32));
        _db.InviteTokens.Add(new InviteToken
        {
            Id        = Guid.NewGuid(),
            UserId    = admin.Id,
            Token     = rawToken,
            ExpiresAt = DateTime.UtcNow.AddHours(48),
            Used      = false
        });

        await _audit.LogAsync($"User invited: {request.AdminEmail.Trim().ToLowerInvariant()}", ct: cancellationToken);
        await _db.SaveChangesAsync(cancellationToken);

        try
        {
            await _email.SendInviteEmailAsync(request.AdminEmail.Trim(), request.AdminEmail.Split('@')[0], rawToken, cancellationToken);
        }
        catch (Exception ex)
        {
            // Log but swallow — user is saved; admin can resend manually
            Console.Error.WriteLine($"[Email] Failed to send invite to {request.AdminEmail.Trim().ToLowerInvariant()}: {ex.Message}");
        }

        return new CompanyDto(company.Id, company.Name, EntityMapper.PlanToString(company.PlanName),
            company.CreatedAt, admin.Email, company.SeatLimit);
    }

    public Task<IReadOnlyList<BillingPlanDto>> GetBillingPlansAsync(CancellationToken cancellationToken = default)
    {
        var plans = Enum.GetValues<SubscriptionPlan>().Select(p => new BillingPlanDto(
            EntityMapper.PlanToString(p),
            EntityMapper.SeatLimitForPlan(p),
            DateTime.UtcNow.AddMonths(1),
            EntityMapper.MonthlyAmountForPlan(p))).ToList();

        return Task.FromResult<IReadOnlyList<BillingPlanDto>>(plans);
    }

    public async Task<IReadOnlyList<AuditLogDto>> GetAuditLogsAsync(CancellationToken cancellationToken = default)
    {
        var logs = await _db.AuditLogs
            .AsNoTracking()
            .OrderByDescending(a => a.Timestamp)
            .Take(100)
            .ToListAsync(cancellationToken);

        return logs.Select(a => new AuditLogDto(
            a.Id,
            a.Action,
            a.ActorDisplayName,
            a.CompanyName ?? "—",
            a.Timestamp)).ToList();
    }
}
