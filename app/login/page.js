"use client";
import { useAuth } from "../Context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { auth } from "../../lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      setError("Invalid email or password.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-t from-black via-blue-950 to-blue-900 text-white flex flex-col items-center justify-center p-6" style={{ fontFamily: "'Times New Roman', Times, serif" }}>

      <div className="mb-10 text-center">
        <h2 className="text-7xl font-black italic tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-white drop-shadow-[0_6px_6px_rgba(0,0,128,0.9)]">
          CritiqueAI
        </h2>
      </div>

      <div className="w-full max-w-md bg-black/80 backdrop-blur-xl p-10 rounded-[40px] border-2 border-blue-400/50 shadow-[0_0_25px_rgba(96,165,250,0.2)]">
        <h1 className="text-2xl font-bold italic mb-6 text-center">Welcome Back</h1>

        {error && <p className="text-red-400 text-sm font-bold mb-4 text-center">{error}</p>}

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full p-4 bg-white/5 border border-white/20 rounded-full focus:ring-2 focus:ring-blue-400 outline-none placeholder:text-zinc-500 text-white"
          />
          <input
            type="password"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full p-4 bg-white/5 border border-white/20 rounded-full focus:ring-2 focus:ring-blue-400 outline-none placeholder:text-zinc-500 text-white"
          />
          <button
            type="submit"
            className="w-full bg-blue-700 hover:bg-blue-600 py-4 rounded-full font-bold text-white shadow-lg transition-transform active:scale-95 italic text-lg"
          >
            Login
          </button>
        </form>

        <p className="text-center text-zinc-500 text-sm mt-6">
          Don't have an account?{" "}
          <Link href="/signup" className="text-blue-400 hover:text-white transition-colors font-bold">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}