
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
  BookOpen,
  ClipboardList,
  FileText,
  CloudSun,
  MapPin,
  Calendar,
  Zap,
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
  const [currentTime, setCurrentTime] = useState(new Date());
  const [weather, setWeather] = useState({ temp: 32, status: "Clear Sky", location: "Riyadh, SA", aqi: 42 });
  const { toast } = useToast();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
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
    <div className="flex flex-col h-screen bg-[#F0F2F5] overflow-hidden font-body">
      <main className="flex-1 overflow-y-auto pb-32">
        <div className="max-w-[480px] mx-auto px-4 pt-4 space-y-5">
          
          {activeTab === "home" && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 space-y-5">
              
              {/* Luxury Weather Card */}
              <div className="luxury-card p-6 bg-gradient-to-br from-[#1E3A8A] to-[#6366F1] text-white border-none relative overflow-hidden shadow-2xl">
                <div className="flex justify-between items-start relative z-10">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-[#D4AF37] font-black text-[10px] uppercase tracking-widest">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{weather.location}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <h1 className="text-5xl font-black tracking-tighter">{weather.temp}°C</h1>
                      <div className="flex flex-col">
                        <CloudSun className="w-8 h-8 text-white/90" />
                        <span className="text-[10px] font-black text-white/60 uppercase">{weather.status}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[12px] font-black uppercase text-white/70">{currentTime.toLocaleDateString('en-US', { weekday: 'long' })}</p>
                    <p className="text-[22px] font-black text-[#D4AF37] mt-1">{currentTime.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}</p>
                  </div>
                </div>
              </div>

              {/* Islamic Calendar Hub */}
              <div className="luxury-card p-5 border-l-[6px] border-[#D4AF37] bg-white shadow-lg space-y-4">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-[#1E40AF]" />
                    <h3 className="text-[11px] font-black text-[#1E3A8A] uppercase">Islamic Events Hub</h3>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-slate-50 p-3 rounded-2xl text-center border border-slate-100">
                    <p className="text-[7px] font-black text-slate-400 uppercase">Hajj 2026</p>
                    <p className="text-[11px] font-black text-[#1E40AF]">May 24</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-2xl text-center border border-slate-100">
                    <p className="text-[7px] font-black text-slate-400 uppercase">Ramadan 27</p>
                    <p className="text-[11px] font-black text-[#1E40AF]">Mar 09</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-2xl text-center border border-slate-100">
                    <p className="text-[7px] font-black text-slate-400 uppercase">Ramadan 28</p>
                    <p className="text-[11px] font-black text-[#1E40AF]">Feb 26</p>
                  </div>
                </div>
              </div>

              {/* Summary Card */}
              <div className="luxury-card p-7 bg-gradient-to-br from-[#1E3A8A] to-[#3B82F6] text-white border-l-[8px] border-[#D4AF37]">
                 <div className="flex justify-between items-end">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-white/60 uppercase">Total Balance</p>
                      <h2 className="text-4xl font-black text-white">৳{totalCollection.toLocaleString()}</h2>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="text-[10px] font-bold text-white/60 uppercase">Members</p>
                      <h2 className="text-4xl font-black text-[#D4AF37]">{members.length}</h2>
                    </div>
                 </div>
              </div>

              {/* Tools Section */}
              <div className="space-y-4">
                <button 
                  onClick={() => setActiveTab("settings")}
                  className="w-full bg-white rounded-[24px] p-5 flex items-center justify-between shadow-md border border-slate-100 active:scale-95 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-[#1E3A8A]/10 p-3 rounded-2xl">
                      <FileText className="w-6 h-6 text-[#1E3A8A]" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-[14px] font-black text-[#1E3A8A]">Demand Letter Generator</h3>
                      <p className="text-slate-400 text-[9px] font-bold uppercase">Official PDF Documents</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-300" />
                </button>

                {/* Strategic PDF Button */}
                <button 
                  className="w-full h-16 bg-white border-2 border-[#D4AF37] text-[#1E3A8A] font-black text-[12px] rounded-[24px] flex items-center justify-center gap-3 shadow-xl hover:bg-[#D4AF37] hover:text-white transition-all active:scale-95" 
                  onClick={() => exportSummaryPDF(filteredTransactions, selectedMonth, totalCollection)}
                >
                  <Download className="w-5 h-5" /> 
                  <span className="uppercase tracking-[0.15em]">Export Summary Report (PDF)</span>
                </button>
              </div>

              {/* Logs Section */}
              <div className="space-y-4 pt-4">
                <div className="flex items-center justify-between px-2">
                  <h4 className="font-black text-[#1E3A8A] text-[11px] uppercase tracking-widest">Financial Logs</h4>
                  <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                    <SelectTrigger className="w-36 bg-white border border-slate-100 shadow-sm rounded-2xl text-[11px] font-black h-10">
                      <SelectValue placeholder="All Months" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-none shadow-2xl rounded-2xl overflow-hidden">
                      <SelectItem value="All" className="text-[12px] font-black">All Time</SelectItem>
                      {months.map(m => <SelectItem key={m} value={m} className="text-[12px] font-black">{m}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  {filteredTransactions.map(t => (
                    <div key={t.id} className="luxury-card p-5 flex items-center justify-between border-slate-50">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-[18px] bg-[#1E3A8A]/5 flex items-center justify-center font-black text-[#1E3A8A]">{t.n.charAt(0)}</div>
                        <div>
                          <p className="font-black text-slate-800 text-[14px]">{t.n}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">{t.d}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className="font-black text-[#1E3A8A] text-[15px]">৳{t.a.toLocaleString()}</p>
                        <button onClick={() => { if(confirm('ডিলিট করতে চান?')) deleteTransaction(t.id); }} className="p-2 text-slate-200 hover:text-red-500 transition-colors"><Trash2 className="w-5 h-5" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "members" && (
            <div className="animate-in fade-in slide-in-from-right-2 duration-300 space-y-5">
               <div className="flex items-center gap-3"><Button variant="ghost" size="sm" onClick={() => setActiveTab("home")} className="p-0 h-10 w-10 rounded-full bg-white shadow-md"><ChevronRight className="rotate-180 w-5 h-5" /></Button><h2 className="font-black text-[#1E3A8A] text-sm uppercase">Members Directory</h2></div>
               <div className="luxury-card p-7">
                  <div className="flex gap-3 mb-8"><Input placeholder="Member Name" value={newMember} onChange={e=>setNewMember(e.target.value)} /><Button onClick={()=>{if(newMember)addMember(newMember);setNewMember("")}} className="bg-[#1E3A8A] h-14 px-8 rounded-2xl font-black text-xs">ADD</Button></div>
                  <div className="space-y-3">{members.map(m=><div key={m} className="flex justify-between items-center p-5 bg-slate-50 rounded-2xl border border-slate-100"><span className="font-black text-[14px] text-slate-700">{m}</span><button onClick={()=>deleteMember(m)} className="p-2 text-slate-300 hover:text-red-500"><Trash2 className="w-5 h-5"/></button></div>)}</div>
               </div>
            </div>
          )}

          {activeTab === "add" && (
            <div className="animate-in fade-in zoom-in-95 duration-300">
               <div className="luxury-card p-8 shadow-2xl border-t-[8px] border-[#D4AF37]">
                  <h3 className="text-center font-black text-[#1E3A8A] text-xl mb-10 uppercase tracking-[0.2em]">Authorize Deposit</h3>
                  <form onSubmit={handleDeposit} className="space-y-8">
                    <div className="space-y-3">
                      <Label className="text-[11px] font-black text-slate-400 uppercase">Select Beneficiary</Label>
                      <Select onValueChange={v=>setDeposit({...deposit, member:v})}>
                        <SelectTrigger className="h-16 font-black text-[#1E3A8A] rounded-[20px] bg-slate-50 shadow-inner"><SelectValue placeholder="Search member name"/></SelectTrigger>
                        <SelectContent className="bg-white z-[1000] rounded-2xl shadow-2xl border-none">{members.map(m=><SelectItem key={m} value={m} className="font-black text-[#1E3A8A] py-3">{m}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-3">
                      <Label className="text-[11px] font-black text-slate-400 uppercase">Amount (TK)</Label>
                      <Input type="number" value={deposit.amount} onChange={e=>setDeposit({...deposit, amount:Number(e.target.value)})} className="h-16 text-xl font-black bg-slate-50 shadow-inner" />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-[11px] font-black text-slate-400 uppercase">Processing Date</Label>
                      <Input type="date" value={deposit.date} onChange={e=>setDeposit({...deposit, date:e.target.value})} className="h-16 font-black bg-slate-50 shadow-inner" />
                    </div>
                    <Button type="submit" className="w-full h-16 bg-[#1E3A8A] text-white text-[13px] font-black shadow-2xl rounded-[22px] uppercase tracking-[0.2em]">AUTHORIZE DEPOSIT</Button>
                  </form>
               </div>
            </div>
          )}

          {activeTab === "gallery" && <DocumentStorage />}
          {activeTab === "settings" && <DemandLetterGenerator />}
        </div>
      </main>

      {/* Slimmer Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white h-20 px-8 flex items-center justify-between z-[100] nav-shadow rounded-t-[40px] border-t border-slate-100">
        <button onClick={() => setActiveTab("home")} className={cn("flex flex-col items-center gap-1.5", activeTab === "home" ? "text-[#1E3A8A]" : "text-slate-300")}><Home className="w-6 h-6"/><span className="text-[8px] font-black uppercase">Home</span></button>
        <button onClick={() => setActiveTab("members")} className={cn("flex flex-col items-center gap-1.5", activeTab === "members" ? "text-[#1E3A8A]" : "text-slate-300")}><Users className="w-6 h-6"/><span className="text-[8px] font-black uppercase">Profiles</span></button>
        <div className="relative -top-10"><button onClick={() => setActiveTab("add")} className="w-16 h-16 bg-gradient-to-br from-[#D4AF37] to-[#B8960C] rounded-full flex items-center justify-center text-white shadow-2xl border-[6px] border-[#F0F2F5] active:scale-90 transition-all"><Plus className="w-10 h-10"/></button></div>
        <button onClick={() => setActiveTab("gallery")} className={cn("flex flex-col items-center gap-1.5", activeTab === "gallery" ? "text-[#1E3A8A]" : "text-slate-300")}><ImageIcon className="w-6 h-6"/><span className="text-[8px] font-black uppercase">Gallery</span></button>
        <div className="flex flex-col items-center gap-1.5 text-slate-800"><div className="w-6 h-6 rounded-full bg-[#1E3A8A] text-white flex items-center justify-center text-[8px] font-black border-2 border-white">ADM</div><span className="text-[8px] font-black uppercase">Admin</span></div>
      </nav>
    </div>
  );
}
