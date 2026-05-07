
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Wand2, Download } from "lucide-react";
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
    language: "en" as "en" | "bn",
  });
  const [result, setResult] = useState("");
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!letterData.toCompany || !letterData.subject || !letterData.body) {
      return toast({ variant: "destructive", title: "Missing Info", description: "Fill all mandatory fields." });
    }
    setLoading(true);
    try {
      const { letterContent } = await generateDemandLetterDraft(letterData);
      setResult(letterContent);
      toast({ title: "AI Generated", description: "Your letter draft is ready." });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "AI generation failed." });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!result) return;
    exportDemandLetterPDF(result, letterData.letterDate);
  };

  return (
    <Card className="bg-white border-none shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg text-primary flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Demand Letter AI
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label>Letter Date</Label>
            <Input type="date" value={letterData.letterDate} onChange={(e) => setLetterData({...letterData, letterDate: e.target.value})} />
          </div>
          <div className="space-y-1">
            <Label>Language</Label>
            <Select value={letterData.language} onValueChange={(v: any) => setLetterData({...letterData, language: v})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="bn">Bengali</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-1">
          <Label>To (Company Name)</Label>
          <Input placeholder="Recipient Company" value={letterData.toCompany} onChange={(e) => setLetterData({...letterData, toCompany: e.target.value})} />
        </div>

        <div className="space-y-1">
          <Label>Subject</Label>
          <Input placeholder="Letter Subject" value={letterData.subject} onChange={(e) => setLetterData({...letterData, subject: e.target.value})} />
        </div>

        <div className="space-y-1">
          <Label>Main Purpose / Context</Label>
          <Textarea 
            placeholder="Describe the demand or issue..." 
            className="min-h-[100px]"
            value={letterData.body}
            onChange={(e) => setLetterData({...letterData, body: e.target.value})}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label>Mobile</Label>
            <Input value={letterData.mobileNumber} onChange={(e) => setLetterData({...letterData, mobileNumber: e.target.value})} />
          </div>
          <div className="space-y-1">
            <Label>Email</Label>
            <Input value={letterData.emailAddress} onChange={(e) => setLetterData({...letterData, emailAddress: e.target.value})} />
          </div>
        </div>

        <Button 
          className="w-full bg-accent hover:bg-gold-dark text-white active:scale-95 transition-transform flex items-center gap-2"
          onClick={handleGenerate}
          disabled={loading}
        >
          <Wand2 className="w-4 h-4" />
          {loading ? "AI Drafting..." : "Generate AI Draft"}
        </Button>

        {result && (
          <div className="mt-4 p-3 bg-secondary rounded-lg space-y-3">
            <h4 className="text-xs font-bold text-primary uppercase">Draft Preview:</h4>
            <div className={`text-sm whitespace-pre-wrap ${letterData.language === 'bn' ? 'font-bengali' : 'font-body'}`}>
              {result}
            </div>
            <Button 
              className="w-full bg-primary hover:bg-primary/90 text-white flex items-center gap-2"
              onClick={handleDownload}
            >
              <Download className="w-4 h-4" />
              Download Professional PDF
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
