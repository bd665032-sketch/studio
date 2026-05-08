
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
      <div className="min-h-screen flex items-center justify-center bg-[#1A1140]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
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
