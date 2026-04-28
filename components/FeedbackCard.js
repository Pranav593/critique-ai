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

function ScoreRow({ label, score, previousScore }) {
  const percent = `${(score / 10) * 100}%`;

  let colorClass = "bg-[#1A1A1A]"; // default
  if (score >= 8) colorClass = "bg-green-600";
  else if (score >= 5) colorClass = "bg-yellow-500";
  else colorClass = "bg-red-600";

  let textColor = "text-[#1A1A1A]";
  if (score >= 8) textColor = "text-green-700";
  else if (score >= 5) textColor = "text-yellow-600";
  else textColor = "text-red-700";

  const diff = typeof previousScore === 'number' ? score - previousScore : 0;
  const showDiff = typeof previousScore === 'number' && diff !== 0;

  return (
    <li className="space-y-2 mb-4">
      <div className={`flex items-center justify-between text-xs tracking-widest uppercase ${textColor}`}>
        <span className="font-medium flex items-center gap-3">
          {label}
          {showDiff && (
            <span className={`text-[10px] font-bold ${diff > 0 ? "text-green-600" : "text-red-600"}`}>
              {diff > 0 ? "↑" : "↓"} {Math.abs(diff).toFixed(1)}
            </span>
          )}
        </span>
        <span className="font-bold">{score.toFixed(1)}/10</span>
      </div>
      <div className="h-[3px] w-full bg-gray-200 rounded-none relative">
        <div
          className={`absolute top-0 left-0 h-[3px] ${colorClass} transition-all duration-500`}
          style={{ width: percent }}
        />
      </div>
    </li>
  );
}

export default function FeedbackCard({
  scores = {},
  previousScores = null,
  feedback = [],
  title = "Draft Feedback",
}) {
  return (
    <section className="bg-white border border-[#1A1A1A] p-8 shadow-none rounded-none">
      <h3 className="text-xl font-light tracking-widest uppercase text-[#1A1A1A] mb-8">{title}</h3>

      <ul className="mb-10">
        {SCORE_KEYS.map((key) => (
          <ScoreRow 
            key={key} 
            label={formatLabel(key)} 
            score={normalizeScore(scores[key])} 
            previousScore={previousScores ? normalizeScore(previousScores[key]) : null}
          />
        ))}
      </ul>

      <div className="border-t border-[#1A1A1A] pt-8">
        <h4 className="text-xs font-medium uppercase tracking-widest text-gray-500 mb-6">Actionable Items</h4>
        {feedback.length > 0 ? (
          <ul className="list-square ml-4 space-y-4 text-sm text-[#1A1A1A] leading-relaxed font-light">
            {feedback.map((item, index) => (
              <li key={`${item}-${index}`}>{item}</li>
            ))}
          </ul>
        ) : (
          <p className="text-sm tracking-wide text-gray-500 uppercase">Analysis pending</p>
        )}
      </div>
    </section>
  );
}