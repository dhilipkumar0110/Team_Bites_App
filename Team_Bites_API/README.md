# Team Bites API

ASP.NET Core 8 Web API with clean architecture layers.

## Solution structure

```
TeamBites.Domain/          Entities, enums
TeamBites.Application/     DTOs, service interfaces
TeamBites.Infrastructure/  EF Core, JWT, service implementations, multi-tenant DbContext
Team_Bites_API/            HTTP controllers, Program.cs
database/                  SQL Server scripts (repo root)
```

## Run locally

1. Create the database — see [../database/README.md](../database/README.md).
2. Adjust `appsettings.json` connection string and JWT secret (32+ characters).
3. From this folder:

```bash
dotnet run
```

Swagger: https://localhost:7xxx/swagger (see launchSettings.json).

## API routes

| Method | Route | Role |
|--------|-------|------|
| POST | `/api/auth/login` | Anonymous |
| POST | `/api/auth/invite` | CompanyAdmin |
| GET | `/api/superadmin/companies` | SuperAdmin |
| POST | `/api/superadmin/companies` | SuperAdmin |
| GET | `/api/superadmin/billing` | SuperAdmin |
| GET | `/api/superadmin/logs` | SuperAdmin |
| GET/POST | `/api/menu` | Authorized |
| GET | `/api/users` | CompanyAdmin |
| POST | `/api/sessions` | CompanyAdmin |
| GET | `/api/sessions/active` | Authorized |
| GET | `/api/sessions/{id}/responses` | CompanyAdmin |
| GET | `/api/sessions/{id}/summary` | CompanyAdmin |
| PUT | `/api/sessions/{id}/close` | CompanyAdmin |
| POST | `/api/orders` | Employee |
| GET | `/api/orders/my` | Authorized |

JWT claims: `sub`, `email`, `role`, `company_id` (tenant).

## CORS

Configured for `http://localhost:4200` (Angular dev server).
