"use client";

import { useEffect, useState } from "react";
import AuthScreen from "@/components/auth/AuthScreen";
import Header from "@/components/dashboard/Header";
import DashboardContent from "@/components/dashboard/DashboardContent";
import { useUser, useAuth } from "@/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const AUTHORIZED_ADMIN_NAMES = ["dulal", "omar faruk", "shahid", "mr shahid"];

export default function AdminPage() {
  const { user, loading } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    if (!loading) {
      if (user) {
        const name = user.displayName?.toLowerCase().trim() || "";
        const authorized = AUTHORIZED_ADMIN_NAMES.some(admin => name.includes(admin));
        setIsAdmin(authorized);
        if (!authorized) router.push("/");
      } else {
        setIsAdmin(false);
      }
    }
  }, [user, loading, router]);

  const handleLogout = () => { if (auth) signOut(auth); };

  if (loading || isAdmin === null) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin w-10 h-10 text-primary" /></div>;

  if (!user || !isAdmin) return <AuthScreen />;

  return (
    <div className="min-h-screen flex flex-col bg-[#F0F2F5]">
      <Header onLogout={handleLogout} />
      <main className="flex-1">
        <DashboardContent />
      </main>
    </div>
  );
}
