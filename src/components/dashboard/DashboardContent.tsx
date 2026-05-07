"use client";

import { useState } from "react";
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
  Video
} from "lucide-react";
import { exportSummaryPDF } from "@/lib/pdf-utils";
import DemandLetterGenerator from "./DemandLetterGenerator";
import DocumentStorage from "./DocumentStorage";
import { cn } from "@/lib/utils";

const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export default function DashboardContent() {
  const { members, transactions, addMember, deleteMember, addTransaction } = useMinarData();
  const [activeTab, setActiveTab] = useState("home");
  const [selectedMonth, setSelectedMonth] = useState("All");
  const [newMember, setNewMember] = useState("");
  const [deposit, setDeposit] = useState({ member: "", amount: 5000, category: "প্রতি মাসের জমা", date: new Date().toISOString().split('T')[0] });
  const { toast } = useToast();

  const filteredTransactions = transactions.filter(t => {
    if (selectedMonth === "All") return true;
    if (!t.d) return false;
    // Assuming t.d is in format YYYY-MM-DD
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

  return (
    <div className="flex flex-col h-screen bg-[#F8FAFC] overflow-hidden">
      <main className="flex-1 overflow-y-auto pb-28">
        <div className="max-w-[450px] mx-auto px-4 pt-4 space-y-4">
          
          {activeTab === "home" && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-4">
              {/* Luxury Summary Card */}
              <div className="bg-luxury-purple rounded-[24px] p-5 text-white shadow-lg">
                <p className="text-white/70 text-[10px] font-bold uppercase tracking-widest mb-1">Foundations Overview</p>
                <h1 className="text-lg font-black leading-tight">Minar Go Connect</h1>
                
                <div className="grid grid-cols-3 gap-2 mt-4">
                  <div className="bg-white/10 rounded-xl p-2 text-center backdrop-blur-md">
                    <p className="text-sm font-black">৳{totalCollection}</p>
                    <p className="text-[8px] text-white/60 uppercase">Total</p>
                  </div>
                  <div className="bg-white/10 rounded-xl p-2 text-center backdrop-blur-md">
                    <p className="text-sm font-black">{members.length}</p>
                    <p className="text-[8px] text-white/60 uppercase">Members</p>
                  </div>
                  <div className="bg-white/10 rounded-xl p-2 text-center backdrop-blur-md">
                    <p className="text-sm font-black">{filteredTransactions.length}</p>
                    <p className="text-[8px] text-white/60 uppercase">Logs</p>
                  </div>
                </div>
              </div>

              {/* Luxury Feature Grid */}
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setActiveTab("members")}
                  className="col-span-2 bg-luxury-coral rounded-[20px] p-4 text-white flex flex-col items-start relative active:scale-95 transition-transform"
                >
                  <div className="bg-white/20 p-1.5 rounded-lg mb-2">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-black">Members</h3>
                  <p className="text-white/70 text-[9px]">{members.length} registered</p>
                  <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40" />
                </button>

                <button 
                  onClick={() => setActiveTab("gallery")}
                  className="bg-luxury-yellow rounded-[20px] p-4 text-white flex flex-col items-start relative active:scale-95 transition-transform"
                >
                  <div className="bg-white/20 p-1.5 rounded-lg mb-2">
                    <ClipboardList className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-black">Gallery</h3>
                  <p className="text-white/70 text-[9px]">Photo Storage</p>
                </button>

                <button 
                  onClick={() => setActiveTab("settings")}
                  className="bg-luxury-green rounded-[20px] p-4 text-white flex flex-col items-start relative active:scale-95 transition-transform"
                >
                  <div className="bg-white/20 p-1.5 rounded-lg mb-2">
                    <Video className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-black">Generator</h3>
                  <p className="text-white/70 text-[9px]">Demand Letters</p>
                </button>
              </div>

              {/* Monthly Activity List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-primary text-[10px] uppercase tracking-wider">Recent Activity</h4>
                  <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                    <SelectTrigger className="w-24 bg-white border-none shadow-sm rounded-lg text-[9px] font-bold h-7">
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Months</SelectItem>
                      {months.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <Card className="bg-white border-none shadow-sm rounded-[24px] overflow-hidden">
                  <CardContent className="p-0">
                    <div className="divide-y divide-slate-50">
                      {filteredTransactions.length === 0 ? (
                        <div className="py-8 text-center text-slate-300 italic text-[10px]">No transactions for {selectedMonth}</div>
                      ) : (
                        filteredTransactions.map(t => (
                          <div key={t.id} className="flex items-center justify-between p-3 active:bg-slate-50">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center font-bold text-primary text-[9px]">
                                {t.n.charAt(0)}
                              </div>
                              <div>
                                <p className="font-bold text-slate-800 text-[11px]">{t.n}</p>
                                <p className="text-[8px] text-slate-400 font-medium">{t.d}</p>
                              </div>
                            </div>
                            <span className="font-black text-primary text-[11px]">৳{t.a}</span>
                          </div>
                        ))
                      )}
                      {filteredTransactions.length > 0 && (
                        <Button variant="ghost" className="w-full h-9 text-primary font-bold text-[9px]" onClick={() => exportSummaryPDF(filteredTransactions, `${selectedMonth} Report`, totalCollection)}>
                          <Download className="w-3 h-3 mr-1.5" /> Export PDF
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeTab === "members" && (
            <div className="animate-in fade-in slide-in-from-right-2 duration-300 space-y-4">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => setActiveTab("home")} className="p-0 h-6 w-6 rounded-full bg-slate-100">
                  <ChevronRight className="w-3 h-3 rotate-180" />
                </Button>
                <h2 className="text-base font-black text-primary">Member List</h2>
              </div>
              <Card className="bg-white border-none shadow-sm rounded-[24px] p-4">
                <div className="flex gap-2 mb-4">
                  <Input placeholder="Full Name" value={newMember} onChange={(e) => setNewMember(e.target.value)} className="rounded-xl h-10 text-xs" />
                  <Button onClick={() => { if(newMember) addMember(newMember); setNewMember(""); }} className="bg-primary rounded-xl px-4 h-10 text-xs font-bold">Add</Button>
                </div>
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {members.map(m => (
                    <div key={m} className="flex items-center justify-between bg-slate-50 p-3 rounded-xl">
                      <span className="font-bold text-slate-700 text-xs">{m}</span>
                      <button onClick={() => { if(confirm('সদস্যকে মুছে ফেলতে চান?')) deleteMember(m); }} className="text-red-300 hover:text-red-500">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {activeTab === "add" && (
            <div className="animate-in fade-in zoom-in-95 duration-300">
              <Card className="bg-white border-none shadow-lg rounded-[28px] overflow-hidden">
                <div className="bg-luxury-purple p-5 text-white text-center">
                  <h3 className="text-base font-black">New Deposit</h3>
                  <p className="text-white/60 text-[9px] mt-0.5">অ্যাকাউন্টে টাকা জমা দিন</p>
                </div>
                <CardContent className="p-5 space-y-4">
                  <form onSubmit={handleDeposit} className="space-y-4">
                    <div className="space-y-1">
                      <Label className="font-bold ml-1 text-slate-400 text-[8px] uppercase tracking-widest">Select Member</Label>
                      <Select onValueChange={(v) => setDeposit({...deposit, member: v})}>
                        <SelectTrigger className="h-11 rounded-xl bg-slate-50 border-none font-bold text-xs text-slate-900">
                          <SelectValue placeholder="মেম্বার সিলেক্ট করুন" />
                        </SelectTrigger>
                        <SelectContent>
                          {members.map(m => <SelectItem key={m} value={m} className="text-xs font-bold">{m}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="font-bold ml-1 text-slate-400 text-[8px] uppercase tracking-widest">Category</Label>
                      <Select value={deposit.category} onValueChange={(v) => setDeposit({...deposit, category: v})}>
                        <SelectTrigger className="h-11 rounded-xl bg-slate-50 border-none font-bold text-xs text-slate-900">
                          <SelectValue placeholder="ক্যাটাগরি" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="প্রতি মাসের জমা" className="text-xs font-bold">প্রতি মাসের জমা</SelectItem>
                          <SelectItem value="যাকাত" className="text-xs font-bold">যাকাত</SelectItem>
                          <SelectItem value="বিশেষ অনুদান" className="text-xs font-bold">বিশেষ অনুদান</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="font-bold ml-1 text-slate-400 text-[8px] uppercase tracking-widest">Amount</Label>
                        <Input type="number" value={deposit.amount} onChange={(e) => setDeposit({...deposit, amount: Number(e.target.value)})} className="h-11 rounded-xl text-xs" />
                      </div>
                      <div className="space-y-1">
                        <Label className="font-bold ml-1 text-slate-400 text-[8px] uppercase tracking-widest">Date</Label>
                        <Input type="date" value={deposit.date} onChange={(e) => setDeposit({...deposit, date: e.target.value})} className="h-11 rounded-xl text-[10px] font-bold" />
                      </div>
                    </div>
                    <Button className="w-full h-12 rounded-xl bg-luxury-purple text-white font-black text-xs shadow-md active:scale-95 transition-all mt-2">
                      Save Deposit
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "gallery" && <div className="animate-in fade-in slide-in-from-left-2 duration-300"><DocumentStorage /></div>}
          {activeTab === "settings" && <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-4"><DemandLetterGenerator /></div>}
        </div>
      </main>

      {/* Luxury Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white h-18 px-6 flex items-center justify-between z-[100] nav-shadow rounded-t-[28px]">
        <button 
          onClick={() => setActiveTab("home")} 
          className={cn("flex flex-col items-center gap-1 transition-all", activeTab === "home" ? "text-primary scale-110" : "text-slate-300")}
        >
          <Home className={cn("w-5 h-5", activeTab === "home" && "fill-primary/10")} />
          <span className="text-[8px] font-black uppercase">Home</span>
        </button>

        <button 
          onClick={() => setActiveTab("members")} 
          className={cn("flex flex-col items-center gap-1 transition-all", activeTab === "members" ? "text-primary scale-110" : "text-slate-300")}
        >
          <Users className={cn("w-5 h-5", activeTab === "members" && "fill-primary/10")} />
          <span className="text-[8px] font-black uppercase">Members</span>
        </button>

        <div className="relative -top-6">
          <button 
            onClick={() => setActiveTab("add")} 
            className="w-14 h-14 bg-luxury-purple rounded-full flex items-center justify-center text-white shadow-xl border-[5px] border-[#F8FAFC] active:scale-90 transition-transform"
          >
            <Plus className="w-8 h-8 font-black" />
          </button>
        </div>

        <button 
          onClick={() => setActiveTab("gallery")} 
          className={cn("flex flex-col items-center gap-1 transition-all", activeTab === "gallery" ? "text-primary scale-110" : "text-slate-300")}
        >
          <ImageIcon className={cn("w-5 h-5", activeTab === "gallery" && "fill-primary/10")} />
          <span className="text-[8px] font-black uppercase">Gallery</span>
        </button>

        <button 
          onClick={() => setActiveTab("settings")} 
          className={cn("flex flex-col items-center gap-1 transition-all", activeTab === "settings" ? "text-primary scale-110" : "text-slate-300")}
        >
          <SettingsIcon className={cn("w-5 h-5", activeTab === "settings" && "fill-primary/10")} />
          <span className="text-[8px] font-black uppercase">Menu</span>
        </button>
      </nav>
    </div>
  );
}