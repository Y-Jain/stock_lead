"use client";

import { useState, useEffect, Suspense } from "react";
import { Plus, Trash2, Save, Settings, Layout, Eye, ChevronDown, CheckSquare, AlignLeft, Type, Hash, Mail, FileText, Smartphone, Phone } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

function FormBuilderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const formId = searchParams.get("id");

  const [title, setTitle] = useState("New Lead Form");
  const [description, setDescription] = useState("");
  const [fields, setFields] = useState([
    { type: "text", name: "full_name", label: "Full Name", placeholder: "Enter your name", is_required: true }
  ]);
  const [loading, setLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState("build"); // "build" or "preview" (mobile)

  useEffect(() => {
    if (formId) {
      setIsEditMode(true);
      fetch(`/api/forms/${formId}`)
        .then(res => res.json())
        .then(json => {
          if (json.data) {
            setTitle(json.data.title);
            setDescription(json.data.description || "");
            if (json.data.fields && json.data.fields.length > 0) {
              setFields(json.data.fields);
            }
          }
        })
        .catch(console.error);
    }
  }, [formId]);

  const addField = () => {
    setFields([...fields, { type: "text", name: `field_${fields.length}`, label: "New Field", placeholder: "", is_required: false }]);
  };

  const removeField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const updateField = (index: number, key: string, value: any) => {
    const updated = [...fields];
    updated[index] = { ...updated[index], [key]: value };
    setFields(updated);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const payload = {
        title,
        description,
        fields,
        submit_btn_text: "Submit Lead",
        success_message: "Thank you! We will contact you soon."
      };
      
      const url = isEditMode ? `/api/forms/${formId}` : "/api/forms";
      const method = isEditMode ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) throw new Error("Failed to save form");
      router.push("/forms");
    } catch (err) {
      console.error(err);
      alert("Error saving form");
      setLoading(false);
    }
  };

  const getFieldIcon = (type: string) => {
    switch(type) {
      case "text": return <Type className="w-4 h-4 text-muted-foreground" />;
      case "alphanumeric": return <Type className="w-4 h-4 text-muted-foreground" />;
      case "tel": return <Phone className="w-4 h-4 text-muted-foreground" />;
      case "email": return <Mail className="w-4 h-4 text-muted-foreground" />;
      case "number": return <Hash className="w-4 h-4 text-muted-foreground" />;
      case "textarea": return <AlignLeft className="w-4 h-4 text-muted-foreground" />;
      default: return <FileText className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">{isEditMode ? "Edit Form" : "Form Builder"}</h1>
          <p className="text-sm text-muted-foreground mt-1">Design and configure your lead capture form.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="lg:hidden flex bg-muted p-1 rounded-xl">
            <button 
              onClick={() => setActiveTab("build")}
              className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-colors ${activeTab === "build" ? "bg-surface text-foreground shadow-sm" : "text-muted-foreground"}`}
            >
              Build
            </button>
            <button 
              onClick={() => setActiveTab("preview")}
              className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${activeTab === "preview" ? "bg-surface text-foreground shadow-sm" : "text-muted-foreground"}`}
            >
              <Smartphone className="w-4 h-4" /> Preview
            </button>
          </div>
          
          <button 
            onClick={handleSave} 
            disabled={loading}
            className="inline-flex justify-center items-center px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" /> {isEditMode ? "Update Form" : "Publish Form"}
              </>
            )}
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Form Settings & Fields (Left Panel) */}
        <div className={`flex-1 space-y-8 ${activeTab === "preview" ? "hidden lg:block" : "block"}`}>
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden"
          >
            <div className="px-6 py-5 border-b border-border bg-muted/20 flex items-center gap-2">
              <Settings className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">General Settings</h2>
            </div>
            <div className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Form Title</label>
                <input 
                  value={title} 
                  onChange={e => setTitle(e.target.value)} 
                  placeholder="e.g. Website Contact Form"
                  className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm font-medium" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Description</label>
                <textarea 
                  value={description} 
                  onChange={e => setDescription(e.target.value)} 
                  placeholder="A brief description of what this form is for (optional)"
                  rows={3}
                  className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm resize-none" 
                />
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden"
          >
            <div className="px-6 py-5 border-b border-border bg-muted/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layout className="w-5 h-5 text-info" />
                <h2 className="text-lg font-semibold text-foreground">Form Fields</h2>
              </div>
              <button 
                onClick={addField} 
                className="flex items-center px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-sm font-medium hover:bg-primary/20 transition-colors"
              >
                <Plus className="w-4 h-4 mr-1.5" /> Add Field
              </button>
            </div>

            <div className="p-6">
              <AnimatePresence>
                <div className="space-y-4">
                  {fields.map((field, index) => (
                    <motion.div 
                      key={index}
                      initial={{ opacity: 0, height: 0, scale: 0.95 }}
                      animate={{ opacity: 1, height: "auto", scale: 1 }}
                      exit={{ opacity: 0, height: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="p-5 border border-border rounded-xl bg-muted/30 flex gap-4 group hover:border-primary/50 transition-colors relative"
                    >
                      <div className="absolute top-5 right-5">
                        <button 
                          onClick={() => removeField(index)} 
                          className="text-muted-foreground hover:text-danger p-1.5 rounded-lg hover:bg-danger/10 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                          title="Remove field"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex-1 space-y-4 pr-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Field Label</label>
                            <input 
                              value={field.label} 
                              onChange={e => updateField(index, "label", e.target.value)} 
                              placeholder="e.g. Phone Number"
                              className="w-full px-3 py-2 text-sm bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary shadow-sm" 
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Database Key</label>
                            <input 
                              value={field.name} 
                              onChange={e => updateField(index, "name", e.target.value)} 
                              placeholder="e.g. phone_number"
                              className="w-full px-3 py-2 text-sm bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary shadow-sm font-mono text-xs" 
                            />
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-6">
                          <div className="space-y-1.5 min-w-[200px]">
                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Input Type</label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                {getFieldIcon(field.type)}
                              </div>
                              <select 
                                value={field.type} 
                                onChange={e => updateField(index, "type", e.target.value)} 
                                className="w-full appearance-none pl-9 pr-10 py-2 bg-surface border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary shadow-sm cursor-pointer"
                              >
                                <option value="text">Short Text</option>
                                <option value="alphanumeric">Alphanumeric</option>
                                <option value="tel">Phone Number</option>
                                <option value="email">Email</option>
                                <option value="number">Number</option>
                                <option value="textarea">Long Text</option>
                              </select>
                              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                                <ChevronDown className="w-4 h-4 text-muted-foreground" />
                              </div>
                            </div>
                          </div>

                          <label className="flex items-center gap-2 cursor-pointer mt-5 group/req">
                            <div className="relative flex items-center">
                              <input 
                                type="checkbox" 
                                checked={field.is_required} 
                                onChange={e => updateField(index, "is_required", e.target.checked)} 
                                className="peer sr-only" 
                              />
                              <div className="w-5 h-5 rounded border border-border bg-surface peer-checked:bg-primary peer-checked:border-primary transition-colors flex items-center justify-center">
                                <CheckSquare className="w-3.5 h-3.5 text-primary-foreground opacity-0 peer-checked:opacity-100 transition-opacity" />
                              </div>
                            </div>
                            <span className="text-sm font-medium text-foreground group-hover/req:text-primary transition-colors">Required Field</span>
                          </label>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  
                  {fields.length === 0 && (
                    <div className="p-8 text-center text-muted-foreground bg-muted/30 border border-dashed border-border rounded-xl">
                      <Layout className="w-8 h-8 mx-auto mb-3 opacity-20" />
                      <p className="text-sm font-medium">No fields added yet</p>
                      <button onClick={addField} className="text-primary hover:underline text-sm mt-1">Add your first field</button>
                    </div>
                  )}
                </div>
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

        {/* Preview Panel (Right Panel) */}
        <div className={`w-full lg:w-96 flex-shrink-0 ${activeTab === "build" ? "hidden lg:block" : "block"}`}>
          <div className="sticky top-8 space-y-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-surface rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-border overflow-hidden"
            >
              <div className="bg-muted px-4 py-3 border-b border-border flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-danger/50" />
                  <div className="w-2.5 h-2.5 rounded-full bg-warning/50" />
                  <div className="w-2.5 h-2.5 rounded-full bg-success/50" />
                </div>
                <div className="mx-auto flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <Eye className="w-3.5 h-3.5" /> Live Preview
                </div>
                <div className="w-10" /> {/* Spacer for centering */}
              </div>

              <div className="p-6">
                <div className="space-y-6">
                  <div className="text-center space-y-2">
                    <h3 className="font-bold text-xl text-foreground tracking-tight">{title || "Untitled Form"}</h3>
                    {description && <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>}
                  </div>
                  
                  <div className="space-y-4 pt-2">
                    {fields.map((f, i) => (
                      <div key={i} className="space-y-1.5">
                        <label className="block text-sm font-medium text-foreground">
                          {f.label || "Untitled Field"} {f.is_required && <span className="text-danger ml-0.5">*</span>}
                        </label>
                        {f.type === "textarea" ? (
                          <textarea 
                            placeholder={f.placeholder} 
                            className="w-full px-3 py-2 bg-muted/50 border border-border rounded-xl text-sm focus:outline-none transition-all resize-none pointer-events-none" 
                            rows={3}
                            disabled 
                          />
                        ) : (
                          <input 
                            type={f.type} 
                            placeholder={f.placeholder} 
                            className="w-full px-3 py-2 bg-muted/50 border border-border rounded-xl text-sm focus:outline-none transition-all pointer-events-none" 
                            disabled 
                          />
                        )}
                      </div>
                    ))}
                    
                    <button 
                      disabled 
                      className="w-full py-2.5 bg-primary text-primary-foreground font-medium rounded-xl mt-6 opacity-80 pointer-events-none transition-opacity"
                    >
                      Submit Lead
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FormBuilderPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4"></div>
        <p className="text-muted-foreground font-medium">Loading builder...</p>
      </div>
    }>
      <FormBuilderContent />
    </Suspense>
  );
}
