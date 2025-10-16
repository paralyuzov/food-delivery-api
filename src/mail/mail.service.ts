import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as sgMail from '@sendgrid/mail';

@Injectable()
export class MailService {
  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('SENDGRID_API_KEY');
    if (!apiKey) {
      throw new Error('SENDGRID_API_KEY is not defined');
    }
    sgMail.setApiKey(apiKey);
  }
  async sendVerificationEmail(to: string, name: string, token: string) {
    const appUrl =
      this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
    const verificationUrl = `${appUrl}/auth/verify-email?token=${token}`;
    const currentYear = new Date().getFullYear();
    const supportUrl = `${appUrl}/support`;
    const unsubscribeUrl = `${appUrl}/unsubscribe`;

    const fromEmail = this.configService.get<string>('SENDGRID_FROM_EMAIL');
    const fromName = this.configService.get<string>('SENDGRID_FROM_NAME');

    if (!fromEmail) {
      throw new Error('SENDGRID_FROM_EMAIL is not defined');
    }

    const msg = {
      to,
      from: {
        email: fromEmail,
        name: fromName || 'Food Express',
      },
      subject: 'Welcome to Food Express — Confirm your email',
      html: `
        <span style="display:none;visibility:hidden;mso-hide:all;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">
          Welcome to Food Express — confirm your email to finish registration.
        </span>

        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:24px 12px;">
          <tr>
            <td align="center">
              <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden;">
                <tr>
                  <td style="padding:20px 24px;background:#0f172a;text-align:left;">
                    <a href="${appUrl}" target="_blank" style="display:inline-block;text-decoration:none;">
                      <div style="color:#ffffff;font-size:18px;font-weight:700;font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,'Noto Sans',sans-serif;">
                        🍕 Food Express
                      </div>
                    </a>
                  </td>
                </tr>

                <tr>
                  <td style="padding:28px 24px 16px 24px;font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,'Noto Sans',sans-serif;color:#0f172a;">
                    <h1 style="margin:0 0 12px 0;font-size:20px;line-height:1.25;font-weight:700;">Welcome, ${name} 👋</h1>
                    <p style="margin:0 0 18px 0;font-size:15px;color:#374151;line-height:1.5;">
                      Thanks for creating an account on <strong>Food Express</strong>. Please confirm your email address to activate your account and start ordering.
                    </p>

                    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:18px 0;">
                      <tr>
                        <td align="center">
                          <a href="${verificationUrl}" target="_blank" style="background:#06b6d4;color:#ffffff;border-radius:8px;padding:12px 20px;display:inline-block;text-decoration:none;font-weight:600;font-size:15px;">
                            Confirm your email
                          </a>
                        </td>
                      </tr>
                    </table>

                    <p style="margin:12px 0 0 0;font-size:13px;color:#6b7280;line-height:1.4;">
                      If the button doesn't work, copy and paste this link in your browser:
                      <br>
                      <a href="${verificationUrl}" target="_blank" style="color:#0ea5a4;word-break:break-all;">${verificationUrl}</a>
                    </p>
                  </td>
                </tr>

                <tr>
                  <td style="padding:12px 24px 20px 24px;background:#f8fafc;border-top:1px solid #eef2f7;font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,'Noto Sans',sans-serif;color:#475569;">
                    <p style="margin:0;font-size:13px;line-height:1.4;">
                      If you didn't sign up for Food Express, you can safely ignore this email. This link will expire in <strong>24 hours</strong>.
                    </p>
                  </td>
                </tr>

                <tr>
                  <td style="padding:18px 24px;text-align:center;font-size:12px;color:#9aa0a6;font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,'Noto Sans',sans-serif;">
                    <p style="margin:0 0 6px 0;">
                      Food Express — <a href="${appUrl}" style="color:#9aa0a6;text-decoration:underline;">${appUrl}</a>
                    </p>
                    <p style="margin:0;font-size:11px;color:#bdc6cf;">
                      © ${currentYear} Food Express. All rights reserved.
                    </p>
                    <p style="margin:8px 0 0 0;font-size:11px;color:#9aa0a6;">
                      <a href="${unsubscribeUrl}" style="color:#9aa0a6;text-decoration:underline;">Unsubscribe</a> • <a href="${supportUrl}" style="color:#9aa0a6;text-decoration:underline;">Support</a>
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      `,
    };

    await sgMail.send(msg);
  }

  async sendResetPasswordEmail(to: string, name: string, token: string) {
    const appUrl =
      this.configService.get<string>('FRONTEND_URL') || 'http://localhost:4200';
    const resetUrl = `${appUrl}/auth/reset-password?token=${token}`;
    const currentYear = new Date().getFullYear();
    const supportUrl = `${appUrl}/support`;
    const unsubscribeUrl = `${appUrl}/unsubscribe`;

    const fromEmail = this.configService.get<string>('SENDGRID_FROM_EMAIL');
    const fromName = this.configService.get<string>('SENDGRID_FROM_NAME');

    if (!fromEmail) {
      throw new Error('SENDGRID_FROM_EMAIL is not defined');
    }

    const msg = {
      to,
      from: {
        email: fromEmail,
        name: fromName || 'Food Express',
      },
      subject: 'Reset Your Password - Food Express',
      html: `
        <span style="display:none;visibility:hidden;mso-hide:all;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">
          Reset your Food Express password — secure your account.
        </span>

        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:24px 12px;">
          <tr>
            <td align="center">
              <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden;">
                <tr>
                  <td style="padding:20px 24px;background:#0f172a;text-align:left;">
                    <a href="${appUrl}" target="_blank" style="display:inline-block;text-decoration:none;">
                      <div style="color:#ffffff;font-size:18px;font-weight:700;font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,'Noto Sans',sans-serif;">
                        🍕 Food Express
                      </div>
                    </a>
                  </td>
                </tr>

                <tr>
                  <td style="padding:28px 24px 16px 24px;font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,'Noto Sans',sans-serif;color:#0f172a;">
                    <h1 style="margin:0 0 12px 0;font-size:20px;line-height:1.25;font-weight:700;">Hello, ${name} 🔐</h1>
                    <p style="margin:0 0 18px 0;font-size:15px;color:#374151;line-height:1.5;">
                      You requested to reset your password for your <strong>Food Express</strong> account. Click the button below to create a new password.
                    </p>

                    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:18px 0;">
                      <tr>
                        <td align="center">
                          <a href="${resetUrl}" target="_blank" style="background:#dc2626;color:#ffffff;border-radius:8px;padding:12px 20px;display:inline-block;text-decoration:none;font-weight:600;font-size:15px;">
                            Reset your password
                          </a>
                        </td>
                      </tr>
                    </table>

                    <p style="margin:12px 0 0 0;font-size:13px;color:#6b7280;line-height:1.4;">
                      If the button doesn't work, copy and paste this link in your browser:
                      <br>
                      <a href="${resetUrl}" target="_blank" style="color:#0ea5a4;word-break:break-all;">${resetUrl}</a>
                    </p>
                  </td>
                </tr>

                <tr>
                  <td style="padding:12px 24px 20px 24px;background:#fef3f2;border-top:1px solid #fed7d7;font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,'Noto Sans',sans-serif;color:#991b1b;">
                    <p style="margin:0;font-size:13px;line-height:1.4;">
                      <strong>Security notice:</strong> If you didn't request a password reset, you can safely ignore this email. This link will expire in <strong>15 minutes</strong>.
                    </p>
                  </td>
                </tr>

                <tr>
                  <td style="padding:18px 24px;text-align:center;font-size:12px;color:#9aa0a6;font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,'Noto Sans',sans-serif;">
                    <p style="margin:0 0 6px 0;">
                      Food Express — <a href="${appUrl}" style="color:#9aa0a6;text-decoration:underline;">${appUrl}</a>
                    </p>
                    <p style="margin:0;font-size:11px;color:#bdc6cf;">
                      © ${currentYear} Food Express. All rights reserved.
                    </p>
                    <p style="margin:8px 0 0 0;font-size:11px;color:#9aa0a6;">
                      <a href="${unsubscribeUrl}" style="color:#9aa0a6;text-decoration:underline;">Unsubscribe</a> • <a href="${supportUrl}" style="color:#9aa0a6;text-decoration:underline;">Support</a>
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      `,
    };

    await sgMail.send(msg);
  }
}
