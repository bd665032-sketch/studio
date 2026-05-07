
"use client";

import { useState } from "react";
import { useMinarData } from "@/hooks/use-minar-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  Wallet, 
  PieChart, 
  Trash2, 
  FileText, 
  Download,
  Plus,
  Home,
  Image as ImageIcon,
  Settings as SettingsIcon
} from "lucide-react";
import { exportSummaryPDF } from "@/lib/pdf-utils";
import DemandLetterGenerator from "./DemandLetterGenerator";
import DocumentStorage from "./DocumentStorage";

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
    <div className="flex flex-col h-screen bg-[#F0F2F5] overflow-hidden">
      <main className="flex-1 overflow-y-auto pb-28 pt-4">
        <div className="max-w-[500px] mx-auto px-4 space-y-6">
          
          {activeTab === "home" && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 space-y-6">
              <div className="grid grid-cols-2 gap-3">
                <Card className="bg-white border-none shadow-sm p-4 rounded-3xl text-center">
                  <div className="bg-primary/5 w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Wallet className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-[10px] text-muted-foreground uppercase font-black">Collection</p>
                  <p className="text-lg font-black text-primary">৳{totalCollection}</p>
                </Card>
                <Card className="bg-white border-none shadow-sm p-4 rounded-3xl text-center">
                  <div className="bg-success/5 w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2">
                    <PieChart className="w-5 h-5 text-success" />
                  </div>
                  <p className="text-[10px] text-muted-foreground uppercase font-black">Members</p>
                  <p className="text-lg font-black text-success">{members.length}</p>
                </Card>
              </div>

              <div className="space-y-2">
                <Label className="font-bold text-xs ml-1 text-primary/60 uppercase tracking-widest">Filter By Month</Label>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger className="bg-white border-none shadow-sm h-14 rounded-2xl font-bold">
                    <SelectValue placeholder="All Months" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Transactions</SelectItem>
                    {months.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <Card className="bg-white border-none shadow-sm rounded-3xl overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between border-b border-gray-50 pb-4">
                  <CardTitle className="text-md font-black text-primary flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    History
                  </CardTitle>
                  <Button variant="ghost" size="sm" className="text-primary font-bold gap-1" onClick={() => exportSummaryPDF(filteredTransactions, `${selectedMonth} Report`, totalCollection)}>
                    <Download className="w-4 h-4" />
                    PDF
                  </Button>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-gray-50">
                    {filteredTransactions.length === 0 ? (
                      <div className="py-12 text-center text-muted-foreground italic text-sm">No deposits found</div>
                    ) : (
                      filteredTransactions.map(t => (
                        <div key={t.id} className="flex items-center justify-between p-4 hover:bg-gray-50/50">
                          <div>
                            <p className="font-bold text-gray-800">{t.n}</p>
                            <p className="text-[10px] text-muted-foreground">{t.d} • {t.c}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-black text-primary">৳{t.a}</span>
                            <button onClick={() => { if(confirm('ডিলিট করবেন?')) deleteTransaction(t.id); }} className="text-destructive/30 hover:text-destructive">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "members" && (
            <div className="animate-in fade-in slide-in-from-right-2 duration-500 space-y-4">
              <Card className="bg-white border-none shadow-sm rounded-3xl">
                <CardHeader>
                  <CardTitle className="text-lg font-black text-primary">Manage Members</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input placeholder="Member Name" value={newMember} onChange={(e) => setNewMember(e.target.value)} className="rounded-2xl h-12 bg-secondary/50 border-none" />
                    <Button onClick={() => { if(newMember) addMember(newMember); setNewMember(""); }} className="bg-primary rounded-2xl px-6 h-12">Add</Button>
                  </div>
                  <div className="space-y-2">
                    {members.map(m => (
                      <div key={m} className="flex items-center justify-between bg-secondary/30 p-4 rounded-2xl border border-white">
                        <span className="font-bold text-gray-700">{m}</span>
                        <button onClick={() => { if(confirm('মেম্বার ডিলিট করবেন?')) deleteMember(m); }} className="text-destructive/50 hover:text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "add" && (
            <div className="animate-in fade-in zoom-in-95 duration-500">
              <Card className="bg-white border-none shadow-2xl rounded-[40px] overflow-hidden">
                <div className="bg-primary p-6 text-white">
                  <h3 className="text-xl font-black">New Deposit</h3>
                  <p className="text-white/60 text-xs">অ্যাকাউন্টে টাকা জমা দিন</p>
                </div>
                <CardContent className="p-6 space-y-5">
                  <form onSubmit={handleDeposit} className="space-y-5">
                    <div className="space-y-2">
                      <Label className="font-bold ml-1">Member</Label>
                      <Select onValueChange={(v) => setDeposit({...deposit, member: v})}>
                        <SelectTrigger className="h-14 rounded-2xl bg-secondary/50 border-none">
                          <SelectValue placeholder="সিলেক্ট মেম্বার" />
                        </SelectTrigger>
                        <SelectContent>
                          {members.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="font-bold ml-1">Category</Label>
                      <Select value={deposit.category} onValueChange={(v) => setDeposit({...deposit, category: v})}>
                        <SelectTrigger className="h-14 rounded-2xl bg-secondary/50 border-none">
                          <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="প্রতি মাসের জমা">প্রতি মাসের জমা</SelectItem>
                          <SelectItem value="যাকাত">যাকাত</SelectItem>
                          <SelectItem value="বাড়ির কাজ">বাড়ির কাজ</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label className="font-bold ml-1">Amount</Label>
                        <Input type="number" value={deposit.amount} onChange={(e) => setDeposit({...deposit, amount: Number(e.target.value)})} className="h-14 rounded-2xl bg-secondary/50 border-none" />
                      </div>
                      <div className="space-y-2">
                        <Label className="font-bold ml-1">Date</Label>
                        <Input type="date" value={deposit.date} onChange={(e) => setDeposit({...deposit, date: e.target.value})} className="h-14 rounded-2xl bg-secondary/50 border-none text-xs" />
                      </div>
                    </div>
                    <Button className="w-full h-16 rounded-3xl bg-gold-gradient text-white font-black text-lg shadow-xl active:scale-95 transition-all mt-4">
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

      <nav className="fixed bottom-0 left-0 right-0 bg-white h-24 px-6 flex items-center justify-between z-[100] nav-shadow rounded-t-[35px]">
        <button onClick={() => setActiveTab("home")} className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === "home" ? "text-primary scale-110" : "text-gray-300"}`}>
          <Home className={`w-6 h-6 ${activeTab === "home" ? "fill-primary/10" : ""}`} />
          <span className="text-[10px] font-black uppercase tracking-tighter">Home</span>
        </button>

        <button onClick={() => setActiveTab("members")} className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === "members" ? "text-primary scale-110" : "text-gray-300"}`}>
          <Users className={`w-6 h-6 ${activeTab === "members" ? "fill-primary/10" : ""}`} />
          <span className="text-[10px] font-black uppercase tracking-tighter">Members</span>
        </button>

        <div className="relative -top-10">
          <button onClick={() => setActiveTab("add")} className="w-18 h-18 bg-gold-gradient rounded-full flex items-center justify-center text-white shadow-2xl border-[6px] border-[#F0F2F5] active:scale-90 transition-transform">
            <Plus className="w-10 h-10 font-black" />
          </button>
        </div>

        <button onClick={() => setActiveTab("gallery")} className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === "gallery" ? "text-primary scale-110" : "text-gray-300"}`}>
          <ImageIcon className={`w-6 h-6 ${activeTab === "gallery" ? "fill-primary/10" : ""}`} />
          <span className="text-[10px] font-black uppercase tracking-tighter">Gallery</span>
        </button>

        <button onClick={() => setActiveTab("settings")} className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === "settings" ? "text-primary scale-110" : "text-gray-300"}`}>
          <SettingsIcon className={`w-6 h-6 ${activeTab === "settings" ? "fill-primary/10" : ""}`} />
          <span className="text-[10px] font-black uppercase tracking-tighter">Menu</span>
        </button>
      </nav>
    </div>
  );
}
