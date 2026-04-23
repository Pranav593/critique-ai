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
        if (!unsubscribed) {
          setAssignments(data);
        }
      } catch (error) {
        console.error("Error loading assignments:", error);
      } finally {
        if (!unsubscribed) {
          setLoading(false);
        }
      }
    }

    loadAssignments();

    return () => {
      unsubscribed = true;
    };
  }, [user]);

  if (authLoading || (loading && user)) {
    return (
      <main className="min-h-screen bg-gray-50 px-6 py-8">
        <Navbar />
        <div className="max-w-6xl mx-auto flex items-center justify-center p-8">
          <div className="text-xl text-gray-500">Loading assignments...</div>
        </div>
      </main>
    );
  }

  if (!user) return null;

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-8">
      <Navbar />

      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8 mt-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Your Assignments</h1>
            <p className="text-sm text-gray-500 mt-1">Logged in as {user.email}</p>
          </div>

          <button
            onClick={() => router.push("/assignments/new")}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            New Assignment
          </button>
        </div>

        {assignments.length === 0 ? (
          <div className="bg-white border rounded-xl p-8 text-center shadow-sm">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              No assignments yet
            </h2>
            <p className="text-gray-500 mb-4">
              Create your first assignment to get started.
            </p>
            <button
              onClick={() => router.push("/assignments/new")}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
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
