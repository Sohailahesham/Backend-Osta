import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';

const ASSETS_DIR = path.join(__dirname, 'assets');
const TEMPLATES_DIR = path.join(__dirname, 'templates');
const logoPath = path.join(ASSETS_DIR, 'logo.png');

// Brand palette (from globals.css)
const COLORS = {
  primary: '#1C4B41',
  primaryDark: '#112D27',
  secondary: '#F1F7E7',
  accent: '#B3E718',
  accentHover: '#9bd015',
  gray: '#636261',
};

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: Transporter;
  private readonly provider: string;

  constructor(private readonly configService: ConfigService) {
    this.provider = (
      this.configService.get<string>('EMAIL_PROVIDER') || 'brevo'
    ).toLowerCase();

    this.transporter = this.createTransporter();

    this.transporter.verify((error) => {
      if (error) {
        this.logger.error(`SMTP VERIFY ERROR (${this.provider}): ${error}`);
      } else {
        this.logger.log(`SMTP server ready (provider: ${this.provider})`);
      }
    });
  }

  private createTransporter(): Transporter {
    if (this.provider === 'gmail') {
      return nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: this.getEnvValue('GMAIL_USER'),
          pass: this.getEnvValue('GMAIL_APP_PASSWORD'),
        },
        connectionTimeout: 15000,
        greetingTimeout: 15000,
        socketTimeout: 15000,
        logger: true,
        debug: true,
      });
    }

    return nodemailer.createTransport({
      host: 'smtp-relay.brevo.com',
      port: 587,
      secure: false,
      requireTLS: true,
      connectionTimeout: 15000,
      greetingTimeout: 15000,
      socketTimeout: 15000,
      auth: {
        user: this.getEnvValue('BREVO_USER'),
        pass: this.getEnvValue('BREVO_SMTP_KEY'),
      },
      logger: true,
      debug: true,
    });
  }

  private getFromAddress(): string {
    if (this.provider === 'gmail') {
      return `"Osta App" <${this.getEnvValue('GMAIL_USER')}>`;
    }
    return `"Osta App" <${this.getEnvValue('BREVO_USER')}>`;
  }

  private getLogoAttachment() {
    if (!fs.existsSync(logoPath)) {
      this.logger.warn(
        `Logo file not found at ${logoPath}, skipping attachment`,
      );
      return [];
    }
    return [
      {
        filename: 'logo.png',
        path: logoPath,
        cid: 'osta-logo',
      },
    ];
  }

  private getEnvValue(key: string): string {
    const value = this.configService.get<string>(key) ?? process.env[key];
    if (!value) {
      throw new InternalServerErrorException(`${key} is not configured`);
    }
    return value.replace(/^"(.*)"$/, '$1').trim();
  }

  private loadTemplate(
    templateName: string,
    replacements: Record<string, string>,
  ): string {
    const templatePath = path.join(TEMPLATES_DIR, templateName);
    let html = fs.readFileSync(templatePath, 'utf-8');
    for (const [key, value] of Object.entries(replacements)) {
      html = html.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }
    return html;
  }

  private async send(mailOptions: nodemailer.SendMailOptions) {
    try {
      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email sent to ${mailOptions.to}: ${info.messageId}`);
      return info;
    } catch (error) {
      this.logger.error(`Failed to send email to ${mailOptions.to}: ${error}`);
      throw new InternalServerErrorException('Failed to send email');
    }
  }

  // ---- Shared layout pieces -------------------------------------------

  private wrapLayout(bodyHtml: string): string {
    return `
<!doctype html>
<html lang="ar" dir="rtl">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  </head>
  <body style="margin:0; padding:0; background:${COLORS.secondary};">
    <div style="margin:0; padding:40px 20px; background:${COLORS.secondary}; font-family:'Segoe UI',Tahoma,Arial,sans-serif; direction:rtl; text-align:right;">
      <div style="max-width:600px; margin:auto; background:#ffffff; border-radius:20px; overflow:hidden; box-shadow:0 10px 30px rgba(28,75,65,0.12);">

        <!-- Top brand strip -->
        <div style="height:6px; background:linear-gradient(to right, #1C4B41 0%, #457546 14%, #6FA143 29%, #85B83D 36%, #9CCF32 43%, #B3E718 50%, #B3E718 100%);"></div>

        <!-- Header with logo -->
        <div style="padding:30px 30px 20px; text-align:center; background:#ffffff;">
          <img
            src="cid:osta-logo"
            alt="أسطى"
            style="max-width:160px; height:auto;"
          />
          <p style="color:${COLORS.gray}; margin-top:10px; font-size:14px;">
            منصة الخدمات الاحترافية
          </p>
        </div>

        ${bodyHtml}

        <!-- Footer -->
        <div style="background:${COLORS.secondary}; padding:20px; text-align:center; border-top:1px solid #e5ece0;">
          <p style="color:${COLORS.gray}; font-size:13px; margin:0;">
            منصة أسطى © 2026
          </p>
        </div>

      </div>
    </div>
  </body>
</html>`;
  }

  private iconCircle(emoji: string): string {
    return `<div style="width:84px; height:84px; margin:auto; border-radius:50%; background:${COLORS.secondary}; line-height:84px; font-size:38px;">${emoji}</div>`;
  }

  private ctaButton(label: string, link: string): string {
    return `<a href="${link}" style="display:inline-block; margin-top:30px; background:${COLORS.accent}; color:${COLORS.primary}; padding:14px 32px; border-radius:12px; text-decoration:none; font-size:16px; font-weight:700;">${label}</a>`;
  }

  // ---- Emails -------------------------------------------------------

  async sendVerificationEmail(email: string, token: string) {
    const backendUrl =
      this.configService.get<string>('APP_URL') ||
      this.configService.get<string>('BACKEND_URL') ||
      `http://localhost:${this.configService.get<string>('PORT') || 3000}`;
    const link = `${backendUrl}/auth/verify-email?token=${token}`;

    const body = `
        <div style="padding:35px 30px; text-align:center;">
          ${this.iconCircle('✉️')}
          <h2 style="color:${COLORS.primary}; margin-top:25px; font-size:22px;">
            تأكيد عنوان البريد الإلكتروني
          </h2>
          <p style="color:${
            COLORS.gray
          }; line-height:1.8; font-size:15px; margin-top:15px;">
            مرحبًا بك في أسطى. برجاء تأكيد بريدك الإلكتروني لتفعيل حسابك والبدء في استخدام جميع مميزات المنصة.
          </p>
          ${this.ctaButton('تأكيد البريد الإلكتروني', link)}
          <p style="margin-top:25px; color:${COLORS.gray}; font-size:13px;">
            هذا الرابط صالح لمدة <strong style="color:${
              COLORS.primary
            };">24 ساعة</strong>
          </p>
        </div>`;

    await this.send({
      from: this.getFromAddress(),
      to: email,
      subject: 'تأكيد البريد الإلكتروني - أسطى',
      attachments: this.getLogoAttachment(),
      html: this.wrapLayout(body),
    });
  }

  async sendOtp(email: string, otp: string) {
    const html = this.loadTemplate('otp.html', {
      OTP: otp,
      TITLE: 'إعادة تعيين كلمة المرور',
      HEADER: 'رمز التحقق الخاص بك',
      MESSAGE:
        'استخدم هذا الرمز لإعادة تعيين كلمة المرور الخاصة بحسابك في أسطى.',
      NOTE: 'هذا الرمز صالح لفترة قصيرة فقط ولا تشاركه مع أي شخص.',
      FOOTER:
        'إذا لم تطلب إعادة تعيين كلمة المرور، يمكنك تجاهل هذا البريد بأمان.',
    });

    await this.send({
      from: this.getFromAddress(),
      to: email,
      subject: 'رمز التحقق لإعادة تعيين كلمة المرور - أسطى',
      attachments: this.getLogoAttachment(),
      html,
    });
  }

  getVerifiedHtml(success: boolean): string {
    return this.loadTemplate('verified.html', {
      ICON: success
        ? `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" width="32" height="32">
  <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
</svg>`
        : `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" width="32" height="32">
  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
</svg>`,
      CLASS: success ? 'success' : 'error',
      MESSAGE: success
        ? 'تم تأكيد البريد الإلكتروني بنجاح'
        : 'فشل تأكيد البريد الإلكتروني',
      SUB_MESSAGE: success
        ? 'يمكنك الآن إغلاق الصفحة وتسجيل الدخول.'
        : 'حاول مرة أخرى أو اطلب رسالة تأكيد جديدة.',
    });
  }

  async sendInvoiceEmail(
    email: string,
    data: {
      invoiceNumber: string;
      clientName: string;
      technicianName: string;
      serviceName: string;
      completionNote: string;
      depositAmount: number;
      totalPrice: number;
      remainingAmount: number;
      createdAt: Date;
    },
  ) {
    const body = `
        <div style="padding:35px 30px 10px; text-align:center;">
          ${this.iconCircle('🧾')}
          <h2 style="color:${
            COLORS.primary
          }; margin-top:25px; font-size:22px;">فاتورة مدفوعة بالكامل</h2>
          <p style="color:${
            COLORS.gray
          }; font-size:14px;">رقم الفاتورة: <strong style="color:${
      COLORS.primary
    };">${data.invoiceNumber}</strong></p>
          <p style="color:${
            COLORS.gray
          }; font-size:14px;">التاريخ: <strong>${new Date(
      data.createdAt,
    ).toLocaleDateString('ar-EG')}</strong></p>
        </div>

        <div style="padding:0 30px 30px;">
          <div style="background:${
            COLORS.secondary
          }; border-radius:12px; padding:20px; margin-bottom:16px;">
            <p style="margin:0 0 10px; color:${
              COLORS.gray
            };"><strong style="color:${COLORS.primary};">👤 العميل:</strong> ${
      data.clientName
    }</p>
            <p style="margin:0 0 10px; color:${
              COLORS.gray
            };"><strong style="color:${COLORS.primary};">🔧 الفني:</strong> ${
      data.technicianName
    }</p>
            <p style="margin:0; color:${COLORS.gray};"><strong style="color:${
      COLORS.primary
    };">🛠️ الخدمة:</strong> ${data.serviceName}</p>
          </div>

          <div style="background:${
            COLORS.secondary
          }; border-radius:12px; padding:20px; margin-bottom:16px;">
            <p style="margin:0; color:${COLORS.gray};"><strong style="color:${
      COLORS.primary
    };">📝 ملاحظات:</strong> ${data.completionNote}</p>
          </div>

          <div style="border-radius:12px; overflow:hidden; border:1px solid #e5ece0;">
            <div style="background:${COLORS.primary}; padding:12px 20px;">
              <p style="margin:0; color:#ffffff; font-weight:bold;">💰 ملخص الدفع</p>
            </div>
            <table style="width:100%; border-collapse:collapse;">
              <tr>
                <td style="padding:12px 20px; border-bottom:1px solid #eee; color:${
                  COLORS.gray
                };">العربون المدفوع</td>
                <td style="padding:12px 20px; border-bottom:1px solid #eee; color:${
                  COLORS.gray
                }; text-align:left;">${data.depositAmount} جنيه</td>
              </tr>
              <tr>
                <td style="padding:12px 20px; border-bottom:1px solid #eee; color:${
                  COLORS.gray
                };">المبلغ المتبقي المدفوع</td>
                <td style="padding:12px 20px; border-bottom:1px solid #eee; color:${
                  COLORS.gray
                }; text-align:left;">${data.remainingAmount} جنيه</td>
              </tr>
              <tr style="background:${COLORS.secondary};">
                <td style="padding:12px 20px; font-weight:bold; color:${
                  COLORS.primary
                };">الإجمالي</td>
                <td style="padding:12px 20px; font-weight:bold; color:${
                  COLORS.primary
                }; text-align:left;">${data.totalPrice} جنيه</td>
              </tr>
            </table>
          </div>

          <div style="text-align:center; margin-top:25px;">
            <span style="background:${COLORS.accent}; color:${
      COLORS.primary
    }; padding:10px 30px; border-radius:20px; font-weight:bold; font-size:15px;">✅ تم الدفع بالكامل</span>
          </div>
        </div>`;

    await this.send({
      from: this.getFromAddress(),
      to: email,
      subject: `فاتورة ${data.invoiceNumber} - أسطى`,
      attachments: this.getLogoAttachment(),
      html: this.wrapLayout(body),
    });
  }

  async sendRefundEmail(
    email: string,
    data: { clientName: string; amount: number },
  ) {
    const body = `
        <div style="padding:35px 30px; text-align:center;">
          ${this.iconCircle('💰')}
          <h2 style="color:${
            COLORS.primary
          }; margin-top:25px; font-size:22px;">تم استرداد العربون</h2>
          <p style="color:${COLORS.gray}; font-size:15px;">عزيزي ${
      data.clientName
    }،</p>
          <p style="color:${
            COLORS.gray
          }; font-size:15px;">تم استرداد مبلغ العربون بنجاح</p>

          <div style="background:${
            COLORS.secondary
          }; border-radius:12px; padding:18px 24px; margin:25px 0; display:inline-block;">
            <p style="margin:0; color:${
              COLORS.primary
            }; font-size:24px; font-weight:bold;">${data.amount} جنيه</p>
          </div>

          <p style="color:${
            COLORS.gray
          }; font-size:13px;">سيظهر المبلغ في حسابك خلال 3-5 أيام عمل</p>
        </div>`;

    await this.send({
      from: this.getFromAddress(),
      to: email,
      subject: 'تم استرداد العربون - أسطى',
      attachments: this.getLogoAttachment(),
      html: this.wrapLayout(body),
    });
  }

  async sendCompensationEmail(
    email: string,
    data: { technicianName: string; amount: number },
  ) {
    const body = `
        <div style="padding:35px 30px; text-align:center;">
          ${this.iconCircle('💰')}
          <h2 style="color:${
            COLORS.primary
          }; margin-top:25px; font-size:22px;">تم إضافة تعويض لمحفظتك</h2>
          <p style="color:${COLORS.gray}; font-size:15px;">عزيزي ${
      data.technicianName
    }،</p>
          <p style="color:${
            COLORS.gray
          }; font-size:15px;">قام العميل بإلغاء الطلب بعد قبولك له، تم إضافة مبلغ العربون كتعويض إلى محفظتك</p>

          <div style="background:${
            COLORS.secondary
          }; border-radius:12px; padding:18px 24px; margin:25px 0; display:inline-block;">
            <p style="margin:0; color:${
              COLORS.primary
            }; font-size:24px; font-weight:bold;">${data.amount} جنيه</p>
          </div>
        </div>`;

    await this.send({
      from: this.getFromAddress(),
      to: email,
      subject: 'تعويض إلغاء طلب - أسطى',
      attachments: this.getLogoAttachment(),
      html: this.wrapLayout(body),
    });
  }
}
