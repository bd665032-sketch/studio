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
  Wallet, 
  Trash2, 
  FileText, 
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
  const { members, transactions, addMember, deleteMember, addTransaction, deleteTransaction } = useMinarData();
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
      <main className="flex-1 overflow-y-auto pb-32">
        <div className="max-w-[500px] mx-auto px-5 pt-6 space-y-6">
          
          {activeTab === "home" && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 space-y-6">
              {/* Top Welcome Card */}
              <div className="bg-luxury-purple rounded-[32px] p-6 text-white shadow-xl">
                <p className="text-white/80 text-sm font-medium">👋 Welcome to</p>
                <h1 className="text-2xl font-black mb-6 leading-tight">Minar Go Foundation Platform</h1>
                
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-white/10 rounded-2xl p-3 text-center backdrop-blur-sm">
                    <p className="text-lg font-black">{totalCollection}</p>
                    <p className="text-[10px] text-white/70 uppercase">Collection</p>
                  </div>
                  <div className="bg-white/10 rounded-2xl p-3 text-center backdrop-blur-sm">
                    <p className="text-lg font-black">{members.length}</p>
                    <p className="text-[10px] text-white/70 uppercase">Members</p>
                  </div>
                  <div className="bg-white/10 rounded-2xl p-3 text-center backdrop-blur-sm">
                    <p className="text-lg font-black">{transactions.length}</p>
                    <p className="text-[10px] text-white/70 uppercase">History</p>
                  </div>
                </div>
              </div>

              {/* Grid Feature Cards */}
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setActiveTab("members")}
                  className="col-span-2 bg-luxury-coral rounded-[28px] p-6 text-white flex flex-col items-start relative overflow-hidden group active:scale-95 transition-all"
                >
                  <div className="bg-white/20 p-2 rounded-xl mb-4">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-black">Members</h3>
                  <p className="text-white/70 text-xs">{members.length} available</p>
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 bg-white/20 rounded-full p-2">
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </button>

                <button 
                  onClick={() => setActiveTab("gallery")}
                  className="bg-luxury-yellow rounded-[28px] p-6 text-white flex flex-col items-start relative overflow-hidden active:scale-95 transition-all"
                >
                  <div className="bg-white/20 p-2 rounded-xl mb-4">
                    <ClipboardList className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-black">Gallery</h3>
                  <p className="text-white/70 text-xs">Explore photos</p>
                  <div className="absolute right-4 bottom-4 bg-white/20 rounded-full p-1.5">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </button>

                <button 
                  onClick={() => setActiveTab("settings")}
                  className="bg-luxury-green rounded-[28px] p-6 text-white flex flex-col items-start relative overflow-hidden active:scale-95 transition-all"
                >
                  <div className="bg-white/20 p-2 rounded-xl mb-4">
                    <Video className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-black">Menu</h3>
                  <p className="text-white/70 text-xs">All features</p>
                  <div className="absolute right-4 bottom-4 bg-white/20 rounded-full p-1.5">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </button>
              </div>

              {/* Monthly Filter & History */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-primary text-sm uppercase tracking-wider">Recent History</h4>
                  <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                    <SelectTrigger className="w-32 bg-white border-none shadow-sm rounded-xl text-xs font-bold h-9">
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Months</SelectItem>
                      {months.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <Card className="bg-white border-none shadow-sm rounded-[28px] overflow-hidden">
                  <CardContent className="p-0">
                    <div className="divide-y divide-slate-50">
                      {filteredTransactions.length === 0 ? (
                        <div className="py-10 text-center text-slate-400 italic text-sm">No data found</div>
                      ) : (
                        filteredTransactions.slice(0, 5).map(t => (
                          <div key={t.id} className="flex items-center justify-between p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center font-bold text-primary text-xs">
                                {t.n.charAt(0)}
                              </div>
                              <div>
                                <p className="font-bold text-slate-800 text-sm">{t.n}</p>
                                <p className="text-[10px] text-slate-400">{t.d}</p>
                              </div>
                            </div>
                            <span className="font-black text-primary text-sm">৳{t.a}</span>
                          </div>
                        ))
                      )}
                      {filteredTransactions.length > 0 && (
                        <Button variant="ghost" className="w-full h-12 text-primary font-bold text-xs" onClick={() => exportSummaryPDF(filteredTransactions, `${selectedMonth} Report`, totalCollection)}>
                          <Download className="w-4 h-4 mr-2" /> Download Full Report
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeTab === "members" && (
            <div className="animate-in fade-in slide-in-from-right-2 duration-500 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Button variant="ghost" size="sm" onClick={() => setActiveTab("home")} className="p-0 h-8 w-8 rounded-full">
                  <ChevronRight className="w-5 h-5 rotate-180" />
                </Button>
                <h2 className="text-xl font-black text-primary">Manage Members</h2>
              </div>
              <Card className="bg-white border-none shadow-sm rounded-[32px] p-6">
                <div className="flex gap-2 mb-6">
                  <Input placeholder="Member Name" value={newMember} onChange={(e) => setNewMember(e.target.value)} className="rounded-2xl h-12 bg-slate-50 border-none" />
                  <Button onClick={() => { if(newMember) addMember(newMember); setNewMember(""); }} className="bg-primary rounded-2xl px-6 h-12 font-bold">Add</Button>
                </div>
                <div className="space-y-2">
                  {members.map(m => (
                    <div key={m} className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl">
                      <span className="font-bold text-slate-700">{m}</span>
                      <button onClick={() => { if(confirm('ডিলিট করবেন?')) deleteMember(m); }} className="text-destructive/30 hover:text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {activeTab === "add" && (
            <div className="animate-in fade-in zoom-in-95 duration-500">
              <Card className="bg-white border-none shadow-xl rounded-[40px] overflow-hidden">
                <div className="bg-luxury-purple p-8 text-white">
                  <h3 className="text-2xl font-black">New Deposit</h3>
                  <p className="text-white/60 text-xs mt-1">অ্যাকাউন্টে টাকা জমা দিন</p>
                </div>
                <CardContent className="p-8 space-y-5">
                  <form onSubmit={handleDeposit} className="space-y-5">
                    <div className="space-y-2">
                      <Label className="font-bold ml-1 text-slate-500 text-xs uppercase">Member</Label>
                      <Select onValueChange={(v) => setDeposit({...deposit, member: v})}>
                        <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-none font-bold">
                          <SelectValue placeholder="সিলেক্ট মেম্বার" />
                        </SelectTrigger>
                        <SelectContent>
                          {members.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="font-bold ml-1 text-slate-500 text-xs uppercase">Category</Label>
                      <Select value={deposit.category} onValueChange={(v) => setDeposit({...deposit, category: v})}>
                        <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-none font-bold">
                          <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="প্রতি মাসের জমা">প্রতি মাসের জমা</SelectItem>
                          <SelectItem value="যাকাত">যাকাত</SelectItem>
                          <SelectItem value="বাড়ির কাজ">বাড়ির কাজ</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="font-bold ml-1 text-slate-500 text-xs uppercase">Amount</Label>
                        <Input type="number" value={deposit.amount} onChange={(e) => setDeposit({...deposit, amount: Number(e.target.value)})} className="h-14 rounded-2xl bg-slate-50 border-none font-bold" />
                      </div>
                      <div className="space-y-2">
                        <Label className="font-bold ml-1 text-slate-500 text-xs uppercase">Date</Label>
                        <Input type="date" value={deposit.date} onChange={(e) => setDeposit({...deposit, date: e.target.value})} className="h-14 rounded-2xl bg-slate-50 border-none text-xs font-bold" />
                      </div>
                    </div>
                    <Button className="w-full h-16 rounded-[24px] bg-luxury-purple text-white font-black text-lg shadow-lg active:scale-95 transition-all mt-6">
                      Save Deposit
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "gallery" && <div className="animate-in fade-in slide-in-from-left-2 duration-500"><DocumentStorage /></div>}
          {activeTab === "settings" && <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 space-y-6"><DemandLetterGenerator /></div>}
        </div>
      </main>

      {/* Luxury Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white h-24 px-6 flex items-center justify-between z-[100] nav-shadow rounded-t-[40px]">
        <button 
          onClick={() => setActiveTab("home")} 
          className={cn("flex flex-col items-center gap-1.5 transition-all", activeTab === "home" ? "text-primary" : "text-slate-300")}
        >
          <Home className={cn("w-6 h-6", activeTab === "home" && "fill-primary/10")} />
          <span className="text-[10px] font-black uppercase tracking-tighter">Explore</span>
        </button>

        <button 
          onClick={() => setActiveTab("members")} 
          className={cn("flex flex-col items-center gap-1.5 transition-all", activeTab === "members" ? "text-primary" : "text-slate-300")}
        >
          <Users className={cn("w-6 h-6", activeTab === "members" && "fill-primary/10")} />
          <span className="text-[10px] font-black uppercase tracking-tighter">Library</span>
        </button>

        <div className="relative -top-10">
          <button 
            onClick={() => setActiveTab("add")} 
            className="w-18 h-18 bg-luxury-purple rounded-full flex items-center justify-center text-white shadow-2xl border-[8px] border-[#F8FAFC] active:scale-90 transition-transform"
          >
            <Plus className="w-10 h-10 font-black" />
          </button>
          <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-black text-primary uppercase">Home</span>
        </div>

        <button 
          onClick={() => setActiveTab("gallery")} 
          className={cn("flex flex-col items-center gap-1.5 transition-all", activeTab === "gallery" ? "text-primary" : "text-slate-300")}
        >
          <ImageIcon className={cn("w-6 h-6", activeTab === "gallery" && "fill-primary/10")} />
          <span className="text-[10px] font-black uppercase tracking-tighter">Gallery</span>
        </button>

        <button 
          onClick={() => setActiveTab("settings")} 
          className={cn("flex flex-col items-center gap-1.5 transition-all", activeTab === "settings" ? "text-primary" : "text-slate-300")}
        >
          <SettingsIcon className={cn("w-6 h-6", activeTab === "settings" && "fill-primary/10")} />
          <span className="text-[10px] font-black uppercase tracking-tighter">Menu</span>
        </button>
      </nav>
    </div>
  );
}