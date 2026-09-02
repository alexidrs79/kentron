"use client";

import { useState } from "react";
import { loginAction, signupAction } from "@/lib/auth/actions";

const fieldClass =
  "min-h-11 w-full rounded-xl border border-line bg-dusk px-3 text-sm text-paper outline-none";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const signup = mode === "signup";
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(formData: FormData) {
    setPending(true);
    setError("");
    const result = signup
      ? await signupAction(formData)
      : await loginAction(formData);
    if (result?.error) setError(result.error);
    setPending(false);
  }

  return (
    <form action={onSubmit} className="mt-8 space-y-5">
      {signup ? (
        <label className="block">
          <span className="mb-2 block text-sm">Name</span>
          <input
            name="name"
            required
            minLength={2}
            className={fieldClass}
            autoComplete="name"
          />
        </label>
      ) : null}
      <label className="block">
        <span className="mb-2 block text-sm">Email</span>
        <input
          name="email"
          className={fieldClass}
          type="email"
          required
          autoComplete="email"
        />
      </label>
      <label className="block">
        <span className="mb-2 block text-sm">Password</span>
        <input
          name="password"
          className={fieldClass}
          type="password"
          required
          minLength={8}
          autoComplete={signup ? "new-password" : "current-password"}
        />
      </label>
      {error ? <p className="text-sm text-tuff">{error}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-tuff px-5 text-sm font-medium text-dusk disabled:opacity-60"
      >
        {pending
          ? signup
            ? "Creating account"
            : "Signing in"
          : signup
            ? "Sign up"
            : "Log in"}
      </button>
    </form>
  );
}
