
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { LogOut, CloudUpload, Camera, Loader2 } from "lucide-react";
import { useMinarData } from "@/hooks/use-minar-data";
import { useToast } from "@/hooks/use-toast";

export default function Header({ onLogout }: { onLogout: () => void }) {
  const [logo, setLogo] = useState<string | null>(null);
  const [backupLoading, setBackupLoading] = useState(false);
  const { transactions } = useMinarData();
  const { toast } = useToast();

  useEffect(() => {
    const savedLogo = localStorage.getItem("mg_logo");
    if (savedLogo) setLogo(savedLogo);
  }, []);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setLogo(base64);
        localStorage.setItem("mg_logo", base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBackup = async () => {
    if (transactions.length === 0) {
      toast({ 
        variant: "destructive", 
        title: "ব্যাকআপ ডাটা নেই!", 
        description: "শিটে পাঠানোর মতো কোনো লেনদেনের তথ্য পাওয়া যায়নি।" 
      });
      return;
    }

    setBackupLoading(true);
    const GOOGLE_SHEETS_URL = "https://script.google.com/macros/s/AKfycbx0V8EesGLJjp9xXVFi6Q_GQdjNzzH9TsmvXFtoD1Qk76x8Rl7kE7tyFRVmbVFWoRYXeA/exec";

    // Prepare rows for the sheet
    const rows = transactions.map(t => [t.n, t.d, t.a]);
    const total = transactions.reduce((s, r) => s + r.a, 0);
    
    // Add summary rows
    rows.push(["TOTAL COLLECTION", "", total]);
    rows.push(["Backup Date", new Date().toLocaleString('bn-BD'), ""]);

    const payload = { 
        sheetName: "MinarGo_Data", 
        headers: ["Member Name", "Date", "Amount (TK)"], 
        rows: rows 
    };

    try {
      await fetch(GOOGLE_SHEETS_URL, { 
        method: "POST", 
        mode: "no-cors", 
        body: JSON.stringify(payload) 
      });
      
      toast({ 
        title: "ব্যাকআপ সম্পন্ন!", 
        description: "আপনার ডাটাগুলো সফলভাবে গুগল শিটে পাঠানো হয়েছে।" 
      });
    } catch (error) {
      console.error("Backup failed:", error);
      toast({ 
        variant: "destructive", 
        title: "ব্যাকআপ ব্যর্থ", 
        description: "গুগল শিটে ডাটা পাঠাতে সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।" 
      });
    } finally {
      setBackupLoading(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-primary text-white shadow-lg py-3 px-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <label className="relative cursor-pointer group">
          <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
          <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center overflow-hidden border-2 border-accent">
            {logo ? (
              <img src={logo} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <span className="text-primary font-bold text-sm">MG</span>
            )}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="w-4 h-4 text-white" />
            </div>
          </div>
        </label>
        <div>
          <h1 className="font-extrabold text-sm sm:text-lg leading-none">MINAR GO EXPATRIATE</h1>
          <p className="text-[10px] sm:text-xs text-accent font-medium">Admin Panel</p>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="border-accent text-accent hover:bg-accent hover:text-white transition-all active:scale-95"
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
          className="transition-transform active:scale-95 px-3 sm:px-4"
          onClick={onLogout}
        >
          <LogOut className="w-4 h-4 sm:mr-2" />
          <span className="hidden sm:inline">Exit</span>
        </Button>
      </div>
    </header>
  );
}
