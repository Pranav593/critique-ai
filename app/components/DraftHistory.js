"use client";

import { useMemo, useState } from "react";
import FeedbackCard from "./FeedbackCard";

const SCORE_KEYS = ["clarity", "structure", "evidence", "depth"];

function toDate(value) {
  if (!value) {
    return null;
  }

  if (typeof value?.toDate === "function") {
    return value.toDate();
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  if (typeof value === "number") {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  if (typeof value === "string") {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  if (typeof value === "object" && typeof value.seconds === "number") {
    const millis = value.seconds * 1000 + Math.floor((value.nanoseconds || 0) / 1000000);
    const parsed = new Date(millis);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  return null;
}

function normalizeScore(value) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return 0;
  }

  return Math.max(0, Math.min(10, value));
}

function getOverallAverage(scores = {}) {
  const total = SCORE_KEYS.reduce((sum, key) => sum + normalizeScore(scores[key]), 0);
  return total / SCORE_KEYS.length;
}

function formatDraftDate(submittedAt) {
  const date = toDate(submittedAt);
  if (!date) {
    return "No submission date";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export default function DraftHistory({ drafts = [] }) {
  const normalizedDrafts = useMemo(() => {
    if (!Array.isArray(drafts) || drafts.length === 0) {
      return [];
    }

    return drafts
      .map((draft, index) => {
        const safeDraft = draft && typeof draft === "object" ? draft : {};

        return {
          id: safeDraft.id || `draft-${index + 1}`,
          draftNumber: safeDraft.draftNumber || index + 1,
          submittedAt: safeDraft.submittedAt || safeDraft.createdAt || null,
          scores: safeDraft.scores || {},
          feedback: Array.isArray(safeDraft.feedback) ? safeDraft.feedback : [],
        };
      })
      .sort((a, b) => {
        const aTime = toDate(a.submittedAt)?.getTime() ?? 0;
        const bTime = toDate(b.submittedAt)?.getTime() ?? 0;
        return bTime - aTime;
      });
  }, [drafts]);

  const [expandedDraftId, setExpandedDraftId] = useState(null);
  const resolvedExpandedDraftId =
    expandedDraftId && normalizedDrafts.some((draft) => draft.id === expandedDraftId)
      ? expandedDraftId
      : normalizedDrafts[0]?.id ?? null;

  if (normalizedDrafts.length === 0) {
    return (
      <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <h3 className="text-lg font-semibold text-zinc-900">Draft History</h3>
        <p className="mt-3 text-sm text-zinc-500">No drafts submitted yet.</p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <h3 className="text-lg font-semibold text-zinc-900">Draft History</h3>

      <ul className="mt-4 space-y-3">
        {normalizedDrafts.map((draft) => {
          const average = getOverallAverage(draft.scores);
          const isExpanded = resolvedExpandedDraftId === draft.id;

          return (
            <li key={draft.id} className="rounded-xl border border-zinc-200 bg-zinc-50">
              <button
                type="button"
                className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
                onClick={() => setExpandedDraftId((prev) => (prev === draft.id ? null : draft.id))}
              >
                <div>
                  <p className="text-sm font-semibold text-zinc-900">Draft {draft.draftNumber}</p>
                  <p className="mt-1 text-xs text-zinc-500">{formatDraftDate(draft.submittedAt)}</p>
                </div>

                <div className="text-right">
                  <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Overall</p>
                  <p className="text-sm font-semibold text-zinc-900">{average.toFixed(1)}/10</p>
                </div>
              </button>

              {isExpanded ? (
                <div className="border-t border-zinc-200 p-3">
                  <FeedbackCard
                    title={`Draft ${draft.draftNumber} Feedback`}
                    scores={draft.scores}
                    feedback={draft.feedback}
                  />
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
