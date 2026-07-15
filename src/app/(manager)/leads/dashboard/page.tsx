"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, TrendingUp, AlertCircle, ArrowRight, Share2, Copy, CheckCircle2, Activity } from "lucide-react";
import { motion } from "framer-motion";

export default function ManagerDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/analytics/manager")
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
        <div className="w-8 h-8 border-4 border-info/30 border-t-info rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-danger/10 text-danger rounded-xl border border-danger/20 flex flex-col items-center justify-center text-center">
        <AlertCircle className="w-10 h-10 mb-4 opacity-50" />
        <h3 className="font-semibold text-lg">Failed to load analytics</h3>
        <p className="text-sm opacity-80 mt-1">{error}</p>
      </div>
    );
  }

  const { kpis, recentActivity, formAssignment } = data;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/form/${formAssignment.tracker_id}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const statCards = [
    { title: "My Total Leads", value: kpis.totalLeads, icon: Users, color: "text-primary", bg: "bg-primary/10", trend: "+5" },
    { title: "Conversion Rate", value: `${kpis.conversionRate}%`, icon: TrendingUp, color: "text-success", bg: "bg-success/10", trend: "+2.1%" },
    { title: "Action Required", value: kpis.actionRequired, icon: AlertCircle, color: "text-warning", bg: "bg-warning/10", trend: "-1" },
  ];

  return (
    <div className="space-y-6 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">My Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Track your personal pipeline and upcoming actions.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
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
              <span className={`flex items-center font-medium px-1.5 py-0.5 rounded text-xs ${stat.title === "Action Required" && parseInt(stat.trend) > 0 ? "bg-danger/10 text-danger" : "bg-success/10 text-success"}`}>
                 {stat.trend}
              </span>
              <span className="text-muted-foreground ml-2 text-xs">this week</span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Share Link Section */}
          {formAssignment && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="bg-gradient-to-r from-info/10 to-primary/5 p-6 rounded-2xl border border-info/20 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6"
            >
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Share2 className="w-5 h-5 text-info" />
                  <h2 className="text-lg font-bold text-foreground">Your Assigned Form</h2>
                </div>
                <p className="text-sm text-muted-foreground">Share this unique link to gather leads directly into your pipeline.</p>
                <div className="mt-1 font-medium text-foreground">{formAssignment.title}</div>
              </div>
              
              <div className="flex w-full sm:w-auto items-center">
                <div className="relative flex-1 sm:w-64">
                  <input 
                    type="text" 
                    readOnly 
                    value={typeof window !== 'undefined' ? `${window.location.origin}/form/${formAssignment.tracker_id}` : `/form/${formAssignment.tracker_id}`}
                    className="w-full pl-4 pr-12 py-2.5 bg-surface border border-border rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-info shadow-inner text-muted-foreground truncate"
                  />
                  <button 
                    onClick={handleCopyLink}
                    className="absolute right-1 top-1 bottom-1 px-3 bg-info text-white rounded-lg hover:bg-info/90 transition-colors flex items-center justify-center"
                    title="Copy Link"
                  >
                    {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Recent Activity Table */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="bg-surface rounded-2xl shadow-sm border border-border overflow-hidden"
          >
            <div className="px-6 py-5 border-b border-border flex justify-between items-center bg-muted/30">
              <h2 className="text-lg font-semibold text-foreground">Recent Activity</h2>
              <Link href="/leads" className="text-sm font-medium text-info hover:text-info/80 flex items-center transition-colors">
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Priority</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Updated</th>
                    <th className="px-6 py-3.5 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-surface">
                  {recentActivity.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                        <Activity className="w-8 h-8 mx-auto mb-3 opacity-20" />
                        No recent activity found.
                      </td>
                    </tr>
                  ) : (
                    recentActivity.map((lead: any) => {
                      const customData = typeof lead.custom_data === 'string' ? JSON.parse(lead.custom_data) : lead.custom_data;
                      const name = customData?.full_name || customData?.name || "Unknown";
                      
                      const getStatusColor = (status: string) => {
                        switch(status.toLowerCase()) {
                          case 'new': return 'bg-info/10 text-info border-info/20';
                          case 'contacted': return 'bg-primary/10 text-primary border-primary/20';
                          case 'qualified': return 'bg-success/10 text-success border-success/20';
                          case 'lost': return 'bg-danger/10 text-danger border-danger/20';
                          default: return 'bg-muted text-muted-foreground border-border';
                        }
                      };

                      return (
                        <tr key={lead.id} className="hover:bg-muted/50 transition-colors group">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-foreground">{name}</div>
                            <div className="text-xs text-muted-foreground sm:hidden">{new Date(lead.updated_at).toLocaleDateString()}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(lead.status)}`}>
                              {lead.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`text-sm font-medium ${
                              lead.priority === 'High' ? 'text-danger' : lead.priority === 'Medium' ? 'text-warning' : 'text-muted-foreground'
                            }`}>
                              {lead.priority}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground hidden sm:table-cell">
                            {new Date(lead.updated_at).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                            <Link 
                              href={`/leads/${lead.id}`} 
                              className="inline-flex items-center justify-center px-3 py-1.5 border border-border rounded-lg text-sm font-medium text-foreground bg-surface hover:bg-muted transition-colors"
                            >
                              Open
                            </Link>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>

        {/* Right Sidebar (Quick Actions / Info) */}
        <div className="space-y-6">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="bg-surface p-6 rounded-2xl border border-border shadow-sm"
          >
            <h3 className="text-lg font-semibold text-foreground mb-4">Quick Tips</h3>
            <ul className="space-y-4">
              <li className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-primary font-bold text-sm">1</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Follow Up Promptly</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Leads contacted within 5 minutes are 100x more likely to convert.</p>
                </div>
              </li>
              <li className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-info/10 flex items-center justify-center shrink-0">
                  <span className="text-info font-bold text-sm">2</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Update Statuses</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Keep your pipeline accurate by updating lead statuses immediately.</p>
                </div>
              </li>
            </ul>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
