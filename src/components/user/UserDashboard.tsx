
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
  Home, 
  History, 
  PlusCircle, 
  MapPin, 
  CloudSun, 
  Calendar,
  Wallet,
  ShieldCheck,
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

  // Fetch User's Own Transactions
  const txQuery = user?.displayName ? query(
    collection(db!, "transactions"),
    where("memberName", "==", user.displayName),
    orderBy("date", "desc")
  ) : null;

  const { data: myTransactions } = useCollection(txQuery);
  const totalMyBalance = myTransactions?.reduce((acc, curr) => acc + curr.amount, 0) || 0;

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
      toast({ title: "সফল!", description: "আপনার জমা রেকর্ড করা হয়েছে এবং অ্যাডমিনকে জানানো হয়েছে।" });
      setActiveTab("home");
    } catch (e) {
      toast({ variant: "destructive", title: "ত্রুটি", description: "জমা রেকর্ড করা যায়নি।" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#F0F2F5] overflow-hidden font-body">
      {/* User Header */}
      <header className="sticky top-0 z-[100] w-full bg-white/80 backdrop-blur-xl py-2 px-6 flex items-center justify-between border-b border-slate-100 h-16">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[#1E3A8A] to-[#6366F1] rounded-full flex items-center justify-center text-white font-black text-xs">MG</div>
          <div className="flex flex-col">
            <h1 className="font-black text-[12px] text-[#1E3A8A] leading-none uppercase">{user?.displayName}</h1>
            <p className="text-[8px] text-green-500 font-black uppercase mt-1">Verified Member Hub</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="w-10 h-10 bg-red-50 text-red-500 rounded-2xl" onClick={onLogout}>
          <LogOut className="w-5 h-5" />
        </Button>
      </header>

      <main className="flex-1 overflow-y-auto pb-32 px-4 pt-6 space-y-6 max-w-[480px] mx-auto w-full">
        
        {activeTab === "home" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Weather Card */}
            <div className="luxury-card p-6 gradient-banner relative overflow-hidden">
              <div className="flex justify-between items-start relative z-10">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-[#D4AF37] font-black text-[10px] uppercase tracking-[0.2em]">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Riyadh, SA</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-4xl font-black">32°C</h1>
                    <CloudSun className="w-7 h-7 text-white/90" />
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[12px] font-black uppercase text-white/70">{currentTime.toLocaleDateString('en-US', { weekday: 'long' })}</p>
                  <p className="text-[22px] font-black text-[#D4AF37] mt-1">{currentTime.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}</p>
                </div>
              </div>
            </div>

            {/* My Balance Summary */}
            <div className="luxury-card p-8 border-t-[12px] border-[#1E3A8A]">
              <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">My Total Contribution</p>
              <h2 className="text-4xl font-black text-[#1E3A8A] mt-1">৳{totalMyBalance.toLocaleString()}</h2>
              <div className="flex items-center gap-2 mt-4">
                <ShieldCheck className="w-4 h-4 text-green-500" />
                <span className="text-[10px] font-bold text-slate-400 uppercase">Secured by Minar Go Foundation</span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => setActiveTab("add")}
                className="bg-white p-6 rounded-[32px] shadow-lg border border-slate-50 flex flex-col items-center gap-3 active:scale-95 transition-all"
              >
                <div className="bg-blue-50 p-4 rounded-2xl text-[#1E40AF]"><PlusCircle className="w-6 h-6" /></div>
                <span className="text-[11px] font-black text-[#1E3A8A] uppercase">নতুন জমা</span>
              </button>
              <button 
                onClick={() => setActiveTab("history")}
                className="bg-white p-6 rounded-[32px] shadow-lg border border-slate-50 flex flex-col items-center gap-3 active:scale-95 transition-all"
              >
                <div className="bg-gold/10 p-4 rounded-2xl text-gold-dark"><History className="w-6 h-6" /></div>
                <span className="text-[11px] font-black text-[#1E3A8A] uppercase">জমার ইতিহাস</span>
              </button>
            </div>
          </div>
        )}

        {activeTab === "add" && (
          <div className="animate-in fade-in zoom-in-95 duration-500">
            <div className="luxury-card p-8 shadow-2xl border-t-[12px] border-[#D4AF37]">
              <h3 className="text-center font-black text-[#1E3A8A] text-xl mb-10 uppercase tracking-[0.3em]">অ্যামাউন্ট লিখুন</h3>
              <form onSubmit={handleDeposit} className="space-y-8">
                <div className="space-y-3">
                  <Label className="text-[10px] font-black text-slate-400 uppercase ml-1">জমার পরিমাণ (TK)</Label>
                  <Input 
                    type="number" 
                    value={depositAmount} 
                    onChange={(e) => setDepositAmount(Number(e.target.value))} 
                    className="h-16 text-3xl font-black bg-slate-50 border-none text-center" 
                  />
                </div>
                <Button type="submit" disabled={loading} className="w-full h-18 bg-[#1E3A8A] text-white text-[15px] font-black shadow-2xl rounded-[24px] uppercase tracking-[0.2em]">
                  {loading ? "প্রসেসিং হচ্ছে..." : "জমা নিশ্চিত করুন"}
                </Button>
                <Button variant="ghost" onClick={() => setActiveTab("home")} className="w-full text-slate-400 font-bold uppercase text-[10px]">বাতিল করুন</Button>
              </form>
            </div>
          </div>
        )}

        {activeTab === "history" && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="flex items-center gap-3 mb-4">
              <Button variant="ghost" size="sm" onClick={() => setActiveTab("home")} className="h-10 w-10 rounded-full bg-white shadow-md p-0">
                <History className="w-5 h-5 text-[#1E3A8A]" />
              </Button>
              <h2 className="font-black text-[#1E3A8A] text-sm uppercase tracking-widest">আমার জমার ইতিহাস</h2>
            </div>
            {myTransactions?.map((t, idx) => (
              <div key={idx} className="luxury-card p-5 flex items-center justify-between border-slate-50 shadow-sm">
                <div>
                  <p className="font-black text-slate-800 text-[15px]">৳{t.amount.toLocaleString()}</p>
                  <p className="text-[9px] text-slate-400 font-black uppercase mt-0.5">{t.date}</p>
                </div>
                <div className="bg-green-50 px-4 py-2 rounded-full">
                  <span className="text-[10px] font-black text-green-600 uppercase">Confirmed</span>
                </div>
              </div>
            ))}
            {(!myTransactions || myTransactions.length === 0) && (
              <div className="text-center py-20 opacity-20">
                <Wallet className="w-16 h-16 mx-auto mb-4" />
                <p className="font-black text-xs uppercase tracking-widest">No Records Found</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* User Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-2xl h-22 px-8 flex items-center justify-around z-[100] nav-shadow rounded-t-[45px] border-t border-slate-100">
        <button onClick={() => setActiveTab("home")} className={cn("flex flex-col items-center gap-1.5 transition-all", activeTab === "home" ? "text-[#1E3A8A] scale-110" : "text-slate-300")}>
          <Home className="w-7 h-7"/><span className="text-[9px] font-black uppercase">Home</span>
        </button>
        <button onClick={() => setActiveTab("add")} className={cn("flex flex-col items-center gap-1.5 transition-all", activeTab === "add" ? "text-[#1E3A8A] scale-110" : "text-slate-300")}>
          <PlusCircle className="w-7 h-7"/><span className="text-[9px] font-black uppercase">Deposit</span>
        </button>
        <button onClick={() => setActiveTab("history")} className={cn("flex flex-col items-center gap-1.5 transition-all", activeTab === "history" ? "text-[#1E3A8A] scale-110" : "text-slate-300")}>
          <History className="w-7 h-7"/><span className="text-[9px] font-black uppercase">History</span>
        </button>
      </nav>
    </div>
  );
}
