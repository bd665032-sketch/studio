
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Wand2, Download, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { generateDemandLetterDraft } from "@/ai/flows/generate-demand-letter-draft";
import { exportDemandLetterPDF } from "@/lib/pdf-utils";

export default function DemandLetterGenerator() {
  const [loading, setLoading] = useState(false);
  const [letterData, setLetterData] = useState({
    letterDate: new Date().toISOString().split('T')[0],
    toCompany: "",
    subject: "",
    body: "",
    mobileNumber: "+880 ",
    emailAddress: "info@minargo.com",
    language: "bn" as "en" | "bn",
  });
  const [result, setResult] = useState("");
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!letterData.toCompany || !letterData.subject || !letterData.body) {
      toast({ 
        variant: "destructive", 
        title: "তথ্য অসম্পূর্ণ", 
        description: "দয়া করে কোম্পানি নাম, বিষয় এবং মূল বক্তব্য পূরণ করুন।" 
      });
      return;
    }

    setLoading(true);
    setResult(""); // Clear previous result
    
    try {
      const response = await generateDemandLetterDraft(letterData);
      if (response && response.letterContent) {
        setResult(response.letterContent);
        toast({ title: "সফল হয়েছে", description: "AI আপনার জন্য ড্রাফটটি তৈরি করেছে।" });
      } else {
        throw new Error("No content returned");
      }
    } catch (error) {
      console.error("AI Generation Error:", error);
      toast({ 
        variant: "destructive", 
        title: "সমস্যা হয়েছে", 
        description: "AI ড্রাফট তৈরি করতে পারেনি। আবার চেষ্টা করুন।" 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!result) return;
    exportDemandLetterPDF(result, letterData.letterDate);
    toast({ title: "PDF ডাউনলোড হচ্ছে", description: "আপনার ডকুমেন্টটি তৈরি করা হয়েছে।" });
  };

  return (
    <Card className="bg-white border-none shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg text-primary flex items-center gap-2 font-extrabold">
          <FileText className="w-5 h-5" />
          AI ডিমান্ড লেটার জেনারেটর
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label>লেটারের তারিখ</Label>
            <Input type="date" value={letterData.letterDate} onChange={(e) => setLetterData({...letterData, letterDate: e.target.value})} />
          </div>
          <div className="space-y-1">
            <Label>ভাষা (Language)</Label>
            <Select value={letterData.language} onValueChange={(v: any) => setLetterData({...letterData, language: v})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bn">বাংলা (Bengali)</SelectItem>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-1">
          <Label>কোম্পানির নাম (Recipient)</Label>
          <Input 
            placeholder="কাকে পাঠাতে চান?" 
            value={letterData.toCompany} 
            onChange={(e) => setLetterData({...letterData, toCompany: e.target.value})} 
            className="h-11"
          />
        </div>

        <div className="space-y-1">
          <Label>বিষয় (Subject)</Label>
          <Input 
            placeholder="লেটারের বিষয়বস্তু" 
            value={letterData.subject} 
            onChange={(e) => setLetterData({...letterData, subject: e.target.value})} 
            className="h-11"
          />
        </div>

        <div className="space-y-1">
          <Label>মূল বক্তব্য (Context)</Label>
          <Textarea 
            placeholder="আপনার দাবি বা সমস্যাটি সংক্ষেপে লিখুন..." 
            className="min-h-[100px] border-gray-200"
            value={letterData.body}
            onChange={(e) => setLetterData({...letterData, body: e.target.value})}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label>মোবাইল</Label>
            <Input value={letterData.mobileNumber} onChange={(e) => setLetterData({...letterData, mobileNumber: e.target.value})} />
          </div>
          <div className="space-y-1">
            <Label>ইমেইল</Label>
            <Input value={letterData.emailAddress} onChange={(e) => setLetterData({...letterData, emailAddress: e.target.value})} />
          </div>
        </div>

        <Button 
          className="w-full bg-accent hover:bg-gold-dark text-white font-bold h-12 shadow-md active:scale-95 transition-transform flex items-center justify-center gap-2"
          onClick={handleGenerate}
          disabled={loading}
        >
          {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}
          {loading ? "AI ড্রাফট তৈরি হচ্ছে..." : "AI দিয়ে লেটার তৈরি করুন"}
        </Button>

        {result && (
          <div className="mt-6 p-4 bg-secondary/50 rounded-xl border border-dashed border-primary/20 space-y-4 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-primary uppercase">Draft Preview:</h4>
              <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">Ready to Export</span>
            </div>
            <div className={`text-sm leading-relaxed whitespace-pre-wrap p-3 bg-white rounded-md border border-gray-100 ${letterData.language === 'bn' ? 'font-bengali' : 'font-body'}`}>
              {result}
            </div>
            <Button 
              className="w-full bg-primary hover:bg-primary/90 text-white font-bold h-12 flex items-center justify-center gap-2 shadow-lg"
              onClick={handleDownload}
            >
              <Download className="w-5 h-5" />
              প্রফেশনাল PDF ডাউনলোড করুন
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
