import { useEffect, useState } from "react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";

export function RankChart({ rows }: { rows: { name: string; count: number }[] }) {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);

  if (!rows.length) return <p className="text-sm text-mist">Nothing recorded yet.</p>;
  if (!ready) return <div className="h-72" />;

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} layout="vertical" margin={{ top: 4, right: 12, left: 4, bottom: 4 }}>
          <XAxis type="number" hide allowDecimals={false} />
          <YAxis
            type="category"
            dataKey="name"
            width={128}
            axisLine={false}
            tickLine={false}
            tick={{ fill: "var(--color-mist)", fontSize: 12, fontFamily: "Outfit, sans-serif" }}
          />
          <Bar dataKey="count" fill="var(--color-sage)" radius={[0, 6, 6, 0]} barSize={8} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
