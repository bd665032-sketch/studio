
"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Download, RefreshCw, Phone, Mail, Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function DemandLetterGenerator() {
  const [exporting, setExporting] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [letterData, setLetterData] = useState({
    letterDate: "০৩ মে, ২০২৬ খ্রি.",
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
  });
  
  const { toast } = useToast();
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsClient(true);
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
      await new Promise(resolve => setTimeout(resolve, 500));
      
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
      pdf.save(`MinarGo_Letter_${new Date().getTime()}.pdf`);
      
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
            ডিমান্ড লেটার জেনারেটর (Official PDF)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>লেটারের তারিখ</Label>
              <Input 
                value={letterData.letterDate} 
                onChange={(e) => setLetterData({...letterData, letterDate: e.target.value})} 
              />
            </div>
            <div className="space-y-1">
              <Label>কোম্পানির নাম</Label>
              <Input 
                value={letterData.toCompany} 
                onChange={(e) => setLetterData({...letterData, toCompany: e.target.value})} 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
            <Label>বিষয় (Subject)</Label>
            <Input 
              value={letterData.subject} 
              onChange={(e) => setLetterData({...letterData, subject: e.target.value})} 
              className="font-bold"
            />
          </div>

          <div className="space-y-1">
            <Label>লেটারের বিস্তারিত কন্টেন্ট</Label>
            <Textarea 
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

      {/* Hidden Template for PDF Generation - EXACT CLONE OF SCREENSHOT */}
      <div style={{ position: 'absolute', top: '-10000px', left: '-10000px', width: '210mm', minHeight: '297mm' }}>
        <div 
          ref={printRef}
          className="bg-white text-[#333] font-bengali relative flex flex-col"
          style={{ width: '210mm', minHeight: '297mm', padding: '10mm 15mm' }}
        >
          {/* Top Blue Border Strip */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-[#002366]"></div>

          {/* Professional Header Banner Box */}
          <div className="mt-8 mb-8 flex justify-center">
            <div className="bg-[#002366] text-white rounded-[20px] py-10 px-12 text-center shadow-lg w-full max-w-[90%] flex flex-col items-center">
              <h1 className="text-[34px] font-extrabold mb-1 leading-tight tracking-wide">মিনার গো প্রবাসী উন্নয়ন ফাউন্ডেশন</h1>
              <p className="text-[14px] font-bold tracking-[0.15em] text-[#D4AF37] uppercase">
                MINAR GO EXPATRIATE DEVELOPMENT FOUNDATION
              </p>
            </div>
          </div>

          {/* Date Row */}
          <div className="text-right mb-6">
            <p className="text-[17px] font-bold">Date: {letterData.letterDate}</p>
          </div>

          {/* Recipient Row */}
          <div className="mb-2">
            <p className="text-[17px] font-bold">To:</p>
            <p className="text-[17px] font-medium leading-none">{letterData.toCompany}</p>
          </div>

          {/* Subject Row */}
          <div className="mb-8">
            <p className="text-[17px] font-bold">
              Subject: <span className="underline underline-offset-4 decoration-1">{letterData.subject}</span>
            </p>
          </div>

          {/* Body Content Box with Light Beige BG */}
          <div className="mb-12 bg-[#FFF9F2] p-8 rounded-sm text-justify text-[17px] leading-[1.8] whitespace-pre-wrap flex-1 min-h-[400px]">
            {letterData.body}
          </div>

          {/* Closing */}
          <div className="mb-20">
            <p className="text-[17px] font-medium">Sincerely,</p>
          </div>

          {/* Signature Rows - Exact Two Column Layout */}
          <div className="flex justify-between mb-16 px-2">
            <div className="text-center w-[45%] border-t border-gray-900 pt-2">
              <p className="font-bold text-[11px] uppercase text-gray-800">Minar Go Expatriate Development Foundation</p>
            </div>
            <div className="text-center w-[40%] border-t border-gray-900 pt-2">
              <p className="font-bold text-[11px] uppercase text-gray-800">{letterData.toCompany}</p>
            </div>
          </div>

          {/* Contact Details with Colored Icons */}
          <div className="flex items-center justify-center gap-8 text-[12px] font-bold mb-4 pt-4 border-t border-gray-100">
             <div className="flex items-center gap-1.5">
               <Phone className="w-3.5 h-3.5 text-[#E91E63]" />
               <span className="text-[#333]">{letterData.mobileNumber}</span>
             </div>
             <div className="flex items-center gap-1.5 border-l border-gray-300 pl-8">
               <Mail className="w-3.5 h-3.5 text-[#9C27B0]" />
               <span className="text-[#333]">{letterData.emailAddress}</span>
             </div>
             <div className="flex items-center gap-1.5 border-l border-gray-300 pl-8">
               <Globe className="w-3.5 h-3.5 text-[#03A9F4]" />
               <span className="text-[#333]">{letterData.website}</span>
             </div>
          </div>

          {/* Green "Thank You" Pill Bar */}
          <div className="text-center mb-4">
            <div className="bg-[#E7F3EF] text-[#2D6A4F] py-2 px-10 rounded-full inline-block text-[13px] font-bold border border-[#CDE5DC] shadow-sm">
              Thank you for your cooperation.
            </div>
          </div>

          {/* Small Copyright Footer */}
          <div className="text-center pb-4">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
              © Minar Go Expatriate Development Foundation
            </p>
          </div>
          
          {/* Bottom Blue Border Strip */}
          <div className="absolute bottom-0 left-0 right-0 h-2 bg-[#002366]"></div>
        </div>
      </div>
    </div>
  );
}

