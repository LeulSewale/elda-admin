"use client";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export function LogoutSpinnerOverlay() {
  const { isLoggingOut } = useAuth();
  if (!isLoggingOut) return null;
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-40">
      <Loader2 className="w-16 h-16 text-green-500 animate-spin" />
    </div>
  );
} 