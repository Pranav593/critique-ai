"use client";
import { useAuth } from "@/app/Context/AuthContext";
import Link from "next/link";

export default function Navbar() {
  const { user, logout } = useAuth();
  return (
    <nav className="flex justify-between items-center px-8 py-6 mb-8 border-b border-[#1A1A1A] bg-white">
      <Link href="/dashboard" className="text-2xl font-light tracking-[0.2em] uppercase text-[#1A1A1A]">
        Critique.AI
      </Link>
      <div className="flex items-center gap-6">
        {user && <span className="text-xs uppercase tracking-widest text-[#1A1A1A]">{user.email}</span>}
        <button
          onClick={logout}
          className="border border-[#1A1A1A] hover:border-red-600 hover:bg-red-600 hover:text-white text-[#1A1A1A] px-6 py-2 text-xs uppercase tracking-widest font-medium transition-colors rounded-none"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}