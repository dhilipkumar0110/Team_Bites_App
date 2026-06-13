using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TeamBites.Infrastructure.Services;
using MailKit.Net.Smtp;
using MailKit.Security;
using TeamBites.Application.Interfaces;
using MimeKit;

namespace TeamBites.Infrastructure.Services;

public class EmailSettings
{
    public string Host { get; set; } = string.Empty;
    public int Port { get; set; } = 587;
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string FromEmail { get; set; } = string.Empty;
    public string FromName { get; set; } = string.Empty;
    public string AppBaseUrl { get; set; } = string.Empty;
}

public class EmailService(IOptions<EmailSettings> options, ILogger<EmailService> logger) : IEmailService
{
    private readonly EmailSettings _settings = options.Value;

    public async Task SendInviteEmailAsync(
        string toEmail, string toName, string inviteToken, CancellationToken ct = default)
    {
        var acceptUrl = $"{_settings.AppBaseUrl}/accept-invite?token={inviteToken}";

        var body = $"""
            <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;color:#1a1a1a;">
              <div style="background:#0F6E56;padding:28px 32px;border-radius:10px 10px 0 0;">
                <h2 style="color:#fff;margin:0;font-size:22px;">🍛 You're invited to Team Bites</h2>
              </div>
              <div style="background:#f9f9f7;padding:28px 32px;border-radius:0 0 10px 10px;border:1px solid #e5e5e0;">
                <p style="margin:0 0 16px;">Hi <strong>{toName}</strong>,</p>
                <p style="margin:0 0 16px;line-height:1.6;">
                  Your company admin has added you to <strong>Team Bites</strong> — the team food order manager.
                  Click the button below to accept your invite and set your password.
                </p>
                <a href="{acceptUrl}"
                   style="display:inline-block;background:#0F6E56;color:#fff;padding:12px 28px;
                          border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;margin:8px 0 20px;">
                  Accept invite &amp; set password
                </a>
                <p style="margin:16px 0 0;font-size:13px;color:#888;">
                  This link expires in <strong>48 hours</strong>. If you didn't expect this email, ignore it.
                </p>
              </div>
            </div>
            """;

        await SendAsync(toEmail, toName, "You're invited to Team Bites", body, ct);
        logger.LogInformation("Invite email sent to {Email}", toEmail);
    }

    public async Task SendPasswordResetConfirmationAsync(
        string toEmail, string toName, CancellationToken ct = default)
    {
        var body = $"""
            <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;color:#1a1a1a;">
              <div style="background:#0F6E56;padding:28px 32px;border-radius:10px 10px 0 0;">
                <h2 style="color:#fff;margin:0;font-size:22px;">🍛 Password set successfully</h2>
              </div>
              <div style="background:#f9f9f7;padding:28px 32px;border-radius:0 0 10px 10px;border:1px solid #e5e5e0;">
                <p style="margin:0 0 16px;">Hi <strong>{toName}</strong>,</p>
                <p style="margin:0 0 0;line-height:1.6;">
                  Your Team Bites account is now active. You can log in anytime using your email and the password you just set.
                </p>
              </div>
            </div>
            """;

        await SendAsync(toEmail, toName, "Your Team Bites account is active", body, ct);
    }

    private async Task SendAsync(
        string toEmail, string toName, string subject, string htmlBody, CancellationToken ct)
    {
        var message = new MimeMessage();
        message.From.Add(new MailboxAddress(_settings.FromName, _settings.FromEmail));
        message.To.Add(new MailboxAddress(toName, toEmail));
        message.Subject = subject;
        message.Body = new TextPart("html") { Text = htmlBody };

        using var client = new SmtpClient();
        await client.ConnectAsync(_settings.Host, _settings.Port, SecureSocketOptions.StartTls, ct);
        await client.AuthenticateAsync(_settings.Username, _settings.Password, ct);
        await client.SendAsync(message, ct);
        await client.DisconnectAsync(true, ct);
    }
}