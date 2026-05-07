
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const { toast } = useToast();
  const auth = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;
    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, formData.email, formData.password);
        toast({ title: "স্বাগতম!", description: "লগইন সফল হয়েছে।" });
      } else {
        await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        toast({ title: "সফল হয়েছে!", description: "আপনার একাউন্ট তৈরি হয়েছে। স্বাগতম মিনার গো ফাউন্ডেশনে।" });
      }
    } catch (error: any) {
      let message = "Authentication failed.";
      
      // Better error messages for the user
      if (error.code === 'auth/invalid-credential') {
        message = "ইমেইল বা পাসওয়ার্ড ভুল অথবা আপনার একাউন্ট নেই। নতুন হলে নিচে থেকে 'Sign Up' করুন।";
      } else if (error.code === 'auth/email-already-in-use') {
        message = "এই ইমেইলটি দিয়ে অলরেডি একাউন্ট খোলা আছে। লগইন করার চেষ্টা করুন।";
      } else if (error.code === 'auth/weak-password') {
        message = "পাসওয়ার্ডটি অন্তত ৬ অক্ষরের হতে হবে।";
      } else if (error.code === 'auth/invalid-email') {
        message = "দয়া করে একটি সঠিক ইমেইল এড্রেস দিন।";
      }

      toast({ 
        variant: "destructive", 
        title: "দুঃখিত, সমস্যা হয়েছে", 
        description: message 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#F0F2F5]">
      <Card className="w-full max-w-md shadow-xl border-none">
        <CardHeader className="text-center space-y-1">
          <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4 border-4 border-accent">
            <span className="text-white text-2xl font-bold">MG</span>
          </div>
          <CardTitle className="text-2xl font-extrabold text-primary">MINAR GO EXPATRIATE</CardTitle>
          <CardDescription className="text-muted-foreground font-medium">Development Foundation</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email (ইমেইল)</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="example@email.com" 
                required 
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="h-12 border-gray-200 focus:border-primary"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password (পাসওয়ার্ড)</Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="৬ অক্ষরের পাসওয়ার্ড"
                required 
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="h-12 border-gray-200 focus:border-primary"
              />
            </div>
            <Button className="w-full bg-primary hover:bg-primary/90 text-white h-12 text-lg font-bold transition-transform active:scale-95" disabled={loading}>
              {loading ? "লোডিং হচ্ছে..." : isLogin ? "লগইন করুন" : "একাউন্ট তৈরি করুন"}
            </Button>
            <div className="text-center mt-4">
              <button 
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm text-primary font-bold hover:underline"
              >
                {isLogin ? "নতুন একাউন্ট খুলতে চান? Sign Up করুন" : "একাউন্ট আছে? লগইন করুন"}
              </button>
            </div>
          </form>
          {isLogin && (
            <div className="mt-6 p-3 bg-blue-50 border border-blue-100 rounded-md text-xs text-blue-800">
              <strong>টিপস:</strong> যদি আপনার পুরাতন একাউন্টে লগইন না হয়, তবে দয়া করে উপরে <strong>'Sign Up'</strong> অপশন থেকে একবার একাউন্ট তৈরি করে নিন।
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
