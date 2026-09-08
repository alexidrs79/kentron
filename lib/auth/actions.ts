"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { safeReturnTo } from "@/lib/auth/paths";
import { createClient } from "@/lib/supabase/server";

const signupSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email(),
  password: z.string().min(8).max(72),
});

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8).max(72),
});

export async function loginAction(formData: FormData) {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: "Enter a valid email and password." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });
  if (error) return { error: "Email or password did not match." };

  redirect(safeReturnTo(formData.get("returnTo")));
}

export async function signupAction(formData: FormData) {
  const parsed = signupSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: "Name, email, and an 8-character password are required." };
  }

  const next = safeReturnTo(formData.get("returnTo"));
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email.toLowerCase(),
    password: parsed.data.password,
    options: {
      data: { display_name: parsed.data.name },
      emailRedirectTo: `${site}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });
  if (error) {
    const message = error.message.toLowerCase();
    if (message.includes("already registered")) {
      return { error: "An account with that email already exists." };
    }
    if (message.includes("email")) {
      return { error: "Enter a deliverable email address." };
    }
    if (message.includes("password")) {
      return {
        error: "Use a stronger password with at least eight characters.",
      };
    }
    return { error: "The account could not be created. Try again." };
  }

  if (!data.session) {
    return {
      success: "Account created. Check your email to confirm it, then log in.",
    };
  }

  redirect(next);
}

export async function requestPasswordReset(formData: FormData) {
  const parsed = z.string().trim().email().safeParse(formData.get("email"));
  if (!parsed.success) return { error: "Enter a valid email address." };

  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(
    parsed.data.toLowerCase(),
    { redirectTo: `${site}/auth/callback?next=/reset-password` },
  );
  if (error) return { error: "The reset email could not be sent." };
  return {
    success: "If that email has an account, a reset link is on its way.",
  };
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
