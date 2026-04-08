"use client"; // Required for Firebase hooks and state

import { auth } from "../../lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/Context/AuthContext";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [confirmPassword, setConfirmPassword] = useState(""); 
  const [error, setError] = useState(""); 
  
  const { user, loading } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    // Only redirect if loading is finished and a user already exists
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);
  //top is auth while bottom is signup
  const handleSignUp = async (e) => {
    e.preventDefault(); // Prevents the page from refreshing
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log("Success! User created:", user.uid);
      // You can add a redirect here, e.g., router.push('/dashboard')
    } catch (error) {
      console.error("Error signing up:", error.message);
      if (error.code === "auth/email-already-in-use") {
        setError("This email is already in use.");
      } else {
        setError("Failed to create account. Please try again.");
      }
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Sign Up</h1>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={handleSignUp}>
        <input 
          type="email" 
          placeholder="Email" 
          onChange={(e) => setEmail(e.target.value)} 
          required 
        />
        <br /><br />
        <input 
          type="password" 
          placeholder="Password" 
          onChange={(e) => setPassword(e.target.value)} 
          required 
        />
        <br /><br />
        <input 
          type="password" 
          placeholder="Confirm Password" 
          onChange={(e) => setConfirmPassword(e.target.value)} 
          required 
        />
        <br /><br />
        <button type="submit">Register</button>
      </form>
    </div>
  );
}