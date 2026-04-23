"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../Context/AuthContext";
import { getAssignment, getDrafts, createDraft } from "../../../lib/firebase";
import FeedbackCard from "../../../components/FeedbackCard";
import Link from "next/link";
import React from "react";

const SCORE_KEYS = ["clarity", "structure", "evidence", "depth"];

function ScoreBar({ label, value }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium text-zinc-300 capitalize">{label}</span>
        <span className="text-sm text-zinc-400">{value}/10</span>
      </div>
      <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-500 rounded-full transition-all duration-300"
          style={{ width: `${value * 10}%` }}
        />
      </div>
    </div>
  );
}

export default function AssignmentDetailPage({ params }) {
  const { id } = React.use(params);
  const { user } = useAuth();

  const [assignment, setAssignment] = useState(null);
  const [drafts, setDrafts] = useState([]);
  const [loadingPage, setLoadingPage] = useState(true);
  const [loadingDrafts, setLoadingDrafts] = useState(true);

  const [draftFile, setDraftFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  // Fetch assignment
  useEffect(() => {
    if (!user) return;
    getAssignment(user.uid, id)
      .then((data) => setAssignment(data))
      .finally(() => setLoadingPage(false));
  }, [user, id]);

  // Fetch drafts
  const fetchDrafts = () => {
    if (!user) return;
    setLoadingDrafts(true);
    getDrafts(user.uid, id)
      .then((data) => setDrafts(data))
      .finally(() => setLoadingDrafts(false));
  };

  useEffect(() => {
    fetchDrafts();
  }, [user, id]);

  const handleSubmitDraft = async () => {
    if (!draftFile) {
      setUploadError("Please select a file first!");
      return;
    }
    setUploadError("");
    setUploading(true);

    try {
      // Step 1: Extract text
      const formData = new FormData();
      formData.append("file", draftFile);
      const extractRes = await fetch("/api/extract", { method: "POST", body: formData });
      const extractData = await extractRes.json();
      if (!extractRes.ok) throw new Error(extractData.error || "Extraction failed");

      // Step 2: Analyze with AI
      const analyzeRes = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: extractData.text,
          context: assignment?.contextText || "",
        }),
      });
      const analyzeData = await analyzeRes.json();
      if (!analyzeRes.ok) throw new Error(analyzeData.error || "Analysis failed");

      // Step 3: Save to Firestore
      await createDraft(user.uid, id, {
        draftNumber: drafts.length + 1,
        scores: analyzeData.scores,
        feedback: analyzeData.feedback,
      });

      setDraftFile(null);
      fetchDrafts();
    } catch (err) {
      setUploadError(err.message || "Something went wrong.");
    } finally {
      setUploading(false);
    }
  };

  if (loadingPage) {
    return (
      <div className="min-h-screen bg-gradient-to-t from-black via-blue-950 to-blue-900 flex items-center justify-center">
        <p className="text-blue-400 animate-pulse text-xl font-bold italic">Loading assignment...</p>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="min-h-screen bg-gradient-to-t from-black via-blue-950 to-blue-900 flex items-center justify-center">
        <p className="text-red-400 text-xl font-bold">Assignment not found.</p>
      </div>
    );
  }

  const mostRecentDraft = drafts[0];
  const previousDraft = drafts[1];

  return (
    <div className="min-h-screen bg-gradient-to-t from-black via-blue-950 to-blue-900 text-white flex flex-col items-center p-6" style={{ fontFamily: "'Times New Roman', Times, serif" }}>

      {/* Header */}
      <div className="mb-10 text-center mt-10">
        <h2 className="text-7xl font-black italic tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-white drop-shadow-[0_6px_6px_rgba(0,0,128,0.9)]">
          CritiqueAI
        </h2>
      </div>

      <div className="w-full max-w-2xl space-y-6">

        {/* Assignment Info */}
        <div className="bg-black/80 backdrop-blur-xl p-10 rounded-[40px] border-2 border-blue-400/50 shadow-[0_0_25px_rgba(96,165,250,0.2)]">
          <div className="flex justify-between items-center mb-6">
            <p className="text-xs uppercase tracking-widest text-zinc-500">
              Assignment · ID: <span className="text-zinc-300">{id}</span>
            </p>
            <Link href="/dashboard" className="text-blue-400 hover:text-white transition-colors text-sm font-bold">
              ← Dashboard
            </Link>
          </div>

          <h1 className="text-3xl font-bold italic tracking-tight mb-4">{assignment.title}</h1>

          <div className="flex flex-wrap gap-3 mb-6 text-sm">
            <span className="px-4 py-1 rounded-full bg-white/5 border border-white/10 text-white/90">{assignment.subject}</span>
            <span className="px-4 py-1 rounded-full bg-blue-700/30 border border-blue-400/30 text-blue-300">
              {assignment.contextType === "rubric" ? "Rubric-based" : "Statement"}
            </span>
          </div>

          {assignment.contextText && (
            <div className="bg-white/5 border border-white/10 rounded-[24px] p-6">
              <h2 className="text-lg font-bold italic mb-3">Rubric / Context</h2>
              <p className="text-zinc-400 leading-relaxed">{assignment.contextText}</p>
            </div>
          )}
        </div>

        {/* Submit Draft */}
        <div className="bg-black/80 backdrop-blur-xl p-8 rounded-[40px] border-2 border-blue-400/50 shadow-[0_0_25px_rgba(96,165,250,0.2)]">
          <h2 className="text-xl font-bold italic mb-4">Submit a New Draft</h2>
          <div className="bg-black/30 border border-dashed border-white/20 p-6 rounded-2xl flex flex-col items-center gap-4">
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => { setDraftFile(e.target.files[0]); setUploadError(""); }}
              className="text-sm text-zinc-400 file:mr-4 file:py-2 file:px-6 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-700 file:text-white hover:file:bg-blue-600 cursor-pointer"
            />
            {draftFile && <p className="text-xs text-zinc-500">Selected: {draftFile.name}</p>}
            {uploadError && <p className="text-red-400 text-sm font-bold">{uploadError}</p>}
            <button
              onClick={handleSubmitDraft}
              disabled={uploading}
              className="w-full bg-blue-700 hover:bg-blue-600 py-3 rounded-full font-bold text-white transition-transform active:scale-95 italic disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? "Processing... this may take a moment" : "Submit Draft"}
            </button>
          </div>
        </div>

        {/* Most Recent Feedback */}
        <div className="bg-black/80 backdrop-blur-xl p-8 rounded-[40px] border-2 border-blue-400/50 shadow-[0_0_25px_rgba(96,165,250,0.2)]">
          <h2 className="text-xl font-bold italic mb-4">Latest Feedback</h2>
          {loadingDrafts ? (
            <p className="text-blue-400 animate-pulse italic">Loading feedback...</p>
          ) : mostRecentDraft ? (
            <FeedbackCard
              scores={mostRecentDraft.scores}
              feedback={mostRecentDraft.feedback || []}
              title={`Draft ${mostRecentDraft.draftNumber} Feedback`}
            />
          ) : (
            <p className="text-zinc-500 italic">No drafts submitted yet. Upload your first draft above!</p>
          )}
        </div>

        {/* Score Comparison */}
        {drafts.length > 0 && (
          <div className="bg-black/80 backdrop-blur-xl p-8 rounded-[40px] border-2 border-blue-400/50 shadow-[0_0_25px_rgba(96,165,250,0.2)]">
            <h2 className="text-xl font-bold italic mb-6">Score Comparison</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {drafts.slice(0, 2).map((draft) => (
                <div key={draft.id} className="bg-white/5 border border-white/10 rounded-[24px] p-5 space-y-3">
                  <h3 className="font-bold text-white">Draft {draft.draftNumber}</h3>
                  {SCORE_KEYS.map((key) => (
                    <ScoreBar key={key} label={key} value={draft.scores?.[key] ?? 0} />
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