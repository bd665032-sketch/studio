
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Upload, Trash2, Eye, FileText } from "lucide-react";
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

  const viewDoc = (doc: MGDoc) => {
    try {
      const link = document.createElement('a');
      link.href = doc.data;
      link.target = '_blank';
      link.click();
    } catch (e) {
      toast({ variant: "destructive", title: "Error", description: "ডকুমেন্টটি ওপেন করা যাচ্ছে না।" });
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
          <Label>ডকুমেন্টের নাম (যেমন: পাসপোর্ট কপি)</Label>
          <div className="flex gap-2">
            <Input 
              placeholder="ফাইলের নাম লিখুন" 
              value={newDocName} 
              onChange={(e) => setNewDocName(e.target.value)} 
              className="h-12"
            />
            <label className="bg-primary hover:bg-primary/90 text-white px-4 flex items-center justify-center rounded-md cursor-pointer transition-transform active:scale-95">
              <input type="file" className="hidden" onChange={handleUpload} accept=".png,.jpg,.jpeg,.pdf" />
              <Upload className="w-5 h-5" />
            </label>
          </div>
        </div>

        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
          {docs.length === 0 ? (
            <p className="text-center text-muted-foreground italic text-xs py-8 bg-secondary/30 rounded-lg">কোন ডকুমেন্ট সেভ করা নেই।</p>
          ) : (
            <div className="grid gap-2">
              {docs.map(doc => (
                <div key={doc.id} className="bg-secondary/50 p-3 rounded-md flex items-center justify-between border border-gray-100">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="bg-white p-2 rounded-full">
                      <FileText className="w-4 h-4 text-primary" />
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-sm font-bold text-gray-800 truncate">{doc.name}</p>
                      <p className="text-[10px] text-gray-500">{doc.date}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => viewDoc(doc)} className="h-8 w-8 text-primary">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteDoc(doc.id)} className="h-8 w-8 text-destructive">
                      <Trash2 className="w-4 h-4" />
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
