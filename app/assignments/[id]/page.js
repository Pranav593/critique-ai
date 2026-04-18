"use client";

const mockDrafts = [
  {
    draftNumber: 1,
    scores: {
      clarity: 5,
      structure: 6,
      evidence: 4,
      depth: 5,
    },
  },
  {
    draftNumber: 2,
    scores: {
      clarity: 7,
      structure: 7,
      evidence: 6,
      depth: 6,
    },
  },
];

function ScoreBar({ label, value }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium text-gray-700 capitalize">
          {label}
        </span>
        <span className="text-sm text-gray-500">{value}/10</span>
      </div>

      <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-600 rounded-full transition-all duration-300"
          style={{ width: `${value * 10}%` }}
        />
      </div>
    </div>
  );
}

function ScoreChange({ current, previous }) {
  const change = current - previous;

  if (change > 0) {
    return <span className="text-green-600 font-medium">+{change}</span>;
  }

  if (change < 0) {
    return <span className="text-red-600 font-medium">{change}</span>;
  }

  return <span className="text-gray-500 font-medium">0</span>;
}

export default function AssignmentDetailPage() {
  const draft1 = mockDrafts[0];
  const draft2 = mockDrafts[1];

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Assignment Details
          </h1>
          <p className="text-gray-500">
            Compare how your writing improved across drafts.
          </p>
        </div>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Score Comparison
          </h2>

          <div className="grid gap-6 md:grid-cols-2">
            {mockDrafts.map((draft) => (
              <div
                key={draft.draftNumber}
                className="bg-white border rounded-xl p-6 shadow-sm"
              >
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-xl font-semibold text-gray-800">
                    Draft {draft.draftNumber}
                  </h3>
                  <span className="text-sm text-gray-500">
                    Scores out of 10
                  </span>
                </div>

                <div className="space-y-4">
                  <ScoreBar label="clarity" value={draft.scores.clarity} />
                  <ScoreBar label="structure" value={draft.scores.structure} />
                  <ScoreBar label="evidence" value={draft.scores.evidence} />
                  <ScoreBar label="depth" value={draft.scores.depth} />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Improvement Summary
          </h2>

          <div className="bg-white border rounded-xl p-6 shadow-sm overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-2 text-gray-700">Category</th>
                  <th className="text-left py-3 px-2 text-gray-700">Draft 1</th>
                  <th className="text-left py-3 px-2 text-gray-700">Draft 2</th>
                  <th className="text-left py-3 px-2 text-gray-700">Change</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-3 px-2 font-medium text-gray-800">Clarity</td>
                  <td className="py-3 px-2">{draft1.scores.clarity}</td>
                  <td className="py-3 px-2">{draft2.scores.clarity}</td>
                  <td className="py-3 px-2">
                    <ScoreChange
                      current={draft2.scores.clarity}
                      previous={draft1.scores.clarity}
                    />
                  </td>
                </tr>

                <tr className="border-b">
                  <td className="py-3 px-2 font-medium text-gray-800">Structure</td>
                  <td className="py-3 px-2">{draft1.scores.structure}</td>
                  <td className="py-3 px-2">{draft2.scores.structure}</td>
                  <td className="py-3 px-2">
                    <ScoreChange
                      current={draft2.scores.structure}
                      previous={draft1.scores.structure}
                    />
                  </td>
                </tr>

                <tr className="border-b">
                  <td className="py-3 px-2 font-medium text-gray-800">Evidence</td>
                  <td className="py-3 px-2">{draft1.scores.evidence}</td>
                  <td className="py-3 px-2">{draft2.scores.evidence}</td>
                  <td className="py-3 px-2">
                    <ScoreChange
                      current={draft2.scores.evidence}
                      previous={draft1.scores.evidence}
                    />
                  </td>
                </tr>

                <tr>
                  <td className="py-3 px-2 font-medium text-gray-800">Depth</td>
                  <td className="py-3 px-2">{draft1.scores.depth}</td>
                  <td className="py-3 px-2">{draft2.scores.depth}</td>
                  <td className="py-3 px-2">
                    <ScoreChange
                      current={draft2.scores.depth}
                      previous={draft1.scores.depth}
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}