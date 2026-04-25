"use client";
import { auth } from "../../lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../Context/AuthContext";
import Link from "next/link";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      router.push("/dashboard");
    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        setError("This email is already in use.");
      } else {
        setError("Failed to create account. Please try again.");
      }
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
        <h1 className="text-2xl font-bold italic mb-6 text-center">Create Account</h1>

        {error && <p className="text-red-400 text-sm font-bold mb-4 text-center">{error}</p>}

        <form onSubmit={handleSignUp} className="space-y-4">
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
          <input
            type="password"
            placeholder="Confirm Password"
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full p-4 bg-white/5 border border-white/20 rounded-full focus:ring-2 focus:ring-blue-400 outline-none placeholder:text-zinc-500 text-white"
          />
          <button
            type="submit"
            className="w-full bg-blue-700 hover:bg-blue-600 py-4 rounded-full font-bold text-white shadow-lg transition-transform active:scale-95 italic text-lg"
          >
            Register
          </button>
        </form>

        <p className="text-center text-zinc-500 text-sm mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-400 hover:text-white transition-colors font-bold">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}