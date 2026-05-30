# Team Bites database

## Setup (local SQL Server)

1. Open **SQL Server Management Studio** or **Azure Data Studio**.
2. Connect to your instance (e.g. `localhost` or `.\SQLEXPRESS`).
3. Run **`001_CreateDatabase.sql`** — creates the `TeamBites` database and all tables.
4. Update **`Team_Bites_API/appsettings.json`** if your server name differs:

```json
"DefaultConnection": "Server=localhost;Database=TeamBites;Trusted_Connection=True;TrustServerCertificate=True;"
```

For SQL authentication:

```json
"DefaultConnection": "Server=localhost;Database=TeamBites;User Id=sa;Password=YourPassword;TrustServerCertificate=True;"
```

5. Start the API — on first run it **seeds demo users** (password `demo123`) if the `Users` table is empty.

`002_SeedData.sql` is optional; prefer API seeding for correct BCrypt hashes.

## Demo logins (after API seed)

| Role | Email | Password |
|------|-------|----------|
| Super Admin | superadmin@teambites.com | demo123 |
| Company Admin | admin@keysoftware.com | demo123 |
| Employee | employee@keysoftware.com | demo123 |

## Tables

| Table | Purpose |
|-------|---------|
| Companies | Tenants |
| Users | Super admin, company admin, employees |
| MenuItems | Company dish catalog |
| OrderSessions | Group ordering events |
| SessionMenuItems | Menu snapshot per session |
| Orders | One row per user per session |
| OrderLineItems | Dish + quantity lines |
| AuditLogs | Platform / company activity |

Multi-tenancy is enforced in the API via EF global filters on `CompanyId` (from JWT `company_id` claim).
