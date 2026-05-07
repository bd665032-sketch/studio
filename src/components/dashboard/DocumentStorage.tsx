"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Image as ImageIcon, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MGDoc {
  id: string;
  name: string;
  data: string;
  type: string;
  date: string;
}

export default function DocumentStorage() {
  const [docs, setDocs] = useState<MGDoc[]>([]);
  const [isClient, setIsClient] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
    const saved = localStorage.getItem("mg_native_docs");
    if (saved) {
      try {
        setDocs(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse docs", e);
      }
    }
  }, []);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024 * 8) { 
      toast({ 
        variant: "destructive", 
        title: "File too large", 
        description: "Please upload an image under 8MB for performance." 
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      const newDoc: MGDoc = {
        id: Date.now().toString(),
        name: file.name || "Foundation Photo",
        data: base64,
        type: file.type,
        date: new Date().toLocaleString('bn-BD', { hour12: true }),
      };
      
      const updated = [newDoc, ...docs];
      setDocs(updated);
      localStorage.setItem("mg_native_docs", JSON.stringify(updated));
      toast({ title: "সফল!", description: "গ্যালারিতে ছবি যোগ হয়েছে।" });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const deleteDoc = (id: string) => {
    if (confirm("আপনি কি এই ছবিটি স্থায়ীভাবে ডিলিট করতে চান?")) {
      const updated = docs.filter(d => d.id !== id);
      setDocs(updated);
      localStorage.setItem("mg_native_docs", JSON.stringify(updated));
      toast({ title: "সফল!", description: "ছবিটি মুছে ফেলা হয়েছে।" });
    }
  };

  if (!isClient) return <div className="p-10 text-center text-muted-foreground">Loading Native Gallery...</div>;

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
      <Card className="bg-white border-none shadow-2xl rounded-[40px] overflow-hidden">
        <CardHeader className="pb-4 border-b border-slate-50 pt-10">
          <div className="flex items-center justify-between px-2">
            <CardTitle className="text-xl text-[#1E3A8A] flex items-center gap-3 font-black">
              <ImageIcon className="w-6 h-6 text-[#D4AF37]" />
              Foundation Gallery
            </CardTitle>
            <label className="bg-[#1E3A8A] text-white w-12 h-12 rounded-full cursor-pointer shadow-xl flex items-center justify-center active:scale-90 transition-transform">
              <Plus className="w-6 h-6" />
              <input type="file" className="hidden" onChange={handleUpload} accept="image/*" />
            </label>
          </div>
        </CardHeader>
        <CardContent className="pt-8">
          {docs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 opacity-10">
              <ImageIcon className="w-20 h-20 mb-4" />
              <p className="font-black text-sm uppercase tracking-widest">No Storage Data</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-5 max-h-[60vh] overflow-y-auto pr-2 pb-6">
              {docs.map(doc => (
                <div key={doc.id} className="relative group bg-slate-50 rounded-[28px] overflow-hidden border border-slate-100 aspect-square shadow-sm">
                  <img 
                    src={doc.data} 
                    alt="Storage" 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  
                  <button 
                    className="absolute top-3 right-3 bg-red-500/90 text-white p-2.5 rounded-full shadow-2xl backdrop-blur-md active:scale-75 transition-transform" 
                    onClick={() => deleteDoc(doc.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent text-white text-[9px] p-4 font-black">
                    {doc.date}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
