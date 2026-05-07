"use client";

import { useState } from "react";
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
              {/* Luxury Summary Card with Purple-Blue-Gold mix */}
              <div className="luxury-card p-6 relative overflow-hidden purple-blue-gold-card text-white border-none">
                 <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-white/70 text-[9px] font-black uppercase tracking-widest mb-1">Portfolio Summary</p>
                      <h1 className="text-xl font-black">Collection Overview</h1>
                    </div>
                    <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm">
                      <Bell className="w-4 h-4 text-[#D4AF37]" />
                    </div>
                 </div>
                 
                 <div className="flex justify-between items-end">
                    <div className="space-y-1">
                      <p className="text-[9px] font-bold text-white/60 uppercase">Total Balance</p>
                      <h2 className="text-2xl font-black text-white">৳{totalCollection.toLocaleString()}</h2>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="text-[9px] font-bold text-white/60 uppercase">Active Members</p>
                      <h2 className="text-2xl font-black text-[#D4AF37]">{members.length}</h2>
                    </div>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setActiveTab("members")} className="luxury-card p-4 flex flex-col items-start active:scale-95 transition-transform border-l-4 border-indigo-400">
                  <BookOpen className="w-5 h-5 text-indigo-500 mb-2" />
                  <h3 className="text-[13px] font-black text-indigo-900">Members</h3>
                  <p className="text-slate-400 text-[9px]">{members.length} registered</p>
                </button>
                <button onClick={() => setActiveTab("gallery")} className="luxury-card p-4 flex flex-col items-start active:scale-95 transition-transform border-l-4 border-blue-400">
                  <ClipboardList className="w-5 h-5 text-blue-500 mb-2" />
                  <h3 className="text-[13px] font-black text-blue-900">Gallery</h3>
                  <p className="text-slate-400 text-[9px]">Photo Storage</p>
                </button>
              </div>

              <div className="space-y-3">
                {/* Demand Letter Generator */}
                <button 
                  onClick={() => setActiveTab("settings")}
                  className="w-full bg-blue-700 rounded-[20px] p-4 flex items-center justify-between text-white active:scale-[0.98] transition-all shadow-lg"
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

                {/* PDF Button - Placed between Demand Letter and Logs as requested */}
                <button 
                  className="pdf-btn-luxury h-10" 
                  onClick={() => exportSummaryPDF(filteredTransactions, selectedMonth, totalCollection)}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Download className="w-3.5 h-3.5" /> 
                    <span>Export Summary PDF</span>
                  </div>
                </button>
              </div>

              {/* Monthly Logs Section */}
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between px-1">
                  <h4 className="font-black text-blue-900 text-[10px] uppercase tracking-wider">Monthly Logs</h4>
                  <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                    <SelectTrigger className="w-28 bg-white border border-slate-100 shadow-sm rounded-xl text-[10px] font-black h-8 text-blue-900">
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
                      <div key={t.id} className="luxury-card p-3 flex items-center justify-between border-slate-50">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center font-black text-blue-600 text-[11px]">{t.n.charAt(0)}</div>
                          <div>
                            <p className="font-bold text-slate-800 text-[12px]">{t.n}</p>
                            <p className="text-[8px] text-slate-400 font-medium">{t.d} • {t.c}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <p className="font-black text-blue-900 text-[12px]">৳{t.a.toLocaleString()}</p>
                          <button onClick={() => { if(confirm('ডিলিট করতে চান?')) deleteTransaction(t.id); }} className="p-1.5 text-slate-200 hover:text-red-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-10 text-slate-400 font-bold text-xs bg-white rounded-[20px] border border-dashed border-slate-100">
                      এই মাসে কোনো লেনদেন পাওয়া যায়নি
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "members" && (
            <div className="animate-in fade-in slide-in-from-right-2 duration-300 space-y-4">
               <div className="flex items-center gap-3"><Button variant="ghost" size="sm" onClick={() => setActiveTab("home")} className="p-0 h-7 w-7 rounded-full bg-white"><ChevronRight className="rotate-180 w-4 h-4" /></Button><h2 className="font-black text-blue-900 text-sm">Members Management</h2></div>
               <div className="luxury-card p-4">
                  <div className="flex gap-2 mb-4"><Input placeholder="Enter Member Name" value={newMember} onChange={e=>setNewMember(e.target.value)} className="h-10 border-slate-100 text-sm" /><Button onClick={()=>{if(newMember)addMember(newMember);setNewMember("")}} className="bg-blue-600 hover:bg-blue-700 h-10 px-4 rounded-xl font-black text-xs">ADD</Button></div>
                  <div className="space-y-2">{members.map(m=><div key={m} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl"><span className="font-bold text-[12px] text-slate-700">{m}</span><button onClick={()=>deleteMember(m)} className="p-1.5 text-slate-300 hover:text-red-500"><Trash2 className="w-3.5 h-3.5"/></button></div>)}</div>
               </div>
            </div>
          )}

          {activeTab === "add" && (
            <div className="animate-in fade-in zoom-in-95 duration-300">
               <div className="luxury-card p-6 shadow-xl border-t-4 border-[#D4AF37]">
                  <h3 className="text-center font-black text-blue-900 text-md mb-6 uppercase tracking-wider">New Member Deposit</h3>
                  <form onSubmit={handleDeposit} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label className="text-[9px] font-bold text-slate-400 uppercase px-1">Select Member</Label>
                      <Select onValueChange={v=>setDeposit({...deposit, member:v})}>
                        <SelectTrigger className="h-12 font-black text-blue-900 rounded-xl border-slate-100"><SelectValue placeholder="Choose a member"/></SelectTrigger>
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
                    <Button type="submit" className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white text-sm font-black shadow-lg mt-2 rounded-xl">SAVE TRANSACTION</Button>
                  </form>
               </div>
            </div>
          )}

          {activeTab === "gallery" && <DocumentStorage />}
          {activeTab === "settings" && <DemandLetterGenerator />}
        </div>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white md:h-20 h-16 px-8 flex items-center justify-between z-[100] nav-shadow rounded-t-[24px] border-t border-slate-50 transition-all">
        <button onClick={() => setActiveTab("home")} className={cn("flex flex-col items-center gap-1", activeTab === "home" ? "text-blue-600" : "text-slate-300")}><Home className="md:w-5 md:h-5 w-4 h-4"/><span className="text-[7px] font-black uppercase">Home</span></button>
        <button onClick={() => setActiveTab("members")} className={cn("flex flex-col items-center gap-1", activeTab === "members" ? "text-blue-600" : "text-slate-300")}><Users className="md:w-5 md:h-5 w-4 h-4"/><span className="text-[7px] font-black uppercase">Members</span></button>
        <div className="relative -top-6"><button onClick={() => setActiveTab("add")} className="md:w-14 md:h-14 w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-xl border-[4px] border-[#F8FAFC] active:scale-90 transition-transform"><Plus className="w-6 h-6"/></button></div>
        <button onClick={() => setActiveTab("gallery")} className={cn("flex flex-col items-center gap-1", activeTab === "gallery" ? "text-blue-600" : "text-slate-300")}><ImageIcon className="md:w-5 md:h-5 w-4 h-4"/><span className="text-[7px] font-black uppercase">Gallery</span></button>
        <div className="flex flex-col items-center gap-1 text-slate-800"><div className="md:w-5 md:h-5 w-4 h-4 rounded-full bg-blue-900 text-white flex items-center justify-center text-[7px] font-black">N</div><span className="text-[7px] font-black uppercase">Profile</span></div>
      </nav>
    </div>
  );
}
