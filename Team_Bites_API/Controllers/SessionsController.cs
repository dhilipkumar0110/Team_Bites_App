using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TeamBites.Application.DTOs;
using TeamBites.Application.Interfaces;

namespace Team_Bites_API.Controllers;

[ApiController]
[Route("api/sessions")]
[Authorize]
public class SessionsController : ControllerBase
{
    private readonly ISessionService _sessions;

    public SessionsController(ISessionService sessions) => _sessions = sessions;

    [HttpPost]
    [Authorize(Roles = "CompanyAdmin")]
    public async Task<ActionResult<SessionDto>> Create([FromBody] CreateSessionRequest request, CancellationToken ct)
    {
        try
        {
            return Ok(await _sessions.CreateSessionAsync(request, ct));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("getSessions")]
    public async Task<ActionResult<SessionDto>> GetSessions(CancellationToken ct)
    {
        var session = await _sessions.GetActiveSessionAsync(ct);
        return session is null ? NotFound() : Ok(session);
    }

    [HttpGet("recent")]
    public async Task<ActionResult<IReadOnlyList<SessionDto>>> GetRecentSessions(CancellationToken ct)
    {
        return Ok(await _sessions.GetRecentSessionsAsync(10, ct));
    }

    [HttpGet("{id:guid}/responses")]
    [Authorize(Roles = "CompanyAdmin")]
    public async Task<ActionResult<IReadOnlyList<SessionResponseDto>>> GetResponses(Guid id, CancellationToken ct) =>
        Ok(await _sessions.GetSessionResponsesAsync(id, ct));

    [HttpGet("{id:guid}/summary")]
    [Authorize(Roles = "CompanyAdmin")]
    public async Task<ActionResult<IReadOnlyList<DishSummaryDto>>> GetSummary(Guid id, CancellationToken ct) =>
        Ok(await _sessions.GetSessionSummaryAsync(id, ct));

    [HttpPut("{id:guid}/close")]
    [Authorize(Roles = "CompanyAdmin")]
    public async Task<IActionResult> Close(Guid id, CancellationToken ct)
    {
        try
        {
            await _sessions.CloseSessionAsync(id, ct);
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }
}
