
"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { Mail, Lock, Globe, Shield } from "lucide-react";

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
      {/* Curved Header Section */}
      <div className="relative h-[38vh] bg-[#1E3A8A] flex flex-col items-center justify-center overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <Globe className="absolute top-10 left-10 w-24 h-24 text-white" />
          <Shield className="absolute bottom-10 right-10 w-24 h-24 text-white" />
        </div>
        {/* Curved overlay */}
        <div className="absolute bottom-[-60px] left-[-10%] right-[-10%] h-[160px] bg-white rounded-[100%] shadow-lg"></div>
        
        <div className="z-10 bg-white p-5 rounded-full shadow-2xl border-[5px] border-indigo-100 mb-4">
          <div className="w-16 h-16 bg-[#1E3A8A] rounded-full flex items-center justify-center">
            <span className="text-white text-3xl font-black">MG</span>
          </div>
        </div>
      </div>

      <div className="flex-1 px-8 pt-6 pb-12 z-20 bg-white">
        <div className="text-center mb-8">
          <h1 className="text-[20px] font-black text-[#1E3A8A] leading-tight uppercase">MINAR GO EXPATRIATE</h1>
          <h2 className="text-[17px] font-black text-[#1E3A8A] leading-tight uppercase mb-2">DEVELOPMENT FOUNDATION</h2>
          <p className="text-indigo-400 font-bold text-xs uppercase tracking-widest">United Experiences, Brighter Future</p>
        </div>

        {/* Premium Tab Switcher */}
        <div className="flex bg-slate-50 p-1.5 rounded-[22px] mb-8 shadow-inner">
          <button 
            onClick={() => setIsLogin(true)} 
            className={`flex-1 py-4 rounded-[18px] text-sm font-black transition-all duration-300 ${isLogin ? 'bg-[#1E3A8A] text-white shadow-lg scale-[1.02]' : 'text-slate-400'}`}
          >
            লগইন
          </button>
          <button 
            onClick={() => setIsLogin(false)} 
            className={`flex-1 py-4 rounded-[18px] text-sm font-black transition-all duration-300 ${!isLogin ? 'bg-[#1E3A8A] text-white shadow-lg scale-[1.02]' : 'text-slate-400'}`}
          >
            সাইন আপ
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-300" />
            <Input 
              type="email" 
              placeholder="Email Address" 
              required 
              value={formData.email} 
              onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
              className="h-16 pl-14 rounded-[22px] bg-slate-50 border-none shadow-inner text-lg" 
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-300" />
            <Input 
              type="password" 
              placeholder="Password" 
              required 
              value={formData.password} 
              onChange={(e) => setFormData({ ...formData, password: e.target.value })} 
              className="h-16 pl-14 rounded-[22px] bg-slate-50 border-none shadow-inner text-lg" 
            />
          </div>
          <Button 
            className="w-full h-16 rounded-[22px] bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-white text-lg font-black shadow-xl mt-4 active:scale-95 transition-all" 
            disabled={loading}
          >
            {loading ? "অপেক্ষা করুন..." : (isLogin ? "Login Now" : "Create Account")}
          </Button>
        </form>
      </div>
    </div>
  );
}
