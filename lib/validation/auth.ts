import { z } from "zod";
import { PASSWORD_MIN_LENGTH, isPasswordStrongEnough } from "@/lib/password";
import { locales } from "@/i18n/routing";

export const emailField = z.string().trim().min(1).email().max(255).transform((v) => v.toLowerCase());
export const phoneField = z
  .string()
  .trim()
  .min(7)
  .max(20)
  .regex(/^\+?[0-9\s-]{7,20}$/);
export const passwordField = z
  .string()
  .min(PASSWORD_MIN_LENGTH)
  .max(128)
  .refine(isPasswordStrongEnough, { message: "weak_password" });

export const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1).max(128),
  remember: z.boolean().default(false),
  callbackUrl: z.string().max(500).optional(),
  locale: z.enum(locales),
});

export const registerSchema = z
  .object({
    name: z.string().trim().min(2).max(120),
    email: emailField,
    phone: phoneField,
    password: passwordField,
    confirmPassword: z.string().min(1).max(128),
    locale: z.enum(locales),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "password_mismatch",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({
  email: emailField,
  locale: z.enum(locales),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(10),
    password: passwordField,
    confirmPassword: z.string().min(1).max(128),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "password_mismatch",
    path: ["confirmPassword"],
  });

export const resendVerificationSchema = z.object({
  email: emailField,
  locale: z.enum(locales),
});
