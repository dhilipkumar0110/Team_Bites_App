using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TeamBites.Application.DTOs;
using TeamBites.Application.Interfaces;

namespace Team_Bites_API.Controllers;

[ApiController]
[Route("api/orders")]
[Authorize]
public class OrdersController : ControllerBase
{
    private readonly IOrderService _orders;

    public OrdersController(IOrderService orders) => _orders = orders;

    [HttpPost]
    [Authorize(Roles = "Employee,CompanyAdmin")]
    public async Task<IActionResult> Submit([FromBody] SubmitOrderRequest request, CancellationToken ct)
    {
        try
        {
            await _orders.SubmitOrderAsync(request, ct);
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("my")]
    public async Task<ActionResult<IReadOnlyList<MyOrderDto>>> GetMyOrders(CancellationToken ct) =>
        Ok(await _orders.GetMyOrdersAsync(ct));
}
