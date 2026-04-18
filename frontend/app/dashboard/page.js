"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";

import Navbar from "../../components/Navbar";
import AssignmentCard from "../../components/AssignmentCard";
import { useAuth } from "../../context/AuthContext";
import { auth, getAssignments, ensureAnonymousUser } from "../../lib/firebase";

export default function DashboardPage() {
  const router = useRouter();
  const { user: contextUser } = useAuth();

  const [user, setUser] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribed = false;

    async function setupUserAndAssignments() {
      try {
        let currentUser = contextUser || auth.currentUser;

        // If no signed-in user, ensure anonymous session
        if (!currentUser) {
          currentUser = await ensureAnonymousUser();
        }

        if (unsubscribed || !currentUser) return;

        setUser(currentUser);

        const data = await getAssignments(currentUser.uid);

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

    setupUserAndAssignments();

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
      }
    });

    return () => {
      unsubscribed = true;
      unsubscribe();
    };
  }, [contextUser]);

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-8">
      <Navbar />

      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Your Assignments
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {user?.isAnonymous
                ? "Guest session"
                : user?.email || "User session"}
            </p>
          </div>

          <button
            onClick={() => router.push("/assignments/new")}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            New Assignment
          </button>
        </div>

        {loading ? (
          <div className="bg-white border rounded-xl p-8 text-center text-gray-500">
            Loading assignments...
          </div>
        ) : assignments.length === 0 ? (
          <div className="bg-white border rounded-xl p-8 text-center">
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
              <AssignmentCard
                key={assignment.id}
                assignment={assignment}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}