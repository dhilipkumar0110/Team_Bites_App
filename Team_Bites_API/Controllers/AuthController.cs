using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TeamBites.Application.DTOs;
using TeamBites.Application.Interfaces;
using TeamBites.Infrastructure.Services;

namespace Team_Bites_API.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _auth;

    public AuthController(IAuthService auth) => _auth = auth;

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<ActionResult<AuthResponseDto>> Login([FromBody] LoginRequest request, CancellationToken ct)
    {
        try
        {
            return Ok(await _auth.LoginAsync(request, ct));
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
    }

    [HttpPost("invite")]
    [Authorize(Roles = "CompanyAdmin")]
    public async Task<ActionResult<EmployeeDto>> Invite([FromBody] InviteRequest request, CancellationToken ct)
    {
        try
        {
            return Ok(await _auth.InviteAsync(request, ct));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("accept-invite")]
    [AllowAnonymous]
    public async Task<ActionResult<AcceptInviteResponseDto>> AcceptInvite(
        [FromBody] AcceptInviteRequestDto request, CancellationToken ct)
    {
        try
        {
            return Ok(await _auth.AcceptInviteAsync(request, ct));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("reset-password")]
    [AllowAnonymous]
    public async Task<IActionResult> ResetPassword(
        [FromBody] ResetPasswordRequestDto request, CancellationToken ct)
    {
        try
        {
            await _auth.ResetPasswordFromInviteAsync(request, ct);
            return Ok(new { message = "Password set successfully. You can now log in." });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

}
