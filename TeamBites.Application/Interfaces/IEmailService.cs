using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TeamBites.Application.Interfaces
{
    public interface IEmailService
    {
        Task SendInviteEmailAsync(string toEmail, string toName, string inviteToken, CancellationToken ct = default);
        Task SendPasswordResetConfirmationAsync(string toEmail, string toName, CancellationToken ct = default);
    }
}
