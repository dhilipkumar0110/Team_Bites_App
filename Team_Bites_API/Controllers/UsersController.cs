using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TeamBites.Application.DTOs;
using TeamBites.Application.Interfaces;

namespace Team_Bites_API.Controllers;

[ApiController]
[Route("api/users")]
[Authorize(Roles = "CompanyAdmin")]
public class UsersController : ControllerBase
{
    private readonly IUserService _users;

    public UsersController(IUserService users) => _users = users;

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<EmployeeDto>>> GetEmployees(CancellationToken ct) =>
        Ok(await _users.GetEmployeesAsync(ct));

}
