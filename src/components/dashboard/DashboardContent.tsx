"use client";

import { useState, useEffect, useRef } from "react";
import { useMinarData } from "@/hooks/use-minar-data";
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
  
  const prevTransactionsCount = useRef(transactions.length);
  const isInitialLoad = useRef(true);

  useEffect(() => {
    if (isInitialLoad.current && transactions.length > 0) {
      isInitialLoad.current = false;
      prevTransactionsCount.current = transactions.length;
      return;
    }

    if (!isInitialLoad.current && transactions.length > prevTransactionsCount.current) {
      const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3");
      audio.play().catch(e => console.log("Audio play failed", e));

      toast({
        title: "🔔 নতুন জমা পাওয়া গেছে!",
        description: `সফলভাবে ডাটা আপডেট হয়েছে।`,
        className: "bg-[#002366] text-white border-none shadow-2xl rounded-2xl",
      });
    }
    prevTransactionsCount.current = transactions.length;
  }, [transactions, toast]);

  const filteredTransactions = transactions.filter(t => {
    if (selectedMonth === "All") return true;
    const date = new Date(t.d);
    const month = date.toLocaleString('en-US', { month: 'long' });
    return month === selectedMonth;
  });

  const totalCollection = filteredTransactions.reduce((acc, curr) => acc + curr.a, 0);

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deposit.member) return toast({ variant: "destructive", title: "ত্রুটি", description: "মেম্বার সিলেক্ট করুন" });
    addTransaction(deposit.member, deposit.amount, deposit.date, deposit.category);
    setDeposit({...deposit, member: "", amount: 5000, category: "প্রতি মাসের জমা", date: new Date().toISOString().split('T')[0]});
    setActiveTab("home");
    toast({ title: "সফল!", description: "ডিপোজিট সেভ হয়েছে।" });
  };

  return (
    <div className="flex flex-col h-screen bg-[#F8FAFC] overflow-hidden">
      <main className="flex-1 overflow-y-auto pb-24">
        <div className="max-w-[480px] mx-auto px-4 pt-4 space-y-4">
          
          {activeTab === "home" && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 space-y-4">
              <div className="luxury-card p-6 relative overflow-hidden blue-gold-card text-white border-none">
                 <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-white/60 text-[9px] font-black uppercase tracking-widest mb-1">Portfolio Summary</p>
                      <h1 className="text-xl font-black">Collection Overview</h1>
                    </div>
                    <div className="bg-white/10 p-2 rounded-full">
                      <Bell className="w-4 h-4 text-accent" />
                    </div>
                 </div>
                 
                 <div className="flex justify-between items-end">
                    <div className="space-y-1">
                      <p className="text-[9px] font-bold text-white/50 uppercase">Total Balance</p>
                      <h2 className="text-2xl font-black text-white">৳{totalCollection.toLocaleString()}</h2>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="text-[9px] font-bold text-white/50 uppercase">Active Members</p>
                      <h2 className="text-2xl font-black text-accent">{members.length}</h2>
                    </div>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setActiveTab("members")} className="luxury-card p-4 flex flex-col items-start active:scale-95 transition-transform">
                  <BookOpen className="w-5 h-5 text-primary mb-2" />
                  <h3 className="text-[13px] font-black text-[#002366]">Members</h3>
                  <p className="text-slate-400 text-[9px]">{members.length} registered</p>
                </button>
                <button onClick={() => setActiveTab("gallery")} className="luxury-card p-4 flex flex-col items-start active:scale-95 transition-transform">
                  <ClipboardList className="w-5 h-5 text-primary mb-2" />
                  <h3 className="text-[13px] font-black text-[#002366]">Gallery</h3>
                  <p className="text-slate-400 text-[9px]">Photo Storage</p>
                </button>
              </div>

              <button 
                onClick={() => setActiveTab("settings")}
                className="w-full bg-[#002366] rounded-[20px] p-4 flex items-center justify-between text-white active:scale-[0.98] transition-all shadow-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-white/10 p-2 rounded-lg">
                    <FileText className="w-5 h-5 text-accent" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-[12px] font-black">Demand Letter Generator</h3>
                    <p className="text-white/40 text-[8px] font-bold uppercase tracking-wider">Official Documents</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-white/30" />
              </button>

              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between px-1">
                  <h4 className="font-black text-[#002366] text-[10px] uppercase tracking-wider">Monthly Logs</h4>
                  <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                    <SelectTrigger className="w-28 bg-white border border-slate-100 shadow-sm rounded-xl text-[10px] font-black h-8 text-[#002366]">
                      <SelectValue placeholder="All Months" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-none shadow-2xl z-[1000]">
                      <SelectItem value="All" className="text-[11px] font-black">All Time</SelectItem>
                      {months.map(m => <SelectItem key={m} value={m} className="text-[11px] font-black">{m}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  {filteredTransactions.map(t => (
                    <div key={t.id} className="luxury-card p-3 flex items-center justify-between border-slate-50">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center font-black text-primary text-[11px]">{t.n.charAt(0)}</div>
                        <div>
                          <p className="font-bold text-slate-800 text-[12px]">{t.n}</p>
                          <p className="text-[8px] text-slate-400 font-medium">{t.d} • {t.c}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <p className="font-black text-[#002366] text-[12px]">৳{t.a.toLocaleString()}</p>
                        <button onClick={() => { if(confirm('ডিলিট করতে চান?')) deleteTransaction(t.id); }} className="p-1.5 text-slate-200 hover:text-red-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                  ))}
                </div>
                <Button 
                  className="w-full h-10 bg-white text-primary border-2 border-accent/20 font-black text-[10px] rounded-xl hover:bg-accent hover:text-white transition-all" 
                  onClick={() => exportSummaryPDF(filteredTransactions, selectedMonth, totalCollection)}
                >
                  <Download className="w-3.5 h-3.5 mr-2" /> Export Summary PDF
                </Button>
              </div>
            </div>
          )}

          {activeTab === "members" && (
            <div className="animate-in fade-in slide-in-from-right-2 duration-300 space-y-4">
               <div className="flex items-center gap-3"><Button variant="ghost" size="sm" onClick={() => setActiveTab("home")} className="p-0 h-7 w-7 rounded-full bg-white"><ChevronRight className="rotate-180 w-4 h-4" /></Button><h2 className="font-black text-[#002366] text-sm">Members Management</h2></div>
               <div className="luxury-card p-4">
                  <div className="flex gap-2 mb-4"><Input placeholder="Enter Member Name" value={newMember} onChange={e=>setNewMember(e.target.value)} className="h-10 border-slate-100 text-sm" /><Button onClick={()=>{if(newMember)addMember(newMember);setNewMember("")}} className="bg-primary hover:bg-primary/90 h-10 px-4 rounded-xl font-black text-xs">ADD</Button></div>
                  <div className="space-y-2">{members.map(m=><div key={m} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl"><span className="font-bold text-[12px] text-slate-700">{m}</span><button onClick={()=>deleteMember(m)} className="p-1.5 text-slate-300 hover:text-red-500"><Trash2 className="w-3.5 h-3.5"/></button></div>)}</div>
               </div>
            </div>
          )}

          {activeTab === "add" && (
            <div className="animate-in fade-in zoom-in-95 duration-300">
               <div className="luxury-card p-6 shadow-xl border-t-4 border-accent">
                  <h3 className="text-center font-black text-[#002366] text-md mb-6 uppercase tracking-wider">New Member Deposit</h3>
                  <form onSubmit={handleDeposit} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label className="text-[9px] font-bold text-slate-400 uppercase px-1">Select Member</Label>
                      <Select onValueChange={v=>setDeposit({...deposit, member:v})}>
                        <SelectTrigger className="h-12 font-black text-[#002366] rounded-xl border-slate-100"><SelectValue placeholder="Choose a member"/></SelectTrigger>
                        <SelectContent className="bg-white z-[1000]">{members.map(m=><SelectItem key={m} value={m} className="font-black">{m}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[9px] font-bold text-slate-400 uppercase px-1">Amount (TK)</Label>
                      <Input type="number" value={deposit.amount} onChange={e=>setDeposit({...deposit, amount:Number(e.target.value)})} className="h-12 text-md border-slate-100" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[9px] font-bold text-slate-400 uppercase px-1">Date</Label>
                      <Input type="date" value={deposit.date} onChange={e=>setDeposit({...deposit, date:e.target.value})} className="h-12 border-slate-100" />
                    </div>
                    <Button type="submit" className="w-full h-12 bg-primary hover:bg-primary/90 text-white text-sm font-black shadow-lg mt-2 rounded-xl">SAVE TRANSACTION</Button>
                  </form>
               </div>
            </div>
          )}

          {activeTab === "gallery" && <DocumentStorage />}
          {activeTab === "settings" && <DemandLetterGenerator />}
        </div>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white h-20 px-8 flex items-center justify-between z-[100] nav-shadow rounded-t-[32px] border-t border-slate-50">
        <button onClick={() => setActiveTab("home")} className={cn("flex flex-col items-center gap-1.5", activeTab === "home" ? "text-primary" : "text-slate-300")}><Home className="w-5 h-5"/><span className="text-[8px] font-black uppercase">Dashboard</span></button>
        <button onClick={() => setActiveTab("members")} className={cn("flex flex-col items-center gap-1.5", activeTab === "members" ? "text-primary" : "text-slate-300")}><Users className="w-5 h-5"/><span className="text-[8px] font-black uppercase">Members</span></button>
        <div className="relative -top-8"><button onClick={() => setActiveTab("add")} className="w-14 h-14 bg-primary rounded-full flex items-center justify-center text-white shadow-xl border-[6px] border-[#F8FAFC] active:scale-90 transition-transform"><Plus className="w-7 h-7"/></button></div>
        <button onClick={() => setActiveTab("gallery")} className={cn("flex flex-col items-center gap-1.5", activeTab === "gallery" ? "text-primary" : "text-slate-300")}><ImageIcon className="w-5 h-5"/><span className="text-[8px] font-black uppercase">Gallery</span></button>
        <div className="flex flex-col items-center gap-1.5 text-slate-800"><div className="w-5 h-5 rounded-full bg-[#002366] text-white flex items-center justify-center text-[8px] font-black">N</div><span className="text-[8px] font-black uppercase">Profile</span></div>
      </nav>
    </div>
  );
}