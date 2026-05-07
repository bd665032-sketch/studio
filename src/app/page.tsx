
"use client";

import AuthScreen from "@/components/auth/AuthScreen";
import Header from "@/components/dashboard/Header";
import DashboardContent from "@/components/dashboard/DashboardContent";
import { useUser, useAuth } from "@/firebase";
import { signOut } from "firebase/auth";

export default function Home() {
  const { user, loading } = useUser();
  const auth = useAuth();

  const handleLogout = () => {
    if (auth) signOut(auth);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F0F2F5]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header onLogout={handleLogout} />
      <main className="flex-1">
        <DashboardContent />
      </main>
    </div>
  );
}
