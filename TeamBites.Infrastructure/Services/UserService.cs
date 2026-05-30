using Microsoft.EntityFrameworkCore;
using TeamBites.Application.DTOs;
using TeamBites.Application.Interfaces;
using TeamBites.Infrastructure.Data;
using TeamBites.Infrastructure.Mapping;

namespace TeamBites.Infrastructure.Services;

public class UserService : IUserService
{
    private readonly AppDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public UserService(AppDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<IReadOnlyList<EmployeeDto>> GetEmployeesAsync(CancellationToken cancellationToken = default)
    {
        if (_currentUser.CompanyId is null)
            throw new InvalidOperationException("Company context required.");

        var users = await _db.Users
            .AsNoTracking()
            .Where(u => u.CompanyId == _currentUser.CompanyId)
            .OrderBy(u => u.Name)
            .ToListAsync(cancellationToken);

        return users.Select(EntityMapper.ToEmployeeDto).ToList();
    }
}
