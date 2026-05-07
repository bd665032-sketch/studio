
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
  UserPlus
} from "lucide-react";
import { exportSummaryPDF } from "@/lib/pdf-utils";
import DemandLetterGenerator from "./DemandLetterGenerator";
import DocumentStorage from "./DocumentStorage";

const months = [
  "January", "February", "March", "April", "May", "June", 
  "July", "August", "September", "October", "November", "December"
];

const PREDEFINED_MEMBERS = [
  "Mr. Dulal",
  "Mr. Omar Faruk",
  "Mr. Sulaiman badshah",
  "Mr. Abdul qayum",
  "Mr. Mohammed Jamshed",
  "Mr. Milad",
  "Mr. Ala uddin",
  "Mr. Shahid",
  "Mr. Shohag",
  "Mr. Abul Hussain",
  "Mr. Sakib",
  "Mr. Ronnie",
  "Mr. Jonye",
  "Mr. Aqib",
  "Mr. salauddin"
];

export default function DashboardContent() {
  const { members, transactions, loading, addMember, deleteMember, addTransaction, deleteTransaction } = useMinarData();
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
      // Filter out members that already exist to avoid duplicates
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

  const handleGroupCall = () => {
    window.open("https://meet.google.com/new", "_blank");
  };

  return (
    <div className="max-w-[500px] mx-auto p-4 space-y-6 pb-20">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="bg-white border-none shadow-sm text-center p-3">
          <div className="bg-primary/10 w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2">
            <Wallet className="w-4 h-4 text-primary" />
          </div>
          <p className="text-[10px] text-muted-foreground uppercase font-bold">Total Collection</p>
          <p className="text-lg font-extrabold text-primary">৳{totalCollection}</p>
        </Card>
        <Card className="bg-white border-none shadow-sm text-center p-3">
          <div className="bg-success/10 w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2">
            <PieChart className="w-4 h-4 text-success" />
          </div>
          <p className="text-[10px] text-muted-foreground uppercase font-bold">Distribution</p>
          <p className="text-lg font-extrabold text-success">100%</p>
        </Card>
        <Card className="bg-white border-none shadow-sm text-center p-3">
          <div className="bg-gold/10 w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2">
            <PieChart className="w-4 h-4 text-gold" />
          </div>
          <p className="text-[10px] text-muted-foreground uppercase font-bold">Zakat / Fitra</p>
          <p className="text-sm font-bold text-gold">Allocating Soon</p>
        </Card>
        <Card 
          className="bg-primary text-white border-none shadow-sm text-center p-3 cursor-pointer active:scale-95 transition-transform"
          onClick={handleGroupCall}
        >
          <div className="bg-white/20 w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2">
            <PhoneCall className="w-4 h-4 text-white" />
          </div>
          <p className="text-[10px] text-accent uppercase font-bold">Group Call</p>
          <p className="text-sm font-bold">Start Now</p>
        </Card>
      </div>

      {/* Monthly Filter */}
      <div className="space-y-2">
        <Label className="text-primary font-bold">Monthly Filter</Label>
        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
          <SelectTrigger className="bg-white border-none shadow-sm h-12">
            <SelectValue placeholder="All Months" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Months</SelectItem>
            {months.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* New Deposit Form */}
      <Card className="bg-white border-none shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg text-primary flex items-center gap-2">
            <PlusCircle className="w-5 h-5" />
            New Deposit
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleDeposit} className="space-y-4">
            <div className="space-y-1">
              <Label>Select Member</Label>
              <Select onValueChange={(v) => setDeposit({...deposit, member: v})}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a member" />
                </SelectTrigger>
                <SelectContent>
                  {members.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Category</Label>
              <Select value={deposit.category} onValueChange={(v) => setDeposit({...deposit, category: v})}>
                <SelectTrigger>
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
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Amount (৳)</Label>
                <Input type="number" value={deposit.amount} onChange={(e) => setDeposit({...deposit, amount: Number(e.target.value)})} />
              </div>
              <div className="space-y-1">
                <Label>Date</Label>
                <Input type="date" value={deposit.date} onChange={(e) => setDeposit({...deposit, date: e.target.value})} />
              </div>
            </div>
            <Button className="w-full bg-primary hover:bg-primary/90 text-white active:scale-95 transition-transform h-12">
              Save Deposit
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Transaction Table */}
      <Card className="bg-white border-none shadow-sm overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg text-primary flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Summary
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            className="text-primary border-primary h-8"
            onClick={() => exportSummaryPDF(filteredTransactions, `${selectedMonth} Report`, totalCollection)}
          >
            <Download className="w-3 h-3 mr-1" />
            PDF
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-secondary text-primary">
                <tr>
                  <th className="px-4 py-2 font-bold">Member</th>
                  <th className="px-4 py-2 font-bold">Date</th>
                  <th className="px-4 py-2 font-bold text-right">Amount</th>
                  <th className="px-4 py-2"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground italic">No transactions found</td>
                  </tr>
                ) : (
                  filteredTransactions.map(t => (
                    <tr key={t.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-700">{t.n}</td>
                      <td className="px-4 py-3 text-xs text-gray-500">{t.d}</td>
                      <td className="px-4 py-3 text-right font-bold text-primary">৳{t.a}</td>
                      <td className="px-4 py-3 text-right">
                        <button 
                          className="text-destructive hover:text-destructive/80 p-1"
                          onClick={() => { if(confirm('Delete?')) deleteTransaction(t.id); }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot className="bg-primary/5">
                <tr>
                  <td colSpan={2} className="px-4 py-3 font-bold text-primary">TOTAL</td>
                  <td className="px-4 py-3 text-right font-extrabold text-primary">৳{totalCollection}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Member Management */}
      <Card className="bg-white border-none shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg text-primary flex items-center gap-2">
            <Users className="w-5 h-5" />
            Members
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs h-7 text-primary hover:bg-primary/5 gap-1"
            onClick={handleSeedMembers}
            disabled={isSeeding}
          >
            <UserPlus className="w-3 h-3" />
            {isSeeding ? "Importing..." : "Import List"}
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input 
              placeholder="New member name" 
              value={newMember} 
              onChange={(e) => setNewMember(e.target.value)} 
            />
            <Button onClick={handleAddMember} className="bg-accent hover:bg-gold-dark text-white px-3">
              Add
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto pr-1">
            {members.length === 0 ? (
              <div className="col-span-2 text-center py-4 text-xs text-muted-foreground italic bg-secondary/30 rounded-md">
                No members found. Use "Import List" to add them.
              </div>
            ) : (
              members.map(name => (
                <div key={name} className="flex items-center justify-between bg-secondary p-2 rounded-md text-xs font-medium border border-gray-100">
                  <span className="truncate pr-1">{name}</span>
                  <button onClick={() => { if(confirm('Delete member?')) deleteMember(name); }} className="text-destructive hover:scale-110 transition-transform">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Demand Letter Section */}
      <DemandLetterGenerator />

      {/* Document Storage */}
      <DocumentStorage />

      <footer className="text-center py-4 text-xs text-muted-foreground">
        © {new Date().getFullYear()} MINAR GO FOUNDATION. All Rights Reserved.
      </footer>
    </div>
  );
}
