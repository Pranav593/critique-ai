"use client";

import Link from "next/link";
import { useCallback, useState } from "react";

type ContextMode = "rubric" | "statement";

export default function NewAssignmentPage() {
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [contextMode, setContextMode] = useState<ContextMode>("rubric");
  const [contextStatement, setContextStatement] = useState("");
  const [rubricFile, setRubricFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);

  const validate = useCallback(() => {
    const next: string[] = [];
    if (!title.trim()) next.push("Title is required.");
    if (!subject.trim()) next.push("Subject is required.");
    if (contextMode === "rubric" && !rubricFile) {
      next.push("Upload a rubric file (PDF or Word), or switch to context statement.");
    }
    if (contextMode === "statement" && !contextStatement.trim()) {
      next.push("Enter a context statement, or switch to rubric upload.");
    }
    return next;
  }, [title, subject, contextMode, rubricFile, contextStatement]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) {
      setRubricFile(null);
      return;
    }
    const ok =
      /\.pdf$/i.test(f.name) ||
      /\.docx?$/i.test(f.name) ||
      [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ].includes(f.type);
    if (!ok) {
      setErrors(["Please choose a PDF or Word document (.pdf, .doc, .docx)."]);
      e.target.value = "";
      setRubricFile(null);
      return;
    }
    setErrors([]);
    setRubricFile(f);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const v = validate();
    if (v.length) {
      setErrors(v);
      setShowSuccess(false);
      return;
    }
    setErrors([]);
    const payload = {
      title: title.trim(),
      subject: subject.trim(),
      contextType: contextMode === "rubric" ? ("rubric" as const) : ("statement" as const),
      contextStatement: contextMode === "statement" ? contextStatement.trim() : null,
      rubricFile: contextMode === "rubric" ? rubricFile : null,
    };
    console.log("Assignment form (Week 1 — not saved yet):", payload);
    setShowSuccess(true);
  };

  const resetForm = () => {
    setTitle("");
    setSubject("");
    setContextMode("rubric");
    setContextStatement("");
    setRubricFile(null);
    setShowSuccess(false);
    setErrors([]);
  };

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-md">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-6 py-4">
          <Link
            href="/"
            className="text-sm text-[var(--muted)] transition hover:text-white"
          >
            ← Home
          </Link>
          <span className="font-[family-name:var(--font-sora)] text-sm font-semibold">
            New assignment
          </span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-12">
        <h1 className="font-[family-name:var(--font-sora)] text-3xl font-bold tracking-tight sm:text-4xl">
          Create an assignment
        </h1>
        <p className="mt-2 text-[var(--muted)]">
          Add a title and subject, then attach a rubric or describe what you are graded on.
        </p>

        {showSuccess && (
          <div
            className="mt-8 rounded-2xl border border-[var(--success)]/40 bg-[var(--success)]/10 px-5 py-4 text-sm"
            role="status"
          >
            <p className="font-semibold text-[var(--success)]">Saved locally (preview)</p>
            <p className="mt-1 text-[var(--muted)]">
              Form data was logged to the browser console. Firestore wiring comes in Week 2.
            </p>
            <button
              type="button"
              onClick={resetForm}
              className="mt-4 text-sm font-medium text-[var(--accent)] underline-offset-2 hover:underline"
            >
              Create another
            </button>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-8 rounded-3xl border border-white/10 bg-[var(--card)] p-8 shadow-2xl shadow-black/40 backdrop-blur-xl"
          noValidate
        >
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium text-white/90">
              Title
            </label>
            <input
              id="title"
              name="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Argumentative essay — climate policy"
              className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white placeholder:text-white/35 outline-none ring-[var(--ring)] transition focus:border-[var(--accent)] focus:ring-2"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="subject" className="text-sm font-medium text-white/90">
              Subject
            </label>
            <input
              id="subject"
              name="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. English 12, CS 101"
              className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white placeholder:text-white/35 outline-none ring-[var(--ring)] transition focus:border-[var(--accent)] focus:ring-2"
            />
          </div>

          <div className="space-y-3">
            <span className="text-sm font-medium text-white/90">How should we understand the rubric?</span>
            <div className="flex rounded-xl border border-white/10 bg-black/25 p-1">
              <button
                type="button"
                onClick={() => {
                  setContextMode("rubric");
                  setErrors([]);
                }}
                className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition ${
                  contextMode === "rubric"
                    ? "bg-[var(--accent)] text-white shadow-md"
                    : "text-[var(--muted)] hover:text-white"
                }`}
              >
                Upload rubric
              </button>
              <button
                type="button"
                onClick={() => {
                  setContextMode("statement");
                  setErrors([]);
                }}
                className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition ${
                  contextMode === "statement"
                    ? "bg-[var(--accent)] text-white shadow-md"
                    : "text-[var(--muted)] hover:text-white"
                }`}
              >
                Context statement
              </button>
            </div>
          </div>

          {contextMode === "rubric" ? (
            <div className="space-y-2">
              <label htmlFor="rubric" className="text-sm font-medium text-white/90">
                Rubric file
              </label>
              <div className="rounded-xl border border-dashed border-white/20 bg-black/20 px-4 py-8 text-center">
                <input
                  id="rubric"
                  name="rubric"
                  type="file"
                  accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={onFileChange}
                  className="mx-auto block w-full max-w-xs cursor-pointer text-sm text-[var(--muted)] file:mr-4 file:rounded-lg file:border-0 file:bg-[var(--accent)] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:brightness-110"
                />
                {rubricFile && (
                  <p className="mt-3 text-sm text-[var(--success)]">Selected: {rubricFile.name}</p>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <label htmlFor="context" className="text-sm font-medium text-white/90">
                Context statement
              </label>
              <textarea
                id="context"
                name="context"
                value={contextStatement}
                onChange={(e) => setContextStatement(e.target.value)}
                rows={5}
                placeholder="Short description of expectations, grading criteria, or what the instructor cares about."
                className="w-full resize-y rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white placeholder:text-white/35 outline-none ring-[var(--ring)] transition focus:border-[var(--accent)] focus:ring-2"
              />
            </div>
          )}

          {errors.length > 0 && (
            <ul className="list-inside list-disc rounded-xl border border-[var(--accent-hot)]/35 bg-[var(--accent-hot)]/10 px-4 py-3 text-sm text-[#ffb8d0]">
              {errors.map((err) => (
                <li key={err}>{err}</li>
              ))}
            </ul>
          )}

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="submit"
              className="inline-flex flex-1 min-w-[140px] items-center justify-center rounded-xl bg-gradient-to-r from-[var(--accent)] to-[var(--accent-hot)] px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:brightness-110 sm:flex-none"
            >
              Submit (console only)
            </button>
            <Link
              href="/assignments/sample-101"
              className="inline-flex items-center justify-center rounded-xl border border-white/15 px-6 py-3 text-sm font-medium text-white/80 transition hover:bg-white/5"
            >
              View sample detail
            </Link>
          </div>
        </form>
      </main>
    </div>
  );
}
