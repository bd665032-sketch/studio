
"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Download, RefreshCw, Phone, Mail, Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function DemandLetterGenerator() {
  const [exporting, setExporting] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [letterData, setLetterData] = useState({
    letterDate: "",
    toCompany: "",
    subject: "",
    body: "",
    mobileNumber: "+8801725277089",
    emailAddress: "pranuae.farooq@gmail.com",
    language: "bn" as "en" | "bn",
  });
  
  const { toast } = useToast();
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsClient(true);
    setLetterData(prev => ({
      ...prev,
      letterDate: new Date().toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' }) + " খ্রি."
    }));
  }, []);

  const handleDownloadPDF = async () => {
    if (!letterData.toCompany || !letterData.subject || !letterData.body) {
      toast({ 
        variant: "destructive", 
        title: "তথ্য অসম্পূর্ণ", 
        description: "দয়া করে কোম্পানি নাম, বিষয় এবং মূল বক্তব্য পূরণ করুন।" 
      });
      return;
    }

    if (!printRef.current) return;
    setExporting(true);
    
    try {
      const element = printRef.current;
      const canvas = await html2canvas(element, {
        scale: 3,
        useCORS: true,
        logging: false,
      });
      
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Demand_Letter_${new Date().getTime()}.pdf`);
      
      toast({ title: "সফল!", description: "PDF ডাউনলোড সম্পন্ন হয়েছে।" });
    } catch (error) {
      console.error("PDF Export Error:", error);
      toast({ variant: "destructive", title: "ত্রুটি", description: "PDF তৈরি করতে সমস্যা হয়েছে।" });
    } finally {
      setExporting(false);
    }
  };

  if (!isClient) return null;

  return (
    <div className="space-y-6">
      <Card className="bg-white border-none shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg text-primary flex items-center gap-2 font-extrabold">
            <FileText className="w-5 h-5" />
            ডিমান্ড লেটার জেনারেটর (PDF)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>লেটারের তারিখ</Label>
              <Input 
                placeholder="যেমন: ৩ মে, ২০২৩ খ্রি."
                value={letterData.letterDate} 
                onChange={(e) => setLetterData({...letterData, letterDate: e.target.value})} 
              />
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
            <Label>লেটারের বিস্তারিত (Detailed Content)</Label>
            <Textarea 
              placeholder="পুরো লেটারটি এখানে লিখুন..." 
              className="min-h-[200px] border-gray-200"
              value={letterData.body}
              onChange={(e) => setLetterData({...letterData, body: e.target.value})}
            />
          </div>

          <Button 
            className="w-full bg-primary hover:bg-primary/90 text-white font-bold h-12 shadow-md active:scale-95 transition-transform flex items-center justify-center gap-2 mt-4"
            onClick={handleDownloadPDF}
            disabled={exporting}
          >
            {exporting ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
            {exporting ? "PDF তৈরি হচ্ছে..." : "প্রফেশনাল PDF ডাউনলোড করুন"}
          </Button>
        </CardContent>
      </Card>

      {/* Hidden Template for PDF Generation */}
      <div className="fixed left-[-9999px] top-0">
        <div 
          ref={printRef}
          className="w-[210mm] bg-white p-[15mm] text-[#333] font-bengali leading-relaxed relative"
          style={{ minHeight: '297mm' }}
        >
          {/* Header Block */}
          <div className="bg-[#002366] text-white rounded-2xl py-6 px-10 text-center mb-10 shadow-md">
            <h1 className="text-3xl font-extrabold mb-1">মিনার গো প্রবাসী উন্নয়ন ফাউন্ডেশন</h1>
            <p className="text-sm font-bold tracking-widest text-[#D4AF37]">
              MINAR GO EXPATRIATE DEVELOPMENT FOUNDATION
            </p>
          </div>

          {/* Date Section */}
          <div className="text-right mb-6">
            <p className="font-bold"><span className="text-gray-600">Date:</span> {letterData.letterDate}</p>
          </div>

          {/* Recipient Section */}
          <div className="mb-6">
            <p className="font-extrabold text-lg">To:</p>
            <p className="text-lg">{letterData.toCompany}</p>
          </div>

          {/* Subject Section */}
          <div className="mb-8 border-l-4 border-[#002366] pl-4">
            <p className="font-extrabold text-lg">
              Subject: <span className="font-normal underline decoration-[#D4AF37] decoration-2 underline-offset-4">{letterData.subject}</span>
            </p>
          </div>

          {/* Body Section */}
          <div className="mb-12 text-justify text-lg whitespace-pre-wrap min-h-[400px]">
            {letterData.body}
          </div>

          {/* Closing */}
          <div className="mb-16">
            <p className="text-lg">Sincerely,</p>
          </div>

          {/* Signatures */}
          <div className="flex justify-between items-end mb-16 px-4">
            <div className="w-64">
              <div className="border-t-2 border-[#333] pt-2">
                <p className="font-extrabold text-sm uppercase">Minar Go Expatriate Development Foundation</p>
              </div>
            </div>
            <div className="w-64">
              <div className="border-t-2 border-[#333] pt-2">
                <p className="font-extrabold text-sm uppercase text-right">{letterData.toCompany}</p>
              </div>
            </div>
          </div>

          {/* Footer Contact Info */}
          <div className="absolute bottom-16 left-0 right-0 px-[15mm]">
             <div className="flex items-center justify-center gap-6 text-sm text-gray-600 border-t border-gray-100 pt-6">
               <div className="flex items-center gap-1">
                 <Phone className="w-3 h-3 text-[#D4AF37]" />
                 <span>+8801725277089</span>
               </div>
               <div className="flex items-center gap-1">
                 <Mail className="w-3 h-3 text-[#D4AF37]" />
                 <span>pranuae.farooq@gmail.com</span>
               </div>
               <div className="flex items-center gap-1">
                 <Globe className="w-3 h-3 text-[#D4AF37]" />
                 <span>https://1minargo7.atoms.world</span>
               </div>
             </div>
          </div>

          {/* Bottom Strip */}
          <div className="absolute bottom-8 left-0 right-0 px-[15mm] text-center">
            <div className="bg-[#E7F3EF] text-[#2D6A4F] py-2 px-8 rounded-full inline-block text-xs font-bold border border-[#CDE5DC]">
              Thank you for your cooperation.
            </div>
            <p className="text-[10px] text-gray-400 mt-2">© Minar Go Expatriate Development Foundation</p>
          </div>
        </div>
      </div>
    </div>
  );
}
