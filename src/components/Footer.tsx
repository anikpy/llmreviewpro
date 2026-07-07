import { Cpu } from "lucide-react";

interface FooterProps {
  navigate: (path: string) => void;
}

export default function Footer({ navigate }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer id="main-footer" className="mt-auto border-t border-zinc-150 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 transition-colors duration-200">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          
          {/* Brand info */}
          <div className="flex flex-col gap-2">
            <div 
              className="flex items-center gap-2.5 cursor-pointer text-zinc-900 dark:text-zinc-50"
              onClick={() => navigate("/")}
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-tr from-emerald-500 to-teal-500 text-zinc-950 shadow-sm shadow-emerald-500/10">
                <Cpu className="h-3.5 w-3.5 text-zinc-950 font-bold" />
              </div>
              <span className="font-display font-bold text-base tracking-tight">LLMReview<span className="text-emerald-500 font-mono">Pro</span></span>
            </div>
            <p className="font-sans text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-xs">
              Autonomous Benchmarks, LLM Economics, and Production-Grade AI Agent Reviews. Built for speed and performance.
            </p>
          </div>

          {/* Quick Legal Compliance Links */}
          <div className="flex flex-col gap-2">
            <h4 className="font-sans text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
              Compliance & Legal
            </h4>
            <div className="flex flex-col gap-1.5">
              <button 
                onClick={() => navigate("/privacy-policy")}
                className="w-fit text-left font-sans text-xs text-zinc-500 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-200 cursor-pointer"
              >
                Privacy Policy (AdSense Compliant)
              </button>
              <button 
                onClick={() => navigate("/terms")}
                className="w-fit text-left font-sans text-xs text-zinc-500 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-200 cursor-pointer"
              >
                Terms of Service
              </button>
              <button 
                onClick={() => navigate("/about")}
                className="w-fit text-left font-sans text-xs text-zinc-500 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-200 cursor-pointer"
              >
                Editorial Standards
              </button>
            </div>
          </div>

          {/* AdSense Regulatory disclosures */}
          <div className="flex flex-col gap-2">
            <h4 className="font-sans text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
              Advertising Disclosures
            </h4>
            <p className="font-sans text-[11px] leading-relaxed text-zinc-400 dark:text-zinc-500">
              We serve cookies and partner with Google AdSense to deliver personalized advertisements. Third-party vendors use cookies to serve ads based on prior website visits. You can opt out of personalized advertising by visiting Google Ad Settings.
            </p>
          </div>

        </div>

        {/* Footer bottom */}
        <div className="mt-8 border-t border-zinc-200 dark:border-zinc-900 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-sans text-[11px] text-zinc-400 dark:text-zinc-500">
            &copy; {currentYear} LLMReviewPro.com. All rights reserved. No layout shifts (CLS=0).
          </p>
          <div className="flex items-center gap-3">
            <a href="/sitemap.xml" target="_blank" className="font-mono text-[10px] text-zinc-400 hover:text-emerald-500 dark:text-zinc-500 dark:hover:text-emerald-400">
              [Sitemap XML]
            </a>
            <a href="/robots.txt" target="_blank" className="font-mono text-[10px] text-zinc-400 hover:text-emerald-500 dark:text-zinc-500 dark:hover:text-emerald-400">
              [Robots TXT]
            </a>
            <a href="/ads.txt" target="_blank" className="font-mono text-[10px] text-zinc-400 hover:text-emerald-500 dark:text-zinc-500 dark:hover:text-emerald-400">
              [Ads TXT]
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
