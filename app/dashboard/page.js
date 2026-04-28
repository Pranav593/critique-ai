"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import AssignmentCard from "@/components/AssignmentCard";
import { useAuth } from "@/app/Context/AuthContext";
import { getAssignments } from "@/lib/firebase";

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    let unsubscribed = false;
    async function loadAssignments() {
      try {
        const data = await getAssignments(user.uid);
        if (!unsubscribed) setAssignments(data);
      } catch (error) {
        console.error("Error loading assignments:", error);
      } finally {
        if (!unsubscribed) setLoading(false);
      }
    }
    loadAssignments();
    return () => { unsubscribed = true; };
  }, [user]);

  const handleUpdate = () => {
    if (!user) return;
    async function reloadAssignments() {
      try {
        const data = await getAssignments(user.uid);
        setAssignments(data);
      } catch (error) {
        console.error("Error reloading assignments:", error);
      }
    }
    reloadAssignments();
  };

  if (authLoading || (loading && user)) {
    return (
      <main className="min-h-screen bg-[#F4F4F4]">
        <Navbar />
        <div className="max-w-6xl mx-auto flex items-center justify-center p-8">
          <div className="text-xs tracking-widest uppercase text-[#1A1A1A] animate-pulse">Loading assignments...</div>
        </div>
      </main>
    );
  }

  if (!user) return null;

  return (
    <main className="min-h-screen bg-[#F4F4F4] text-[#1A1A1A]">
      <Navbar />
      <div className="max-w-6xl mx-auto px-8 pb-12">
        <div className="flex items-end justify-between mb-12">
          <div>
            <h1 className="text-4xl font-light tracking-wide uppercase text-[#1A1A1A]">Your Assignments</h1>
          </div>
          <button
            onClick={() => router.push("/assignments/new")}
            className="bg-[#1A1A1A] text-white px-8 py-3 text-xs tracking-widest uppercase font-medium hover:bg-black transition-colors rounded-none border border-[#1A1A1A]"
          >
            New Assignment
          </button>
        </div>

        {assignments.length === 0 ? (
          <div className="bg-white border border-[#1A1A1A] p-12 text-center shadow-none">
            <h2 className="text-xl font-medium uppercase tracking-wide text-[#1A1A1A] mb-4">No assignments yet</h2>
            <p className="text-gray-500 mb-8 tracking-wide text-sm">Create a new assignment to begin the critique process.</p>
            <button
              onClick={() => router.push("/assignments/new")}
              className="bg-transparent text-[#1A1A1A] px-8 py-3 text-xs tracking-widest uppercase font-medium hover:bg-gray-50 transition-colors border border-[#1A1A1A] rounded-none"
            >
              Create Assignment
            </button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {assignments.map((assignment) => (
              <AssignmentCard key={assignment.id} assignment={assignment} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}