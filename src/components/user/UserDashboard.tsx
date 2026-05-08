
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
  AlertCircle,
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

  // Shared Settings Sync
  const settingsRef = useMemo(() => (db ? doc(db, "settings", "foundation") : null), [db]);
  const { data: settings } = useDoc(settingsRef);

  // My Transactions Sync
  const txQuery = useMemo(() => {
    if (!user?.displayName || !db) return null;
    return query(
      collection(db, "transactions"),
      where("memberName", "==", user.displayName),
      orderBy("timestamp", "desc")
    );
  }, [user?.displayName, db]);
  const { data: myTransactions } = useCollection(txQuery);

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
      toast({ variant: "destructive", title: "ত্রুটি", description: "প্রোফাইল নাম পাওয়া যায়নি।" });
      return;
    }
    setMutationLoading(true);
    try {
      await addDoc(collection(db, "transactions"), {
        memberName: user.displayName,
        amount: Number(depositAmount),
        date: depositDate,
        category: "মেম্বার জমা (User App)",
        timestamp: serverTimestamp()
      });
      toast({ title: "সফল!", description: "টাকা জমা হয়েছে।" });
      setDepositAmount(5000);
      setActiveTab("home");
    } catch (e) {
      toast({ variant: "destructive", title: "ত্রুটি", description: "আবার চেষ্টা করুন।" });
    } finally {
      setMutationLoading(false);
    }
  };

  const bengaliDate = new Intl.DateTimeFormat('bn-BD', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  }).format(currentTime);

  if (userLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#1A1140]"><Loader2 className="w-10 h-10 animate-spin text-[#D4AF37]" /></div>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#1A1140] font-bengali text-white overflow-hidden">
      
      {activeTab === "home" && (
        <main className="flex-1 overflow-y-auto pb-32 animate-in fade-in duration-700">
          <div className="relative bg-[#1A1140] pt-14 pb-24 px-6 text-center border-b-8 border-[#D4AF37]/10">
            <button onClick={onLogout} className="absolute top-6 right-6 bg-red-600/80 px-4 py-1.5 rounded-2xl text-[10px] font-black uppercase shadow-lg">LOG OUT</button>
            <div className="flex justify-center mb-6">
              <div className="w-28 h-28 rounded-full border-[5px] border-[#D4AF37]/20 p-1 bg-white shadow-2xl overflow-hidden flex items-center justify-center">
                {settings?.logo ? <img src={settings.logo} className="w-full h-full object-cover" /> : <span className="text-4xl text-primary font-black italic">MG</span>}
              </div>
            </div>
            <h1 className="text-[#D4AF37] text-[11px] font-black uppercase tracking-[0.3em] mb-2">{settings?.name || "MINAR GO FOUNDATION"}</h1>
            <h2 className="text-4xl font-black">{user?.displayName || "Loading..."}</h2>
          </div>

          <div className="px-6 space-y-6 -mt-10 relative z-20">
            <div className="bg-gradient-to-b from-[#2D1B69] to-[#1A1140] p-8 rounded-[35px] border border-white/10 text-center shadow-xl">
              <p className="text-[#D4AF37]/70 text-[10px] font-black uppercase tracking-widest mb-1">মোট জমার পরিমাণ (Summary)</p>
              <h3 className="text-4xl font-black">৳{totalBalance.toLocaleString()}</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#2D2D4D] p-5 rounded-[30px] border border-white/5 text-center">
                <span className="text-xl">🕋</span>
                <p className="text-[#D4AF37] text-[10px] font-black mt-2">পরবর্তী হজ</p>
                <p className="text-[13px] font-bold">২৭ মে, ২০২৬</p>
              </div>
              <div className="bg-[#2D2D4D] p-5 rounded-[30px] border border-white/5 text-center">
                <span className="text-xl">🌙</span>
                <p className="text-[#D4AF37] text-[10px] font-black mt-2">রমজান</p>
                <p className="text-[13px] font-bold">১৮ ফেব্রু., ২০২৬</p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-[#FFD700] to-[#FFA500] p-4 rounded-full text-black flex items-center justify-center gap-3 font-black text-sm shadow-lg">
              <Calendar className="w-5 h-5" /> আজকের তারিখ: {bengaliDate}
            </div>

            <div className="bg-[#2D2D4D]/60 p-6 rounded-[35px] border border-white/5">
              <p className="text-[#D4AF37] text-[12px] font-black mb-1">জরুরি বিজ্ঞপ্তি:</p>
              <p className="text-white/80 text-sm">কি অবস্থা কেমন আছেন সবাই, নিয়মিত কিস্তি পরিশোধ করুন।</p>
            </div>
          </div>
        </main>
      )}

      {activeTab === "add" && (
        <main className="flex-1 overflow-y-auto pb-32 px-6 pt-12 animate-in slide-in-from-bottom-10">
          <div className="bg-[#2D1B69] p-10 rounded-[45px] shadow-2xl border-t-[8px] border-[#D4AF37]">
            <h3 className="text-center font-black text-2xl mb-12">নতুন টাকা জমা</h3>
            <form onSubmit={handleDeposit} className="space-y-8">
              <div className="space-y-2">
                <Label className="text-[#D4AF37] text-[10px] font-black uppercase tracking-widest ml-1">জমার পরিমাণ (TK)</Label>
                <Input type="number" value={depositAmount} onChange={(e)=>setDepositAmount(Number(e.target.value))} className="h-20 text-4xl font-black bg-white/5 border-none text-center rounded-3xl" />
              </div>
              <div className="space-y-2">
                <Label className="text-[#D4AF37] text-[10px] font-black uppercase tracking-widest ml-1">জমার তারিখ</Label>
                <Input type="date" value={depositDate} onChange={(e)=>setDepositDate(e.target.value)} className="h-16 font-black bg-white/5 border-none rounded-2xl px-6" />
              </div>
              <div className="space-y-2">
                <Label className="text-[#D4AF37] text-[10px] font-black uppercase tracking-widest ml-1">অ্যাকাউন্ট হোল্ডার</Label>
                <div className="h-16 bg-white/10 rounded-2xl flex items-center justify-between px-6 border border-white/5">
                  <span className="font-black text-lg">{user?.displayName || "নাম লোড হচ্ছে..."}</span>
                  {user?.displayName ? <ShieldCheck className="w-7 h-7 text-[#D4AF37]" /> : <AlertCircle className="w-7 h-7 text-red-500" />}
                </div>
              </div>
              <Button type="submit" disabled={mutationLoading || !user?.displayName} className="w-full h-18 bg-[#D4AF37] text-black font-black text-lg rounded-3xl shadow-xl active:scale-95 transition-all mt-6">
                {mutationLoading ? "প্রসেসিং..." : "জমা নিশ্চিত করুন"}
              </Button>
            </form>
          </div>
        </main>
      )}

      {activeTab === "history" && (
        <main className="flex-1 overflow-y-auto pb-32 px-6 pt-10 animate-in slide-in-from-right-10">
          <h2 className="font-black text-2xl mb-8 flex items-center gap-3"><History className="text-[#D4AF37]" /> ব্যক্তিগত রিপোর্ট</h2>
          <div className="space-y-4">
            {(!myTransactions || myTransactions.length === 0) ? (
              <div className="text-center py-20 opacity-20"><History className="w-16 h-16 mx-auto mb-3" /><p className="font-black">কোন রিপোর্ট নেই</p></div>
            ) : (
              myTransactions.map((t, i) => (
                <div key={i} className="bg-white/5 p-6 rounded-[30px] flex items-center justify-between border border-white/5 shadow-lg">
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 bg-[#D4AF37] rounded-2xl flex items-center justify-center text-black font-black text-xl">৳</div>
                    <div><p className="font-black text-xl">৳{t.amount.toLocaleString()}</p><p className="text-[10px] text-white/40 font-black uppercase mt-0.5">{t.date}</p></div>
                  </div>
                  <div className="bg-[#D4AF37]/10 px-4 py-1.5 rounded-full border border-[#D4AF37]/20"><span className="text-[9px] font-black text-[#D4AF37] tracking-widest uppercase">VERIFIED</span></div>
                </div>
              ))
            )}
          </div>
        </main>
      )}

      <nav className="fixed bottom-0 left-0 right-0 bg-[#2D1B69]/90 backdrop-blur-2xl h-24 px-10 flex items-center justify-between z-[100] rounded-t-[45px] border-t border-white/5 shadow-2xl">
        <button onClick={()=>setActiveTab("home")} className={cn("flex flex-col items-center gap-1.5 transition-all", activeTab==="home" ? "text-[#D4AF37] scale-110" : "text-white/20")}><Home className="w-7 h-7" /><span className="text-[9px] font-black uppercase">HOME</span></button>
        <button onClick={()=>setActiveTab("add")} className={cn("flex flex-col items-center gap-1.5 transition-all", activeTab==="add" ? "text-[#D4AF37] scale-110" : "text-white/20")}><Plus className="w-7 h-7" /><span className="text-[9px] font-black uppercase">DEPOSIT</span></button>
        <button onClick={()=>setActiveTab("history")} className={cn("flex flex-col items-center gap-1.5 transition-all", activeTab==="history" ? "text-[#D4AF37] scale-110" : "text-white/20")}><FileText className="w-7 h-7" /><span className="text-[9px] font-black uppercase">REPORT</span></button>
      </nav>
    </div>
  );
}
