namespace TeamBites.Application.DTOs;

public record LoginRequest(string Email, string Password);

public record InviteRequest(string Name, string Email);

public record AuthUserDto(
    Guid Id,
    string Name,
    string Email,
    string Role,
    Guid? CompanyId,
    string? CompanyName);

public record AuthResponseDto(string Token, AuthUserDto User);
