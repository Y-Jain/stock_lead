"use client";

import { useEffect, useState } from "react";
import { Plus, Shield, Search, CheckCircle, XCircle, Trash2, Edit2, Save, X } from "lucide-react";
import { motion } from "framer-motion";

export default function AdminsPage() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  // Form State
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editId, setEditId] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchAdmins = () => {
    setLoading(true);
    fetch("/api/admins")
      .then((res) => res.json())
      .then((data) => {
        setAdmins(data.data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load admins", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const url = formMode === "create" ? "/api/admins" : `/api/admins/${editId}`;
      const method = formMode === "create" ? "POST" : "PUT";
      
      const payload: any = { email, is_active: isActive };
      if (password) payload.password = password; // Only send password if provided

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      resetForm();
      fetchAdmins();
    } catch (err: any) {
      alert(err.message || `Failed to ${formMode} admin`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, adminEmail: string) => {
    if (!confirm(`Are you sure you want to delete the admin ${adminEmail}?`)) return;
    try {
      const res = await fetch(`/api/admins/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      fetchAdmins();
    } catch (err: any) {
      alert(err.message || "Failed to delete admin");
    }
  };

  const handleEdit = (admin: any) => {
    setFormMode("edit");
    setEditId(admin.id);
    setEmail(admin.email);
    setPassword("");
    setIsActive(admin.is_active);
  };

  const resetForm = () => {
    setFormMode("create");
    setEditId(null);
    setEmail("");
    setPassword("");
    setIsActive(true);
  };

  const filteredAdmins = admins.filter((a: any) => 
    (a.email || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Administrators</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage regular admin accounts.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:col-span-2 bg-surface rounded-2xl border border-border shadow-sm overflow-hidden flex flex-col"
        >
          <div className="p-4 sm:p-5 border-b border-border bg-muted/20">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search admins by email..."
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
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Admin Email</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Created At</th>
                  <th className="px-6 py-3.5 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-surface divide-y divide-border">
                {loading ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-16 text-center text-muted-foreground">Loading...</td>
                  </tr>
                ) : filteredAdmins.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-16 text-center text-muted-foreground">No admins found.</td>
                  </tr>
                ) : (
                  filteredAdmins.map((admin: any) => (
                    <tr key={admin.id} className="hover:bg-muted/50 transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <Shield className="w-8 h-8 text-primary opacity-70 p-1.5 bg-primary/10 rounded-lg" />
                          <div className="text-sm font-semibold text-foreground">{admin.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {admin.is_active ? (
                          <span className="px-2.5 py-1 inline-flex text-[11px] font-semibold rounded-full bg-success/10 text-success border border-success/20 items-center gap-1">
                            <CheckCircle className="w-3 h-3" /> Active
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 inline-flex text-[11px] font-semibold rounded-full bg-muted text-muted-foreground border border-border items-center gap-1">
                            <XCircle className="w-3 h-3" /> Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {new Date(admin.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleEdit(admin)} 
                            className="p-2 text-secondary-text hover:text-primary hover:bg-primary/10 rounded-lg transition-colors" 
                            title="Edit Admin"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(admin.id, admin.email)} 
                            className="p-2 text-secondary-text hover:text-danger hover:bg-danger/10 rounded-lg transition-colors" 
                            title="Delete Admin"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-surface rounded-2xl border border-border shadow-sm p-6 flex flex-col"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">
              {formMode === "create" ? "Add New Admin" : "Edit Admin"}
            </h2>
            {formMode === "edit" && (
              <button type="button" onClick={resetForm} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Email Address</label>
              <input 
                type="email" 
                required 
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="admin@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                {formMode === "create" ? "Password" : "New Password (Optional)"}
              </label>
              <input 
                type="password" 
                required={formMode === "create"}
                minLength={6}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder={formMode === "create" ? "Min 6 characters" : "Leave blank to keep current"}
              />
            </div>
            {formMode === "edit" && (
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="isActive"
                  checked={isActive}
                  onChange={e => setIsActive(e.target.checked)}
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-foreground">Active Account</label>
              </div>
            )}
            <button 
              type="submit" 
              disabled={submitting}
              className="mt-2 w-full inline-flex items-center justify-center px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-70 gap-2"
            >
              {submitting ? "Saving..." : formMode === "create" ? <><Plus className="w-4 h-4" /> Add Admin</> : <><Save className="w-4 h-4" /> Save Changes</>}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
