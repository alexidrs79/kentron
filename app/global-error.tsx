"use client";

import ErrorPage from "@/app/error";
import { LocaleProvider } from "@/components/locale-provider";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <LocaleProvider initialLocale="en">
          <ErrorPage error={error} reset={reset} />
        </LocaleProvider>
      </body>
    </html>
  );
}
