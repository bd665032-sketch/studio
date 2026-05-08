
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
  Wallet,
  ShieldCheck,
  ChevronRight,
  Bell,
  FileText,
  Plus
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function UserDashboard({ onLogout }: { onLogout: () => void }) {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("home");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [depositAmount, setDepositAmount] = useState(5000);
  const [loading, setLoading] = useState(false);

  // 1. Sync Foundation Settings (Logo & Name) from Admin
  const settingsRef = useMemo(() => (db ? doc(db, "settings", "foundation") : null), [db]);
  const { data: settings } = useDoc(settingsRef);

  // 2. Real-time User Transactions (For Summary and List)
  const txQuery = useMemo(() => {
    if (!user?.displayName || !db) return null;
    return query(
      collection(db, "transactions"),
      where("memberName", "==", user.displayName),
      orderBy("timestamp", "desc")
    );
  }, [user?.displayName, db]);

  const { data: myTransactions } = useCollection(txQuery);

  // 3. Real-time Summary Calculation
  const totalMyBalance = useMemo(() => {
    if (!myTransactions) return 0;
    return myTransactions.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  }, [myTransactions]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.displayName || !db) return;
    setLoading(true);

    try {
      await addDoc(collection(db, "transactions"), {
        memberName: user.displayName,
        amount: Number(depositAmount),
        date: new Date().toISOString().split('T')[0],
        category: "মেম্বার জমা",
        timestamp: serverTimestamp()
      });
      toast({ 
        title: "সফল!", 
        description: "জমা রেকর্ড হয়েছে। ব্যালেন্স সামারিতে যোগ হচ্ছে।" 
      });
      setDepositAmount(5000);
      setActiveTab("home");
    } catch (e: any) {
      toast({ 
        variant: "destructive", 
        title: "ত্রুটি", 
        description: "জমা রেকর্ড করা যায়নি।" 
      });
    } finally {
      setLoading(false);
    }
  };

  const getBengaliDate = () => {
    return new Intl.DateTimeFormat('bn-BD', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(currentTime);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#1A1140] overflow-hidden font-bengali">
      
      {activeTab === "home" && (
        <main className="flex-1 overflow-y-auto pb-32 animate-in fade-in duration-700">
          {/* Top Section - Purple Gradient & Gold Curve */}
          <div className="relative bg-gradient-to-b from-[#2D0B5A] to-[#1A1140] pt-12 pb-24 px-6 text-center">
            <button 
              onClick={onLogout}
              className="absolute top-6 right-6 bg-red-600 text-white px-5 py-2 rounded-2xl text-[10px] font-black shadow-lg uppercase"
            >
              🚪 Exit
            </button>

            {/* Logo Synced from Admin */}
            <div className="flex justify-center mb-8">
              <div className="w-28 h-28 rounded-full border-[6px] border-[#D4AF37] p-1 bg-white flex items-center justify-center overflow-hidden shadow-2xl">
                 <div className="w-full h-full bg-gradient-to-br from-[#1E3A8A] to-[#6366F1] rounded-full flex items-center justify-center">
                    {settings?.logo ? (
                      <img src={settings.logo} className="w-full h-full object-cover" alt="Logo" />
                    ) : (
                      <span className="text-white text-4xl font-black italic">MG</span>
                    )}
                 </div>
              </div>
            </div>

            <h1 className="text-[#D4AF37] text-[10px] font-black uppercase tracking-[0.3em] mb-3">
              {settings?.name || "MINAR GO EXPATRIATE FOUNDATION"}
            </h1>

            <h2 className="text-white text-4xl font-black drop-shadow-lg">
              {user?.displayName || "Member"}
            </h2>
            
            <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent opacity-40"></div>
          </div>

          <div className="px-5 -mt-12 space-y-6 relative z-10">
            {/* Real-time Summary Balance */}
            <div className="bg-white/10 backdrop-blur-3xl p-8 rounded-[45px] border border-white/20 text-center shadow-[0_25px_50px_rgba(0,0,0,0.4)]">
               <p className="text-[#D4AF37] text-[9px] font-black uppercase tracking-[0.4em] mb-2">My Total Summary</p>
               <h3 className="text-white text-5xl font-black tracking-tighter">৳{totalMyBalance.toLocaleString()}</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#2D2D4D]/90 border border-white/10 p-6 rounded-[35px] text-center">
                <p className="text-[#D4AF37] text-[9px] font-black mb-2 uppercase">🕋 Hajj 2026</p>
                <p className="text-white text-[14px] font-black">২৭ মে, ২০২৬</p>
              </div>
              <div className="bg-[#2D2D4D]/90 border border-white/10 p-6 rounded-[35px] text-center">
                <p className="text-[#D4AF37] text-[9px] font-black mb-2 uppercase">🌙 Ramadan</p>
                <p className="text-white text-[14px] font-black">১৮ ফেব্রুয়ারি, ২০২৬</p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-[#FFD700] to-[#FFC107] p-5 rounded-full shadow-xl flex items-center justify-center gap-4">
              <span className="text-2xl">📅</span>
              <p className="text-black font-black text-[14px]">আজ: {getBengaliDate()}</p>
            </div>

            <div className="bg-[#2D2D4D]/80 border border-white/5 p-7 rounded-[40px] shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-2 h-full bg-[#D4AF37]"></div>
              <div className="flex items-center gap-3 mb-4">
                <Bell className="w-6 h-6 text-[#D4AF37]" />
                <h3 className="text-white font-black text-[15px] uppercase">জরুরি বিজ্ঞপ্তি:</h3>
              </div>
              <p className="text-white/80 text-[16px] font-bold">কি অবস্থা কেমন আছেন সবাই</p>
            </div>

            {/* Document Logs / History */}
            <div className="space-y-4 pt-4 pb-10">
              <div className="flex items-center justify-between px-4">
                <h4 className="text-white/40 text-[10px] font-black uppercase tracking-[0.4em]">Recent Documents</h4>
                <button onClick={() => setActiveTab("history")} className="text-[#D4AF37] text-[9px] font-black uppercase tracking-widest">View All</button>
              </div>
              
              <div className="space-y-3">
                {myTransactions?.slice(0, 5).map((t, idx) => (
                  <div key={idx} className="bg-white/5 p-5 flex items-center justify-between border border-white/5 rounded-[30px] shadow-lg">
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 rounded-[22px] bg-gradient-to-br from-[#D4AF37] to-[#B8960C] flex items-center justify-center text-black font-black text-xl">৳</div>
                      <div>
                        <p className="font-black text-white text-[17px]">৳{t.amount?.toLocaleString()}</p>
                        <p className="text-[9px] text-white/30 font-black uppercase tracking-widest">{t.date}</p>
                      </div>
                    </div>
                    <div className="bg-green-500/10 px-4 py-1.5 rounded-full border border-green-500/20">
                      <span className="text-[8px] font-black text-green-400 uppercase">Verified</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      )}

      {activeTab === "add" && (
        <main className="flex-1 overflow-y-auto pb-32 px-5 pt-12 animate-in slide-in-from-bottom-10 duration-500">
           <div className="bg-[#2D0B5A] p-10 rounded-[50px] shadow-3xl border-t-[10px] border-[#D4AF37]">
              <div className="flex items-center gap-4 mb-12">
                <Button variant="ghost" onClick={() => setActiveTab("home")} className="w-12 h-12 rounded-full bg-white/10 p-0 text-white"><ChevronRight className="rotate-180 w-6 h-6"/></Button>
                <h3 className="font-black text-white text-xl uppercase tracking-[0.2em]">টাকা জমা দিন</h3>
              </div>
              <form onSubmit={handleDeposit} className="space-y-10">
                <div className="space-y-4">
                  <Label className="text-[10px] font-black text-[#D4AF37] uppercase tracking-[0.3em] ml-2">জমার পরিমাণ (TK)</Label>
                  <Input 
                    type="number" 
                    value={depositAmount} 
                    onChange={(e) => setDepositAmount(Number(e.target.value))} 
                    className="h-24 text-5xl font-black bg-white/5 border-none text-white text-center rounded-[35px]" 
                  />
                </div>
                <div className="space-y-4">
                   <Label className="text-[10px] font-black text-[#D4AF37] uppercase tracking-[0.3em] ml-2">মেম্বার প্রোফাইল</Label>
                   <div className="h-20 px-8 bg-white/5 rounded-[30px] flex items-center justify-between border border-white/10">
                      <span className="font-black text-white text-lg">{user?.displayName}</span>
                      <ShieldCheck className="w-7 h-7 text-[#D4AF37]" />
                   </div>
                </div>
                <Button type="submit" disabled={loading} className="w-full h-22 bg-gradient-to-r from-[#D4AF37] to-[#B8960C] text-black text-[16px] font-black shadow-3xl rounded-[35px] uppercase active:scale-95 transition-all mt-10 border-b-[6px] border-[#8A6D05]">
                  {loading ? "প্রসেসিং হচ্ছে..." : "কনফার্ম করুন"}
                </Button>
              </form>
            </div>
        </main>
      )}

      {activeTab === "history" && (
        <main className="flex-1 overflow-y-auto pb-32 px-5 pt-12 animate-in fade-in duration-500">
           <div className="flex items-center gap-4 mb-10">
              <button onClick={() => setActiveTab("home")} className="h-14 w-14 rounded-[25px] bg-[#D4AF37] flex items-center justify-center text-black shadow-xl">
                <History className="w-7 h-7" />
              </button>
              <h2 className="font-black text-white text-lg uppercase tracking-[0.3em]">জমার ইতিহাস</h2>
            </div>
            <div className="space-y-4">
              {myTransactions?.map((t, idx) => (
                <div key={idx} className="bg-white/5 p-7 flex items-center justify-between border border-white/10 rounded-[35px] shadow-2xl">
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 rounded-[25px] bg-[#D4AF37] flex items-center justify-center text-black font-black text-2xl shadow-xl">৳</div>
                    <div>
                      <p className="font-black text-white text-[20px]">৳{t.amount?.toLocaleString()}</p>
                      <p className="text-[10px] text-white/40 font-black uppercase mt-1 tracking-widest">{t.date}</p>
                    </div>
                  </div>
                  <div className="bg-[#D4AF37]/20 px-5 py-2 rounded-full border border-[#D4AF37]/30">
                    <span className="text-[9px] font-black text-[#D4AF37] uppercase tracking-widest">Verified</span>
                  </div>
                </div>
              ))}
            </div>
        </main>
      )}

      {/* Professional Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#2D0B5A]/95 backdrop-blur-3xl h-24 px-12 flex items-center justify-between z-[100] rounded-t-[50px] border-t border-white/10 shadow-[0_-20px_60px_rgba(0,0,0,0.6)]">
        <button onClick={() => setActiveTab("home")} className={cn("flex flex-col items-center gap-2 transition-all", activeTab === "home" ? "text-[#D4AF37] scale-125 -translate-y-1" : "text-white/30")}>
          <div className="text-2xl">🏠</div><span className="text-[9px] font-black uppercase">হোম</span>
        </button>
        <button onClick={() => setActiveTab("add")} className={cn("flex flex-col items-center gap-2 transition-all", activeTab === "add" ? "text-[#D4AF37] scale-125 -translate-y-1" : "text-white/30")}>
          <div className="text-2xl">💰</div><span className="text-[9px] font-black uppercase">জমা</span>
        </button>
        <button onClick={() => setActiveTab("history")} className={cn("flex flex-col items-center gap-2 transition-all", activeTab === "history" ? "text-[#D4AF37] scale-125 -translate-y-1" : "text-white/30")}>
          <div className="text-2xl">📋</div><span className="text-[9px] font-black uppercase">ইতিহাস</span>
        </button>
      </nav>
    </div>
  );
}
