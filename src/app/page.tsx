
"use client";

import { useState, useEffect } from "react";
import AuthScreen from "@/components/auth/AuthScreen";
import Header from "@/components/dashboard/Header";
import DashboardContent from "@/components/dashboard/DashboardContent";

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = sessionStorage.getItem("mg_user");
    if (savedUser) setUser(JSON.parse(savedUser));
    setLoading(false);
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("mg_user");
    setUser(null);
  };

  if (loading) return null;

  if (!user) {
    return <AuthScreen onLogin={setUser} />;
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
