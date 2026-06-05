import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class MailService {
  private transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

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
    const link = `${process.env.APP_URL}/auth/verify-email?token=${token}`;

    await this.transporter.sendMail({
      from: `"Osta App" <${process.env.MAIL_USER}>`,
      to: email,
      subject: 'تأكيد البريد الإلكتروني - أوسطا',
      html: `
    <div style="margin:0; padding:40px 20px; background:#f4f8f4; font-family:Segoe UI,Arial,sans-serif; direction:rtl; text-align:right;">
      <div style="max-width:600px; margin:auto; background:#ffffff; border-radius:20px; overflow:hidden; box-shadow:0 10px 30px rgba(0,0,0,.08);">

        <!-- Header -->
        <div style="background:#1B5E20; padding:30px; text-align:center;">
          <h1 style="margin:0; color:white; font-size:34px;">أوسطا 🔧</h1>
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
            منصة أوسطا © 2026
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
      from: `"Osta App" <${process.env.MAIL_USER}>`,
      to: email,
      subject: 'رمز التحقق لإعادة تعيين كلمة المرور - أوسطا',
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
}
