using TeamBites.Application.DTOs;

namespace TeamBites.Application.Interfaces;

public interface IUserService
{
    Task<IReadOnlyList<EmployeeDto>> GetEmployeesAsync(CancellationToken cancellationToken = default);
}
