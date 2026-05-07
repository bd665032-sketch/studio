
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
      // Small delay to ensure state is updated in the hidden div
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const element = printRef.current;
      const canvas = await html2canvas(element, {
        scale: 3, // Balanced scale for quality vs size
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        windowWidth: 794, // A4 width in pixels at 96 DPI
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

      {/* Hidden Template for PDF Generation - Improved Container */}
      <div style={{ position: 'absolute', top: '-10000px', left: '-10000px', overflow: 'hidden', height: 0 }}>
        <div 
          ref={printRef}
          className="bg-white text-[#333] font-bengali leading-relaxed relative flex flex-col"
          style={{ width: '210mm', minHeight: '297mm', padding: '15mm' }}
        >
          {/* Top Border Line */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#002366]"></div>

          {/* Header Box - Blue Rounded */}
          <div className="mt-4 mb-10 flex justify-center">
            <div className="bg-[#002366] text-white rounded-[25px] py-10 px-16 text-center shadow-lg w-full max-w-[85%]">
              <h1 className="text-[34px] font-extrabold mb-3 leading-tight tracking-wide">মিনার গো প্রবাসী উন্নয়ন ফাউন্ডেশন</h1>
              <p className="text-[13px] font-bold tracking-[0.25em] text-[#D4AF37] uppercase">
                MINAR GO EXPATRIATE DEVELOPMENT FOUNDATION
              </p>
            </div>
          </div>

          {/* Date Section - Right Aligned */}
          <div className="text-right mb-10">
            <p className="text-[18px] font-bold">Date: {letterData.letterDate}</p>
          </div>

          {/* Recipient Section */}
          <div className="mb-8 space-y-1">
            <p className="font-extrabold text-[20px]">To:</p>
            <p className="text-[20px] font-medium">{letterData.toCompany}</p>
          </div>

          {/* Subject Section */}
          <div className="mb-12">
            <p className="font-extrabold text-[20px] flex gap-2 items-start">
              <span>Subject:</span>
              <span className="font-bold underline underline-offset-[8px] decoration-1">{letterData.subject}</span>
            </p>
          </div>

          {/* Body Section */}
          <div className="mb-16 text-justify text-[18px] leading-[1.8] whitespace-pre-wrap flex-1 px-1">
            {letterData.body}
          </div>

          {/* Sincerely Closing */}
          <div className="mb-24">
            <p className="text-[20px] font-medium">Sincerely,</p>
          </div>

          {/* Signature Lines - Two Columns - Fixed Visibility */}
          <div className="flex justify-between items-end mb-24 px-4 w-full">
            <div className="w-[300px] text-center border-t-[1.5px] border-gray-900 pt-4">
              <p className="font-bold text-[14px] uppercase leading-tight tracking-tight">Minar Go Expatriate Development Foundation</p>
            </div>
            <div className="w-[300px] text-center border-t-[1.5px] border-gray-900 pt-4">
              <p className="font-bold text-[14px] uppercase leading-tight tracking-tight">{letterData.toCompany}</p>
            </div>
          </div>

          {/* Contact Information - Fixed Visibility */}
          <div className="border-t border-gray-200 pt-8 pb-4 mt-auto">
             <div className="flex items-center justify-center gap-10 text-[16px] text-gray-800 font-bold">
               <div className="flex items-center gap-2">
                 <div className="p-1.5 bg-blue-50 rounded-full"><Phone className="w-4 h-4 text-[#002366]" /></div>
                 <span>{letterData.mobileNumber}</span>
               </div>
               <div className="flex items-center gap-2">
                 <div className="p-1.5 bg-blue-50 rounded-full"><Mail className="w-4 h-4 text-[#002366]" /></div>
                 <span>{letterData.emailAddress}</span>
               </div>
               <div className="flex items-center gap-2">
                 <div className="p-1.5 bg-blue-50 rounded-full"><Globe className="w-4 h-4 text-[#002366]" /></div>
                 <span>{letterData.website}</span>
               </div>
             </div>
          </div>

          {/* Bottom Green Strip */}
          <div className="text-center mt-6">
            <div className="bg-[#E7F3EF] text-[#2D6A4F] py-3.5 px-16 rounded-full inline-block text-[15px] font-extrabold border border-[#CDE5DC] shadow-sm">
              Thank you for your cooperation.
            </div>
            <p className="text-[11px] text-gray-400 mt-5 font-bold tracking-widest uppercase">© Minar Go Expatriate Development Foundation</p>
          </div>
          
          {/* Bottom Border Line */}
          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-[#002366]"></div>
        </div>
      </div>
    </div>
  );
}
