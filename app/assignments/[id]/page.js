"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth, subscribeToDrafts, createDraft } from "../../../lib/firebase";

export default function AssignmentDetailPage() {
  const params = useParams();
  const assignmentId = params.id;

  const [userId, setUserId] = useState(null);
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [draftText, setDraftText] = useState("");
  const [clarity, setClarity] = useState("");
  const [structure, setStructure] = useState("");
  const [evidence, setEvidence] = useState("");
  const [depth, setDepth] = useState("");

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        setUserId(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!userId || !assignmentId) return;

    setLoading(true);

    const unsubscribeDrafts = subscribeToDrafts(
      userId,
      assignmentId,
      (draftsData) => {
        setDrafts(draftsData);
        setLoading(false);
      }
    );

    return () => unsubscribeDrafts();
  }, [userId, assignmentId]);

  async function handleSubmitDraft(e) {
    e.preventDefault();

    if (!userId || !assignmentId) {
      alert("User or assignment is missing.");
      return;
    }

    if (!draftText.trim()) {
      alert("Please enter your draft text.");
      return;
    }

    try {
      setSubmitting(true);

      await createDraft(userId, assignmentId, {
        draftText,
        scores: {
          clarity: Number(clarity) || 0,
          structure: Number(structure) || 0,
          evidence: Number(evidence) || 0,
          depth: Number(depth) || 0,
        },
      });

      setDraftText("");
      setClarity("");
      setStructure("");
      setEvidence("");
      setDepth("");
    } catch (error) {
      console.error("Error creating draft:", error);
      alert("Failed to submit draft.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <p className="p-6">Loading drafts...</p>;
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="bg-white border rounded-xl p-8 shadow-sm">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Score Comparison
          </h1>
          <p className="text-gray-500 mb-6">
            Compare how your writing improves across drafts.
          </p>

          <form onSubmit={handleSubmitDraft} className="space-y-5 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Draft Text
              </label>
              <textarea
                value={draftText}
                onChange={(e) => setDraftText(e.target.value)}
                placeholder="Paste your new draft here..."
                rows={8}
                className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Clarity
                </label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={clarity}
                  onChange={(e) => setClarity(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0-10"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Structure
                </label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={structure}
                  onChange={(e) => setStructure(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0-10"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Evidence
                </label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={evidence}
                  onChange={(e) => setEvidence(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0-10"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Depth
                </label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={depth}
                  onChange={(e) => setDepth(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0-10"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {submitting ? "Submitting..." : "Submit New Draft"}
            </button>
          </form>

          {drafts.length === 0 ? (
            <p className="text-gray-500">No drafts yet.</p>
          ) : (
            <>
              {drafts.length === 1 && (
                <p className="text-sm text-gray-500 mb-4">
                  You only have one draft so far. Add more drafts to compare progress over time.
                </p>
              )}

              <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2">
                {drafts.map((draft, index) => (
                  <div
                    key={draft.id}
                    className="border rounded-xl p-5 bg-gray-50"
                  >
                    <h2 className="text-xl font-semibold mb-4">
                      Draft {drafts.length - index}
                    </h2>

                    <ScoreBar label="Clarity" value={draft.scores?.clarity || 0} />
                    <ScoreBar label="Structure" value={draft.scores?.structure || 0} />
                    <ScoreBar label="Evidence" value={draft.scores?.evidence || 0} />
                    <ScoreBar label="Depth" value={draft.scores?.depth || 0} />

                    {draft.draftText && (
                      <div className="mt-4">
                        <p className="text-sm font-medium text-gray-700 mb-1">
                          Draft Text
                        </p>
                        <p className="text-sm text-gray-600 whitespace-pre-wrap">
                          {draft.draftText}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}

function ScoreBar({ label, value }) {
  return (
    <div className="mb-4">
      <div className="flex justify-between mb-1">
        <span className="font-medium text-gray-700">{label}</span>
        <span className="text-gray-600">{value}/10</span>
      </div>

      <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-3 bg-blue-600 rounded-full transition-all duration-300"
          style={{ width: `${value * 10}%` }}
        />
      </div>
    </div>
  );
}