
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
  Bell,
  UserCheck,
  ChevronRight
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

  return (
    <div className="flex flex-col h-screen bg-[#F0F2F5] overflow-hidden font-body">
      {/* Premium User Header */}
      <header className="sticky top-0 z-[100] w-full bg-white/80 backdrop-blur-xl py-3 px-6 flex items-center justify-between border-b border-slate-100 h-18">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 bg-gradient-to-br from-[#1E3A8A] to-[#6366F1] rounded-full flex items-center justify-center text-white font-black text-xs shadow-lg active:scale-95 transition-transform">MG</div>
          <div className="flex flex-col">
            <h1 className="font-black text-[13px] text-[#1E3A8A] leading-none uppercase tracking-tight">{user?.displayName}</h1>
            <div className="flex items-center gap-1.5 mt-1.5">
              <UserCheck className="w-3 h-3 text-green-500" />
              <p className="text-[8px] text-green-600 font-black uppercase tracking-widest">Verified Member</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="w-10 h-10 bg-blue-50/50 text-[#1E3A8A] rounded-2xl active:scale-90 transition-transform">
            <Bell className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" className="w-10 h-10 bg-red-50 text-red-500 rounded-2xl active:scale-90 transition-transform" onClick={onLogout}>
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-32 px-4 pt-6 space-y-6 max-w-[480px] mx-auto w-full">
        
        {activeTab === "home" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Native Weather Card */}
            <div className="luxury-card p-6 gradient-banner relative overflow-hidden">
              <div className="flex justify-between items-start relative z-10">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-[#D4AF37] font-black text-[10px] uppercase tracking-[0.2em]">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Riyadh, SA</span>
                  </div>
                  <div className="flex items-center gap-4 mt-2">
                    <h1 className="text-4xl font-black">32°C</h1>
                    <div className="flex flex-col">
                      <CloudSun className="w-7 h-7 text-white/90" />
                      <span className="text-[8px] font-black uppercase opacity-60">Sunny Clear</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[12px] font-black uppercase text-white/70">{currentTime.toLocaleDateString('en-US', { weekday: 'long' })}</p>
                  <p className="text-[22px] font-black text-[#D4AF37] mt-1 leading-none">{currentTime.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}</p>
                </div>
              </div>
            </div>

            {/* Islamic Events Summary */}
            <div className="luxury-card p-5 border-l-[10px] border-[#D4AF37]">
                <div className="flex items-center gap-2 mb-4 px-1">
                  <Calendar className="w-5 h-5 text-[#1E40AF]" />
                  <h3 className="text-[10px] font-black text-[#1E3A8A] uppercase tracking-widest">Foundation Calendar</h3>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-slate-50 p-3 rounded-2xl text-center border border-slate-100">
                    <p className="text-[7px] font-black text-slate-400 uppercase mb-1">Hajj 26</p>
                    <p className="text-[10px] font-black text-[#1E40AF]">May 24</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-2xl text-center border border-slate-100">
                    <p className="text-[7px] font-black text-slate-400 uppercase mb-1">Ramadan 27</p>
                    <p className="text-[10px] font-black text-[#1E40AF]">Mar 09</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-2xl text-center border border-slate-100">
                    <p className="text-[7px] font-black text-slate-400 uppercase mb-1">Ramadan 28</p>
                    <p className="text-[10px] font-black text-[#1E40AF]">Feb 26</p>
                  </div>
                </div>
            </div>

            {/* Verified Balance Summary (Member Personal Summary) */}
            <div className="luxury-card p-8 border-t-[12px] border-[#1E3A8A] shadow-xl">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">আপনার ব্যক্তিগত জমার সামারি</p>
              <h2 className="text-4xl font-black text-[#1E3A8A] mt-2">৳{totalMyBalance.toLocaleString()}</h2>
              <div className="flex items-center gap-2 mt-6 bg-green-50/50 p-4 rounded-2xl border border-green-100">
                <ShieldCheck className="w-4 h-4 text-green-500" />
                <span className="text-[9px] font-black text-green-700 uppercase tracking-widest">Bank-Grade Secure Asset</span>
              </div>
            </div>

            {/* Native Quick Actions */}
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => setActiveTab("add")}
                className="bg-white p-7 rounded-[35px] shadow-xl border border-slate-50 flex flex-col items-center gap-4 active:scale-95 transition-all"
              >
                <div className="bg-blue-50 p-4 rounded-[22px] text-[#1E40AF] shadow-inner"><PlusCircle className="w-8 h-8" /></div>
                <span className="text-[11px] font-black text-[#1E3A8A] uppercase tracking-[0.2em]">টাকা জমা</span>
              </button>
              <button 
                onClick={() => setActiveTab("history")}
                className="bg-white p-7 rounded-[35px] shadow-xl border border-slate-50 flex flex-col items-center gap-4 active:scale-95 transition-all"
              >
                <div className="bg-amber-50 p-4 rounded-[22px] text-amber-600 shadow-inner"><History className="w-8 h-8" /></div>
                <span className="text-[11px] font-black text-[#1E3A8A] uppercase tracking-[0.2em]">জমার ইতিহাস</span>
              </button>
            </div>
          </div>
        )}

        {activeTab === "add" && (
          <div className="animate-in fade-in zoom-in-95 duration-500">
            <div className="luxury-card p-8 shadow-2xl border-t-[12px] border-[#D4AF37]">
              <div className="flex items-center gap-3 mb-10">
                <Button variant="ghost" onClick={() => setActiveTab("home")} className="w-10 h-10 rounded-full bg-slate-50 p-0 shadow-sm active:scale-90 transition-transform"><ChevronRight className="rotate-180 w-5 h-5 text-primary"/></Button>
                <h3 className="font-black text-[#1E3A8A] text-lg uppercase tracking-widest">Authorize Deposit</h3>
              </div>
              <form onSubmit={handleDeposit} className="space-y-8">
                <div className="space-y-3">
                  <Label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">Deposit Amount (TK)</Label>
                  <Input 
                    type="number" 
                    value={depositAmount} 
                    onChange={(e) => setDepositAmount(Number(e.target.value))} 
                    className="h-20 text-4xl font-black bg-slate-50 border-none text-center shadow-inner rounded-[28px]" 
                  />
                </div>
                <div className="space-y-3">
                   <Label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">Verified Member Name</Label>
                   <div className="h-16 px-6 bg-slate-50 rounded-[24px] flex items-center justify-between border border-slate-100 shadow-inner">
                      <span className="font-black text-[#1E3A8A] text-sm">{user?.displayName}</span>
                      <ShieldCheck className="w-5 h-5 text-green-500" />
                   </div>
                </div>
                <div className="space-y-3">
                   <Label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">Deposit Date</Label>
                   <div className="h-16 px-6 bg-slate-50 rounded-[24px] flex items-center justify-between border border-slate-100 shadow-inner">
                      <span className="font-black text-[#1E3A8A] text-sm">{new Date().toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                   </div>
                </div>
                <Button type="submit" disabled={loading} className="w-full h-18 bg-[#1E3A8A] text-white text-[15px] font-black shadow-[0_15px_30px_rgba(30,64,175,0.3)] rounded-[28px] uppercase tracking-[0.3em] active:scale-95 transition-all mt-6 border-b-4 border-slate-900">
                  {loading ? "PROCESSING..." : "CONFIRM DEPOSIT"}
                </Button>
              </form>
            </div>
          </div>
        )}

        {activeTab === "history" && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="flex items-center gap-3 mb-8 px-2">
              <button onClick={() => setActiveTab("home")} className="h-12 w-12 rounded-[20px] bg-white shadow-lg flex items-center justify-center text-[#1E3A8A] active:scale-90 transition-transform">
                <History className="w-6 h-6" />
              </button>
              <h2 className="font-black text-[#1E3A8A] text-sm uppercase tracking-[0.2em]">My Transaction Logs</h2>
            </div>
            {myTransactions?.map((t, idx) => (
              <div key={idx} className="luxury-card p-6 flex items-center justify-between border-slate-50 shadow-md animate-in fade-in slide-in-from-right-2 duration-300">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-[22px] bg-green-50 flex items-center justify-center text-green-600 font-black text-xl shadow-inner border border-green-100">৳</div>
                  <div>
                    <p className="font-black text-slate-800 text-[18px]">৳{t.amount?.toLocaleString()}</p>
                    <p className="text-[10px] text-slate-400 font-black uppercase mt-1 tracking-widest">{t.date}</p>
                  </div>
                </div>
                <div className="bg-green-100/40 px-5 py-2.5 rounded-full border border-green-200">
                  <span className="text-[10px] font-black text-green-700 uppercase tracking-tighter">Verified</span>
                </div>
              </div>
            ))}
            {(!myTransactions || myTransactions.length === 0) && (
              <div className="text-center py-24 opacity-20">
                <Wallet className="w-20 h-20 mx-auto mb-6" />
                <p className="font-black text-xs uppercase tracking-widest">Archive Empty</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Professional Native User Nav Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-2xl h-24 px-10 flex items-center justify-between z-[100] nav-shadow rounded-t-[45px] border-t border-slate-100">
        <button onClick={() => setActiveTab("home")} className={cn("flex flex-col items-center gap-2 transition-all duration-300", activeTab === "home" ? "text-[#1E3A8A] scale-110" : "text-slate-300")}>
          <Home className="w-7 h-7"/><span className="text-[10px] font-black uppercase tracking-tighter">Home</span>
        </button>
        <button onClick={() => setActiveTab("add")} className={cn("flex flex-col items-center gap-2 transition-all duration-300", activeTab === "add" ? "text-[#1E3A8A] scale-110" : "text-slate-300")}>
          <PlusCircle className="w-7 h-7"/><span className="text-[10px] font-black uppercase tracking-tighter">Deposit</span>
        </button>
        <button onClick={() => setActiveTab("history")} className={cn("flex flex-col items-center gap-2 transition-all duration-300", activeTab === "history" ? "text-[#1E3A8A] scale-110" : "text-slate-300")}>
          <History className="w-7 h-7"/><span className="text-[10px] font-black uppercase tracking-tighter">Logs</span>
        </button>
      </nav>
    </div>
  );
}
