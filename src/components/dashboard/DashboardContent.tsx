
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
  PhoneCall, 
  Trash2, 
  FileText, 
  PlusCircle, 
  Download,
  UserPlus,
  Home,
  Image as ImageIcon,
  Settings as SettingsIcon,
  Plus
} from "lucide-react";
import { exportSummaryPDF } from "@/lib/pdf-utils";
import DemandLetterGenerator from "./DemandLetterGenerator";
import DocumentStorage from "./DocumentStorage";

const months = [
  "January", "February", "March", "April", "May", "June", 
  "July", "August", "September", "October", "November", "December"
];

const PREDEFINED_MEMBERS = [
  "Mr. Dulal", "Mr. Omar Faruk", "Mr. Sulaiman badshah", "Mr. Abdul qayum",
  "Mr. Mohammed Jamshed", "Mr. Milad", "Mr. Ala uddin", "Mr. Shahid",
  "Mr. Shohag", "Mr. Abul Hussain", "Mr. Sakib", "Mr. Ronnie",
  "Mr. Jonye", "Mr. Aqib", "Mr. salauddin"
];

export default function DashboardContent() {
  const { members, transactions, loading, addMember, deleteMember, addTransaction, deleteTransaction } = useMinarData();
  const [activeTab, setActiveTab] = useState("home");
  const [selectedMonth, setSelectedMonth] = useState("All");
  const [newMember, setNewMember] = useState("");
  const [deposit, setDeposit] = useState({ member: "", amount: 5000, category: "প্রতি মাসের জমা", date: new Date().toISOString().split('T')[0] });
  const { toast } = useToast();
  const [isSeeding, setIsSeeding] = useState(false);

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
    setDeposit({...deposit, member: ""});
    setActiveTab("home");
    toast({ title: "সফল!", description: "ডিপোজিট এন্ট্রি সেভ হয়েছে।" });
  };

  const handleAddMember = async () => {
    if (!newMember) return;
    await addMember(newMember);
    setNewMember("");
    toast({ title: "সফল!", description: "নতুন মেম্বার যুক্ত হয়েছে।" });
  };

  const handleSeedMembers = async () => {
    setIsSeeding(true);
    try {
      const existingNames = new Set(members);
      const namesToAdd = PREDEFINED_MEMBERS.filter(name => !existingNames.has(name));
      if (namesToAdd.length === 0) {
        toast({ title: "তথ্য", description: "সবগুলো মেম্বার ইতিমধ্যে যুক্ত আছে।" });
        setIsSeeding(false);
        return;
      }
      for (const name of namesToAdd) {
        await addMember(name);
      }
      toast({ title: "সফল!", description: `${namesToAdd.length} জন মেম্বার যুক্ত করা হয়েছে।` });
    } catch (error) {
      toast({ variant: "destructive", title: "সমস্যা", description: "মেম্বার ইমপোর্ট করতে সমস্যা হয়েছে।" });
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#F0F2F5]">
      {/* Scrollable Main Content Area */}
      <main className="flex-1 overflow-y-auto pb-32">
        <div className="max-w-[500px] mx-auto p-4 space-y-6">
          
          {activeTab === "home" && (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3">
                <Card className="bg-white border-none shadow-sm text-center p-3 rounded-2xl">
                  <div className="bg-primary/10 w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Wallet className="w-4 h-4 text-primary" />
                  </div>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold">Total Collection</p>
                  <p className="text-lg font-extrabold text-primary">৳{totalCollection}</p>
                </Card>
                <Card className="bg-white border-none shadow-sm text-center p-3 rounded-2xl">
                  <div className="bg-success/10 w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2">
                    <PieChart className="w-4 h-4 text-success" />
                  </div>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold">Distribution</p>
                  <p className="text-lg font-extrabold text-success">100%</p>
                </Card>
              </div>

              {/* Monthly Filter */}
              <div className="space-y-2">
                <Label className="text-primary font-bold">Monthly Filter</Label>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger className="bg-white border-none shadow-sm h-12 rounded-xl">
                    <SelectValue placeholder="All Months" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Months</SelectItem>
                    {months.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              {/* Transaction Table */}
              <Card className="bg-white border-none shadow-sm overflow-hidden rounded-2xl">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-lg text-primary flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Transaction Summary
                  </CardTitle>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-primary border-primary h-8 rounded-lg"
                    onClick={() => exportSummaryPDF(filteredTransactions, `${selectedMonth} Report`, totalCollection)}
                  >
                    <Download className="w-3 h-3 mr-1" />
                    PDF
                  </Button>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-secondary/50 text-primary">
                        <tr>
                          <th className="px-4 py-3 font-bold">Member</th>
                          <th className="px-4 py-3 font-bold text-right">Amount</th>
                          <th className="px-4 py-3"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {filteredTransactions.length === 0 ? (
                          <tr>
                            <td colSpan={3} className="px-4 py-10 text-center text-muted-foreground italic">No data</td>
                          </tr>
                        ) : (
                          filteredTransactions.map(t => (
                            <tr key={t.id} className="hover:bg-gray-50/50">
                              <td className="px-4 py-3">
                                <p className="font-bold text-gray-800">{t.n}</p>
                                <p className="text-[10px] text-muted-foreground">{t.d}</p>
                              </td>
                              <td className="px-4 py-3 text-right font-black text-primary">৳{t.a}</td>
                              <td className="px-4 py-3 text-right">
                                <button onClick={() => { if(confirm('Delete?')) deleteTransaction(t.id); }} className="text-destructive">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {activeTab === "members" && (
            <Card className="bg-white border-none shadow-sm rounded-2xl">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg text-primary flex items-center gap-2 font-black">
                  <Users className="w-5 h-5" />
                  Foundation Members
                </CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-xs h-7 text-primary gap-1"
                  onClick={handleSeedMembers}
                  disabled={isSeeding}
                >
                  <UserPlus className="w-3 h-3" />
                  {isSeeding ? "..." : "Import"}
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input 
                    placeholder="New member name" 
                    value={newMember} 
                    onChange={(e) => setNewMember(e.target.value)}
                    className="rounded-xl h-11"
                  />
                  <Button onClick={handleAddMember} className="bg-primary hover:bg-primary/90 rounded-xl px-4">
                    Add
                  </Button>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {members.map(name => (
                    <div key={name} className="flex items-center justify-between bg-secondary/30 p-4 rounded-xl border border-gray-100">
                      <span className="font-bold text-primary">{name}</span>
                      <button onClick={() => { if(confirm('Delete member?')) deleteMember(name); }} className="text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "add" && (
            <Card className="bg-white border-none shadow-xl rounded-3xl animate-in slide-in-from-bottom-4 duration-300">
              <CardHeader>
                <CardTitle className="text-xl text-primary font-black flex items-center gap-2">
                  <PlusCircle className="w-6 h-6" />
                  Quick Deposit
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleDeposit} className="space-y-5">
                  <div className="space-y-2">
                    <Label className="font-bold text-gray-700">Member Name</Label>
                    <Select onValueChange={(v) => setDeposit({...deposit, member: v})}>
                      <SelectTrigger className="h-12 rounded-xl">
                        <SelectValue placeholder="Choose a member" />
                      </SelectTrigger>
                      <SelectContent>
                        {members.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold text-gray-700">Category</Label>
                    <Select value={deposit.category} onValueChange={(v) => setDeposit({...deposit, category: v})}>
                      <SelectTrigger className="h-12 rounded-xl">
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="প্রতি মাসের জমা">প্রতি মাসের জমা</SelectItem>
                        <SelectItem value="যাকাত">যাকাত</SelectItem>
                        <SelectItem value="ফিতরা">ফিতরা</SelectItem>
                        <SelectItem value="বাড়ির কাজ">বাড়ির কাজ</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="font-bold text-gray-700">Amount (৳)</Label>
                      <Input type="number" value={deposit.amount} onChange={(e) => setDeposit({...deposit, amount: Number(e.target.value)})} className="h-12 rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-bold text-gray-700">Date</Label>
                      <Input type="date" value={deposit.date} onChange={(e) => setDeposit({...deposit, date: e.target.value})} className="h-12 rounded-xl" />
                    </div>
                  </div>
                  <Button className="w-full h-14 rounded-2xl bg-gradient-to-r from-gold to-gold-dark text-white font-black text-lg shadow-lg active:scale-95 transition-all mt-4">
                    Submit Deposit
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {activeTab === "gallery" && (
            <div className="space-y-6">
              <DocumentStorage />
            </div>
          )}

          {activeTab === "settings" && (
            <div className="space-y-6">
              <DemandLetterGenerator />
              <Card className="bg-white border-none shadow-sm rounded-2xl p-6">
                <h3 className="text-primary font-black mb-4">Application Information</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm py-2 border-b border-gray-100">
                    <span className="text-muted-foreground">Version</span>
                    <span className="font-bold">2.0.0 (Production)</span>
                  </div>
                  <div className="flex justify-between text-sm py-2 border-b border-gray-100">
                    <span className="text-muted-foreground">Foundation ID</span>
                    <span className="font-bold">MG-889021</span>
                  </div>
                  <Button onClick={() => window.open("https://meet.google.com/new", "_blank")} className="w-full mt-4 bg-success gap-2 rounded-xl h-12">
                    <PhoneCall className="w-4 h-4" />
                    Group Call Service
                  </Button>
                </div>
              </Card>
            </div>
          )}
        </div>
      </main>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 h-20 px-6 flex items-center justify-between z-[100] shadow-[0_-5px_20px_rgba(0,0,0,0.05)] rounded-t-[30px]">
        <button 
          onClick={() => setActiveTab("home")}
          className={`flex flex-col items-center gap-1 transition-all ${activeTab === "home" ? "text-primary scale-110" : "text-gray-400"}`}
        >
          <Home className={`w-6 h-6 ${activeTab === "home" ? "fill-primary/10" : ""}`} />
          <span className="text-[10px] font-bold">Home</span>
        </button>

        <button 
          onClick={() => setActiveTab("members")}
          className={`flex flex-col items-center gap-1 transition-all ${activeTab === "members" ? "text-primary scale-110" : "text-gray-400"}`}
        >
          <Users className={`w-6 h-6 ${activeTab === "members" ? "fill-primary/10" : ""}`} />
          <span className="text-[10px] font-bold">Members</span>
        </button>

        {/* Central Add Button */}
        <div className="relative -top-8">
          <button 
            onClick={() => setActiveTab("add")}
            className="w-16 h-16 bg-gradient-to-br from-gold to-gold-dark rounded-full flex items-center justify-center text-white shadow-xl border-4 border-white active:scale-90 transition-transform"
          >
            <Plus className="w-8 h-8 font-black" />
          </button>
        </div>

        <button 
          onClick={() => setActiveTab("gallery")}
          className={`flex flex-col items-center gap-1 transition-all ${activeTab === "gallery" ? "text-primary scale-110" : "text-gray-400"}`}
        >
          <ImageIcon className={`w-6 h-6 ${activeTab === "gallery" ? "fill-primary/10" : ""}`} />
          <span className="text-[10px] font-bold">Gallery</span>
        </button>

        <button 
          onClick={() => setActiveTab("settings")}
          className={`flex flex-col items-center gap-1 transition-all ${activeTab === "settings" ? "text-primary scale-110" : "text-gray-400"}`}
        >
          <SettingsIcon className={`w-6 h-6 ${activeTab === "settings" ? "fill-primary/10" : ""}`} />
          <span className="text-[10px] font-bold">Menu</span>
        </button>
      </nav>
    </div>
  );
}
