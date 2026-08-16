import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Users } from "lucide-react";
import Reveal, { StaggerGroup, StaggerItem } from "@/components/motion/Reveal";

type TeamItem = { id: string; title: string; text: string };

const TEAM_IMAGES: Record<string, string> = {
  "beauty-consultant": "/illustrations/team-beauty-consultant.png",
  "booking-coordinator": "/illustrations/team-booking-coordinator.png",
  "technical-specialist": "/illustrations/team-technical-specialist.png",
  "customer-support": "/illustrations/team-customer-support.png",
};

export default async function Team() {
  const t = await getTranslations("team");
  const items = t.raw("items") as TeamItem[];

  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
      <Reveal className="max-w-2xl">
        <span className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-gold-500">
          <Users className="h-4 w-4" />
          {t("title")}
        </span>
        <h2 className="mt-2 text-2xl font-extrabold text-navy-800 dark:text-white sm:text-3xl">
          {t("subtitle")}
        </h2>
      </Reveal>

      <StaggerGroup className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => (
          <StaggerItem
            key={item.id}
            className="group relative overflow-hidden rounded-2xl border border-navy-100 bg-white p-6 text-center shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg dark:border-navy-800 dark:bg-navy-900"
          >
            <div className="relative mx-auto h-40 w-32">
              <div className="absolute inset-x-2 bottom-0 -z-10 h-24 rounded-full bg-gradient-to-br from-gold-100 via-white to-lime-100 blur-xl dark:from-navy-800 dark:via-navy-950 dark:to-navy-900" />
              <Image
                src={TEAM_IMAGES[item.id]}
                alt={item.title}
                width={220}
                height={280}
                className="h-full w-full object-contain object-bottom"
              />
            </div>
            <h3 className="mt-4 text-base font-bold text-navy-800 dark:text-white">{item.title}</h3>
            <p className="mt-2 text-sm leading-7 text-navy-600 dark:text-navy-300">{item.text}</p>
          </StaggerItem>
        ))}
      </StaggerGroup>
    </section>
  );
}
