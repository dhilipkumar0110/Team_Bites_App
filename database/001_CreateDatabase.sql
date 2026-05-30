/*
  Team Bites - SQL Server schema
  Run in SSMS or Azure Data Studio against your local instance.

  1. Adjust database name / file paths if needed.
  2. Execute this entire script.
  3. Start the API once to insert demo seed data (or run 002_SeedData.sql).
*/

IF DB_ID(N'TeamBites') IS NULL
BEGIN
    CREATE DATABASE TeamBites;
END
GO

USE TeamBites;
GO

/* Drop order respects foreign keys */
IF OBJECT_ID(N'dbo.OrderLineItems', N'U') IS NOT NULL DROP TABLE dbo.OrderLineItems;
IF OBJECT_ID(N'dbo.Orders', N'U') IS NOT NULL DROP TABLE dbo.Orders;
IF OBJECT_ID(N'dbo.SessionMenuItems', N'U') IS NOT NULL DROP TABLE dbo.SessionMenuItems;
IF OBJECT_ID(N'dbo.OrderSessions', N'U') IS NOT NULL DROP TABLE dbo.OrderSessions;
IF OBJECT_ID(N'dbo.MenuItems', N'U') IS NOT NULL DROP TABLE dbo.MenuItems;
IF OBJECT_ID(N'dbo.AuditLogs', N'U') IS NOT NULL DROP TABLE dbo.AuditLogs;
IF OBJECT_ID(N'dbo.Users', N'U') IS NOT NULL DROP TABLE dbo.Users;
IF OBJECT_ID(N'dbo.Companies', N'U') IS NOT NULL DROP TABLE dbo.Companies;
GO

CREATE TABLE dbo.Companies
(
    Id           UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_Companies PRIMARY KEY,
    Name         NVARCHAR(200)    NOT NULL,
    Plan         NVARCHAR(32)     NOT NULL,
    SeatLimit    INT              NOT NULL,
    CreatedAt    DATETIME2        NOT NULL,
    RenewalDate  DATETIME2        NULL
);
GO

CREATE TABLE dbo.Users
(
    Id           UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_Users PRIMARY KEY,
    CompanyId    UNIQUEIDENTIFIER NULL,
    Name         NVARCHAR(200)    NOT NULL,
    Email        NVARCHAR(256)    NOT NULL,
    PasswordHash NVARCHAR(500)    NOT NULL,
    Role         NVARCHAR(32)     NOT NULL,
    Status       NVARCHAR(32)     NOT NULL,
    CreatedAt    DATETIME2        NOT NULL,
    CONSTRAINT FK_Users_Companies FOREIGN KEY (CompanyId) REFERENCES dbo.Companies (Id)
);
CREATE UNIQUE INDEX IX_Users_Email ON dbo.Users (Email);
GO

CREATE TABLE dbo.MenuItems
(
    Id          UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_MenuItems PRIMARY KEY,
    CompanyId   UNIQUEIDENTIFIER NOT NULL,
    DishName    NVARCHAR(200)    NOT NULL,
    Category    NVARCHAR(100)    NOT NULL,
    Type        NVARCHAR(16)     NOT NULL,
    Description NVARCHAR(500)    NULL,
    IsActive    BIT              NOT NULL CONSTRAINT DF_MenuItems_IsActive DEFAULT (1),
    CreatedAt   DATETIME2        NOT NULL,
    CONSTRAINT FK_MenuItems_Companies FOREIGN KEY (CompanyId) REFERENCES dbo.Companies (Id)
);
CREATE INDEX IX_MenuItems_CompanyId ON dbo.MenuItems (CompanyId);
GO

CREATE TABLE dbo.OrderSessions
(
    Id              UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_OrderSessions PRIMARY KEY,
    CompanyId       UNIQUEIDENTIFIER NOT NULL,
    Title           NVARCHAR(300)    NOT NULL,
    Deadline        DATETIME2        NOT NULL,
    Status          NVARCHAR(16)     NOT NULL,
    CreatedAt       DATETIME2        NOT NULL,
    CreatedByUserId UNIQUEIDENTIFIER NOT NULL,
    CONSTRAINT FK_OrderSessions_Companies FOREIGN KEY (CompanyId) REFERENCES dbo.Companies (Id),
    CONSTRAINT FK_OrderSessions_Users FOREIGN KEY (CreatedByUserId) REFERENCES dbo.Users (Id)
);
CREATE INDEX IX_OrderSessions_CompanyId_Status ON dbo.OrderSessions (CompanyId, Status);
GO

CREATE TABLE dbo.SessionMenuItems
(
    SessionId  UNIQUEIDENTIFIER NOT NULL,
    MenuItemId UNIQUEIDENTIFIER NOT NULL,
    CONSTRAINT PK_SessionMenuItems PRIMARY KEY (SessionId, MenuItemId),
    CONSTRAINT FK_SessionMenuItems_Sessions FOREIGN KEY (SessionId) REFERENCES dbo.OrderSessions (Id) ON DELETE CASCADE,
    CONSTRAINT FK_SessionMenuItems_MenuItems FOREIGN KEY (MenuItemId) REFERENCES dbo.MenuItems (Id)
);
GO

CREATE TABLE dbo.Orders
(
    Id          UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_Orders PRIMARY KEY,
    SessionId   UNIQUEIDENTIFIER NOT NULL,
    UserId      UNIQUEIDENTIFIER NOT NULL,
    SubmittedAt DATETIME2        NOT NULL,
    CONSTRAINT FK_Orders_Sessions FOREIGN KEY (SessionId) REFERENCES dbo.OrderSessions (Id),
    CONSTRAINT FK_Orders_Users FOREIGN KEY (UserId) REFERENCES dbo.Users (Id)
);
CREATE UNIQUE INDEX IX_Orders_Session_User ON dbo.Orders (SessionId, UserId);
GO

CREATE TABLE dbo.OrderLineItems
(
    Id         UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_OrderLineItems PRIMARY KEY,
    OrderId    UNIQUEIDENTIFIER NOT NULL,
    MenuItemId UNIQUEIDENTIFIER NOT NULL,
    Quantity   INT              NOT NULL,
    CONSTRAINT FK_OrderLineItems_Orders FOREIGN KEY (OrderId) REFERENCES dbo.Orders (Id) ON DELETE CASCADE,
    CONSTRAINT FK_OrderLineItems_MenuItems FOREIGN KEY (MenuItemId) REFERENCES dbo.MenuItems (Id)
);
GO

CREATE TABLE dbo.AuditLogs
(
    Id                UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_AuditLogs PRIMARY KEY,
    CompanyId         UNIQUEIDENTIFIER NULL,
    UserId            UNIQUEIDENTIFIER NULL,
    Action            NVARCHAR(500)    NOT NULL,
    ActorDisplayName  NVARCHAR(200)    NOT NULL,
    CompanyName       NVARCHAR(200)    NULL,
    Timestamp         DATETIME2        NOT NULL,
    CONSTRAINT FK_AuditLogs_Companies FOREIGN KEY (CompanyId) REFERENCES dbo.Companies (Id),
    CONSTRAINT FK_AuditLogs_Users FOREIGN KEY (UserId) REFERENCES dbo.Users (Id)
);
CREATE INDEX IX_AuditLogs_Timestamp ON dbo.AuditLogs (Timestamp DESC);
GO

PRINT 'TeamBites schema created successfully.';
GO
