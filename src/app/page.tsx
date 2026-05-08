"use client";

import { useEffect, useState } from "react";
import AuthScreen from "@/components/auth/AuthScreen";
import Header from "@/components/dashboard/Header";
import DashboardContent from "@/components/dashboard/DashboardContent";
import { useUser, useAuth } from "@/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";

// Authorized Admin Names
const AUTHORIZED_ADMIN_NAMES = ["dulal", "omar faruk", "shahid", "mr shahid"];

export default function Home() {
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
        
        // If not an admin, redirect them to the User App
        if (!authorized) {
          router.push("/user");
        }
      } else {
        setIsAdmin(false);
      }
    }
  }, [user, loading, router]);

  const handleLogout = () => {
    if (auth) signOut(auth);
  };

  if (loading || isAdmin === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F0F2F5]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-primary"></div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <AuthScreen />;
  }

  return (
    <>
      <title>Minar Go Admin</title>
      <meta name="apple-mobile-web-app-title" content="MG Admin" />
      <div className="min-h-screen flex flex-col">
        <Header onLogout={handleLogout} />
        <main className="flex-1">
          <DashboardContent />
        </main>
      </div>
    </>
  );
}
