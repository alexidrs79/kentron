import Image from "next/image";
import Link from "next/link";
import { AuthForm } from "@/components/auth-form";

export function AuthPage({ mode }: { mode: "login" | "signup" }) {
  const signup = mode === "signup";

  return (
    <section className="grid min-h-[calc(100dvh-72px)] md:min-h-dvh md:grid-cols-2">
      <div className="relative hidden overflow-hidden border-r border-line md:block">
        <Image
          src="/illustrations/cascade-auth.jpg"
          alt="A woman checking her phone while walking near the Cascade"
          fill
          priority
          className="object-cover"
          sizes="50vw"
        />
      </div>
      <div className="grid place-items-center px-5 py-10 md:px-10">
        <div className="w-full max-w-sm">
          <p className="font-mono text-[11px] text-paper-2">
            /{signup ? "signup" : "login"}
          </p>
          <h1 className="mt-4 font-display text-4xl font-semibold tracking-[-0.04em]">
            {signup ? "Create an organizer account" : "Welcome back"}
          </h1>
          <p className="mt-3 text-sm leading-6 text-paper-2">
            {signup
              ? "For planned events and saved places. Live posts stay anonymous."
              : "Manage planned events and the places you saved."}
          </p>
          <AuthForm mode={mode} />
          <p className="mt-6 text-sm text-paper-2">
            {signup ? "Already have an account?" : "New here?"}{" "}
            <Link
              href={signup ? "/login" : "/signup"}
              className="text-paper underline decoration-line underline-offset-4"
            >
              {signup ? "Log in" : "Sign up"}
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
