"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Edit2, Trash2, Users, Search, MoreHorizontal } from "lucide-react";
import { motion } from "framer-motion";
import { AdminFilter } from "@/components/AdminFilter";

export default function ManagersPage() {
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedAdminId, setSelectedAdminId] = useState("");

  const fetchManagers = () => {
    setLoading(true);
    const url = selectedAdminId ? `/api/managers?admin_id=${selectedAdminId}` : "/api/managers";
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setManagers(data.data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load managers", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchManagers();
  }, [selectedAdminId]);

  const handleDelete = async (id: string, email: string) => {
    if (!confirm(`WARNING: Deleting manager "${email}" will also permanently delete all Leads assigned to them. Are you sure?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/managers/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      fetchManagers();
    } catch (err) {
      console.error(err);
      alert("Error deleting manager");
    }
  };

  const filteredManagers = managers.filter((m: any) => 
    (m.name || "").toLowerCase().includes(search.toLowerCase()) || 
    (m.email || "").toLowerCase().includes(search.toLowerCase()) ||
    (m.department || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Managers</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your sales representatives and their assigned forms.</p>
        </div>
        <div className="flex items-center gap-3">
          <AdminFilter selectedAdminId={selectedAdminId} onAdminChange={setSelectedAdminId} />
          <Link 
            href="/managers/create" 
            className="inline-flex items-center justify-center px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm gap-2"
          >
            <Plus className="w-4 h-4" /> Add Manager
          </Link>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden flex flex-col"
      >
        <div className="p-4 sm:p-5 border-b border-border bg-muted/20 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search managers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Manager Info</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Department / Phone</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Assigned Form</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="px-6 py-3.5 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-surface divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4"></div>
                      <p>Loading managers...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredManagers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center">
                      <Users className="w-12 h-12 mb-4 opacity-20" />
                      <p className="text-sm font-medium">No managers found.</p>
                      {search && (
                        <button 
                          onClick={() => setSearch("")}
                          className="mt-3 text-primary text-sm hover:underline"
                        >
                          Clear search
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredManagers.map((manager: any) => (
                  <tr key={manager.id} className="hover:bg-muted/50 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary to-info flex items-center justify-center text-white font-medium text-sm hidden sm:flex">
                          {(manager.name || manager.email)?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-foreground">{manager.name || "Unnamed Manager"}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">{manager.email} • ID: {manager.employee_id}</div>
                          {manager.admin_email && (
                            <div className="text-[10px] text-muted-foreground mt-1 px-1.5 py-0.5 bg-muted rounded w-max">
                              Admin: {manager.admin_email}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                      <div className="text-sm font-medium text-foreground">{manager.department || "No Dept"}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{manager.phone || "No Phone"}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                      {manager.form_title ? (
                        <div className="flex flex-col items-start">
                          <span className="text-sm font-medium text-foreground">{manager.form_title}</span>
                          <a href={`/form/${manager.tracker_id}`} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline mt-0.5 inline-flex items-center gap-1">
                            Open Form Link
                          </a>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground italic">No form assigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 inline-flex text-[11px] font-semibold rounded-full border ${
                        manager.is_active 
                          ? 'bg-success/10 text-success border-success/20' 
                          : 'bg-muted text-muted-foreground border-border'
                      }`}>
                        {manager.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link 
                          href={`/managers/${manager.id}/edit`} 
                          className="p-2 text-secondary-text hover:text-primary hover:bg-primary/10 rounded-lg transition-colors" 
                          title="Edit Manager"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Link>
                        <button 
                          onClick={() => handleDelete(manager.id, manager.email)} 
                          className="p-2 text-secondary-text hover:text-danger hover:bg-danger/10 rounded-lg transition-colors" 
                          title="Delete Manager"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="sm:hidden text-muted-foreground group-hover:hidden">
                        <MoreHorizontal className="w-5 h-5 ml-auto" />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
