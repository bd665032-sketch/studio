
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
  Loader2
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

  // ১. অ্যাডমিন প্যানেল থেকে লোগো ও ফাউন্ডেশনের নাম রিয়েল-টাইমে সিঙ্ক করা
  const settingsRef = useMemo(() => (db ? doc(db, "settings", "foundation") : null), [db]);
  const { data: settings } = useDoc(settingsRef);

  // ২. শুধুমাত্র ইউজারের নিজস্ব ট্রানজেকশন লোড করা (displayName এর ওপর ভিত্তি করে)
  const txQuery = useMemo(() => {
    if (!user?.displayName || !db) return null;
    return query(
      collection(db, "transactions"),
      where("memberName", "==", user.displayName),
      orderBy("timestamp", "desc")
    );
  }, [user?.displayName, db]);
  
  const { data: myTransactions, loading: txLoading } = useCollection(txQuery);

  // ৩. ইউজারের নিজস্ব মোট জমার হিসাব
  const totalBalance = useMemo(() => {
    if (!myTransactions) return 0;
    return myTransactions.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  }, [myTransactions]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // ৪. টাকা জমা দেওয়া (সরাসরি অ্যাডমিন প্যানেলের কানেকশন)
  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.displayName) {
      toast({ variant: "destructive", title: "ত্রুটি", description: "আপনার লগইন তথ্য পাওয়া যাচ্ছে না। আবার লগইন করুন।" });
      return;
    }
    if (!db) return;
    
    setMutationLoading(true);
    try {
      await addDoc(collection(db, "transactions"), {
        memberName: user.displayName,
        amount: Number(depositAmount),
        date: depositDate,
        category: "মেম্বার জমা (Mobile App)",
        timestamp: serverTimestamp()
      });
      toast({ title: "সফল!", description: "জমা নিশ্চিত হয়েছে এবং অ্যাডমিন প্যানেলে পাঠানো হয়েছে।" });
      setDepositAmount(5000);
      setActiveTab("home");
    } catch (e) {
      toast({ variant: "destructive", title: "ত্রুটি", description: "ডাটাবেস কানেকশন সমস্যা।" });
    } finally {
      setMutationLoading(false);
    }
  };

  const bengaliDate = new Intl.DateTimeFormat('bn-BD', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  }).format(currentTime);

  if (userLoading) return <div className="min-h-screen bg-[#1A1140] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-accent" /></div>;

  return (
    <div className="flex flex-col min-h-screen bg-[#1A1140] font-bengali text-white overflow-hidden">
      
      {activeTab === "home" && (
        <main className="flex-1 overflow-y-auto pb-32 animate-in fade-in duration-700">
          {/* Header Section */}
          <div className="relative bg-[#1A1140] pt-14 pb-24 px-6 text-center border-b-[10px] border-[#D4AF37]/10">
            <button onClick={onLogout} className="absolute top-6 right-6 bg-red-600/90 px-4 py-1.5 rounded-2xl text-[10px] font-black uppercase shadow-lg">LOG OUT</button>
            <div className="flex justify-center mb-6">
              <div className="w-28 h-28 rounded-full border-[5px] border-[#D4AF37]/20 p-1 bg-white shadow-2xl overflow-hidden flex items-center justify-center">
                {settings?.logo ? (
                  <img src={settings.logo} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl text-[#1E3A8A] font-black italic">MG</span>
                )}
              </div>
            </div>
            <h1 className="text-[#D4AF37] text-[11px] font-black uppercase tracking-[0.3em] mb-2">{settings?.name || "MINAR GO FOUNDATION"}</h1>
            <h2 className="text-3xl font-black tracking-tight">{user?.displayName || "Loading Name..."}</h2>
          </div>

          <div className="px-6 space-y-6 -mt-10 relative z-20">
            {/* Real-time Summary Card */}
            <div className="bg-gradient-to-b from-[#2D1B69] to-[#1A1140] p-8 rounded-[35px] border border-white/10 text-center shadow-xl">
              <p className="text-[#D4AF37]/70 text-[10px] font-black uppercase tracking-widest mb-1">মোট জমার পরিমাণ (Summary)</p>
              <h3 className="text-4xl font-black">৳{totalBalance.toLocaleString()}</h3>
            </div>

            {/* Event Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#2D2D4D] p-5 rounded-[30px] border border-white/5 text-center shadow-lg">
                <span className="text-xl">🕋</span>
                <p className="text-[#D4AF37] text-[10px] font-black mt-2 uppercase tracking-widest">পরবর্তী হজ</p>
                <p className="text-[13px] font-bold">২৭ মে, ২০২৬</p>
              </div>
              <div className="bg-[#2D2D4D] p-5 rounded-[30px] border border-white/5 text-center shadow-lg">
                <span className="text-xl">🌙</span>
                <p className="text-[#D4AF37] text-[10px] font-black mt-2 uppercase tracking-widest">রমজান</p>
                <p className="text-[13px] font-bold">১৮ ফেব্রু., ২০২৬</p>
              </div>
            </div>

            {/* Date Banner */}
            <div className="bg-gradient-to-r from-[#FFD700] to-[#FFA500] p-4 rounded-full text-black flex items-center justify-center gap-3 font-black text-xs shadow-lg">
              <Calendar className="w-5 h-5" /> আজকের তারিখ: {bengaliDate}
            </div>

            {/* Announcement Box */}
            <div className="bg-[#2D2D4D]/60 p-6 rounded-[35px] border border-white/5">
              <p className="text-[#D4AF37] text-[12px] font-black mb-1">জরুরি বিজ্ঞপ্তি:</p>
              <p className="text-white/80 text-sm">কি অবস্থা কেমন আছেন সবাই, নিয়মিত কিস্তি পরিশোধ করুন।</p>
            </div>
          </div>
        </main>
      )}

      {/* Deposit Form Section */}
      {activeTab === "add" && (
        <main className="flex-1 overflow-y-auto pb-32 px-6 pt-12 animate-in slide-in-from-bottom-10">
          <div className="bg-[#2D1B69] p-10 rounded-[45px] shadow-2xl border-t-[8px] border-[#D4AF37]">
            <h3 className="text-center font-black text-2xl mb-12 uppercase tracking-widest">টাকা জমা দিন</h3>
            <form onSubmit={handleDeposit} className="space-y-8">
              <div className="space-y-2">
                <Label className="text-[#D4AF37] text-[10px] font-black uppercase tracking-widest ml-2">জমার পরিমাণ (TK)</Label>
                <Input type="number" value={depositAmount} onChange={(e)=>setDepositAmount(Number(e.target.value))} className="h-20 text-4xl font-black bg-white/5 border-none text-center rounded-3xl text-white" />
              </div>
              <div className="space-y-2">
                <Label className="text-[#D4AF37] text-[10px] font-black uppercase tracking-widest ml-2">জমার তারিখ</Label>
                <Input type="date" value={depositDate} onChange={(e)=>setDepositDate(e.target.value)} className="h-16 font-black bg-white/5 border-none rounded-2xl px-6 text-white" />
              </div>
              <div className="space-y-2">
                <Label className="text-[#D4AF37] text-[10px] font-black uppercase tracking-widest ml-2">অ্যাকাউন্ট হোল্ডার</Label>
                <div className="h-16 bg-white/10 rounded-2xl flex items-center justify-between px-6 border border-white/5">
                  <span className="font-black text-lg">{user?.displayName || "Loading..."}</span>
                  <ShieldCheck className="w-7 h-7 text-[#D4AF37]" />
                </div>
              </div>
              <Button type="submit" disabled={mutationLoading} className="w-full h-18 bg-[#D4AF37] text-black font-black text-lg rounded-3xl shadow-xl active:scale-95 transition-all mt-6">
                {mutationLoading ? "প্রসেসিং হচ্ছে..." : "সাবমিট করুন"}
              </Button>
            </form>
          </div>
        </main>
      )}

      {/* Real-time Report/History Section */}
      {activeTab === "history" && (
        <main className="flex-1 overflow-y-auto pb-32 px-6 pt-10 animate-in slide-in-from-right-10">
          <h2 className="font-black text-2xl mb-8 flex items-center gap-3"><History className="text-[#D4AF37]" /> জমার রিপোর্ট</h2>
          <div className="space-y-4">
            {(!myTransactions || myTransactions.length === 0) ? (
              <div className="text-center py-24 opacity-20"><History className="w-16 h-16 mx-auto mb-3" /><p className="font-black text-xs">কোনো ডাটা পাওয়া যায়নি</p></div>
            ) : (
              myTransactions.map((t, i) => (
                <div key={i} className="bg-white/5 p-6 rounded-[30px] flex items-center justify-between border border-white/5 shadow-inner">
                  <div>
                    <p className="font-black text-xl">৳{t.amount.toLocaleString()}</p>
                    <p className="text-[10px] text-white/40 font-black uppercase mt-0.5">{t.date}</p>
                  </div>
                  <div className="bg-[#D4AF37]/10 px-4 py-1.5 rounded-full border border-[#D4AF37]/20">
                    <span className="text-[9px] font-black text-[#D4AF37] uppercase">VERIFIED</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
      )}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#2D1B69]/95 backdrop-blur-2xl h-24 px-10 flex items-center justify-between z-[100] rounded-t-[45px] border-t border-white/5 shadow-2xl">
        <button onClick={()=>setActiveTab("home")} className={cn("flex flex-col items-center gap-1.5 transition-all", activeTab==="home" ? "text-[#D4AF37] scale-110" : "text-white/20")}>
          <Home className="w-7 h-7" />
          <span className="text-[9px] font-black uppercase tracking-tighter">HOME</span>
        </button>
        <button onClick={()=>setActiveTab("add")} className={cn("flex flex-col items-center gap-1.5 transition-all", activeTab==="add" ? "text-[#D4AF37] scale-110" : "text-white/20")}>
          <div className={cn("w-14 h-14 rounded-full flex items-center justify-center -mt-10 border-4 border-[#1A1140] shadow-xl", activeTab==="add" ? "bg-[#D4AF37] text-black" : "bg-[#2D1B69] text-white/20")}>
            <Plus className="w-8 h-8" />
          </div>
          <span className="text-[9px] font-black uppercase tracking-tighter">DEPOSIT</span>
        </button>
        <button onClick={()=>setActiveTab("history")} className={cn("flex flex-col items-center gap-1.5 transition-all", activeTab==="history" ? "text-[#D4AF37] scale-110" : "text-white/20")}>
          <FileText className="w-7 h-7" />
          <span className="text-[9px] font-black uppercase tracking-tighter">REPORT</span>
        </button>
      </nav>
    </div>
  );
}
