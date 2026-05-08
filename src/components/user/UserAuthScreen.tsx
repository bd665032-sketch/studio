
"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { Mail, Lock, User, ShieldCheck, Loader2 } from "lucide-react";

// অফিসিয়াল মেম্বার লিস্ট (আপনার দেওয়া ১৫ জন)
const OFFICIAL_MEMBERS = [
  "Mr Dulal", "Mr Omar Faruk", "Mr Sulaiman Badshah", "Mr Abdul Qayum", 
  "Mr Mohammed Jamshed", "Mr Milad", "Mr Ala Uddin", "Mr Shahid", 
  "Mr Shohag", "Mr Abul Hussain", "Mr Sakib", "Mr Ronnie", 
  "Mr Jonye", "Mr Aqib", "Mr Salauddin"
];

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

  const normalize = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, "").trim();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;
    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, formData.email, formData.password);
        toast({ title: "স্বাগতম!", description: "আপনার মেম্বার ড্যাশবোর্ড লোড হচ্ছে।" });
      } else {
        // ১. নাম ভেরিফিকেশন (১৫ জন অফিসিয়াল মেম্বারের সাথে)
        const inputNormalized = normalize(formData.fullName);
        const officialName = OFFICIAL_MEMBERS.find(name => normalize(name) === inputNormalized);

        if (!officialName) {
          throw new Error("আপনার নাম অফিসিয়াল মেম্বার লিস্টে নেই। দয়া করে সঠিক অফিসিয়াল নামটি লিখুন।");
        }

        // ২. ইউজার তৈরি
        const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        
        // ৩. অফিসিয়াল নামটি প্রোফাইলে সেট করা
        await updateProfile(userCredential.user, { displayName: officialName });
        
        toast({ title: "সফল!", description: `অফিসিয়াল প্রোফাইল তৈরি হয়েছে: ${officialName}` });
        
        // রিফ্রেশ যাতে প্রোফাইল আপডেট কার্যকর হয়
        setTimeout(() => window.location.reload(), 1500);
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
          <div className="bg-white p-4 rounded-full shadow-lg border-2 border-blue-50 mb-5">
            <div className="w-14 h-14 bg-gradient-to-br from-[#1E3A8A] to-[#6366F1] rounded-full flex items-center justify-center shadow-inner">
              <span className="text-white text-2xl font-black italic">MG</span>
            </div>
          </div>
          <h1 className="text-[18px] font-black text-[#1E3A8A] uppercase tracking-widest leading-none">MEMBER REGISTRATION</h1>
          <p className="text-[10px] text-slate-400 font-bold mt-2 uppercase tracking-[0.2em]">Minar Go Foundation Official Node</p>
        </div>

        <div className="px-8 pb-10">
          <div className="flex bg-slate-100 p-1.5 rounded-[28px] mb-8 shadow-inner">
            <button type="button" onClick={() => setIsLogin(true)} className={`flex-1 py-4 rounded-[24px] text-[11px] font-black uppercase transition-all duration-500 ${isLogin ? 'bg-[#1E3A8A] text-white shadow-lg' : 'text-slate-400'}`}>লগইন</button>
            <button type="button" onClick={() => setIsLogin(false)} className={`flex-1 py-4 rounded-[24px] text-[11px] font-black uppercase transition-all duration-500 ${!isLogin ? 'bg-[#1E3A8A] text-white shadow-lg' : 'text-slate-400'}`}>রেজিস্ট্রেশন</button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="relative group">
                <User className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-[#1E3A8A] transition-colors" />
                <Input placeholder="অফিসিয়াল নাম (যেমন: Mr Shahid)" required value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} className="h-16 pl-16 rounded-[24px] bg-slate-50 border-none font-black text-sm" />
              </div>
            )}
            
            <div className="relative group">
              <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-[#1E3A8A] transition-colors" />
              <Input type="email" placeholder="ইমেইল অ্যাড্রেস" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="h-16 pl-16 rounded-[24px] bg-slate-50 border-none font-black text-sm" />
            </div>
            <div className="relative group">
              <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-[#1E3A8A] transition-colors" />
              <Input type="password" placeholder="পাসওয়ার্ড" required value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="h-16 pl-16 rounded-[24px] bg-slate-50 border-none font-black text-sm" />
            </div>

            <Button type="submit" className="w-full h-16 rounded-[24px] bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-white font-black text-xs uppercase tracking-[0.2em] shadow-xl active:scale-95 transition-all mt-4" disabled={loading}>
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : isLogin ? "SECURE LOGIN" : "AUTHORIZE MEMBER"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
