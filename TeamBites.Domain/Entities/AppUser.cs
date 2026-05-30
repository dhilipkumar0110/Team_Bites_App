using TeamBites.Domain.Enums;

namespace TeamBites.Domain.Entities;

public class AppUser
{
    public Guid Id { get; set; }
    public Guid? CompanyId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public UserRole Role { get; set; }
    public UserStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }

    public Company? Company { get; set; }
    public ICollection<Order> Orders { get; set; } = new List<Order>();
}
