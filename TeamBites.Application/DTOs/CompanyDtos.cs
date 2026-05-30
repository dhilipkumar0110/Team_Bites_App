namespace TeamBites.Application.DTOs;

public record CompanyDto(Guid Id, string Name, string Plan, DateTime CreatedAt, string AdminEmail, int Seats);

public record CreateCompanyRequest(string Name, string Plan, string AdminEmail);

public record BillingPlanDto(string Plan, int Seats, DateTime RenewalDate, decimal MonthlyAmount);

public record AuditLogDto(Guid Id, string Action, string User, string Company, DateTime Timestamp);
