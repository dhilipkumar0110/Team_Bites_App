using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TeamBites.Application.DTOs;
using TeamBites.Application.Interfaces;

namespace Team_Bites_API.Controllers;

[ApiController]
[Route("api/superadmin")]
[Authorize(Roles = "SuperAdmin")]
public class SuperAdminController : ControllerBase
{
    private readonly ISuperAdminService _superAdmin;

    public SuperAdminController(ISuperAdminService superAdmin) => _superAdmin = superAdmin;

    [HttpGet("companies")]
    public async Task<ActionResult<IReadOnlyList<CompanyDto>>> GetCompanies(CancellationToken ct) =>
        Ok(await _superAdmin.GetCompaniesAsync(ct));

    [HttpPost("companies")]
    public async Task<ActionResult<CompanyDto>> CreateCompany([FromBody] CreateCompanyRequest request, CancellationToken ct)
    {
        try
        {
            return Ok(await _superAdmin.CreateCompanyAsync(request, ct));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("billing")]
    public async Task<ActionResult<IReadOnlyList<BillingPlanDto>>> GetBilling(CancellationToken ct) =>
        Ok(await _superAdmin.GetBillingPlansAsync(ct));

    [HttpGet("logs")]
    public async Task<ActionResult<IReadOnlyList<AuditLogDto>>> GetLogs(CancellationToken ct) =>
        Ok(await _superAdmin.GetAuditLogsAsync(ct));
}
