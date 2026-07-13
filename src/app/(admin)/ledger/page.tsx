"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, Edit, Trash2, Filter, ChevronDown, Download, Database, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import * as XLSX from "xlsx";

export default function LeadsLedgerPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [filterManager, setFilterManager] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const fetchLeads = () => {
    setLoading(true);
    fetch("/api/leads")
      .then((res) => res.json())
      .then((data) => {
        setLeads(data.data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load leads", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("WARNING: You are about to permanently delete this lead. This action cannot be undone. Are you sure?")) {
      return;
    }
    try {
      const res = await fetch(`/api/leads/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      fetchLeads();
    } catch (err) {
      console.error(err);
      alert("Error deleting lead");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "new": return "bg-info/10 text-info border-info/20";
      case "contacted": return "bg-primary/10 text-primary border-primary/20";
      case "qualified": return "bg-success/10 text-success border-success/20";
      case "converted": return "bg-success/20 text-success border-success/30";
      case "lost": return "bg-danger/10 text-danger border-danger/20";
      default: return "bg-muted text-muted-foreground border-border";
    }
  };

  const filteredLeads = leads.filter(lead => {
    const searchString = JSON.stringify(lead.custom_data).toLowerCase();
    const matchesSearch = searchString.includes(search.toLowerCase());
    const matchesStatus = filterStatus === "all" || lead.status?.toLowerCase() === filterStatus.toLowerCase();
    const matchesPriority = filterPriority === "all" || lead.priority?.toLowerCase() === filterPriority.toLowerCase();
    const matchesManager = filterManager === "all" || lead.manager_id === filterManager;

    let matchesDate = true;
    if (dateFrom || dateTo) {
      const leadDate = new Date(lead.created_at);
      
      if (dateFrom) {
        const from = new Date(dateFrom);
        from.setHours(0, 0, 0, 0);
        if (leadDate < from) matchesDate = false;
      }
      
      if (dateTo) {
        const to = new Date(dateTo);
        to.setHours(23, 59, 59, 999);
        if (leadDate > to) matchesDate = false;
      }
    }

    return matchesSearch && matchesStatus && matchesPriority && matchesManager && matchesDate;
  });

  const exportToExcel = () => {
    if (filteredLeads.length === 0) return;

    const dataToExport = filteredLeads.map(lead => {
      const name = lead.custom_data?.name || lead.custom_data?.full_name || lead.custom_data?.first_name || "Unknown Lead";
      
      // Extract email smartly
      let email = lead.custom_data?.email || lead.custom_data?.email_address || lead.custom_data?.['e-mail'] || "";
      if (!email && lead.custom_data) {
        // Try to find any key containing 'email'
        const emailKey = Object.keys(lead.custom_data).find(k => k.toLowerCase().includes('email'));
        if (emailKey) {
          email = lead.custom_data[emailKey];
        } else {
          // Fallback: look for a value that matches basic email regex
          const emailValue = Object.values(lead.custom_data).find(v => typeof v === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v));
          if (emailValue) email = emailValue as string;
        }
      }
      
      // Flatten custom_data keys to put in excel
      const customDataCols: Record<string, string> = {};
      if (lead.custom_data && typeof lead.custom_data === "object") {
        Object.entries(lead.custom_data).forEach(([k, v]) => {
          if (k !== "name" && k !== "full_name" && k !== "first_name" && k !== "email") {
            customDataCols[k.replace(/_/g, " ")] = String(v);
          }
        });
      }

      return {
        "Lead ID": lead.id,
        "Name": name,
        "Email": email,
        "Source Form": lead.form_title,
        "Manager": lead.manager_name || (lead.manager_email ? lead.manager_email.split('@')[0] : 'Unassigned'),
        "Status": lead.status,
        "Priority": lead.priority,
        "Date Submitted": new Date(lead.created_at).toLocaleString(),
        ...customDataCols
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Leads");
    
    // Auto size columns roughly
    const wscols = Object.keys(dataToExport[0] || {}).map(k => ({ wch: Math.max(k.length, 15) }));
    worksheet['!cols'] = wscols;

    XLSX.writeFile(workbook, `leads_export_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Extract unique managers for the dropdown
  const uniqueManagers = Array.from(
    new Map(
      leads
        .filter(l => l.manager_id)
        .map(l => [l.manager_id, { id: l.manager_id, name: l.manager_name, email: l.manager_email }])
    ).values()
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Leads Ledger</h1>
          <p className="text-sm text-muted-foreground mt-1">Master list of all collected leads across the system.</p>
        </div>
        <button 
          onClick={exportToExcel}
          disabled={filteredLeads.length === 0}
          className="inline-flex items-center justify-center px-4 py-2 bg-success text-white border border-success/20 rounded-lg text-sm font-medium hover:bg-success/90 transition-colors shadow-sm gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="w-4 h-4" /> Export Excel
        </button>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden flex flex-col"
      >
        <div className="p-4 sm:p-5 border-b border-border bg-muted/20 flex flex-col gap-4">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="relative w-full lg:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by name, email, or company..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm"
              />
            </div>
            
            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
              <div className="relative flex-1 sm:flex-none">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <Filter className="w-4 h-4 text-muted-foreground" />
                </div>
                <select 
                  value={filterManager}
                  onChange={e => setFilterManager(e.target.value)}
                  className="w-full sm:w-auto appearance-none pl-9 pr-10 py-2 bg-surface border border-border rounded-xl text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-sm cursor-pointer"
                >
                  <option value="all">All Managers</option>
                  {uniqueManagers.map((m: any) => (
                    <option key={m.id} value={m.id}>{m.name || m.email}</option>
                  ))}
                  <option value={null as any}>Unassigned</option>
                </select>
                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>

              <div className="relative flex-1 sm:flex-none">
                <select 
                  value={filterStatus}
                  onChange={e => setFilterStatus(e.target.value)}
                  className="w-full sm:w-auto appearance-none pl-4 pr-10 py-2 bg-surface border border-border rounded-xl text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-sm cursor-pointer"
                >
                  <option value="all">All Statuses</option>
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="qualified">Qualified</option>
                  <option value="converted">Converted</option>
                  <option value="lost">Lost</option>
                </select>
                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>

              <div className="relative flex-1 sm:flex-none">
                <select 
                  value={filterPriority}
                  onChange={e => setFilterPriority(e.target.value)}
                  className="w-full sm:w-auto appearance-none pl-4 pr-10 py-2 bg-surface border border-border rounded-xl text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-sm cursor-pointer"
                >
                  <option value="all">All Priorities</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Date Range:</span>
            </div>
            <div className="flex items-center gap-2">
              <input 
                type="date" 
                value={dateFrom}
                onChange={e => setDateFrom(e.target.value)}
                className="appearance-none px-3 py-1.5 bg-surface border border-border rounded-lg text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
              />
              <span className="text-muted-foreground text-sm">to</span>
              <input 
                type="date" 
                value={dateTo}
                onChange={e => setDateTo(e.target.value)}
                className="appearance-none px-3 py-1.5 bg-surface border border-border rounded-lg text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
              />
              {(dateFrom || dateTo) && (
                <button 
                  onClick={() => { setDateFrom(""); setDateTo(""); }}
                  className="text-xs text-primary hover:underline ml-2 font-medium"
                >
                  Clear Dates
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Lead Info</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Source Form</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Manager</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status / Priority</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Submitted</th>
                <th className="px-6 py-3.5 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-surface divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4"></div>
                      <p>Loading ledger data...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center">
                      <Database className="w-12 h-12 mb-4 opacity-20" />
                      <p className="text-sm font-medium">No leads found matching current filters.</p>
                      <button 
                        onClick={() => { setSearch(""); setFilterStatus("all"); setFilterPriority("all"); setFilterManager("all"); }}
                        className="mt-3 text-primary text-sm hover:underline"
                      >
                        Clear filters
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead: any) => {
                  const name = lead.custom_data?.name || lead.custom_data?.full_name || lead.custom_data?.first_name || "Unknown Lead";
                  
                  // Extract email smartly
                  let email = lead.custom_data?.email || lead.custom_data?.email_address || lead.custom_data?.['e-mail'] || "";
                  if (!email && lead.custom_data) {
                    // Try to find any key containing 'email'
                    const emailKey = Object.keys(lead.custom_data).find(k => k.toLowerCase().includes('email'));
                    if (emailKey) {
                      email = lead.custom_data[emailKey];
                    } else {
                      // Fallback: look for a value that matches basic email regex
                      const emailValue = Object.values(lead.custom_data).find(v => typeof v === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v));
                      if (emailValue) email = emailValue as string;
                    }
                  }
                  email = email || "No email provided";
                  
                  return (
                    <tr key={lead.id} className="hover:bg-muted/50 transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-foreground capitalize">{name}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-foreground">{lead.form_title}</div>
                        <div className="text-xs font-mono text-muted-foreground mt-0.5">ID: {lead.id.split('-')[0]}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                        <div className="text-sm font-medium text-foreground">{lead.manager_name || (lead.manager_email ? lead.manager_email.split('@')[0] : 'Unassigned')}</div>
                        {lead.manager_email && <div className="text-xs text-muted-foreground mt-0.5">{lead.manager_email}</div>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1.5 items-start">
                          <span className={`px-2 py-0.5 inline-flex text-xs font-semibold rounded-full border capitalize ${getStatusColor(lead.status)}`}>
                            {lead.status}
                          </span>
                          <span className={`px-2 py-0.5 text-[11px] font-medium rounded capitalize ${
                            lead.priority?.toLowerCase() === 'high' 
                              ? 'text-danger bg-danger/10' 
                              : lead.priority?.toLowerCase() === 'medium' 
                                ? 'text-warning bg-warning/10' 
                                : 'text-secondary-text bg-muted'
                          }`}>
                            {lead.priority} Priority
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground hidden lg:table-cell">
                        {new Date(lead.created_at).toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link 
                            href={`/ledger/${lead.id}`} 
                            className="p-2 text-secondary-text hover:text-primary hover:bg-primary/10 rounded-lg transition-colors" 
                            title="Edit Lead"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button 
                            onClick={() => handleDelete(lead.id)} 
                            className="p-2 text-secondary-text hover:text-danger hover:bg-danger/10 rounded-lg transition-colors" 
                            title="Delete Lead"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination placeholder (since no real pagination exists) */}
        {!loading && filteredLeads.length > 0 && (
          <div className="px-6 py-4 border-t border-border bg-muted/20 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing <span className="font-medium text-foreground">{filteredLeads.length}</span> records
            </p>
            <div className="flex gap-2">
              <button disabled className="px-3 py-1.5 text-sm font-medium text-muted-foreground bg-surface border border-border rounded-lg opacity-50 cursor-not-allowed">Previous</button>
              <button disabled className="px-3 py-1.5 text-sm font-medium text-muted-foreground bg-surface border border-border rounded-lg opacity-50 cursor-not-allowed">Next</button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
