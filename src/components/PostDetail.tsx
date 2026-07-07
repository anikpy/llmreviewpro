import { useEffect, useState } from "react";
import { Post, AdSenseConfig } from "../types";
import { logAnalyticsEvent, calculateReadingTime } from "../utils";
import { ArrowLeft, BookOpen, Share2, Copy, Check, Info, FileText } from "lucide-react";

interface PostDetailProps {
  slug: string;
  navigate: (path: string) => void;
}

export default function PostDetail({ slug, navigate }: PostDetailProps) {
  const [post, setPost] = useState<Post | null>(null);
  const [adsenseConfig, setAdsenseConfig] = useState<AdSenseConfig>({ publisherId: "", enabled: false });
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Log post view
    logAnalyticsEvent("page_view", slug);

    // Fetch post and adsense config
    Promise.all([
      fetch(`/api/posts/${slug}`).then(r => {
        if (!r.ok) throw new Error("Post not found");
        return r.json();
      }),
      fetch("/api/adsense/config").then(r => r.json())
    ])
      .then(([postData, adsenseData]) => {
        setPost(postData);
        setAdsenseConfig(adsenseData);
      })
      .catch((err) => {
        console.error("Error loading post:", err);
      })
      .finally(() => {
        setLoading(false);
      });

    // Tracking scroll depth event
    const handleScroll = () => {
      const threshold = document.documentElement.scrollHeight - window.innerHeight - 300;
      if (window.scrollY > threshold) {
        logAnalyticsEvent("scroll_depth", slug);
        window.removeEventListener("scroll", handleScroll); // trigger once
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [slug]);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center animate-fade-in">
        <div className="animate-pulse flex flex-col gap-4">
          <div className="h-6 w-32 bg-zinc-200 dark:bg-zinc-800 rounded mx-auto" />
          <div className="h-10 w-2/3 bg-zinc-200 dark:bg-zinc-800 rounded mx-auto" />
          <div className="h-4 w-1/3 bg-zinc-200 dark:bg-zinc-800 rounded mx-auto mt-4" />
          <div className="h-96 bg-zinc-100 dark:bg-zinc-900 rounded-xl mt-10" />
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center animate-fade-in">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 mb-4 dark:bg-red-950/30 dark:text-red-400">
          <Info className="h-6 w-6" />
        </div>
        <h2 className="font-sans text-xl font-bold text-zinc-900 dark:text-zinc-50">Review Not Found</h2>
        <p className="font-sans text-sm text-zinc-500 dark:text-zinc-400 mt-2">
          The benchmarking review slug you are looking for does not exist or is currently in draft mode.
        </p>
        <button
          onClick={() => navigate("/")}
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-zinc-900 text-white px-4 py-2 font-sans text-xs font-semibold hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-100 transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Benchmarks
        </button>
      </div>
    );
  }

  const readingTime = calculateReadingTime(post.content || []);

  // Filter headings for the sticky table of contents (TOC)
  const headings = (post.content || [])
    .filter(block => block.type === "text" && (block.value as any).level > 0)
    .map((block, index) => ({
      id: `heading-${index}`,
      text: (block.value as any).text,
      level: (block.value as any).level
    }));

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareUrl = encodeURIComponent(window.location.href);
  const shareTitle = encodeURIComponent(post.title);

  return (
    <div id="post-detail-page" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 animate-fade-in">
      
      {/* Back button */}
      <button 
        onClick={() => navigate("/")}
        className="inline-flex items-center gap-1.5 font-sans text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 mb-6 cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" /> Back to all Benchmarks
      </button>

      {/* ARTICLE LAYOUT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* LEFT COLUMN: STATIC / STICKY TABLE OF CONTENTS */}
        <aside className="hidden lg:block lg:col-span-3 sticky top-20 flex flex-col gap-6">
          {headings.length > 0 && (
            <div className="rounded-xl border border-zinc-150 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950 shadow-sm">
              <h4 className="font-sans text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-3 flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-emerald-500" />
                Table of Contents
              </h4>
              <nav className="flex flex-col gap-2">
                {headings.map((h) => (
                  <a 
                    key={h.id}
                    href={`#${h.id}`}
                    className={`font-sans text-xs text-zinc-500 hover:text-emerald-500 transition-colors line-clamp-1 dark:text-zinc-400 dark:hover:text-emerald-400 ${
                      h.level === 3 ? "pl-3 text-[11px]" : "font-semibold"
                    }`}
                  >
                    {h.text}
                  </a>
                ))}
              </nav>
            </div>
          )}

          {/* ADSENSE PLACEHOLDER (STICKY SIDEBAR AD) */}
          {adsenseConfig.enabled && adsenseConfig.publisherId && (
            <div className="adsense-placeholder bg-zinc-50 border border-zinc-200 dark:bg-zinc-900/40 dark:border-zinc-800 rounded-xl flex flex-col items-center justify-center p-4 text-center min-h-[300px] relative transition-all">
              <span className="absolute top-2 right-3 font-mono text-[9px] uppercase tracking-wider text-zinc-400 dark:text-zinc-600">AdSlot #03</span>
              <span className="font-sans text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Advertisement</span>
              <p className="font-mono text-xs text-zinc-500 mt-1">Sticky Post Sidebar</p>
            </div>
          )}
        </aside>

        {/* CENTER COLUMN: LONG-FORM ARTICLE CONTENT */}
        <article className="lg:col-span-9 max-w-3xl mx-auto w-full">
          
          {/* Header Metadata */}
          <header className="mb-8 border-b border-zinc-100 dark:border-zinc-900 pb-6">
            <h1 className="font-sans text-2xl font-extrabold tracking-tight text-zinc-950 sm:text-3xl lg:text-4xl leading-tight dark:text-zinc-50 mb-4">
              {post.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400 font-sans">
              <span className="bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400 px-2.5 py-1 rounded-full font-semibold">
                Autonomous Review
              </span>
              <span className="flex items-center gap-1">
                <BookOpen className="h-3.5 w-3.5" />
                {readingTime} min read
              </span>
              <span>•</span>
              <time>{new Date(post.published_at).toLocaleDateString("en-US", {
                year: "numeric", month: "long", day: "numeric"
              })}</time>
            </div>
          </header>

          {/* Render Block-Based Contents */}
          <div id="article-prose" className="prose dark:prose-invert max-w-none flex flex-col gap-6">
            {post.content && post.content.map((block, index) => {
              // Inject an inline ad block right in the middle of blocks (e.g. at index 3 or 4)
              const showAdAfterThisBlock = index === 2 && adsenseConfig.enabled && adsenseConfig.publisherId;

              return (
                <div key={block.id} className="w-full">
                  
                  {/* TEXT BLOCK */}
                  {block.type === "text" && (
                    <>
                      {(block.value as any).level === 2 && (
                        <h2 id={`heading-${index}`} className="font-sans text-xl font-bold text-zinc-950 dark:text-zinc-50 mt-4 mb-2 tracking-tight">
                          {(block.value as any).text}
                        </h2>
                      )}
                      {(block.value as any).level === 3 && (
                        <h3 id={`heading-${index}`} className="font-sans text-lg font-bold text-zinc-900 dark:text-zinc-100 mt-3 mb-2 tracking-tight">
                          {(block.value as any).text}
                        </h3>
                      )}
                      {((block.value as any).level === 0 || !(block.value as any).level) && (
                        <p className="font-sans text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed text-justify mb-4">
                          {(block.value as any).text}
                        </p>
                      )}
                    </>
                  )}

                  {/* TABLE BLOCK */}
                  {block.type === "table" && (
                    <div className="overflow-x-auto my-6 rounded-xl border border-zinc-150 bg-white dark:border-zinc-800 dark:bg-zinc-950 shadow-sm">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-zinc-150 bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-900/30">
                            {(block.value as any).headers && (block.value as any).headers.map((h: string, hIdx: number) => (
                              <th key={hIdx} className="p-3 font-sans text-xs font-semibold text-zinc-700 dark:text-zinc-300">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {(block.value as any).rows && (block.value as any).rows.map((row: string[], rIdx: number) => (
                            <tr key={rIdx} className="border-b border-zinc-100 dark:border-zinc-900 last:border-b-0 hover:bg-zinc-50/40 dark:hover:bg-zinc-900/20">
                              {row.map((cell: string, cIdx: number) => (
                                <td key={cIdx} className="p-3 font-sans text-xs text-zinc-600 dark:text-zinc-400 font-medium">{cell}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* IMAGE BLOCK */}
                  {block.type === "image" && (
                    <figure className="my-6">
                      <img 
                        src={(block.value as any).url} 
                        alt={(block.value as any).alt} 
                        loading="lazy" 
                        className="w-full rounded-xl object-cover max-h-[380px] shadow-sm"
                        referrerPolicy="no-referrer"
                      />
                      {(block.value as any).caption && (
                        <figcaption className="text-center font-sans text-xs text-zinc-400 mt-2.5 leading-relaxed italic dark:text-zinc-500">
                          {(block.value as any).caption}
                        </figcaption>
                      )}
                    </figure>
                  )}

                  {/* INLINE AD INJECTION SLOT (ADSENSE COMPLIANT) */}
                  {showAdAfterThisBlock && (
                    <div className="adsense-placeholder my-8 bg-zinc-50 border border-zinc-200 dark:bg-zinc-900/40 dark:border-zinc-800 rounded-xl flex flex-col items-center justify-center p-4 text-center transition-all overflow-hidden relative">
                      <span className="absolute top-2 right-3 font-mono text-[9px] uppercase tracking-wider text-zinc-400 dark:text-zinc-600">AdSlot #04</span>
                      <span className="font-sans text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Advertisement</span>
                      <p className="font-mono text-xs text-zinc-500 mt-1">Google AdSense Inline Block | Publisher ID: {adsenseConfig.publisherId}</p>
                    </div>
                  )}

                </div>
              );
            })}
          </div>

          {/* SHARING ACTIONS & SOCIAL ENGAGEMENT */}
          <section id="social-share" className="mt-12 border-t border-zinc-200 dark:border-zinc-900 pt-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-1 text-zinc-500 text-xs font-sans dark:text-zinc-400">
              <Share2 className="h-4 w-4" />
              <span>Genuinely trackless sharing:</span>
            </div>

            <div className="flex items-center gap-2">
              {/* Twitter/X pure anchor share */}
              <a 
                href={`https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareTitle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3.5 py-1.5 font-sans text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900"
              >
                {/* SVG for X */}
                <svg className="h-3 w-3 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                Share
              </a>

              {/* LinkedIn pure anchor share */}
              <a 
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3.5 py-1.5 font-sans text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900"
              >
                {/* SVG for LinkedIn */}
                <svg className="h-3 w-3 fill-current" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
                Post
              </a>

              {/* Link copy trigger */}
              <button 
                onClick={handleCopyLink}
                className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3.5 py-1.5 font-sans text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900 cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5 text-zinc-500" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>
            </div>
          </section>

        </article>

      </div>

    </div>
  );
}
