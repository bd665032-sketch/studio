
"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth, useFirestore } from "@/firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { Mail, Lock, User, ShieldCheck, HeartHandshake } from "lucide-react";

export default function UserAuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ 
    email: "", 
    password: "", 
    fullName: "" 
  });
  const { toast } = useToast();
  const auth = useAuth();
  const db = useFirestore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !db) return;
    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, formData.email, formData.password);
        toast({ title: "স্বাগতম!", description: "ইউজার প্যানেলে লগইন সফল হয়েছে।" });
      } else {
        // Verify if name exists in Admin's Member List
        const membersRef = collection(db, "members");
        const q = query(membersRef, where("name", "==", formData.fullName.trim()));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          throw new Error("আপনার নামটি ফাউন্ডেশনের সদস্য তালিকায় পাওয়া যায়নি। দয়া করে অ্যাডমিনের সাথে যোগাযোগ করুন।");
        }

        if (formData.password.length < 8) {
          throw new Error("পাসওয়ার্ড অন্তত ৮ অক্ষরের হতে হবে।");
        }

        const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        await updateProfile(userCredential.user, { displayName: formData.fullName });
        
        toast({ title: "অভিনন্দন!", description: "আপনার মেম্বার প্রোফাইল তৈরি হয়েছে।" });
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
    <div className="min-h-screen bg-auth-premium flex flex-col items-center justify-center p-4 font-body">
      <div className="w-full max-w-[420px] bg-white/95 backdrop-blur-xl rounded-[45px] shadow-[0_25px_80px_rgba(0,0,0,0.4)] overflow-hidden border border-white/30 relative z-10">
        
        <div className="relative py-10 flex flex-col items-center justify-center text-center px-6">
          <div className="z-10 bg-white p-4 rounded-full shadow-xl border-4 border-blue-50/50 mb-5">
            <div className="w-14 h-14 bg-gradient-to-br from-[#1E3A8A] to-[#6366F1] rounded-full flex items-center justify-center shadow-inner">
              <span className="text-white text-2xl font-black italic">MG</span>
            </div>
          </div>

          <div className="z-10">
            <h1 className="text-[18px] font-black text-[#1E3A8A] leading-tight uppercase tracking-[0.1em]">MINAR GO MEMBER HUB</h1>
            <p className="text-slate-400 font-bold text-[9px] uppercase tracking-[0.3em] mt-2">UNITED FOR DEVELOPMENT</p>
          </div>
        </div>

        <div className="px-8 pb-10">
          <div className="space-y-6">
            <div className="flex bg-slate-100 p-1.5 rounded-[28px] shadow-inner">
              <button 
                type="button"
                onClick={() => setIsLogin(true)} 
                className={`flex-1 py-4 rounded-[24px] text-xs font-black transition-all ${isLogin ? 'bg-[#1E3A8A] text-white shadow-lg' : 'text-slate-400'}`}
              >
                লগইন
              </button>
              <button 
                type="button"
                onClick={() => setIsLogin(false)} 
                className={`flex-1 py-4 rounded-[24px] text-xs font-black transition-all ${!isLogin ? 'bg-[#1E3A8A] text-white shadow-lg' : 'text-slate-400'}`}
              >
                রেজিস্ট্রেশন
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="relative group">
                  <User className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input 
                    placeholder="আপনার পুরো নাম (সদস্য তালিকা অনুযায়ী)" 
                    required 
                    value={formData.fullName} 
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} 
                    className="h-16 pl-16 rounded-[24px] bg-slate-50 border-none text-base font-black" 
                  />
                </div>
              )}
              
              <div className="relative group">
                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
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
                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
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
                className="w-full h-16 rounded-[24px] bg-[#1E3A8A] hover:bg-[#1E3A8A]/95 text-white text-sm font-black shadow-[0_12px_24px_rgba(30,64,175,0.25)] active:scale-95 transition-all" 
                disabled={loading}
              >
                {loading ? <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white"></div> : (isLogin ? "LOG IN TO HUB" : "JOIN FOUNDATION HUB")}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
