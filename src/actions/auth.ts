"use server";

import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { nanoid } from "nanoid";
import { z } from "zod";
import { signIn } from "@/auth";
import { AuthError } from "next-auth";

export async function loginAction(
  _prevState: { error: string | null },
  formData: FormData,
): Promise<{ error: string | null }> {
  const identifier = String(formData.get("identifier") ?? "");
  const password = String(formData.get("password") ?? "");

  try {
    await signIn("credentials", {
      identifier,
      password,
      redirectTo: "/post-login",
    });
    return { error: null };
  } catch (err) {
    if (err instanceof AuthError) {
      return { error: "Invalid email/username or password, or your account is not active." };
    }
    // NEXT_REDIRECT is thrown by next-auth on success — rethrow so Next.js can handle it.
    throw err;
  }
}

const forgotSchema = z.object({ identifier: z.string().min(1) });

export async function forgotPasswordAction(
  _prevState: { message: string | null; resetLink?: string },
  formData: FormData,
): Promise<{ message: string | null; resetLink?: string }> {
  const parsed = forgotSchema.safeParse({ identifier: formData.get("identifier") });
  if (!parsed.success) return { message: "Enter your email or username." };

  const identifier = parsed.data.identifier.toLowerCase();
  const user = await prisma.user.findFirst({
    where: { OR: [{ email: identifier }, { username: identifier }] },
  });

  // Always return a generic message so we don't leak account existence.
  const generic = {
    message:
      "If an account exists for that email/username, a password reset link has been generated.",
  };

  if (!user) return generic;

  const token = nanoid(48);
  await prisma.user.update({
    where: { id: user.id },
    data: { resetToken: token, resetTokenExpiry: new Date(Date.now() + 60 * 60 * 1000) },
  });

  const resetLink = `/reset-password?token=${token}`;
  // No SMTP provider is configured for this build — log the link server-side
  // (and surface it in dev/demo mode below) instead of emailing it.
  console.log(`[password-reset] ${user.email} -> ${resetLink}`);

  return { ...generic, resetLink: process.env.NODE_ENV !== "production" ? resetLink : undefined };
}

const resetSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function resetPasswordAction(
  _prevState: { error: string | null; success?: boolean },
  formData: FormData,
): Promise<{ error: string | null; success?: boolean }> {
  const parsed = resetSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const user = await prisma.user.findUnique({ where: { resetToken: parsed.data.token } });
  if (!user || !user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
    return { error: "This reset link is invalid or has expired." };
  }

  const passwordHash = await hashPassword(parsed.data.password);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash, resetToken: null, resetTokenExpiry: null },
  });

  return { error: null, success: true };
}
