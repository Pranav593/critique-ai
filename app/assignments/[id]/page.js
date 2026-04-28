"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "../../Context/AuthContext";
import {
  getAssignment,
  subscribeToDrafts,
  createDraft,
  deleteAssignment,
  updateAssignment,
} from "../../../lib/firebase";
import FeedbackCard from "../../../components/FeedbackCard";
import Navbar from "../../../components/Navbar";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const SCORE_KEYS = ["clarity", "structure", "evidence", "depth"];

function ScoreBar({ label, value }) {
  let colorClass = "bg-[#1A1A1A]"; // default
  if (value >= 8) colorClass = "bg-green-600";
  else if (value >= 5) colorClass = "bg-yellow-500";
  else colorClass = "bg-red-600";

  let textColor = "text-[#1A1A1A]";
  if (value >= 8) textColor = "text-green-700";
  else if (value >= 5) textColor = "text-yellow-600";
  else textColor = "text-red-700";

  return (
    <div className="mb-4">
      <div className={`flex justify-between mb-2 ${textColor}`}>
        <span className="text-xs uppercase tracking-widest font-medium">{label}</span>
        <span className="text-xs tracking-widest font-medium">{value}/10</span>
      </div>
      <div className="w-full h-[3px] bg-gray-200 relative">
        <div
          className={`absolute top-0 left-0 h-[3px] ${colorClass} transition-all duration-500`}
          style={{ width: `${value * 10}%` }}
        />
      </div>
    </div>
  );
}

