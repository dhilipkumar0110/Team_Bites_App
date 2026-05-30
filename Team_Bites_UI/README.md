# Team Bites UI

Angular frontend for **Team Bites** — group lunch ordering for IT teams. Collect dish preferences, submit orders before a deadline, and consolidate counts (chicken biryani, mutton biryani, etc.) without chat-thread chaos.

This repo is **UI-only** for now: mock auth and in-memory data. The ASP.NET Core API can be wired in later via the same routes described in the product diagrams.

## Quick start

```bash
npm install
npm start
```

Open [http://localhost:4200](http://localhost:4200).

## Demo accounts

| Role | Email | Password |
|------|-------|----------|
| Super Admin | `superadmin@teambites.com` | `demo123` |
| Company Admin | `admin@keysoftware.com` | `demo123` |
| Employee | `employee@keysoftware.com` | `demo123` |

## Modules (by role)

### Super Admin (purple theme)
- Companies list
- Create company
- Billing & plans
- Audit logs

### Company Admin (green theme)
- Dashboard
- Create ordering session
- Manage menu
- Manage employees / invites
- Live responses
- Order summary (copy, CSV export, close session)

### Employee (amber theme)
- Active session
- Menu & cart submit
- Order history

## Architecture

- **Auth**: `AuthService` (mock JWT in `localStorage`), `authGuard`, `roleGuard`, `jwtInterceptor`
- **Data**: `MockDataService` until backend exists
- **Layout**: `AppShellComponent` with role-themed sidebar navigation

## Build

```bash
npm run build
```
