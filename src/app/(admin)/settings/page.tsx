"use client";

import { useEffect, useState } from "react";
import { Settings, Save, Image as ImageIcon } from "lucide-react";
import { motion } from "framer-motion";

export default function SettingsPage() {
  const [logoUrl, setLogoUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.data?.logo_url) {
          setLogoUrl(data.data.logo_url);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load settings", err);
        setLoading(false);
      });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ logo_url: logoUrl })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      alert("Settings saved successfully! Refresh page to see changes in sidebar.");
      window.location.reload();
    } catch (err: any) {
      alert(err.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Global Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">Configure system-wide settings like the company logo.</p>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-surface rounded-2xl border border-border shadow-sm p-6 sm:p-8"
      >
        {loading ? (
          <div className="py-12 text-center text-muted-foreground">Loading settings...</div>
        ) : (
          <form onSubmit={handleSave} className="space-y-8">
            
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-border">
                <ImageIcon className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-medium text-foreground">Branding</h3>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-6">
                <div className="sm:col-span-8">
                  <label className="block text-sm font-medium text-foreground mb-1">Logo URL</label>
                  <p className="text-xs text-muted-foreground mb-3">Provide a public URL to an image file (PNG, JPG, SVG) or use the default `/logo.png`.</p>
                  <input 
                    type="text" 
                    required 
                    value={logoUrl}
                    onChange={e => setLogoUrl(e.target.value)}
                    className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="https://example.com/logo.png"
                  />
                </div>
                <div className="sm:col-span-4 flex flex-col items-center justify-center p-4 border border-dashed border-border rounded-xl bg-background mt-6 sm:mt-0">
                  <span className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Preview</span>
                  <div className="h-16 flex items-center justify-center w-full">
                    {logoUrl ? (
                      <img src={logoUrl} alt="Logo Preview" className="max-h-full max-w-full object-contain" />
                    ) : (
                      <span className="text-xs text-muted-foreground">No image</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button 
                type="submit" 
                disabled={saving}
                className="inline-flex items-center justify-center px-6 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors shadow-md disabled:opacity-70 gap-2"
              >
                {saving ? "Saving..." : <><Save className="w-4 h-4" /> Save Settings</>}
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}
