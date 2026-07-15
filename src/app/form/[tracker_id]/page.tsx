"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { 
  User, Phone, MapPin, Building2, Monitor, DollarSign, 
  AlertCircle, Briefcase, HelpCircle, FileText, TrendingUp, 
  CheckCircle2, Mail, IndianRupee 
} from "lucide-react";
import logoImg from "../../../../public/bullmart.png";

export default function PublicFormPage() {
  const { tracker_id } = useParams();
  const [formData, setFormData] = useState<any>(null);
  const [logoUrl, setLogoUrl] = useState("/bullmart.png");
  const [fields, setFields] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [consentGiven, setConsentGiven] = useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);

  useEffect(() => {
    fetch(`/api/public/form/${tracker_id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setFormData(data.data.form);
        setFields(data.data.fields);
        if (data.data.logo_url) {
          let url = data.data.logo_url;
          if (!url.startsWith('http') && !url.startsWith('/') && !url.startsWith('data:')) {
            url = '/' + url;
          }
          setLogoUrl(url);
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [tracker_id]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    const formElement = e.currentTarget;
    const formData = new FormData(formElement);
    const data = Object.fromEntries(formData.entries());

    try {
      const res = await fetch(`/api/public/form/${tracker_id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        throw new Error("Failed to submit form");
      }
      
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const getFieldIcon = (name: string, type: string) => {
    const n = name.toLowerCase();
    if (n.includes('name')) return <User className="w-5 h-5 text-gray-400" />;
    if (n.includes('phone') || n.includes('mobile')) return <Phone className="w-5 h-5 text-gray-400" />;
    if (n.includes('location') || n.includes('city') || n.includes('address')) return <MapPin className="w-5 h-5 text-gray-400" />;
    if (n.includes('provider') || n.includes('demat')) return <Building2 className="w-5 h-5 text-gray-400" />;
    if (n.includes('platform')) return <Monitor className="w-5 h-5 text-gray-400" />;
    if (n.includes('loss')) return <AlertCircle className="w-5 h-5 text-gray-400" />;
    if (n.includes('capital') || n.includes('amount') || n.includes('fund')) return <IndianRupee className="w-5 h-5 text-gray-400" />;
    if (n.includes('experience')) return <Briefcase className="w-5 h-5 text-gray-400" />;
    if (n.includes('tip') || n.includes('level') || n.includes('need')) return <HelpCircle className="w-5 h-5 text-gray-400" />;
    if (type === 'email') return <Mail className="w-5 h-5 text-gray-400" />;
    return <FileText className="w-5 h-5 text-gray-400" />;
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f9fb]">
      <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
    </div>
  );
  
  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f9fb]">
      <div className="bg-white p-10 rounded-3xl shadow-xl text-center max-w-md w-full border border-gray-100">
        <div className="w-16 h-16 bg-red-100 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Form Unavailable</h2>
        <p className="text-gray-500 font-medium">{error}</p>
      </div>
    </div>
  );

  if (submitted) return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f9fb] p-4">
      <div className="bg-white p-10 rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] text-center max-w-md w-full border border-gray-50">
        <div className="w-20 h-20 bg-green-50 text-green-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-green-100">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-extrabold text-gray-900 mb-3 tracking-tight">Success!</h2>
        <p className="text-gray-500 font-medium leading-relaxed">{formData?.success_message || "Your information has been submitted successfully."}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8f9fb] py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden flex items-center justify-center">
      {/* Abstract Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-200/40 rounded-full blur-3xl opacity-70"></div>
        <div className="absolute top-40 right-20 w-80 h-80 bg-blue-200/40 rounded-full blur-3xl opacity-70"></div>
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-teal-100/40 rounded-full blur-3xl opacity-70"></div>
        
        {/* Subtle grid pattern or shapes can go here if needed */}
      </div>

      <div className="relative w-full max-w-5xl mx-auto bg-white/90 backdrop-blur-xl rounded-[2.5rem] shadow-[0_20px_80px_-15px_rgba(0,0,0,0.05)] border border-white/50 p-8 sm:p-12 lg:p-16">
        
        <div className="text-center mb-14">
          <div className="mx-auto mb-8 flex justify-center">
            <img src={logoImg.src} alt="Bull Mart Securities" className="h-40 w-auto object-contain drop-shadow-sm scale-[1.1]" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">{formData.title}</h1>
          {formData.description && (
            <p className="text-lg text-gray-500 font-medium max-w-2xl mx-auto">{formData.description}</p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-8">
            {fields.map((field) => (
              <div key={field.id} className="group">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2.5 ml-1">
                  {field.label} {field.is_required && <span className="text-red-400">*</span>}
                </label>
                
                <div className="relative transition-all duration-200">
                  {field.type === "textarea" ? (
                    <>
                      <div className="absolute top-4 left-4 pointer-events-none">
                        {getFieldIcon(field.name, field.type)}
                      </div>
                      <textarea
                        name={field.name}
                        required={field.is_required}
                        placeholder={field.placeholder || ""}
                        className="appearance-none block w-full pl-12 pr-4 py-3.5 bg-[#f8f9fc] border-2 border-transparent rounded-2xl placeholder-gray-400 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200 sm:text-sm font-medium text-gray-900 shadow-sm hover:bg-[#f1f3f9]"
                        rows={4}
                      />
                    </>
                  ) : (
                    <>
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        {getFieldIcon(field.name, field.type)}
                      </div>
                      <input
                        type={field.type === 'alphanumeric' ? 'text' : field.type}
                        name={field.name}
                        required={field.is_required}
                        placeholder={field.placeholder || ""}
                        {...((field.type === 'tel' || field.name.toLowerCase().includes('phone') || field.name.toLowerCase().includes('mobile')) 
                          ? { 
                              pattern: "[0-9]{10}", 
                              title: "Please enter a valid 10-digit phone number",
                              maxLength: 10,
                              minLength: 10,
                              onInput: (e: any) => {
                                e.target.value = e.target.value.replace(/[^0-9]/g, '');
                              }
                            } 
                          : field.type === 'alphanumeric'
                          ? {
                              pattern: "[a-zA-Z0-9 ]+",
                              title: "Please enter only alphanumeric characters",
                              onInput: (e: any) => {
                                e.target.value = e.target.value.replace(/[^a-zA-Z0-9 ]/g, '');
                              }
                            }
                          : {})}
                        className="appearance-none block w-full pl-12 pr-4 py-4 bg-[#f8f9fc] border-2 border-transparent rounded-2xl placeholder-gray-400 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200 sm:text-sm font-medium text-gray-900 shadow-sm hover:bg-[#f1f3f9]"
                      />
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="relative flex items-center mt-0.5">
                <input 
                  type="checkbox" 
                  required
                  checked={consentGiven}
                  onChange={(e) => setConsentGiven(e.target.checked)}
                  className="peer sr-only"
                />
                <div className="w-5 h-5 rounded border-2 border-gray-300 bg-white peer-checked:bg-indigo-500 peer-checked:border-indigo-500 transition-colors flex items-center justify-center shadow-sm group-hover:border-indigo-400">
                  <CheckCircle2 className="w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                </div>
              </div>
              <span className="text-sm font-medium text-gray-600 leading-relaxed group-hover:text-gray-900 transition-colors">
                I agree to the <button type="button" onClick={(e) => { e.preventDefault(); setShowPrivacyPolicy(true); }} className="text-indigo-600 hover:underline font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 rounded-sm">Terms of Service and Privacy Policy</button>, and consent to being contacted regarding my inquiry.
              </span>
            </label>
          </div>

          <div className="pt-6 flex justify-center">
            <button
              type="submit"
              disabled={loading || !consentGiven}
              className="px-10 py-4 border border-transparent rounded-2xl shadow-xl shadow-indigo-500/20 text-base font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/30 transition-all duration-300 transform hover:-translate-y-1 w-full md:w-auto min-w-[240px] disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3"></div>
                  Processing...
                </div>
              ) : (
                formData.submit_btn_text || "Submit"
              )}
            </button>
          </div>
        </form>

        <div className="mt-12 pt-8 border-t border-gray-100 flex flex-col items-center">
          <p className="text-sm text-gray-500 font-medium mb-5">Or connect with us directly</p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="https://t.me/yourtelegram" target="_blank" rel="noreferrer" className="flex items-center gap-2.5 px-6 py-3.5 bg-[#f8f9fc] text-gray-700 hover:text-[#0088cc] hover:bg-[#0088cc]/10 rounded-2xl transition-all duration-200 font-bold text-sm border border-transparent hover:border-[#0088cc]/20 shadow-sm">
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.19-.08-.05-.19-.02-.27 0-.11.03-1.89 1.21-5.32 3.53-.51.35-.97.52-1.38.51-.45-.01-1.31-.25-1.95-.46-.78-.25-1.4-.38-1.34-.81.03-.22.35-.45.96-.68 3.75-1.63 6.25-2.71 7.49-3.23 3.56-1.49 4.3-1.74 4.79-1.75.11 0 .35.02.48.13.11.09.13.21.14.33.01.07.01.16 0 .23z"/>
              </svg>
              Telegram
            </a>
            <a href="https://wa.me/1234567890" target="_blank" rel="noreferrer" className="flex items-center gap-2.5 px-6 py-3.5 bg-[#f8f9fc] text-gray-700 hover:text-[#25D366] hover:bg-[#25D366]/10 rounded-2xl transition-all duration-200 font-bold text-sm border border-transparent hover:border-[#25D366]/20 shadow-sm">
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              WhatsApp
            </a>
          </div>
        </div>
      </div>

      {/* Privacy Policy Modal */}
      {showPrivacyPolicy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200 border border-gray-100">
            <div className="px-6 py-5 sm:px-8 sm:py-6 border-b border-gray-100 flex justify-between items-center bg-[#f8f9fc]">
              <h3 className="text-lg sm:text-xl font-extrabold text-gray-900">Privacy Policy & Terms of Service</h3>
              <button type="button" onClick={() => setShowPrivacyPolicy(false)} className="text-gray-400 hover:text-gray-700 hover:bg-gray-200 p-2 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            <div className="p-6 sm:p-8 overflow-y-auto text-gray-600 text-sm space-y-5 flex-1">
              <div>
                <h4 className="font-bold text-gray-900 text-base mb-1.5">1. Introduction</h4>
                <p className="leading-relaxed">Welcome to our platform. We are committed to protecting your personal information and your right to privacy. If you have any questions or concerns about our policy, or our practices with regards to your personal information, please contact us.</p>
              </div>
              
              <div>
                <h4 className="font-bold text-gray-900 text-base mb-1.5">2. Information We Collect</h4>
                <p className="leading-relaxed">We collect personal information that you voluntarily provide to us when expressing an interest in obtaining information about us or our products and services. The personal information that we collect depends on the context of your interactions with us and the choices you make.</p>
              </div>
              
              <div>
                <h4 className="font-bold text-gray-900 text-base mb-1.5">3. How We Use Your Information</h4>
                <p className="leading-relaxed">We use personal information collected via our platform for a variety of business purposes described below. We process your personal information for these purposes in reliance on our legitimate business interests, in order to enter into or perform a contract with you, with your consent, and/or for compliance with our legal obligations.</p>
              </div>

              <div>
                <h4 className="font-bold text-gray-900 text-base mb-1.5">4. Sharing Your Information</h4>
                <p className="leading-relaxed">We only share information with your consent, to comply with laws, to provide you with services, to protect your rights, or to fulfill business obligations.</p>
              </div>

              <div>
                <h4 className="font-bold text-gray-900 text-base mb-1.5">5. Consent & Declaration</h4>
                <p className="leading-relaxed mb-3">Please read carefully before submitting your details.</p>
                <p className="leading-relaxed mb-2">By checking this box and submitting this form, I confirm that:</p>
                <ol className="list-decimal pl-5 space-y-2 leading-relaxed text-gray-600">
                  <li>I am voluntarily providing my personal and trading-related information to receive consultation regarding my stock market losses.</li>
                  <li>The information provided by me is true and accurate to the best of my knowledge.</li>
                  <li>I understand that submitting this form does not guarantee recovery of my financial losses or any specific financial outcome.</li>
                  <li>I authorize the company and its representatives to contact me via phone call, WhatsApp, SMS, email, or Telegram regarding my enquiry and related services.</li>
                  <li>I understand that my information will be kept confidential and used only for the purpose of evaluating my case and providing consultation.</li>
                  <li>I agree not to submit false, misleading, or fraudulent information.</li>
                  <li>I understand that the final assessment and eligibility for any recovery-related assistance will be determined only after reviewing my case.</li>
                </ol>
              </div>
            </div>
            <div className="px-6 py-4 sm:px-8 sm:py-5 border-t border-gray-100 bg-gray-50 flex justify-end">
              <button type="button" onClick={() => setShowPrivacyPolicy(false)} className="px-8 py-2.5 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl transition-colors focus:outline-none focus:ring-4 focus:ring-gray-900/20 shadow-sm">
                I Understand
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
