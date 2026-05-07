"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  LogOut, 
  CloudUpload, 
  Camera, 
  Loader2, 
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
    <header className="sticky top-0 z-50 w-full bg-[#F8FAFC] py-3 px-4 flex items-center justify-between border-b border-slate-100">
      <div className="flex items-center gap-2.5">
        <Dialog>
          <DialogTrigger asChild>
            <div className="flex items-center gap-2.5 cursor-pointer">
              <div className="relative">
                <Avatar className="w-9 h-9 border-2 border-white shadow-sm">
                  {logo ? (
                    <AvatarImage src={logo} className="object-cover" />
                  ) : (
                    <AvatarFallback className="bg-luxury-purple text-white font-bold text-xs">MG</AvatarFallback>
                  )}
                </Avatar>
                <div className="absolute -bottom-0.5 -right-0.5 bg-green-500 rounded-full p-0.5 border border-white">
                  <ShieldCheck className="w-2.5 h-2.5 text-white" />
                </div>
              </div>
              <div>
                <h1 className="font-black text-xs text-slate-800 leading-tight">{foundationName}</h1>
                <p className="text-[8px] text-slate-400 font-bold uppercase">Admin Panel</p>
              </div>
            </div>
          </DialogTrigger>
          <DialogContent className="sm:max-w-xs bg-white rounded-[24px]">
            <DialogHeader>
              <DialogTitle className="text-primary font-black text-sm flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Profile Settings
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="flex flex-col items-center gap-3">
                <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border-2 border-slate-50 relative group shadow-inner">
                  {logo ? <img src={logo} alt="Preview" className="w-full h-full object-cover" /> : <span className="text-primary font-bold text-lg">MG</span>}
                  <label className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 active:opacity-100 transition-opacity cursor-pointer text-white text-[9px] font-bold">
                    <Camera className="w-5 h-5 mb-1" /> Change
                    <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                  </label>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="font-bold text-slate-400 text-[9px] uppercase">Foundation Name</Label>
                <div className="flex gap-1.5">
                  <Input value={isEditingName ? tempName : foundationName} readOnly={!isEditingName} onFocus={() => { if(!isEditingName) { setTempName(foundationName); setIsEditingName(true); } }} onChange={(e) => setTempName(e.target.value)} className="h-10 border-none bg-slate-50 rounded-xl font-bold text-xs" />
                  {isEditingName && (
                    <div className="flex gap-1">
                      <Button size="icon" className="h-10 w-10 bg-green-500 rounded-lg" onClick={handleSaveName}><Check className="w-4 h-4" /></Button>
                      <Button size="icon" variant="destructive" className="h-10 w-10 rounded-lg" onClick={() => setIsEditingName(false)}><X className="w-4 h-4" /></Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="w-8 h-8 bg-white shadow-sm rounded-lg text-primary" onClick={handleBackup} disabled={backupLoading}>
          {backupLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CloudUpload className="w-3.5 h-3.5" />}
        </Button>
        <Button variant="ghost" size="icon" className="w-8 h-8 bg-red-50 text-red-500 rounded-lg" onClick={onLogout}>
          <LogOut className="w-3.5 h-3.5" />
        </Button>
      </div>
    </header>
  );
}