export default function AssignmentDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const router = useRouter();

  const [assignment, setAssignment] = useState(null);
  const [drafts, setDrafts] = useState([]);
  const [loadingPage, setLoadingPage] = useState(true);
  const [loadingDrafts, setLoadingDrafts] = useState(true);
  const [selectedDraftIndex, setSelectedDraftIndex] = useState(0);

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editSubject, setEditSubject] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  // File upload state
  const [draftFile, setDraftFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const [draftText, setDraftText] = useState("");

  /* ---------------- FETCH ASSIGNMENT ---------------- */
  useEffect(() => {
    if (!user || !id) return;

    getAssignment(user.uid, id)
      .then((data) => {
        setAssignment(data);
        setEditTitle(data.title);
        setEditSubject(data.subject);
      })
      .catch((err) => console.error("Error fetching assignment:", err))
      .finally(() => setLoadingPage(false));
  }, [user, id]);

  /* ---------------- FETCH DRAFTS ---------------- */
  useEffect(() => {
    if (!user || !id) return;

    setLoadingDrafts(true);
    const unsubscribe = subscribeToDrafts(user.uid, id, (data) => {
      setDrafts(data);
      setSelectedDraftIndex(0);
      setLoadingDrafts(false);
    });

    return () => unsubscribe();
  }, [user, id]);

  /* ---------------- AI FILE SUBMISSION ---------------- */
  const handleDelete = async () => {
    if (!confirm("Are you sure you want to permanently delete this assignment and all its drafts?")) return;
    try {
      await deleteAssignment(user.uid, id);
      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      alert("Failed to delete assignment.");
    }
  };

  const handleSaveEdit = async () => {
    if (!editTitle.trim() || !editSubject.trim()) return;
    setSavingEdit(true);
    try {
      await updateAssignment(user.uid, id, {
        title: editTitle,
        subject: editSubject,
      });
      setAssignment((prev) => ({ ...prev, title: editTitle, subject: editSubject }));
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to update assignment", err);
      alert("Failed to update assignment.");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleFileSubmit = async () => {
    if (!draftFile && !draftText.trim()) {
      setUploadError("Provide a file or paste text.");
      return;
    }

    try {
      setUploading(true);
      setUploadError("");

      let finalDraftText = draftText.trim();

      if (draftFile) {
        const formData = new FormData();
        formData.append("file", draftFile);

        const extractRes = await fetch("/api/extract", {
          method: "POST",
          body: formData,
        });

        const extractData = await extractRes.json();
        if (!extractRes.ok)
          throw new Error(extractData.error || "Extraction failed");
        
        finalDraftText = extractData.text;
      }

      const analyzeRes = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: finalDraftText,
          context: assignment?.contextText || "",
        }),
      });

      const analyzeData = await analyzeRes.json();
      if (!analyzeRes.ok)
        throw new Error(analyzeData.error || "Analysis failed");

      await createDraft(user.uid, id, {
        draftNumber: drafts.length + 1,
        draftText: finalDraftText,
        scores: analyzeData.scores,
        feedback: analyzeData.feedback || [],
      });

      setDraftFile(null);
      setDraftText("");
    } catch (err) {
      setUploadError(err.message || "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  if (loadingPage) {
    return (
      <div className="min-h-screen bg-[#F4F4F4] flex items-center justify-center">
        <span className="text-xs uppercase tracking-widest text-[#1A1A1A] animate-pulse">Initializing Data...</span>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="min-h-screen bg-[#F4F4F4] flex flex-col items-center justify-center">
        <span className="text-xs uppercase tracking-widest text-red-600 mb-4">Error 404</span>
        <span className="text-[#1A1A1A]">Assignment context not found.</span>
      </div>
    );
  }

  const selectedDraft = drafts[selectedDraftIndex];
  const previousDraft = drafts[selectedDraftIndex + 1];

  const chartData = [...drafts].reverse().map((d) => ({
    name: `Draft ${d.draftNumber}`,
    clarity: d.scores?.clarity || 0,
    structure: d.scores?.structure || 0,
    evidence: d.scores?.evidence || 0,
    depth: d.scores?.depth || 0,
  }));

  return (
    <div className="min-h-screen bg-[#F4F4F4] text-[#1A1A1A] pb-24">
      <Navbar />
      
      <div className="max-w-5xl mx-auto px-8">

        {/* Status Header */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="w-full md:w-2/3">
            <Link href="/dashboard" className="text-xs uppercase tracking-widest text-[#1A1A1A] hover:text-gray-500 mb-6 inline-block transition-colors">
              &larr; Back to Dashboard
            </Link>
            
            {isEditing ? (
              <div className="space-y-4">
                <input
                  value={editSubject}
                  onChange={(e) => setEditSubject(e.target.value)}
                  className="w-full text-xs font-medium tracking-wide uppercase text-gray-500 border border-[#1A1A1A] p-3 bg-transparent focus:outline-none"
                  placeholder="SUBJECT"
                />
                <input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full text-4xl font-light tracking-wide uppercase text-[#1A1A1A] border border-[#1A1A1A] p-3 bg-transparent focus:outline-none"
                  placeholder="TITLE"
                />
                <div className="flex gap-4">
                  <button
                    onClick={handleSaveEdit}
                    disabled={savingEdit}
                    className="border border-[#1A1A1A] bg-[#1A1A1A] text-white hover:bg-black px-8 py-3 text-xs uppercase tracking-widest font-medium transition-colors rounded-none disabled:opacity-50"
                  >
                    {savingEdit ? "SAVING..." : "SAVE CHANGES"}
                  </button>
                  <button
                    onClick={() => {
                      setEditTitle(assignment.title);
                      setEditSubject(assignment.subject);
                      setIsEditing(false);
                    }}
                    className="border border-[#1A1A1A] text-[#1A1A1A] bg-transparent hover:bg-gray-100 px-8 py-3 text-xs uppercase tracking-widest font-medium transition-colors rounded-none"
                  >
                    CANCEL
                  </button>
                </div>
              </div>
            ) : (
              <>
                <p className="text-xs tracking-widest text-gray-500 uppercase mb-2">Subject: {assignment.subject}</p>
                <h1 className="text-4xl font-light tracking-wide uppercase text-[#1A1A1A] break-words">{assignment.title}</h1>
              </>
            )}
          </div>
          
          {!isEditing && (
            <div className="flex gap-4 self-start md:self-auto">
              <button
                onClick={() => setIsEditing(true)}
                className="border border-[#1A1A1A] text-[#1A1A1A] hover:bg-gray-100 px-6 py-2 text-xs uppercase tracking-widest font-medium transition-colors rounded-none whitespace-nowrap"
              >
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="border border-[#1A1A1A] text-[#1A1A1A] hover:bg-red-600 hover:text-white hover:border-red-600 px-6 py-2 text-xs uppercase tracking-widest font-medium transition-colors rounded-none whitespace-nowrap"
              >
                Delete
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-12">

            {/* Score Improvement Chart */}
            <div>
              <h2 className="text-sm font-medium uppercase tracking-widest border-b border-[#1A1A1A] pb-4 mb-6">Score Improvement</h2>
              <div className="bg-white p-8 border border-[#1A1A1A] shadow-none w-full h-[400px]">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                      <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#6B7280', fontSize: 12 }} 
                        dy={10}
                      />
                      <YAxis 
                        domain={[0, 10]} 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#6B7280', fontSize: 12 }}
                      />
                      <Tooltip 
                        contentStyle={{ borderRadius: 0, border: '1px solid #1A1A1A', boxShadow: 'none' }}
                        itemStyle={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}
                        labelStyle={{ fontSize: 12, fontWeight: 600, color: '#1A1A1A', marginBottom: 8 }}
                      />
                      <Legend 
                        wrapperStyle={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em', paddingTop: 20 }}
                        iconType="line"
                      />
                      <Line type="monotone" dataKey="clarity" stroke="#2563EB" strokeWidth={2} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                      <Line type="monotone" dataKey="structure" stroke="#16A34A" strokeWidth={2} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                      <Line type="monotone" dataKey="evidence" stroke="#D97706" strokeWidth={2} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                      <Line type="monotone" dataKey="depth" stroke="#DC2626" strokeWidth={2} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <p className="text-xs text-gray-500 uppercase tracking-widest">Awaiting data to populate chart.</p>
                  </div>
                )}
              </div>
            </div>
          
            {/* Draft History Control and Results */}
            <div>
              <div className="flex items-center justify-between border-b border-[#1A1A1A] pb-4 mb-6">
                <h2 className="text-sm font-medium uppercase tracking-widest">Draft Feedback</h2>
                {drafts.length > 0 && (
                  <div className="flex gap-4 items-center">
                    <button
                      disabled={selectedDraftIndex === drafts.length - 1}
                      onClick={() => setSelectedDraftIndex(prev => prev + 1)}
                      className={`text-xs uppercase tracking-widest font-medium transition-colors ${selectedDraftIndex === drafts.length - 1 ? "text-gray-300" : "text-[#1A1A1A] hover:text-gray-500"}`}
                    >
                      &larr; Older
                    </button>
                    <span className="text-xs text-gray-400">
                      {drafts.length - selectedDraftIndex} of {drafts.length}
                    </span>
                    <button
                      disabled={selectedDraftIndex === 0}
                      onClick={() => setSelectedDraftIndex(prev => prev - 1)}
                      className={`text-xs uppercase tracking-widest font-medium transition-colors ${selectedDraftIndex === 0 ? "text-gray-300" : "text-[#1A1A1A] hover:text-gray-500"}`}
                    >
                      Newer &rarr;
                    </button>
                  </div>
                )}
              </div>
              
              {loadingDrafts ? (
                <p className="text-xs uppercase tracking-widest text-gray-500">Loading results...</p>
              ) : selectedDraft ? (
                <FeedbackCard
                  scores={selectedDraft.scores}
                  previousScores={previousDraft?.scores}
                  feedback={selectedDraft.feedback || []}
                  title={`DRAFT v${selectedDraft.draftNumber}`}
                />
              ) : (
                <div className="border border-[#1A1A1A] p-8 bg-white text-center">
                  <p className="text-xs uppercase tracking-widest text-gray-500">No results found.</p>
                </div>
              )}
            </div>

            {/* Submit New Draft Box */}
            <div>
              <h2 className="text-sm font-medium uppercase tracking-widest border-b border-[#1A1A1A] pb-4 mb-6">Submit New Draft</h2>
              <div className="bg-white p-8 border border-[#1A1A1A] shadow-none">
                
                {uploadError && (
                  <p className="text-red-600 text-xs font-medium uppercase tracking-widest mb-6 border border-red-600 p-3">{uploadError}</p>
                )}

                <div className="space-y-6">
                  <div className="border border-dashed border-[#1A1A1A] bg-gray-50 p-6 flex flex-col items-center">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => setDraftFile(e.target.files[0])}
                      className="text-xs uppercase tracking-widest text-[#1A1A1A] file:mr-4 file:py-2 file:px-4 file:rounded-none file:border file:border-[#1A1A1A] file:bg-white hover:file:bg-gray-100 cursor-pointer w-full text-center"
                    />
                  </div>

                  <div className="text-center text-xs tracking-widest text-gray-400 uppercase">-- OR --</div>

                  <textarea
                    value={draftText}
                    onChange={(e) => setDraftText(e.target.value)}
                    rows={4}
                    placeholder="PASTE DRAFT CONTENT HERE"
                    className="w-full p-4 bg-transparent border border-[#1A1A1A] focus:outline-none focus:ring-1 focus:ring-[#1A1A1A] text-sm tracking-wide placeholder:text-gray-400 font-mono"
                  />

                  <button
                    onClick={handleFileSubmit}
                    disabled={uploading}
                    className={`w-full py-4 text-xs font-medium uppercase tracking-widest border border-[#1A1A1A] transition-colors rounded-none ${uploading ? "bg-gray-200 text-gray-500 cursor-not-allowed" : "bg-[#1A1A1A] text-white hover:bg-black"}`}
                  >
                    {uploading ? "Processing..." : "Submit Artifact"}
                  </button>
                </div>
              </div>
            </div>

          </div>

          {/* Sidebar Column */}
          <div className="space-y-12">
            
            {/* Historical Score Comparison */}
            <div>
              <h2 className="text-sm font-medium uppercase tracking-widest border-b border-[#1A1A1A] pb-4 mb-6">Past Results</h2>
              
              {drafts.length > 0 ? (
                <div className="space-y-8">
                  {drafts.map((draft) => (
                    <div
                      key={draft.id}
                      className="bg-white p-6 border border-gray-300 rounded-none shadow-none"
                    >
                      <h3 className="text-xs font-medium uppercase tracking-widest text-[#1A1A1A] mb-6">
                        Draft v{draft.draftNumber}
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
              ) : (
                <p className="text-xs text-gray-500 uppercase tracking-widest">No previous drafts available.</p>
              )}
            </div>

            {/* Rubric/Context reference */}
            {assignment.contextText && (
              <div>
                <h2 className="text-sm font-medium uppercase tracking-widest border-b border-[#1A1A1A] pb-4 mb-6">Context / Rubric</h2>
                <div className="bg-white p-6 border border-[#1A1A1A] rounded-none h-64 overflow-y-auto">
                  <p className="text-sm tracking-wide text-gray-600 font-light leading-relaxed whitespace-pre-wrap">
                    {assignment.contextText}
                  </p>
                </div>
              </div>
            )}

          </div>

        </div>
      </div>
    </div>
  );
}