
"use client";

import { useState, useEffect, useMemo } from "react";
import { useUser, useFirestore, useCollection, useDoc } from "@/firebase";
import { collection, query, where, orderBy, addDoc, serverTimestamp, doc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { 
  LogOut, 
  History, 
  Wallet,
  ShieldCheck,
  ChevronRight,
  Bell,
  FileText
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

  // Fetch Foundation Settings (Logo and Name)
  const settingsRef = db ? doc(db, "settings", "foundation") : null;
  const { data: settings } = useDoc(settingsRef);

  // Fetch transactions for the specific logged-in member
  const txQuery = useMemo(() => {
    if (!user?.displayName || !db) return null;
    return query(
      collection(db, "transactions"),
      where("memberName", "==", user.displayName),
      orderBy("date", "desc")
    );
  }, [user?.displayName, db]);

  const { data: myTransactions } = useCollection(txQuery);
  const totalMyBalance = useMemo(() => {
    return (myTransactions || []).reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
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
          {/* Top Section - Native App Style Purple Header */}
          <div className="relative bg-gradient-to-b from-[#2D0B5A] to-[#1A1140] pt-12 pb-24 px-6 text-center">
            {/* Logout Button */}
            <button 
              onClick={onLogout}
              className="absolute top-6 right-6 bg-red-600/90 text-white px-5 py-2 rounded-2xl text-[10px] font-black shadow-lg uppercase tracking-widest active:scale-90 transition-all"
            >
              Log Out
            </button>

            {/* Premium Logo Wrapper - Automatically Synced with Admin */}
            <div className="flex justify-center mb-8 animate-in fade-in zoom-in duration-700">
              <div className="w-28 h-28 rounded-full border-[6px] border-[#D4AF37] p-1 bg-white flex items-center justify-center overflow-hidden shadow-[0_0_40px_rgba(212,175,55,0.3)]">
                 <div className="w-full h-full bg-gradient-to-br from-[#1E3A8A] to-[#6366F1] rounded-full flex items-center justify-center">
                    {settings?.logo ? (
                      <img src={settings.logo} className="w-full h-full object-cover" alt="Logo" />
                    ) : (
                      <span className="text-white text-4xl font-black italic">MG</span>
                    )}
                 </div>
              </div>
            </div>

            {/* Foundation Name - Automatically Synced with Admin */}
            <h1 className="text-[#D4AF37] text-[10px] font-black uppercase tracking-[0.3em] mb-3 leading-tight opacity-90">
              {settings?.name || "MINAR GO EXPATRIATE DEVELOPMENT FOUNDATION"}
            </h1>

            {/* Active User Name */}
            <h2 className="text-white text-4xl font-black mt-2 drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)] tracking-tight">
              {user?.displayName || "Member"}
            </h2>

            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80%] h-[3px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent opacity-50"></div>
          </div>

          <div className="px-5 -mt-12 space-y-6 relative z-10">
            
            {/* Summary Balance Card - Real-time Updated */}
            <div className="bg-white/10 backdrop-blur-2xl p-8 rounded-[45px] border border-white/20 text-center shadow-2xl">
               <p className="text-[#D4AF37] text-[9px] font-black uppercase tracking-[0.4em] mb-2">My Total Summary</p>
               <h3 className="text-white text-5xl font-black tracking-tighter">৳{totalMyBalance.toLocaleString()}</h3>
            </div>

            {/* Native Info Cards Row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#2D2D4D]/90 border border-white/10 p-6 rounded-[35px] text-center shadow-xl">
                <p className="text-[#D4AF37] text-[9px] font-black mb-2 uppercase tracking-widest">🕋 Hajj 2026</p>
                <p className="text-white text-[14px] font-black">২৭ মে, ২০২৬</p>
              </div>
              <div className="bg-[#2D2D4D]/90 border border-white/10 p-6 rounded-[35px] text-center shadow-xl">
                <p className="text-[#D4AF37] text-[9px] font-black mb-2 uppercase tracking-widest">🌙 Ramadan</p>
                <p className="text-white text-[14px] font-black">১৮ ফেব্রুয়ারি, ২০২৬</p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-[#FFD700] via-[#FFC107] to-[#FFD700] p-5 rounded-full shadow-[0_10px_25px_rgba(255,193,7,0.3)] flex items-center justify-center gap-4 active:scale-95 transition-all">
              <span className="text-2xl">📅</span>
              <p className="text-black font-black text-[14px] tracking-tight">
                আজ: {getBengaliDate()}
              </p>
            </div>

            <div className="bg-[#2D2D4D]/80 border border-white/5 p-7 rounded-[40px] shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-2 h-full bg-[#D4AF37]"></div>
              <div className="flex items-center gap-3 mb-4">
                <Bell className="w-6 h-6 text-[#D4AF37] animate-bounce" />
                <h3 className="text-white font-black text-[15px] uppercase tracking-widest">জরুরি বিজ্ঞপ্তি:</h3>
              </div>
              <p className="text-white/80 text-[16px] font-bold leading-relaxed">
                কি অবস্থা কেমন আছেন সবাই
              </p>
            </div>

            <div className="space-y-4 pt-4">
              <div className="flex items-center justify-between px-4">
                <h4 className="text-white/40 text-[10px] font-black uppercase tracking-[0.4em]">My Document Logs</h4>
                <button onClick={() => setActiveTab("history")} className="text-[#D4AF37] text-[9px] font-black uppercase tracking-widest">View All</button>
              </div>
              
              <div className="space-y-3">
                {myTransactions?.slice(0, 5).map((t, idx) => (
                  <div key={idx} className="bg-white/5 p-5 flex items-center justify-between border border-white/5 rounded-[30px] shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 rounded-[22px] bg-gradient-to-br from-[#D4AF37] to-[#B8960C] flex items-center justify-center text-black font-black text-xl shadow-lg">৳</div>
                      <div>
                        <p className="font-black text-white text-[17px]">৳{(Number(t.amount) || 0).toLocaleString()}</p>
                        <p className="text-[9px] text-white/30 font-black uppercase mt-1 tracking-widest">{t.date}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <div className="bg-green-500/10 px-4 py-1.5 rounded-full border border-green-500/20">
                        <span className="text-[8px] font-black text-green-400 uppercase tracking-widest">Verified</span>
                      </div>
                    </div>
                  </div>
                ))}
                {(!myTransactions || myTransactions.length === 0) && (
                  <div className="text-center py-16 opacity-10 bg-white/5 rounded-[40px] border border-dashed border-white/20">
                    <FileText className="w-16 h-16 mx-auto mb-4 text-white" />
                    <p className="font-black text-white text-[10px] uppercase tracking-widest">No Records Found</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      )}

      {activeTab === "add" && (
        <main className="flex-1 overflow-y-auto pb-32 px-5 pt-12">
           <div className="bg-[#2D0B5A] p-10 rounded-[50px] shadow-[0_30px_70px_rgba(0,0,0,0.5)] border-t-[10px] border-[#D4AF37]">
              <div className="flex items-center gap-4 mb-12">
                <Button variant="ghost" onClick={() => setActiveTab("home")} className="w-12 h-12 rounded-full bg-white/10 p-0 text-white shadow-xl"><ChevronRight className="rotate-180 w-6 h-6"/></Button>
                <h3 className="font-black text-white text-xl uppercase tracking-[0.2em]">টাকা জমা দিন</h3>
              </div>
              <form onSubmit={handleDeposit} className="space-y-10">
                <div className="space-y-4">
                  <Label className="text-[10px] font-black text-[#D4AF37] uppercase tracking-[0.3em] ml-2">জমার পরিমাণ (TK)</Label>
                  <Input 
                    type="number" 
                    value={depositAmount} 
                    onChange={(e) => setDepositAmount(Number(e.target.value))} 
                    className="h-24 text-5xl font-black bg-white/5 border-none text-white text-center shadow-inner rounded-[35px] focus:ring-4 ring-[#D4AF37]/20 transition-all" 
                  />
                </div>
                <div className="space-y-4">
                   <Label className="text-[10px] font-black text-[#D4AF37] uppercase tracking-[0.3em] ml-2">মেম্বার প্রোফাইল</Label>
                   <div className="h-20 px-8 bg-white/5 rounded-[30px] flex items-center justify-between border border-white/10 shadow-inner">
                      <span className="font-black text-white text-lg">{user?.displayName}</span>
                      <ShieldCheck className="w-7 h-7 text-[#D4AF37]" />
                   </div>
                </div>
                <Button type="submit" disabled={loading} className="w-full h-22 bg-gradient-to-r from-[#D4AF37] to-[#B8960C] text-black text-[16px] font-black shadow-3xl rounded-[35px] uppercase tracking-[0.4em] active:scale-95 transition-all mt-10 border-b-[6px] border-[#8A6D05]">
                  {loading ? "প্রসেসিং হচ্ছে..." : "কনফার্ম করুন"}
                </Button>
              </form>
            </div>
        </main>
      )}

      {activeTab === "history" && (
        <main className="flex-1 overflow-y-auto pb-32 px-5 pt-12">
           <div className="flex items-center gap-4 mb-10">
              <button onClick={() => setActiveTab("home")} className="h-14 w-14 rounded-[25px] bg-[#D4AF37] flex items-center justify-center text-black shadow-xl active:scale-90 transition-all">
                <History className="w-7 h-7" />
              </button>
              <h2 className="font-black text-white text-lg uppercase tracking-[0.3em]">জমার ইতিহাস</h2>
            </div>
            <div className="space-y-4">
              {myTransactions?.map((t, idx) => (
                <div key={idx} className="bg-white/5 p-7 flex items-center justify-between border border-white/10 rounded-[35px] shadow-2xl animate-in fade-in duration-500">
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 rounded-[25px] bg-[#D4AF37] flex items-center justify-center text-black font-black text-2xl shadow-xl">৳</div>
                    <div>
                      <p className="font-black text-white text-[20px]">৳{(Number(t.amount) || 0).toLocaleString()}</p>
                      <p className="text-[10px] text-white/40 font-black uppercase mt-1 tracking-widest">{t.date}</p>
                    </div>
                  </div>
                  <div className="bg-[#D4AF37]/20 px-5 py-2 rounded-full border border-[#D4AF37]/30 shadow-sm">
                    <span className="text-[9px] font-black text-[#D4AF37] uppercase tracking-widest">Verified</span>
                  </div>
                </div>
              ))}
              {(!myTransactions || myTransactions.length === 0) && (
                <div className="text-center py-32 opacity-20">
                  <Wallet className="w-24 h-24 mx-auto mb-8 text-white" />
                  <p className="font-black text-white text-sm uppercase tracking-widest">Empty Account History</p>
                </div>
              )}
            </div>
        </main>
      )}

      {/* Professional Native Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#2D0B5A]/95 backdrop-blur-3xl h-24 px-12 flex items-center justify-between z-[100] rounded-t-[50px] border-t border-white/10 shadow-[0_-20px_60px_rgba(0,0,0,0.6)]">
        <button onClick={() => setActiveTab("home")} className={cn("flex flex-col items-center gap-2 transition-all duration-300", activeTab === "home" ? "text-[#D4AF37] scale-125 -translate-y-1" : "text-white/30")}>
          <div className="text-2xl drop-shadow-lg">🏠</div><span className="text-[9px] font-black uppercase tracking-tighter">হোম</span>
        </button>
        <button onClick={() => setActiveTab("add")} className={cn("flex flex-col items-center gap-2 transition-all duration-300", activeTab === "add" ? "text-[#D4AF37] scale-125 -translate-y-1" : "text-white/30")}>
          <div className="text-2xl drop-shadow-lg">💰</div><span className="text-[9px] font-black uppercase tracking-tighter">জমা</span>
        </button>
        <button onClick={() => setActiveTab("history")} className={cn("flex flex-col items-center gap-2 transition-all duration-300", activeTab === "history" ? "text-[#D4AF37] scale-125 -translate-y-1" : "text-white/30")}>
          <div className="text-2xl drop-shadow-lg">📋</div><span className="text-[9px] font-black uppercase tracking-tighter">ইতিহাস</span>
        </button>
      </nav>
    </div>
  );
}
