
"use client";

import { useState, useEffect, useMemo } from "react";
import { 
  useUser, 
  useAuth, 
  useFirestore, 
  useCollection,
  useDoc
} from "@/firebase";
import { 
  signOut, 
  updateProfile, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { 
  collection, 
  query, 
  where, 
  addDoc, 
  serverTimestamp, 
  doc, 
  orderBy,
  deleteDoc
} from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  History, 
  LogOut,
  Plus,
  Home as HomeIcon,
  FileText,
  Loader2,
  Download,
  Mail,
  Lock,
  User,
  Trash2,
  ShieldCheck,
  KeyRound,
  ChevronLeft
} from "lucide-react";
import { cn } from "@/lib/utils";
import { exportSummaryPDF } from "@/lib/pdf-utils";

const months = [
  "All", "January", "February", "March", "April", "May", "June", 
  "July", "August", "September", "October", "November", "December"
];

// Web3Forms Access Key provided by user for OTP
const WEB3FORMS_ACCESS_KEY = "d3f7fc2b-eb65-4ff6-9679-d6282a18ee37";

export default function Home() {
  const { user, loading: userLoading } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState("home");
  const [authStep, setAuthStep] = useState<"login-register" | "otp-verify">("login-register");
  const [isLogin, setIsLogin] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [mutationLoading, setMutationLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Form States
  const [authData, setAuthData] = useState({ email: "", password: "", fullName: "" });
  const [otpInput, setOtpInput] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  
  // Deposit States
  const [depositAmount, setDepositAmount] = useState(5000);
  const [depositDate, setDepositDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedSummaryMonth, setSelectedSummaryMonth] = useState("All");
  
  const settingsRef = useMemo(() => (db ? doc(db, "settings", "foundation") : null), [db]);
  const { data: settings } = useDoc(settingsRef);

  const membersQuery = useMemo(() => (db ? query(collection(db, "members"), orderBy("name")) : null), [db]);
  const { data: membersList, loading: membersLoading } = useCollection(membersQuery);

  const txQuery = useMemo(() => {
    if (!user?.displayName || !db) return null;
    return query(
      collection(db, "transactions"),
      where("memberName", "==", user.displayName)
    );
  }, [user?.displayName, db]);
  const { data: rawTransactions, loading: txLoading } = useCollection(txQuery);

  const myTransactions = useMemo(() => {
    if (!rawTransactions) return [];
    return [...rawTransactions].sort((a, b) => {
      const timeA = a.timestamp?.seconds || new Date(a.date).getTime() / 1000;
      const timeB = b.timestamp?.seconds || new Date(b.date).getTime() / 1000;
      return timeB - timeA;
    });
  }, [rawTransactions]);

  const lifetimeTotal = useMemo(() => {
    return myTransactions.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  }, [myTransactions]);

  const filteredTransactions = useMemo(() => {
    if (selectedSummaryMonth === "All") return myTransactions;
    return myTransactions.filter(t => {
      try {
        const parts = t.date.split('-');
        const monthNum = parseInt(parts[1], 10);
        return months[monthNum] === selectedSummaryMonth;
      } catch (e) { return false; }
    });
  }, [myTransactions, selectedSummaryMonth]);

  const monthlyTotal = useMemo(() => {
    return filteredTransactions.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  }, [filteredTransactions]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleStartAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;

    // Device Binding Check: Locks the phone to the first email used
    const boundUser = localStorage.getItem("mg_device_bound_user");
    if (boundUser && boundUser !== authData.email.toLowerCase()) {
      toast({ 
        variant: "destructive", 
        title: "অ্যাক্সেস ডিনাইড", 
        description: "এই ফোনটি অন্য একজন ইউজারের জন্য লক করা।" 
      });
      return;
    }

    if (isLogin) {
      setAuthLoading(true);
      try {
        await signInWithEmailAndPassword(auth, authData.email, authData.password);
        localStorage.setItem("mg_device_bound_user", authData.email.toLowerCase());
        toast({ title: "স্বাগতম!", description: "লগইন সফল হয়েছে।" });
      } catch (error: any) {
        toast({ variant: "destructive", title: "ত্রুটি", description: "ইমেইল বা পাসওয়ার্ড ভুল।" });
      } finally {
        setAuthLoading(false);
      }
    } else {
      if (!authData.fullName) {
        toast({ variant: "destructive", title: "ত্রুটি", description: "অফিসিয়াল নাম সিলেক্ট করুন।" });
        return;
      }
      
      setAuthLoading(true);
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(code);
      
      try {
        // Sending OTP via Web3Forms
        const response = await fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify({
            access_key: WEB3FORMS_ACCESS_KEY,
            subject: "Minar Go Registration OTP",
            name: "Minar Go Foundation",
            email: authData.email,
            message: `আপনার রেজিস্ট্রেশন ওটিপি কোডটি হলো: ${code}. এটি গোপনীয় রাখুন।`,
            from_name: "Minar Go Foundation"
          })
        });

        if (response.ok) {
          setAuthStep("otp-verify");
          toast({ title: "ওটিপি পাঠানো হয়েছে", description: "আপনার ইমেইল চেক করুন।" });
        } else {
          throw new Error("ওটিপি পাঠানো সম্ভব হয়নি।");
        }
      } catch (err: any) {
        toast({ variant: "destructive", title: "ত্রুটি", description: err.message });
      } finally {
        setAuthLoading(false);
      }
    }
  };

  const handleVerifyOtpAndRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;
    
    if (otpInput !== generatedOtp) {
      toast({ variant: "destructive", title: "ভুল ওটিপি", description: "সঠিক কোডটি প্রদান করুন।" });
      return;
    }

    setAuthLoading(true);
    try {
      const userCred = await createUserWithEmailAndPassword(auth, authData.email, authData.password);
      await updateProfile(userCred.user, { displayName: authData.fullName });
      localStorage.setItem("mg_device_bound_user", authData.email.toLowerCase());
      toast({ title: "রেজিস্ট্রেশন সফল!", description: "স্বাগতম, মেম্বার হিসেবে যুক্ত হয়েছেন।" });
    } catch (error: any) {
      toast({ variant: "destructive", title: "ত্রুটি", description: error.message });
      setAuthStep("login-register");
    } finally {
      setAuthLoading(false);
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
        category: "Mobile App Deposit",
        timestamp: serverTimestamp()
      });
      toast({ title: "সফল!", description: "জমা সম্পন্ন হয়েছে।" });
      setDepositAmount(5000);
      setActiveTab("home");
    } catch (e: any) {
      toast({ variant: "destructive", title: "ত্রুটি", description: "আবার চেষ্টা করুন।" });
    } finally {
      setMutationLoading(false);
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    if (!db || !id) return;
    if (confirm("আপনি কি এই জমার রেকর্ডটি ডিলিট করতে চান?")) {
      try {
        await deleteDoc(doc(db, "transactions", id));
        toast({ title: "সফল!", description: "রেকর্ডটি মুছে ফেলা হয়েছে।" });
      } catch (e) {
        toast({ variant: "destructive", title: "ত্রুটি", description: "ডিলিট করা সম্ভব হয়নি।" });
      }
    }
  };

  const handleDownloadPDF = () => {
    if (filteredTransactions.length === 0) {
      toast({ variant: "destructive", title: "দুঃখিত", description: "কোনো রেকর্ড পাওয়া যায়নি।" });
      return;
    }
    exportSummaryPDF(
      filteredTransactions.map(t => ({ n: t.memberName, d: t.date, a: t.amount })),
      `Report_${user?.displayName}_${selectedSummaryMonth}`,
      monthlyTotal
    );
  };

  if (userLoading || txLoading) {
    return (
      <div className="min-h-screen bg-[#1A1140] flex flex-col items-center justify-center gap-6">
        <title>MG Member</title>
        <div className="w-20 h-20 rounded-full border-4 border-white/5 border-t-[#D4AF37] animate-spin"></div>
        <p className="text-white font-black text-xs uppercase tracking-[0.3em] animate-pulse">Establishing Secure Node...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#1A1140] flex flex-col items-center justify-center p-4 font-body relative overflow-hidden">
        <title>MG Member - Access</title>
        <div className="absolute top-[-5%] right-[-5%] w-[300px] h-[300px] bg-white/5 rounded-full blur-[80px]"></div>
        
        <div className="w-full max-w-[400px] bg-white/95 backdrop-blur-3xl rounded-[45px] shadow-2xl border border-white/20 relative z-10">
          <div className="py-10 flex flex-col items-center text-center px-6">
            <div className="bg-white p-4 rounded-full shadow-lg border-2 border-blue-50 mb-5 w-24 h-24 flex items-center justify-center overflow-hidden">
              {settings?.logo ? (
                <img src={settings.logo} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <div className="w-14 h-14 bg-gradient-to-br from-[#1E3A8A] to-[#6366F1] rounded-full flex items-center justify-center shadow-inner">
                  <span className="text-white text-2xl font-black italic">MG</span>
                </div>
              )}
            </div>
            <h1 className="text-[18px] font-black text-[#1E3A8A] uppercase tracking-widest leading-none">
              {settings?.name || "MEMBER PORTAL"}
            </h1>
            <p className="text-[10px] text-slate-400 font-bold mt-2 uppercase tracking-[0.2em]">Official Secure Access</p>
          </div>

          <div className="px-8 pb-10">
            {authStep === "login-register" ? (
              <>
                <div className="flex bg-slate-100 p-1.5 rounded-[28px] mb-8 shadow-inner">
                  <button type="button" onClick={() => setIsLogin(true)} className={`flex-1 py-4 rounded-[24px] text-[11px] font-black uppercase transition-all duration-500 ${isLogin ? 'bg-[#1E3A8A] text-white shadow-lg' : 'text-slate-400'}`}>লগইন</button>
                  <button type="button" onClick={() => setIsLogin(false)} className={`flex-1 py-4 rounded-[24px] text-[11px] font-black uppercase transition-all duration-500 ${!isLogin ? 'bg-[#1E3A8A] text-white shadow-lg' : 'text-slate-400'}`}>রেজিস্ট্রেশন</button>
                </div>
                <form onSubmit={handleStartAuth} className="space-y-4">
                  {!isLogin && (
                    <div className="relative group">
                      <User className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 z-10" />
                      <Select onValueChange={(v) => setAuthData({ ...authData, fullName: v })}>
                        <SelectTrigger className="h-16 pl-16 rounded-[24px] bg-slate-50 border-none font-black text-sm text-[#1E3A8A]">
                          <SelectValue placeholder="আপনার অফিসিয়াল নাম" />
                        </SelectTrigger>
                        <SelectContent className="bg-white rounded-[24px] border-none shadow-2xl z-[500]">
                          {membersLoading ? <Loader2 className="animate-spin p-2" /> : membersList?.map((m: any) => (
                            <SelectItem key={m.id} value={m.name} className="font-black py-4 text-[#1E3A8A]">{m.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <div className="relative group">
                    <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input type="email" placeholder="ইমেইল অ্যাড্রেস" required value={authData.email} onChange={(e) => setAuthData({ ...authData, email: e.target.value })} className="h-16 pl-16 rounded-[24px] bg-slate-50 border-none font-black text-sm" />
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input type="password" placeholder="পাসওয়ার্ড" required value={authData.password} onChange={(e) => setAuthData({ ...authData, password: e.target.value })} className="h-16 pl-16 rounded-[24px] bg-slate-50 border-none font-black text-sm" />
                  </div>
                  <Button type="submit" disabled={authLoading} className="w-full h-16 rounded-[24px] bg-[#1E3A8A] text-white font-black text-xs uppercase tracking-widest shadow-xl mt-4">
                    {authLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isLogin ? "SECURE LOGIN" : "SEND OTP CODE")}
                  </Button>
                </form>
              </>
            ) : (
              <form onSubmit={handleVerifyOtpAndRegister} className="space-y-6 animate-in slide-in-from-right duration-500">
                <button type="button" onClick={() => setAuthStep("login-register")} className="flex items-center gap-2 text-[#1E3A8A] font-black text-xs uppercase mb-4">
                  <ChevronLeft className="w-4 h-4" /> ফিরে যান
                </button>
                <div className="text-center space-y-2 mb-6">
                  <h2 className="text-lg font-black text-[#1E3A8A] uppercase">ইমেইল ওটিপি কোড</h2>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">আমরা আপনার ইমেইলে একটি কোড পাঠিয়েছি</p>
                </div>
                <div className="relative">
                  <KeyRound className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input 
                    type="text" 
                    maxLength={6} 
                    placeholder="কোড দিন" 
                    required 
                    value={otpInput} 
                    onChange={(e) => setOtpInput(e.target.value)} 
                    className="h-20 pl-16 rounded-[24px] bg-slate-50 border-none font-black text-3xl tracking-[0.5em] text-center" 
                  />
                </div>
                <Button type="submit" disabled={authLoading} className="w-full h-16 rounded-[24px] bg-[#D4AF37] text-black font-black text-xs uppercase tracking-widest shadow-xl">
                  {authLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "ভেরিফাই এবং রেজিস্ট্রেশন"}
                </Button>
                <p className="text-center text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-4">স্প্যাম ফোল্ডার চেক করতে ভুলবেন না</p>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  const bengaliDate = new Intl.DateTimeFormat('bn-BD', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(currentTime);

  return (
    <div className="flex flex-col min-h-screen bg-[#1A1140] font-bengali text-white overflow-hidden">
      <title>MG Member - Dashboard</title>
      
      {activeTab === "home" && (
        <main className="flex-1 overflow-y-auto pb-32 animate-in fade-in duration-700">
          <div className="relative pt-16 pb-28 px-8 text-center border-b-[12px] border-[#D4AF37]/10">
            <button onClick={() => { if(auth) signOut(auth); }} className="absolute top-8 right-8 bg-white/5 p-3 rounded-full text-white/40">
              <LogOut className="w-5 h-5" />
            </button>
            <div className="flex justify-center mb-8">
              <div className="w-32 h-32 rounded-full border-[6px] border-[#D4AF37]/20 p-1 bg-white shadow-2xl overflow-hidden flex items-center justify-center">
                {settings?.logo ? <img src={settings.logo} alt="Logo" className="w-full h-full object-cover" /> : <span className="text-5xl text-[#1E3A8A] font-black italic">MG</span>}
              </div>
            </div>
            <h1 className="text-[#D4AF37] text-[11px] font-black uppercase tracking-[0.4em] mb-3">{settings?.name || "MINAR GO FOUNDATION"}</h1>
            <h2 className="text-4xl font-black tracking-tight">{user.displayName}</h2>
            <div className="flex items-center justify-center gap-2 mt-4 text-[#D4AF37]/50 text-[10px] font-bold uppercase tracking-[0.2em]">
              <ShieldCheck className="w-4 h-4" /> Device Linked & Secured
            </div>
          </div>
          <div className="px-6 space-y-6 -mt-12 relative z-20">
            <div className="bg-gradient-to-b from-[#2D1B69] to-[#1A1140] p-12 rounded-[45px] border border-white/10 text-center shadow-2xl">
              <p className="text-[#D4AF37]/70 text-[11px] font-black uppercase tracking-[0.3em] mb-3">সর্বমোট জমার পরিমাণ</p>
              <h3 className="text-5xl font-black">৳{lifetimeTotal.toLocaleString()}</h3>
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
              <HomeIcon className="w-6 h-6" /> {bengaliDate}
            </div>
          </div>
        </main>
      )}

      {activeTab === "add" && (
        <main className="flex-1 overflow-y-auto pb-32 px-6 pt-16">
          <div className="bg-[#2D1B69] p-12 rounded-[50px] shadow-2xl border-t-[10px] border-[#D4AF37]">
            <h3 className="text-center font-black text-2xl mb-12 uppercase tracking-[0.2em]">টাকা জমা দিন</h3>
            <form onSubmit={handleDeposit} className="space-y-10">
              <div className="space-y-3">
                <Label className="text-[#D4AF37] text-[11px] font-black uppercase tracking-[0.3em] ml-3">জমার পরিমাণ (TK)</Label>
                <Input type="number" value={depositAmount} onChange={(e)=>setDepositAmount(Number(e.target.value))} className="h-24 text-5xl font-black bg-white/5 border-none text-center rounded-[30px] text-white shadow-inner" />
              </div>
              <div className="space-y-3">
                <Label className="text-[#D4AF37] text-[11px] font-black uppercase tracking-[0.3em] ml-3">জমার তারিখ</Label>
                <Input type="date" value={depositDate} onChange={(e)=>setDepositDate(e.target.value)} className="h-18 font-black bg-white/5 border-none rounded-[25px] px-8 text-white text-lg shadow-inner" />
              </div>
              <Button type="submit" disabled={mutationLoading} className="w-full h-20 bg-gradient-to-r from-[#D4AF37] to-[#B8960C] text-black font-black text-xl rounded-[30px] shadow-xl mt-8">
                {mutationLoading ? <Loader2 className="w-7 h-7 animate-spin" /> : "সাবমিট করুন"}
              </Button>
            </form>
          </div>
        </main>
      )}

      {activeTab === "history" && (
        <main className="flex-1 overflow-y-auto pb-32 px-6 pt-16">
          <div className="flex items-center justify-between mb-8 px-2">
            <h2 className="font-black text-2xl flex items-center gap-4 uppercase tracking-tight">
              <History className="text-[#D4AF37] w-8 h-8" /> জমার রিপোর্ট
            </h2>
            <div className="flex gap-2">
               <Select value={selectedSummaryMonth} onValueChange={setSelectedSummaryMonth}>
                 <SelectTrigger className="w-32 h-12 bg-white/10 border-white/20 text-white font-black rounded-2xl text-[11px] uppercase tracking-widest">
                   <SelectValue placeholder="মাস" />
                 </SelectTrigger>
                 <SelectContent className="bg-[#2D1B69] border-white/10 shadow-2xl rounded-2xl z-[500]">
                   {months.map(m => (
                     <SelectItem key={m} value={m} className="font-black py-4 text-white uppercase text-xs focus:bg-white/10 focus:text-white">
                       {m}
                     </SelectItem>
                   ))}
                 </SelectContent>
               </Select>
               <Button onClick={handleDownloadPDF} variant="ghost" className="bg-[#D4AF37] text-black h-12 rounded-2xl gap-2 font-black px-5 shadow-lg active:scale-95 transition-all">
                  <Download className="w-5 h-5" /> PDF
                </Button>
            </div>
          </div>

          <div className="bg-gradient-to-b from-[#2D1B69] to-[#1A1140] p-12 rounded-[45px] border border-white/10 text-center shadow-2xl mb-10">
            <p className="text-[#D4AF37] text-[10px] font-black uppercase tracking-[0.3em] mb-3">
              {selectedSummaryMonth === "All" ? "মোট জমার পরিমাণ" : `${selectedSummaryMonth.toUpperCase()} মাসের মোট জমা`}
            </p>
            <h3 className="text-5xl font-black">৳{monthlyTotal.toLocaleString()}</h3>
          </div>
          
          <div className="space-y-5">
            {filteredTransactions.length === 0 ? (
              <div className="text-center py-20 opacity-20">
                <History className="w-20 h-20 mx-auto mb-4" />
                <p className="font-black text-xs uppercase tracking-widest">No Records Found</p>
              </div>
            ) : filteredTransactions.map((t: any) => (
              <div key={t.id} className="bg-white/5 p-8 rounded-[40px] flex items-center justify-between border border-white/5 shadow-2xl backdrop-blur-sm group hover:bg-white/10 transition-all">
                <div className="space-y-1">
                  <p className="font-black text-2xl text-[#D4AF37]">৳{t.amount.toLocaleString()}</p>
                  <p className="text-[11px] text-white/40 font-black uppercase tracking-widest">{t.date}</p>
                </div>
                <div className="flex flex-col items-end gap-3">
                  <div className="bg-[#D4AF37]/10 px-5 py-2.5 rounded-full border border-[#D4AF37]/20 flex items-center gap-2">
                    <div className="w-2 h-2 bg-[#D4AF37] rounded-full animate-pulse"></div>
                    <span className="text-[10px] font-black text-[#D4AF37] uppercase tracking-widest">VERIFIED</span>
                  </div>
                  <button 
                    onClick={() => handleDeleteTransaction(t.id)} 
                    className="p-3 bg-red-500/10 text-red-500 rounded-full hover:bg-red-500 hover:text-white transition-all shadow-lg active:scale-90"
                    title="Delete Entry"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </main>
      )}

      <nav className="fixed bottom-0 left-0 right-0 bg-[#2D1B69]/90 backdrop-blur-3xl h-28 px-10 flex items-center justify-between z-[100] rounded-t-[50px] border-t border-white/10 shadow-[0_-20px_50px_rgba(0,0,0,0.3)]">
        <button onClick={()=>setActiveTab("home")} className={cn("flex flex-col items-center gap-2", activeTab==="home" ? "text-[#D4AF37] scale-110" : "text-white/30")}>
          <HomeIcon className="w-8 h-8" /><span className="text-[10px] font-black uppercase tracking-tighter">HOME</span>
        </button>
        <button onClick={()=>setActiveTab("add")} className="relative -top-12">
          <div className={cn("w-20 h-20 rounded-full flex items-center justify-center border-[8px] border-[#1A1140] shadow-2xl transition-all", activeTab==="add" ? "bg-[#D4AF37] text-black" : "bg-[#2D1B69] text-white/40")}>
            <Plus className="w-10 h-10" />
          </div>
          <span className={cn("absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-black uppercase tracking-tighter", activeTab==="add" ? "text-[#D4AF37]" : "text-white/30")}>DEPOSIT</span>
        </button>
        <button onClick={()=>setActiveTab("history")} className={cn("flex flex-col items-center gap-2", activeTab==="history" ? "text-[#D4AF37] scale-110" : "text-white/30")}>
          <FileText className="w-8 h-8" /><span className="text-[10px] font-black uppercase tracking-tighter">REPORT</span>
        </button>
      </nav>
    </div>
  );
}
