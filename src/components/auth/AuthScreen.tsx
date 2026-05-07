"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { Mail, Lock, Globe, Shield, ShieldCheck } from "lucide-react";

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const { toast } = useToast();
  const auth = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;
    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, formData.email, formData.password);
        toast({ title: "স্বাগতম!", description: "লগইন সফল হয়েছে।" });
      } else {
        await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        toast({ title: "সফল!", description: "অ্যাকাউন্ট তৈরি হয়েছে।" });
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "ত্রুটি", description: "লগইন বা সাইন আপ ব্যর্থ হয়েছে।" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-auth-premium flex flex-col font-body overflow-hidden items-center justify-center p-4">
      <div className="w-full max-w-[420px] bg-white/95 backdrop-blur-xl rounded-[45px] shadow-[0_25px_80px_rgba(0,0,0,0.3)] overflow-hidden border border-white/20">
        
        {/* Top Branding Section */}
        <div className="relative py-12 flex flex-col items-center justify-center text-center px-6">
          <div className="z-10 bg-white p-4 rounded-full shadow-xl border-4 border-blue-50/50 mb-5">
            <div className="w-14 h-14 bg-gradient-to-br from-[#1E3A8A] to-[#6366F1] rounded-full flex items-center justify-center shadow-inner">
              <span className="text-white text-2xl font-black italic">MG</span>
            </div>
          </div>

          <div className="z-10">
            <h1 className="text-[20px] font-black text-[#1E3A8A] leading-tight uppercase tracking-[0.1em]">MINAR GO CONNECT</h1>
            <p className="text-slate-400 font-bold text-[9px] uppercase tracking-[0.3em] mt-2">PREMIUM SECURE ACCESS NODE</p>
          </div>
        </div>

        {/* Auth Form Section */}
        <div className="px-8 pb-12">
          <div className="space-y-8">
            {/* Premium Tab Switcher */}
            <div className="flex bg-slate-100 p-1.5 rounded-[28px] shadow-inner">
              <button 
                onClick={() => setIsLogin(true)} 
                className={`flex-1 py-4 rounded-[24px] text-xs font-black transition-all duration-500 ${isLogin ? 'bg-[#1E3A8A] text-white shadow-lg' : 'text-slate-400'}`}
              >
                লগইন
              </button>
              <button 
                onClick={() => setIsLogin(false)} 
                className={`flex-1 py-4 rounded-[24px] text-xs font-black transition-all duration-500 ${!isLogin ? 'bg-[#1E3A8A] text-white shadow-lg' : 'text-slate-400'}`}
              >
                সাইন আপ
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="relative group">
                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-[#1E3A8A] transition-colors" />
                <Input 
                  type="email" 
                  placeholder="Admin Email" 
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
                  placeholder="Password" 
                  required 
                  value={formData.password} 
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })} 
                  className="h-16 pl-16 rounded-[24px] bg-slate-50 border-none text-base font-black" 
                />
              </div>
              <Button 
                className="w-full h-16 rounded-[24px] bg-[#1E3A8A] hover:bg-[#1E3A8A]/95 text-white text-sm font-black shadow-[0_12px_24px_rgba(30,64,175,0.25)] active:scale-95 transition-all flex items-center justify-center gap-3" 
                disabled={loading}
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white"></div>
                ) : (
                  <>
                    <ShieldCheck className="w-5 h-5" /> 
                    {isLogin ? "SECURE ACCESS" : "CREATE ACCOUNT"}
                  </>
                )}
              </Button>
              
              <p className="text-center text-[9px] text-slate-300 font-black uppercase tracking-widest mt-6">
                Protected by End-to-End Encryption
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}