
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/firebase";
import { ref, push, set, get, query, orderByChild, equalTo } from "firebase/database";

export default function AuthScreen({ onLogin }: { onLogin: (user: any) => void }) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        // Login Logic
        const usersRef = ref(db, "admin_users");
        const userQuery = query(usersRef, orderByChild("email"), equalTo(formData.email));
        const snapshot = await get(userQuery);
        
        if (snapshot.exists()) {
          const userData = Object.values(snapshot.val())[0] as any;
          if (userData.password === formData.password) {
            sessionStorage.setItem("mg_user", JSON.stringify(userData));
            onLogin(userData);
            toast({ title: "Welcome back!", description: "Login successful." });
          } else {
            toast({ variant: "destructive", title: "Error", description: "Invalid password." });
          }
        } else {
          toast({ variant: "destructive", title: "Error", description: "User not found." });
        }
      } else {
        // Signup Logic
        const usersRef = ref(db, "admin_users");
        const newUserRef = push(usersRef);
        await set(newUserRef, { ...formData });
        sessionStorage.setItem("mg_user", JSON.stringify(formData));
        onLogin(formData);
        toast({ title: "Account created!", description: "Welcome to Minar Go Foundation." });
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Operation failed." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#F0F2F5]">
      <Card className="w-full max-w-md shadow-xl border-none">
        <CardHeader className="text-center space-y-1">
          <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4">
            <span className="text-accent text-2xl font-bold">MG</span>
          </div>
          <CardTitle className="text-2xl font-extrabold text-primary">MINAR GO EXPATRIATE</CardTitle>
          <CardDescription className="text-muted-foreground font-medium">Development Foundation</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input 
                  id="name" 
                  placeholder="John Doe" 
                  required 
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="email@example.com" 
                required 
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                required 
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
            <Button className="w-full bg-primary hover:bg-primary/90 text-white transition-transform active:scale-95" disabled={loading}>
              {loading ? "Processing..." : isLogin ? "Login" : "Sign Up"}
            </Button>
            <div className="text-center mt-4">
              <button 
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm text-primary hover:underline"
              >
                {isLogin ? "Need an account? Sign up" : "Already have an account? Login"}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
