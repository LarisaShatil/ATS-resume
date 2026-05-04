import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          ATS Resume
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
          Paste your master profile, generate editable sections, preview an
          ATS-friendly resume, and export to PDF.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Link
            href="/resume-generator"
            className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
          >
            Open Resume Generator
          </Link>
          <p className="text-xs text-slate-500">
            Drafts are saved locally in your browser.
          </p>
        </div>
      </div>
    </main>
  );
}
