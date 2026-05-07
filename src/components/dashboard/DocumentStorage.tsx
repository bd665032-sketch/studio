
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Trash2, Download, Image as ImageIcon, Camera } from "lucide-react";
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

    if (file.size > 1024 * 1024 * 2) { 
      toast({ variant: "destructive", title: "ফাইল অনেক বড়", description: "দয়া করে ২ এমবি-র কম সাইজের ছবি ব্যবহার করুন।" });
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
      toast({ title: "সফল হয়েছে", description: "ছবিটি গ্যালারিতে সেভ করা হয়েছে।" });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const deleteDoc = (id: string) => {
    if (typeof window !== 'undefined' && !window.confirm("আপনি কি এটি ডিলিট করতে চান?")) return;
    const updated = docs.filter(d => d.id !== id);
    setDocs(updated);
    localStorage.setItem("mg_docs", JSON.stringify(updated));
    toast({ title: "ডিলিট হয়েছে", description: "ছবিটি মুছে ফেলা হয়েছে।" });
  };

  const downloadDoc = (doc: MGDoc) => {
    try {
      const link = document.createElement('a');
      link.href = doc.data;
      link.download = `MinarGo_${doc.id}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      toast({ variant: "destructive", title: "Error", description: "ডাউনলোড করা সম্ভব হচ্ছে না।" });
    }
  };

  if (!isClient) return <div className="p-10 text-center text-muted-foreground">Loading Gallery...</div>;

  return (
    <Card className="bg-white border-none shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg text-primary flex items-center gap-2">
          <ImageIcon className="w-5 h-5" />
          আমার গ্যালারি (Photo Gallery)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-primary/20 rounded-xl bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer group">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <div className="p-3 bg-white rounded-full shadow-sm group-active:scale-95 transition-transform mb-2">
              <Camera className="w-6 h-6 text-primary" />
            </div>
            <p className="text-sm font-bold text-primary">ছবি আপলোড করুন</p>
            <p className="text-[10px] text-muted-foreground mt-1">গ্যালারি থেকে ফটো সিলেক্ট করুন</p>
          </div>
          <input type="file" className="hidden" onChange={handleUpload} accept="image/*" />
        </label>

        <div className="grid grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-1">
          {docs.length === 0 ? (
            <div className="col-span-2 text-center py-10 opacity-30">
              <ImageIcon className="w-12 h-12 mx-auto mb-2" />
              <p className="text-xs">কোন ছবি রাখা নেই</p>
            </div>
          ) : (
            docs.map(doc => (
              <div key={doc.id} className="relative group bg-white rounded-lg overflow-hidden border border-gray-100 shadow-sm aspect-square">
                <img 
                  src={doc.data} 
                  alt="Stored document" 
                  className="w-full h-full object-cover"
                />
                
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button 
                    size="icon" 
                    variant="secondary" 
                    className="h-8 w-8 rounded-full" 
                    onClick={() => downloadDoc(doc)}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button 
                    size="icon" 
                    variant="destructive" 
                    className="h-8 w-8 rounded-full" 
                    onClick={() => deleteDoc(doc.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[8px] px-2 py-1">
                  {doc.date}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
