"use client";

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { useLocale } from "next-intl";

export default function UserGrowthChart({ data }: { data: { date: string; count: number }[] }) {
  const locale = useLocale();
  const formatter = new Intl.DateTimeFormat(locale, { month: "short", day: "numeric" });

  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="userGrowthFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#d3a933" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#d3a933" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-navy-100 dark:text-navy-800" />
        <XAxis
          dataKey="date"
          tickFormatter={(d: string) => formatter.format(new Date(d))}
          tick={{ fontSize: 11 }}
          stroke="currentColor"
          className="text-navy-400"
          minTickGap={24}
        />
        <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="currentColor" className="text-navy-400" width={28} />
        <Tooltip
          labelFormatter={(d) => formatter.format(new Date(d as string))}
          contentStyle={{ borderRadius: 12, border: "1px solid #e5e9f0", fontSize: 12 }}
        />
        <Area type="monotone" dataKey="count" stroke="#d3a933" strokeWidth={2} fill="url(#userGrowthFill)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
