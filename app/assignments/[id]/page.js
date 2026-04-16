"use client";

import Link from "next/link";
import { useState } from "react";
import React from "react";

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
  const { id } = React.use(params);
  const a = FAKE_ASSIGNMENT;

  const [draftFile, setDraftFile] = useState(null);
  const [loading, setLoading] = useState(false);
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
      const formData = new FormData();
      formData.append("file", draftFile);

      const res = await fetch("/api/extract", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setUploadError(data.error || "Something went wrong.");
      } else {
        setExtractedText(data.text);
      }
    } catch (err) {
      console.error(err);
      setUploadError("Failed to upload. Please try again.");
    } finally {
      setLoading(false);
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
          <Link href="/assignments/new" className="text-blue-400 hover:text-white transition-colors text-sm font-bold">
            + New Assignment
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

        {/* Rubric / Context Section */}
        <div className="bg-white/5 border border-white/10 rounded-[24px] p-6 mb-8">
          <h2 className="text-lg font-bold italic mb-3">Rubric / Context</h2>
          <p className="text-zinc-400 leading-relaxed">{a.contextPreview}</p>
        </div>

        {/* Drafts Section */}
        <div className="mb-8">
          <h2 className="text-lg font-bold italic mb-2">Drafts (preview)</h2>
          <p className="text-sm text-zinc-500 mb-6">
            Scores and feedback will load from Firestore in a later week. Showing placeholder cards for now.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {a.draftsPreview.map((d) => (
              <div key={d.draftNumber} className="bg-black/40 border border-white/10 rounded-[24px] p-5 hover:border-blue-400/40 transition-all">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-bold text-white">Draft {d.draftNumber}</span>
                  <span className="text-xs text-zinc-500">{d.submittedAt}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {[
                    ["Clarity", d.scores.clarity],
                    ["Structure", d.scores.structure],
                    ["Evidence", d.scores.evidence],
                    ["Depth", d.scores.depth],
                  ].map(([label, val]) => (
                    <div key={label} className="flex justify-between bg-white/5 rounded-xl px-3 py-2">
                      <span className="text-zinc-400">{label}</span>
                      <span className="font-mono font-bold text-blue-300">{val}/10</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Draft Section */}
        <div className="bg-white/5 border border-white/10 rounded-[24px] p-6">
          <h2 className="text-lg font-bold italic mb-4">Submit a New Draft</h2>

          <div className="bg-black/30 border border-dashed border-white/20 p-6 rounded-2xl flex flex-col items-center gap-4">
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => {
                setDraftFile(e.target.files[0]);
                setExtractedText("");
                setUploadError("");
              }}
              className="text-sm text-zinc-400 file:mr-4 file:py-2 file:px-6 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-700 file:text-white hover:file:bg-blue-600 cursor-pointer"
            />

            {draftFile && (
              <p className="text-xs text-zinc-500">Selected: {draftFile.name}</p>
            )}

            {uploadError && (
              <p className="text-red-400 text-sm font-bold">{uploadError}</p>
            )}

            <button
              onClick={handleDraftUpload}
              disabled={loading}
              className="w-full bg-blue-700 hover:bg-blue-600 py-3 rounded-full font-bold text-white transition-transform active:scale-95 italic disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Processing..." : "Submit Draft"}
            </button>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="mt-6 text-center">
              <p className="text-blue-400 animate-pulse font-bold italic">Extracting text from your file...</p>
            </div>
          )}

          {/* Extracted Text */}
          {extractedText && (
            <div className="mt-6 bg-black/40 border border-blue-400/20 rounded-2xl p-5">
              <h3 className="text-sm font-bold text-blue-300 mb-3 uppercase tracking-widest">Extracted Text</h3>
              <p className="text-zinc-400 text-sm leading-relaxed whitespace-pre-wrap">{extractedText}</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}