"use client";

import Link from "next/link";
import { useState, use } from "react";
import React from "react";
import { useRouter } from "next/navigation";
import { createDraft } from "@/lib/firestore"; // Ensure this file exists in frontend/lib/

const FAKE_ASSIGNMENT = {
  id: "sample-101",
  title: "Research synthesis: renewable energy adoption",
  subject: "Environmental Science 201",
  contextType: "rubric",
  contextPreview:
    "Rubric emphasizes thesis clarity, use of peer-reviewed sources, correct APA citations, and a conclusion that ties evidence to policy implications.",
  createdAtLabel: "Mar 20, 2026",
  draftsPreview: [
    { draftNumber: 1, submittedAt: "Mar 21, 2026", scores: { clarity: 6, structure: 7, evidence: 5, depth: 6 } },
    { draftNumber: 2, submittedAt: "Mar 24, 2026", scores: { clarity: 8, structure: 8, evidence: 7, depth: 7 } },
  ],
};

export default function AssignmentDetailPage({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const a = FAKE_ASSIGNMENT;

  const [draftFile, setDraftFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(""); // Track pipeline steps
  const [extractedText, setExtractedText] = useState("");
  const [uploadError, setUploadError] = useState("");

  const handleDraftUpload = async () => {
    if (!draftFile) {
      setUploadError("Please select a file first!");
      return;
    }

    setUploadError("");
    setLoading(true);
    setExtractedText("");

    try {
      
      setLoadingStatus("Extracting text from document...");
      const formData = new FormData();
      formData.append("file", draftFile);

      const extractRes = await fetch("/api/extract", {
        method: "POST",
        body: formData,
      });
      const extractData = await extractRes.json();
      if (!extractRes.ok) throw new Error(extractData.error || "Extraction failed");
      
      setExtractedText(extractData.text);

      
      setLoadingStatus("AI is analyzing your draft based on the rubric...");
      const analyzeRes = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          text: extractData.text, 
          context: a.contextPreview 
        }),
      });
      const analysisData = await analyzeRes.json();
      if (!analyzeRes.ok) throw new Error("AI Analysis failed");

      
      setLoadingStatus("Saving feedback to your dashboard...");
      // Replace 'user_123' with your actual Auth UID when ready
      await createDraft("user_123", id, analysisData);

      // --- STEP 4: SUCCESS & REFRESH ---
      setLoadingStatus("Complete!");
      alert("Draft analyzed and saved!");
      router.refresh(); // Refresh the draft list

    } catch (err) {
      console.error(err);
      setUploadError(err.message || "Failed to process draft.");
    } finally {
      setLoading(false);
      setLoadingStatus("");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-t from-black via-blue-950 to-blue-900 text-white flex flex-col items-center p-6" style={{ fontFamily: "'Times New Roman', Times, serif" }}>

      {/* Branding Header */}
      <div className="mb-10 text-center mt-10">
        <h2 className="text-7xl font-black italic tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-white drop-shadow-[0_6px_6px_rgba(0,0,128,0.9)]">
          CritiqueAI
        </h2>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-2xl bg-black/80 backdrop-blur-xl p-10 rounded-[40px] border-2 border-blue-400/50 shadow-[0_0_25px_rgba(96,165,250,0.2)]">

        {/* Nav */}
        <div className="flex justify-between items-center mb-8">
          <p className="text-xs uppercase tracking-widest text-zinc-500">
            Assignment · ID: <span className="text-zinc-300">{id}</span>
          </p>
          <Link href="/dashboard" className="text-blue-400 hover:text-white transition-colors text-sm font-bold">
            ← Back to Dashboard
          </Link>
        </div>

        <h1 className="text-3xl font-bold italic tracking-tight mb-4">
          {a.title}
        </h1>

        {/* Tags */}
        <div className="flex flex-wrap gap-3 mb-8 text-sm">
          <span className="px-4 py-1 rounded-full bg-white/5 border border-white/10 text-white/90">
            {a.subject}
          </span>
          <span className="px-4 py-1 rounded-full bg-blue-700/30 border border-blue-400/30 text-blue-300">
            {a.contextType === "rubric" ? "Rubric-based" : "Statement"}
          </span>
          <span className="px-4 py-1 rounded-full bg-white/5 border border-white/10 text-zinc-400">
            Created {a.createdAtLabel}
          </span>
        </div>

        {/* Rubric Section */}
        <div className="bg-white/5 border border-white/10 rounded-[24px] p-6 mb-8">
          <h2 className="text-lg font-bold italic mb-3">Rubric / Context</h2>
          <p className="text-zinc-400 leading-relaxed">{a.contextPreview}</p>
        </div>

        {/* Submit Section */}
        <div className="bg-white/5 border border-white/10 rounded-[24px] p-6">
          <h2 className="text-lg font-bold italic mb-4">Submit a New Draft</h2>

          <div className="bg-black/30 border border-dashed border-white/20 p-6 rounded-2xl flex flex-col items-center gap-4">
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => setDraftFile(e.target.files[0])}
              className="text-sm text-zinc-400 file:mr-4 file:py-2 file:px-6 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-700 file:text-white hover:file:bg-blue-600 cursor-pointer"
            />

            {uploadError && <p className="text-red-400 text-sm font-bold">{uploadError}</p>}

            <button
              onClick={handleDraftUpload}
              disabled={loading}
              className="w-full bg-blue-700 hover:bg-blue-600 py-3 rounded-full font-bold text-white transition-transform active:scale-95 italic disabled:opacity-50"
            >
              {loading ? "Processing..." : "Run AI Analysis"}
            </button>
          </div>

          {loading && (
            <div className="mt-6 text-center">
              <p className="text-blue-400 animate-pulse font-bold italic">{loadingStatus}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}