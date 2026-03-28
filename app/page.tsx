import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <span className="font-[family-name:var(--font-sora)] text-lg font-semibold tracking-tight">
            Critique<span className="text-[var(--accent-hot)]">AI</span>
          </span>
          <nav className="flex gap-4 text-sm text-[var(--muted)]">
            <Link href="/assignments/new" className="hover:text-white transition-colors">
              New assignment
            </Link>
            <Link href="/assignments/sample-101" className="hover:text-white transition-colors">
              View sample
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto flex max-w-5xl flex-1 flex-col justify-center px-6 py-20">
        <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-[var(--accent)]">
          AI assignment feedback
        </p>
        <h1 className="font-[family-name:var(--font-sora)] text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
          Turn rubrics into clear, actionable feedback.
        </h1>
        <p className="mt-6 max-w-xl text-lg text-[var(--muted)]">
          Your team is building the pipeline. This week: create assignments and preview the detail view.
        </p>
        <div className="mt-10 flex flex-wrap gap-4">
          <Link
            href="/assignments/new"
            className="inline-flex items-center justify-center rounded-xl bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[var(--ring)] transition hover:brightness-110"
          >
            Create assignment
          </Link>
          <Link
            href="/assignments/sample-101"
            className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/10"
          >
            Open detail shell
          </Link>
        </div>
      </main>
    </div>
  );
}
