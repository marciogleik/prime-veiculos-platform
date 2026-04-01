"use client";

import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area 
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const data = [
  { name: "01/03", leads: 4 },
  { name: "05/03", leads: 7 },
  { name: "10/03", leads: 5 },
  { name: "15/03", leads: 12 },
  { name: "20/03", leads: 8 },
  { name: "25/03", leads: 15 },
  { name: "27/03", leads: 9 },
];

export default function DashboardCharts() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Card className="rounded-3xl border-none shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-black text-gray-900 uppercase tracking-tight">Leads por Período</CardTitle>
        </CardHeader>
        <CardContent className="h-[320px] w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#e11d48" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#e11d48" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#e2e8f0" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 11, fill: "#111827", fontWeight: 800 }} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 11, fill: "#111827", fontWeight: 800 }} 
              />
              <Tooltip 
                contentStyle={{ 
                  borderRadius: "20px", 
                  border: "none", 
                  boxShadow: "0 25px 50px -12px rgb(0 0 0 / 0.15)",
                  padding: "12px 16px"
                }}
              />
              <Area 
                type="monotone" 
                dataKey="leads" 
                stroke="#e11d48" 
                strokeWidth={4}
                fillOpacity={1} 
                fill="url(#colorLeads)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="rounded-[2.5rem] border-none shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-black text-gray-900 uppercase tracking-tight">Distribuição de Status</CardTitle>
        </CardHeader>
        <CardContent className="h-[320px] w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#e2e8f0" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 11, fill: "#111827", fontWeight: 800 }} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 11, fill: "#111827", fontWeight: 800 }} 
              />
              <Tooltip 
                cursor={{ fill: "#f8fafc" }}
                contentStyle={{ 
                  borderRadius: "20px", 
                  border: "none", 
                  boxShadow: "0 25px 50px -12px rgb(0 0 0 / 0.15)",
                  padding: "12px 16px"
                }}
              />
              <Bar 
                dataKey="leads" 
                fill="#000000" 
                radius={[8, 8, 0, 0]} 
                barSize={36}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
