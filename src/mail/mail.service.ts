import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';

const logoAttachment = {
  filename: 'logo.png',
  path: path.join(process.cwd(), 'src', 'assets', 'logo.png'),
  cid: 'osta-logo',
};

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: Transporter;

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.getEnvValue('MAIL_USER'),
        pass: this.getEnvValue('MAIL_PASS'),
      },
    });
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
    const templatePath = path.join(__dirname, 'templates', templateName);
    let html = fs.readFileSync(templatePath, 'utf-8');
    for (const [key, value] of Object.entries(replacements)) {
      html = html.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }
    return html;
  }

  async sendVerificationEmail(email: string, token: string) {
    const backendUrl =
      this.configService.get<string>('APP_URL') ||
      this.configService.get<string>('BACKEND_URL') ||
      `http://localhost:${this.configService.get<string>('PORT') || 3000}`;
    const link = `${backendUrl}/auth/verify-email?token=${token}`;

    await this.transporter.sendMail({
      from: `"Osta App" <${this.getEnvValue('MAIL_USER')}>`,
      to: email,
      subject: 'تأكيد البريد الإلكتروني - اسطي',
      attachments: [logoAttachment],
      html: `
    <div style="margin:0; padding:40px 20px; background:#f4f8f4; font-family:Segoe UI,Arial,sans-serif; direction:rtl; text-align:right;">
      <div style="max-width:600px; margin:auto; background:#ffffff; border-radius:20px; overflow:hidden; box-shadow:0 10px 30px rgba(0,0,0,.08);">

        <!-- Header -->
        <div style="background:#1B5E20; padding:30px; text-align:center;">
<div class="logo">
  <img
    src="cid:osta-logo"
    alt="أوسطا"
style="max-width:180px;height:auto;margin-bottom:30px;"  />
</div>
          <p style="color:#d8ead9; margin-top:10px; font-size:15px;">
            منصة الخدمات الاحترافية
          </p>
        </div>

        <!-- Content -->
        <div style="padding:40px 30px; text-align:center;">
          <div style="width:90px; height:90px; margin:auto; border-radius:50%; background:#E8F5E9; line-height:90px; font-size:42px;">
            ✉️
          </div>

          <h2 style="color:#1B5E20; margin-top:25px;">
            تأكيد عنوان البريد الإلكتروني
          </h2>

          <p style="color:#666; line-height:1.8; font-size:15px; margin-top:15px;">
            مرحبًا بك في أوسطا. برجاء تأكيد بريدك الإلكتروني لتفعيل حسابك والبدء في استخدام جميع مميزات المنصة.
          </p>

          <a href="${link}" style="display:inline-block; margin-top:30px; background:#1B5E20; color:white; padding:14px 32px; border-radius:12px; text-decoration:none; font-size:16px; font-weight:600;">
            تأكيد البريد الإلكتروني
          </a>

          <p style="margin-top:25px; color:#888; font-size:14px;">
             هذا الرابط صالح لمدة <strong>24 ساعة</strong>
          </p>
        </div>

        <!-- Footer -->
        <div style="background:#fafafa; padding:20px; text-align:center; border-top:1px solid #eee;">
          <p style="color:#888; font-size:13px; margin:0;">
            منصة اسطي © 2026
          </p>
          <p style="color:#aaa; font-size:12px; margin-top:8px;">
            إذا لم تقم بإنشاء هذا الحساب، يمكنك تجاهل هذا البريد بأمان.
          </p>
        </div>

      </div>
    </div>
    `,
    });
  }

  async sendOtp(email: string, otp: string) {
    const html = this.loadTemplate('otp.html', {
      OTP: otp,
      TITLE: 'إعادة تعيين كلمة المرور',
      HEADER: 'رمز التحقق الخاص بك',
      MESSAGE:
        'استخدم هذا الرمز لإعادة تعيين كلمة المرور الخاصة بحسابك في أوسطا.',
      NOTE: 'هذا الرمز صالح لفترة قصيرة فقط ولا تشاركه مع أي شخص.',
      FOOTER:
        'إذا لم تطلب إعادة تعيين كلمة المرور، يمكنك تجاهل هذا البريد بأمان.',
    });

    await this.transporter.sendMail({
      from: `"Osta App" <${this.getEnvValue('MAIL_USER')}>`,
      to: email,
      subject: 'رمز التحقق لإعادة تعيين كلمة المرور - اسطي',
      attachments: [logoAttachment],
      html,
    });
  }

  getVerifiedHtml(success: boolean): string {
    return this.loadTemplate('verified.html', {
      ICON: success
        ? `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
</svg>
`
        : `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
</svg>
`,
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
    await this.transporter.sendMail({
      from: `"Osta App" <${this.getEnvValue('MAIL_USER')}>`,
      to: email,
      subject: `فاتورة ${data.invoiceNumber} - أوسطا`,
      attachments: [logoAttachment],
      html: `
<!doctype html>
<html lang="ar" dir="rtl">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>فاتورة - اسطي</title>
  </head>
  <body>
    <div style="margin: 0; padding: 40px 20px; background: #f4f8f4; font-family: Segoe UI, Arial, sans-serif; direction: rtl; text-align: right;">
      <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.08);">
        
        <!-- Header -->
        <div style="background: #1b5e20; padding: 30px; text-align: center">
          <div class="logo">
  <img
    src="cid:osta-logo"
    alt="أوسطا"
style="max-width:180px;height:auto;margin-bottom:30px;"  />
</div>
          <p style="color: #d8ead9; margin-top: 10px; font-size: 15px">منصة الخدمات الاحترافية</p>
        </div>

        <!-- Icon -->
        <div style="padding: 40px 30px 20px; text-align: center">
          <div style="width: 90px; height: 90px; margin: auto; border-radius: 50%; background: #e8f5e9; line-height: 90px; font-size: 42px;">
            🧾
          </div>
          <h2 style="color: #1b5e20; margin-top: 25px">فاتورة مدفوعة بالكامل</h2>
          <p style="color: #888; font-size: 14px;">رقم الفاتورة: <strong style="color: #1b5e20;">${data.invoiceNumber}</strong></p>
          <p style="color: #888; font-size: 14px;">التاريخ: <strong>${new Date(data.createdAt).toLocaleDateString('ar-EG')}</strong></p>
        </div>

        <!-- Details -->
        <div style="padding: 0 30px 30px;">
          
          <!-- Client & Technician -->
          <div style="background: #f9f9f9; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
            <p style="margin: 0 0 10px; color: #555;"><strong>👤 العميل:</strong> ${data.clientName}</p>
            <p style="margin: 0 0 10px; color: #555;"><strong>🔧 الفني:</strong> ${data.technicianName}</p>
            <p style="margin: 0; color: #555;"><strong>🛠️ الخدمة:</strong> ${data.serviceName}</p>
          </div>

          <!-- Completion Note -->
          <div style="background: #f9f9f9; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
            <p style="margin: 0; color: #555;"><strong>📝 ملاحظات:</strong> ${data.completionNote}</p>
          </div>

          <!-- Payment Summary -->
          <div style="border-radius: 12px; overflow: hidden; border: 1px solid #e0e0e0;">
            <div style="background: #1b5e20; padding: 12px 20px;">
              <p style="margin: 0; color: white; font-weight: bold;">💰 ملخص الدفع</p>
            </div>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 12px 20px; border-bottom: 1px solid #eee; color: #555;">العربون المدفوع</td>
                <td style="padding: 12px 20px; border-bottom: 1px solid #eee; color: #555; text-align: left;">${data.depositAmount} جنيه</td>
              </tr>
              <tr>
                <td style="padding: 12px 20px; border-bottom: 1px solid #eee; color: #555;">المبلغ المتبقي المدفوع</td>
                <td style="padding: 12px 20px; border-bottom: 1px solid #eee; color: #555; text-align: left;">${data.remainingAmount} جنيه</td>
              </tr>
              <tr style="background: #e8f5e9;">
                <td style="padding: 12px 20px; font-weight: bold; color: #1b5e20;">الإجمالي</td>
                <td style="padding: 12px 20px; font-weight: bold; color: #1b5e20; text-align: left;">${data.totalPrice} جنيه</td>
              </tr>
            </table>
          </div>

          <!-- Paid Badge -->
          <div style="text-align: center; margin-top: 25px;">
            <span style="background: #e8f5e9; color: #1b5e20; padding: 10px 30px; border-radius: 20px; font-weight: bold; font-size: 16px;">✅ تم الدفع بالكامل</span>
          </div>
        </div>

        <!-- Footer -->
        <div style="background: #fafafa; padding: 20px; text-align: center; border-top: 1px solid #eee;">
          <p style="color: #888; font-size: 13px; margin: 0">منصة اسطي © 2026</p>
        </div>

      </div>
    </div>
  </body>
</html>
    `,
    });
  }

  async sendRefundEmail(
    email: string,
    data: { clientName: string; amount: number },
  ) {
    await this.transporter.sendMail({
      from: `"Osta App" <${process.env.MAIL_USER}>`,
      to: email,
      subject: 'تم استرداد العربون - اسطي',
      attachments: [logoAttachment],
      html: `
<!doctype html>
<html lang="ar" dir="rtl">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  </head>
  <body>
    <div style="margin: 0; padding: 40px 20px; background: #f4f8f4; font-family: Segoe UI, Arial, sans-serif; direction: rtl; text-align: right;">
      <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.08);">
        
        <div style="background: #1b5e20; padding: 30px; text-align: center">
<div class="logo">
  <img
    src="cid:osta-logo"
    alt="أوسطا"
style="max-width:180px;height:auto;margin-bottom:30px;"  />
</div>
          <p style="color: #d8ead9; margin-top: 10px; font-size: 15px">منصة الخدمات الاحترافية</p>
        </div>

        <div style="padding: 40px 30px; text-align: center">
          <div style="width: 90px; height: 90px; margin: auto; border-radius: 50%; background: #e8f5e9; line-height: 90px; font-size: 42px;">
            💰
          </div>
          <h2 style="color: #1b5e20; margin-top: 25px">تم استرداد العربون</h2>
          <p style="color: #555; font-size: 15px;">عزيزي ${data.clientName}،</p>
          <p style="color: #555; font-size: 15px;">تم استرداد مبلغ العربون بنجاح</p>
          
          <div style="background: #e8f5e9; border-radius: 12px; padding: 20px; margin: 25px 0; display: inline-block;">
            <p style="margin: 0; color: #1b5e20; font-size: 24px; font-weight: bold;">${data.amount} جنيه</p>
          </div>
          
          <p style="color: #888; font-size: 13px;">سيظهر المبلغ في حسابك خلال 3-5 أيام عمل</p>
        </div>

        <div style="background: #fafafa; padding: 20px; text-align: center; border-top: 1px solid #eee;">
          <p style="color: #888; font-size: 13px; margin: 0">منصة اسطي © 2026</p>
        </div>

      </div>
    </div>
  </body>
</html>
    `,
    });
  }




  async sendCompensationEmail(
  email: string,
  data: { technicianName: string; amount: number },
) {
  await this.transporter.sendMail({
    from: `"Osta App" <${process.env.MAIL_USER}>`,
    to: email,
    subject: 'تعويض إلغاء طلب - اسطي',
    html: `
<!doctype html>
<html lang="ar" dir="rtl">
  <body>
    <div style="margin: 0; padding: 40px 20px; background: #f4f8f4; font-family: Segoe UI, Arial, sans-serif; direction: rtl; text-align: right;">
      <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.08);">
        
        <div style="background: #1b5e20; padding: 30px; text-align: center">
          <div class="logo">
  <img
    src="cid:osta-logo"
    alt="أوسطا"
style="max-width:180px;height:auto;margin-bottom:30px;"  />
</div>
          <p style="color: #d8ead9; margin-top: 10px; font-size: 15px">منصة الخدمات الاحترافية</p>
        </div>

        <div style="padding: 40px 30px; text-align: center">
          <div style="width: 90px; height: 90px; margin: auto; border-radius: 50%; background: #e8f5e9; line-height: 90px; font-size: 42px;">
            💰
          </div>
          <h2 style="color: #1b5e20; margin-top: 25px">تم إضافة تعويض لمحفظتك</h2>
          <p style="color: #555; font-size: 15px;">عزيزي ${data.technicianName}،</p>
          <p style="color: #555; font-size: 15px;">قام العميل بإلغاء الطلب بعد قبولك له، تم إضافة مبلغ العربون كتعويض إلى محفظتك</p>
          
          <div style="background: #e8f5e9; border-radius: 12px; padding: 20px; margin: 25px 0; display: inline-block;">
            <p style="margin: 0; color: #1b5e20; font-size: 24px; font-weight: bold;">${data.amount} جنيه</p>
          </div>
        </div>

        <div style="background: #fafafa; padding: 20px; text-align: center; border-top: 1px solid #eee;">
          <p style="color: #888; font-size: 13px; margin: 0">منصة أوسطا © 2026</p>
        </div>

      </div>
    </div>
  </body>
</html>
    `,
    });
  }
}
