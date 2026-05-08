
"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth, useFirestore } from "@/firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { collection, getDocs } from "firebase/firestore";
import { Mail, Lock, User, Info, ShieldCheck, Loader2 } from "lucide-react";

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

  const normalize = (str: string) => {
    return str.toString().toLowerCase().replace(/[^a-z0-9]/g, "").trim();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !db) return;
    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, formData.email, formData.password);
        toast({ title: "স্বাগতম!", description: "আপনার মেম্বার ড্যাশবোর্ড লোড হচ্ছে।" });
      } else {
        // 1. Precise Admin Directory Check
        const membersRef = collection(db, "members");
        const querySnapshot = await getDocs(membersRef);
        
        const inputNormalized = normalize(formData.fullName);
        let officialName = "";

        querySnapshot.docs.forEach(doc => {
          const dbName = doc.data().name;
          // Flexible matching for Mr Shahid, Mr.Shahid, etc.
          if (normalize(dbName) === inputNormalized) {
            officialName = dbName; 
          }
        });

        if (!officialName) {
          throw new Error(`"${formData.fullName}" নামটি অ্যাডমিন ডিরেক্টরিতে নেই। সঠিক অফিসিয়াল নামটি লিখুন।`);
        }

        // 2. Create Firebase Auth User
        const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        
        // 3. Force Sync official name to Auth Profile
        await updateProfile(userCredential.user, { displayName: officialName });
        
        toast({ title: "অভিনন্দন!", description: `অফিসিয়াল মেম্বার প্রোফাইল তৈরি হয়েছে: ${officialName}` });
        
        // Critical: Force refresh to ensure Auth state is clean
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    } catch (error: any) {
      toast({ 
        variant: "destructive", 
        title: "অ্যাক্সেস ডিনাইড", 
        description: error.message || "ত্রুটি হয়েছে। আবার চেষ্টা করুন।" 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1A1140] flex flex-col items-center justify-center p-4 font-body relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-[-5%] right-[-5%] w-[300px] h-[300px] bg-white/5 rounded-full blur-[80px]"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px]"></div>
      
      <div className="w-full max-w-[400px] bg-white/95 backdrop-blur-3xl rounded-[40px] shadow-2xl overflow-hidden relative z-10 border border-white/20 animate-in fade-in zoom-in-95 duration-500">
        <div className="py-10 flex flex-col items-center text-center px-6">
          <div className="bg-white p-4 rounded-full shadow-lg border-2 border-blue-50 mb-5">
            <div className="w-14 h-14 bg-gradient-to-br from-[#1E3A8A] to-[#6366F1] rounded-full flex items-center justify-center shadow-inner">
              <span className="text-white text-2xl font-black italic">MG</span>
            </div>
          </div>
          <h1 className="text-[18px] font-black text-[#1E3A8A] uppercase tracking-widest leading-none">MINAR GO MEMBER HUB</h1>
          <p className="text-[#D4AF37] font-black text-[9px] uppercase tracking-[0.4em] mt-2">SECURE LOGIN GATEWAY</p>
        </div>

        <div className="px-8 pb-10">
          <div className="flex bg-slate-100 p-1 rounded-[25px] mb-8 shadow-inner">
            <button onClick={() => setIsLogin(true)} className={`flex-1 py-3.5 rounded-[22px] text-[10px] font-black uppercase transition-all ${isLogin ? 'bg-[#1E3A8A] text-white shadow-lg' : 'text-slate-400'}`}>লগইন</button>
            <button onClick={() => setIsLogin(false)} className={`flex-1 py-3.5 rounded-[22px] text-[10px] font-black uppercase transition-all ${!isLogin ? 'bg-[#1E3A8A] text-white shadow-lg' : 'text-slate-400'}`}>রেজিস্ট্রেশন</button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-4">
                <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100/30">
                  <p className="text-[9px] text-blue-800 font-bold leading-relaxed text-center uppercase tracking-wider">
                    অ্যাডমিন ডিরেক্টরিতে আপনার নাম যেভাবে আছে (Mr Shahid) হুবহু সেটি লিখুন।
                  </p>
                </div>
                <div className="relative group">
                  <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-[#1E3A8A] transition-colors" />
                  <Input placeholder="আপনার অফিসিয়াল নাম" required value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} className="h-14 pl-14 rounded-2xl bg-slate-50 border-none font-black text-sm" />
                </div>
              </div>
            )}
            
            <div className="relative group">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-[#1E3A8A] transition-colors" />
              <Input type="email" placeholder="ইমেইল অ্যাড্রেস" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="h-14 pl-14 rounded-2xl bg-slate-50 border-none font-black text-sm" />
            </div>
            <div className="relative group">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-[#1E3A8A] transition-colors" />
              <Input type="password" placeholder="পাসওয়ার্ড" required value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="h-14 pl-14 rounded-2xl bg-slate-50 border-none font-black text-sm" />
            </div>

            <Button type="submit" className="w-full h-14 rounded-2xl bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-white font-black text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all" disabled={loading}>
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  AUTH SYNC...
                </div>
              ) : isLogin ? "LOG IN" : "REGISTER NOW"}
            </Button>
            
            <p className="text-center text-[8px] text-slate-300 font-black uppercase tracking-[0.2em] mt-6">
              Encrypted Tunnel to Minar Go Foundation Network
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
