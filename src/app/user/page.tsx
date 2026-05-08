
"use client";

import UserAuthScreen from "@/components/user/UserAuthScreen";
import UserDashboard from "@/components/user/UserDashboard";
import { useUser, useAuth } from "@/firebase";
import { signOut } from "firebase/auth";

export default function UserPage() {
  const { user, loading } = useUser();
  const auth = useAuth();

  const handleLogout = () => {
    if (auth) signOut(auth);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1A1140] flex flex-col items-center justify-center gap-6">
        <div className="relative">
          <div className="w-20 h-20 rounded-full border-4 border-white/5 border-t-[#D4AF37] animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white font-black text-xs">MG</span>
          </div>
        </div>
        <div className="text-center">
          <p className="text-white font-black text-sm uppercase tracking-[0.3em] animate-pulse">Establishing Secure Node</p>
          <p className="text-white/40 text-[9px] font-bold mt-2 uppercase">Please wait while we sync with foundation</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <UserAuthScreen />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <UserDashboard onLogout={handleLogout} />
    </div>
  );
}
