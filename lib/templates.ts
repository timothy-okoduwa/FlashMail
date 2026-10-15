export interface EmailTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  defaultSubject: string;
  html: string;
}

export const DEFAULT_TEMPLATES: EmailTemplate[] = [
  {
    id: "executive-account-update",
    name: "Executive Account & Operations Update",
    category: "Primary Inbox Clean",
    description: "Clean white card container with #008779 top accent line, conversational memo opening, bulletproof table button, and formal director sign-off.",
    defaultSubject: "Important update regarding your account",
    html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Account Update</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f9fafb; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" bgcolor="#f9fafb" style="background-color: #f9fafb; padding: 40px 15px;">
    <tr>
      <td align="center">
        <!-- Clean White Card Container -->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" bgcolor="#ffffff" style="max-width: 560px; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          <!-- Top Accent Brand Line -->
          <tr>
            <td bgcolor="#008779" style="height: 4px; font-size: 1px; line-height: 1px;">&nbsp;</td>
          </tr>
          
          <!-- Content Area -->
          <tr>
            <td style="padding: 36px 36px 28px 36px;">
              <!-- Sender Header Table -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 24px;">
                <tr>
                  <td valign="middle" align="left">
                    <span style="font-size: 15px; font-weight: 800; color: #111827; letter-spacing: 0.5px; text-transform: uppercase;">OILSEC BEN <span style="color: #008779;">INTERNATIONAL</span></span>
                  </td>
                  <td valign="middle" align="right" style="color: #6b7280; font-size: 12px;">
                    Official Notice
                  </td>
                </tr>
              </table>

              <!-- Conversational Opening -->
              <p style="margin: 0 0 16px 0; color: #1f2937; font-size: 15px; line-height: 1.6;">
                Hello Timothy,
              </p>

              <p style="margin: 0 0 16px 0; color: #374151; font-size: 15px; line-height: 1.65;">
                I am reaching out to share our latest operational updates and ensure that your communication preferences and details are up to date on our network.
              </p>

              <p style="margin: 0 0 20px 0; color: #374151; font-size: 15px; line-height: 1.65;">
                We have recently finalized key service improvements for this quarter. Please take a moment to review the confirmed details using the link below:
              </p>

              <!-- Table-Based CTA Button -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin: 24px 0;">
                <tr>
                  <td align="center" bgcolor="#008779" style="border-radius: 6px;">
                    <a href="mailto:hello@oilsecbeninternationalshop.top?subject=Account%20Update%20Confirmation" style="display: inline-block; background-color: #008779; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 6px; font-size: 14px; font-weight: 600; font-family: sans-serif;">
                      Review &amp; Confirm Details &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 24px 0; color: #374151; font-size: 15px; line-height: 1.65;">
                If you have any questions or require custom assistance, simply reply directly to this message and our team will get back to you promptly.
              </p>

              <!-- Real Sign-off -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-top: 1px solid #f3f4f6; padding-top: 20px; margin-top: 20px;">
                <tr>
                  <td>
                    <p style="margin: 0; color: #111827; font-size: 15px; font-weight: 700;">Timothy Lee</p>
                    <p style="margin: 2px 0 0 0; color: #6b7280; font-size: 13px;">Managing Director &bull; Oilsec Ben International</p>
                    <p style="margin: 2px 0 0 0; color: #9ca3af; font-size: 12px;">hello@oilsecbeninternationalshop.top</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td bgcolor="#f9fafb" style="padding: 16px 36px; border-top: 1px solid #e5e7eb; text-align: left;">
              <p style="margin: 0; color: #9ca3af; font-size: 11px; line-height: 1.5;">
                Oilsec Ben International &bull; Verified Communications<br>
                <a href="mailto:unsubscribe@oilsecbeninternationalshop.top?subject=Unsubscribe" style="color: #6b7280; text-decoration: underline;">Unsubscribe</a> &bull;
                <span style="color: #6b7280; margin-left: 6px;">Confidential Business Communication</span>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
  },
  {
    id: "consultation-meeting-request",
    name: "Direct Partnership & Meeting Request",
    category: "Primary Inbox Clean",
    description: "Conversational outreach memo with #008779 top accent line, meeting schedule proposal, bulletproof calendar button, and formal sign-off.",
    defaultSubject: "Quick check-in regarding our conversation",
    html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Meeting Request</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f9fafb; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" bgcolor="#f9fafb" style="background-color: #f9fafb; padding: 40px 15px;">
    <tr>
      <td align="center">
        <!-- Clean White Card Container -->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" bgcolor="#ffffff" style="max-width: 560px; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          <!-- Top Accent Brand Line -->
          <tr>
            <td bgcolor="#008779" style="height: 4px; font-size: 1px; line-height: 1px;">&nbsp;</td>
          </tr>
          
          <!-- Content Area -->
          <tr>
            <td style="padding: 36px 36px 28px 36px;">
              <!-- Sender Header Table -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 24px;">
                <tr>
                  <td valign="middle" align="left">
                    <span style="font-size: 15px; font-weight: 800; color: #111827; letter-spacing: 0.5px; text-transform: uppercase;">OILSEC BEN <span style="color: #008779;">INTERNATIONAL</span></span>
                  </td>
                  <td valign="middle" align="right" style="color: #6b7280; font-size: 12px;">
                    Direct Outreach
                  </td>
                </tr>
              </table>

              <!-- Conversational Opening -->
              <p style="margin: 0 0 16px 0; color: #1f2937; font-size: 15px; line-height: 1.6;">
                Hello Timothy,
              </p>

              <p style="margin: 0 0 16px 0; color: #374151; font-size: 15px; line-height: 1.65;">
                I'm reaching out because we recently upgraded our client services and wanted to personally follow up on how our team can support your upcoming operations.
              </p>

              <p style="margin: 0 0 20px 0; color: #374151; font-size: 15px; line-height: 1.65;">
                My name is <strong>Timothy Lee</strong> from <strong>Oilsec Ben International</strong>. How does <strong>Wednesday at 2:00 PM</strong> sound for a brief 10-minute discovery call?
              </p>

              <p style="margin: 0 0 12px 0; color: #374151; font-size: 14px; line-height: 1.5;">
                If that slot doesn't suit your schedule, feel free to pick any time that works best for you:
              </p>

              <!-- Table-Based CTA Button -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin: 20px 0 24px 0;">
                <tr>
                  <td align="center" bgcolor="#008779" style="border-radius: 6px;">
                    <a href="mailto:hello@oilsecbeninternationalshop.top?subject=Schedule%20a%20Meeting" style="display: inline-block; background-color: #008779; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 6px; font-size: 14px; font-weight: 600; font-family: sans-serif;">
                      Reply with Your Preferred Time &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 24px 0; color: #374151; font-size: 15px; line-height: 1.65;">
                Looking forward to connecting with you.
              </p>

              <!-- Real Sign-off -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-top: 1px solid #f3f4f6; padding-top: 20px; margin-top: 20px;">
                <tr>
                  <td>
                    <p style="margin: 0; color: #111827; font-size: 15px; font-weight: 700;">Timothy Lee</p>
                    <p style="margin: 2px 0 0 0; color: #6b7280; font-size: 13px;">Managing Director &bull; Oilsec Ben International</p>
                    <p style="margin: 2px 0 0 0; color: #9ca3af; font-size: 12px;">hello@oilsecbeninternationalshop.top</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td bgcolor="#f9fafb" style="padding: 16px 36px; border-top: 1px solid #e5e7eb; text-align: left;">
              <p style="margin: 0; color: #9ca3af; font-size: 11px; line-height: 1.5;">
                Oilsec Ben International &bull; Direct Communications<br>
                <a href="mailto:unsubscribe@oilsecbeninternationalshop.top?subject=Unsubscribe" style="color: #6b7280; text-decoration: underline;">Unsubscribe</a> &bull;
                <span style="color: #6b7280; margin-left: 6px;">Confidential Business Communication</span>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
  },
  {
    id: "formal-schedule-announcement",
    name: "Formal Service Announcement & Schedule Notice",
    category: "Primary Inbox Clean",
    description: "Official update memo in a white card with #008779 top accent line, confirmed date details table, bulletproof button, and formal sign-off.",
    defaultSubject: "Confirmed schedule and operational details",
    html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Schedule Notice</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f9fafb; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" bgcolor="#f9fafb" style="background-color: #f9fafb; padding: 40px 15px;">
    <tr>
      <td align="center">
        <!-- Clean White Card Container -->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" bgcolor="#ffffff" style="max-width: 560px; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          <!-- Top Accent Brand Line -->
          <tr>
            <td bgcolor="#008779" style="height: 4px; font-size: 1px; line-height: 1px;">&nbsp;</td>
          </tr>
          
          <!-- Content Area -->
          <tr>
            <td style="padding: 36px 36px 28px 36px;">
              <!-- Sender Header Table -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 24px;">
                <tr>
                  <td valign="middle" align="left">
                    <span style="font-size: 15px; font-weight: 800; color: #111827; letter-spacing: 0.5px; text-transform: uppercase;">OILSEC BEN <span style="color: #008779;">INTERNATIONAL</span></span>
                  </td>
                  <td valign="middle" align="right" style="color: #6b7280; font-size: 12px;">
                    Schedule Notice
                  </td>
                </tr>
              </table>

              <!-- Conversational Opening -->
              <p style="margin: 0 0 16px 0; color: #1f2937; font-size: 15px; line-height: 1.6;">
                Hello Timothy,
              </p>

              <p style="margin: 0 0 16px 0; color: #374151; font-size: 15px; line-height: 1.65;">
                We are writing to share confirmed scheduling details for our upcoming operations briefing and review session.
              </p>

              <!-- Confirmed Details Table -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" bgcolor="#f8fafc" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; margin: 20px 0;">
                <tr>
                  <td style="padding: 16px 20px;">
                    <p style="margin: 0 0 6px 0; font-size: 11px; font-weight: 700; color: #008779; letter-spacing: 1px; text-transform: uppercase;">
                      CONFIRMED SESSION
                    </p>
                    <p style="margin: 0; font-size: 15px; font-weight: 700; color: #0f172a;">
                      Saturday, October 3, 2026 &bull; 6:00 PM – 9:00 PM
                    </p>
                    <p style="margin: 4px 0 0 0; font-size: 13px; color: #64748b;">
                      Operational Review &amp; Member Q&amp;A Session
                    </p>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 20px 0; color: #374151; font-size: 15px; line-height: 1.65;">
                You can review the full agenda and confirmed attendees on our official partner portal:
              </p>

              <!-- Table-Based CTA Button -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin: 20px 0 24px 0;">
                <tr>
                  <td align="center" bgcolor="#008779" style="border-radius: 6px;">
                    <a href="mailto:hello@oilsecbeninternationalshop.top?subject=Agenda%20Request" style="display: inline-block; background-color: #008779; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 6px; font-size: 14px; font-weight: 600; font-family: sans-serif;">
                      Request Full Agenda &amp; Materials &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 24px 0; color: #374151; font-size: 15px; line-height: 1.65;">
                Thank you for your ongoing partnership.
              </p>

              <!-- Real Sign-off -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-top: 1px solid #f3f4f6; padding-top: 20px; margin-top: 20px;">
                <tr>
                  <td>
                    <p style="margin: 0; color: #111827; font-size: 15px; font-weight: 700;">Timothy Lee</p>
                    <p style="margin: 2px 0 0 0; color: #6b7280; font-size: 13px;">Managing Director &bull; Oilsec Ben International</p>
                    <p style="margin: 2px 0 0 0; color: #9ca3af; font-size: 12px;">hello@oilsecbeninternationalshop.top</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td bgcolor="#f9fafb" style="padding: 16px 36px; border-top: 1px solid #e5e7eb; text-align: left;">
              <p style="margin: 0; color: #9ca3af; font-size: 11px; line-height: 1.5;">
                Oilsec Ben International &bull; Official Notice<br>
                <a href="mailto:unsubscribe@oilsecbeninternationalshop.top?subject=Unsubscribe" style="color: #6b7280; text-decoration: underline;">Unsubscribe</a> &bull;
                <span style="color: #6b7280; margin-left: 6px;">Confidential Business Communication</span>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
  }
];
