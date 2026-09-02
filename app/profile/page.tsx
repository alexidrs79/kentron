import { auth } from "@/auth";
import { signOutAction } from "@/lib/auth/actions";
import { db } from "@/lib/db";
import { events } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user) {
    return (
      <section className="grid min-h-[calc(100dvh-72px)] place-items-center px-6 md:min-h-dvh">
        <div className="w-full max-w-md rounded-3xl border border-line bg-surface p-8">
          <p className="font-mono text-[11px] text-paper-2">/profile</p>
          <h1 className="mt-4 font-display text-3xl font-semibold tracking-[-0.04em]">
            Organizer account
          </h1>
          <p className="mt-3 text-sm leading-6 text-paper-2">
            Planned events and saves need an account. Live posts do not.
          </p>
          <Link
            href="/login"
            className="mt-8 inline-flex min-h-11 items-center rounded-xl bg-tuff px-4 text-sm font-medium text-dusk"
          >
            Log in
          </Link>
        </div>
      </section>
    );
  }

  const posted = await db
    .select({
      id: events.id,
      title: events.title,
      venueName: events.venueName,
      startsAt: events.startsAt,
    })
    .from(events)
    .where(eq(events.organizerId, session.user.id));

  const initial = (session.user.name ?? "Y").slice(0, 1);

  return (
    <section className="mx-auto w-full max-w-2xl px-5 py-8 md:px-10 md:py-12">
      <p className="font-mono text-[11px] text-paper-2">/profile</p>
      <div className="mt-6 flex items-center gap-4">
        <span className="grid size-14 place-items-center rounded-full bg-tuff/15 font-display text-xl font-semibold text-tuff">
          {initial}
        </span>
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-[-0.04em]">
            {session.user.name}
          </h1>
          <p className="mt-1 font-mono text-[11px] text-paper-2">
            {session.user.email}
          </p>
        </div>
      </div>
      <h2 className="mt-10 font-display text-lg font-semibold">Posted events</h2>
      {posted.length === 0 ? (
        <p className="mt-3 text-sm text-paper-2">No planned events yet.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {posted.map((event) => (
            <li
              key={event.id}
              className="rounded-2xl border border-line bg-surface px-4 py-3"
            >
              <p className="text-sm font-medium">{event.title}</p>
              <p className="mt-1 font-mono text-[11px] text-paper-2">
                {event.venueName} ·{" "}
                {event.startsAt.toLocaleString("en-GB", {
                  timeZone: "Asia/Yerevan",
                  weekday: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                })}
              </p>
            </li>
          ))}
        </ul>
      )}
      <form action={signOutAction} className="mt-10">
        <button
          type="submit"
          className="inline-flex min-h-11 items-center rounded-xl border border-line px-4 text-sm"
        >
          Log out
        </button>
      </form>
    </section>
  );
}
