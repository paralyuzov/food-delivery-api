import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;
  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: this.configService.get('MAIL_USER'),
        pass: this.configService.get('MAIL_PASS'),
      },
    });
  }
  async sendVerificationEmail(to: string, name: string, token: string) {
    const url = `http://localhost:3000/auth/verify-email?token=${token}`;
    await this.transporter.sendMail({
      from: this.configService.get('MAIL_USER'),
      to,
      subject: 'Verify Your Email - Food Delivery',
      html: `
        <h1>Welcome ${name}!</h1>
        <p>Please click the link below to verify your email address:</p>
        <a href="${url}" style="padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">
          Verify Email
        </a>
        <p>Or copy and paste this link in your browser:</p>
        <p>${url}</p>
        <p>This link will expire in 24 hours.</p>
      `,
    });
  }
}
