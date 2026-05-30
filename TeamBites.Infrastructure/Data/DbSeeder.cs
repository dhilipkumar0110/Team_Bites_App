using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using TeamBites.Domain.Entities;
using TeamBites.Domain.Enums;

namespace TeamBites.Infrastructure.Data;

public static class DbSeeder
{
  public static readonly Guid SuperAdminId = Guid.Parse("11111111-1111-1111-1111-111111111101");
  public static readonly Guid CompanyId = Guid.Parse("22222222-2222-2222-2222-222222222201");
  public static readonly Guid AdminUserId = Guid.Parse("33333333-3333-3333-3333-333333333301");
  public static readonly Guid EmployeeUserId = Guid.Parse("44444444-4444-4444-4444-444444444401");
  public static readonly Guid SessionId = Guid.Parse("55555555-5555-5555-5555-555555555501");

  public static async Task SeedAsync(AppDbContext db, ILogger logger, CancellationToken ct = default)
  {
    if (await db.Users.IgnoreQueryFilters().AnyAsync(ct))
    {
      logger.LogInformation("Database already seeded.");
      return;
    }

    const string demoPassword = "demo123";
    var passwordHash = BCrypt.Net.BCrypt.HashPassword(demoPassword);

    var company = new Company
    {
      Id = CompanyId,
      Name = "Key Software Inc",
      PlanName = SubscriptionPlan.Growth,
      SeatLimit = 50,
      CreatedAt = DateTime.UtcNow.AddMonths(-9),
      RenewalDate = DateTime.UtcNow.AddMonths(1)
    };

    var superAdmin = new AppUser
    {
      Id = SuperAdminId,
      Name = "Platform Admin",
      Email = "superadmin@teambites.com",
      PasswordHash = passwordHash,
      Role = UserRole.SuperAdmin,
      Status = UserStatus.Active,
      CreatedAt = DateTime.UtcNow
    };

    var admin = new AppUser
    {
      Id = AdminUserId,
      CompanyId = CompanyId,
      Name = "Priya Sharma",
      Email = "admin@keysoftware.com",
      PasswordHash = passwordHash,
      Role = UserRole.CompanyAdmin,
      Status = UserStatus.Active,
      CreatedAt = DateTime.UtcNow
    };

    var employee = new AppUser
    {
      Id = EmployeeUserId,
      CompanyId = CompanyId,
      Name = "Dhilip Sagadevan",
      Email = "employee@keysoftware.com",
      PasswordHash = passwordHash,
      Role = UserRole.Employee,
      Status = UserStatus.Active,
      CreatedAt = DateTime.UtcNow
    };

    var menuItems = new[]
    {
      CreateMenu(CompanyId, "Chicken Biryani", "Biryani", MenuItemType.NonVeg, "Hyderabadi style"),
      CreateMenu(CompanyId, "Mutton Biryani", "Biryani", MenuItemType.NonVeg, "Dum biryani"),
      CreateMenu(CompanyId, "Veg Biryani", "Biryani", MenuItemType.Veg),
      CreateMenu(CompanyId, "Paneer Butter Masala", "Curry", MenuItemType.Veg),
      CreateMenu(CompanyId, "Chicken 65", "Starters", MenuItemType.NonVeg),
      CreateMenu(CompanyId, "Gobi Manchurian", "Starters", MenuItemType.Veg),
      CreateMenu(CompanyId, "Meals (South Indian)", "Meals", MenuItemType.Veg)
    };

    var session = new OrderSession
    {
      Id = SessionId,
      CompanyId = CompanyId,
      Title = "May Team Lunch — Friday",
      Deadline = DateTime.UtcNow.AddDays(2),
      Status = SessionStatus.Open,
      CreatedAt = DateTime.UtcNow,
      CreatedByUserId = AdminUserId,
      SessionMenuItems = menuItems.Take(5).Select(m => new SessionMenuItem { MenuItemId = m.Id }).ToList()
    };

    foreach (var sm in session.SessionMenuItems)
      sm.SessionId = session.Id;

    db.Companies.Add(company);
    db.Users.AddRange(superAdmin, admin, employee);
    db.MenuItems.AddRange(menuItems);
    db.Sessions.Add(session);

    db.AuditLogs.Add(new AuditLog
    {
      Id = Guid.NewGuid(),
      Action = "Database seeded",
      ActorDisplayName = "System",
      CompanyName = company.Name,
      CompanyId = company.Id,
      Timestamp = DateTime.UtcNow
    });

    await db.SaveChangesAsync(ct);
    logger.LogInformation("Team Bites seed data created. Demo password: {Password}", demoPassword);
  }

  private static MenuItem CreateMenu(Guid companyId, string name, string category, MenuItemType type, string? desc = null)
  {
    return new MenuItem
    {
      Id = Guid.NewGuid(),
      CompanyId = companyId,
      DishName = name,
      Category = category,
      Type = type,
      Description = desc,
      CreatedAt = DateTime.UtcNow
    };
  }
}
