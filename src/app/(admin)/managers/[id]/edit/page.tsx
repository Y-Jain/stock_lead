"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { Save, ArrowLeft, User, Building, Phone, MapPin, ClipboardList, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function EditManagerPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  const router = useRouter();
  
  const [manager, setManager] = useState<any>(null);
  const [forms, setForms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [department, setDepartment] = useState("");
  const [phone, setPhone] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [formId, setFormId] = useState("");

  useEffect(() => {
    // Fetch manager and forms in parallel
    Promise.all([
      fetch(`/api/managers/${id}`).then(res => res.json()),
      fetch("/api/forms").then(res => res.json())
    ])
      .then(([managerRes, formsRes]) => {
        if (managerRes.data) {
          setManager(managerRes.data);
          setName(managerRes.data.name || "");
          setAddress(managerRes.data.address || "");
          setDepartment(managerRes.data.department || "");
          setPhone(managerRes.data.phone || "");
          setIsActive(managerRes.data.is_active);
          setFormId(managerRes.data.form_id || "");
        }
        if (formsRes.data) {
          setForms(formsRes.data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/managers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          address,
          department,
          phone,
          is_active: isActive,
          form_id: formId || null
        })
      });

      if (!res.ok) throw new Error("Failed to update manager");
      
      router.push("/managers");
    } catch (err) {
      console.error(err);
      alert("Error updating manager");
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4"></div>
        <p className="text-muted-foreground font-medium">Loading manager details...</p>
      </div>
    );
  }

  if (!manager) {
    return (
      <div className="p-8 max-w-2xl mx-auto text-center">
        <div className="bg-danger/10 text-danger p-6 rounded-2xl border border-danger/20">
          <h2 className="text-xl font-semibold mb-2">Manager Not Found</h2>
          <p className="text-sm opacity-80 mb-6">The manager you are trying to edit does not exist or has been deleted.</p>
          <Link href="/managers" className="inline-flex items-center text-sm font-medium hover:underline">
            <ArrowLeft className="w-4 h-4 mr-2" /> Return to Managers
          </Link>
        </div>
      </div>
    );
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
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Edit Manager</h1>
          <p className="text-sm text-muted-foreground mt-1">{manager.email} • ID: {manager.employee_id}</p>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden"
      >
        <form onSubmit={handleSave} className="p-6 sm:p-8 space-y-8">
          
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-foreground border-b border-border pb-2">Profile Information</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2 sm:col-span-2">
                <label className="text-sm font-medium text-foreground">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <User className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <input 
                    type="text" 
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                    placeholder="Enter full name"
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
                    type="text" 
                    value={department} 
                    onChange={e => setDepartment(e.target.value)} 
                    placeholder="e.g. Sales"
                    className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Phone Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <input 
                    type="text" 
                    value={phone} 
                    onChange={e => setPhone(e.target.value)} 
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
                    value={address} 
                    rows={3}
                    onChange={e => setAddress(e.target.value)} 
                    placeholder="Full physical address"
                    className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm resize-none"
                  ></textarea>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-lg font-medium text-foreground border-b border-border pb-2 mt-8">Assignments & Status</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <ClipboardList className="w-4 h-4" /> Assigned Form
                </label>
                <p className="text-xs text-muted-foreground mb-3">Select the form that this manager will collect leads for.</p>
                <select 
                  value={formId} 
                  onChange={e => setFormId(e.target.value)} 
                  className="w-full appearance-none px-4 py-2.5 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm cursor-pointer"
                >
                  <option value="">-- No form assigned --</option>
                  {forms.map(f => (
                    <option key={f.id} value={f.id}>{f.title}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Account Status
                </label>
                <p className="text-xs text-muted-foreground mb-3">Toggle whether this manager has access to the system.</p>
                
                <label className="relative flex items-center p-3 border border-border rounded-xl cursor-pointer hover:bg-muted/50 transition-colors">
                  <input 
                    type="checkbox" 
                    checked={isActive} 
                    onChange={e => setIsActive(e.target.checked)} 
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[14px] after:left-[14px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-success"></div>
                  <span className="ml-3 text-sm font-medium text-foreground">
                    {isActive ? 'Account Active' : 'Account Disabled'}
                  </span>
                </label>
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
              disabled={saving}
              className="inline-flex justify-center items-center px-6 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" /> Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
