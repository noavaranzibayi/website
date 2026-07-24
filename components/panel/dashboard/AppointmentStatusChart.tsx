"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";
import { useTranslations } from "next-intl";

const STATUS_COLORS: Record<string, string> = {
  PENDING: "#d3a933",
  CONFIRMED: "#77a022",
  RESCHEDULED: "#3f6f9c",
  COMPLETED: "#0e3863",
  CANCELLED: "#9ca3af",
  REJECTED: "#ef4444",
  NO_SHOW: "#f97316",
};

export default function AppointmentStatusChart({ data }: { data: { status: string; count: number }[] }) {
  const t = useTranslations("appointments.status");
  const chartData = data.map((d) => ({ ...d, label: t(d.status as never) }));

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="currentColor" className="text-navy-100 dark:text-navy-800" />
        <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} stroke="currentColor" className="text-navy-400" />
        <YAxis type="category" dataKey="label" tick={{ fontSize: 12 }} width={90} stroke="currentColor" className="text-navy-500" />
        <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e5e9f0", fontSize: 12 }} />
        <Bar dataKey="count" radius={[0, 6, 6, 0]}>
          {chartData.map((entry) => (
            <Cell key={entry.status} fill={STATUS_COLORS[entry.status] ?? "#0e3863"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
