
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Upload, Trash2, Eye, FileText, Download, Image as ImageIcon } from "lucide-react";
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
  const [newDocName, setNewDocName] = useState("");
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
    if (!newDocName) {
      toast({ variant: "destructive", title: "নাম প্রয়োজন", description: "ডকুমেন্টের একটি নাম দিন।" });
      return;
    }

    // Check file size (localStorage is limited to ~5MB total)
    if (file.size > 1024 * 1024 * 2) { // 2MB limit per file for localStorage safety
      toast({ variant: "destructive", title: "ফাইল অনেক বড়", description: "দয়া করে ২ এমবি-র কম সাইজের ফাইল আপলোড করুন।" });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      const newDoc: MGDoc = {
        id: Date.now().toString(),
        name: newDocName,
        data: base64,
        type: file.type,
        date: new Date().toLocaleDateString('bn-BD'),
      };
      
      const updated = [newDoc, ...docs];
      setDocs(updated);
      localStorage.setItem("mg_docs", JSON.stringify(updated));
      setNewDocName("");
      toast({ title: "সফল হয়েছে", description: "ডকুমেন্টটি সেভ করা হয়েছে।" });
    };
    reader.readAsDataURL(file);
  };

  const deleteDoc = (id: string) => {
    if (!confirm("আপনি কি এটি ডিলিট করতে চান?")) return;
    const updated = docs.filter(d => d.id !== id);
    setDocs(updated);
    localStorage.setItem("mg_docs", JSON.stringify(updated));
    toast({ title: "ডিলিট হয়েছে", description: "ডকুমেন্টটি মুছে ফেলা হয়েছে।" });
  };

  const downloadDoc = (doc: MGDoc) => {
    try {
      const link = document.createElement('a');
      link.href = doc.data;
      link.download = doc.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast({ title: "ডাউনলোড শুরু হয়েছে", description: doc.name + " ফাইলটি সেভ হচ্ছে।" });
    } catch (e) {
      toast({ variant: "destructive", title: "Error", description: "ডাউনলোড করা সম্ভব হচ্ছে না।" });
    }
  };

  if (!isClient) return null;

  return (
    <Card className="bg-white border-none shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg text-primary flex items-center gap-2">
          <Upload className="w-5 h-5" />
          ডকুমেন্ট স্টোরেজ (Document Storage)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label className="text-sm font-bold">ডকুমেন্টের নাম (যেমন: পাসপোর্ট বা আইডি কার্ড)</Label>
          <div className="flex gap-2">
            <Input 
              placeholder="ফাইলের নাম লিখুন" 
              value={newDocName} 
              onChange={(e) => setNewDocName(e.target.value)} 
              className="h-12 border-gray-200"
            />
            <label className="bg-accent hover:bg-gold-dark text-white px-5 flex items-center justify-center rounded-md cursor-pointer transition-transform active:scale-95 shadow-sm">
              <input type="file" className="hidden" onChange={handleUpload} accept="image/*,.pdf" />
              <Upload className="w-5 h-5" />
            </label>
          </div>
          <p className="text-[10px] text-muted-foreground italic">টিপস: ভালো পারফরম্যান্সের জন্য ছোট সাইজের ছবি ব্যবহার করুন।</p>
        </div>

        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
          {docs.length === 0 ? (
            <div className="text-center py-10 bg-secondary/20 rounded-xl border border-dashed border-gray-200">
              <ImageIcon className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-muted-foreground text-xs">কোন ডকুমেন্ট বা ছবি সেভ করা নেই।</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {docs.map(doc => (
                <div key={doc.id} className="bg-white p-3 rounded-lg flex items-center justify-between border border-gray-100 shadow-sm hover:border-primary/20 transition-colors">
                  <div className="flex items-center gap-3 overflow-hidden">
                    {doc.type.startsWith('image/') ? (
                      <div className="w-12 h-12 rounded-md overflow-hidden bg-gray-100 border border-gray-200 flex-shrink-0">
                        <img src={doc.data} alt={doc.name} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-md bg-primary/5 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-6 h-6 text-primary" />
                      </div>
                    )}
                    <div className="overflow-hidden">
                      <p className="text-sm font-bold text-gray-800 truncate">{doc.name}</p>
                      <p className="text-[10px] text-gray-500 font-medium">{doc.date}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => downloadDoc(doc)} 
                      className="h-9 w-9 text-primary hover:bg-primary/5"
                      title="Download"
                    >
                      <Download className="w-4.5 h-4.5" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => deleteDoc(doc.id)} 
                      className="h-9 w-9 text-destructive hover:bg-destructive/5"
                      title="Delete"
                    >
                      <Trash2 className="w-4.5 h-4.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
