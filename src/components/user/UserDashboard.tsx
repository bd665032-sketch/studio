
"use client";

import { useState, useEffect } from "react";
import { useUser, useFirestore, useCollection } from "@/firebase";
import { collection, query, where, orderBy, addDoc, serverTimestamp } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { 
  LogOut, 
  History, 
  PlusCircle, 
  Wallet,
  ShieldCheck,
  ChevronRight,
  Bell
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

  // Strictly match the official name from Auth for the summary
  const txQuery = user?.displayName ? query(
    collection(db!, "transactions"),
    where("memberName", "==", user.displayName),
    orderBy("date", "desc")
  ) : null;

  const { data: myTransactions } = useCollection(txQuery);
  const totalMyBalance = myTransactions?.reduce((acc, curr) => acc + (curr.amount || 0), 0) || 0;

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
        amount: depositAmount,
        date: new Date().toISOString().split('T')[0],
        category: "মেম্বার জমা",
        timestamp: serverTimestamp()
      });
      toast({ 
        title: "সফল!", 
        description: "আপনার জমা রেকর্ড করা হয়েছে এবং অ্যাডমিন প্যানেলে পাঠানো হয়েছে।" 
      });
      setActiveTab("home");
    } catch (e: any) {
      toast({ 
        variant: "destructive", 
        title: "ত্রুটি", 
        description: "জমা রেকর্ড করা যায়নি। আবার চেষ্টা করুন।" 
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
        <main className="flex-1 overflow-y-auto pb-32">
          {/* Top Section - Purple Background */}
          <div className="relative bg-[#2D0B5A] pt-12 pb-20 px-6 text-center">
            {/* Logout Button */}
            <button 
              onClick={onLogout}
              className="absolute top-6 right-6 bg-[#A51F24] text-white px-5 py-1.5 rounded-xl text-xs font-bold shadow-lg"
            >
              লগ আউট
            </button>

            {/* Logo Wrapper */}
            <div className="flex justify-center mb-8">
              <div className="w-24 h-24 rounded-full border-4 border-[#D4AF37] p-1 bg-white flex items-center justify-center overflow-hidden shadow-2xl">
                 <div className="w-full h-full bg-gradient-to-br from-[#1E3A8A] to-[#6366F1] rounded-full flex items-center justify-center">
                    <span className="text-white text-3xl font-black italic">MG</span>
                 </div>
              </div>
            </div>

            {/* Foundation Name */}
            <h1 className="text-[#D4AF37] text-[12px] font-black uppercase tracking-[0.1em] mb-4 leading-tight">
              MINAR GO EXPATRIATE DEVELOPMENT FOUNDATION
            </h1>

            {/* User Name */}
            <h2 className="text-[#D4AF37] text-4xl font-black mt-2 drop-shadow-md">
              {user?.displayName || "Mr Shahid"}
            </h2>

            {/* Curved Divider */}
            <div className="absolute bottom-0 left-0 right-0 h-1 border-b-2 border-[#D4AF37] opacity-40 rounded-full mx-10"></div>
          </div>

          <div className="px-5 pt-8 space-y-5">
            {/* Hajj & Ramadan Cards Row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#2D2D4D]/80 border border-white/10 p-5 rounded-[28px] text-center shadow-xl backdrop-blur-sm">
                <p className="text-[#D4AF37] text-[10px] font-black mb-2">🕋 পরবর্তী হজ্জ</p>
                <p className="text-white text-[15px] font-bold">২৭ মে, ২০২৬</p>
              </div>
              <div className="bg-[#2D2D4D]/80 border border-white/10 p-5 rounded-[28px] text-center shadow-xl backdrop-blur-sm">
                <p className="text-[#D4AF37] text-[10px] font-black mb-2">🌙 পরবর্তী রমজান</p>
                <p className="text-white text-[15px] font-bold">১৮ ফেব্রুয়ারি, ২০২৬</p>
              </div>
            </div>

            {/* Today's Date Banner */}
            <div className="bg-gradient-to-r from-[#FF9800] via-[#FFC107] to-[#FF9800] p-4 rounded-full shadow-lg flex items-center justify-center gap-3">
              <span className="text-xl">📅</span>
              <p className="text-black font-black text-[14px]">
                আজ: {getBengaliDate()}
              </p>
            </div>

            {/* Emergency Notice Box */}
            <div className="bg-[#2D2D4D]/60 border border-white/10 p-6 rounded-[35px] shadow-2xl backdrop-blur-md">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">📢</span>
                <h3 className="text-white font-black text-lg">জরুরি বিজ্ঞপ্তি:</h3>
              </div>
              <p className="text-white/90 text-[15px] font-medium leading-relaxed">
                কি অবস্থা কেমন আছেন সবাই
              </p>
            </div>

            {/* Wallet Summary Button (Custom Added for context) */}
            <div className="bg-white/5 p-8 rounded-[40px] border border-white/10 text-center mt-10">
               <p className="text-[#D4AF37] text-[10px] font-black uppercase tracking-widest mb-1">মোট জমার পরিমাণ</p>
               <h3 className="text-white text-4xl font-black">৳{totalMyBalance.toLocaleString()}</h3>
            </div>
          </div>
        </main>
      )}

      {activeTab === "add" && (
        <main className="flex-1 overflow-y-auto pb-32 px-5 pt-12">
           <div className="bg-[#2D0B5A] p-8 rounded-[45px] shadow-2xl border-t-8 border-[#D4AF37]">
              <div className="flex items-center gap-3 mb-10">
                <Button variant="ghost" onClick={() => setActiveTab("home")} className="w-10 h-10 rounded-full bg-white/10 p-0 text-white"><ChevronRight className="rotate-180 w-5 h-5"/></Button>
                <h3 className="font-black text-white text-lg uppercase tracking-widest">টাকা জমা দিন</h3>
              </div>
              <form onSubmit={handleDeposit} className="space-y-8">
                <div className="space-y-3">
                  <Label className="text-[10px] font-black text-[#D4AF37] uppercase ml-1">টাকার পরিমাণ (TK)</Label>
                  <Input 
                    type="number" 
                    value={depositAmount} 
                    onChange={(e) => setDepositAmount(Number(e.target.value))} 
                    className="h-20 text-4xl font-black bg-white/5 border-none text-white text-center shadow-inner rounded-[28px]" 
                  />
                </div>
                <div className="space-y-3">
                   <Label className="text-[10px] font-black text-[#D4AF37] uppercase ml-1">ভেরিফাইড মেম্বার</Label>
                   <div className="h-16 px-6 bg-white/5 rounded-[24px] flex items-center justify-between border border-white/10">
                      <span className="font-black text-white text-sm">{user?.displayName}</span>
                      <ShieldCheck className="w-5 h-5 text-[#D4AF37]" />
                   </div>
                </div>
                <Button type="submit" disabled={loading} className="w-full h-18 bg-[#D4AF37] text-black text-[15px] font-black shadow-2xl rounded-[28px] uppercase tracking-[0.3em] active:scale-95 transition-all mt-6">
                  {loading ? "প্রসেসিং..." : "কনফার্ম ডিপোজিট"}
                </Button>
              </form>
            </div>
        </main>
      )}

      {activeTab === "history" && (
        <main className="flex-1 overflow-y-auto pb-32 px-5 pt-12">
           <div className="flex items-center gap-3 mb-8">
              <button onClick={() => setActiveTab("home")} className="h-12 w-12 rounded-[20px] bg-white/10 flex items-center justify-center text-[#D4AF37]">
                <History className="w-6 h-6" />
              </button>
              <h2 className="font-black text-white text-sm uppercase tracking-[0.2em]">জমার ইতিহাস</h2>
            </div>
            <div className="space-y-4">
              {myTransactions?.map((t, idx) => (
                <div key={idx} className="bg-white/5 p-6 flex items-center justify-between border border-white/10 rounded-[30px] shadow-md">
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-[20px] bg-[#D4AF37] flex items-center justify-center text-black font-black text-xl">৳</div>
                    <div>
                      <p className="font-black text-white text-[18px]">৳{t.amount?.toLocaleString()}</p>
                      <p className="text-[10px] text-white/40 font-black uppercase mt-1 tracking-widest">{t.date}</p>
                    </div>
                  </div>
                  <div className="bg-[#D4AF37]/20 px-4 py-1.5 rounded-full border border-[#D4AF37]/30">
                    <span className="text-[9px] font-black text-[#D4AF37] uppercase">Verified</span>
                  </div>
                </div>
              ))}
              {(!myTransactions || myTransactions.length === 0) && (
                <div className="text-center py-24 opacity-20">
                  <Wallet className="w-20 h-20 mx-auto mb-6 text-white" />
                  <p className="font-black text-white text-xs uppercase tracking-widest">খালি হিসেব</p>
                </div>
              )}
            </div>
        </main>
      )}

      {/* Professional Bottom Nav - Matching the Screenshot Vibe */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#2D0B5A]/90 backdrop-blur-2xl h-24 px-10 flex items-center justify-between z-[100] rounded-t-[45px] border-t border-white/5 shadow-[0_-20px_60px_rgba(0,0,0,0.5)]">
        <button onClick={() => setActiveTab("home")} className={cn("flex flex-col items-center gap-2 transition-all", activeTab === "home" ? "text-[#D4AF37] scale-110" : "text-white/40")}>
          <div className="text-2xl">🏠</div><span className="text-[9px] font-black uppercase tracking-tighter">হোম</span>
        </button>
        <button onClick={() => setActiveTab("add")} className={cn("flex flex-col items-center gap-2 transition-all", activeTab === "add" ? "text-[#D4AF37] scale-110" : "text-white/40")}>
          <div className="text-2xl">💰</div><span className="text-[9px] font-black uppercase tracking-tighter">জমা</span>
        </button>
        <button onClick={() => setActiveTab("history")} className={cn("flex flex-col items-center gap-2 transition-all", activeTab === "history" ? "text-[#D4AF37] scale-110" : "text-white/40")}>
          <div className="text-2xl">📋</div><span className="text-[9px] font-black uppercase tracking-tighter">ইতিহাস</span>
        </button>
      </nav>
    </div>
  );
}
