
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
    toCompany: "Sundow Properties LTD",
    subject: "গ্রুপ অ্যাকাউন্ট খোলা এবং বিশেষ শর্তাবলির জন্য আবেদন।",
    body: `১. সদস্যপদ এবং অ্যাকাউন্ট খোলার আবেদন:
আমরা আপনার কোম্পানিতে "মিনার গো প্রবাসী উন্নয়ন ফাউন্ডেশন"-এর নামে একটি অ্যাকাউন্ট খোলার জন্য আবেদন করছি। আমাদের প্রাথমিক লক্ষ্য হিসেবে আমরা ৪ জন সদস্য নিয়ে এই অ্যাকাউন্টের কার্যক্রম শুরু করতে ইচ্ছুক।

২. কিস্তি বা আমানত জমা দেওয়ার সময়সীমা সংক্রান্ত:
যেহেতু আমরা সবাই প্রবাসী, তাই আমাদের মাসিক বেতন সাধারণত মাসের ১ তারিখ থেকে ২০ তারিখের মধ্যে পাওয়া যায়। এই বাস্তবতার প্রেক্ষিতে, আমাদের বিশেষ অনুরোধ এই যে—আমাদের মাসিক কিস্তি বা আমানত জমা দেওয়ার শেষ তারিখ প্রতি মাসের ২০ তারিখ নির্ধারণ করা হোক।

৩. আর্থিক লেনদেন ও পরিচালনার ক্ষমতা প্রদান:
আমাদের ফাউন্ডেশনের যাবতীয় আর্থিক লেনদেনের পূর্ণ দায়িত্ব আমাদের বড় ভাই জনাব দুলাল-এর ওপর ন্যস্ত থাকবে। তিনিই আমাদের পক্ষ থেকে টাকা জমা দেবেন এবং প্রয়োজনে টাকা উত্তোলন করবেন। তাঁর প্রতিটি সিদ্ধান্ত এবং পদক্ষেপের প্রতি আমাদের পূর্ণ সমর্থন ও সম্মতি রয়েছে।`,
    mobileNumber: "+8801725277089",
    emailAddress: "pranuae.farooq@gmail.com",
    website: "https://1minargo7.atoms.world",
    language: "bn" as "en" | "bn",
  });
  
  const { toast } = useToast();
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsClient(true);
    const today = new Date().toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' });
    setLetterData(prev => ({
      ...prev,
      letterDate: today + " খ্রি."
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
        backgroundColor: "#ffffff",
      });
      
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Demand_Letter_${new Date().getTime()}.pdf`);
      
      toast({ title: "সফল!", description: "প্রফেশনাল PDF ডাউনলোড সম্পন্ন হয়েছে।" });
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label>মোবাইল নম্বর</Label>
              <Input 
                value={letterData.mobileNumber} 
                onChange={(e) => setLetterData({...letterData, mobileNumber: e.target.value})} 
              />
            </div>
            <div className="space-y-1">
              <Label>ইমেইল এড্রেস</Label>
              <Input 
                value={letterData.emailAddress} 
                onChange={(e) => setLetterData({...letterData, emailAddress: e.target.value})} 
              />
            </div>
            <div className="space-y-1">
              <Label>ওয়েবসাইট</Label>
              <Input 
                value={letterData.website} 
                onChange={(e) => setLetterData({...letterData, website: e.target.value})} 
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label>কোম্পানির নাম (Recipient)</Label>
            <Input 
              placeholder="Sundow Properties LTD" 
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
              className="h-11 font-bold"
            />
          </div>

          <div className="space-y-1">
            <Label>লেটারের বিস্তারিত (Detailed Content)</Label>
            <Textarea 
              placeholder="পুরো লেটারটি এখানে লিখুন..." 
              className="min-h-[250px] border-gray-200"
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

      {/* Hidden Template for PDF Generation - Matching Screenshot Perfectly */}
      <div className="fixed left-[-9999px] top-0">
        <div 
          ref={printRef}
          className="w-[210mm] bg-white p-[15mm] text-[#333] font-bengali leading-relaxed relative border-t-[8px] border-b-[8px] border-primary"
          style={{ minHeight: '297mm' }}
        >
          {/* Header Block - Rounded Blue Box */}
          <div className="bg-[#002366] text-white rounded-[25px] py-8 px-10 text-center mb-8 shadow-sm">
            <h1 className="text-4xl font-extrabold mb-2 tracking-wide">মিনার গো প্রবাসী উন্নয়ন ফাউন্ডেশন</h1>
            <p className="text-sm font-bold tracking-[0.2em] text-[#D4AF37] uppercase">
              MINAR GO EXPATRIATE DEVELOPMENT FOUNDATION
            </p>
          </div>

          {/* Date Section */}
          <div className="text-right mb-8">
            <p className="text-lg font-bold"><span className="text-gray-900">Date:</span> {letterData.letterDate}</p>
          </div>

          {/* Recipient Section */}
          <div className="mb-6 space-y-1">
            <p className="font-extrabold text-xl">To:</p>
            <p className="text-xl font-medium">{letterData.toCompany}</p>
          </div>

          {/* Subject Section */}
          <div className="mb-10">
            <p className="font-extrabold text-xl flex gap-2 items-start">
              <span>Subject:</span>
              <span className="font-bold underline decoration-gray-400 underline-offset-[6px]">{letterData.subject}</span>
            </p>
          </div>

          {/* Body Section */}
          <div className="mb-14 text-justify text-[18px] leading-[1.7] whitespace-pre-wrap min-h-[450px] px-2 text-gray-800">
            {letterData.body}
          </div>

          {/* Closing */}
          <div className="mb-20">
            <p className="text-xl">Sincerely,</p>
          </div>

          {/* Signatures Section - Two Columns */}
          <div className="flex justify-between items-end mb-20">
            <div className="w-[300px] text-center">
              <div className="border-t-2 border-gray-800 mb-3 w-full"></div>
              <p className="font-bold text-[14px] uppercase leading-tight">Minar Go Expatriate Development Foundation</p>
            </div>
            <div className="w-[300px] text-center">
              <div className="border-t-2 border-gray-800 mb-3 w-full"></div>
              <p className="font-bold text-[14px] uppercase leading-tight">{letterData.toCompany}</p>
            </div>
          </div>

          {/* Footer Contact Info with Icons */}
          <div className="absolute bottom-20 left-0 right-0 px-[15mm]">
             <div className="flex items-center justify-center gap-10 text-[14px] text-gray-700 pt-6">
               <div className="flex items-center gap-2">
                 <div className="p-1 bg-pink-100 rounded-full"><Phone className="w-3.5 h-3.5 text-pink-600" /></div>
                 <span className="font-bold">{letterData.mobileNumber}</span>
               </div>
               <div className="flex items-center gap-2">
                 <div className="p-1 bg-purple-100 rounded-full"><Mail className="w-3.5 h-3.5 text-purple-600" /></div>
                 <span className="font-bold">{letterData.emailAddress}</span>
               </div>
               <div className="flex items-center gap-2">
                 <div className="p-1 bg-blue-100 rounded-full"><Globe className="w-3.5 h-3.5 text-blue-600" /></div>
                 <span className="font-bold">{letterData.website}</span>
               </div>
             </div>
          </div>

          {/* Bottom Green Strip */}
          <div className="absolute bottom-8 left-0 right-0 px-[15mm] text-center">
            <div className="bg-[#E7F3EF] text-[#2D6A4F] py-3 px-12 rounded-full inline-block text-[14px] font-bold border border-[#CDE5DC] shadow-sm">
              Thank you for your cooperation.
            </div>
            <p className="text-[11px] text-gray-400 mt-3 font-medium tracking-wide">© Minar Go Expatriate Development Foundation</p>
          </div>
        </div>
      </div>
    </div>
  );
}
