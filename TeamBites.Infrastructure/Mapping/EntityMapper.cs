using TeamBites.Application.DTOs;
using TeamBites.Domain.Entities;
using TeamBites.Domain.Enums;

namespace TeamBites.Infrastructure.Mapping;

public static class EntityMapper
{
    public static AuthUserDto ToAuthUserDto(AppUser user) =>
        new(
            user.Id,
            user.Name,
            user.Email,
            user.Role.ToString(),
            user.CompanyId,
            user.Company?.Name);

    public static MenuItemDto ToMenuItemDto(MenuItem item) =>
        new(
            item.Id,
            item.DishName,
            item.Category,
            item.Type == MenuItemType.Veg ? "Veg" : "Non-Veg",
            item.Description);

    public static EmployeeDto ToEmployeeDto(AppUser user) =>
        new(user.Id, user.Name, user.Email, user.Role.ToString(), user.Status.ToString());

    public static string PlanToString(SubscriptionPlan plan) => plan.ToString();

    public static SubscriptionPlan ParsePlan(string plan) =>
        Enum.TryParse<SubscriptionPlan>(plan, true, out var p) ? p : SubscriptionPlan.Starter;

    public static MenuItemType ParseMenuType(string type) =>
        type.Equals("Non-Veg", StringComparison.OrdinalIgnoreCase) ||
        type.Equals("NonVeg", StringComparison.OrdinalIgnoreCase)
            ? MenuItemType.NonVeg
            : MenuItemType.Veg;

    public static int SeatLimitForPlan(SubscriptionPlan plan) => plan switch
    {
        SubscriptionPlan.Starter => 15,
        SubscriptionPlan.Growth => 50,
        SubscriptionPlan.Enterprise => 200,
        _ => 15
    };

    public static decimal MonthlyAmountForPlan(SubscriptionPlan plan) => plan switch
    {
        SubscriptionPlan.Starter => 49m,
        SubscriptionPlan.Growth => 149m,
        SubscriptionPlan.Enterprise => 399m,
        _ => 49m
    };
}
