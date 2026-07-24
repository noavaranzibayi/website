import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { locales } from "@/i18n/routing";
import { checkRateLimit } from "@/lib/rate-limit";
import { getRequestInfo } from "@/lib/request-info";
import { logAudit } from "@/lib/audit";

const bookingSchema = z.object({
  name: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(6).max(30),
  service: z.string().trim().max(120).optional().or(z.literal("")),
  message: z.string().trim().max(2000).optional().or(z.literal("")),
  locale: z.enum(locales).default("fa"),
});

// Public endpoint used by the marketing site's booking form. Anonymous
// visitors create a "guest" appointment (no userId, identified by
// contactPhone/contactEmail); authenticated users are automatically linked
// as the owner so it also shows up in their panel.
export async function POST(request: Request) {
  const { ip } = await getRequestInfo();
  const rateLimit = await checkRateLimit(`public-booking:ip:${ip ?? "unknown"}`, {
    limit: 10,
    windowMs: 60 * 60 * 1000,
  });
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const parsed = bookingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_payload", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const { name, phone, service, message, locale } = parsed.data;
  const session = await getSession();

  const appointment = await prisma.appointment.create({
    data: {
      userId: session?.user?.id ?? null,
      subject: service || "General consultation",
      description: message || null,
      serviceId: service || null,
      requestedDate: new Date(),
      type: "IN_PERSON",
      contactPhone: phone,
      contactEmail: session?.user?.email ?? null,
      status: "PENDING",
      history: {
        create: { toStatus: "PENDING", note: `Requested by ${name} (${locale})` },
      },
    },
  });

  await logAudit({
    actorId: session?.user?.id ?? null,
    action: "appointment.create",
    targetType: "Appointment",
    targetId: appointment.id,
    metadata: { name, phone, service, locale, source: "public-site" },
    ip,
  });

  return NextResponse.json({ id: appointment.id }, { status: 201 });
}
