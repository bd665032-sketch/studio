"use client";

import { useState, useEffect } from "react";
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
  Settings
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
  const [currentTime, setCurrentTime] = useState(new Date());
  const { toast } = useToast();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const filteredTransactions = transactions.filter(t => {
    if (selectedMonth === "All") return true;
    const date = new Date(t.d);
    return date.toLocaleString('en-US', { month: 'long' }) === selectedMonth;
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
    <div className="flex flex-col h-screen bg-[#F0F2F5] overflow-hidden font-body">
      <main className="flex-1 overflow-y-auto pb-32">
        <div className="max-w-[480px] mx-auto px-4 pt-6 space-y-6">
          
          {activeTab === "home" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-6">
              
              {/* Luxury Live Weather Card */}
              <div className="luxury-card p-6 gradient-banner relative overflow-hidden">
                <div className="flex justify-between items-start relative z-10">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-[#D4AF37] font-black text-[10px] uppercase tracking-[0.2em]">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>Riyadh, SA</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <h1 className="text-5xl font-black tracking-tighter">32°C</h1>
                      <div className="flex flex-col">
                        <CloudSun className="w-8 h-8 text-white/90" />
                        <span className="text-[10px] font-black text-white/60 uppercase">Sunny Clear</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[13px] font-black uppercase text-white/70">{currentTime.toLocaleDateString('en-US', { weekday: 'long' })}</p>
                    <p className="text-[26px] font-black text-[#D4AF37] leading-none mt-1">{currentTime.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}</p>
                    <p className="text-[9px] font-bold opacity-40 mt-1 uppercase tracking-widest">Secure Admin Hub</p>
                  </div>
                </div>
              </div>

              {/* Islamic Calendar Events (Hajj 2026, Ramadan 27/28) */}
              <div className="luxury-card p-5 border-l-[10px] border-[#D4AF37] bg-white">
                <div className="flex items-center gap-2 mb-4 px-1">
                  <Calendar className="w-5 h-5 text-[#1E40AF]" />
                  <h3 className="text-[11px] font-black text-[#1E3A8A] uppercase tracking-widest">Upcoming Islamic Events</h3>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-slate-50 p-3 rounded-2xl text-center border border-slate-100 shadow-sm">
                    <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Hajj 2026</p>
                    <p className="text-[12px] font-black text-[#1E40AF]">May 24</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-2xl text-center border border-slate-100 shadow-sm">
                    <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Ramadan 27</p>
                    <p className="text-[12px] font-black text-[#1E40AF]">Mar 09</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-2xl text-center border border-slate-100 shadow-sm">
                    <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Ramadan 28</p>
                    <p className="text-[12px] font-black text-[#1E40AF]">Feb 26</p>
                  </div>
                </div>
              </div>

              {/* Summary Overview */}
              <div className="luxury-card p-8 bg-white border-t-[12px] border-[#1E3A8A]">
                 <div className="flex justify-between items-end">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Total Collection</p>
                      <h2 className="text-4xl font-black text-[#1E3A8A]">৳{totalCollection.toLocaleString()}</h2>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Active Members</p>
                      <h2 className="text-4xl font-black text-[#D4AF37]">{members.length}</h2>
                    </div>
                 </div>
              </div>

              {/* High-End Tools Section */}
              <div className="space-y-4">
                <button 
                  onClick={() => setActiveTab("settings")}
                  className="w-full bg-white rounded-[32px] p-6 flex items-center justify-between shadow-lg border border-slate-50 active:scale-95 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-[#1E40AF]/10 p-4 rounded-2xl text-[#1E40AF]">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-[16px] font-black text-[#1E3A8A]">Demand Letter AI</h3>
                      <p className="text-slate-400 text-[9px] font-black uppercase tracking-wider">Official Foundation Docs</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-300" />
                </button>

                {/* PDF Export Button - Fixed Strategic Placement */}
                <button 
                  className="w-full py-6 bg-white border-2 border-[#D4AF37] text-[#1E3A8A] font-black text-[14px] rounded-[32px] flex items-center justify-center gap-3 shadow-xl hover:bg-[#D4AF37] hover:text-white transition-all active:scale-95" 
                  onClick={() => exportSummaryPDF(filteredTransactions, selectedMonth, totalCollection)}
                >
                  <Download className="w-5 h-5" /> 
                  <span className="uppercase tracking-[0.3em]">Download Summary Report (PDF)</span>
                </button>
              </div>

              {/* Monthly Logs Section */}
              <div className="space-y-4 pt-6">
                <div className="flex items-center justify-between px-2">
                  <h4 className="font-black text-[#1E3A8A] text-[12px] uppercase tracking-[0.4em]">Financial Archives</h4>
                  <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                    <SelectTrigger className="w-44 bg-white border-none shadow-md rounded-2xl text-[11px] font-black h-12">
                      <SelectValue placeholder="All Records" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-none shadow-2xl rounded-3xl overflow-hidden z-[200]">
                      <SelectItem value="All" className="text-[12px] font-black">All Records</SelectItem>
                      {months.map(m => <SelectItem key={m} value={m} className="text-[12px] font-black">{m}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  {filteredTransactions.map(t => (
                    <div key={t.id} className="luxury-card p-6 flex items-center justify-between border-slate-50 shadow-sm">
                      <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-[22px] bg-slate-50 flex items-center justify-center font-black text-[#1E3A8A] text-xl border border-slate-100 shadow-inner">{t.n.charAt(0)}</div>
                        <div>
                          <p className="font-black text-slate-800 text-[16px]">{t.n}</p>
                          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5">{t.d}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-5">
                        <p className="font-black text-[#1E3A8A] text-[18px]">৳{t.a.toLocaleString()}</p>
                        <button onClick={() => { if(confirm('Delete record?')) deleteTransaction(t.id); }} className="p-2 text-slate-200 hover:text-red-500 transition-colors"><Trash2 className="w-5 h-5" /></button>
                      </div>
                    </div>
                  ))}
                  {filteredTransactions.length === 0 && (
                    <div className="text-center py-20 opacity-20">
                      <ImageIcon className="w-16 h-16 mx-auto mb-4" />
                      <p className="font-black text-xs uppercase tracking-widest">No Logs Found</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "members" && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-6">
               <div className="flex items-center gap-3"><Button variant="ghost" size="sm" onClick={() => setActiveTab("home")} className="h-10 w-10 rounded-full bg-white shadow-md p-0"><ChevronRight className="rotate-180 w-5 h-5" /></Button><h2 className="font-black text-[#1E3A8A] text-sm uppercase tracking-widest">Admin Directory</h2></div>
               <div className="luxury-card p-8 bg-white">
                  <div className="flex gap-4 mb-10"><Input placeholder="Member Full Name" value={newMember} onChange={e=>setNewMember(e.target.value)} className="h-16" /><Button onClick={()=>{if(newMember)addMember(newMember);setNewMember("")}} className="bg-[#1E3A8A] h-16 px-10 rounded-2xl font-black text-sm shadow-xl">ADD</Button></div>
                  <div className="space-y-4">{members.map(m=><div key={m} className="flex justify-between items-center p-6 bg-slate-50 rounded-[28px] border border-slate-100 shadow-sm"><span className="font-black text-[16px] text-slate-700">{m}</span><button onClick={()=>deleteMember(m)} className="p-2 text-slate-300 hover:text-red-500"><Trash2 className="w-5 h-5"/></button></div>)}</div>
               </div>
            </div>
          )}

          {activeTab === "add" && (
            <div className="animate-in fade-in zoom-in-95 duration-500">
               <div className="luxury-card p-10 shadow-2xl border-t-[12px] border-[#D4AF37] bg-white">
                  <h3 className="text-center font-black text-[#1E3A8A] text-2xl mb-14 uppercase tracking-[0.4em]">Authorize Deposit</h3>
                  <form onSubmit={handleDeposit} className="space-y-10">
                    <div className="space-y-4">
                      <Label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Beneficiary</Label>
                      <Select onValueChange={v=>setDeposit({...deposit, member:v})}>
                        <SelectTrigger className="h-20 font-black text-[#1E3A8A] rounded-[28px] bg-slate-50 border-none shadow-inner text-lg"><SelectValue placeholder="Beneficiary name"/></SelectTrigger>
                        <SelectContent className="bg-white rounded-[32px] shadow-2xl border-none z-[300]">{members.map(m=><SelectItem key={m} value={m} className="font-black text-[#1E3A8A] py-5">{m}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-4">
                      <Label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Deposit Amount (TK)</Label>
                      <Input type="number" value={deposit.amount} onChange={e=>setDeposit({...deposit, amount:Number(e.target.value)})} className="h-20 text-3xl font-black bg-slate-50 border-none shadow-inner" />
                    </div>
                    <div className="space-y-4">
                      <Label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Value Date</Label>
                      <Input type="date" value={deposit.date} onChange={e=>setDeposit({...deposit, date:e.target.value})} className="h-20 font-black bg-slate-50 border-none shadow-inner text-lg" />
                    </div>
                    <Button type="submit" className="w-full h-20 bg-[#1E3A8A] text-white text-[16px] font-black shadow-2xl rounded-[28px] uppercase tracking-[0.4em] active:scale-95 transition-all mt-6">APPROVE TRANSACTION</Button>
                  </form>
               </div>
            </div>
          )}

          {activeTab === "gallery" && <DocumentStorage />}
          {activeTab === "settings" && <DemandLetterGenerator />}
        </div>
      </main>

      {/* Slim Native-Style Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-2xl h-24 px-10 flex items-center justify-between z-[100] nav-shadow rounded-t-[50px] border-t border-slate-50">
        <button onClick={() => setActiveTab("home")} className={cn("flex flex-col items-center gap-2 transition-all duration-300", activeTab === "home" ? "text-[#1E3A8A] scale-110" : "text-slate-300")}><Home className="w-8 h-8"/><span className="text-[10px] font-black uppercase tracking-tighter">Home</span></button>
        <button onClick={() => setActiveTab("members")} className={cn("flex flex-col items-center gap-2 transition-all duration-300", activeTab === "members" ? "text-[#1E3A8A] scale-110" : "text-slate-300")}><Users className="w-8 h-8"/><span className="text-[10px] font-black uppercase tracking-tighter">Directory</span></button>
        <div className="relative -top-12"><button onClick={() => setActiveTab("add")} className="w-22 h-22 bg-gradient-to-br from-[#D4AF37] to-[#B8960C] rounded-full flex items-center justify-center text-white shadow-[0_20px_40px_rgba(212,175,55,0.4)] border-[10px] border-[#F0F2F5] active:scale-90 transition-all"><Plus className="w-12 h-12"/></button></div>
        <button onClick={() => setActiveTab("gallery")} className={cn("flex flex-col items-center gap-2 transition-all duration-300", activeTab === "gallery" ? "text-[#1E3A8A] scale-110" : "text-slate-300")}><ImageIcon className="w-8 h-8"/><span className="text-[10px] font-black uppercase tracking-tighter">Gallery</span></button>
        <button onClick={() => setActiveTab("settings")} className={cn("flex flex-col items-center gap-2 transition-all duration-300", activeTab === "settings" ? "text-[#1E3A8A] scale-110" : "text-slate-300")}><Settings className="w-8 h-8"/><span className="text-[10px] font-black uppercase tracking-tighter">Tools</span></button>
      </nav>
    </div>
  );
}
