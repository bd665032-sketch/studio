
"use client";

import { useState, useEffect, useMemo } from "react";
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
  FileText,
  CloudSun,
  MapPin,
  Calendar,
  Settings,
  Share2
} from "lucide-react";
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
  const [currentTime, setCurrentTime] = useState(new Date());
  const { toast } = useToast();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // REAL-TIME FILTERED DATA
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      if (selectedMonth === "All") return true;
      try {
        const date = new Date(t.date);
        return date.toLocaleString('en-US', { month: 'long' }) === selectedMonth;
      } catch (e) {
        return false;
      }
    });
  }, [transactions, selectedMonth]);

  const totalCollection = useMemo(() => {
    return filteredTransactions.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  }, [filteredTransactions]);

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deposit.member) return toast({ variant: "destructive", title: "ত্রুটি", description: "মেম্বার সিলেক্ট করুন" });
    addTransaction(deposit.member, deposit.amount, deposit.date, deposit.category);
    setDeposit({...deposit, member: "", amount: 5000, category: "প্রতি মাসের জমা", date: new Date().toISOString().split('T')[0]});
    setActiveTab("home");
    toast({ title: "সফল!", description: "ডিপোজিট সেভ হয়েছে এবং সামারি আপডেট হয়েছে।" });
  };

  return (
    <div className="flex flex-col h-screen bg-[#F0F2F5] overflow-hidden font-body">
      <main className="flex-1 overflow-y-auto pb-32">
        <div className="max-w-[480px] mx-auto px-4 pt-6 space-y-6">
          
          {activeTab === "home" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-6">
              
              <div className="luxury-card p-6 gradient-banner relative overflow-hidden">
                <div className="flex justify-between items-start relative z-10">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-[#D4AF37] font-black text-[10px] uppercase tracking-[0.2em]"><MapPin className="w-3.5 h-3.5" /><span>Riyadh, SA</span></div>
                    <div className="flex items-center gap-3">
                      <h1 className="text-4xl font-black tracking-tighter">32°C</h1>
                      <div className="flex flex-col"><CloudSun className="w-7 h-7 text-white/90" /><span className="text-[9px] font-black text-white/60 uppercase">Sunny Clear</span></div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[12px] font-black uppercase text-white/70">{currentTime.toLocaleDateString('en-US', { weekday: 'long' })}</p>
                    <p className="text-[22px] font-black text-[#D4AF37] leading-none mt-1">{currentTime.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}</p>
                  </div>
                </div>
              </div>

              <div className="luxury-card p-8 border-t-[12px] border-[#1E3A8A]">
                 <div className="flex justify-between items-end">
                    <div className="space-y-1">
                      <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Total Foundation Collection</p>
                      <h2 className="text-3xl font-black text-[#1E3A8A]">৳{totalCollection.toLocaleString()}</h2>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Active Members</p>
                      <h2 className="text-3xl font-black text-[#D4AF37]">{members.length}</h2>
                    </div>
                 </div>
              </div>

              <div className="space-y-4 pt-6">
                <div className="flex items-center justify-between px-2">
                  <h4 className="font-black text-[#1E3A8A] text-[11px] uppercase tracking-[0.4em]">Transaction Reports</h4>
                  <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                    <SelectTrigger className="w-40 bg-white border-none shadow-md rounded-2xl text-[10px] font-black h-11"><SelectValue placeholder="All Records" /></SelectTrigger>
                    <SelectContent className="bg-white border-none shadow-2xl rounded-3xl overflow-hidden z-[200]">
                      <SelectItem value="All" className="text-[11px] font-black">All Records</SelectItem>
                      {months.map(m => <SelectItem key={m} value={m} className="text-[11px] font-black">{m}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  {filteredTransactions.map(t => (
                    <div key={t.id} className="luxury-card p-5 flex items-center justify-between border-slate-50 shadow-sm">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-[20px] bg-slate-50 flex items-center justify-center font-black text-[#1E3A8A] text-lg border border-slate-100 shadow-inner">{t.memberName.charAt(0)}</div>
                        <div>
                          <p className="font-black text-slate-800 text-[15px]">{t.memberName}</p>
                          <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-0.5">{t.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className="font-black text-[#1E3A8A] text-[16px]">৳{t.amount.toLocaleString()}</p>
                        <button onClick={() => { if(confirm('Delete record?')) deleteTransaction(t.id); }} className="p-2 text-slate-200 hover:text-red-500 transition-colors"><Trash2 className="w-5 h-5" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "members" && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-6">
               <div className="flex items-center gap-3"><Button variant="ghost" size="sm" onClick={() => setActiveTab("home")} className="h-10 w-10 rounded-full bg-white shadow-md p-0"><ChevronRight className="rotate-180 w-5 h-5" /></Button><h2 className="font-black text-[#1E3A8A] text-sm uppercase tracking-widest">Admin Directory</h2></div>
               <div className="luxury-card p-8">
                  <div className="flex gap-3 mb-10"><Input placeholder="Member Full Name" value={newMember} onChange={e=>setNewMember(e.target.value)} className="h-14" /><Button onClick={()=>{if(newMember)addMember(newMember);setNewMember("")}} className="bg-[#1E3A8A] h-14 px-8 rounded-2xl font-black text-xs shadow-xl">ADD</Button></div>
                  <div className="space-y-4">{members.map(m=><div key={m} className="flex justify-between items-center p-5 bg-slate-50/50 rounded-[24px] border border-slate-100 shadow-sm"><span className="font-black text-[15px] text-slate-700">{m}</span><button onClick={()=>deleteMember(m)} className="p-2 text-slate-300 hover:text-red-500"><Trash2 className="w-5 h-5"/></button></div>)}</div>
               </div>
            </div>
          )}

          {activeTab === "add" && (
            <div className="animate-in fade-in zoom-in-95 duration-500">
               <div className="luxury-card p-8 shadow-2xl border-t-[12px] border-[#D4AF37]">
                  <h3 className="text-center font-black text-[#1E3A8A] text-xl mb-12 uppercase tracking-[0.4em]">Authorize Deposit</h3>
                  <form onSubmit={handleDeposit} className="space-y-8">
                    <div className="space-y-3">
                      <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Beneficiary</Label>
                      <Select onValueChange={v=>setDeposit({...deposit, member:v})}>
                        <SelectTrigger className="h-16 font-black text-[#1E3A8A] rounded-[24px] bg-slate-50 border-none shadow-inner text-base"><SelectValue placeholder="Beneficiary name"/></SelectTrigger>
                        <SelectContent className="bg-white rounded-[28px] shadow-2xl border-none z-[300]">{members.map(m=><SelectItem key={m} value={m} className="font-black text-[#1E3A8A] py-4">{m}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-3">
                      <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Deposit Amount (TK)</Label>
                      <Input type="number" value={deposit.amount} onChange={e=>setDeposit({...deposit, amount:Number(e.target.value)})} className="h-16 text-2xl font-black bg-slate-50 border-none shadow-inner" />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Value Date</Label>
                      <Input type="date" value={deposit.date} onChange={e=>setDeposit({...deposit, date:e.target.value})} className="h-16 font-black bg-slate-50 border-none shadow-inner text-base" />
                    </div>
                    <Button type="submit" className="w-full h-18 bg-[#1E3A8A] text-white text-[15px] font-black shadow-2xl rounded-[24px] uppercase tracking-[0.4em] active:scale-95 transition-all mt-6">APPROVE TRANSACTION</Button>
                  </form>
               </div>
            </div>
          )}

          {activeTab === "gallery" && <DocumentStorage />}
          {activeTab === "settings" && <DemandLetterGenerator />}
        </div>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-2xl h-22 px-8 flex items-center justify-between z-[100] nav-shadow rounded-t-[45px] border-t border-slate-100">
        <button onClick={() => setActiveTab("home")} className={cn("flex flex-col items-center gap-1.5 transition-all", activeTab === "home" ? "text-[#1E3A8A] scale-110" : "text-slate-300")}><Home className="w-7 h-7"/><span className="text-[9px] font-black uppercase tracking-tighter">Home</span></button>
        <button onClick={() => setActiveTab("members")} className={cn("flex flex-col items-center gap-1.5 transition-all", activeTab === "members" ? "text-[#1E3A8A] scale-110" : "text-slate-300")}><Users className="w-7 h-7"/><span className="text-[9px] font-black uppercase tracking-tighter">Directory</span></button>
        <div className="relative -top-10"><button onClick={() => setActiveTab("add")} className="w-18 h-18 bg-gradient-to-br from-[#D4AF37] to-[#B8960C] rounded-full flex items-center justify-center text-white shadow-xl border-[8px] border-[#F0F2F5] active:scale-90 transition-all"><Plus className="w-10 h-10"/></button></div>
        <button onClick={() => setActiveTab("gallery")} className={cn("flex flex-col items-center gap-1.5 transition-all", activeTab === "gallery" ? "text-[#1E3A8A] scale-110" : "text-slate-300")}><ImageIcon className="w-7 h-7"/><span className="text-[9px] font-black uppercase tracking-tighter">Gallery</span></button>
        <button onClick={() => setActiveTab("settings")} className={cn("flex flex-col items-center gap-1.5 transition-all", activeTab === "settings" ? "text-[#1E3A8A] scale-110" : "text-slate-300")}><Settings className="w-7 h-7"/><span className="text-[9px] font-black uppercase tracking-tighter">Tools</span></button>
      </nav>
    </div>
  );
}
