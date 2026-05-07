
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { LogOut, CloudUpload, Camera } from "lucide-react";

export default function Header({ onLogout }: { onLogout: () => void }) {
  const [logo, setLogo] = useState<string | null>(null);

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

  const handleBackup = () => {
    window.open("https://docs.google.com/spreadsheets/d/your-id", "_blank");
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
          className="hidden sm:flex border-accent text-accent hover:bg-accent hover:text-white"
          onClick={handleBackup}
        >
          <CloudUpload className="w-4 h-4 mr-2" />
          Backup
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
