"use client";

import { useState } from "react";
import FeedbackCard from "@/components/FeedbackCard";

const sampleScores = {
  clarity: 8.5,
  structure: 7.8,
  evidence: 6.9,
  depth: 8.1,
};

const sampleFeedback = [
  "Your thesis is clear and easy to follow from the introduction.",
  "Add one more source in paragraph three to strengthen your evidence.",
  "The conclusion summarizes well, but include one concrete next-step recommendation.",
];

export default function Home() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [text, setText] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    if (!selectedFile) {
      setError("Please choose a PDF or Word document first.");
      return;
    }

    setIsLoading(true);
    setError("");
    setText("");

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch("/api/extract", {
        method: "POST",
        body: formData,
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Failed to extract file text.");
      }

      setText(payload.text || "");
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Something went wrong while uploading your file."
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-start justify-center bg-zinc-100 px-4 py-12">
      <main className="w-full max-w-3xl rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-semibold text-zinc-900">File Text Extraction Test</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Upload a PDF, DOC, or DOCX file and confirm the API returns plain text.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <input
            type="file"
            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={(event) => setSelectedFile(event.target.files?.[0] || null)}
            className="block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          />

          <button
            type="submit"
            disabled={isLoading}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? "Extracting..." : "Extract Text"}
          </button>
        </form>

        {error ? (
          <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        <section className="mt-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-700">
            Extracted Text
          </h2>
          <pre className="mt-2 max-h-96 overflow-auto whitespace-pre-wrap rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-sm text-zinc-800">
            {text || "No extracted text yet."}
          </pre>
        </section>

        <section className="mt-8">
          <FeedbackCard scores={sampleScores} feedback={sampleFeedback} />
        </section>
      </main>
    </div>
  );
}
