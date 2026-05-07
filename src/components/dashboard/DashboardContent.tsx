
"use client";

import { useState, useEffect, useRef } from "react";
import { useMinarData } from "@/hooks/use-minar-data";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  Trash2, 
  Download,
  Plus,
  Home,
  Image as ImageIcon,
  Settings as SettingsIcon,
  ChevronRight,
  BookOpen,
  ClipboardList,
  FileText,
  Bell
} from "lucide-react";
import { exportSummaryPDF } from "@/lib/pdf-utils";
import DemandLetterGenerator from "./DemandLetterGenerator";
import DocumentStorage from "./DocumentStorage";
import { cn } from "@/lib/utils";

const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export default function DashboardContent() {
  const { members, transactions, addMember, deleteMember, addTransaction, deleteTransaction } = useMinarData();
  const [activeTab, setActiveTab] = useState("home");
  const [selectedMonth, setSelectedMonth] = useState("All");
  const [newMember, setNewMember] = useState("");
  const [deposit, setDeposit] = useState({ member: "", amount: 5000, category: "প্রতি মাসের জমা", date: new Date().toISOString().split('T')[0] });
  const { toast } = useToast();
  
  // রিয়েল-টাইম নোটিফিকেশন ট্র্যাকিং
  const prevTransactionsCount = useRef(transactions.length);
  const isInitialLoad = useRef(true);

  useEffect(() => {
    // প্রথমবার লোড হওয়ার সময় নোটিফিকেশন বন্ধ রাখা
    if (isInitialLoad.current && transactions.length > 0) {
      isInitialLoad.current = false;
      prevTransactionsCount.current = transactions.length;
      return;
    }

    // যদি নতুন কোনো ট্রানজ্যাকশন যোগ হয়
    if (!isInitialLoad.current && transactions.length > prevTransactionsCount.current) {
      const latestTx = transactions[0]; // যেহেতু ডেসেন্ডিং অর্ডারে আছে, প্রথমটিই লেটেস্ট
      
      // সাউন্ড অ্যালার্ট (Beep Sound)
      const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3");
      audio.play().catch(e => console.log("Audio play failed", e));

      // ফেসবুকের মতো নোটিফিকেশন
      toast({
        title: "🔔 নতুন জমা (New Deposit!)",
        description: `${latestTx.n} জমা দিয়েছেন ৳${latestTx.a.toLocaleString()}`,
        duration: 5000,
      });

      // ব্রাউজার পুশ নোটিফিকেশন (যদি পারমিশন থাকে)
      if (Notification.permission === "granted") {
        new Notification("Minar Go Foundation", {
          body: `${latestTx.n} জমা দিয়েছেন ৳${latestTx.a.toLocaleString()}`,
          icon: "/favicon.ico"
        });
      }
    }
    prevTransactionsCount.current = transactions.length;
  }, [transactions, toast]);

  // নোটিফিকেশন পারমিশন রিকোয়েস্ট
  useEffect(() => {
    if (Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  const filteredTransactions = transactions.filter(t => {
    if (selectedMonth === "All") return true;
    if (!t.d) return false;
    const date = new Date(t.d);
    if (isNaN(date.getTime())) return false;
    const month = date.toLocaleString('en-US', { month: 'long' });
    return month === selectedMonth;
  });

  const totalCollection = filteredTransactions.reduce((acc, curr) => acc + curr.a, 0);

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deposit.member) return toast({ variant: "destructive", title: "ত্রুটি", description: "মেম্বার সিলেক্ট করুন" });
    await addTransaction(deposit.member, deposit.amount, deposit.date, deposit.category);
    setDeposit({...deposit, member: "", amount: 5000, category: "প্রতি মাসের জমা", date: new Date().toISOString().split('T')[0]});
    setActiveTab("home");
    toast({ title: "সফল!", description: "ডিপোজিট সেভ হয়েছে।" });
  };

  const handleDeleteTransaction = async (id: string) => {
    if (confirm("এই জমার তথ্যটি কি নিশ্চিতভাবে মুছে ফেলতে চান?")) {
      await deleteTransaction(id);
      toast({ title: "মুছে ফেলা হয়েছে", description: "ট্রানজ্যাকশনটি সফলভাবে ডিলিট করা হয়েছে।" });
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#F8FAFC] overflow-hidden">
      <main className="flex-1 overflow-y-auto pb-28">
        <div className="max-w-[450px] mx-auto px-4 pt-4 space-y-4">
          
          {activeTab === "home" && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-4">
              <div className="bg-white border border-slate-100 rounded-[24px] p-5 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gold-gradient opacity-10 rounded-bl-[100px]"></div>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-slate-400 text-[8px] font-black uppercase tracking-widest mb-1">Portfolio Summary</p>
                    <h1 className="text-lg font-black text-primary leading-tight">Collection Overview</h1>
                  </div>
                  <div className="bg-primary/5 p-2 rounded-full">
                    <Bell className="w-4 h-4 text-accent animate-pulse" />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-5">
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase">Total Balance</p>
                    <p className="text-xl font-black text-primary">৳{totalCollection.toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-bold text-slate-400 uppercase">Active Members</p>
                    <p className="text-xl font-black text-accent">{members.length}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setActiveTab("members")}
                  className="bg-white border border-slate-100 rounded-[20px] p-4 flex flex-col items-start active:scale-95 transition-transform shadow-sm"
                >
                  <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center mb-2">
                    <BookOpen className="w-4 h-4 text-accent" />
                  </div>
                  <h3 className="text-[12px] font-black text-primary">Members</h3>
                  <p className="text-slate-400 text-[8px]">{members.length} registered</p>
                </button>

                <button 
                  onClick={() => setActiveTab("gallery")}
                  className="bg-white border border-slate-100 rounded-[20px] p-4 flex flex-col items-start active:scale-95 transition-transform shadow-sm"
                >
                  <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center mb-2">
                    <ClipboardList className="w-4 h-4 text-accent" />
                  </div>
                  <h3 className="text-[12px] font-black text-primary">Gallery</h3>
                  <p className="text-slate-400 text-[8px]">Photo Storage</p>
                </button>

                <button 
                  onClick={() => setActiveTab("settings")}
                  className="col-span-2 bg-primary rounded-[20px] p-4 text-white flex items-center justify-between active:scale-95 transition-transform shadow-md"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
                      <FileText className="w-4 h-4 text-accent" />
                    </div>
                    <div>
                      <h3 className="text-[12px] font-black">Demand Letter Generator</h3>
                      <p className="text-white/50 text-[8px]">Official Documents</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 opacity-30" />
                </button>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between px-1">
                  <h4 className="font-black text-primary text-[10px] uppercase tracking-wider">Monthly Logs</h4>
                  <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                    <SelectTrigger className="w-28 bg-white border border-slate-200 shadow-sm rounded-xl text-[10px] font-black h-8">
                      <SelectValue placeholder="All Months" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-slate-200 shadow-2xl z-[1000] popover-content">
                      <SelectItem value="All" className="text-[11px] font-black">All Time</SelectItem>
                      {months.map(m => <SelectItem key={m} value={m} className="text-[11px] font-black">{m}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  {filteredTransactions.length === 0 ? (
                    <div className="py-12 text-center luxury-card border-dashed">
                      <p className="text-slate-300 italic text-[10px]">No logs found for {selectedMonth}</p>
                    </div>
                  ) : (
                    filteredTransactions.map(t => (
                      <div key={t.id} className="luxury-card p-3 flex items-center justify-between active:bg-slate-50 transition-colors group">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center font-black text-accent text-[11px]">
                            {t.n.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 text-[11px]">{t.n}</p>
                            <p className="text-[8px] text-slate-400 font-medium">{t.d}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="font-black text-primary text-[11px]">৳{t.a.toLocaleString()}</p>
                            <p className="text-[7px] text-accent font-bold uppercase tracking-tighter">{t.c}</p>
                          </div>
                          <button 
                            onClick={() => handleDeleteTransaction(t.id)}
                            className="text-slate-300 hover:text-red-500 transition-colors p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                  {filteredTransactions.length > 0 && (
                    <Button 
                      variant="ghost" 
                      className="w-full h-10 text-primary font-black text-[10px] uppercase border border-slate-100 mt-2" 
                      onClick={() => exportSummaryPDF(filteredTransactions, `${selectedMonth} Report`, totalCollection)}
                    >
                      <Download className="w-3.5 h-3.5 mr-2" /> Export Report
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "members" && (
            <div className="animate-in fade-in slide-in-from-right-2 duration-300 space-y-4">
              <div className="flex items-center gap-3 px-1">
                <Button variant="ghost" size="sm" onClick={() => setActiveTab("home")} className="p-0 h-8 w-8 rounded-full bg-white border border-slate-100 shadow-sm">
                  <ChevronRight className="w-4 h-4 rotate-180 text-primary" />
                </Button>
                <h2 className="text-base font-black text-primary">Member Management</h2>
              </div>
              <div className="luxury-card p-5">
                <div className="flex gap-2 mb-6">
                  <Input placeholder="Member Full Name" value={newMember} onChange={(e) => setNewMember(e.target.value)} className="rounded-xl h-11 text-xs font-black" />
                  <Button onClick={() => { if(newMember) addMember(newMember); setNewMember(""); }} className="gold-gradient rounded-xl px-5 h-11 text-xs font-black shadow-md">ADD</Button>
                </div>
                <div className="space-y-2 max-h-[450px] overflow-y-auto pr-1">
                  {members.map(m => (
                    <div key={m} className="flex items-center justify-between bg-slate-50 border border-slate-100 p-4 rounded-xl">
                      <span className="font-black text-slate-700 text-xs">{m}</span>
                      <button onClick={() => { if(confirm('সদস্যকে মুছে ফেলতে চান?')) deleteMember(m); }} className="text-slate-300 hover:text-red-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "add" && (
            <div className="animate-in fade-in zoom-in-95 duration-300">
              <div className="luxury-card overflow-hidden shadow-lg border-gold-gradient/10 border">
                <div className="gold-gradient p-5 text-white text-center">
                  <h3 className="text-lg font-black uppercase tracking-widest">New Deposit</h3>
                  <p className="text-white/60 text-[9px] font-bold mt-1">জমার তথ্য পূরণ করুন</p>
                </div>
                <CardContent className="p-5 space-y-5">
                  <form onSubmit={handleDeposit} className="space-y-5">
                    <div className="space-y-1.5">
                      <Label className="font-black ml-1 text-slate-400 text-[8px] uppercase tracking-widest">Select Member</Label>
                      <Select onValueChange={(v) => setDeposit({...deposit, member: v})}>
                        <SelectTrigger className="h-11 rounded-xl bg-slate-50 border-slate-200 font-black text-xs text-slate-900">
                          <SelectValue placeholder="মেম্বার নির্বাচন করুন" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border border-slate-200 shadow-2xl z-[1000] max-h-[250px] popover-content">
                          {members.map(m => <SelectItem key={m} value={m} className="text-xs font-black text-primary">{m}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="font-black ml-1 text-slate-400 text-[8px] uppercase tracking-widest">Category</Label>
                      <Select value={deposit.category} onValueChange={(v) => setDeposit({...deposit, category: v})}>
                        <SelectTrigger className="h-11 rounded-xl bg-slate-50 border-slate-200 font-black text-xs text-slate-900">
                          <SelectValue placeholder="ক্যাটাগরি" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border border-slate-200 shadow-2xl z-[1000] popover-content">
                          <SelectItem value="প্রতি মাসের জমা" className="text-xs font-black">প্রতি মাসের জমা</SelectItem>
                          <SelectItem value="যাকাত" className="text-xs font-black">যাকাত</SelectItem>
                          <SelectItem value="বিশেষ অনুদান" className="text-xs font-black">বিশেষ অনুদান</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="font-black ml-1 text-slate-400 text-[8px] uppercase tracking-widest">Amount (TK)</Label>
                        <Input type="number" value={deposit.amount} onChange={(e) => setDeposit({...deposit, amount: Number(e.target.value)})} className="h-11 rounded-xl text-xs font-black" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="font-black ml-1 text-slate-400 text-[8px] uppercase tracking-widest">Deposit Date</Label>
                        <Input type="date" value={deposit.date} onChange={(e) => setDeposit({...deposit, date: e.target.value})} className="h-11 rounded-xl text-[10px] font-black" />
                      </div>
                    </div>
                    <Button className="w-full h-13 rounded-xl gold-gradient text-white font-black text-sm shadow-xl active:scale-95 transition-all mt-4 uppercase tracking-widest">
                      SAVE TRANSACTION
                    </Button>
                  </form>
                </CardContent>
              </div>
            </div>
          )}

          {activeTab === "gallery" && <div className="animate-in fade-in slide-in-from-left-2 duration-300"><DocumentStorage /></div>}
          {activeTab === "settings" && <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-4"><DemandLetterGenerator /></div>}
        </div>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white h-20 px-6 flex items-center justify-between z-[100] nav-shadow rounded-t-[28px] border-t border-slate-50">
        <button 
          onClick={() => setActiveTab("home")} 
          className={cn("flex flex-col items-center gap-1.5 transition-all", activeTab === "home" ? "text-primary scale-110" : "text-slate-300")}
        >
          <Home className={cn("w-5 h-5", activeTab === "home" && "fill-primary/5 text-primary")} />
          <span className="text-[7px] font-black uppercase tracking-tighter">Dashboard</span>
        </button>

        <button 
          onClick={() => setActiveTab("members")} 
          className={cn("flex flex-col items-center gap-1.5 transition-all", activeTab === "members" ? "text-primary scale-110" : "text-slate-300")}
        >
          <Users className={cn("w-5 h-5", activeTab === "members" && "fill-primary/5 text-primary")} />
          <span className="text-[7px] font-black uppercase tracking-tighter">Members</span>
        </button>

        <div className="relative -top-8">
          <button 
            onClick={() => setActiveTab("add")} 
            className="w-14 h-14 gold-gradient rounded-full flex items-center justify-center text-white shadow-[0_10px_30px_rgba(212,175,55,0.4)] border-[6px] border-[#F8FAFC] active:scale-90 transition-transform"
          >
            <Plus className="w-8 h-8 font-black" />
          </button>
        </div>

        <button 
          onClick={() => setActiveTab("gallery")} 
          className={cn("flex flex-col items-center gap-1.5 transition-all", activeTab === "gallery" ? "text-primary scale-110" : "text-slate-300")}
        >
          <ImageIcon className={cn("w-5 h-5", activeTab === "gallery" && "fill-primary/5 text-primary")} />
          <span className="text-[7px] font-black uppercase tracking-tighter">Gallery</span>
        </button>

        <button 
          onClick={() => setActiveTab("settings")} 
          className={cn("flex flex-col items-center gap-1.5 transition-all", activeTab === "settings" ? "text-primary scale-110" : "text-slate-300")}
        >
          <SettingsIcon className={cn("w-5 h-5", activeTab === "settings" && "fill-primary/5 text-primary")} />
          <span className="text-[7px] font-black uppercase tracking-tighter">Menu</span>
        </button>
      </nav>
    </div>
  );
}
