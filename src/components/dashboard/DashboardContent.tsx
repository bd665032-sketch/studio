
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
  Bell,
  CloudSun,
  MapPin,
  Calendar,
  Moon,
  Info
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
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
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
    <div className="flex flex-col h-screen bg-[#F8FAFC] overflow-hidden">
      <main className="flex-1 overflow-y-auto pb-32">
        <div className="max-w-[480px] mx-auto px-4 pt-4 space-y-4">
          
          {activeTab === "home" && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 space-y-4">
              
              {/* Luxury Weather & Date Card */}
              <div className="luxury-card p-5 bg-gradient-to-br from-[#1E3A8A] via-[#1E40AF] to-[#3B82F6] text-white border-none relative overflow-hidden">
                <div className="absolute top-[-20px] right-[-20px] w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
                <div className="flex justify-between items-start relative z-10">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-[#D4AF37] font-black text-[10px] uppercase tracking-tighter">
                      <MapPin className="w-3 h-3" />
                      <span>Riyadh, Saudi Arabia</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <h1 className="text-5xl font-black">29°</h1>
                      <div className="flex flex-col">
                        <CloudSun className="w-8 h-8 text-white/80" />
                        <span className="text-[10px] font-bold text-white/60">Clear Sky</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[12px] font-black uppercase text-white/80">{currentTime.toLocaleDateString('en-US', { weekday: 'long' })}</p>
                    <p className="text-[20px] font-black text-[#D4AF37] leading-none">{currentTime.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}</p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Air Quality</span>
                    <span className="text-[11px] font-black text-green-400">Very High</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full">
                    <Info className="w-3 h-3 text-[#D4AF37]" />
                    <span className="text-[9px] font-black uppercase tracking-wider">Updates live</span>
                  </div>
                </div>
              </div>

              {/* Islamic Events Card */}
              <div className="luxury-card p-4 border-l-4 border-[#D4AF37] bg-white shadow-sm flex flex-col gap-3">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="w-4 h-4 text-[#1E40AF]" />
                  <h3 className="text-[11px] font-black text-[#1E3A8A] uppercase tracking-wider">Islamic Important Dates</h3>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-slate-50 p-2 rounded-xl text-center border border-slate-100">
                    <Moon className="w-3 h-3 text-[#D4AF37] mx-auto mb-1" />
                    <p className="text-[8px] font-black text-slate-400 uppercase">Ramadan 2025</p>
                    <p className="text-[10px] font-black text-[#1E40AF]">Feb 28</p>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-xl text-center border border-slate-100">
                    <div className="w-3 h-3 bg-[#D4AF37] rounded-full mx-auto mb-1 flex items-center justify-center text-[6px] text-white">H</div>
                    <p className="text-[8px] font-black text-slate-400 uppercase">Hajj 2025</p>
                    <p className="text-[10px] font-black text-[#1E40AF]">June 04</p>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-xl text-center border border-slate-100">
                    <Moon className="w-3 h-3 text-slate-300 mx-auto mb-1" />
                    <p className="text-[8px] font-black text-slate-400 uppercase">Ramadan 2026</p>
                    <p className="text-[10px] font-black text-[#1E40AF]">Feb 18</p>
                  </div>
                </div>
              </div>

              {/* Portfolio Summary Card */}
              <div className="luxury-card p-6 relative overflow-hidden text-white border-none bg-gradient-to-r from-[#6366F1] to-[#3B82F6] shadow-xl">
                 <div className="absolute right-[-10px] top-[-10px] opacity-10">
                    <Bell className="w-24 h-24 rotate-12" />
                 </div>
                 <div className="flex justify-between items-start mb-6">
                    <div>
                      <p className="text-white/60 text-[9px] font-black uppercase tracking-widest mb-1">Portfolio Summary</p>
                      <h1 className="text-xl font-black">Collection Overview</h1>
                    </div>
                    <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md border border-white/20">
                      <Plus className="w-4 h-4 text-[#D4AF37]" />
                    </div>
                 </div>
                 
                 <div className="flex justify-between items-end">
                    <div className="space-y-1">
                      <p className="text-[9px] font-bold text-white/50 uppercase">Total Balance</p>
                      <h2 className="text-3xl font-black text-white">৳{totalCollection.toLocaleString()}</h2>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="text-[9px] font-bold text-white/50 uppercase">Active Members</p>
                      <h2 className="text-3xl font-black text-[#D4AF37]">{members.length}</h2>
                    </div>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setActiveTab("members")} className="luxury-card p-4 flex flex-col items-start active:scale-95 transition-transform border-l-4 border-indigo-400">
                  <BookOpen className="w-5 h-5 text-indigo-500 mb-2" />
                  <h3 className="text-[13px] font-black text-indigo-900">Members</h3>
                  <p className="text-slate-400 text-[9px] font-bold">{members.length} registered</p>
                </button>
                <button onClick={() => setActiveTab("gallery")} className="luxury-card p-4 flex flex-col items-start active:scale-95 transition-transform border-l-4 border-blue-400">
                  <ClipboardList className="w-5 h-5 text-blue-500 mb-2" />
                  <h3 className="text-[13px] font-black text-blue-900">Gallery</h3>
                  <p className="text-slate-400 text-[9px] font-bold">Photo Storage</p>
                </button>
              </div>

              <div className="space-y-3">
                <button 
                  onClick={() => setActiveTab("settings")}
                  className="w-full bg-[#1E3A8A] rounded-[20px] p-4 flex items-center justify-between text-white active:scale-[0.98] transition-all shadow-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-white/10 p-2 rounded-lg">
                      <FileText className="w-5 h-5 text-[#D4AF37]" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-[12px] font-black">Demand Letter Generator</h3>
                      <p className="text-white/40 text-[8px] font-bold uppercase tracking-wider">Official Documents</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-white/30" />
                </button>

                <button 
                  className="pdf-btn-luxury h-11 border-2 border-[#D4AF37] shadow-lg" 
                  onClick={() => exportSummaryPDF(filteredTransactions, selectedMonth, totalCollection)}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Download className="w-4 h-4" /> 
                    <span className="uppercase tracking-widest font-black">Export Summary PDF</span>
                  </div>
                </button>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between px-1">
                  <h4 className="font-black text-[#1E3A8A] text-[10px] uppercase tracking-wider">Monthly Logs</h4>
                  <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                    <SelectTrigger className="w-32 bg-white border border-slate-100 shadow-sm rounded-xl text-[10px] font-black h-9 text-[#1E3A8A]">
                      <SelectValue placeholder="All Months" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-none shadow-2xl z-[1000]">
                      <SelectItem value="All" className="text-[11px] font-black">All Time</SelectItem>
                      {months.map(m => <SelectItem key={m} value={m} className="text-[11px] font-black">{m}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  {filteredTransactions.length > 0 ? (
                    filteredTransactions.map(t => (
                      <div key={t.id} className="luxury-card p-4 flex items-center justify-between border-slate-50 hover:border-[#1E3A8A]/20 transition-all">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center font-black text-blue-600 text-[12px]">{t.n.charAt(0)}</div>
                          <div>
                            <p className="font-black text-slate-800 text-[13px]">{t.n}</p>
                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">{t.d} • {t.c}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <p className="font-black text-[#1E3A8A] text-[13px]">৳{t.a.toLocaleString()}</p>
                          <button onClick={() => { if(confirm('ডিলিট করতে চান?')) deleteTransaction(t.id); }} className="p-2 text-slate-200 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 text-slate-400 font-black text-[10px] uppercase bg-white rounded-[24px] border border-dashed border-slate-200">
                      No transactions found for this period
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "members" && (
            <div className="animate-in fade-in slide-in-from-right-2 duration-300 space-y-4">
               <div className="flex items-center gap-3"><Button variant="ghost" size="sm" onClick={() => setActiveTab("home")} className="p-0 h-8 w-8 rounded-full bg-white shadow-sm"><ChevronRight className="rotate-180 w-4 h-4" /></Button><h2 className="font-black text-[#1E3A8A] text-sm uppercase">Members Management</h2></div>
               <div className="luxury-card p-6">
                  <div className="flex gap-2 mb-6"><Input placeholder="Enter Member Name" value={newMember} onChange={e=>setNewMember(e.target.value)} className="h-12 border-slate-100 text-sm font-black" /><Button onClick={()=>{if(newMember)addMember(newMember);setNewMember("")}} className="bg-[#1E3A8A] hover:bg-[#1E40AF] h-12 px-6 rounded-xl font-black text-xs">ADD</Button></div>
                  <div className="space-y-3">{members.map(m=><div key={m} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-[#D4AF37]/30 transition-all"><span className="font-black text-[13px] text-slate-700">{m}</span><button onClick={()=>deleteMember(m)} className="p-2 text-slate-300 hover:text-red-500"><Trash2 className="w-4 h-4"/></button></div>)}</div>
               </div>
            </div>
          )}

          {activeTab === "add" && (
            <div className="animate-in fade-in zoom-in-95 duration-300">
               <div className="luxury-card p-8 shadow-2xl border-t-[6px] border-[#D4AF37]">
                  <h3 className="text-center font-black text-[#1E3A8A] text-lg mb-8 uppercase tracking-widest">New Deposit</h3>
                  <form onSubmit={handleDeposit} className="space-y-6">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black text-slate-400 uppercase px-1 tracking-wider">Select Foundation Member</Label>
                      <Select onValueChange={v=>setDeposit({...deposit, member:v})}>
                        <SelectTrigger className="h-14 font-black text-[#1E3A8A] rounded-2xl border-slate-100 bg-slate-50"><SelectValue placeholder="Choose a member"/></SelectTrigger>
                        <SelectContent className="bg-white z-[1000]">{members.map(m=><SelectItem key={m} value={m} className="font-black text-[#1E3A8A]">{m}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black text-slate-400 uppercase px-1 tracking-wider">Amount (TK)</Label>
                      <Input type="number" value={deposit.amount} onChange={e=>setDeposit({...deposit, amount:Number(e.target.value)})} className="h-14 text-lg font-black border-slate-100 bg-slate-50" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black text-slate-400 uppercase px-1 tracking-wider">Transaction Date</Label>
                      <Input type="date" value={deposit.date} onChange={e=>setDeposit({...deposit, date:e.target.value})} className="h-14 font-black border-slate-100 bg-slate-50" />
                    </div>
                    <Button type="submit" className="w-full h-14 bg-[#1E3A8A] hover:bg-[#1E40AF] text-white text-sm font-black shadow-xl mt-4 rounded-2xl uppercase tracking-widest">SAVE TRANSACTION</Button>
                  </form>
               </div>
            </div>
          )}

          {activeTab === "gallery" && <DocumentStorage />}
          {activeTab === "settings" && <DemandLetterGenerator />}
        </div>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white md:h-22 h-20 px-8 flex items-center justify-between z-[100] nav-shadow rounded-t-[35px] border-t border-slate-100 transition-all">
        <button onClick={() => setActiveTab("home")} className={cn("flex flex-col items-center gap-1.5 transition-all", activeTab === "home" ? "text-[#1E3A8A] scale-110" : "text-slate-300")}><Home className="md:w-6 md:h-6 w-5 h-5"/><span className="text-[8px] font-black uppercase tracking-tighter">Home</span></button>
        <button onClick={() => setActiveTab("members")} className={cn("flex flex-col items-center gap-1.5 transition-all", activeTab === "members" ? "text-[#1E3A8A] scale-110" : "text-slate-300")}><Users className="md:w-6 md:h-6 w-5 h-5"/><span className="text-[8px] font-black uppercase tracking-tighter">Members</span></button>
        <div className="relative -top-8"><button onClick={() => setActiveTab("add")} className="md:w-16 md:h-16 w-14 h-14 bg-gradient-to-br from-[#D4AF37] to-[#B8960C] rounded-full flex items-center justify-center text-white shadow-2xl border-[6px] border-[#F8FAFC] active:scale-90 transition-all"><Plus className="w-8 h-8"/></button></div>
        <button onClick={() => setActiveTab("gallery")} className={cn("flex flex-col items-center gap-1.5 transition-all", activeTab === "gallery" ? "text-[#1E3A8A] scale-110" : "text-slate-300")}><ImageIcon className="md:w-6 md:h-6 w-5 h-5"/><span className="text-[8px] font-black uppercase tracking-tighter">Gallery</span></button>
        <div className="flex flex-col items-center gap-1.5 text-slate-800"><div className="md:w-6 md:h-6 w-5 h-5 rounded-full bg-[#1E3A8A] text-white flex items-center justify-center text-[8px] font-black border-2 border-white shadow-sm">N</div><span className="text-[8px] font-black uppercase tracking-tighter">Profile</span></div>
      </nav>
    </div>
  );
}

