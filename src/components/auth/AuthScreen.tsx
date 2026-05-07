
"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { Mail, Lock, ChevronRight, Globe, Shield } from "lucide-react";

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
        toast({ title: "সফল হয়েছে!", description: "আপনার একাউন্ট তৈরি হয়েছে।" });
      }
    } catch (error: any) {
      let message = "Authentication failed.";
      if (error.code === 'auth/invalid-credential') {
        message = "ইমেইল বা পাসওয়ার্ড ভুল।";
      } else if (error.code === 'auth/email-already-in-use') {
        message = "এই ইমেইলটি ইতিমধ্যে ব্যবহৃত হচ্ছে।";
      }
      toast({ variant: "destructive", title: "ত্রুটি", description: message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-body overflow-hidden">
      {/* Top Header Illustration Area */}
      <div className="relative h-[35vh] bg-primary flex flex-col items-center justify-center overflow-hidden">
        {/* Decorative elements to mimic screenshot */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-10 left-10"><Globe className="w-16 h-16 text-white" /></div>
          <div className="absolute bottom-10 right-10"><Shield className="w-20 h-20 text-white" /></div>
        </div>
        
        {/* Main curved background effect */}
        <div className="absolute bottom-[-50px] left-[-10%] right-[-10%] h-[150px] bg-white rounded-[100%] shadow-[0_-10px_30px_rgba(0,0,0,0.1)]"></div>
        
        <div className="z-10 bg-white p-4 rounded-full shadow-xl border-4 border-accent mb-4">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
            <span className="text-white text-3xl font-black">MG</span>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 px-8 pt-8 pb-12 z-20 bg-white">
        <div className="text-center mb-10">
          <h1 className="text-[22px] font-black text-primary leading-tight tracking-tight uppercase">
            MINAR GO EXPATRIATE
          </h1>
          <h2 className="text-[18px] font-black text-primary leading-tight tracking-tight uppercase mb-2">
            DEVELOPMENT FOUNDATION
          </h2>
          <p className="text-accent font-bold text-xs">
            United Experiences, Brightfar Future
          </p>
        </div>

        {/* Auth Tabs */}
        <div className="flex bg-secondary/50 p-1 rounded-full mb-8">
          <button 
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-3 rounded-full text-sm font-bold transition-all ${isLogin ? 'bg-primary text-white shadow-md' : 'text-primary/60'}`}
          >
            Login
          </button>
          <button 
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-3 rounded-full text-sm font-bold transition-all ${!isLogin ? 'bg-primary text-white shadow-md' : 'text-primary/60'}`}
          >
            Sign Up
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
              <Mail className="w-5 h-5 text-primary/40 group-focus-within:text-primary transition-colors" />
            </div>
            <Input 
              type="email" 
              placeholder="Email Address" 
              required 
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="h-14 pl-12 rounded-xl bg-secondary/30 border-none focus:ring-2 focus:ring-primary shadow-sm"
            />
          </div>

          <div className="relative group">
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
              <Lock className="w-5 h-5 text-primary/40 group-focus-within:text-primary transition-colors" />
            </div>
            <Input 
              type="password" 
              placeholder="Password" 
              required 
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="h-14 pl-12 rounded-xl bg-secondary/30 border-none focus:ring-2 focus:ring-primary shadow-sm"
            />
          </div>

          <div className="text-right">
            <button type="button" className="text-sm font-bold text-primary/70 hover:text-primary">
              Forgot Password?
            </button>
          </div>

          <Button 
            className="w-full h-14 rounded-xl bg-gradient-to-r from-gold to-gold-dark text-white text-lg font-black shadow-lg hover:shadow-xl active:scale-95 transition-all"
            disabled={loading}
          >
            {loading ? "Processing..." : (isLogin ? "Login" : "Create Account")}
          </Button>
        </form>

        <div className="mt-12 flex items-center justify-center gap-4">
          <div className="h-[1px] flex-1 bg-gray-200"></div>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">
            Don't have an account?
          </span>
          <div className="h-[1px] flex-1 bg-gray-200"></div>
        </div>
      </div>
    </div>
  );
}
