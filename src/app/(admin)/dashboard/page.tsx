"use client";

import { useEffect, useState } from "react";
import { Users, Database, FileText, TrendingUp, Activity, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

// Mock trend data for visual appeal (since no historical API exists)
const trendData = [
  { name: 'Mon', leads: 40, conversion: 24 },
  { name: 'Tue', leads: 30, conversion: 13 },
  { name: 'Wed', leads: 45, conversion: 38 },
  { name: 'Thu', leads: 50, conversion: 43 },
  { name: 'Fri', leads: 65, conversion: 55 },
  { name: 'Sat', leads: 40, conversion: 48 },
  { name: 'Sun', leads: 70, conversion: 65 },
];

const COLORS = ['#2563EB', '#06B6D4', '#22C55E', '#F59E0B', '#EF4444', '#8B5CF6'];

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/analytics/admin")
      .then(res => res.json())
      .then(json => {
        if (json.error) throw new Error(json.error);
        setData(json.data);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-danger/10 text-danger rounded-xl border border-danger/20 flex flex-col items-center justify-center text-center">
        <Activity className="w-10 h-10 mb-4 opacity-50" />
        <h3 className="font-semibold text-lg">Failed to load analytics</h3>
        <p className="text-sm opacity-80 mt-1">{error}</p>
      </div>
    );
  }

  const { kpis, statusBreakdown } = data;

  const statCards = [
    { title: "Total Leads", value: kpis.totalLeads, icon: Database, color: "text-primary", bg: "bg-primary/10", trend: "+12.5%" },
    { title: "Active Managers", value: kpis.totalManagers, icon: Users, color: "text-info", bg: "bg-info/10", trend: "+2.4%" },
    { title: "Forms Deployed", value: kpis.totalForms, icon: FileText, color: "text-warning", bg: "bg-warning/10", trend: "+18.2%" },
    { title: "Global Conversion", value: `${kpis.conversionRate}%`, icon: TrendingUp, color: "text-success", bg: "bg-success/10", trend: "+4.1%" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Overview</h1>
          <p className="text-sm text-muted-foreground mt-1">Monitor your business metrics and lead performance.</p>
        </div>
        <div className="flex items-center gap-3">
          <select className="text-sm border-border bg-surface px-4 py-2 rounded-lg focus:ring-2 focus:ring-primary outline-none">
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>This Year</option>
          </select>
          <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm">
            Download Report
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
        {statCards.map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.4 }}
            className="bg-surface p-5 rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow group"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">{stat.title}</p>
                <h3 className="text-3xl font-bold text-foreground tracking-tight">{stat.value}</h3>
              </div>
              <div className={`p-2.5 rounded-xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="flex items-center text-success font-medium bg-success/10 px-1.5 py-0.5 rounded text-xs">
                <ArrowUpRight className="w-3 h-3 mr-0.5" /> {stat.trend}
              </span>
              <span className="text-muted-foreground ml-2 text-xs">vs last period</span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Chart (Visual Mock) */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="bg-surface p-6 rounded-2xl border border-border shadow-sm lg:col-span-2"
        >
          <div className="mb-6">
            <h3 className="text-base font-semibold text-foreground">Acquisition Trend</h3>
            <p className="text-sm text-muted-foreground">Lead volume vs Conversions over the last 7 days</p>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorConv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--success)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--success)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: '1px solid var(--border)', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', padding: '12px' }}
                  cursor={{ stroke: 'var(--border)', strokeWidth: 1, strokeDasharray: '5 5' }}
                />
                <Area type="monotone" dataKey="leads" name="Total Leads" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorLeads)" />
                <Area type="monotone" dataKey="conversion" name="Conversions" stroke="var(--success)" strokeWidth={3} fillOpacity={1} fill="url(#colorConv)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Status Breakdown Bar Chart */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="bg-surface p-6 rounded-2xl border border-border shadow-sm flex flex-col"
        >
          <div className="mb-6">
            <h3 className="text-base font-semibold text-foreground">Pipeline Funnel</h3>
            <p className="text-sm text-muted-foreground">Distribution of current leads by status</p>
          </div>
          
          {statusBreakdown.length > 0 ? (
            <div className="flex-1 min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusBreakdown} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="status" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--foreground)', fontWeight: 500 }} dx={-10} />
                  <Tooltip 
                    cursor={{ fill: 'var(--muted)' }}
                    contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)' }}
                  />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={24}>
                    {statusBreakdown.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center opacity-60 py-10">
              <Activity className="w-12 h-12 mb-3 text-muted-foreground" />
              <p className="text-sm font-medium">No pipeline data available</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
