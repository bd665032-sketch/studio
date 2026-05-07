"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  LogOut, 
  CloudUpload, 
  Camera, 
  Loader2, 
  User as UserIcon,
  Check,
  X,
  ShieldCheck,
  Settings
} from "lucide-react";
import { useMinarData } from "@/hooks/use-minar-data";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Header({ onLogout }: { onLogout: () => void }) {
  const [logo, setLogo] = useState<string | null>(null);
  const [foundationName, setFoundationName] = useState("MINAR GO EXPATRIATE");
  const [tempName, setTempName] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);
  const [backupLoading, setBackupLoading] = useState(false);
  const { transactions } = useMinarData();
  const { toast } = useToast();

  useEffect(() => {
    const savedLogo = localStorage.getItem("mg_logo");
    const savedName = localStorage.getItem("mg_foundation_name");
    if (savedLogo) setLogo(savedLogo);
    if (savedName) setFoundationName(savedName);
  }, []);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        toast({ variant: "destructive", title: "File too large", description: "Please upload an image under 1MB" });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setLogo(base64);
        localStorage.setItem("mg_logo", base64);
        toast({ title: "সফল!", description: "লোগো আপডেট করা হয়েছে।" });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveName = () => {
    if (tempName.trim()) {
      setFoundationName(tempName);
      localStorage.setItem("mg_foundation_name", tempName);
      setIsEditingName(false);
      toast({ title: "সফল!", description: "ফাউন্ডেশনের নাম পরিবর্তন করা হয়েছে।" });
    }
  };

  const handleBackup = async () => {
    if (!transactions || transactions.length === 0) {
      toast({ variant: "destructive", title: "ব্যাকআপ ডাটা নেই!", description: "শিটে পাঠানোর মতো কোনো ডাটা পাওয়া যায়নি।" });
      return;
    }
    setBackupLoading(true);
    const GOOGLE_SHEETS_URL = "https://script.google.com/macros/s/AKfycbx0V8EesGLJjp9xXVFi6Q_GQdjNzzH9TsmvXFtoD1Qk76x8Rl7kE7tyFRVmbVFWoRYXeA/exec";
    try {
      const rows = transactions.map(t => [t.n, t.d, t.a]);
      const total = transactions.reduce((s, r) => s + r.a, 0);
      rows.push(["TOTAL COLLECTION", "", total]);
      rows.push(["Backup Date", new Date().toLocaleString('bn-BD'), ""]);
      const payload = { sheetName: "MinarGo_Data", headers: ["Member Name", "Date", "Amount (TK)"], rows: rows };
      await fetch(GOOGLE_SHEETS_URL, { method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain" }, body: JSON.stringify(payload) });
      toast({ title: "ব্যাকআপ সম্পন্ন!", description: "গুগল শিটে ডাটা পাঠানো হয়েছে।" });
    } catch (error) {
      toast({ variant: "destructive", title: "ব্যাকআপ ব্যর্থ", description: "সমস্যা হয়েছে।" });
    } finally {
      setBackupLoading(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-[#F8FAFC] py-4 px-6 flex items-center justify-between border-b border-slate-100">
      <div className="flex items-center gap-3">
        <Dialog>
          <DialogTrigger asChild>
            <div className="flex items-center gap-3 cursor-pointer group">
              <div className="relative">
                <Avatar className="w-11 h-11 border-2 border-white shadow-md">
                  {logo ? (
                    <AvatarImage src={logo} className="object-cover" />
                  ) : (
                    <AvatarFallback className="bg-luxury-purple text-white font-bold">MG</AvatarFallback>
                  )}
                </Avatar>
                <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-0.5 border-2 border-white">
                  <ShieldCheck className="w-3 h-3 text-white" />
                </div>
              </div>
              <div>
                <h1 className="font-black text-sm text-slate-800 leading-none">{foundationName}</h1>
                <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Admin Panel</p>
              </div>
            </div>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md bg-white rounded-[32px]">
            <DialogHeader>
              <DialogTitle className="text-primary font-black flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Profile Settings
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="flex flex-col items-center gap-4">
                <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border-4 border-slate-50 relative group shadow-inner">
                  {logo ? <img src={logo} alt="Preview" className="w-full h-full object-cover" /> : <span className="text-primary font-bold text-2xl">MG</span>}
                  <label className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white text-[10px] font-bold">
                    <Camera className="w-6 h-6 mb-1" /> Change
                    <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                  </label>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="font-bold text-slate-500 text-xs uppercase">Foundation Name</Label>
                <div className="flex gap-2">
                  <Input value={isEditingName ? tempName : foundationName} readOnly={!isEditingName} onFocus={() => { if(!isEditingName) { setTempName(foundationName); setIsEditingName(true); } }} onChange={(e) => setTempName(e.target.value)} className="h-12 border-none bg-slate-50 rounded-2xl font-bold" />
                  {isEditingName && (
                    <div className="flex gap-1">
                      <Button size="icon" className="bg-green-500 rounded-xl" onClick={handleSaveName}><Check className="w-4 h-4" /></Button>
                      <Button size="icon" variant="destructive" className="rounded-xl" onClick={() => setIsEditingName(false)}><X className="w-4 h-4" /></Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="bg-white shadow-sm rounded-xl text-primary" onClick={handleBackup} disabled={backupLoading}>
          {backupLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CloudUpload className="w-4 h-4" />}
        </Button>
        <Button variant="ghost" size="icon" className="bg-red-50 text-red-500 rounded-xl" onClick={onLogout}>
          <LogOut className="w-4 h-4" />
        </Button>
      </div>
    </header>
  );
}