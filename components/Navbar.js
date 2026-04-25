"use client";
import { useAuth } from "@/app/Context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  return (
    <nav className="flex justify-between items-center px-6 py-4 mb-4" style={{ fontFamily: "'Times New Roman', Times, serif" }}>
      <h1 className="text-2xl font-black italic tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-white drop-shadow-[0_2px_4px_rgba(0,0,128,0.9)]">
        CritiqueAI
      </h1>
      <div className="flex items-center gap-4">
        {user && <span className="text-sm text-white">{user.email}</span>}
        <button
          onClick={logout}
          className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-full text-sm font-bold transition"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}