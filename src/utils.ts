import { useEffect, useState } from "react";

// Generate or fetch a unique session hash for analytics tracking without cookies
export function getSessionHash(): string {
  let hash = localStorage.getItem("llmreview_session_hash");
  if (!hash) {
    hash = "sess_" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    localStorage.setItem("llmreview_session_hash", hash);
  }
  return hash;
}

// Log page view or scroll events to backend
export async function logAnalyticsEvent(eventType: 'page_view' | 'scroll_depth', postId: string | null = null) {
  try {
    const session_hash = getSessionHash();
    await fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        post_id: postId,
        session_hash,
        event_type: eventType
      })
    });
  } catch (err) {
    console.error("Analytics logging failed:", err);
  }
}

// Estimate reading time for block content
export function calculateReadingTime(blocks: any[]): number {
  let totalWords = 0;
  blocks.forEach((block) => {
    if (block.type === 'text' && block.value?.text) {
      totalWords += block.value.text.split(/\s+/).length;
    } else if (block.type === 'table' && block.value?.rows) {
      block.value.rows.forEach((row: string[]) => {
        row.forEach((cell) => {
          totalWords += cell.split(/\s+/).length;
        });
      });
    }
  });
  // Average reading speed: 200 words per minute
  return Math.max(1, Math.ceil(totalWords / 200));
}

// Custom simple navigation hook
export function usePath(): [string, (path: string) => void] {
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    const handlePopState = () => {
      setPath(window.location.pathname);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const navigate = (newPath: string) => {
    window.history.pushState(null, "", newPath);
    setPath(newPath);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return [path, navigate];
}
