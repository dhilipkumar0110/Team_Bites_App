using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TeamBites.Application.DTOs;
using TeamBites.Application.Interfaces;

namespace Team_Bites_API.Controllers;

[ApiController]
[Route("api/menu")]
[Authorize]
public class MenuController : ControllerBase
{
    private readonly IMenuService _menu;

    public MenuController(IMenuService menu) => _menu = menu;

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<MenuItemDto>>> GetMenu(
        [FromQuery] Guid? sessionId,
        CancellationToken ct)
    {
        if (sessionId.HasValue)
            return Ok(await _menu.GetSessionMenuAsync(sessionId.Value, ct));

        return Ok(await _menu.GetCompanyMenuAsync(ct));
    }

    [HttpPost]
    [Authorize(Roles = "CompanyAdmin")]
    public async Task<ActionResult<MenuItemDto>> Create([FromBody] CreateMenuItemRequest request, CancellationToken ct)
    {
        try
        {
            return Ok(await _menu.CreateMenuItemAsync(request, ct));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
