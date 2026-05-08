
"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth, useFirestore, useCollection, useDoc } from "@/firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { collection, query, orderBy, doc } from "firebase/firestore";
import { Mail, Lock, User, Loader2 } from "lucide-react";

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

  // Fetch foundation settings for logo and name sync
  const settingsRef = useMemo(() => (db ? doc(db, "settings", "foundation") : null), [db]);
  const { data: settings } = useDoc(settingsRef);

  // Fetch official members from Admin's Firestore collection
  const { data: members, loading: membersLoading } = useCollection(
    db ? query(collection(db, "members"), orderBy("name")) : null
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;
    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, formData.email, formData.password);
        toast({ title: "স্বাগতম!", description: "সিকিউর মেম্বার এক্সেস সফল হয়েছে।" });
      } else {
        if (!formData.fullName) {
          throw new Error("দয়া করে ড্রপডাউন থেকে আপনার অফিসিয়াল নাম সিলেক্ট করুন।");
        }

        const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        await updateProfile(userCredential.user, { 
          displayName: formData.fullName 
        });
        
        toast({ title: "সফল!", description: `প্রোফাইল তৈরি হয়েছে: ${formData.fullName}` });
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
      <div className="absolute top-[-5%] right-[-5%] w-[300px] h-[300px] bg-white/5 rounded-full blur-[80px]"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px]"></div>
      
      <div className="w-full max-w-[400px] bg-white/95 backdrop-blur-3xl rounded-[45px] shadow-2xl overflow-hidden relative z-10 border border-white/20">
        <div className="py-10 flex flex-col items-center text-center px-6">
          <div className="bg-white p-4 rounded-full shadow-lg border-2 border-blue-50 mb-5 w-24 h-24 flex items-center justify-center overflow-hidden">
            {settings?.logo ? (
              <img src={settings.logo} alt="Foundation Logo" className="w-full h-full object-cover" />
            ) : (
              <div className="w-14 h-14 bg-gradient-to-br from-[#1E3A8A] to-[#6366F1] rounded-full flex items-center justify-center shadow-inner">
                <span className="text-white text-2xl font-black italic">MG</span>
              </div>
            )}
          </div>
          <h1 className="text-[18px] font-black text-[#1E3A8A] uppercase tracking-widest leading-none">
            {settings?.name || "MEMBER PORTAL"}
          </h1>
          <p className="text-[10px] text-slate-400 font-bold mt-2 uppercase tracking-[0.2em]">Official Secure Node</p>
        </div>

        <div className="px-8 pb-10">
          <div className="flex bg-slate-100 p-1.5 rounded-[28px] mb-8 shadow-inner">
            <button 
              type="button" 
              onClick={() => setIsLogin(true)} 
              className={`flex-1 py-4 rounded-[24px] text-[11px] font-black uppercase transition-all duration-500 ${isLogin ? 'bg-[#1E3A8A] text-white shadow-lg' : 'text-slate-400'}`}
            >
              লগইন
            </button>
            <button 
              type="button" 
              onClick={() => setIsLogin(false)} 
              className={`flex-1 py-4 rounded-[24px] text-[11px] font-black uppercase transition-all duration-500 ${!isLogin ? 'bg-[#1E3A8A] text-white shadow-lg' : 'text-slate-400'}`}
            >
              রেজিস্ট্রেশন
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="relative group">
                <User className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-[#1E3A8A] z-10" />
                <Select onValueChange={(v) => setFormData({ ...formData, fullName: v })}>
                  <SelectTrigger className="h-16 pl-16 rounded-[24px] bg-slate-50 border-none font-black text-sm text-[#1E3A8A]">
                    <SelectValue placeholder="আপনার অফিসিয়াল নাম" />
                  </SelectTrigger>
                  <SelectContent className="bg-white rounded-[24px] border-none shadow-2xl z-[200]">
                    {membersLoading ? (
                      <div className="p-4 flex items-center justify-center"><Loader2 className="w-5 h-5 animate-spin" /></div>
                    ) : (
                      members?.map((m: any) => (
                        <SelectItem key={m.id} value={m.name} className="font-black py-4 text-[#1E3A8A]">
                          {m.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <div className="relative group">
              <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-[#1E3A8A] transition-colors" />
              <Input 
                type="email" 
                placeholder="ইমেইল অ্যাড্রেস" 
                required 
                value={formData.email} 
                onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
                className="h-16 pl-16 rounded-[24px] bg-slate-50 border-none font-black text-sm" 
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
                className="h-16 pl-16 rounded-[24px] bg-slate-50 border-none font-black text-sm" 
              />
            </div>

            <Button 
              type="submit" 
              className="w-full h-16 rounded-[24px] bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-white font-black text-xs uppercase tracking-[0.2em] shadow-xl active:scale-95 transition-all mt-4" 
              disabled={loading}
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : isLogin ? "SECURE LOGIN" : "AUTHORIZE MEMBER"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
