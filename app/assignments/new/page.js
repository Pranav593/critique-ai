"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createAssignment, createDraft, auth } from "@/lib/firebase";

export default function NewAssignmentPage() {
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [contextMode, setContextMode] = useState("rubric");
  const [contextStatement, setContextStatement] = useState("");
  const [rubricFile, setRubricFile] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [assignmentFile, setAssignmentFile] = useState(null);
  const [assignmentMode, setAssignmentMode] = useState("file");
  const [assignmentText, setAssignmentText] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!title.trim() || !subject.trim()) {
      setError("Title and Subject are required!");
      return;
    }

    if (contextMode === "rubric" && !rubricFile) {
      setError("Please upload a rubric file!");
      return;
    }

    if (contextMode === "statement" && !contextStatement.trim()) {
      setError("Please enter a context statement!");
      return;
    }

    if (assignmentMode === "file" && !assignmentFile) {
      setError("Please upload your assignment file!");
      return;
    }

    if (assignmentMode === "paste" && !assignmentText.trim()) {
      setError("Please paste your assignment text!");
      return;
    }

    try {
      setLoading(true);
      const user = auth.currentUser;

      if (!user) {
        setError("You must be logged in to create an assignment.");
        setLoading(false);
        return;
      }

      let finalContextText = contextStatement.trim();

      if (contextMode === "rubric" && rubricFile) {
        const rubricFormData = new FormData();
        rubricFormData.append("file", rubricFile);
        
        const res = await fetch("/api/extract", { method: "POST", body: rubricFormData });
        const extraction = await res.json();
        
        if (!res.ok) throw new Error(extraction.error || "Failed to read rubric file.");
        finalContextText = extraction.text;
      }

      let finalAssignmentText = assignmentText.trim();

      if (assignmentMode === "file" && assignmentFile) {
        const assignFormData = new FormData();
        assignFormData.append("file", assignmentFile);
        
        const res = await fetch("/api/extract", { method: "POST", body: assignFormData });
        const extraction = await res.json();
        
        if (!res.ok) throw new Error(extraction.error || "Failed to read assignment file.");
        finalAssignmentText = extraction.text;
      }
      const assignmentData = {
        title: title.trim(),
        subject: subject.trim(),
        contextType: contextMode,
        contextText: finalContextText, // We save the EXTRACTED text here
        createdAt: new Date(),
      };

      const assignmentId = await createAssignment(user.uid, assignmentData);

      const analyzeRes = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: finalAssignmentText,
          context: finalContextText,
        }),
      });

      const analyzeData = await analyzeRes.json();
      if (!analyzeRes.ok) throw new Error(analyzeData.error || "AI Analysis failed.");

      await createDraft(user.uid, assignmentId, {
        draftNumber: 1,
        draftText: finalAssignmentText,
        scores: analyzeData.scores,
        feedback: analyzeData.feedback || [],
        createdAt: new Date(),
      });

      router.push(`/assignments/${assignmentId}`);

    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F4F4] text-[#1A1A1A] flex flex-col items-center justify-center p-8">
      
      <div className="mb-12 text-center">
        <h2 className="text-4xl font-light tracking-[0.2em] uppercase text-[#1A1A1A]">
          Critique.AI
        </h2>
      </div>

      <div className="w-full max-w-2xl bg-white p-12 border border-[#1A1A1A] shadow-none relative">
        
        <header className="text-center mb-10 border-b border-gray-200 pb-8">
          <h1 className="text-2xl font-light uppercase tracking-widest text-[#1A1A1A]">
            Define Assignment
          </h1>
          {error && <p className="text-red-600 mt-6 text-sm tracking-wide border border-red-600 p-2 font-medium">{error}</p>}
        </header>

        <form onSubmit={handleSubmit} className="space-y-10">
          <div className="space-y-6">
            <input
              placeholder="ASSIGNMENT TITLE"
              className="w-full p-4 bg-transparent border border-[#1A1A1A] focus:outline-none focus:ring-1 focus:ring-[#1A1A1A] text-sm tracking-widest placeholder:text-gray-400 rounded-none text-center"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            
            <input
              placeholder="SUBJECT / DISCIPLINE"
              className="w-full p-4 bg-transparent border border-[#1A1A1A] focus:outline-none focus:ring-1 focus:ring-[#1A1A1A] text-sm tracking-widest placeholder:text-gray-400 rounded-none text-center"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>

          <div className="pt-4">
            <p className="text-xs text-gray-500 uppercase tracking-[0.2em] text-center mb-6">Phase 1: Evaluation Metrics</p>

            <div className="flex border border-[#1A1A1A] rounded-none bg-transparent">
              <button
                type="button"
                onClick={() => setContextMode("rubric")}
                className={`flex-1 py-4 text-xs font-medium tracking-widest uppercase transition-colors rounded-none ${contextMode === "rubric" ? "bg-[#1A1A1A] text-white" : "text-[#1A1A1A] hover:bg-gray-50"}`}
              >
                Upload Rubric
              </button>
              <button
                type="button"
                onClick={() => setContextMode("statement")}
                className={`flex-1 py-4 text-xs font-medium tracking-widest uppercase transition-colors rounded-none border-l border-[#1A1A1A] ${contextMode === "statement" ? "bg-[#1A1A1A] text-white" : "text-[#1A1A1A] hover:bg-gray-50"}`}
              >
                Context Text
              </button>
            </div>

            <div className="mt-8 flex justify-center">
              {contextMode === "rubric" ? (
                <div className="border border-dashed border-[#1A1A1A] p-8 w-full flex justify-center items-center bg-gray-50 rounded-none">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    className="text-xs uppercase tracking-widest text-[#1A1A1A] file:mr-6 file:py-3 file:px-6 file:rounded-none file:border file:border-[#1A1A1A] file:text-xs file:font-medium file:bg-white file:text-[#1A1A1A] hover:file:bg-gray-100 cursor-pointer transition-colors"
                    onChange={(e) => setRubricFile(e.target.files[0])}
                  />
                </div>
              ) : (
                <textarea
                  placeholder="Specify grading focus..."
                  className="w-full p-6 bg-transparent border border-[#1A1A1A] focus:outline-none focus:ring-1 focus:ring-[#1A1A1A] text-sm tracking-wide placeholder:text-gray-400 rounded-none"
                  rows="4"
                  value={contextStatement}
                  onChange={(e) => setContextStatement(e.target.value)}
                />
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 uppercase tracking-[0.2em] text-center mb-6">Phase 2: Draft Submission</p>

            <div className="flex border border-[#1A1A1A] rounded-none bg-transparent">
              <button
                type="button"
                onClick={() => setAssignmentMode("file")}
                className={`flex-1 py-4 text-xs font-medium tracking-widest uppercase transition-colors rounded-none ${assignmentMode === "file" ? "bg-[#1A1A1A] text-white" : "text-[#1A1A1A] hover:bg-gray-50"}`}
              >
                Upload Document
              </button>
              <button
                type="button"
                onClick={() => setAssignmentMode("paste")}
                className={`flex-1 py-4 text-xs font-medium tracking-widest uppercase transition-colors rounded-none border-l border-[#1A1A1A] ${assignmentMode === "paste" ? "bg-[#1A1A1A] text-white" : "text-[#1A1A1A] hover:bg-gray-50"}`}
              >
                Paste Text
              </button>
            </div>

            <div className="mt-8 flex justify-center">
              {assignmentMode === "file" ? (
                <div className="border border-dashed border-[#1A1A1A] p-8 w-full flex flex-col items-center gap-4 bg-gray-50 rounded-none">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    className="text-xs uppercase tracking-widest text-[#1A1A1A] file:mr-6 file:py-3 file:px-6 file:rounded-none file:border file:border-[#1A1A1A] file:text-xs file:font-medium file:bg-white file:text-[#1A1A1A] hover:file:bg-gray-100 cursor-pointer transition-colors"
                    onChange={(e) => setAssignmentFile(e.target.files[0])}
                  />
                  {assignmentFile && (
                    <p className="text-xs text-gray-500 font-mono">SELECTED: {assignmentFile.name}</p>
                  )}
                </div>
              ) : (
                <textarea
                  placeholder="Paste student draft here..."
                  className="w-full p-6 bg-transparent border border-[#1A1A1A] focus:outline-none focus:ring-1 focus:ring-[#1A1A1A] text-sm tracking-wide placeholder:text-gray-400 rounded-none font-mono"
                  rows="8"
                  value={assignmentText}
                  onChange={(e) => setAssignmentText(e.target.value)}
                />
              )}
            </div>
          </div>

          <div className="pt-8 border-t border-[#1A1A1A]">
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-5 text-xs uppercase tracking-[0.2em] font-medium transition-colors border border-[#1A1A1A] rounded-none ${loading ? "bg-gray-200 text-gray-500 cursor-not-allowed" : "bg-[#1A1A1A] text-white hover:bg-black"}`}
            >
              {loading ? "Analyzing Draft..." : "Submit Assignment"}
            </button>
          </div>
        </form>

        <Link href="/dashboard" className="text-gray-500 hover:text-[#1A1A1A] transition-colors text-xs uppercase tracking-widest block mt-10 text-center font-medium">
          Cancel and return to Dashboard
        </Link>
      </div>
    </div>
  );
}
