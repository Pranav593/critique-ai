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
    <div className="min-h-screen bg-[#F4F4F4] text-[#1A1A1A] flex flex-col items-center justify-center p-6">
      <div className="mb-12 text-center">
        <h2 className="text-4xl font-light tracking-[0.2em] uppercase text-[#1A1A1A]">
          Critique.AI
        </h2>
      </div>

      <div className="w-full max-w-md bg-white p-10 border border-[#1A1A1A] shadow-none">
        <h1 className="text-xl font-medium mb-8 text-center uppercase tracking-wide">Welcome / Login</h1>

        {error && <p className="text-red-600 text-sm font-medium mb-6 text-center border border-red-600 p-2">{error}</p>}

        <form onSubmit={handleLogin} className="space-y-6">
          <input
            type="email"
            placeholder="EMAIL ADDRESS"
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full p-4 bg-transparent border border-[#1A1A1A] focus:outline-none focus:ring-1 focus:ring-[#1A1A1A] placeholder:text-gray-400 text-[#1A1A1A] text-sm tracking-wide rounded-none"
          />
          <input
            type="password"
            placeholder="PASSWORD"
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full p-4 bg-transparent border border-[#1A1A1A] focus:outline-none focus:ring-1 focus:ring-[#1A1A1A] placeholder:text-gray-400 text-[#1A1A1A] text-sm tracking-wide rounded-none"
          />
          <button
            type="submit"
            className="w-full bg-[#1A1A1A] hover:bg-black py-4 text-white uppercase tracking-widest text-sm font-medium transition-colors border border-[#1A1A1A] rounded-none"
          >
            Login
          </button>
        </form>

        <p className="text-center text-gray-500 text-xs mt-8 tracking-wide uppercase">
          Don't have an account?{" "}
          <Link href="/signup" className="text-[#1A1A1A] hover:underline font-medium ml-1">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}