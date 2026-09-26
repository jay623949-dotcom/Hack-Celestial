export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-950 text-white">
      <div className="max-w-2xl w-full text-center space-y-8 p-10 bg-slate-800/60 border border-slate-700/60 rounded-2xl shadow-2xl backdrop-blur-sm">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          Phase 0 Foundation ✓
        </div>

        <div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-sky-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent">
            RESORT 360
          </h1>
          <p className="mt-3 text-lg text-slate-300 font-medium">
            AI-Powered Resort Operations Platform
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 text-left pt-4 border-t border-slate-700/60 text-sm">
          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-700/40">
            <span className="text-xs text-slate-400 block uppercase font-mono">Frontend</span>
            <span className="font-semibold text-sky-400">Next.js App Router (Active)</span>
          </div>
          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-700/40">
            <span className="text-xs text-slate-400 block uppercase font-mono">Backend</span>
            <span className="font-semibold text-emerald-400">Express API (:5000)</span>
          </div>
        </div>

        <p className="text-xs text-slate-400">
          Ready for parallel feature development on individual branches.
        </p>
      </div>
    </main>
  );
}
