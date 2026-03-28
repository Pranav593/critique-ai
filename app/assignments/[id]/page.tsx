import Link from "next/link";

/** Week 1: static preview data. Replace with Firestore + real id later. */
const FAKE_ASSIGNMENT = {
  id: "sample-101",
  title: "Research synthesis: renewable energy adoption",
  subject: "Environmental Science 201",
  contextType: "rubric" as const,
  contextPreview:
    "Rubric emphasizes thesis clarity, use of peer-reviewed sources, correct APA citations, and a conclusion that ties evidence to policy implications.",
  createdAtLabel: "Mar 20, 2026",
  draftsPreview: [
    { draftNumber: 1, submittedAt: "Mar 21, 2026", scores: { clarity: 6, structure: 7, evidence: 5, depth: 6 } },
    { draftNumber: 2, submittedAt: "Mar 24, 2026", scores: { clarity: 8, structure: 8, evidence: 7, depth: 7 } },
  ],
};

type PageProps = { params: Promise<{ id: string }> };

export default async function AssignmentDetailPage({ params }: PageProps) {
  const { id } = await params;
  const a = FAKE_ASSIGNMENT;

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-sm text-[var(--muted)] transition hover:text-white">
            ← Home
          </Link>
          <Link
            href="/assignments/new"
            className="text-sm font-medium text-[var(--accent)] transition hover:brightness-110"
          >
            + New assignment
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-12">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--muted)]">
          Assignment detail · URL id: <span className="text-white/70">{id}</span> (shell)
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-sora)] text-3xl font-bold tracking-tight sm:text-4xl">
          {a.title}
        </h1>
        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-[var(--muted)]">
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-white/90">{a.subject}</span>
          <span className="rounded-full border border-[var(--accent)]/30 bg-[var(--accent)]/15 px-3 py-1 text-[var(--accent)]">
            {a.contextType === "rubric" ? "Rubric-based" : "Statement"}
          </span>
          <span>Created {a.createdAtLabel}</span>
        </div>

        <section className="mt-10 rounded-3xl border border-white/10 bg-[var(--card)] p-8 backdrop-blur-xl">
          <h2 className="font-[family-name:var(--font-sora)] text-lg font-semibold">Rubric / context</h2>
          <p className="mt-3 leading-relaxed text-[var(--muted)]">{a.contextPreview}</p>
        </section>

        <section className="mt-8">
          <h2 className="font-[family-name:var(--font-sora)] text-lg font-semibold">Drafts (preview)</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Scores and feedback will load from Firestore in a later week. Showing placeholder cards for the presentation shell.
          </p>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2">
            {a.draftsPreview.map((d) => (
              <li
                key={d.draftNumber}
                className="rounded-2xl border border-white/10 bg-black/25 p-5 transition hover:border-[var(--accent)]/35"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-white">Draft {d.draftNumber}</span>
                  <span className="text-xs text-[var(--muted)]">{d.submittedAt}</span>
                </div>
                <dl className="mt-4 grid grid-cols-2 gap-2 text-sm">
                  {(
                    [
                      ["Clarity", d.scores.clarity],
                      ["Structure", d.scores.structure],
                      ["Evidence", d.scores.evidence],
                      ["Depth", d.scores.depth],
                    ] as const
                  ).map(([label, val]) => (
                    <div key={label} className="flex justify-between rounded-lg bg-white/5 px-3 py-2">
                      <dt className="text-[var(--muted)]">{label}</dt>
                      <dd className="font-mono font-semibold text-[var(--accent-hot)]">{val}/10</dd>
                    </div>
                  ))}
                </dl>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
