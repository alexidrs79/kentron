import Link from "next/link";
import { redirect } from "next/navigation";
import { ConfirmForm } from "@/components/confirm-form";
import { Page, PageHead } from "@/components/ui/page";
import { buttonClass } from "@/components/ui/button";
import { loginHref } from "@/lib/auth/paths";
import { createClient } from "@/lib/supabase/server";
import { reviewReport } from "@/lib/organizer/moderation";
import { getServerLocale } from "@/lib/i18n-server";

export default async function AdminReportsPage() {
  const locale = await getServerLocale();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(loginHref("/admin/reports"));
  if (user.app_metadata?.role !== "staff") redirect("/profile");

  const { data: reports = [] } = await supabase
    .from("content_reports")
    .select("id,content_type,content_id,reason,details,status,created_at")
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  return (
    <Page>
      <PageHead
        title={locale === "hy" ? "Հաղորդումներ" : "Reports"}
        description={
          locale === "hy"
            ? `${reports?.length ?? 0} հաղորդում սպասում է ստուգման`
            : `${reports?.length ?? 0} waiting for review`
        }
      />
      <div className="divide-y divide-line rounded-panel border border-line bg-panel">
        {(reports ?? []).length === 0 ? (
          <p className="px-5 py-8 text-[14px] text-dim">
            {locale === "hy"
              ? "Սպասող հաղորդումներ չկան։"
              : "No pending reports."}
          </p>
        ) : (
          (reports ?? []).map((report) => (
            <div
              key={report.id}
              className="flex flex-wrap items-start gap-4 px-5 py-4"
            >
              <div className="min-w-0 flex-1">
                <p className="text-[12px] font-medium text-apricot">
                  {report.content_type} · {report.reason}
                </p>
                <Link
                  href={`/${report.content_type === "live" ? "post" : "event"}/${report.content_id}`}
                  className="mt-1 block font-medium hover:text-apricot"
                >
                  {locale === "hy" ? "Բացել" : "Open"} {report.content_id}
                </Link>
                {report.details ? (
                  <p className="mt-2 text-[13px] leading-5 text-dim">
                    {report.details}
                  </p>
                ) : null}
              </div>
              <div className="flex gap-2">
                <ConfirmForm
                  action={reviewReport}
                  message={
                    locale === "hy"
                      ? "Նշե՞լ հաղորդումը ստուգված՝ առանց բովանդակությունը հեռացնելու։"
                      : "Mark this report as reviewed without taking the content down?"
                  }
                >
                  <input type="hidden" name="reportId" value={report.id} />
                  <input type="hidden" name="status" value="reviewed" />
                  <button
                    type="submit"
                    className={buttonClass({ tone: "quiet", size: "sm" })}
                  >
                    {locale === "hy" ? "Փակել" : "Dismiss"}
                  </button>
                </ConfirmForm>
                <ConfirmForm
                  action={reviewReport}
                  message={
                    locale === "hy"
                      ? "Հեռացնե՞լ հաղորդված բովանդակությունը։"
                      : "Take the reported content down?"
                  }
                >
                  <input type="hidden" name="reportId" value={report.id} />
                  <input type="hidden" name="status" value="actioned" />
                  <button
                    type="submit"
                    className={buttonClass({ tone: "secondary", size: "sm" })}
                  >
                    {locale === "hy" ? "Հեռացնել" : "Take down"}
                  </button>
                </ConfirmForm>
              </div>
            </div>
          ))
        )}
      </div>
    </Page>
  );
}
