"use client"; // Required for Firebase hooks and state

import { useAuth } from "../Context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { auth } from "../../lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";


export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");

  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Only redirect if we are DONE loading and a user exists
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);
  //top is auth while bottom is login
  const handleLogin = async (e) => {
    e.preventDefault(); 
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log("Success! User Login:", user.uid);
      // You can add a redirect here, e.g., router.push('/dashboard')
    } catch (error) {
      console.error("Error signing up:", error.message);
      setError("Invalid email or password.");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Login</h1>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={handleLogin}>
        <input 
          type="email" 
          placeholder="Email" 
          onChange={(e) => setEmail(e.target.value)} 
          required 
        />
        <input 
          type="password" 
          placeholder="Password" 
          onChange={(e) => setPassword(e.target.value)} 
          required 
        />
        <button type="submit">Login</button>
      </form>
    </div>
  );
}