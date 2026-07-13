"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Activity, Target, Database, FileJson, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function AdminLeadEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  const router = useRouter();

  const [lead, setLead] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Editable fields
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [customDataStr, setCustomDataStr] = useState("");
  const [jsonError, setJsonError] = useState("");

  useEffect(() => {
    fetch(`/api/leads/${id}`)
      .then(res => res.json())
      .then(json => {
        if (json.data) {
          setLead(json.data.lead);
          setStatus(json.data.lead.status);
          setPriority(json.data.lead.priority);
          setCustomDataStr(JSON.stringify(json.data.lead.custom_data, null, 2));
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setJsonError("");
    
    let parsedData = null;
    try {
      parsedData = JSON.parse(customDataStr);
    } catch (err) {
      setJsonError("Invalid JSON format. Please check your syntax.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/leads/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          priority,
          custom_data: parsedData,
          expected_version: lead.version
        })
      });

      if (!res.ok) {
        if (res.status === 409) {
          throw new Error("This lead was updated by someone else while you were editing. Please refresh and try again.");
        }
        throw new Error("Failed to save lead");
      }

      router.push("/ledger"); // Go back to ledger
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Error updating lead");
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4"></div>
        <p className="text-muted-foreground font-medium">Loading lead details...</p>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="p-8 max-w-2xl mx-auto text-center">
        <div className="bg-danger/10 text-danger p-6 rounded-2xl border border-danger/20">
          <h2 className="text-xl font-semibold mb-2">Lead Not Found</h2>
          <p className="text-sm opacity-80 mb-6">The lead you are trying to view does not exist or has been deleted.</p>
          <Link href="/ledger" className="inline-flex items-center text-sm font-medium hover:underline">
            <ArrowLeft className="w-4 h-4 mr-2" /> Return to Ledger
          </Link>
        </div>
      </div>
    );
  }

  const name = lead.custom_data?.name || lead.custom_data?.full_name || lead.custom_data?.first_name || "Unknown Lead";

  let parsedDataObj: Record<string, any> = {};
  try {
    parsedDataObj = customDataStr ? JSON.parse(customDataStr) : {};
  } catch (e) {
    // If it's invalid during typing, we just keep the last valid object keys or empty
  }

  return (
    <div className="p-4 sm:p-8 max-w-full mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link 
            href="/ledger" 
            className="p-2 -ml-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground flex items-center gap-3">
              {name}
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground border border-border">
                {lead.id.split('-')[0]}
              </span>
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              From <span className="font-medium text-foreground">{lead.form_title}</span> • Submitted on {new Date(lead.created_at).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden"
      >
        <form onSubmit={handleSave} className="p-6 sm:p-8 space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1 space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-primary" /> Lead Status
                </h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Current Stage</label>
                    <select 
                      value={status} 
                      onChange={e => setStatus(e.target.value)}
                      className="w-full appearance-none px-4 py-2.5 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm cursor-pointer capitalize"
                    >
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="qualified">Qualified</option>
                      <option value="converted">Converted</option>
                      <option value="lost">Lost</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Priority Level</label>
                    <select 
                      value={priority} 
                      onChange={e => setPriority(e.target.value)}
                      className="w-full appearance-none px-4 py-2.5 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm cursor-pointer capitalize"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-border">
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Target className="w-4 h-4 text-info" /> Assignment
                </h3>
                <div className="bg-muted/30 p-4 rounded-xl border border-border">
                  <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">Manager</p>
                  <p className="text-sm font-medium text-foreground">{lead.manager_name || (lead.manager_email ? lead.manager_email.split('@')[0] : 'Unassigned')}</p>
                  {lead.manager_email && <p className="text-xs text-muted-foreground mt-0.5">{lead.manager_email}</p>}
                </div>
              </div>
            </div>

            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <h3 className="text-lg font-medium text-foreground flex items-center gap-2">
                  <Database className="w-5 h-5 text-secondary-text" /> Customer Submission Data
                </h3>
              </div>
              
              <div className="space-y-4 pt-2">
                <p className="text-sm text-muted-foreground mb-4">Edit the lead's submitted information below.</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {Object.entries(parsedDataObj).map(([key, value]) => (
                    <div key={key} className="space-y-1.5 p-4 bg-muted/20 border border-border rounded-xl">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          {key.replace(/_/g, ' ')}
                        </label>
                        <button 
                          type="button" 
                          onClick={() => {
                            const newData = { ...parsedDataObj };
                            delete newData[key];
                            setCustomDataStr(JSON.stringify(newData));
                          }}
                          className="text-muted-foreground hover:text-danger p-1 rounded transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                        </button>
                      </div>
                      <input 
                        type="text"
                        value={value as string}
                        onChange={(e) => {
                          const newData = { ...parsedDataObj, [key]: e.target.value };
                          setCustomDataStr(JSON.stringify(newData));
                        }}
                        className="w-full px-3 py-2 text-sm bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                      />
                    </div>
                  ))}
                </div>

                <div className="pt-4 mt-2 border-t border-border border-dashed flex items-center gap-3">
                  <input 
                    type="text" 
                    placeholder="New Field Name" 
                    id="newFieldName"
                    className="flex-1 px-3 py-2 text-sm bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                  />
                  <button 
                    type="button"
                    onClick={() => {
                      const input = document.getElementById('newFieldName') as HTMLInputElement;
                      if (input && input.value.trim()) {
                        const key = input.value.trim().toLowerCase().replace(/\s+/g, '_');
                        if (!parsedDataObj[key]) {
                          const newData = { ...parsedDataObj, [key]: "" };
                          setCustomDataStr(JSON.stringify(newData));
                          input.value = '';
                        }
                      }
                    }}
                    className="px-4 py-2 bg-muted text-foreground rounded-lg text-sm font-medium hover:bg-muted/80 transition-colors whitespace-nowrap"
                  >
                    Add Field
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-border flex flex-col sm:flex-row justify-end gap-3 mt-8">
            <Link 
              href="/ledger" 
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
                  <Save className="w-4 h-4 mr-2" /> Save Lead Data
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
