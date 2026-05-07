
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Upload, Trash2, ExternalLink, FileText } from "lucide-react";
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
  const { toast } = useToast();

  useEffect(() => {
    const saved = localStorage.getItem("mg_docs");
    if (saved) setDocs(JSON.parse(saved));
  }, []);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !newDocName) {
      return toast({ variant: "destructive", title: "Error", description: "Enter name and select file." });
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      const newDoc: MGDoc = {
        id: Date.now().toString(),
        name: newDocName,
        data: base64,
        type: file.type,
        date: new Date().toLocaleDateString(),
      };
      
      const updated = [newDoc, ...docs];
      setDocs(updated);
      localStorage.setItem("mg_docs", JSON.stringify(updated));
      setNewDocName("");
      toast({ title: "Success", description: "Document uploaded to LocalStorage." });
    };
    reader.readAsDataURL(file);
  };

  const deleteDoc = (id: string) => {
    if (!confirm("Delete this document?")) return;
    const updated = docs.filter(d => d.id !== id);
    setDocs(updated);
    localStorage.setItem("mg_docs", JSON.stringify(updated));
    toast({ title: "Deleted", description: "Document removed." });
  };

  const viewDoc = (data: string) => {
    const win = window.open();
    if (win) {
      win.document.write(`<iframe src="${data}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
    }
  };

  return (
    <Card className="bg-white border-none shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg text-primary flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Document Storage
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Document Title</Label>
          <div className="flex gap-2">
            <Input placeholder="e.g. Passport Copy" value={newDocName} onChange={(e) => setNewDocName(e.target.value)} />
            <label className="bg-accent hover:bg-gold-dark text-white px-3 flex items-center justify-center rounded-md cursor-pointer transition-transform active:scale-95">
              <input type="file" className="hidden" onChange={handleUpload} accept=".png,.jpg,.jpeg,.pdf" />
              <Upload className="w-4 h-4" />
            </label>
          </div>
        </div>

        <div className="space-y-2">
          {docs.length === 0 ? (
            <p className="text-center text-muted-foreground italic text-xs py-4">No documents stored locally.</p>
          ) : (
            <div className="grid gap-2">
              {docs.map(doc => (
                <div key={doc.id} className="bg-secondary p-3 rounded-md flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-sm font-bold text-gray-800 leading-none">{doc.name}</p>
                      <p className="text-[10px] text-gray-500 mt-1">{doc.date}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => viewDoc(doc.data)} className="text-primary hover:text-primary/80">
                      <ExternalLink className="w-4 h-4" />
                    </button>
                    <button onClick={() => deleteDoc(doc.id)} className="text-destructive hover:text-destructive/80">
                      <Trash2 className="w-4 h-4" />
                    </button>
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
