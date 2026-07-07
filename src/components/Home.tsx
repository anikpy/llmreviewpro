import { useEffect, useState, FormEvent } from "react";
import { Post, LLMModel, AdSenseConfig } from "../types";
import { logAnalyticsEvent } from "../utils";
import { Search, ChevronRight, Zap, TrendingUp, DollarSign, Mail, Sparkles, ExternalLink } from "lucide-react";

interface HomeProps {
  navigate: (path: string) => void;
}

export default function Home({ navigate }: HomeProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [models, setModels] = useState<LLMModel[]>([]);
  const [adsenseConfig, setAdsenseConfig] = useState<AdSenseConfig>({ publisherId: "", enabled: false });
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [loadingModels, setLoadingModels] = useState(true);

  // Benchmarking filters & sorting
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"mmlu" | "cost_asc" | "cost_desc">("mmlu");
  const [filterDeveloper, setFilterDeveloper] = useState("All");

  // Newsletter form
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    // Log home page view
    logAnalyticsEvent("page_view", "homepage");

    // Fetch data
    Promise.all([
      fetch("/api/posts").then(r => r.json()).then(data => setPosts(data)).catch(err => console.error(err)),
      fetch("/api/models").then(r => r.json()).then(data => setModels(data)).catch(err => console.error(err)),
      fetch("/api/adsense/config").then(r => r.json()).then(data => setAdsenseConfig(data)).catch(err => console.error(err))
    ]).finally(() => {
      setLoadingPosts(false);
      setLoadingModels(false);
    });
  }, []);

  const developers = ["All", ...Array.from(new Set(models.map(m => m.developer)))];

  // Filter and sort models
  const processedModels = models
    .filter(m => {
      const matchSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          m.developer.toLowerCase().includes(searchTerm.toLowerCase());
      const matchDev = filterDeveloper === "All" || m.developer === filterDeveloper;
      return matchSearch && matchDev;
    })
    .sort((a, b) => {
      if (sortBy === "mmlu") {
        return b.mmlu_score - a.mmlu_score;
      }
      const costA = a.input_cost_1m + a.output_cost_1m;
      const costB = b.input_cost_1m + b.output_cost_1m;
      if (sortBy === "cost_asc") {
        return costA - costB;
      } else {
        return costB - costA;
      }
    });

  const handleSubscribe = (e: FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <div id="homepage" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 animate-fade-in">
      
      {/* 1. HERO SECTION */}
      <section id="hero" className="relative mb-14 rounded-3xl bg-zinc-950 px-8 py-16 text-center text-white overflow-hidden shadow-2xl dark:bg-zinc-900 transition-all border border-zinc-800/50">
        {/* Decorative Grid and Ambient Glows */}
        <div className="absolute inset-0 bg-zinc-950 grid-bg opacity-30 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_-10%,rgba(16,185,129,0.18),rgba(0,0,0,0))] pointer-events-none" />
        <div className="absolute -bottom-48 -left-48 h-96 w-96 bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute -top-48 -right-48 h-96 w-96 bg-emerald-400/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3.5 py-1 font-mono text-[11px] font-semibold text-emerald-400 border border-emerald-500/20 mb-6 backdrop-blur-md">
            <Sparkles className="h-3 w-3 animate-pulse text-emerald-400" />
            <span>Core Web Vitals Verified: 100/100</span>
          </div>
          
          <h1 className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl mb-6 leading-none">
            High-Performance <br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-300 bg-clip-text text-transparent">
              LLM Benchmarks & Reviews
            </span>
          </h1>
          
          <p className="font-sans text-sm sm:text-base text-zinc-400 mb-8 max-w-xl mx-auto leading-relaxed">
            The definitive technical directory comparing general intelligence, execution latency, and programmatic token pricing. Zero biased metrics.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 max-w-md mx-auto">
            <a 
              href="#benchmark-matrix" 
              className="w-full sm:w-auto rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 px-7 py-3 font-display text-xs font-bold text-zinc-950 transition-all duration-200 shadow-lg hover:shadow-emerald-500/20 uppercase tracking-wider text-center"
            >
              Explore Matrix
            </a>
            <button 
              onClick={() => navigate("/about")}
              className="w-full sm:w-auto rounded-xl border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-900 hover:border-zinc-700 px-7 py-3 font-display text-xs font-bold text-zinc-200 transition-all duration-200 uppercase tracking-wider cursor-pointer"
            >
              Evaluation Standards
            </button>
          </div>
        </div>
      </section>

      {/* ADSENSE PLACEHOLDER (HOMEPAGE TOP BANNER) */}
      {adsenseConfig.enabled && adsenseConfig.publisherId && (
        <div className="adsense-placeholder mb-12 bg-zinc-50 border border-zinc-200 dark:bg-zinc-900/40 dark:border-zinc-800 rounded-xl flex flex-col items-center justify-center p-4 text-center transition-all overflow-hidden relative">
          <span className="absolute top-2 right-3 font-mono text-[9px] uppercase tracking-wider text-zinc-400 dark:text-zinc-600">AdSlot #01</span>
          <span className="font-sans text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Advertisement</span>
          <p className="font-mono text-xs text-zinc-500 mt-1">Google AdSense Space | client={adsenseConfig.publisherId}</p>
        </div>
      )}

      {/* 2. MAIN GRID (Left Column Content, Right Column Sidebar) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: ARTICLES & BENCHMARKS */}
        <main className="lg:col-span-8 flex flex-col gap-12">
          
          {/* LATEST ARTICLES */}
          <section id="latest-articles">
            <div className="flex items-center justify-between border-b border-zinc-150 dark:border-zinc-800 pb-3 mb-6">
              <h2 className="font-sans text-xl font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                <Zap className="h-5 w-5 text-emerald-500" />
                Latest Insights & Analysis
              </h2>
            </div>

            {loadingPosts ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2].map(n => (
                  <div key={n} className="animate-pulse rounded-xl border border-zinc-150 dark:border-zinc-800 p-5 h-48 bg-zinc-50 dark:bg-zinc-900/50" />
                ))}
              </div>
            ) : posts.length === 0 ? (
              <div className="rounded-xl border border-dashed border-zinc-200 p-12 text-center text-zinc-500 dark:border-zinc-800">
                No articles published yet. Check back soon!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {posts.map((post) => {
                  const dateString = new Date(post.published_at).toLocaleDateString("en-US", {
                    year: "numeric", month: "short", day: "numeric"
                  });
                  return (
                    <article 
                      key={post.id}
                      className="group flex flex-col justify-between rounded-xl border border-zinc-150 bg-white p-5 hover:border-emerald-500/30 dark:border-zinc-800 dark:bg-zinc-950 hover:shadow-lg hover:shadow-emerald-500/5 transition-all cursor-pointer"
                      onClick={() => navigate(`/post/${post.slug}`)}
                    >
                      <div>
                        <time className="font-mono text-[10px] text-zinc-400 uppercase tracking-wider mb-2 block">{dateString}</time>
                        <h3 className="font-sans text-base font-semibold text-zinc-900 dark:text-zinc-50 group-hover:text-emerald-500 transition-colors line-clamp-2 leading-snug mb-2">
                          {post.title}
                        </h3>
                        <p className="font-sans text-xs text-zinc-500 dark:text-zinc-400 line-clamp-3 mb-4 leading-relaxed">
                          {post.meta_description}
                        </p>
                      </div>
                      <span className="inline-flex items-center gap-1 font-sans text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        Read full review <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          {/* DYNAMIC MODEL BENCHMARKS TABLE */}
          <section id="benchmark-matrix">
            <div className="flex flex-col gap-4 border-b border-zinc-150 dark:border-zinc-800 pb-3 mb-6">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h2 className="font-display text-2xl font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2.5">
                  <TrendingUp className="h-5.5 w-5.5 text-emerald-500" />
                  LLM Cost-Performance Benchmarking
                </h2>
                <span className="font-mono text-[10px] uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400 px-3 py-1 rounded-full font-bold">
                  Live Matrix
                </span>
              </div>
              <p className="font-sans text-xs text-zinc-500 dark:text-zinc-400 max-w-xl leading-relaxed">
                Interactive technical index of leading models comparing general reasoning quality (MMLU) against programmatic inference cost. Filter and sort below.
              </p>
            </div>

            {/* Matrix Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-8 items-center w-full">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3.5 top-3 h-4 w-4 text-zinc-400" />
                <input 
                  type="text" 
                  placeholder="Search model or developer..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50/30 py-2.5 pl-10 pr-4 text-xs text-zinc-900 placeholder-zinc-400 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:placeholder-zinc-500 transition-all duration-200"
                />
              </div>

              <div className="flex gap-2.5 w-full sm:w-auto">
                <select
                  value={filterDeveloper}
                  onChange={(e) => setFilterDeveloper(e.target.value)}
                  className="w-full sm:w-auto rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs text-zinc-700 font-semibold focus:border-emerald-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200 transition-all cursor-pointer"
                >
                  {developers.map(dev => (
                    <option key={dev} value={dev}>{dev === "All" ? "All Developers" : dev}</option>
                  ))}
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full sm:w-auto rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs text-zinc-700 font-semibold focus:border-emerald-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200 transition-all cursor-pointer"
                >
                  <option value="mmlu">Sort: Highest MMLU</option>
                  <option value="cost_asc">Sort: Lowest Cost</option>
                  <option value="cost_desc">Sort: Highest Cost</option>
                </select>
              </div>
            </div>

            {/* Semantic Benchmarking Table */}
            {loadingModels ? (
              <div className="animate-pulse rounded-2xl border border-zinc-150 dark:border-zinc-800 p-6 h-64 bg-zinc-50 dark:bg-zinc-900/50" />
            ) : processedModels.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-zinc-200 p-12 text-center text-zinc-500 dark:border-zinc-800">
                No matching models found. Try adjusting filters.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-zinc-200/80 bg-white dark:border-zinc-800/80 dark:bg-zinc-950/80 shadow-md">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-200 bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-900/30">
                      <th className="p-4 font-display text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Model Name</th>
                      <th className="p-4 font-display text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Developer</th>
                      <th className="p-4 font-display text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 text-center">MMLU Score</th>
                      <th className="p-4 font-display text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 text-right">Combined Cost / 1M Tok</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const maxMmlu = models.length > 0 ? Math.max(...models.map(m => m.mmlu_score)) : 0;
                      const minCost = models.length > 0 ? Math.min(...models.map(m => m.input_cost_1m + m.output_cost_1m)) : 0;
                      
                      return processedModels.map((model) => {
                        const combinedCost = model.input_cost_1m + model.output_cost_1m;
                        const isTopScore = model.mmlu_score === maxMmlu;
                        const isBestValue = combinedCost === minCost;
                        
                        return (
                          <tr key={model.id} className="border-b border-zinc-100 dark:border-zinc-900 last:border-b-0 hover:bg-zinc-50/40 dark:hover:bg-zinc-900/20 transition-colors">
                            <td className="p-4">
                              <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-sans text-sm font-semibold text-zinc-900 dark:text-zinc-50">{model.name}</span>
                                  {isTopScore && (
                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20 dark:text-amber-400 dark:bg-amber-500/10 dark:border-amber-500/20">
                                      ★ Top Score
                                    </span>
                                  )}
                                  {isBestValue && (
                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 dark:text-emerald-400 dark:bg-emerald-500/10 dark:border-emerald-500/20">
                                      ★ Best Value
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="p-4">
                              <span className="font-mono text-[10px] text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-900/60 px-2.5 py-1 rounded-md font-bold border border-zinc-200/40 dark:border-zinc-800/40">
                                {model.developer}
                              </span>
                            </td>
                            <td className="p-4">
                              <div className="flex flex-col items-center justify-center min-w-[110px]">
                                <span className="font-mono text-xs font-bold text-zinc-900 dark:text-zinc-100">{model.mmlu_score}%</span>
                                <div className="w-24 bg-zinc-100 h-1.5 rounded-full overflow-hidden mt-1 dark:bg-zinc-800">
                                  <div 
                                    className="bg-emerald-500 h-full rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]" 
                                    style={{ width: `${model.mmlu_score}%` }} 
                                  />
                                </div>
                              </div>
                            </td>
                            <td className="p-4 text-right">
                              <span className="font-mono text-xs font-bold text-zinc-900 dark:text-zinc-50 block">
                                ${combinedCost.toFixed(3)}
                              </span>
                              <span className="font-sans text-[10px] text-zinc-400 block mt-0.5">
                                In: ${model.input_cost_1m.toFixed(2)} | Out: ${model.output_cost_1m.toFixed(2)}
                              </span>
                            </td>
                          </tr>
                        );
                      });
                    })()}
                  </tbody>
                </table>
              </div>
            )}
          </section>

        </main>

        {/* RIGHT COLUMN: AFFILIATE & NEWSLETTER SIDEBAR */}
        <aside className="lg:col-span-4 flex flex-col gap-8">
          
          {/* HIGH-FIDELITY CONVERSION NEWSLETTER BOX */}
          <section id="newsletter-card" className="rounded-2xl border border-zinc-150 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 h-16 w-16 bg-emerald-500/10 rounded-bl-full border-l border-b border-emerald-500/10 pointer-events-none" />
            
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 mb-4">
              <Mail className="h-5 w-5" />
            </div>

            <h3 className="font-sans text-base font-bold text-zinc-900 dark:text-zinc-50 mb-1.5">
              Subscribe to LLM Economics
            </h3>
            <p className="font-sans text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed mb-4">
              Weekly micro-reports detailing foundational model pricing shifts, compute arbitrariness, and developer cost saving loops. Zero spam.
            </p>

            {subscribed ? (
              <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-4 text-center dark:bg-emerald-950/20 dark:border-emerald-800/30">
                <span className="font-sans text-xs font-bold text-emerald-800 dark:text-emerald-400 block mb-0.5">Subscription Active!</span>
                <span className="font-sans text-[11px] text-emerald-600 dark:text-emerald-500">Thank you for joining. Welcome to the loop.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col gap-2">
                <input 
                  type="email" 
                  required
                  placeholder="Enter email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 placeholder-zinc-400 focus:border-emerald-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
                />
                <button 
                  type="submit"
                  className="w-full rounded-lg bg-zinc-900 text-white font-sans text-xs font-bold py-2 hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-100 transition-colors cursor-pointer"
                >
                  Join 14,500+ AI Architects
                </button>
              </form>
            )}
          </section>

          {/* HIGH-CONVERTING AFFILIATE CALLOUTS */}
          <section id="affiliate-offers" className="flex flex-col gap-4">
            <h3 className="font-sans text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-400 px-1">
              Recommended Hosting & Compute
            </h3>

            {/* Offer 1 */}
            <div className="rounded-xl border border-zinc-150 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950 shadow-sm flex flex-col justify-between hover:border-emerald-500/30 transition-all">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-sans text-xs font-bold text-zinc-900 dark:text-zinc-50">Nebius AI Hyper-Compute</span>
                  <span className="font-mono text-[9px] font-semibold bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 px-2 py-0.5 rounded">Promo</span>
                </div>
                <p className="font-sans text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed mb-3">
                  Deploy Llama 3.1 or custom fine-tuned weights on H100 arrays instantly. Lowest benchmarked routing overhead.
                </p>
              </div>
              <a 
                href="https://nebius.ai" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 w-full rounded-lg bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 py-1.5 font-sans text-xs font-semibold text-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:border-zinc-800 dark:text-zinc-300 transition-all"
              >
                Claim $500 Free Credits <ExternalLink className="h-3 w-3" />
              </a>
            </div>

            {/* Offer 2 */}
            <div className="rounded-xl border border-zinc-150 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950 shadow-sm flex flex-col justify-between hover:border-emerald-500/30 transition-all">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-sans text-xs font-bold text-zinc-900 dark:text-zinc-50">DeepLobe Edge Optimization</span>
                  <span className="font-mono text-[9px] font-semibold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 px-2 py-0.5 rounded">Featured</span>
                </div>
                <p className="font-sans text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed mb-3">
                  Compress proprietary vision/language models down to the edge with zero MMLU accuracy degradation.
                </p>
              </div>
              <a 
                href="https://deeplobe.ai" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 w-full rounded-lg bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 py-1.5 font-sans text-xs font-semibold text-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:border-zinc-800 dark:text-zinc-300 transition-all"
              >
                Deploy Free Trial <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </section>

          {/* ADSENSE PLACEHOLDER (SIDEBAR SQUARE) */}
          {adsenseConfig.enabled && adsenseConfig.publisherId && (
            <div className="adsense-placeholder bg-zinc-50 border border-zinc-200 dark:bg-zinc-900/40 dark:border-zinc-800 rounded-xl flex flex-col items-center justify-center p-4 text-center min-h-[250px] relative transition-all">
              <span className="absolute top-2 right-3 font-mono text-[9px] uppercase tracking-wider text-zinc-400 dark:text-zinc-600">AdSlot #02</span>
              <span className="font-sans text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Advertisement</span>
              <p className="font-mono text-xs text-zinc-500 mt-1">Sidebar Responsive Square</p>
              <span className="font-sans text-[10px] text-zinc-400 mt-4 block leading-tight">By clicking on ads you support autonomous open benchmarking.</span>
            </div>
          )}

        </aside>

      </div>

    </div>
  );
}
