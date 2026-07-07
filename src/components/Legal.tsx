import { ShieldAlert, Cookie, Info } from "lucide-react";

interface LegalProps {
  type: "privacy" | "terms";
}

export default function Legal({ type }: LegalProps) {
  if (type === "privacy") {
    return (
      <div id="privacy-page" className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8 animate-fade-in font-sans">
        <header className="mb-8">
          <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 sm:text-3xl dark:text-zinc-50 flex items-center gap-2">
            <Cookie className="h-6 w-6 text-emerald-500" />
            Privacy Policy
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5">
            Last Updated: July 7, 2026. Explicitly compliant with Google AdSense and CCPA/GDPR regulations.
          </p>
        </header>

        <div className="prose prose-sm dark:prose-invert text-xs text-zinc-600 dark:text-zinc-400 flex flex-col gap-6 leading-relaxed">
          <section className="bg-zinc-50 p-4 rounded-xl border border-zinc-150 dark:bg-zinc-900/40 dark:border-zinc-800 flex items-start gap-2">
            <Info className="h-4.5 w-4.5 text-emerald-600 mt-0.5 shrink-0" />
            <p className="text-[11px] text-zinc-500">
              <strong>AdSense Compliant Notice:</strong> This privacy statement is generated specifically to satisfy third-party publisher guidelines. It provides clear disclosures on cookies, advertising tracking, and how you can exercise your consent choices.
            </p>
          </section>

          <section>
            <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-2">1. Information Collection</h2>
            <p>
              We do not collect any personal identity details or require account registrations. The website logs anonymous statistical interactions (page views and scroll depth metrics) directly to our local container store. These logs do not contain IP addresses or identifiable user hashes.
            </p>
          </section>

          <section>
            <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-2">2. Google AdSense & Third-Party Advertising</h2>
            <p className="mb-2">
              Google, as a third-party vendor, uses cookies to serve advertisements on LLMReviewPro.com. Google's use of advertising cookies enables it and its partners to serve ads to our users based on their visits to our site or other sites on the Internet.
            </p>
            <p>
              You may opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-emerald-600 dark:text-emerald-400 font-semibold underline">Google Ad Settings</a> or by navigating to standard consent frameworks in your browser.
            </p>
          </section>

          <section>
            <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-2">3. Log Files and Analytical Cookies</h2>
            <p>
              We utilize a non-tracking, cryptographically salted localStorage session hash (`llmreview_session_hash`) solely to prevent double-counting analytics and layout shifts. This token is stored purely client-side on your own browser environment.
            </p>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div id="terms-page" className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8 animate-fade-in font-sans">
      <header className="mb-8">
        <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 sm:text-3xl dark:text-zinc-50 flex items-center gap-2">
          <ShieldAlert className="h-6 w-6 text-emerald-500" />
          Terms of Service
        </h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5">
          Last Updated: July 7, 2026.
        </p>
      </header>

      <div className="prose prose-sm dark:prose-invert text-xs text-zinc-600 dark:text-zinc-400 flex flex-col gap-6 leading-relaxed">
        <section>
          <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-2">1. Agreement to Terms</h2>
          <p>
            By accessing LLMReviewPro.com, you agree to comply with and be bound by these Terms of Service. If you do not agree, please do not use our benchmarking platform.
          </p>
        </section>

        <section>
          <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-2">2. Accuracy of Benchmark Data</h2>
          <p>
            All benchmarks (including MMLU ratings and input/output cost profiles) are provided for general educational purposes. LLM provider pricing is volatile and subject to immediate, unannounced changes. We make no warranty regarding real-time production viability.
          </p>
        </section>

        <section>
          <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-2">3. Limitations of Liability</h2>
          <p>
            In no event shall LLMReviewPro.com or its authors be liable for any computing runaways, tool-calling financial damages, or server downtime resulting from implementing agent routing architectures reviewed on this site.
          </p>
        </section>
      </div>
    </div>
  );
}
