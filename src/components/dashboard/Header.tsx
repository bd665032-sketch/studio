
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  LogOut, 
  CloudUpload, 
  Camera, 
  Loader2, 
  Settings, 
  User as UserIcon,
  Check,
  X,
  ShieldCheck
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
      toast({ 
        variant: "destructive", 
        title: "ব্যাকআপ ডাটা নেই!", 
        description: "শিটে পাঠানোর মতো কোনো লেনদেনের তথ্য পাওয়া যায়নি।" 
      });
      return;
    }

    setBackupLoading(true);
    const GOOGLE_SHEETS_URL = "https://script.google.com/macros/s/AKfycbx0V8EesGLJjp9xXVFi6Q_GQdjNzzH9TsmvXFtoD1Qk76x8Rl7kE7tyFRVmbVFWoRYXeA/exec";

    try {
      const rows = transactions.map(t => [t.n, t.d, t.a]);
      const total = transactions.reduce((s, r) => s + r.a, 0);
      
      rows.push(["TOTAL COLLECTION", "", total]);
      rows.push(["Backup Date", new Date().toLocaleString('bn-BD'), ""]);

      const payload = { 
          sheetName: "MinarGo_Data", 
          headers: ["Member Name", "Date", "Amount (TK)"], 
          rows: rows 
      };

      await fetch(GOOGLE_SHEETS_URL, { 
        method: "POST", 
        mode: "no-cors", 
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify(payload) 
      });
      
      toast({ title: "ব্যাকআপ সম্পন্ন!", description: "আপনার ডাটাগুলো সফলভাবে গুগল শিটে পাঠানো হয়েছে।" });
    } catch (error) {
      console.error("Backup failed:", error);
      toast({ variant: "destructive", title: "ব্যাকআপ ব্যর্থ", description: "গুগল শিটে ডাটা পাঠাতে সমস্যা হয়েছে।" });
    } finally {
      setBackupLoading(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-primary text-white shadow-lg py-3 px-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {/* Profile / Logo Section with Settings Trigger */}
        <Dialog>
          <DialogTrigger asChild>
            <div className="relative cursor-pointer group flex items-center gap-3 bg-white/10 p-1 pr-4 rounded-full hover:bg-white/20 transition-all border border-white/5">
              <div className="relative">
                <Avatar className="w-10 h-10 border-2 border-accent shadow-md">
                  {logo ? (
                    <AvatarImage src={logo} className="object-cover" />
                  ) : (
                    <AvatarFallback className="bg-accent text-primary font-bold">MG</AvatarFallback>
                  )}
                </Avatar>
                <div className="absolute -bottom-1 -right-1 bg-success rounded-full p-0.5 border-2 border-primary">
                  <ShieldCheck className="w-3 h-3 text-white" />
                </div>
              </div>
              <div className="hidden sm:block">
                <h1 className="font-extrabold text-sm leading-none tracking-tight">
                  {foundationName}
                </h1>
                <p className="text-[10px] text-accent/80 font-bold uppercase mt-1 tracking-widest">Admin Control</p>
              </div>
            </div>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md bg-white">
            <DialogHeader>
              <DialogTitle className="text-primary font-extrabold flex items-center gap-2">
                <UserIcon className="w-5 h-5" />
                ফাউন্ডেশন প্রোফাইল সেটিংস
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6 py-4">
              {/* Logo Upload */}
              <div className="flex flex-col items-center gap-4">
                <div className="w-28 h-28 rounded-full bg-secondary flex items-center justify-center overflow-hidden border-4 border-accent relative group shadow-lg">
                  {logo ? (
                    <img src={logo} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-primary font-bold text-3xl">MG</span>
                  )}
                  <label className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white text-[10px] font-bold">
                    <Camera className="w-7 h-7 mb-1" />
                    লোগো পরিবর্তন
                    <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                  </label>
                </div>
                <p className="text-xs text-muted-foreground font-medium">ছবির উপরে ক্লিক করে নতুন লোগো দিন</p>
              </div>

              {/* Foundation Name Edit */}
              <div className="space-y-2">
                <Label htmlFor="foundation-name" className="text-primary font-bold">ফাউন্ডেশনের নাম</Label>
                <div className="flex gap-2">
                  <Input 
                    id="foundation-name"
                    value={isEditingName ? tempName : foundationName} 
                    readOnly={!isEditingName}
                    onFocus={() => { if(!isEditingName) { setTempName(foundationName); setIsEditingName(true); } }}
                    onChange={(e) => setTempName(e.target.value)}
                    className="h-11 border-gray-200 focus:border-primary font-medium"
                    placeholder="ফাউন্ডেশনের নাম লিখুন"
                  />
                  {isEditingName && (
                    <div className="flex gap-1">
                      <Button size="icon" className="bg-success hover:bg-success/90" onClick={handleSaveName}>
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button size="icon" variant="destructive" onClick={() => setIsEditingName(false)}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Mobile Title View */}
        <div className="sm:hidden">
          <h1 className="font-extrabold text-xs leading-none">{foundationName}</h1>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="bg-white/10 border-accent/50 text-accent hover:bg-accent hover:text-white transition-all active:scale-95 h-9"
          onClick={handleBackup}
          disabled={backupLoading}
        >
          {backupLoading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <CloudUpload className="w-4 h-4 mr-2" />
          )}
          <span className="hidden sm:inline">{backupLoading ? "Backing up..." : "Backup"}</span>
          <span className="sm:hidden">{backupLoading ? "" : "Backup"}</span>
        </Button>
        <Button 
          variant="destructive" 
          size="sm" 
          className="transition-transform active:scale-95 px-3 sm:px-4 font-bold shadow-md h-9"
          onClick={onLogout}
        >
          <LogOut className="w-4 h-4 sm:mr-2" />
          <span className="hidden sm:inline">Exit</span>
        </Button>
      </div>
    </header>
  );
}
