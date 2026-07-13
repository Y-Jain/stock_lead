"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, MessageSquare, ClipboardList, Target, Clock, Laptop, Activity, PlusCircle, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function LeadDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  
  const [lead, setLead] = useState<any>(null);
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Edit states
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [newNote, setNewNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchLead();
  }, [id]);

  const fetchLead = async () => {
    try {
      const res = await fetch(`/api/leads/${id}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      
      setLead(data.data.lead);
      setNotes(data.data.notes);
      setStatus(data.data.lead.status);
      setPriority(data.data.lead.priority);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    setSaving(true);
    setError("");
    
    try {
      const payload: any = {
        status,
        priority,
        expected_version: lead.version
      };
      
      if (newNote.trim()) {
        payload.new_note = newNote;
      }
      
      const res = await fetch(`/api/leads/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Update failed");
      }
      
      // Refresh local data
      setNewNote("");
      fetchLead();
    } catch (err: any) {
      setError(err.message);
    } finally {
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
          <Link href="/leads" className="inline-flex items-center text-sm font-medium hover:underline">
            <ArrowLeft className="w-4 h-4 mr-2" /> Return to My Leads
          </Link>
        </div>
      </div>
    );
  }

  const customData = typeof lead.custom_data === 'string' ? JSON.parse(lead.custom_data) : lead.custom_data;
  const name = customData?.name || customData?.full_name || customData?.first_name || "Unknown Lead";

  return (
    <div className="p-4 sm:p-8 max-w-full mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-2">
        <Link 
          href="/leads" 
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
            Submitted via {lead.form_title}
          </p>
        </div>
      </div>

      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-danger/10 border border-danger/20 rounded-xl flex items-start gap-3"
        >
          <AlertCircle className="w-5 h-5 text-danger shrink-0 mt-0.5" />
          <div className="text-sm font-medium text-danger">{error}</div>
        </motion.div>
      )}

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Column: Lead Info */}
        <div className="flex-1 space-y-8">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden"
          >
            <div className="px-6 py-5 border-b border-border bg-muted/20 flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Customer Data</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {Object.keys(customData).map(key => (
                  <div key={key} className="space-y-1">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{key.replace(/_/g, ' ')}</p>
                    <p className="text-sm font-medium text-foreground bg-muted/30 px-3 py-2 rounded-lg border border-border/50 break-words">{customData[key] || "—"}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden"
          >
            <div className="px-6 py-5 border-b border-border bg-muted/20 flex items-center gap-2">
              <Laptop className="w-5 h-5 text-info" />
              <h2 className="text-lg font-semibold text-foreground">Submission Context</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-muted rounded-lg shrink-0">
                    <ClipboardList className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">Source Form</p>
                    <p className="font-medium text-foreground">{lead.form_title}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-muted rounded-lg shrink-0">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">Date & Time</p>
                    <p className="font-medium text-foreground">{new Date(lead.created_at).toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-muted rounded-lg shrink-0">
                    <Target className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">IP Address</p>
                    <p className="font-medium text-foreground font-mono text-xs mt-1 bg-muted/50 px-2 py-0.5 rounded border border-border inline-block">{lead.ip_address}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-muted rounded-lg shrink-0">
                    <Laptop className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="w-full">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">Device</p>
                    <p className="font-medium text-foreground text-xs leading-relaxed truncate" title={lead.user_agent}>{lead.user_agent}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Column: Actions & Notes */}
        <div className="w-full lg:w-96 space-y-6 flex-shrink-0">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden sticky top-8"
          >
            <div className="px-6 py-5 border-b border-border bg-muted/20 flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Action Center</h2>
            </div>
            <div className="p-6 space-y-6">
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Current Status</label>
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

              <div className="pt-6 border-t border-border">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground flex items-center justify-between">
                    Add Note 
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold px-2 py-0.5 bg-muted rounded border border-border">Optional</span>
                  </label>
                  <textarea 
                    value={newNote} 
                    onChange={e => setNewNote(e.target.value)} 
                    rows={3} 
                    placeholder="Log a call, meeting, or general note..."
                    className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm resize-none" 
                  />
                </div>
              </div>

              <button 
                onClick={handleUpdate} 
                disabled={saving}
                className="w-full flex items-center justify-center px-4 py-3 bg-primary text-primary-foreground font-medium rounded-xl hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2"></div>
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" /> Update Lead Record
                  </>
                )}
              </button>
            </div>
          </motion.div>

          {/* Activity Feed */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden"
          >
            <div className="px-6 py-5 border-b border-border bg-muted/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-secondary-text" />
                <h2 className="text-lg font-semibold text-foreground">Timeline</h2>
              </div>
              <span className="text-xs font-medium bg-surface border border-border px-2 py-1 rounded-full text-muted-foreground">
                {notes.length} entries
              </span>
            </div>
            
            <div className="p-0">
              {notes.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground flex flex-col items-center">
                  <MessageSquare className="w-8 h-8 mb-3 opacity-20" />
                  <p className="text-sm font-medium">No activity recorded yet.</p>
                  <p className="text-xs mt-1">Add a note above to start the timeline.</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {notes.map((note, idx) => (
                    <div key={note.id} className="p-5 hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                          {note.author_email ? note.author_email.charAt(0).toUpperCase() : 'S'}
                        </div>
                        <p className="text-xs font-medium text-foreground">
                          {note.author_email ? note.author_email.split('@')[0] : "System Auto-Note"}
                        </p>
                        <span className="text-xs text-muted-foreground ml-auto">
                          {new Date(note.created_at).toLocaleString(undefined, { 
                            month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <div className="pl-8 text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                        {note.content}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
