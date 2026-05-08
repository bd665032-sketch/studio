
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
  ChevronRight,
  Bell,
  LogOut,
  ArrowRight
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
  const [loading, setLoading] = useState(false);

  // 1. Sync Foundation Settings (Logo & Name) from Firestore
  const settingsRef = useMemo(() => (db ? doc(db, "settings", "foundation") : null), [db]);
  const { data: settings } = useDoc(settingsRef);

  // 2. Real-time User Transactions for Summary
  const txQuery = useMemo(() => {
    if (!user?.displayName || !db) return null;
    return query(
      collection(db, "transactions"),
      where("memberName", "==", user.displayName),
      orderBy("timestamp", "desc")
    );
  }, [user?.displayName, db]);

  const { data: myTransactions } = useCollection(txQuery);

  // 3. Dynamic Balance Calculation
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
    if (!user?.displayName || !db) return;
    setLoading(true);

    try {
      // Direct write to Firestore
      await addDoc(collection(db, "transactions"), {
        memberName: user.displayName,
        amount: Number(depositAmount),
        date: depositDate,
        category: "মেম্বার জমা",
        timestamp: serverTimestamp()
      });
      
      toast({ 
        title: "সফল!", 
        description: "আপনার জমা সফলভাবে রেকর্ড করা হয়েছে।" 
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

  const bengaliDate = new Intl.DateTimeFormat('bn-BD', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(currentTime);

  return (
    <div className="flex flex-col min-h-screen bg-[#1A1140] font-bengali overflow-hidden">
      
      {activeTab === "home" && (
        <main className="flex-1 overflow-y-auto pb-32 animate-in fade-in duration-700">
          
          {/* Header Section from Screenshot */}
          <div className="relative bg-[#1A1140] pt-12 pb-20 px-6 text-center">
            <button 
              onClick={onLogout}
              className="absolute top-6 right-6 bg-red-700 text-white px-4 py-1.5 rounded-xl text-[11px] font-black shadow-lg"
            >
              লগ আউট
            </button>

            {/* Logo Center */}
            <div className="flex justify-center mb-10">
              <div className="w-32 h-32 rounded-full border-[5px] border-accent/40 p-1 bg-white flex items-center justify-center overflow-hidden shadow-2xl">
                 <div className="w-full h-full bg-gradient-to-br from-[#1E3A8A] to-[#6366F1] rounded-full flex items-center justify-center overflow-hidden">
                    {settings?.logo ? (
                      <img src={settings.logo} className="w-full h-full object-cover" alt="Logo" />
                    ) : (
                      <span className="text-white text-5xl font-black italic">MG</span>
                    )}
                 </div>
              </div>
            </div>

            <h1 className="text-accent text-[12px] font-black uppercase tracking-[0.2em] mb-4 max-w-[80%] mx-auto leading-tight">
              {settings?.name || "MINAR GO EXPATRIATE DEVELOPMENT FOUNDATION"}
            </h1>

            <h2 className="text-white text-4xl font-black drop-shadow-2xl mb-8">
              {user?.displayName || "Member"}
            </h2>
            
            {/* Bottom Curve Border */}
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent/20"></div>
            <div className="absolute -bottom-1 left-0 right-0 h-px bg-accent/30 shadow-[0_0_15px_rgba(212,175,55,0.4)]"></div>
          </div>

          <div className="px-5 space-y-6 pt-6">
            
            {/* Summary Card */}
            <div className="bg-gradient-to-b from-[#2D1B69] to-[#1A1140] p-6 rounded-[35px] border border-white/10 text-center shadow-2xl">
               <p className="text-accent/60 text-[10px] font-black uppercase tracking-widest mb-1">মোট জমার পরিমাণ</p>
               <h3 className="text-white text-4xl font-black">৳{totalBalance.toLocaleString()}</h3>
            </div>

            {/* Hajj & Ramadan Cards Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#2D2D4D] p-5 rounded-[30px] border border-white/5 flex flex-col items-center gap-2 shadow-xl">
                <p className="text-accent text-[11px] font-black">🕋 পরবর্তী হজ</p>
                <p className="text-white text-[15px] font-black">২৭ মে, ২০২৬</p>
              </div>
              <div className="bg-[#2D2D4D] p-5 rounded-[30px] border border-white/5 flex flex-col items-center gap-2 shadow-xl">
                <p className="text-accent text-[11px] font-black">🌙 পরবর্তী রমজান</p>
                <p className="text-white text-[15px] font-black">১৮ ফেব্রুয়ারি, ২০২৬</p>
              </div>
            </div>

            {/* Yellow Date Banner */}
            <div className="bg-gradient-to-r from-[#FFD700] to-[#FFA500] p-4 rounded-full shadow-lg flex items-center justify-center gap-3">
              <span className="text-xl">📅</span>
              <p className="text-black font-black text-[15px]">আজ: {bengaliDate}</p>
            </div>

            {/* Notice Box from Screenshot */}
            <div className="bg-[#2D2D4D]/60 border border-white/5 p-6 rounded-[35px] shadow-2xl relative overflow-hidden">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">📢</span>
                <h3 className="text-white font-black text-[15px]">জরুরি বিজ্ঞপ্তি:</h3>
              </div>
              <p className="text-white/70 text-[15px] font-bold leading-relaxed">কি অবস্থা কেমন আছেন সবাই</p>
            </div>

            {/* Recent Documents / History Preview */}
            <div className="space-y-4 pb-10">
              <div className="flex items-center justify-between px-2">
                <h4 className="text-white/30 text-[10px] font-black uppercase tracking-widest">আমার জমার ইতিহাস</h4>
                <button onClick={() => setActiveTab("history")} className="text-accent text-[10px] font-black uppercase">সব দেখুন</button>
              </div>
              
              <div className="space-y-3">
                {myTransactions?.slice(0, 3).map((t, idx) => (
                  <div key={idx} className="bg-white/5 p-4 flex items-center justify-between rounded-[25px] border border-white/5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent text-xl font-black">৳</div>
                      <div>
                        <p className="text-white font-black text-lg">৳{t.amount?.toLocaleString()}</p>
                        <p className="text-[10px] text-white/30 font-black">{t.date}</p>
                      </div>
                    </div>
                    <div className="bg-green-500/10 px-3 py-1 rounded-full">
                      <span className="text-[8px] font-black text-green-400 uppercase tracking-widest">ভেরিফাইড</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      )}

      {activeTab === "add" && (
        <main className="flex-1 overflow-y-auto pb-32 px-6 pt-12 animate-in slide-in-from-bottom-10">
           <div className="bg-[#2D1B69] p-8 rounded-[45px] shadow-2xl border-t-8 border-accent">
              <div className="flex items-center gap-4 mb-10">
                <Button variant="ghost" onClick={() => setActiveTab("home")} className="w-10 h-10 rounded-full bg-white/5 p-0 text-white hover:bg-white/10"><ChevronRight className="rotate-180 w-5 h-5"/></Button>
                <h3 className="font-black text-white text-xl uppercase tracking-widest">টাকা জমা দিন</h3>
              </div>
              
              <form onSubmit={handleDeposit} className="space-y-8">
                <div className="space-y-3">
                  <Label className="text-[11px] font-black text-accent uppercase tracking-widest ml-1">জমার পরিমাণ (TK)</Label>
                  <Input 
                    type="number" 
                    value={depositAmount} 
                    onChange={(e) => setDepositAmount(Number(e.target.value))} 
                    className="h-20 text-4xl font-black bg-white/5 border-none text-white text-center rounded-[25px] focus:ring-2 focus:ring-accent" 
                  />
                </div>
                
                <div className="space-y-3">
                  <Label className="text-[11px] font-black text-accent uppercase tracking-widest ml-1">জমার তারিখ</Label>
                  <Input 
                    type="date" 
                    value={depositDate} 
                    onChange={(e) => setDepositDate(e.target.value)} 
                    className="h-16 font-black bg-white/5 border-none text-white rounded-[25px] px-6" 
                  />
                </div>

                <div className="space-y-3">
                   <Label className="text-[11px] font-black text-accent uppercase tracking-widest ml-1">মেম্বার অ্যাকাউন্ট</Label>
                   <div className="h-16 px-6 bg-white/5 rounded-[25px] flex items-center justify-between border border-white/10">
                      <span className="font-black text-white">{user?.displayName}</span>
                      <ShieldCheck className="w-6 h-6 text-accent" />
                   </div>
                </div>

                <Button type="submit" disabled={loading} className="w-full h-18 bg-accent text-black font-black text-lg rounded-[25px] shadow-xl hover:bg-accent/90 active:scale-95 transition-all mt-6">
                  {loading ? "প্রসেসিং..." : "কনফার্ম করুন"}
                </Button>
              </form>
            </div>
        </main>
      )}

      {activeTab === "history" && (
        <main className="flex-1 overflow-y-auto pb-32 px-6 pt-12 animate-in fade-in">
           <div className="flex items-center gap-4 mb-10">
              <button onClick={() => setActiveTab("home")} className="h-12 w-12 rounded-2xl bg-accent flex items-center justify-center text-black">
                <History className="w-6 h-6" />
              </button>
              <h2 className="font-black text-white text-lg uppercase tracking-widest">জমার রিপোর্ট</h2>
            </div>
            <div className="space-y-4">
              {myTransactions?.map((t, idx) => (
                <div key={idx} className="bg-white/5 p-6 flex items-center justify-between border border-white/5 rounded-[30px] shadow-xl">
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-accent flex items-center justify-center text-black font-black text-2xl shadow-lg">৳</div>
                    <div>
                      <p className="font-black text-white text-xl">৳{t.amount?.toLocaleString()}</p>
                      <p className="text-[10px] text-white/30 font-black tracking-widest uppercase mt-1">{t.date}</p>
                    </div>
                  </div>
                  <div className="bg-accent/20 px-4 py-1.5 rounded-full border border-accent/30">
                    <span className="text-[9px] font-black text-accent uppercase tracking-widest">ভেরিফাইড</span>
                  </div>
                </div>
              ))}
            </div>
        </main>
      )}

      {/* Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#2D1B69]/90 backdrop-blur-3xl h-24 px-10 flex items-center justify-between z-[100] rounded-t-[45px] border-t border-white/5 shadow-2xl">
        <button onClick={() => setActiveTab("home")} className={cn("flex flex-col items-center gap-1 transition-all", activeTab === "home" ? "text-accent scale-110" : "text-white/30")}>
          <div className="text-2xl">🏠</div><span className="text-[10px] font-black uppercase">হোম</span>
        </button>
        <button onClick={() => setActiveTab("add")} className={cn("flex flex-col items-center gap-1 transition-all", activeTab === "add" ? "text-accent scale-110" : "text-white/30")}>
          <div className="text-2xl">💰</div><span className="text-[10px] font-black uppercase">জমা</span>
        </button>
        <button onClick={() => setActiveTab("history")} className={cn("flex flex-col items-center gap-1 transition-all", activeTab === "history" ? "text-accent scale-110" : "text-white/30")}>
          <div className="text-2xl">📋</div><span className="text-[10px] font-black uppercase">রিপোর্ট</span>
        </button>
      </nav>
    </div>
  );
}
