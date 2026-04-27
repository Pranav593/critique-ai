"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAuth } from "../../Context/AuthContext";
import {
  getAssignment,
  getDrafts,
  createDraft,
} from "../../../lib/firebase";
import FeedbackCard from "../../../components/FeedbackCard";

const SCORE_KEYS = ["clarity", "structure", "evidence", "depth"];

function ScoreBar({ label, value }) {
  return (
    <div className="mb-4">
      <div className="flex justify-between mb-1">
        <span className="font-medium text-white capitalize">{label}</span>
        <span className="text-zinc-400">{value}/10</span>
      </div>
      <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-3 bg-blue-600 rounded-full transition-all duration-300"
          style={{ width: `${value * 10}%` }}
        />
      </div>
    </div>
  );
}

export default function AssignmentDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();

  const [assignment, setAssignment] = useState(null);
  const [drafts, setDrafts] = useState([]);
  const [loadingPage, setLoadingPage] = useState(true);
  const [loadingDrafts, setLoadingDrafts] = useState(true);

  // File upload state
  const [draftFile, setDraftFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  // Manual draft state
  const [draftText, setDraftText] = useState("");
  const [scores, setScores] = useState({
    clarity: "",
    structure: "",
    evidence: "",
    depth: "",
  });

  /* ---------------- FETCH ASSIGNMENT ---------------- */
  useEffect(() => {
    if (!user || !id) return;

    getAssignment(user.uid, id)
      .then((data) => setAssignment(data))
      .finally(() => setLoadingPage(false));
  }, [user, id]);

  /* ---------------- FETCH DRAFTS ---------------- */
  const fetchDrafts = () => {
    if (!user || !id) return;

    setLoadingDrafts(true);
    getDrafts(user.uid, id)
      .then((data) => setDrafts(data))
      .finally(() => setLoadingDrafts(false));
  };

  useEffect(() => {
    fetchDrafts();
  }, [user, id]);

  /* ---------------- AI FILE SUBMISSION ---------------- */
  const handleFileSubmit = async () => {
    if (!draftFile) {
      setUploadError("Please select a file first.");
      return;
    }

    try {
      setUploading(true);
      setUploadError("");

      const formData = new FormData();
      formData.append("file", draftFile);

      const extractRes = await fetch("/api/extract", {
        method: "POST",
        body: formData,
      });

      const extractData = await extractRes.json();
      if (!extractRes.ok)
        throw new Error(extractData.error || "Extraction failed");

      const analyzeRes = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: extractData.text,
          context: assignment?.contextText || "",
        }),
      });

      const analyzeData = await analyzeRes.json();
      if (!analyzeRes.ok)
        throw new Error(analyzeData.error || "Analysis failed");

      await createDraft(user.uid, id, {
        draftNumber: drafts.length + 1,
        draftText: extractData.text,
        scores: analyzeData.scores,
        feedback: analyzeData.feedback || [],
      });

      setDraftFile(null);
      fetchDrafts();
    } catch (err) {
      setUploadError(err.message || "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  /* ---------------- MANUAL SUBMISSION ---------------- */
  const handleManualSubmit = async (e) => {
    e.preventDefault();

    if (!draftText.trim()) return;

    await createDraft(user.uid, id, {
      draftNumber: drafts.length + 1,
      draftText,
      scores: {
        clarity: Number(scores.clarity) || 0,
        structure: Number(scores.structure) || 0,
        evidence: Number(scores.evidence) || 0,
        depth: Number(scores.depth) || 0,
      },
    });

    setDraftText("");
    setScores({ clarity: "", structure: "", evidence: "", depth: "" });
    fetchDrafts();
  };

  if (loadingPage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-blue-400">
        Loading assignment...
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-red-400">
        Assignment not found.
      </div>
    );
  }

  const mostRecentDraft = drafts[0];

  return (
    <div className="min-h-screen bg-gradient-to-t from-black via-blue-950 to-blue-900 text-white p-6">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Header */}
        <div>
          <Link href="/dashboard" className="text-blue-400 text-sm">
            ← Back to Dashboard
          </Link>
          <h1 className="text-4xl font-bold mt-2">{assignment.title}</h1>
          <p className="text-zinc-400">{assignment.subject}</p>
        </div>

        {/* Assignment Context */}
        {assignment.contextText && (
          <div className="bg-black/60 p-6 rounded-xl border border-white/10">
            <h2 className="font-bold mb-2">Rubric / Context</h2>
            <p className="text-zinc-400 whitespace-pre-wrap">
              {assignment.contextText}
            </p>
          </div>
        )}

        {/* File Upload Section */}
        <div className="bg-black/60 p-6 rounded-xl border border-white/10 space-y-4">
          <h2 className="font-bold">Submit Draft (AI Analysis)</h2>

          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={(e) => setDraftFile(e.target.files[0])}
            className="text-sm"
          />

          {uploadError && (
            <p className="text-red-400 text-sm">{uploadError}</p>
          )}

          <button
            onClick={handleFileSubmit}
            disabled={uploading}
            className="bg-blue-600 px-4 py-2 rounded-lg"
          >
            {uploading ? "Processing..." : "Submit File"}
          </button>
        </div>

        {/* Manual Entry Section */}
        <div className="bg-black/60 p-6 rounded-xl border border-white/10">
          <h2 className="font-bold mb-4">Submit Manual Draft</h2>

          <form onSubmit={handleManualSubmit} className="space-y-4">
            <textarea
              value={draftText}
              onChange={(e) => setDraftText(e.target.value)}
              rows={6}
              placeholder="Paste draft text..."
              className="w-full p-3 rounded-lg bg-black border border-white/20"
              required
            />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {SCORE_KEYS.map((key) => (
                <input
                  key={key}
                  type="number"
                  min="0"
                  max="10"
                  placeholder={key}
                  value={scores[key]}
                  onChange={(e) =>
                    setScores({ ...scores, [key]: e.target.value })
                  }
                  className="p-2 rounded bg-black border border-white/20"
                />
              ))}
            </div>

            <button className="bg-green-600 px-4 py-2 rounded-lg">
              Submit Manual Draft
            </button>
          </form>
        </div>

        {/* Latest Feedback */}
        <div className="bg-black/60 p-6 rounded-xl border border-white/10">
          <h2 className="font-bold mb-4">Latest Feedback</h2>

          {loadingDrafts ? (
            <p className="text-blue-400">Loading...</p>
          ) : mostRecentDraft ? (
            <FeedbackCard
              scores={mostRecentDraft.scores}
              feedback={mostRecentDraft.feedback || []}
              title={`Draft ${mostRecentDraft.draftNumber}`}
            />
          ) : (
            <p className="text-zinc-500">No drafts yet.</p>
          )}
        </div>

        {/* Score Comparison */}
        {drafts.length > 0 && (
          <div className="bg-black/60 p-6 rounded-xl border border-white/10">
            <h2 className="font-bold mb-6">Score Comparison</h2>

            <div className="grid md:grid-cols-2 gap-6">
              {drafts.map((draft) => (
                <div
                  key={draft.id}
                  className="bg-black/40 p-4 rounded-xl border border-white/10"
                >
                  <h3 className="font-semibold mb-4">
                    Draft {draft.draftNumber}
                  </h3>

                  {SCORE_KEYS.map((key) => (
                    <ScoreBar
                      key={key}
                      label={key}
                      value={draft.scores?.[key] || 0}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}