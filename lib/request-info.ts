import { headers } from "next/headers";

export async function getRequestInfo() {
  const h = await headers();
  const forwardedFor = h.get("x-forwarded-for");
  const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : (h.get("x-real-ip") ?? null);
  const userAgent = h.get("user-agent");
  return { ip, userAgent };
}
