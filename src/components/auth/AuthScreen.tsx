"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { Mail, Lock, User, ShieldCheck, KeyRound } from "lucide-react";

const AUTHORIZED_ADMINS = ["dulal", "omar faruk", "shahid"];
const ADMIN_SECRET_KEY = "MINAR2026"; 

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ 
    email: "", 
    password: "", 
    fullName: "",
    accessKey: "" 
  });
  const { toast } = useToast();
  const auth = useAuth();

  const validatePassword = (password: string) => {
    if (password.length < 8) return "পাসওয়ার্ড অন্তত ৮ অক্ষরের হতে হবে।";
    if (!/[A-Z]/.test(password)) return "পাসওয়ার্ডে অন্তত একটি বড় হাতের অক্ষর (A-Z) থাকতে হবে।";
    if (!/[a-z]/.test(password)) return "পাসওয়ার্ডে অন্তত একটি ছোট হাতের অক্ষর (a-z) থাকতে হবে।";
    if (!/[0-9]/.test(password)) return "পাসওয়ার্ডে অন্তত একটি সংখ্যা থাকতে হবে।";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;
    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, formData.email, formData.password);
        toast({ title: "স্বাগতম!", description: "সিকিউর লগইন সফল হয়েছে।" });
      } else {
        // Validation for new registration
        if (!AUTHORIZED_ADMINS.includes(formData.fullName.toLowerCase())) {
          throw new Error("আপনি এই ফাউন্ডেশনের অনুমোদিত অ্যাডমিন নন। আপনার নাম লিস্টে থাকতে হবে।");
        }
        if (formData.accessKey !== ADMIN_SECRET_KEY) {
          throw new Error("সিকিউরিটি এক্সেস কী ভুল।");
        }

        const passwordError = validatePassword(formData.password);
        if (passwordError) {
          throw new Error(passwordError);
        }

        const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        await updateProfile(userCredential.user, { displayName: formData.fullName });
        
        toast({ title: "সফল!", description: "শক্তিশালী অ্যাডমিন প্রোফাইল তৈরি হয়েছে।" });
      }
    } catch (error: any) {
      toast({ 
        variant: "destructive", 
        title: "অ্যাক্সেস ডিনাইড", 
        description: error.message || "লগইন বা সাইন আপ ব্যর্থ হয়েছে।" 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-auth-premium flex flex-col font-body overflow-hidden items-center justify-center p-4">
      {/* Absolute Decorative Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[300px] h-[300px] bg-white/10 rounded-full blur-[80px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-blue-400/10 rounded-full blur-[100px]"></div>

      <div className="w-full max-w-[420px] bg-white/95 backdrop-blur-xl rounded-[45px] shadow-[0_25px_80px_rgba(0,0,0,0.4)] overflow-hidden border border-white/30 relative z-10">
        
        <div className="relative py-10 flex flex-col items-center justify-center text-center px-6">
          <div className="z-10 bg-white p-4 rounded-full shadow-xl border-4 border-blue-50/50 mb-5">
            <div className="w-14 h-14 bg-gradient-to-br from-[#1E3A8A] to-[#6366F1] rounded-full flex items-center justify-center shadow-inner">
              <span className="text-white text-2xl font-black italic">MG</span>
            </div>
          </div>

          <div className="z-10">
            <h1 className="text-[20px] font-black text-[#1E3A8A] leading-tight uppercase tracking-[0.1em]">MINAR GO CONNECT</h1>
            <p className="text-slate-400 font-bold text-[9px] uppercase tracking-[0.3em] mt-2">SECURE ADMIN GATEWAY</p>
          </div>
        </div>

        <div className="px-8 pb-10">
          <div className="space-y-8">
            <div className="flex bg-slate-100 p-1.5 rounded-[28px] shadow-inner">
              <button 
                type="button"
                onClick={() => setIsLogin(true)} 
                className={`flex-1 py-4 rounded-[24px] text-xs font-black transition-all duration-500 ${isLogin ? 'bg-[#1E3A8A] text-white shadow-lg' : 'text-slate-400'}`}
              >
                লগইন
              </button>
              <button 
                type="button"
                onClick={() => setIsLogin(false)} 
                className={`flex-1 py-4 rounded-[24px] text-xs font-black transition-all duration-500 ${!isLogin ? 'bg-[#1E3A8A] text-white shadow-lg' : 'text-slate-400'}`}
              >
                রেজিস্ট্রেশন
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <>
                  <div className="relative group">
                    <User className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-[#1E3A8A] transition-colors" />
                    <Input 
                      type="text" 
                      placeholder="আপনার পুরো নাম (Admin Only)" 
                      required 
                      value={formData.fullName} 
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} 
                      className="h-16 pl-16 rounded-[24px] bg-slate-50 border-none text-base font-black" 
                    />
                  </div>
                  <div className="relative group">
                    <KeyRound className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-[#1E3A8A] transition-colors" />
                    <Input 
                      type="password" 
                      placeholder="অ্যাডমিন সিক্রেট কী" 
                      required 
                      value={formData.accessKey} 
                      onChange={(e) => setFormData({ ...formData, accessKey: e.target.value })} 
                      className="h-16 pl-16 rounded-[24px] bg-slate-50 border-none text-base font-black" 
                    />
                  </div>
                </>
              )}
              
              <div className="relative group">
                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-[#1E3A8A] transition-colors" />
                <Input 
                  type="email" 
                  placeholder="ইমেইল অ্যাড্রেস" 
                  required 
                  value={formData.email} 
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
                  className="h-16 pl-16 rounded-[24px] bg-slate-50 border-none text-base font-black" 
                />
              </div>
              <div className="relative group">
                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-[#1E3A8A] transition-colors" />
                <Input 
                  type="password" 
                  placeholder="পাসওয়ার্ড" 
                  required 
                  value={formData.password} 
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })} 
                  className="h-16 pl-16 rounded-[24px] bg-slate-50 border-none text-base font-black" 
                />
              </div>

              <Button 
                type="submit"
                className="w-full h-16 rounded-[24px] bg-[#1E3A8A] hover:bg-[#1E3A8A]/95 text-white text-sm font-black shadow-[0_12px_24px_rgba(30,64,175,0.25)] active:scale-95 transition-all flex items-center justify-center gap-3" 
                disabled={loading}
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white"></div>
                ) : (
                  <>
                    <ShieldCheck className="w-5 h-5" /> 
                    {isLogin ? "SECURE ACCESS" : "AUTHORIZE ADMIN"}
                  </>
                )}
              </Button>
              
              <p className="text-center text-[9px] text-slate-400 font-black uppercase tracking-widest mt-6">
                {isLogin ? "Authenticated Node Access" : "Strong Password Required (8+ chars, A-Z, a-z, 0-9)"}
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
