"use client";

import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const BRAND_BLUE = "#2563eb";
const GRID = "#e2e8f0";
const AXIS_TEXT = "#64748b";

export function RevenueOverTimeChart({ data }: { data: { day: string; revenue: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
        <CartesianGrid stroke={GRID} vertical={false} />
        <XAxis dataKey="day" tick={{ fontSize: 11, fill: AXIS_TEXT }} axisLine={{ stroke: GRID }} tickLine={false} />
        <YAxis
          tick={{ fontSize: 11, fill: AXIS_TEXT }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v: number) => `$${(v / 100).toLocaleString()}`}
          width={56}
        />
        <Tooltip
          formatter={(value) => [`$${(Number(value) / 100).toFixed(2)}`, "Revenue"]}
          contentStyle={{ borderRadius: 8, borderColor: GRID, fontSize: 12 }}
        />
        <Line type="monotone" dataKey="revenue" stroke={BRAND_BLUE} strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function BookingsOverTimeChart({ data }: { data: { day: string; bookings: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
        <CartesianGrid stroke={GRID} vertical={false} />
        <XAxis dataKey="day" tick={{ fontSize: 11, fill: AXIS_TEXT }} axisLine={{ stroke: GRID }} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: AXIS_TEXT }} axisLine={false} tickLine={false} allowDecimals={false} width={32} />
        <Tooltip contentStyle={{ borderRadius: 8, borderColor: GRID, fontSize: 12 }} />
        <Bar dataKey="bookings" fill={BRAND_BLUE} radius={[4, 4, 0, 0]} maxBarSize={28} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function TopDestinationsChart({ data }: { data: { destination: string; count: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={Math.max(160, data.length * 40)}>
      <BarChart data={data} layout="vertical" margin={{ top: 8, right: 24, left: 12, bottom: 0 }}>
        <CartesianGrid stroke={GRID} horizontal={false} />
        <XAxis type="number" tick={{ fontSize: 11, fill: AXIS_TEXT }} axisLine={false} tickLine={false} allowDecimals={false} />
        <YAxis dataKey="destination" type="category" tick={{ fontSize: 12, fill: "#334155" }} axisLine={false} tickLine={false} width={110} />
        <Tooltip contentStyle={{ borderRadius: 8, borderColor: GRID, fontSize: 12 }} />
        <Bar dataKey="count" fill={BRAND_BLUE} radius={[0, 4, 4, 0]} maxBarSize={20} />
      </BarChart>
    </ResponsiveContainer>
  );
}
