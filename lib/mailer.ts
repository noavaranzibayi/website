import nodemailer from "nodemailer";
import type { Locale } from "@/i18n/routing";

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASSWORD = process.env.SMTP_PASSWORD;
const MAIL_FROM = process.env.MAIL_FROM ?? "Noavaran Zibayi <no-reply@noavaranzibayi.com>";

const isConfigured = Boolean(SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASSWORD);

let cachedTransporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (!isConfigured) return null;
  if (!cachedTransporter) {
    cachedTransporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASSWORD },
    });
  }
  return cachedTransporter;
}

/**
 * Sends an email if SMTP is configured via env vars; otherwise logs and
 * no-ops so auth/notification flows keep working in local development
 * without a mail provider. Wire real credentials (SMTP_HOST, SMTP_PORT,
 * SMTP_USER, SMTP_PASSWORD, MAIL_FROM) in .env to activate delivery.
 */
export async function sendMail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}): Promise<{ sent: boolean }> {
  const transporter = getTransporter();
  if (!transporter) {
    console.info(`[mailer] SMTP not configured — would send to ${to}: "${subject}"`);
    return { sent: false };
  }
  await transporter.sendMail({ from: MAIL_FROM, to, subject, html });
  return { sent: true };
}

const DIR: Record<Locale, "rtl" | "ltr"> = { fa: "rtl", ar: "rtl", en: "ltr" };

function wrapEmail(locale: Locale, title: string, bodyHtml: string, ctaLabel?: string, ctaUrl?: string) {
  const dir = DIR[locale];
  return `<!doctype html>
<html lang="${locale}" dir="${dir}">
  <body style="margin:0;padding:0;background:#f4f6f9;font-family:Tahoma,Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
      <tr><td align="center">
        <table width="100%" style="max-width:480px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e5e9f0;">
          <tr><td style="background:#0e3863;padding:24px 32px;">
            <span style="color:#ffffff;font-size:18px;font-weight:bold;">Noavaran Zibayi</span>
          </td></tr>
          <tr><td style="padding:32px;text-align:${dir === "rtl" ? "right" : "left"};">
            <h1 style="font-size:20px;color:#0a2340;margin:0 0 16px;">${title}</h1>
            <div style="font-size:14px;line-height:1.9;color:#374151;">${bodyHtml}</div>
            ${
              ctaLabel && ctaUrl
                ? `<div style="margin-top:28px;"><a href="${ctaUrl}" style="background:#d3a933;color:#0a2340;text-decoration:none;font-weight:bold;padding:12px 24px;border-radius:999px;display:inline-block;font-size:14px;">${ctaLabel}</a></div>`
                : ""
            }
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;
}

const EMAIL_COPY = {
  fa: {
    verifySubject: "تأیید ایمیل - نوآوران زیبایی",
    verifyTitle: "تأیید آدرس ایمیل",
    verifyBody: "برای فعال‌سازی حساب کاربری خود در نوآوران زیبایی، روی دکمه زیر کلیک کنید. این لینک تا ۲۴ ساعت معتبر است.",
    verifyCta: "تأیید ایمیل",
    resetSubject: "بازیابی رمز عبور - نوآوران زیبایی",
    resetTitle: "بازیابی رمز عبور",
    resetBody: "درخواستی برای بازنشانی رمز عبور حساب شما ثبت شده است. اگر این درخواست از طرف شما نبوده، این ایمیل را نادیده بگیرید. این لینک تا ۱ ساعت معتبر است.",
    resetCta: "تنظیم رمز عبور جدید",
  },
  ar: {
    verifySubject: "تأكيد البريد الإلكتروني - نوآوران زیبایی",
    verifyTitle: "تأكيد عنوان بريدك الإلكتروني",
    verifyBody: "لتفعيل حسابك في عيادة نوآوران زیبایی، الرجاء الضغط على الزر أدناه. صلاحية هذا الرابط ٢٤ ساعة.",
    verifyCta: "تأكيد البريد الإلكتروني",
    resetSubject: "إعادة تعيين كلمة المرور - نوآوران زیبایی",
    resetTitle: "إعادة تعيين كلمة المرور",
    resetBody: "تم تقديم طلب لإعادة تعيين كلمة مرور حسابك. إذا لم يكن هذا الطلب منك، يمكنك تجاهل هذا البريد. صلاحية هذا الرابط ساعة واحدة.",
    resetCta: "تعيين كلمة مرور جديدة",
  },
  en: {
    verifySubject: "Verify your email - Noavaran Zibayi",
    verifyTitle: "Verify your email address",
    verifyBody: "To activate your Noavaran Zibayi account, click the button below. This link is valid for 24 hours.",
    verifyCta: "Verify email",
    resetSubject: "Reset your password - Noavaran Zibayi",
    resetTitle: "Reset your password",
    resetBody: "A request was made to reset your account password. If you did not request this, you can safely ignore this email. This link is valid for 1 hour.",
    resetCta: "Set a new password",
  },
} satisfies Record<Locale, Record<string, string>>;

export async function sendVerificationEmail(to: string, locale: Locale, verifyUrl: string) {
  const copy = EMAIL_COPY[locale];
  return sendMail({
    to,
    subject: copy.verifySubject,
    html: wrapEmail(locale, copy.verifyTitle, copy.verifyBody, copy.verifyCta, verifyUrl),
  });
}

export async function sendPasswordResetEmail(to: string, locale: Locale, resetUrl: string) {
  const copy = EMAIL_COPY[locale];
  return sendMail({
    to,
    subject: copy.resetSubject,
    html: wrapEmail(locale, copy.resetTitle, copy.resetBody, copy.resetCta, resetUrl),
  });
}

export async function sendPlainNotificationEmail(
  to: string,
  locale: Locale,
  title: string,
  bodyHtml: string,
  ctaLabel?: string,
  ctaUrl?: string
) {
  return sendMail({
    to,
    subject: title,
    html: wrapEmail(locale, title, bodyHtml, ctaLabel, ctaUrl),
  });
}
