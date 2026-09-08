import type { Metadata } from "next";
import Link from "next/link";
import { Page } from "@/components/ui/page";
import { getServerLocale } from "@/lib/i18n-server";
import { t } from "@/lib/i18n";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  return {
    title: t(locale, "privacy"),
    description:
      locale === "hy"
        ? "Ինչպես է Կենտրոնը մշակում հաշիվները, տեղադրությունը, լուսանկարները և հաղորդումները։"
        : "How Kentron handles accounts, location, photos, and reports.",
  };
}

export default async function PrivacyPage() {
  const locale = await getServerLocale();
  const hy = locale === "hy";
  return (
    <Page width="read">
      <h1 className="type-display">
        {t(locale, "privacy")}
      </h1>
      <p className="type-body mt-3 text-dim">
        {hy
          ? "Կենտրոնը Երևանի քաղաքային ուղեցույց է։ Այս էջը բացատրում է՝ ինչ տվյալներ ենք պահում և ինչու։ Կապ՝ "
          : "Kentron is a Yerevan field guide. This page explains what we store and why. Contact "}
        <a href="mailto:hello@kentron.am" className="font-semibold text-fg">
          hello@kentron.am
        </a>
        .
      </p>
      <div className="mt-8 space-y-7 text-[14.5px] leading-7 text-dim">
        <section>
          <h2 className="text-[17px] font-medium text-fg">
            {t(locale, "account")}
          </h2>
          <p className="mt-2">
            {hy
              ? "Հաշիվ ստեղծելիս պահվում են ձեր էլ․ փոստը, ցուցադրվող անունը, ըստ ցանկության՝ հաշվի լուսանկարը, կարգավորումները, պահվածները, հաղորդումները և ձեր հրապարակած նյութերը։ Նիստի cookie-ները պահում են մուտքը։ Հաշվի տվյալները կարող եք արտահանել կամ ջնջել Խմբագրել հաշիվը էջից։"
              : "Creating an account stores your email, display name, optional profile photo, preferences, saved items, reports, and content you publish. Session cookies keep you signed in. You can export or delete the account from Edit profile."}
          </p>
        </section>
        <section>
          <h2 className="text-[17px] font-medium text-fg">
            {hy ? "Տեղադրություն" : "Location"}
          </h2>
          <p className="mt-2">
            {hy
              ? "Հեռավորությունը հաշվարկվում է ձեր սարքի դիրքից միայն թույլտվությունից հետո։ Այդ դիրքը սերվերում չի պահվում։ Ուղիղ գրառումների նշիչները կլորացվում են մոտ 100 մետրանոց ցանցով և չեն պահպանում սարքի ճշգրիտ դիրքը։"
              : "Distances are measured from your device only after you grant location. That device position is not stored on the server. Live-post pins are rounded to roughly a 100-metre grid and do not retain the device’s precise position."}
          </p>
        </section>
        <section>
          <h2 className="text-[17px] font-medium text-fg">
            {hy ? "Լուսանկարներ և գրառումներ" : "Photos and posts"}
          </h2>
          <p className="mt-2">
            {hy
              ? "Միջոցառումների և ուղիղ գրառումների լուսանկարները հանրային են, որպեսզի քարտեզը կարողանա ցուցադրել դրանք։ Ուղիղ գրառման հանրային տվյալներում հաշվի նույնացուցիչ չի ցուցադրվում։ Ձեր անունն ու հաշվի լուսանկարը երևում են ձեր հրապարակած նախատեսված միջոցառումներում։"
              : "Event and live-post photos are public so the map can display them. Public live-post data does not expose an account identifier. Your profile name and photo appear on planned events you publish."}
          </p>
        </section>
        <section>
          <h2 className="text-[17px] font-medium text-fg">
            {hy ? "Կարգավորումներ" : "Preferences"}
          </h2>
          <p className="mt-2">
            {hy
              ? "Տեսքի, միավորների, ժամանակացույցի և շարժման կարգավորումները մնում են այս դիտարկիչում, իսկ մուտքից հետո համաժամեցվում են ձեր հաշվին։"
              : "Appearance, units, timeline, and motion preferences stay in this browser until you log in, then sync to your account."}
          </p>
        </section>
        <section>
          <h2 className="text-[17px] font-medium text-fg">
            {hy ? "Հաղորդումներ" : "Reports"}
          </h2>
          <p className="mt-2">
            {hy
              ? "Հաղորդումը պահում է ձեր հաշվի նույնացուցիչը, բովանդակության նույնացուցիչը, պատճառը և ըստ ցանկության մանրամասները։ Նույն օգտատիրոջ կրկնակի հաղորդումը նույն նյութի մասին երկրորդ անգամ չի պահվում։"
              : "A report records your account identifier, the content identifier, a reason, and optional details so Kentron can review it. Repeat reports by the same user for the same item are not stored twice."}
          </p>
        </section>
        <section>
          <h2 className="text-[17px] font-medium text-fg">
            {hy ? "Պահպանում և ջնջում" : "Retention and deletion"}
          </h2>
          <p className="mt-2">
            {hy
              ? "Ուղիղ գրառումները չորս ժամ անց հեռանում են հանրային տեսքից։ Հաշիվը ջնջելիս հեռացվում են դրա տվյալներն ու պատկանող մեդիա ֆայլերը՝ բացառությամբ այն տվյալների, որոնք օրենքով պարտավոր ենք պահել։"
              : "Live posts leave public view after four hours. Deleting an account removes its account-owned data and media, except where retention is required by law."}
          </p>
        </section>
      </div>
      <p className="mt-8 text-[12px] text-faint">
        {hy
          ? "Վերջին թարմացում՝ 7 սեպտեմբերի, 2026 թ․"
          : "Last updated: 7 September 2026"}
      </p>
      <p className="mt-10 text-[13px] text-dim">
        <Link
          href="/terms"
          className="font-semibold text-fg hover:text-apricot"
        >
          {t(locale, "terms")}
        </Link>
        {" · "}
        <Link
          href="/about"
          className="font-semibold text-fg hover:text-apricot"
        >
          {hy ? "Կենտրոնի մասին" : "About"}
        </Link>
      </p>
    </Page>
  );
}
