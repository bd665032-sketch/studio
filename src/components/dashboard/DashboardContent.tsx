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
    const month = new Date(t.d).toLocaleString('en-US', { month: 'long' });
    return month === selectedMonth;
  });

  const totalCollection = filteredTransactions.reduce((acc, curr) => acc + curr.a, 0);

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deposit.member) return toast({ variant: "destructive", title: "Error", description: "Select a member" });
    await addTransaction(deposit.member, deposit.amount, deposit.date, deposit.category);
    setDeposit({...deposit, member: "", amount: 5000, category: "প্রতি মাসের জমা", date: new Date().toISOString().split('T')[0]});
    setActiveTab("home");
    toast({ title: "সফল!", description: "ডিপোজিট সেভ হয়েছে।" });
  };

  return (
    <div className="flex flex-col h-screen bg-[#F8FAFC] overflow-hidden">
      <main className="flex-1 overflow-y-auto pb-28">
        <div className="max-w-[450px] mx-auto px-4 pt-4 space-y-5">
          
          {activeTab === "home" && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-400 space-y-5">
              {/* Compact Welcome Card */}
              <div className="bg-luxury-purple rounded-[28px] p-5 text-white shadow-lg">
                <p className="text-white/70 text-[10px] font-bold uppercase tracking-widest">Dashboard Overview</p>
                <h1 className="text-xl font-black mt-1 mb-4 leading-tight">Minar Go Connect</h1>
                
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-white/10 rounded-xl p-2.5 text-center backdrop-blur-md">
                    <p className="text-sm font-black">৳{totalCollection}</p>
                    <p className="text-[9px] text-white/60 uppercase">Total</p>
                  </div>
                  <div className="bg-white/10 rounded-xl p-2.5 text-center backdrop-blur-md">
                    <p className="text-sm font-black">{members.length}</p>
                    <p className="text-[9px] text-white/60 uppercase">Members</p>
                  </div>
                  <div className="bg-white/10 rounded-xl p-2.5 text-center backdrop-blur-md">
                    <p className="text-sm font-black">{transactions.length}</p>
                    <p className="text-[9px] text-white/60 uppercase">Logs</p>
                  </div>
                </div>
              </div>

              {/* Grid Feature Cards - Scaled for Mobile */}
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setActiveTab("members")}
                  className="col-span-2 bg-luxury-coral rounded-[24px] p-5 text-white flex flex-col items-start relative overflow-hidden active:scale-95 transition-transform"
                >
                  <div className="bg-white/20 p-2 rounded-lg mb-3">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-black">Members</h3>
                  <p className="text-white/70 text-[10px]">{members.length} members found</p>
                  <ChevronRight className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 opacity-40" />
                </button>

                <button 
                  onClick={() => setActiveTab("gallery")}
                  className="bg-luxury-yellow rounded-[24px] p-5 text-white flex flex-col items-start relative active:scale-95 transition-transform"
                >
                  <div className="bg-white/20 p-2 rounded-lg mb-3">
                    <ClipboardList className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-black">Gallery</h3>
                  <p className="text-white/70 text-[10px]">View photos</p>
                </button>

                <button 
                  onClick={() => setActiveTab("settings")}
                  className="bg-luxury-green rounded-[24px] p-5 text-white flex flex-col items-start relative active:scale-95 transition-transform"
                >
                  <div className="bg-white/20 p-2 rounded-lg mb-3">
                    <Video className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-black">Menu</h3>
                  <p className="text-white/70 text-[10px]">App Settings</p>
                </button>
              </div>

              {/* Compact History */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-primary text-[10px] uppercase tracking-wider">Recent Activity</h4>
                  <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                    <SelectTrigger className="w-28 bg-slate-100 border-none shadow-none rounded-lg text-[10px] font-bold h-8">
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Months</SelectItem>
                      {months.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <Card className="bg-white border-none shadow-none rounded-[24px] overflow-hidden">
                  <CardContent className="p-0">
                    <div className="divide-y divide-slate-50">
                      {filteredTransactions.length === 0 ? (
                        <div className="py-6 text-center text-slate-300 italic text-[10px]">No recent data</div>
                      ) : (
                        filteredTransactions.slice(0, 4).map(t => (
                          <div key={t.id} className="flex items-center justify-between p-3.5">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-primary text-[10px]">
                                {t.n.charAt(0)}
                              </div>
                              <div>
                                <p className="font-bold text-slate-800 text-xs">{t.n}</p>
                                <p className="text-[9px] text-slate-400 font-medium">{t.d}</p>
                              </div>
                            </div>
                            <span className="font-black text-primary text-xs">৳{t.a}</span>
                          </div>
                        ))
                      )}
                      {filteredTransactions.length > 0 && (
                        <Button variant="ghost" className="w-full h-10 text-primary font-bold text-[10px]" onClick={() => exportSummaryPDF(filteredTransactions, `${selectedMonth} Report`, totalCollection)}>
                          <Download className="w-3.5 h-3.5 mr-1.5" /> PDF Summary
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeTab === "members" && (
            <div className="animate-in fade-in slide-in-from-right-2 duration-400 space-y-4">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => setActiveTab("home")} className="p-0 h-7 w-7 rounded-full bg-slate-100">
                  <ChevronRight className="w-4 h-4 rotate-180" />
                </Button>
                <h2 className="text-lg font-black text-primary">Members</h2>
              </div>
              <Card className="bg-white border-none shadow-none rounded-[28px] p-5">
                <div className="flex gap-2 mb-5">
                  <Input placeholder="Member Name" value={newMember} onChange={(e) => setNewMember(e.target.value)} className="rounded-xl h-11" />
                  <Button onClick={() => { if(newMember) addMember(newMember); setNewMember(""); }} className="bg-primary rounded-xl px-5 h-11 text-xs font-bold">Add</Button>
                </div>
                <div className="space-y-2">
                  {members.map(m => (
                    <div key={m} className="flex items-center justify-between bg-slate-50 p-3.5 rounded-xl">
                      <span className="font-bold text-slate-700 text-xs">{m}</span>
                      <button onClick={() => { if(confirm('Delete member?')) deleteMember(m); }} className="text-red-300 hover:text-red-500">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {activeTab === "add" && (
            <div className="animate-in fade-in zoom-in-95 duration-400">
              <Card className="bg-white border-none shadow-sm rounded-[32px] overflow-hidden">
                <div className="bg-luxury-purple p-6 text-white text-center">
                  <h3 className="text-lg font-black">New Deposit</h3>
                  <p className="text-white/60 text-[10px] mt-0.5">অ্যাকাউন্টে টাকা জমা দিন</p>
                </div>
                <CardContent className="p-6 space-y-4">
                  <form onSubmit={handleDeposit} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label className="font-bold ml-1 text-slate-400 text-[9px] uppercase tracking-widest">Select Member</Label>
                      <Select onValueChange={(v) => setDeposit({...deposit, member: v})}>
                        <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-none font-bold text-xs">
                          <SelectValue placeholder="সিলেক্ট মেম্বার" />
                        </SelectTrigger>
                        <SelectContent>
                          {members.map(m => <SelectItem key={m} value={m} className="text-xs font-medium">{m}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="font-bold ml-1 text-slate-400 text-[9px] uppercase tracking-widest">Category</Label>
                      <Select value={deposit.category} onValueChange={(v) => setDeposit({...deposit, category: v})}>
                        <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-none font-bold text-xs">
                          <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="প্রতি মাসের জমা" className="text-xs">প্রতি মাসের জমা</SelectItem>
                          <SelectItem value="যাকাত" className="text-xs">যাকাত</SelectItem>
                          <SelectItem value="বাড়ির কাজ" className="text-xs">বাড়ির কাজ</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="font-bold ml-1 text-slate-400 text-[9px] uppercase tracking-widest">Amount</Label>
                        <Input type="number" value={deposit.amount} onChange={(e) => setDeposit({...deposit, amount: Number(e.target.value)})} className="h-12 rounded-xl" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="font-bold ml-1 text-slate-400 text-[9px] uppercase tracking-widest">Date</Label>
                        <Input type="date" value={deposit.date} onChange={(e) => setDeposit({...deposit, date: e.target.value})} className="h-12 rounded-xl text-[10px] font-bold" />
                      </div>
                    </div>
                    <Button className="w-full h-14 rounded-2xl bg-luxury-purple text-white font-black text-sm shadow-md active:scale-95 transition-all mt-4">
                      Save Deposit
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "gallery" && <div className="animate-in fade-in slide-in-from-left-2 duration-400"><DocumentStorage /></div>}
          {activeTab === "settings" && <div className="animate-in fade-in slide-in-from-bottom-2 duration-400 space-y-5"><DemandLetterGenerator /></div>}
        </div>
      </main>

      {/* Luxury Bottom Navigation - Slimmer for Mobile */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white h-20 px-4 flex items-center justify-between z-[100] nav-shadow rounded-t-[32px]">
        <button 
          onClick={() => setActiveTab("home")} 
          className={cn("flex flex-col items-center gap-1 transition-all", activeTab === "home" ? "text-primary" : "text-slate-300")}
        >
          <Home className={cn("w-5 h-5", activeTab === "home" && "fill-primary/10")} />
          <span className="text-[9px] font-black uppercase tracking-tighter">Explore</span>
        </button>

        <button 
          onClick={() => setActiveTab("members")} 
          className={cn("flex flex-col items-center gap-1 transition-all", activeTab === "members" ? "text-primary" : "text-slate-300")}
        >
          <Users className={cn("w-5 h-5", activeTab === "members" && "fill-primary/10")} />
          <span className="text-[9px] font-black uppercase tracking-tighter">Library</span>
        </button>

        <div className="relative -top-8">
          <button 
            onClick={() => setActiveTab("add")} 
            className="w-16 h-16 bg-luxury-purple rounded-full flex items-center justify-center text-white shadow-xl border-[6px] border-[#F8FAFC] active:scale-90 transition-transform"
          >
            <Plus className="w-9 h-9 font-black" />
          </button>
        </div>

        <button 
          onClick={() => setActiveTab("gallery")} 
          className={cn("flex flex-col items-center gap-1 transition-all", activeTab === "gallery" ? "text-primary" : "text-slate-300")}
        >
          <ImageIcon className={cn("w-5 h-5", activeTab === "gallery" && "fill-primary/10")} />
          <span className="text-[9px] font-black uppercase tracking-tighter">Gallery</span>
        </button>

        <button 
          onClick={() => setActiveTab("settings")} 
          className={cn("flex flex-col items-center gap-1 transition-all", activeTab === "settings" ? "text-primary" : "text-slate-300")}
        >
          <SettingsIcon className={cn("w-5 h-5", activeTab === "settings" && "fill-primary/10")} />
          <span className="text-[9px] font-black uppercase tracking-tighter">Menu</span>
        </button>
      </nav>
    </div>
  );
}