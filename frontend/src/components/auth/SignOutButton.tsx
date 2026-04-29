"use client";

import { logout } from "@/lib/auth";
import { LogOut } from "lucide-react";

export function SignOutButton() {
  return (
    <button
      onClick={() => logout()}
      className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/40 hover:text-booked transition-all w-full"
    >
      <LogOut className="w-5 h-5" />
      <span className="font-medium">Sign Out</span>
    </button>
  );
}
