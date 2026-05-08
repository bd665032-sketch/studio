
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
  LogOut,
  Plus,
  Calendar,
  Wallet,
  Home,
  FileText,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function UserDashboard({ onLogout }: { onLogout: () => void }) {
  const { user, loading: userLoading } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("home");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [depositAmount, setDepositAmount] = useState(5000);
  const [depositDate, setDepositDate] = useState(new Date().toISOString().split('T')[0]);
  const [mutationLoading, setMutationLoading] = useState(false);

  // Get shared settings (Logo & Name) from Admin panel
  const settingsRef = useMemo(() => (db ? doc(db, "settings", "foundation") : null), [db]);
  const { data: settings } = useDoc(settingsRef);

  // Unified Collection: same "transactions" as admin
  const txQuery = useMemo(() => {
    if (!user?.displayName || !db) return null;
    return query(
      collection(db, "transactions"),
      where("memberName", "==", user.displayName),
      orderBy("timestamp", "desc")
    );
  }, [user?.displayName, db]);
  const { data: myTransactions } = useCollection(txQuery);

  // Real-time calculation of total summary
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
    
    // CRITICAL FIX: Ensure user profile is fully loaded and has a name
    const memberName = user?.displayName || user?.email?.split('@')[0];
    
    if (!memberName || !db) {
      toast({ 
        variant: "destructive", 
        title: "ক্রুটি", 
        description: "লগইন তথ্য পাওয়া যায়নি। দয়া করে আবার লগইন করুন।" 
      });
      return;
    }

    setMutationLoading(true);

    try {
      // Direct integration: same document schema as admin panel
      await addDoc(collection(db, "transactions"), {
        memberName: memberName,
        amount: Number(depositAmount),
        date: depositDate,
        category: "মেম্বার জমা (User App)",
        timestamp: serverTimestamp()
      });
      
      toast({ 
        title: "জমা সফল!", 
        description: "আপনার জমাটি অ্যাডমিন প্যানেলে এবং আপনার রিপোর্টে যুক্ত হয়েছে।" 
      });
      setDepositAmount(5000);
      setActiveTab("home");
    } catch (e: any) {
      console.error("Deposit failed", e);
      toast({ variant: "destructive", title: "ত্রুটি", description: "ডাটাবেসে কানেক্ট করা যায়নি।" });
    } finally {
      setMutationLoading(false);
    }
  };

  const bengaliDate = new Intl.DateTimeFormat('bn-BD', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  }).format(currentTime);

  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1A1140]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#D4AF37]"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#1A1140] font-bengali overflow-hidden text-white">
      
      {activeTab === "home" && (
        <main className="flex-1 overflow-y-auto pb-32 animate-in fade-in duration-700">
          <div className="relative bg-[#1A1140] pt-12 pb-24 px-6 text-center border-b-8 border-[#D4AF37]/20">
            <button onClick={onLogout} className="absolute top-6 right-6 bg-red-600/80 backdrop-blur-md text-white px-4 py-1.5 rounded-2xl text-[10px] font-black shadow-xl active:scale-90 transition-all uppercase tracking-widest">LOG OUT</button>

            <div className="flex justify-center mb-8">
              <div className="w-32 h-32 rounded-full border-[6px] border-[#D4AF37]/30 p-1 bg-white shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center justify-center overflow-hidden">
                 <div className="w-full h-full bg-gradient-to-br from-[#1E3A8A] to-[#6366F1] rounded-full flex items-center justify-center overflow-hidden text-white font-black italic">
                    {settings?.logo ? (
                      <img src={settings.logo} className="w-full h-full object-cover" alt="Logo" />
                    ) : (
                      <span className="text-4xl">MG</span>
                    )}
                 </div>
              </div>
            </div>

            <h1 className="text-[#D4AF37] text-[13px] font-black uppercase tracking-[0.3em] mb-3 max-w-[85%] mx-auto leading-tight drop-shadow-md">
              {settings?.name || "MINAR GO EXPATRIATE DEVELOPMENT FOUNDATION"}
            </h1>
            <h2 className="text-white text-4xl font-black drop-shadow-2xl">{user?.displayName || "Member Name"}</h2>
          </div>

          <div className="px-6 space-y-6 pt-8">
            <div className="bg-gradient-to-b from-[#2D1B69] to-[#1A1140] p-8 rounded-[40px] border border-white/10 text-center shadow-[0_25px_60px_rgba(0,0,0,0.3)]">
               <p className="text-[#D4AF37]/70 text-[11px] font-black uppercase tracking-[0.2em] mb-2">মোট জমার পরিমাণ (Summary)</p>
               <h3 className="text-white text-5xl font-black tracking-tighter">৳{totalBalance.toLocaleString()}</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#2D2D4D] p-6 rounded-[35px] border border-white/5 flex flex-col items-center gap-3">
                <span className="text-2xl">🕋</span>
                <p className="text-[#D4AF37] text-[11px] font-black uppercase tracking-widest">পরবর্তী হজ</p>
                <p className="text-white text-[14px] font-black">২৭ মে, ২০২৬</p>
              </div>
              <div className="bg-[#2D2D4D] p-6 rounded-[35px] border border-white/5 flex flex-col items-center gap-3">
                <span className="text-2xl">🌙</span>
                <p className="text-[#D4AF37] text-[11px] font-black uppercase tracking-widest">পরবর্তী রমজান</p>
                <p className="text-white text-[14px] font-black">১৮ ফেব্রুয়ারি, ২০২৬</p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-[#FFD700] to-[#FFA500] p-5 rounded-full shadow-lg flex items-center justify-center gap-4 border-2 border-white/20">
              <Calendar className="w-6 h-6 text-black" />
              <p className="text-black font-black text-[16px]">আজ: {bengaliDate}</p>
            </div>

            <div className="bg-[#2D2D4D]/80 border border-white/10 p-7 rounded-[40px] shadow-2xl">
              <div className="flex items-center gap-3 mb-3 text-[#D4AF37]">
                <span className="text-2xl">📢</span>
                <h3 className="font-black text-[15px] uppercase tracking-widest">জরুরি বিজ্ঞপ্তি:</h3>
              </div>
              <p className="text-white/80 text-[16px] font-bold">ফাউন্ডেশনের সকল সদস্যদের প্রতি বিশেষ অনুরোধ, নিয়মিত কিস্তি পরিশোধ করুন।</p>
            </div>
          </div>
        </main>
      )}

      {activeTab === "add" && (
        <main className="flex-1 overflow-y-auto pb-32 px-6 pt-12 animate-in slide-in-from-bottom-12">
           <div className="bg-[#2D1B69] p-10 rounded-[50px] shadow-3xl border-t-[10px] border-[#D4AF37]">
              <h3 className="font-black text-white text-2xl uppercase tracking-[0.2em] mb-12 text-center">নতুন টাকা জমা</h3>
              <form onSubmit={handleDeposit} className="space-y-10">
                <div className="space-y-3">
                  <Label className="text-[11px] font-black text-[#D4AF37] uppercase tracking-widest">জমার পরিমাণ (TK)</Label>
                  <Input type="number" value={depositAmount} onChange={(e) => setDepositAmount(Number(e.target.value))} className="h-24 text-5xl font-black bg-white/5 border-none text-white text-center rounded-[30px] shadow-inner" />
                </div>
                <div className="space-y-3">
                  <Label className="text-[11px] font-black text-[#D4AF37] uppercase tracking-widest">জমার তারিখ</Label>
                  <Input type="date" value={depositDate} onChange={(e) => setDepositDate(e.target.value)} className="h-16 font-black bg-white/5 border-none text-white rounded-[25px] px-8" />
                </div>
                <div className="space-y-3">
                   <Label className="text-[11px] font-black text-[#D4AF37] uppercase tracking-widest">অ্যাকাউন্ট হোল্ডার</Label>
                   <div className={cn("h-18 px-8 bg-white/10 rounded-[30px] flex items-center justify-between border transition-colors", user?.displayName ? "border-white/10" : "border-red-500/50")}>
                      <span className={cn("font-black text-xl", user?.displayName ? "text-white" : "text-red-400")}>
                        {user?.displayName || "নাম লোড হচ্ছে..."}
                      </span>
                      {user?.displayName ? <ShieldCheck className="w-8 h-8 text-[#D4AF37]" /> : <AlertCircle className="w-8 h-8 text-red-500" />}
                   </div>
                   {!user?.displayName && <p className="text-[9px] text-red-400 font-bold text-center mt-2">আপনার প্রোফাইল নাম পাওয়া যায়নি। অ্যাডমিনকে জানান।</p>}
                </div>
                <Button type="submit" disabled={mutationLoading || !user?.displayName} className="w-full h-20 bg-[#D4AF37] text-black font-black text-xl rounded-[30px] shadow-2xl active:scale-95 transition-all mt-8 uppercase">
                  {mutationLoading ? "প্রসেসিং..." : "জমা নিশ্চিত করুন"}
                </Button>
              </form>
            </div>
        </main>
      )}

      {activeTab === "history" && (
        <main className="flex-1 overflow-y-auto pb-32 px-6 pt-12 animate-in slide-in-from-right-12">
           <div className="flex items-center gap-5 mb-12">
              <div className="h-14 w-14 rounded-[22px] bg-[#D4AF37] flex items-center justify-center text-black shadow-xl"><History className="w-7 h-7" /></div>
              <h2 className="font-black text-white text-2xl uppercase tracking-widest">ব্যক্তিগত রিপোর্ট</h2>
            </div>
            <div className="space-y-5">
              {(!myTransactions || myTransactions.length === 0) ? (
                <div className="text-center py-20 opacity-20">
                  <History className="w-20 h-20 mx-auto mb-4" />
                  <p className="font-black uppercase tracking-widest">কোন রিপোর্ট পাওয়া যায়নি</p>
                </div>
              ) : (
                myTransactions.map((t, idx) => (
                  <div key={idx} className="bg-white/5 p-7 flex items-center justify-between border border-white/5 rounded-[40px] shadow-2xl">
                    <div className="flex items-center gap-6">
                      <div className="w-14 h-14 rounded-[24px] bg-[#D4AF37] flex items-center justify-center text-black font-black text-2xl">৳</div>
                      <div>
                        <p className="font-black text-white text-2xl">৳{t.amount?.toLocaleString()}</p>
                        <p className="text-[11px] text-white/40 font-black tracking-widest uppercase mt-1">{t.date}</p>
                      </div>
                    </div>
                    <div className="bg-[#D4AF37]/10 px-5 py-2 rounded-full border border-[#D4AF37]/20">
                      <span className="text-[10px] font-black text-[#D4AF37] uppercase tracking-widest">ভেরিফাইড</span>
                    </div>
                  </div>
                ))
              )}
            </div>
        </main>
      )}

      <nav className="fixed bottom-0 left-0 right-0 bg-[#2D1B69]/95 backdrop-blur-3xl h-24 px-12 flex items-center justify-between z-[100] rounded-t-[50px] border-t border-white/5 shadow-2xl">
        <button onClick={() => setActiveTab("home")} className={cn("flex flex-col items-center gap-1.5 transition-all", activeTab === "home" ? "text-[#D4AF37] scale-125" : "text-white/20")}>
          <Home className="w-7 h-7" />
          <span className="text-[10px] font-black uppercase">HOME</span>
        </button>
        <button onClick={() => setActiveTab("add")} className={cn("flex flex-col items-center gap-1.5 transition-all", activeTab === "add" ? "text-[#D4AF37] scale-125" : "text-white/20")}>
          <Plus className="w-7 h-7" />
          <span className="text-[10px] font-black uppercase">DEPOSIT</span>
        </button>
        <button onClick={() => setActiveTab("history")} className={cn("flex flex-col items-center gap-1.5 transition-all", activeTab === "history" ? "text-[#D4AF37] scale-125" : "text-white/20")}>
          <FileText className="w-7 h-7" />
          <span className="text-[10px] font-black uppercase">REPORT</span>
        </button>
      </nav>
    </div>
  );
}
