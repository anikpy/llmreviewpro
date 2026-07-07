import { Shield, ShieldAlert, Award, FileSpreadsheet } from "lucide-react";

export default function About() {
  return (
    <div id="about-page" className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 animate-fade-in">
      <header className="mb-10 text-center">
        <h1 className="font-sans text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl dark:text-zinc-50">
          Editorial & Benchmarking Standards
        </h1>
        <p className="font-sans text-sm text-zinc-500 dark:text-zinc-400 mt-2.5 max-w-xl mx-auto">
          Transparency in LLM economics and agent routing. How we collect, verify, and normalize cost-to-reasoning matrices.
        </p>
      </header>

      <section className="flex flex-col gap-8">
        {/* Core Principles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-xl border border-zinc-150 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
            <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 flex items-center justify-center mb-3">
              <Shield className="h-4.5 w-4.5" />
            </div>
            <h3 className="font-sans text-sm font-bold text-zinc-900 dark:text-zinc-50 mb-1.5">No Sponsor Bias</h3>
            <p className="font-sans text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              We never accept payments to modify MMLU or cost benchmark rankings. All recommendations are mathematically derived.
            </p>
          </div>

          <div className="rounded-xl border border-zinc-150 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
            <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 flex items-center justify-center mb-3">
              <Award className="h-4.5 w-4.5" />
            </div>
            <h3 className="font-sans text-sm font-bold text-zinc-900 dark:text-zinc-50 mb-1.5">Rigorous Testing</h3>
            <p className="font-sans text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              We run autonomous state evaluation loops over multiple days using temperature standardizations of exactly 0.0.
            </p>
          </div>

          <div className="rounded-xl border border-zinc-150 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
            <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 flex items-center justify-center mb-3">
              <FileSpreadsheet className="h-4.5 w-4.5" />
            </div>
            <h3 className="font-sans text-sm font-bold text-zinc-900 dark:text-zinc-50 mb-1.5">Open Source Math</h3>
            <p className="font-sans text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Our Cost-to-Performance Ratio equations are fully public. We analyze prompt cache discounts & batch API scales.
            </p>
          </div>
        </div>

        {/* Detailed Criteria */}
        <div className="rounded-xl border border-zinc-150 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="font-sans text-base font-bold text-zinc-900 dark:text-zinc-50 mb-4 flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-emerald-500" />
            Benchmarking Criteria Details
          </h2>
          
          <div className="flex flex-col gap-5 text-xs text-zinc-600 dark:text-zinc-400 font-sans">
            <div>
              <h4 className="font-bold text-zinc-900 dark:text-zinc-200 mb-1">1. Academic Foundations (MMLU)</h4>
              <p className="leading-relaxed">
                Massive Multitask Language Understanding (MMLU) measures standard world knowledge across 57 subjects ranging from elementary mathematics to professional law. We use standard published metrics combined with local validation runs.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-zinc-900 dark:text-zinc-200 mb-1">2. Combined Economical Footprint</h4>
              <p className="leading-relaxed">
                Raw output is always more expensive than parsing input tokens. We compute a standardized API burden assuming an average agent loop executes with a 3:1 input-to-output token distribution. Combined price reflects this real-world weighting.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-zinc-900 dark:text-zinc-200 mb-1">3. Latency & Time-To-First-Token (TTFT)</h4>
              <p className="leading-relaxed">
                A model is only useful in production if its latency permits fast feedback. We measure routing latency and stream stability dynamically from multi-region cloud containers.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
