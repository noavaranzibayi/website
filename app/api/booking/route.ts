import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { locales } from "@/i18n/routing";

const bookingSchema = z.object({
  name: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(6).max(30),
  service: z.string().trim().max(120).optional().or(z.literal("")),
  message: z.string().trim().max(2000).optional().or(z.literal("")),
  locale: z.enum(locales).default("fa"),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  const parsed = bookingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_payload", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const { name, phone, service, message, locale } = parsed.data;

  const booking = await prisma.bookingRequest.create({
    data: {
      name,
      phone,
      service: service || null,
      message: message || null,
      locale,
    },
  });

  return NextResponse.json({ id: booking.id }, { status: 201 });
}
