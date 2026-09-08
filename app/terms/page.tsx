import type { Metadata } from "next";
import Link from "next/link";
import { Page } from "@/components/ui/page";
import { getServerLocale } from "@/lib/i18n-server";
import { t } from "@/lib/i18n";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  return {
    title: t(locale, "terms"),
    description:
      locale === "hy"
        ? "Կենտրոնն օգտագործելու կանոնները։"
        : "The rules for using Kentron.",
  };
}

export default async function TermsPage() {
  const locale = await getServerLocale();
  const hy = locale === "hy";
  return (
    <Page width="read">
      <h1 className="type-display">
        {t(locale, "terms")}
      </h1>
      <p className="type-body mt-3 text-dim">
        {hy
          ? "Օգտագործելով Կենտրոնը՝ համաձայնում եք այս պայմաններին։ Հարցերի համար գրեք "
          : "By using Kentron you agree to these terms. Questions go to "}
        <a href="mailto:hello@kentron.am" className="font-semibold text-fg">
          hello@kentron.am
        </a>
        .
      </p>
      <div className="mt-8 space-y-7 text-[14.5px] leading-7 text-dim">
        <section>
          <h2 className="text-[17px] font-medium text-fg">
            {hy ? "Օգտագործում" : "Use"}
          </h2>
          <p className="mt-2">
            {hy
              ? "Կենտրոնը Երևանի ուղիղ պահերի և նախատեսված միջոցառումների քարտեզ է։ Հրապարակեք միայն ճշգրիտ, օրինական բովանդակություն, որը տարածելու իրավունք ունեք։ Արգելվում են սպամը, հետապնդումը և մարդկանց վտանգի ենթարկող նյութերը։"
              : "Kentron is a map of live moments and planned events in Yerevan. Publish only accurate, lawful content you have the right to share. Do not post spam, harassment, or content that puts people at risk."}
          </p>
        </section>
        <section>
          <h2 className="text-[17px] font-medium text-fg">
            {hy ? "Հաշիվներ" : "Accounts"}
          </h2>
          <p className="mt-2">
            {hy
              ? "Դուք պատասխանատու եք ձեր հաշվի գործունեության և մուտքի տվյալների անվտանգության համար։ Մենք կարող ենք հեռացնել բովանդակությունը կամ սահմանափակել այս պայմանները խախտող հաշիվները։"
              : "You are responsible for activity on your account and for keeping its credentials secure. We may unpublish or remove content and may restrict accounts that break these terms."}
          </p>
        </section>
        <section>
          <h2 className="text-[17px] font-medium text-fg">
            {hy ? "Բովանդակություն" : "Content"}
          </h2>
          <p className="mt-2">
            {hy
              ? "Դուք պահպանում եք ձեր վերբեռնած լուսանկարների և տեքստերի իրավունքները և Կենտրոնին տալիս եք ոչ բացառիկ թույլտվություն՝ դրանք ծառայությունում ցուցադրելու համար։ Ուղիղ գրառումները չորս ժամ անց հեռանում են հանրային տեսքից և արխիվ չեն։"
              : "You keep your rights to photos and text you upload and grant Kentron a non-exclusive licence to display them within the service. Live posts leave public view after four hours and are not an archive."}
          </p>
        </section>
        <section>
          <h2 className="text-[17px] font-medium text-fg">
            {hy ? "Երաշխիքներ և պատասխանատվություն" : "Safety and availability"}
          </h2>
          <p className="mt-2">
            {hy
              ? "Միջոցառումներն ու ուղիղ գրառումները հրապարակում են օգտատերերը։ Կենտրոնը չի երաշխավորում, որ տեղեկությունը դեռ արդիական է, անվտանգ է կամ մուտքն ազատ է։ Գնալուց առաջ ստուգեք մանրամասները և օգտագործեք ձեր դատողությունը։ Ծառայությունը կարող է ժամանակավորապես անհասանելի լինել։"
              : "Events and live posts are published by users. Kentron does not guarantee that information is still current, safe, or unticketed. Check details and use your judgement before you go. The service may occasionally be unavailable."}
          </p>
        </section>
        <section>
          <h2 className="text-[17px] font-medium text-fg">
            {hy ? "Փոփոխություններ" : "Changes"}
          </h2>
          <p className="mt-2">
            {hy
              ? "Մենք կարող ենք թարմացնել այս պայմանները, երբ ծառայությունը փոխվի։ Էական փոփոխությունների դեպքում կթարմացնենք այս էջի ամսաթիվը։"
              : "We may update these terms as the service changes. Material changes will be reflected by updating the date on this page."}
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
          href="/privacy"
          className="font-semibold text-fg hover:text-apricot"
        >
          {t(locale, "privacy")}
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
