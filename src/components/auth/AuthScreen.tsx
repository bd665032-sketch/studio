
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
    <div className="min-h-screen bg-white flex flex-col font-body overflow-hidden">
      {/* Curved Header Section - Native App Look */}
      <div className="relative h-[42vh] bg-[#1E3A8A] flex flex-col items-center justify-center overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <Globe className="absolute top-10 left-10 w-24 h-24 text-white animate-pulse" />
          <Shield className="absolute bottom-10 right-10 w-24 h-24 text-white animate-pulse" />
        </div>
        
        {/* Modern Curved overlay */}
        <div className="absolute bottom-[-70px] left-[-15%] right-[-15%] h-[180px] bg-white rounded-[100%] shadow-[0_-10px_30px_rgba(0,0,0,0.05)]"></div>
        
        <div className="z-10 bg-white p-6 rounded-full shadow-2xl border-[6px] border-blue-50/50 mb-6 scale-110">
          <div className="w-20 h-20 bg-gradient-to-br from-[#1E3A8A] to-[#3B82F6] rounded-full flex items-center justify-center shadow-inner">
            <span className="text-white text-4xl font-black italic">MG</span>
          </div>
        </div>

        <div className="z-10 text-center px-6">
          <h1 className="text-[22px] font-black text-white leading-tight uppercase tracking-[0.2em] drop-shadow-lg">MINAR GO CONNECT</h1>
          <p className="text-blue-200 font-bold text-[10px] uppercase tracking-[0.4em] mt-2">PREMIUM SECURE ACCESS</p>
        </div>
      </div>

      <div className="flex-1 px-10 pt-10 pb-16 z-20 bg-white">
        {/* Premium Native-Style Tab Switcher */}
        <div className="flex bg-slate-100 p-1.5 rounded-[28px] mb-10 shadow-inner">
          <button 
            onClick={() => setIsLogin(true)} 
            className={`flex-1 py-4 rounded-[24px] text-sm font-black transition-all duration-500 ${isLogin ? 'bg-[#1E3A8A] text-white shadow-xl scale-[1.05]' : 'text-slate-400'}`}
          >
            লগইন
          </button>
          <button 
            onClick={() => setIsLogin(false)} 
            className={`flex-1 py-4 rounded-[24px] text-sm font-black transition-all duration-500 ${!isLogin ? 'bg-[#1E3A8A] text-white shadow-xl scale-[1.05]' : 'text-slate-400'}`}
          >
            সাইন আপ
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="relative group">
            <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-[#1E3A8A] transition-colors" />
            <Input 
              type="email" 
              placeholder="Admin Email" 
              required 
              value={formData.email} 
              onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
              className="h-18 pl-16 rounded-[28px] bg-slate-50 border-none shadow-inner text-lg font-black" 
            />
          </div>
          <div className="relative group">
            <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-[#1E3A8A] transition-colors" />
            <Input 
              type="password" 
              placeholder="Password" 
              required 
              value={formData.password} 
              onChange={(e) => setFormData({ ...formData, password: e.target.value })} 
              className="h-18 pl-16 rounded-[28px] bg-slate-50 border-none shadow-inner text-lg font-black" 
            />
          </div>
          <Button 
            className="w-full h-18 rounded-[28px] bg-[#1E3A8A] hover:bg-[#1E3A8A]/95 text-white text-lg font-black shadow-[0_15px_30px_rgba(30,64,175,0.3)] mt-8 active:scale-95 transition-all flex items-center justify-center gap-3" 
            disabled={loading}
          >
            {loading ? <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white"></div> : (isLogin ? <><ShieldCheck className="w-6 h-6" /> SECURE LOGIN</> : "CREATE ADMIN NODE")}
          </Button>
          
          {isLogin && (
            <p className="text-center text-[10px] text-slate-300 font-black uppercase tracking-widest mt-6">
              Forgot access credentials? Contact Main Office
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
