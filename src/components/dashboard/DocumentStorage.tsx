
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Download, Image as ImageIcon, Camera, Plus } from "lucide-react";
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
    const saved = localStorage.getItem("mg_docs");
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

    if (file.size > 1024 * 1024 * 5) { 
      toast({ 
        variant: "destructive", 
        title: "File too large", 
        description: "Please upload an image under 5MB for better performance." 
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      const newDoc: MGDoc = {
        id: Date.now().toString(),
        name: file.name || "Document",
        data: base64,
        type: file.type,
        date: new Date().toLocaleString('bn-BD', { hour12: true }),
      };
      
      const updated = [newDoc, ...docs];
      setDocs(updated);
      localStorage.setItem("mg_docs", JSON.stringify(updated));
      toast({ title: "সফল!", description: "ছবিটি আপনার গ্যালারিতে যোগ করা হয়েছে।" });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const deleteDoc = (id: string) => {
    if (confirm("আপনি কি এই ছবিটি স্থায়ীভাবে ডিলিট করতে চান?")) {
      const updated = docs.filter(d => d.id !== id);
      setDocs(updated);
      localStorage.setItem("mg_docs", JSON.stringify(updated));
      toast({ title: "ডিলিট হয়েছে", description: "ছবিটি মুছে ফেলা হয়েছে।" });
    }
  };

  if (!isClient) return <div className="p-10 text-center text-muted-foreground">Loading Gallery...</div>;

  return (
    <Card className="bg-white border-none shadow-sm rounded-[30px] overflow-hidden">
      <CardHeader className="pb-3 border-b border-slate-50">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg text-[#1E3A8A] flex items-center gap-2 font-black">
            <ImageIcon className="w-5 h-5 text-[#D4AF37]" />
            ফটো গ্যালারি
          </CardTitle>
          <label className="bg-[#1E3A8A] text-white p-2 rounded-full cursor-pointer shadow-lg active:scale-90 transition-transform">
            <Plus className="w-5 h-5" />
            <input type="file" className="hidden" onChange={handleUpload} accept="image/*" />
          </label>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {docs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 opacity-20">
            <ImageIcon className="w-16 h-16 mb-4" />
            <p className="font-black text-sm uppercase">No Photos Found</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pr-1">
            {docs.map(doc => (
              <div key={doc.id} className="relative group bg-slate-50 rounded-[22px] overflow-hidden border border-slate-100 aspect-square shadow-sm">
                <img 
                  src={doc.data} 
                  alt="Gallery" 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                
                {/* Delete Button always visible on mobile for ease of use */}
                <button 
                  className="absolute top-2 right-2 bg-red-500/90 text-white p-2 rounded-full shadow-lg backdrop-blur-sm active:scale-75 transition-transform" 
                  onClick={() => deleteDoc(doc.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent text-white text-[8px] p-3 font-bold">
                  {doc.date}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
