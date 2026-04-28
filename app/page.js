"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/Context/AuthContext";

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [redirected, setRedirected] = useState(false);

  useEffect(() => {
    if (!loading && !redirected) {
      setRedirected(true);
      if (user) {
        router.push("/dashboard");
      } else {
        router.push("/login");
      }
    }
  }, [user, loading, router, redirected]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-100">
      <div className="text-zinc-500">Loading...</div>
    </div>
  );
}
