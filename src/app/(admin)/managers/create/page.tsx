"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, UserPlus, Mail, Lock, Badge, Building, Phone, MapPin, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { AdminFilter } from "@/components/AdminFilter";

export default function CreateManagerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedAdminId, setSelectedAdminId] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    if (selectedAdminId) {
      data.admin_id = selectedAdminId;
    }

    try {
      const res = await fetch("/api/managers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to create manager");
      }

      router.push("/managers");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <div className="p-4 sm:p-8 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link 
          href="/managers" 
          className="p-2 -ml-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Add New Manager</h1>
          <p className="text-sm text-muted-foreground mt-1">Create a new account for a sales representative.</p>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden"
      >
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-8">
          {error && (
            <div className="p-4 bg-danger/10 border border-danger/20 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-danger shrink-0 mt-0.5" />
              <div className="text-sm font-medium text-danger">{error}</div>
            </div>
          )}

          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <h3 className="text-lg font-medium text-foreground">Account Details</h3>
              <AdminFilter selectedAdminId={selectedAdminId} onAdminChange={setSelectedAdminId} />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <UserPlus className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <input 
                    name="name" 
                    type="text" 
                    required 
                    placeholder="John Doe"
                    className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <input 
                    name="email" 
                    type="email" 
                    required 
                    placeholder="john@example.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm" 
                  />
                </div>
              </div>

              <div className="space-y-2 sm:col-span-2">
                <label className="text-sm font-medium text-foreground">Temporary Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <Lock className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <input 
                    name="password" 
                    type="password" 
                    required 
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm" 
                  />
                </div>
                <p className="text-xs text-muted-foreground">They will use this to log in initially.</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-lg font-medium text-foreground border-b border-border pb-2 mt-8">Employment Information</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Employee ID</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <Badge className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <input 
                    name="employee_id" 
                    type="text" 
                    placeholder="EMP-1234"
                    className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Department</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <Building className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <input 
                    name="department" 
                    type="text" 
                    placeholder="Sales"
                    className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm" 
                  />
                </div>
              </div>

              <div className="space-y-2 sm:col-span-2">
                <label className="text-sm font-medium text-foreground">Phone Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <input 
                    name="phone" 
                    type="tel" 
                    placeholder="+1 (555) 000-0000"
                    className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm" 
                  />
                </div>
              </div>

              <div className="space-y-2 sm:col-span-2">
                <label className="text-sm font-medium text-foreground">Address</label>
                <div className="relative">
                  <div className="absolute top-3 left-3 flex items-start pointer-events-none">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <textarea 
                    name="address" 
                    rows={3} 
                    placeholder="123 Business Rd, Suite 100&#10;City, State, Zip"
                    className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm resize-none"
                  ></textarea>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-border flex flex-col sm:flex-row justify-end gap-3">
            <Link 
              href="/managers" 
              className="inline-flex justify-center px-6 py-2.5 border border-border bg-surface text-foreground rounded-xl text-sm font-medium hover:bg-muted transition-colors"
            >
              Cancel
            </Link>
            <button 
              type="submit" 
              disabled={loading} 
              className="inline-flex justify-center items-center px-6 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2"></div>
                  Creating...
                </>
              ) : (
                "Create Manager Account"
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
