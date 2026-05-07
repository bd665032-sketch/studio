
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
  
  const prevTransactionsCount = useRef(transactions.length);
  const isInitialLoad = useRef(true);

  useEffect(() => {
    if (isInitialLoad.current && transactions.length > 0) {
      isInitialLoad.current = false;
      prevTransactionsCount.current = transactions.length;
      return;
    }

    if (!isInitialLoad.current && transactions.length > prevTransactionsCount.current) {
      const latestTx = transactions[0];
      const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3");
      audio.play().catch(e => console.log("Audio play failed", e));

      toast({
        title: "🔔 নতুন জমা (New Deposit!)",
        description: `${latestTx.n} জমা দিয়েছেন ৳${latestTx.a.toLocaleString()}`,
        duration: 5000,
      });

      if (Notification.permission === "granted") {
        new Notification("Minar Go Foundation", {
          body: `${latestTx.n} জমা দিয়েছেন ৳${latestTx.a.toLocaleString()}`,
        });
      }
    }
    prevTransactionsCount.current = transactions.length;
  }, [transactions, toast]);

  useEffect(() => {
    if (Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

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
        <div className="max-w-[450px] mx-auto px-4 pt-4 space-y-4">
          
          {activeTab === "home" && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-4">
              <div className="luxury-card p-5 relative overflow-hidden bg-primary text-white border-none shadow-xl">
                <div className="absolute top-0 right-0 w-24 h-24 bg-accent opacity-10 rounded-bl-[100px]"></div>
                <div>
                  <p className="text-accent text-[8px] font-black uppercase tracking-widest mb-1">Total Collection</p>
                  <h1 className="text-2xl font-black leading-tight">৳{totalCollection.toLocaleString()}</h1>
                </div>
                <div className="flex justify-between items-end mt-6">
                  <div>
                    <p className="text-[9px] font-bold opacity-60 uppercase">Active Members</p>
                    <p className="text-lg font-black text-accent">{members.length}</p>
                  </div>
                  <div className="bg-white/10 p-2 rounded-full">
                    <Bell className="w-4 h-4 text-accent animate-pulse" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setActiveTab("members")} className="luxury-card p-4 flex flex-col items-start active:scale-95 transition-transform shadow-sm">
                  <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center mb-2"><BookOpen className="w-4 h-4 text-accent" /></div>
                  <h3 className="text-[12px] font-black text-primary">Members</h3>
                  <p className="text-slate-400 text-[8px]">{members.length} registered</p>
                </button>
                <button onClick={() => setActiveTab("gallery")} className="luxury-card p-4 flex flex-col items-start active:scale-95 transition-transform shadow-sm">
                  <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center mb-2"><ClipboardList className="w-4 h-4 text-accent" /></div>
                  <h3 className="text-[12px] font-black text-primary">Gallery</h3>
                  <p className="text-slate-400 text-[8px]">Photos</p>
                </button>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between px-1">
                  <h4 className="font-black text-primary text-[10px] uppercase tracking-wider">Monthly Logs</h4>
                  <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                    <SelectTrigger className="w-32 bg-white border border-slate-200 shadow-sm rounded-xl text-[10px] font-black h-8">
                      <SelectValue placeholder="All Months" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-slate-200 shadow-2xl z-[1000]">
                      <SelectItem value="All" className="text-[11px] font-black">All Time</SelectItem>
                      {months.map(m => <SelectItem key={m} value={m} className="text-[11px] font-black">{m}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  {filteredTransactions.map(t => (
                    <div key={t.id} className="luxury-card p-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center font-black text-accent text-[11px]">{t.n.charAt(0)}</div>
                        <div>
                          <p className="font-bold text-slate-800 text-[11px]">{t.n}</p>
                          <p className="text-[8px] text-slate-400">{t.d}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className="font-black text-primary text-[11px]">৳{t.a.toLocaleString()}</p>
                        <button onClick={() => { if(confirm('ডিলিট করতে চান?')) deleteTransaction(t.id); }} className="text-slate-300 hover:text-red-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                  ))}
                </div>
                <Button className="w-full bg-white text-primary border border-slate-100 font-black text-[10px]" onClick={() => exportSummaryPDF(filteredTransactions, selectedMonth, totalCollection)}><Download className="w-3 h-3 mr-2" /> Export PDF</Button>
              </div>
            </div>
          )}

          {activeTab === "members" && (
            <div className="animate-in fade-in slide-in-from-right-2 duration-300 space-y-4">
               <div className="flex items-center gap-3"><Button variant="ghost" size="sm" onClick={() => setActiveTab("home")} className="p-0 h-8 w-8 rounded-full bg-white"><ChevronRight className="rotate-180" /></Button><h2 className="font-black text-primary">Members</h2></div>
               <div className="luxury-card p-4">
                  <div className="flex gap-2 mb-4"><Input placeholder="Name" value={newMember} onChange={e=>setNewMember(e.target.value)} /><Button onClick={()=>{if(newMember)addMember(newMember);setNewMember("")}} className="gold-gradient">ADD</Button></div>
                  <div className="space-y-2">{members.map(m=><div key={m} className="flex justify-between p-3 bg-slate-50 rounded-xl"><span className="font-bold text-xs">{m}</span><button onClick={()=>deleteMember(m)}><Trash2 className="w-3.5 h-3.5 text-slate-300"/></button></div>)}</div>
               </div>
            </div>
          )}

          {activeTab === "add" && (
            <div className="animate-in fade-in zoom-in-95 duration-300">
               <div className="luxury-card p-6 shadow-2xl">
                  <h3 className="text-center font-black text-primary mb-6">New Deposit</h3>
                  <form onSubmit={handleDeposit} className="space-y-4">
                    <Select onValueChange={v=>setDeposit({...deposit, member:v})}>
                      <SelectTrigger className="font-black text-slate-900"><SelectValue placeholder="Select Member"/></SelectTrigger>
                      <SelectContent className="bg-white">{members.map(m=><SelectItem key={m} value={m} className="font-black">{m}</SelectItem>)}</SelectContent>
                    </Select>
                    <Input type="number" value={deposit.amount} onChange={e=>setDeposit({...deposit, amount:Number(e.target.value)})} placeholder="Amount"/>
                    <Input type="date" value={deposit.date} onChange={e=>setDeposit({...deposit, date:e.target.value})}/>
                    <Button type="submit" className="w-full h-12 gold-gradient text-white font-black shadow-xl">SAVE TRANSACTION</Button>
                  </form>
               </div>
            </div>
          )}

          {activeTab === "gallery" && <DocumentStorage />}
          {activeTab === "settings" && <DemandLetterGenerator />}
        </div>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white h-20 px-6 flex items-center justify-between z-[100] nav-shadow rounded-t-[28px] border-t">
        <button onClick={() => setActiveTab("home")} className={cn("flex flex-col items-center gap-1.5", activeTab === "home" ? "text-primary" : "text-slate-300")}><Home className="w-5 h-5"/><span className="text-[7px] font-black uppercase">Home</span></button>
        <button onClick={() => setActiveTab("members")} className={cn("flex flex-col items-center gap-1.5", activeTab === "members" ? "text-primary" : "text-slate-300")}><Users className="w-5 h-5"/><span className="text-[7px] font-black uppercase">Members</span></button>
        <div className="relative -top-8"><button onClick={() => setActiveTab("add")} className="w-14 h-14 gold-gradient rounded-full flex items-center justify-center text-white shadow-xl border-[6px] border-[#F8FAFC]"><Plus className="w-8 h-8"/></button></div>
        <button onClick={() => setActiveTab("gallery")} className={cn("flex flex-col items-center gap-1.5", activeTab === "gallery" ? "text-primary" : "text-slate-300")}><ImageIcon className="w-5 h-5"/><span className="text-[7px] font-black uppercase">Gallery</span></button>
        <button onClick={() => setActiveTab("settings")} className={cn("flex flex-col items-center gap-1.5", activeTab === "settings" ? "text-primary" : "text-slate-300")}><SettingsIcon className="w-5 h-5"/><span className="text-[7px] font-black uppercase">Menu</span></button>
      </nav>
    </div>
  );
}
