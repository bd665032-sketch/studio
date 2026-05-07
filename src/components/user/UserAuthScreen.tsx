
"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth, useFirestore } from "@/firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { collection, getDocs } from "firebase/firestore";
import { Mail, Lock, User, Info, ShieldCheck } from "lucide-react";

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

  const validatePassword = (password: string) => {
    if (password.length < 8) return "পাসওয়ার্ড অন্তত ৮ অক্ষরের হতে হবে।";
    if (!/[A-Z]/.test(password)) return "পাসওয়ার্ডে অন্তত একটি বড় হাতের অক্ষর থাকতে হবে।";
    if (!/[0-9]/.test(password)) return "পাসওয়ার্ডে অন্তত একটি সংখ্যা থাকতে হবে।";
    return null;
  };

  // Improved Normalizer: Removes dots, spaces, and non-alphanumeric chars
  const normalizeName = (name: string) => {
    return name.toString().toLowerCase().replace(/[^a-z0-9]/g, "").trim();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !db) return;
    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, formData.email, formData.password);
        toast({ title: "স্বাগতম!", description: "ইউজার প্যানেলে লগইন সফল হয়েছে।" });
      } else {
        // Advanced Name Verification
        const membersRef = collection(db, "members");
        const querySnapshot = await getDocs(membersRef);
        
        const inputNameNormalized = normalizeName(formData.fullName);
        let matchedMemberName = "";

        querySnapshot.docs.forEach(doc => {
          const dbName = doc.data().name;
          if (normalizeName(dbName) === inputNameNormalized) {
            matchedMemberName = dbName; 
          }
        });

        if (!matchedMemberName) {
          throw new Error(`"${formData.fullName}" নামটি পাওয়া যায়নি। অ্যাডমিন ডিরেক্টরিতে আপনার নাম যেভাবে আছে (যেমন: Mr Shahid বা Mr.Shahid) হুবহু সেভাবে লিখুন।`);
        }

        const passErr = validatePassword(formData.password);
        if (passErr) throw new Error(passErr);

        const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        
        // Sync with the official name from the database
        await updateProfile(userCredential.user, { displayName: matchedMemberName });
        
        toast({ title: "অভিনন্দন!", description: `আপনার মেম্বার প্রোফাইল তৈরি হয়েছে। অফিসিয়াল নাম: ${matchedMemberName}` });
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
    <div className="min-h-screen bg-auth-premium flex flex-col items-center justify-center p-4 font-body relative overflow-hidden">
      {/* Decorative Blur Elements */}
      <div className="absolute top-[-5%] right-[-5%] w-[300px] h-[300px] bg-white/10 rounded-full blur-[80px]"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px]"></div>

      <div className="w-full max-w-[420px] bg-white/95 backdrop-blur-2xl rounded-[45px] shadow-[0_30px_100px_rgba(0,0,0,0.5)] overflow-hidden border border-white/40 relative z-10 animate-in fade-in zoom-in-95 duration-700">
        
        <div className="relative py-12 flex flex-col items-center justify-center text-center px-6">
          <div className="z-10 bg-white p-5 rounded-full shadow-2xl border-4 border-blue-50/50 mb-6 active:scale-95 transition-transform">
            <div className="w-16 h-16 bg-gradient-to-br from-[#1E3A8A] to-[#6366F1] rounded-full flex items-center justify-center shadow-inner">
              <span className="text-white text-3xl font-black italic">MG</span>
            </div>
          </div>

          <div className="z-10">
            <h1 className="text-[20px] font-black text-[#1E3A8A] leading-tight uppercase tracking-[0.15em]">MINAR GO MEMBER HUB</h1>
            <p className="text-[#D4AF37] font-black text-[10px] uppercase tracking-[0.4em] mt-3">SECURE MEMBER ACCESS NODE</p>
          </div>
        </div>

        <div className="px-8 pb-12">
          <div className="space-y-8">
            <div className="flex bg-slate-100 p-1.5 rounded-[30px] shadow-inner">
              <button 
                type="button"
                onClick={() => setIsLogin(true)} 
                className={`flex-1 py-4 rounded-[26px] text-xs font-black transition-all duration-500 ${isLogin ? 'bg-[#1E3A8A] text-white shadow-xl scale-[1.02]' : 'text-slate-400'}`}
              >
                লগইন
              </button>
              <button 
                type="button"
                onClick={() => setIsLogin(false)} 
                className={`flex-1 py-4 rounded-[26px] text-xs font-black transition-all duration-500 ${!isLogin ? 'bg-[#1E3A8A] text-white shadow-xl scale-[1.02]' : 'text-slate-400'}`}
              >
                রেজিস্ট্রেশন
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {!isLogin && (
                <div className="space-y-4 animate-in slide-in-from-top-4 duration-500">
                  <div className="bg-blue-50/70 p-5 rounded-[24px] border border-blue-100/50 flex items-start gap-4">
                    <Info className="w-6 h-6 text-blue-500 shrink-0 mt-0.5" />
                    <p className="text-[11px] text-blue-800 font-bold leading-relaxed">
                      অ্যাডমিন আপনার নামটি <span className="text-blue-900 underline font-black">"Admin Directory"</span>-তে যেভাবে অ্যাড করেছেন সেই নামটি লিখুন। (যেমন: Mr Shahid বা Mr.Shahid)
                    </p>
                  </div>
                  <div className="relative group">
                    <User className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-[#1E3A8A] transition-colors" />
                    <Input 
                      placeholder="আপনার নাম" 
                      required 
                      value={formData.fullName} 
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} 
                      className="h-16 pl-16 rounded-[24px] bg-slate-50 border-none text-base font-black shadow-inner" 
                    />
                  </div>
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
                  className="h-16 pl-16 rounded-[24px] bg-slate-50 border-none text-base font-black shadow-inner" 
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
                  className="h-16 pl-16 rounded-[24px] bg-slate-50 border-none text-base font-black shadow-inner" 
                />
              </div>

              <Button 
                type="submit"
                className="w-full h-16 rounded-[24px] bg-[#1E3A8A] hover:bg-[#1E3A8A]/95 text-white text-sm font-black shadow-[0_15px_30px_rgba(30,64,175,0.3)] active:scale-95 transition-all flex items-center justify-center gap-3 border-b-4 border-slate-900" 
                disabled={loading}
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white"></div>
                ) : (
                  <>
                    <ShieldCheck className="w-5 h-5" />
                    {isLogin ? "LOG IN TO HUB" : "JOIN FOUNDATION HUB"}
                  </>
                )}
              </Button>
            </form>
            
            <p className="text-center text-[9px] text-slate-400 font-black uppercase tracking-[0.2em] mt-6">
              Authorized Member Terminal • Encrypted Access
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
