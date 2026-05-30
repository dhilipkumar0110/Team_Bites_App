using TeamBites.Application.DTOs;

namespace TeamBites.Application.Interfaces;

public interface ISuperAdminService
{
    Task<IReadOnlyList<CompanyDto>> GetCompaniesAsync(CancellationToken cancellationToken = default);
    Task<CompanyDto> CreateCompanyAsync(CreateCompanyRequest request, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<BillingPlanDto>> GetBillingPlansAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<AuditLogDto>> GetAuditLogsAsync(CancellationToken cancellationToken = default);
}
