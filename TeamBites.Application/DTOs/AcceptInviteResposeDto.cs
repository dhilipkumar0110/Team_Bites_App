using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TeamBites.Application.DTOs
{
    public record AcceptInviteRequestDto(string Token);

    public record ResetPasswordRequestDto(string Token, string NewPassword, string ConfirmPassword);

    // ── Invite flow response DTO ───────────────────────────────────────────────
    // Returned by AcceptInvite — Angular uses Name to greet the user on
    // the reset-password screen, Token is passed through to the next step.

    public record AcceptInviteResponseDto(string Name, string Email, string Token);
}
