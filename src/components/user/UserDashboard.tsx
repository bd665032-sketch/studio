
"use client";

import { useState, useEffect, useMemo } from "react";
import { useUser, useFirestore, useCollection, useDoc } from "@/firebase";
import { collection, query, where, orderBy, addDoc, serverTimestamp, doc } from "firebase/firestore";
import { updateProfile } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  AlertCircle,
  UserCheck,
  Download,
  Filter
} from "lucide-react";
import { cn } from "@/lib/utils";
import { exportSummaryPDF } from "@/lib/pdf-utils";

const months = ["All", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export default function UserDashboard({ onLogout }: { onLogout: () => void }) {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("home");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [depositAmount, setDepositAmount] = useState(5000);
  const [depositDate, setDepositDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedSummaryMonth, setSelectedSummaryMonth] = useState("All");
  const [mutationLoading, setMutationLoading] = useState(false);
  const [selectedOfficialName, setSelectedOfficialName] = useState("");

  const settingsRef = useMemo(() => (db ? doc(db, "settings", "foundation") : null), [db]);
  const { data: settings, loading: settingsLoading } = useDoc(settingsRef);

  const { data: membersList } = useCollection(
    db ? query(collection(db, "members"), orderBy("name")) : null
  );

  const txQuery = useMemo(() => {
    if (!user?.displayName || !db) return null;
    return query(
      collection(db, "transactions"),
      where("memberName", "==", user.displayName),
      orderBy("timestamp", "desc")
    );
  }, [user?.displayName, db]);
  
  const { data: myTransactions, loading: txLoading } = useCollection(txQuery);

  const getMonthFromDateStr = (dateStr: string) => {
    if (!dateStr) return "";
    const parts = dateStr.split('-');
    if (parts.length < 2) return "";
    const monthIndex = parseInt(parts[1], 10) - 1;
    return months[monthIndex + 1]; // Offset for "All" at index 0
  };

  const filteredTransactions = useMemo(() => {
    if (!myTransactions) return [];
    return myTransactions.filter(t => {
      if (selectedSummaryMonth === "All") return true;
      return getMonthFromDateStr(t.date) === selectedSummaryMonth;
    });
  }, [myTransactions, selectedSummaryMonth]);

  const totalBalance = useMemo(() => {
    return filteredTransactions.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  }, [filteredTransactions]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleFixProfile = async () => {
    if (!selectedOfficialName || !user) return;
    setMutationLoading(true);
    try {
      await updateProfile(user, { displayName: selectedOfficialName });
      toast({ title: "সফল!", description: "আপনার প্রোফাইল আপডেট করা হয়েছে।" });
      window.location.reload();
    } catch (e: any) {
      toast({ variant: "destructive", title: "ত্রুটি", description: "প্রোফাইল আপডেট করতে সমস্যা হয়েছে।" });
    } finally {
      setMutationLoading(false);
    }
  };

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.displayName || !db) return;
    
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

  const handleDownloadPDF = () => {
    if (filteredTransactions.length === 0) {
      toast({ variant: "destructive", title: "ত্রুটি", description: "ডাউনলোড করার মতো কোনো রিপোর্ট পাওয়া যায়নি।" });
      return;
    }
    
    const pdfData = filteredTransactions.map((t: any) => ({
      n: t.memberName,
      d: t.date,
      a: t.amount
    }));
    
    const titleSuffix = selectedSummaryMonth === "All" ? "" : `_${selectedSummaryMonth}`;
    exportSummaryPDF(pdfData, `Report_${user?.displayName}${titleSuffix}`, totalBalance);
    toast({ title: "সফল!", description: "আপনার জমার রিপোর্ট ডাউনলোড করা হচ্ছে।" });
  };

  const bengaliDate = new Intl.DateTimeFormat('bn-BD', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  }).format(currentTime);

  if (txLoading || settingsLoading) {
    return (
      <div className="min-h-screen bg-[#1A1140] flex flex-col items-center justify-center gap-6">
        <div className="w-20 h-20 rounded-full border-4 border-white/5 border-t-[#D4AF37] animate-spin"></div>
        <p className="text-white font-black text-xs uppercase tracking-widest animate-pulse">Syncing Foundation records...</p>
      </div>
    );
  }

  if (!user?.displayName) {
    return (
      <div className="min-h-screen bg-[#1A1140] flex flex-col items-center justify-center p-8 text-center font-body">
        <div className="w-20 h-20 bg-[#D4AF37]/10 rounded-full flex items-center justify-center mb-8">
          <AlertCircle className="w-10 h-10 text-[#D4AF37]" />
        </div>
        <h2 className="text-2xl font-black text-white mb-4 uppercase tracking-tight">Profile Setup Required</h2>
        <p className="text-white/60 text-sm mb-10 leading-relaxed">আপনার নামের সাথে ফাউন্ডেশনের ডাটা সিঙ্ক করার জন্য নিচের তালিকা থেকে আপনার সঠিক অফিসিয়াল নামটি সিলেক্ট করুন।</p>
        
        <div className="w-full max-w-sm space-y-6">
          <Select onValueChange={setSelectedOfficialName}>
            <SelectTrigger className="h-16 rounded-[24px] bg-white/5 border-white/10 text-white font-black text-base">
              <SelectValue placeholder="সিলেক্ট আপনার নাম" />
            </SelectTrigger>
            <SelectContent className="bg-[#2D1B69] border-white/10 text-white rounded-[24px]">
              {membersList?.map((m: any) => (
                <SelectItem key={m.id} value={m.name} className="py-4 font-black text-white focus:text-white">
                  {m.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button 
            onClick={handleFixProfile} 
            disabled={!selectedOfficialName || mutationLoading}
            className="w-full h-16 bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-black font-black rounded-[24px] shadow-xl"
          >
            {mutationLoading ? <Loader2 className="animate-spin" /> : "সম্পন্ন করুন"}
          </Button>
          
          <button onClick={onLogout} className="text-white/40 text-xs font-bold uppercase tracking-widest pt-4">লগআউট করুন</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#1A1140] font-bengali text-white overflow-hidden">
      
      {activeTab === "home" && (
        <main className="flex-1 overflow-y-auto pb-32 animate-in fade-in duration-700">
          <div className="relative pt-16 pb-28 px-8 text-center border-b-[12px] border-[#D4AF37]/10">
            <button onClick={onLogout} className="absolute top-8 right-8 bg-white/5 p-3 rounded-full text-white/40 hover:text-white transition-colors">
              <LogOut className="w-5 h-5" />
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
            <h1 className="text-[#D4AF37] text-[11px] font-black uppercase tracking-[0.4em] mb-3">{settings?.name || "MINAR GO FOUNDATION"}</h1>
            <h2 className="text-4xl font-black tracking-tight">{user.displayName}</h2>
          </div>

          <div className="px-6 space-y-6 -mt-12 relative z-20">
            <div className="bg-gradient-to-b from-[#2D1B69] to-[#1A1140] p-10 rounded-[45px] border border-white/10 text-center shadow-2xl relative">
              <div className="absolute top-6 right-6">
                <Select value={selectedSummaryMonth} onValueChange={setSelectedSummaryMonth}>
                   <SelectTrigger className="w-32 h-9 bg-white/10 border-none text-[10px] font-black rounded-full text-[#D4AF37]"><SelectValue placeholder="মাস নির্বাচন" /></SelectTrigger>
                   <SelectContent className="bg-[#2D1B69] border-white/10 text-white rounded-2xl">
                     {months.map(m => (
                       <SelectItem key={m} value={m} className="text-xs font-black text-white focus:text-white">
                         {m}
                       </SelectItem>
                     ))}
                   </SelectContent>
                </Select>
              </div>
              <p className="text-[#D4AF37]/70 text-[11px] font-black uppercase tracking-[0.2em] mb-2">
                {selectedSummaryMonth === "All" ? "আপনার মোট জমার পরিমাণ" : `${selectedSummaryMonth} মাসের মোট জমা`}
              </p>
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
          </div>
        </main>
      )}

      {activeTab === "add" && (
        <main className="flex-1 overflow-y-auto pb-32 px-6 pt-16 animate-in slide-in-from-bottom-10 duration-500">
          <div className="bg-[#2D1B69] p-12 rounded-[50px] shadow-2xl border-t-[10px] border-[#D4AF37]">
            <h3 className="text-center font-black text-2xl mb-12 uppercase tracking-[0.2em]">টাকা জমা দিন</h3>
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
                  <UserCheck className="w-8 h-8 text-[#D4AF37] shrink-0" />
                </div>
              </div>
              <Button type="submit" disabled={mutationLoading} className="w-full h-20 bg-gradient-to-r from-[#D4AF37] to-[#B8960C] text-black font-black text-xl rounded-[30px] shadow-xl active:scale-95 transition-all mt-8">
                {mutationLoading ? <Loader2 className="w-7 h-7 animate-spin" /> : "সাবমিট করুন"}
              </Button>
            </form>
          </div>
        </main>
      )}

      {activeTab === "history" && (
        <main className="flex-1 overflow-y-auto pb-32 px-6 pt-16 animate-in slide-in-from-right-10 duration-500">
          <div className="flex items-center justify-between mb-10 px-2">
            <h2 className="font-black text-2xl flex items-center gap-4 uppercase tracking-tight">
              <History className="text-[#D4AF37] w-8 h-8" /> জমার রিপোর্ট
            </h2>
            <div className="flex gap-2">
               <Select value={selectedSummaryMonth} onValueChange={setSelectedSummaryMonth}>
                 <SelectTrigger className="w-24 h-10 bg-white/5 border-white/10 text-[10px] font-black rounded-xl text-[#D4AF37]"><SelectValue placeholder="Filter" /></SelectTrigger>
                 <SelectContent className="bg-[#2D1B69] border-white/10 text-white">
                   {months.map(m => (
                     <SelectItem key={m} value={m} className="text-xs font-black text-white focus:text-white">
                       {m}
                     </SelectItem>
                   ))}
                 </SelectContent>
               </Select>
               {filteredTransactions.length > 0 && (
                <Button 
                  onClick={handleDownloadPDF} 
                  variant="ghost" 
                  className="bg-[#D4AF37]/10 text-[#D4AF37] hover:bg-[#D4AF37]/20 h-10 rounded-xl gap-2 font-black px-4"
                >
                  <Download className="w-5 h-5" /> PDF
                </Button>
              )}
            </div>
          </div>
          
          <div className="space-y-5">
            {filteredTransactions.length === 0 ? (
              <div className="text-center py-32 opacity-20">
                <History className="w-24 h-24 mx-auto mb-5" />
                <p className="font-black text-sm uppercase tracking-widest">No Records Found</p>
              </div>
            ) : (
              filteredTransactions.map((t: any) => (
                <div key={t.id} className="bg-white/5 p-8 rounded-[40px] flex items-center justify-between border border-white/5 shadow-2xl backdrop-blur-sm">
                  <div className="space-y-1">
                    <p className="font-black text-2xl tracking-tighter">৳{t.amount.toLocaleString()}</p>
                    <p className="text-[11px] text-white/40 font-black uppercase tracking-widest">{t.date}</p>
                  </div>
                  <div className="bg-[#D4AF37]/10 px-5 py-2 rounded-full border border-[#D4AF37]/20 flex items-center gap-2">
                    <div className="w-2 h-2 bg-[#D4AF37] rounded-full animate-pulse"></div>
                    <span className="text-[10px] font-black text-[#D4AF37] uppercase tracking-widest">VERIFIED</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
      )}

      <nav className="fixed bottom-0 left-0 right-0 bg-[#2D1B69]/90 backdrop-blur-3xl h-28 px-10 flex items-center justify-between z-[100] rounded-t-[50px] border-t border-white/10 shadow-[0_-20px_50px_rgba(0,0,0,0.3)]">
        <button onClick={()=>setActiveTab("home")} className={cn("flex flex-col items-center gap-2 transition-all", activeTab==="home" ? "text-[#D4AF37] scale-110" : "text-white/30")}>
          <Home className="w-8 h-8" /><span className="text-[10px] font-black uppercase tracking-tighter">HOME</span>
        </button>
        <button onClick={()=>setActiveTab("add")} className="relative -top-12">
          <div className={cn("w-20 h-20 rounded-full flex items-center justify-center border-[8px] border-[#1A1140] shadow-2xl transition-all", activeTab==="add" ? "bg-[#D4AF37] text-black" : "bg-[#2D1B69] text-white/40")}>
            <Plus className="w-10 h-10" />
          </div>
          <span className={cn("absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-black uppercase tracking-tighter", activeTab==="add" ? "text-[#D4AF37]" : "text-white/30")}>DEPOSIT</span>
        </button>
        <button onClick={()=>setActiveTab("history")} className={cn("flex flex-col items-center gap-2 transition-all", activeTab==="history" ? "text-[#D4AF37] scale-110" : "text-white/30")}>
          <FileText className="w-8 h-8" /><span className="text-[10px] font-black uppercase tracking-tighter">REPORT</span>
        </button>
      </nav>
    </div>
  );
}
