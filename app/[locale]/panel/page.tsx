import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

export default async function PanelIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await getSession();

  if (session && session.user.role !== "USER") {
    redirect(`/${locale}/panel/admin/dashboard`);
  }

  redirect(`/${locale}/panel/appointments`);
}
