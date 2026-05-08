
"use client";

import { useState, useEffect, useMemo } from "react";
import { useUser, useFirestore, useCollection, useDoc } from "@/firebase";
import { collection, query, where, orderBy, addDoc, serverTimestamp, doc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { 
  History, 
  ShieldCheck,
  LogOut,
  Plus,
  Calendar,
  Home,
  FileText,
  Loader2,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function UserDashboard({ onLogout }: { onLogout: () => void }) {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("home");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [depositAmount, setDepositAmount] = useState(5000);
  const [depositDate, setDepositDate] = useState(new Date().toISOString().split('T')[0]);
  const [mutationLoading, setMutationLoading] = useState(false);

  // Sync Settings from Admin's Firestore
  const settingsRef = useMemo(() => (db ? doc(db, "settings", "foundation") : null), [db]);
  const { data: settings, loading: settingsLoading } = useDoc(settingsRef);

  // Fetch User's personal transactions using their displayName
  const txQuery = useMemo(() => {
    if (!user?.displayName || !db) return null;
    return query(
      collection(db, "transactions"),
      where("memberName", "==", user.displayName),
      orderBy("timestamp", "desc")
    );
  }, [user?.displayName, db]);
  
  const { data: myTransactions, loading: txLoading } = useCollection(txQuery);

  // Total personal balance calculation
  const totalBalance = useMemo(() => {
    if (!myTransactions) return 0;
    return myTransactions.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  }, [myTransactions]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.displayName || !db) {
      toast({ variant: "destructive", title: "Error", description: "Profile not loaded properly." });
      return;
    }
    
    setMutationLoading(true);
    try {
      await addDoc(collection(db, "transactions"), {
        memberName: user.displayName,
        amount: Number(depositAmount),
        date: depositDate,
        category: "Member Deposit (Mobile)",
        timestamp: serverTimestamp()
      });
      toast({ title: "সফল!", description: "টাকা জমা দেওয়া সম্পন্ন হয়েছে।" });
      setDepositAmount(5000);
      setActiveTab("home");
    } catch (e: any) {
      toast({ variant: "destructive", title: "ত্রুটি", description: e.message });
    } finally {
      setMutationLoading(false);
    }
  };

  const bengaliDate = new Intl.DateTimeFormat('bn-BD', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  }).format(currentTime);

  // Global loading state for the whole dashboard
  if (txLoading || settingsLoading) {
    return (
      <div className="min-h-screen bg-[#1A1140] flex flex-col items-center justify-center gap-6">
        <div className="relative">
          <div className="w-20 h-20 rounded-full border-4 border-white/5 border-t-[#D4AF37] animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white font-black text-xs">MG</span>
          </div>
        </div>
        <div className="text-center">
          <p className="text-white font-black text-sm uppercase tracking-[0.3em] animate-pulse">Establishing Secure Node</p>
          <p className="text-white/40 text-[9px] font-bold mt-2 uppercase">Syncing Foundation Records</p>
        </div>
      </div>
    );
  }

  // If user has no displayName, something went wrong with registration
  if (!user?.displayName) {
    return (
      <div className="min-h-screen bg-[#1A1140] flex flex-col items-center justify-center p-8 text-center">
        <AlertCircle className="w-16 h-16 text-[#D4AF37] mb-6" />
        <h2 className="text-2xl font-black text-white mb-2 uppercase">Profile Incomplete</h2>
        <p className="text-white/60 text-sm mb-8 leading-relaxed">আপনার নামের সাথে ফাউন্ডেশনের ডাটা সিঙ্ক করা সম্ভব হয়নি। দয়া করে লগআউট করে আবার চেষ্টা করুন।</p>
        <Button onClick={onLogout} className="bg-red-600 px-10 h-14 rounded-full font-black text-white">LOG OUT</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#1A1140] font-bengali text-white overflow-hidden">
      
      {activeTab === "home" && (
        <main className="flex-1 overflow-y-auto pb-32 animate-in fade-in duration-700">
          <div className="relative bg-[#1A1140] pt-16 pb-28 px-8 text-center border-b-[12px] border-[#D4AF37]/10">
            <button 
              onClick={onLogout} 
              className="absolute top-8 right-8 bg-red-600/90 px-5 py-2 rounded-2xl text-[10px] font-black uppercase shadow-xl active:scale-95 transition-all"
            >
              LOG OUT
            </button>
            <div className="flex justify-center mb-8">
              <div className="w-32 h-32 rounded-full border-[6px] border-[#D4AF37]/20 p-1.5 bg-white shadow-2xl overflow-hidden flex items-center justify-center">
                {settings?.logo ? (
                  <img src={settings.logo} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-5xl text-[#1E3A8A] font-black italic">MG</span>
                )}
              </div>
            </div>
            <h1 className="text-[#D4AF37] text-[12px] font-black uppercase tracking-[0.4em] mb-3">{settings?.name || "MINAR GO FOUNDATION"}</h1>
            <h2 className="text-4xl font-black tracking-tight">{user.displayName}</h2>
          </div>

          <div className="px-6 space-y-6 -mt-12 relative z-20">
            <div className="bg-gradient-to-b from-[#2D1B69] to-[#1A1140] p-10 rounded-[45px] border border-white/10 text-center shadow-2xl">
              <p className="text-[#D4AF37]/70 text-[11px] font-black uppercase tracking-[0.2em] mb-2">আপনার মোট জমার পরিমাণ</p>
              <h3 className="text-5xl font-black">৳{totalBalance.toLocaleString()}</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#2D2D4D] p-6 rounded-[35px] border border-white/5 text-center shadow-xl">
                <span className="text-2xl">🕋</span>
                <p className="text-[#D4AF37] text-[10px] font-black mt-3 uppercase tracking-widest">পরবর্তী হজ</p>
                <p className="text-[14px] font-bold mt-1 text-white/90">২৭ মে, ২০২৬</p>
              </div>
              <div className="bg-[#2D2D4D] p-6 rounded-[35px] border border-white/5 text-center shadow-xl">
                <span className="text-2xl">🌙</span>
                <p className="text-[#D4AF37] text-[10px] font-black mt-3 uppercase tracking-widest">রমজান</p>
                <p className="text-[14px] font-bold mt-1 text-white/90">১৮ ফেব্রু., ২০২৬</p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-[#FFD700] to-[#FFA500] p-5 rounded-full text-black flex items-center justify-center gap-4 font-black text-sm shadow-xl">
              <Calendar className="w-6 h-6" /> {bengaliDate}
            </div>

            <div className="bg-[#2D2D4D]/60 p-8 rounded-[40px] border border-white/5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10"><FileText className="w-12 h-12" /></div>
              <p className="text-[#D4AF37] text-[13px] font-black mb-2 uppercase tracking-widest">জরুরি বিজ্ঞপ্তি:</p>
              <p className="text-white/80 text-[15px] leading-relaxed">আপনার কিস্তি সময়মতো পরিশোধ করে ফাউন্ডেশনের উন্নয়ন কাজে সহযোগিতা করুন।</p>
            </div>
          </div>
        </main>
      )}

      {activeTab === "add" && (
        <main className="flex-1 overflow-y-auto pb-32 px-6 pt-16 animate-in slide-in-from-bottom-10 duration-500">
          <div className="bg-[#2D1B69] p-12 rounded-[50px] shadow-2xl border-t-[10px] border-[#D4AF37]">
            <h3 className="text-center font-black text-3xl mb-12 uppercase tracking-[0.2em]">টাকা জমা দিন</h3>
            <form onSubmit={handleDeposit} className="space-y-10">
              <div className="space-y-3">
                <Label className="text-[#D4AF37] text-[11px] font-black uppercase tracking-[0.3em] ml-3">জমার পরিমাণ (TK)</Label>
                <Input type="number" value={depositAmount} onChange={(e)=>setDepositAmount(Number(e.target.value))} className="h-24 text-5xl font-black bg-white/5 border-none text-center rounded-[30px] text-white shadow-inner focus:ring-2 focus:ring-[#D4AF37]/50" />
              </div>
              <div className="space-y-3">
                <Label className="text-[#D4AF37] text-[11px] font-black uppercase tracking-[0.3em] ml-3">জমার তারিখ</Label>
                <Input type="date" value={depositDate} onChange={(e)=>setDepositDate(e.target.value)} className="h-18 font-black bg-white/5 border-none rounded-[25px] px-8 text-white text-lg shadow-inner focus:ring-2 focus:ring-[#D4AF37]/50" />
              </div>
              <div className="space-y-3">
                <Label className="text-[#D4AF37] text-[11px] font-black uppercase tracking-[0.3em] ml-3">অ্যাকাউন্ট হোল্ডার</Label>
                <div className="h-18 bg-white/10 rounded-[25px] flex items-center justify-between px-8 border border-white/5 shadow-inner">
                  <span className="font-black text-xl truncate pr-4">{user?.displayName}</span>
                  <ShieldCheck className="w-8 h-8 text-[#D4AF37] shrink-0" />
                </div>
              </div>
              <Button 
                type="submit" 
                disabled={mutationLoading} 
                className="w-full h-20 bg-gradient-to-r from-[#D4AF37] to-[#B8960C] text-black font-black text-xl rounded-[30px] shadow-[0_15px_40px_rgba(212,175,55,0.3)] active:scale-95 transition-all mt-8 uppercase tracking-[0.1em]"
              >
                {mutationLoading ? <Loader2 className="w-7 h-7 animate-spin" /> : "সাবমিট করুন"}
              </Button>
            </form>
          </div>
        </main>
      )}

      {activeTab === "history" && (
        <main className="flex-1 overflow-y-auto pb-32 px-6 pt-16 animate-in slide-in-from-right-10 duration-500">
          <h2 className="font-black text-3xl mb-10 flex items-center gap-4 px-2 uppercase tracking-tight">
            <History className="text-[#D4AF37] w-8 h-8" /> জমার রিপোর্ট
          </h2>
          <div className="space-y-5">
            {(!myTransactions || myTransactions.length === 0) ? (
              <div className="text-center py-32 opacity-20">
                <History className="w-24 h-24 mx-auto mb-5" />
                <p className="font-black text-sm uppercase tracking-widest">No Records Found</p>
              </div>
            ) : (
              myTransactions.map((t: any) => (
                <div key={t.id} className="bg-white/5 p-8 rounded-[40px] flex items-center justify-between border border-white/5 shadow-2xl backdrop-blur-sm group hover:bg-white/10 transition-all">
                  <div className="space-y-1">
                    <p className="font-black text-2xl tracking-tighter">৳{t.amount.toLocaleString()}</p>
                    <p className="text-[11px] text-white/40 font-black uppercase tracking-widest">{t.date}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="bg-[#D4AF37]/10 px-5 py-2 rounded-full border border-[#D4AF37]/20 flex items-center gap-2">
                      <div className="w-2 h-2 bg-[#D4AF37] rounded-full animate-pulse"></div>
                      <span className="text-[10px] font-black text-[#D4AF37] uppercase tracking-widest">VERIFIED</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
      )}

      <nav className="fixed bottom-0 left-0 right-0 bg-[#2D1B69]/90 backdrop-blur-3xl h-28 px-10 flex items-center justify-between z-[100] rounded-t-[50px] border-t border-white/10 shadow-[0_-20px_50px_rgba(0,0,0,0.3)]">
        <button 
          onClick={()=>setActiveTab("home")} 
          className={cn("flex flex-col items-center gap-2 transition-all duration-300", activeTab==="home" ? "text-[#D4AF37] scale-110" : "text-white/30 hover:text-white/50")}
        >
          <Home className="w-8 h-8" />
          <span className="text-[10px] font-black uppercase tracking-tighter">HOME</span>
        </button>
        <button onClick={()=>setActiveTab("add")} className="relative -top-12 group">
          <div className={cn("w-20 h-20 rounded-full flex items-center justify-center border-[8px] border-[#1A1140] shadow-2xl transition-all duration-500", activeTab==="add" ? "bg-[#D4AF37] text-black rotate-90" : "bg-[#2D1B69] text-white/40 group-hover:text-white group-hover:scale-105")}>
            <Plus className="w-10 h-10" />
          </div>
          <span className={cn("absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-black uppercase tracking-tighter transition-colors", activeTab==="add" ? "text-[#D4AF37]" : "text-white/30")}>DEPOSIT</span>
        </button>
        <button 
          onClick={()=>setActiveTab("history")} 
          className={cn("flex flex-col items-center gap-2 transition-all duration-300", activeTab==="history" ? "text-[#D4AF37] scale-110" : "text-white/30 hover:text-white/50")}
        >
          <FileText className="w-8 h-8" />
          <span className="text-[10px] font-black uppercase tracking-tighter">REPORT</span>
        </button>
      </nav>
    </div>
  );
}
