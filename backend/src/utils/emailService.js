const { Resend } = require('resend');

/**
 * Lazily initialise the Resend client so the module can load even before
 * the server fully validates env vars. The client is created once per
 * process and reused across all calls.
 */
let _resend = null;
const getClient = () => {
  if (!_resend) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error(
        '[emailService] RESEND_API_KEY is not set. Add it to your .env file.'
      );
    }
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
};

const getFromAddress = () =>
  `${process.env.EMAIL_FROM_NAME || 'EquipRental'} <${process.env.EMAIL_FROM_ADDRESS}>`;

// ─── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Send an email via Resend and throw on failure.
 * Resend returns { data, error } instead of throwing — we normalise that here
 * so callers can use standard try/catch.
 */
const send = async ({ to, subject, html }) => {
  const client = getClient();

  const { data, error } = await client.emails.send({
    from: getFromAddress(),
    to: [to],
    subject,
    html,
  });

  if (error) {
    console.error('[emailService] Resend API error:', error);
    throw new Error(error.message || 'Failed to send email via Resend.');
  }

  return data;
};

// ─── Public API ────────────────────────────────────────────────────────────────

/**
 * Send the initial email-verification link after registration.
 *
 * @param {string} email      — recipient address
 * @param {string} name       — recipient display name
 * @param {string} verifyUrl  — full verification URL containing the raw token
 */
const sendVerificationEmail = async (email, name, verifyUrl) => {
  await send({
    to: email,
    subject: 'Verify your EquipRental account',
    html: buildVerificationHtml(name, verifyUrl),
  });
};

/**
 * Send a fresh verification link when the user requests a resend.
 * The previous token is already invalidated by authService before this is called.
 */
const sendResendVerificationEmail = async (email, name, verifyUrl) => {
  await send({
    to: email,
    subject: 'Your new EquipRental verification link',
    html: buildResendHtml(name, verifyUrl),
  });
};

// ─── HTML Templates ────────────────────────────────────────────────────────────

const buildVerificationHtml = (name, verifyUrl) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Verify your email</title>
</head>
<body style="margin:0;padding:0;background-color:#0f172a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0f172a;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background-color:#1e293b;border-radius:16px;border:1px solid #334155;overflow:hidden;">

          <!-- Header -->
          <tr>
            <td style="padding:32px 40px 24px;border-bottom:1px solid #334155;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background-color:#ea580c;border-radius:10px;padding:10px 14px;">
                    <span style="color:#ffffff;font-size:18px;font-weight:800;letter-spacing:-0.5px;">Equip</span><span style="color:#fed7aa;font-size:18px;font-weight:800;">Rental</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;">
              <h1 style="margin:0 0 8px;color:#f1f5f9;font-size:22px;font-weight:700;">Verify your email address</h1>
              <p style="margin:0 0 24px;color:#94a3b8;font-size:15px;line-height:1.7;">
                Hi <strong style="color:#e2e8f0;">${name}</strong>, thanks for signing up.<br/>
                Click the button below to verify your email and activate your account.
              </p>

              <!-- CTA -->
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="border-radius:10px;background:linear-gradient(to bottom,#f97316,#ea580c);">
                    <a href="${verifyUrl}"
                       target="_blank"
                       style="display:inline-block;padding:14px 32px;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;border-radius:10px;">
                      Verify my email
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:24px 0 0;color:#64748b;font-size:13px;line-height:1.6;">
                This link expires in <strong style="color:#94a3b8;">30 minutes</strong>.<br/>
                If you didn't create an account, you can safely ignore this email.
              </p>

              <!-- Fallback plain link -->
              <p style="margin:20px 0 0;color:#475569;font-size:12px;word-break:break-all;">
                Button not working? Copy this link into your browser:<br/>
                <a href="${verifyUrl}" style="color:#f97316;">${verifyUrl}</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px;border-top:1px solid #334155;">
              <p style="margin:0;color:#475569;font-size:12px;">
                &copy; ${new Date().getFullYear()} Equipment Rental Manager. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

const buildResendHtml = (name, verifyUrl) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>New verification link</title>
</head>
<body style="margin:0;padding:0;background-color:#0f172a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0f172a;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background-color:#1e293b;border-radius:16px;border:1px solid #334155;overflow:hidden;">

          <!-- Header -->
          <tr>
            <td style="padding:32px 40px 24px;border-bottom:1px solid #334155;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background-color:#ea580c;border-radius:10px;padding:10px 14px;">
                    <span style="color:#ffffff;font-size:18px;font-weight:800;letter-spacing:-0.5px;">Equip</span><span style="color:#fed7aa;font-size:18px;font-weight:800;">Rental</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;">
              <h1 style="margin:0 0 8px;color:#f1f5f9;font-size:22px;font-weight:700;">New verification link</h1>
              <p style="margin:0 0 24px;color:#94a3b8;font-size:15px;line-height:1.7;">
                Hi <strong style="color:#e2e8f0;">${name}</strong>,<br/>
                Here's your new verification link. Your previous link has been invalidated.
              </p>

              <!-- CTA -->
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="border-radius:10px;background:linear-gradient(to bottom,#f97316,#ea580c);">
                    <a href="${verifyUrl}"
                       target="_blank"
                       style="display:inline-block;padding:14px 32px;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;border-radius:10px;">
                      Verify my email
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:24px 0 0;color:#64748b;font-size:13px;line-height:1.6;">
                This link expires in <strong style="color:#94a3b8;">30 minutes</strong>.<br/>
                If you didn't request this, you can safely ignore this email.
              </p>

              <p style="margin:20px 0 0;color:#475569;font-size:12px;word-break:break-all;">
                Button not working? Copy this link into your browser:<br/>
                <a href="${verifyUrl}" style="color:#f97316;">${verifyUrl}</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px;border-top:1px solid #334155;">
              <p style="margin:0;color:#475569;font-size:12px;">
                &copy; ${new Date().getFullYear()} Equipment Rental Manager. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

module.exports = { sendVerificationEmail, sendResendVerificationEmail };
