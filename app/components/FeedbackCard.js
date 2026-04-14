const SCORE_KEYS = ["clarity", "structure", "evidence", "depth"];

function formatLabel(key) {
  return key.charAt(0).toUpperCase() + key.slice(1);
}

function normalizeScore(value) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return 0;
  }

  return Math.max(0, Math.min(10, value));
}

function ScoreRow({ label, score }) {
  const percent = `${(score / 10) * 100}%`;

  return (
    <li className="space-y-1">
      <div className="flex items-center justify-between text-sm text-zinc-700">
        <span className="font-medium">{label}</span>
        <span>{score.toFixed(1)}/10</span>
      </div>
      <div className="h-2.5 rounded-full bg-zinc-200">
        <div
          className="h-full rounded-full bg-emerald-500 transition-all"
          style={{ width: percent }}
        />
      </div>
    </li>
  );
}

export default function FeedbackCard({
  scores = {},
  feedback = [],
  title = "Draft Feedback",
}) {
  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <h3 className="text-lg font-semibold text-zinc-900">{title}</h3>

      <ul className="mt-4 space-y-3">
        {SCORE_KEYS.map((key) => (
          <ScoreRow key={key} label={formatLabel(key)} score={normalizeScore(scores[key])} />
        ))}
      </ul>

      <div className="mt-5 border-t border-zinc-200 pt-4">
        <h4 className="text-sm font-semibold uppercase tracking-wide text-zinc-700">Feedback</h4>
        {feedback.length > 0 ? (
          <ul className="mt-2 list-disc space-y-2 pl-5 text-sm text-zinc-700">
            {feedback.map((item, index) => (
              <li key={`${item}-${index}`}>{item}</li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-zinc-500">No feedback comments yet.</p>
        )}
      </div>
    </section>
  );
}