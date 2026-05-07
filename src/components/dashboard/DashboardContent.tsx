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
        title: "🔔 নতুন জমা (New Deposit!)",
        description: `নতুন জমা পাওয়া গেছে।`,
        className: "bg-blue-600 text-white border-none shadow-2xl rounded-2xl",
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
      <main className="flex-1 overflow-y-auto pb-28">
        <div className="max-w-[450px] mx-auto px-4 pt-6 space-y-6">
          
          {activeTab === "home" && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 space-y-6">
              <div className="luxury-card p-8 relative overflow-hidden bg-blue-600 text-white border-none">
                 <div className="flex justify-between items-start mb-6">
                    <div>
                      <p className="text-white/60 text-[10px] font-black uppercase tracking-widest mb-1">Portfolio Summary</p>
                      <h1 className="text-2xl font-black">Collection Overview</h1>
                    </div>
                    <div className="bg-white/10 p-2.5 rounded-full">
                      <Bell className="w-5 h-5 text-white/50" />
                    </div>
                 </div>
                 
                 <div className="flex justify-between items-end">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-white/50 uppercase">Total Balance</p>
                      <h2 className="text-3xl font-black">৳{totalCollection.toLocaleString()}</h2>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="text-[10px] font-bold text-white/50 uppercase">Active Members</p>
                      <h2 className="text-3xl font-black text-blue-200">{members.length}</h2>
                    </div>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => setActiveTab("members")} className="luxury-card p-6 flex flex-col items-start active:scale-95 transition-transform">
                  <BookOpen className="w-6 h-6 text-blue-600 mb-4" />
                  <h3 className="text-[15px] font-black text-[#002366]">Members</h3>
                  <p className="text-slate-400 text-[10px]">{members.length} registered</p>
                </button>
                <button onClick={() => setActiveTab("gallery")} className="luxury-card p-6 flex flex-col items-start active:scale-95 transition-transform">
                  <ClipboardList className="w-6 h-6 text-blue-600 mb-4" />
                  <h3 className="text-[15px] font-black text-[#002366]">Gallery</h3>
                  <p className="text-slate-400 text-[10px]">Photo Storage</p>
                </button>
              </div>

              <button 
                onClick={() => setActiveTab("settings")}
                className="w-full bg-blue-700 rounded-[24px] p-6 flex items-center justify-between text-white active:scale-[0.98] transition-all shadow-xl shadow-blue-900/10"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-white/10 p-3 rounded-xl">
                    <FileText className="w-6 h-6 text-blue-200" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-[14px] font-black">Demand Letter Generator</h3>
                    <p className="text-white/40 text-[9px] font-bold uppercase tracking-wider">Official Documents</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-white/30" />
              </button>

              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between px-1">
                  <h4 className="font-black text-blue-900 text-[11px] uppercase tracking-wider">Monthly Logs</h4>
                  <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                    <SelectTrigger className="w-32 bg-white border border-slate-100 shadow-sm rounded-xl text-[11px] font-black h-9 text-blue-900">
                      <SelectValue placeholder="All Months" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-none shadow-2xl z-[1000]">
                      <SelectItem value="All" className="text-[12px] font-black">All Time</SelectItem>
                      {months.map(m => <SelectItem key={m} value={m} className="text-[12px] font-black">{m}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  {filteredTransactions.map(t => (
                    <div key={t.id} className="luxury-card p-4 flex items-center justify-between border-slate-50">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center font-black text-blue-600 text-[13px]">{t.n.charAt(0)}</div>
                        <div>
                          <p className="font-bold text-slate-800 text-[13px]">{t.n}</p>
                          <p className="text-[9px] text-slate-400 font-medium">{t.d} • {t.c}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className="font-black text-blue-900 text-[13px]">৳{t.a.toLocaleString()}</p>
                        <button onClick={() => { if(confirm('ডিলিট করতে চান?')) deleteTransaction(t.id); }} className="p-2 text-slate-200 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  ))}
                </div>
                <Button className="w-full h-12 bg-white text-blue-900 border border-slate-100 font-black text-[11px] rounded-2xl" onClick={() => exportSummaryPDF(filteredTransactions, selectedMonth, totalCollection)}><Download className="w-4 h-4 mr-2" /> Export Summary PDF</Button>
              </div>
            </div>
          )}

          {activeTab === "members" && (
            <div className="animate-in fade-in slide-in-from-right-2 duration-300 space-y-4">
               <div className="flex items-center gap-3"><Button variant="ghost" size="sm" onClick={() => setActiveTab("home")} className="p-0 h-8 w-8 rounded-full bg-white"><ChevronRight className="rotate-180" /></Button><h2 className="font-black text-blue-900">Members Management</h2></div>
               <div className="luxury-card p-5">
                  <div className="flex gap-2 mb-6"><Input placeholder="Enter Member Name" value={newMember} onChange={e=>setNewMember(e.target.value)} className="h-12 border-blue-100" /><Button onClick={()=>{if(newMember)addMember(newMember);setNewMember("")}} className="bg-blue-600 hover:bg-blue-700 h-12 px-6 rounded-xl font-black">ADD</Button></div>
                  <div className="space-y-3">{members.map(m=><div key={m} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl"><span className="font-bold text-[13px] text-slate-700">{m}</span><button onClick={()=>deleteMember(m)} className="p-2 text-slate-300 hover:text-red-500"><Trash2 className="w-4 h-4"/></button></div>)}</div>
               </div>
            </div>
          )}

          {activeTab === "add" && (
            <div className="animate-in fade-in zoom-in-95 duration-300">
               <div className="luxury-card p-8 shadow-2xl">
                  <h3 className="text-center font-black text-blue-900 text-lg mb-8">New Member Deposit</h3>
                  <form onSubmit={handleDeposit} className="space-y-5">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold text-slate-400 uppercase px-1">Select Member</Label>
                      <Select onValueChange={v=>setDeposit({...deposit, member:v})}>
                        <SelectTrigger className="h-14 font-black text-blue-900 rounded-2xl border-blue-50"><SelectValue placeholder="Choose a member"/></SelectTrigger>
                        <SelectContent className="bg-white">{members.map(m=><SelectItem key={m} value={m} className="font-black">{m}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold text-slate-400 uppercase px-1">Amount (TK)</Label>
                      <Input type="number" value={deposit.amount} onChange={e=>setDeposit({...deposit, amount:Number(e.target.value)})} className="h-14 text-lg border-blue-50" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold text-slate-400 uppercase px-1">Date</Label>
                      <Input type="date" value={deposit.date} onChange={e=>setDeposit({...deposit, date:e.target.value})} className="h-14 border-blue-50" />
                    </div>
                    <Button type="submit" className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white text-md font-black shadow-xl mt-4 rounded-2xl">SAVE TRANSACTION</Button>
                  </form>
               </div>
            </div>
          )}

          {activeTab === "gallery" && <DocumentStorage />}
          {activeTab === "settings" && <DemandLetterGenerator />}
        </div>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white h-24 px-8 flex items-center justify-between z-[100] nav-shadow rounded-t-[40px] border-t border-slate-50">
        <button onClick={() => setActiveTab("home")} className={cn("flex flex-col items-center gap-2", activeTab === "home" ? "text-blue-600" : "text-slate-300")}><Home className="w-6 h-6"/><span className="text-[8px] font-black uppercase">Dashboard</span></button>
        <button onClick={() => setActiveTab("members")} className={cn("flex flex-col items-center gap-2", activeTab === "members" ? "text-blue-600" : "text-slate-300")}><Users className="w-6 h-6"/><span className="text-[8px] font-black uppercase">Members</span></button>
        <div className="relative -top-10"><button onClick={() => setActiveTab("add")} className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-2xl border-[8px] border-[#F8FAFC] active:scale-90 transition-transform"><Plus className="w-8 h-8"/></button></div>
        <button onClick={() => setActiveTab("gallery")} className={cn("flex flex-col items-center gap-2", activeTab === "gallery" ? "text-blue-600" : "text-slate-300")}><ImageIcon className="w-6 h-6"/><span className="text-[8px] font-black uppercase">Gallery</span></button>
        <div className="flex flex-col items-center gap-2 text-slate-800"><div className="w-6 h-6 rounded-full bg-blue-900 text-white flex items-center justify-center text-[8px] font-black">N</div><span className="text-[8px] font-black uppercase">Profile</span></div>
      </nav>
    </div>
  );
}