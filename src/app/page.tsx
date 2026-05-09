"use client";

import { useState, useEffect, useMemo } from "react";
import { useUser, useAuth, useFirestore, useCollection, useDoc } from "@/firebase";
import { signOut, updateProfile, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { collection, query, where, addDoc, serverTimestamp, doc, orderBy, deleteDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { History, LogOut, Plus, Home as HomeIcon, FileText, Loader2, Download, Mail, Lock, User, Trash2, ShieldCheck, KeyRound, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { exportSummaryPDF } from "@/lib/pdf-utils";

const months = ["All", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const WEB3FORMS_ACCESS_KEY = "d3f7fc2b-eb65-4ff6-9679-d6282a18ee37";

export default function MemberPortal() {
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
  
  const [authData, setAuthData] = useState({ email: "", password: "", fullName: "" });
  const [otpInput, setOtpInput] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [depositAmount, setDepositAmount] = useState(5000);
  const [depositDate, setDepositDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedSummaryMonth, setSelectedSummaryMonth] = useState("All");
  
  const settingsRef = useMemo(() => (db ? doc(db, "settings", "foundation") : null), [db]);
  const { data: settings } = useDoc(settingsRef);

  const membersQuery = useMemo(() => (db ? query(collection(db, "members"), orderBy("name")) : null), [db]);
  const { data: membersList, loading: membersLoading } = useCollection(membersQuery);

  const txQuery = useMemo(() => {
    if (!user?.displayName || !db) return null;
    return query(collection(db, "transactions"), where("memberName", "==", user.displayName));
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

  const lifetimeTotal = useMemo(() => myTransactions.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0), [myTransactions]);

  const filteredTransactions = useMemo(() => {
    if (selectedSummaryMonth === "All") return myTransactions;
    return myTransactions.filter(t => {
      try {
        const dateObj = new Date(t.date);
        const monthIndex = dateObj.getMonth() + 1;
        return months[monthIndex] === selectedSummaryMonth;
      } catch (e) { return false; }
    });
  }, [myTransactions, selectedSummaryMonth]);

  const monthlyTotal = useMemo(() => filteredTransactions.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0), [filteredTransactions]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleStartAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;

    const boundUser = localStorage.getItem("mg_device_bound_user");
    if (boundUser && boundUser !== authData.email.toLowerCase()) {
      toast({ variant: "destructive", title: "Access Denied", description: "This device is locked to another user." });
      return;
    }

    if (isLogin) {
      setAuthLoading(true);
      try {
        await signInWithEmailAndPassword(auth, authData.email, authData.password);
        localStorage.setItem("mg_device_bound_user", authData.email.toLowerCase());
        toast({ title: "Welcome!", description: "Login successful." });
      } catch (error: any) {
        toast({ variant: "destructive", title: "Error", description: "Invalid email or password." });
      } finally {
        setAuthLoading(false);
      }
    } else {
      if (!authData.fullName) {
        toast({ variant: "destructive", title: "Error", description: "Please select your official name." });
        return;
      }
      setAuthLoading(true);
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(code);
      try {
        const response = await fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Accept": "application/json" },
          body: JSON.stringify({
            access_key: WEB3FORMS_ACCESS_KEY,
            subject: "Minar Go OTP Code",
            name: "Foundation",
            email: authData.email,
            message: `Your registration code is: ${code}`,
            from_name: "Minar Go"
          })
        });
        if (response.ok) {
          setAuthStep("otp-verify");
          toast({ title: "OTP Sent", description: "Please check your email inbox." });
        } else {
          throw new Error("Failed to send OTP.");
        }
      } catch (err: any) {
        toast({ variant: "destructive", title: "Error", description: err.message });
      } finally {
        setAuthLoading(false);
      }
    }
  };

  const handleVerifyAndRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;
    if (otpInput !== generatedOtp) {
      toast({ variant: "destructive", title: "Invalid OTP", description: "Correct code required." });
      return;
    }
    setAuthLoading(true);
    try {
      const userCred = await createUserWithEmailAndPassword(auth, authData.email, authData.password);
      await updateProfile(userCred.user, { displayName: authData.fullName });
      localStorage.setItem("mg_device_bound_user", authData.email.toLowerCase());
      toast({ title: "Success!", description: "Member registration complete." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
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
      toast({ title: "Success!", description: "Deposit submitted." });
      setDepositAmount(5000);
      setActiveTab("home");
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: "Please try again." });
    } finally {
      setMutationLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!db || !id) return;
    if (confirm("Delete this transaction?")) {
      try {
        await deleteDoc(doc(db, "transactions", id));
        toast({ title: "Deleted", description: "Record removed." });
      } catch (e) {
        toast({ variant: "destructive", title: "Error", description: "Delete failed." });
      }
    }
  };

  const handleDownloadPDF = () => {
    if (filteredTransactions.length === 0) return;
    exportSummaryPDF(
      filteredTransactions.map(t => ({ n: t.memberName, d: t.date, a: t.amount })),
      `Report_${user?.displayName}_${selectedSummaryMonth}`,
      monthlyTotal
    );
  };

  if (userLoading || txLoading) return <div className="min-h-screen bg-[#1A1140] flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-[#D4AF37]" /></div>;

  if (!user) {
    return (
      <div className="min-h-screen bg-[#1A1140] flex flex-col items-center justify-center p-4 font-body relative overflow-hidden">
        <div className="w-full max-w-[400px] bg-white/95 rounded-[45px] shadow-2xl p-8 relative z-10">
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto bg-[#1E3A8A] rounded-full flex items-center justify-center mb-4">
              <span className="text-white text-2xl font-black italic">MG</span>
            </div>
            <h1 className="text-xl font-black text-[#1E3A8A] uppercase tracking-widest">{settings?.name || "MEMBER PORTAL"}</h1>
          </div>
          <div className="flex bg-slate-100 p-1.5 rounded-[28px] mb-8">
            <button onClick={() => setIsLogin(true)} className={`flex-1 py-4 rounded-[24px] text-[11px] font-black uppercase transition-all ${isLogin ? 'bg-[#1E3A8A] text-white' : 'text-slate-400'}`}>লগইন</button>
            <button onClick={() => setIsLogin(false)} className={`flex-1 py-4 rounded-[24px] text-[11px] font-black uppercase transition-all ${!isLogin ? 'bg-[#1E3A8A] text-white' : 'text-slate-400'}`}>রেজিস্ট্রেশন</button>
          </div>
          {authStep === "login-register" ? (
            <form onSubmit={handleStartAuth} className="space-y-4">
              {!isLogin && (
                <Select onValueChange={(v) => setAuthData({ ...authData, fullName: v })}>
                  <SelectTrigger className="h-16 rounded-[24px] bg-slate-50 border-none font-black text-[#1E3A8A]">
                    <SelectValue placeholder="সিলেক্ট অফিসিয়াল নাম" />
                  </SelectTrigger>
                  <SelectContent className="bg-white rounded-[24px] z-[500]">
                    {membersList?.map((m: any) => <SelectItem key={m.id} value={m.name} className="font-black py-4">{m.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              )}
              <Input type="email" placeholder="ইমেইল" required value={authData.email} onChange={(e) => setAuthData({ ...authData, email: e.target.value })} className="h-16 rounded-[24px] bg-slate-50 border-none font-black" />
              <Input type="password" placeholder="পাসওয়ার্ড" required value={authData.password} onChange={(e) => setAuthData({ ...authData, password: e.target.value })} className="h-16 rounded-[24px] bg-slate-50 border-none font-black" />
              <Button type="submit" disabled={authLoading} className="w-full h-16 rounded-[24px] bg-[#1E3A8A] text-white font-black uppercase tracking-widest">
                {authLoading ? <Loader2 className="animate-spin" /> : (isLogin ? "LOGIN" : "SEND OTP")}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyAndRegister} className="space-y-6">
              <button type="button" onClick={() => setAuthStep("login-register")} className="flex items-center gap-2 text-[#1E3A8A] font-black text-xs uppercase"><ChevronLeft className="w-4 h-4" /> ব্যাক</button>
              <Input type="text" maxLength={6} placeholder="কোড" required value={otpInput} onChange={(e) => setOtpInput(e.target.value)} className="h-20 rounded-[24px] bg-slate-50 border-none font-black text-3xl text-center tracking-[0.5em]" />
              <Button type="submit" disabled={authLoading} className="w-full h-16 rounded-[24px] bg-[#D4AF37] text-black font-black uppercase tracking-widest">
                {authLoading ? <Loader2 className="animate-spin" /> : "ভেরিফাই এবং রেজিস্ট্রেশন"}
              </Button>
            </form>
          )}
        </div>
      </div>
    );
  }

  const bengaliDate = new Intl.DateTimeFormat('bn-BD', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(currentTime);

  return (
    <div className="flex flex-col min-h-screen bg-[#1A1140] font-bengali text-white">
      {activeTab === "home" && (
        <main className="flex-1 pb-32 pt-16 px-8 animate-in fade-in duration-700">
          <div className="relative text-center mb-12">
            <button onClick={() => { if(auth) signOut(auth); }} className="absolute -top-4 right-0 p-3 bg-white/5 rounded-full"><LogOut className="w-5 h-5" /></button>
            <div className="w-32 h-32 mx-auto rounded-full bg-white flex items-center justify-center mb-6 overflow-hidden">
              {settings?.logo ? <img src={settings.logo} className="w-full h-full object-cover" /> : <span className="text-4xl text-[#1E3A8A] font-black italic">MG</span>}
            </div>
            <h1 className="text-[#D4AF37] text-[10px] font-black uppercase tracking-widest mb-2">{settings?.name || "MINAR GO FOUNDATION"}</h1>
            <h2 className="text-3xl font-black">{user.displayName}</h2>
          </div>
          <div className="bg-gradient-to-b from-[#2D1B69] to-[#1A1140] p-10 rounded-[45px] border border-white/10 text-center mb-6">
            <p className="text-[#D4AF37]/70 text-[10px] font-black uppercase mb-2">সর্বমোট জমার পরিমাণ</p>
            <h3 className="text-5xl font-black">৳{lifetimeTotal.toLocaleString()}</h3>
          </div>
          <div className="bg-orange-500 p-5 rounded-full text-black text-center font-black text-sm">{bengaliDate}</div>
        </main>
      )}

      {activeTab === "add" && (
        <main className="flex-1 pb-32 px-6 pt-16">
          <div className="bg-[#2D1B69] p-10 rounded-[50px] shadow-2xl border-t-[10px] border-[#D4AF37]">
            <h3 className="text-center font-black text-2xl mb-10 uppercase">টাকা জমা দিন</h3>
            <form onSubmit={handleDeposit} className="space-y-8">
              <Input type="number" value={depositAmount} onChange={(e)=>setDepositAmount(Number(e.target.value))} className="h-20 text-4xl font-black bg-white/5 border-none text-center rounded-[30px] text-white" />
              <Input type="date" value={depositDate} onChange={(e)=>setDepositDate(e.target.value)} className="h-16 font-black bg-white/5 border-none rounded-[25px] px-8 text-white text-lg" />
              <Button type="submit" disabled={mutationLoading} className="w-full h-20 bg-[#D4AF37] text-black font-black text-xl rounded-[30px]">
                {mutationLoading ? <Loader2 className="animate-spin" /> : "সাবমিট করুন"}
              </Button>
            </form>
          </div>
        </main>
      )}

      {activeTab === "history" && (
        <main className="flex-1 pb-32 px-6 pt-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-black text-xl flex items-center gap-2"><History className="text-[#D4AF37]" /> রিপোর্ট</h2>
            <div className="flex gap-2">
              <Select value={selectedSummaryMonth} onValueChange={setSelectedSummaryMonth}>
                <SelectTrigger className="w-32 h-12 bg-white/10 border-white/20 text-white font-black rounded-2xl">
                  <SelectValue placeholder="Month" />
                </SelectTrigger>
                <SelectContent className="bg-[#2D1B69] border-white/10 z-[500]">
                  {months.map(m => <SelectItem key={m} value={m} className="font-black text-white py-4 uppercase text-xs">{m}</SelectItem>)}
                </SelectContent>
              </Select>
              <Button onClick={handleDownloadPDF} variant="ghost" className="bg-[#D4AF37] text-black h-12 rounded-2xl font-black px-5"><Download className="w-5 h-5" /></Button>
            </div>
          </div>
          <div className="bg-[#2D1B69] p-8 rounded-[40px] text-center mb-8 border border-white/10">
            <p className="text-[#D4AF37] text-[10px] font-black uppercase mb-1">মোট জমা ({selectedSummaryMonth})</p>
            <h3 className="text-4xl font-black">৳{monthlyTotal.toLocaleString()}</h3>
          </div>
          <div className="space-y-4">
            {filteredTransactions.map((t: any) => (
              <div key={t.id} className="bg-white/5 p-6 rounded-[30px] flex items-center justify-between border border-white/5">
                <div>
                  <p className="font-black text-2xl text-[#D4AF37]">৳{t.amount.toLocaleString()}</p>
                  <p className="text-[10px] text-white/40 font-black uppercase">{t.date}</p>
                </div>
                <button onClick={() => handleDelete(t.id)} className="p-3 bg-red-500/10 text-red-500 rounded-full"><Trash2 className="w-5 h-5" /></button>
              </div>
            ))}
          </div>
        </main>
      )}

      <nav className="fixed bottom-0 left-0 right-0 bg-[#2D1B69]/90 backdrop-blur-3xl h-28 px-10 flex items-center justify-between z-[100] rounded-t-[50px] border-t border-white/10">
        <button onClick={()=>setActiveTab("home")} className={cn("flex flex-col items-center gap-2", activeTab==="home" ? "text-[#D4AF37]" : "text-white/30")}><HomeIcon className="w-8 h-8" /><span className="text-[10px] font-black uppercase">HOME</span></button>
        <button onClick={()=>setActiveTab("add")} className="relative -top-12"><div className={cn("w-20 h-20 rounded-full flex items-center justify-center border-[8px] border-[#1A1140] shadow-2xl", activeTab==="add" ? "bg-[#D4AF37] text-black" : "bg-[#2D1B69] text-white/40")}><Plus className="w-10 h-10" /></div></button>
        <button onClick={()=>setActiveTab("history")} className={cn("flex flex-col items-center gap-2", activeTab==="history" ? "text-[#D4AF37]" : "text-white/30")}><FileText className="w-8 h-8" /><span className="text-[10px] font-black uppercase">REPORT</span></button>
      </nav>
    </div>
  );
}