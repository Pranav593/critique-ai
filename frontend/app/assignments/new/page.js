"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  auth,
  createAssignment,
  ensureAnonymousUser,
} from "../../../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

export default function NewAssignmentPage() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let unsubscribed = false;

    async function setupUser() {
      try {
        const currentUser = auth.currentUser || (await ensureAnonymousUser());
        if (!unsubscribed) {
          setUser(currentUser);
        }
      } catch (error) {
        console.error("Error creating anonymous session:", error);
      } finally {
        if (!unsubscribed) {
          setAuthLoading(false);
        }
      }
    }

    setupUser();

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!unsubscribed && currentUser) {
        setUser(currentUser);
      }
    });

    return () => {
      unsubscribed = true;
      unsubscribe();
    };
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();

    if (!user) {
      alert("User session is not ready yet.");
      return;
    }

    setSubmitting(true);

    try {
      await createAssignment(user.uid, {
        title,
        subject,
        draftCount: 0,
      });

      router.push("/dashboard");
    } catch (error) {
      console.error("Error creating assignment:", error);
      alert("Failed to create assignment.");
    } finally {
      setSubmitting(false);
    }
  }

  if (authLoading) {
    return (
      <main className="min-h-screen bg-gray-50 px-6 py-8">
        <div className="max-w-2xl mx-auto bg-white border rounded-xl p-8 text-center text-gray-500">
          Starting user session...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-8">
      <div className="max-w-2xl mx-auto bg-white border rounded-xl p-8 shadow-sm">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          New Assignment
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assignment Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter assignment title"
              className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subject
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter subject"
              className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {submitting ? "Creating..." : "Create Assignment"}
          </button>
        </form>
      </div>
    </main>
  );
}