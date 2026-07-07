import { useEffect, useState } from "react";
import { usePath } from "./utils";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./components/Home";
import PostDetail from "./components/PostDetail";
import About from "./components/About";
import Contact from "./components/Contact";
import Legal from "./components/Legal";
import Admin from "./components/Admin";
import { Info, ArrowRight } from "lucide-react";

export default function App() {
  const [path, navigate] = usePath();
  const [isAdmin, setIsAdmin] = useState(false);

  // Poll or fetch admin status to show contextual edit buttons / indicator
  const checkAdminStatus = async () => {
    try {
      const res = await fetch("/api/admin/me");
      const data = await res.json();
      setIsAdmin(data.isAdmin);
    } catch (e) {
      setIsAdmin(false);
    }
  };

  useEffect(() => {
    checkAdminStatus();
    
    // Add path change listener to re-verify status in case of login/logout
    const handleRouteChange = () => {
      checkAdminStatus();
    };
    window.addEventListener("popstate", handleRouteChange);
    return () => window.removeEventListener("popstate", handleRouteChange);
  }, []);

  // Simple clean Router logic
  let view = null;

  if (path === "/") {
    view = <Home navigate={navigate} />;
  } else if (path.startsWith("/post/")) {
    const slug = path.slice(6); // remove "/post/"
    view = <PostDetail slug={slug} navigate={navigate} />;
  } else if (path === "/about") {
    view = <About />;
  } else if (path === "/contact") {
    view = <Contact />;
  } else if (path === "/privacy-policy") {
    view = <Legal type="privacy" />;
  } else if (path === "/terms") {
    view = <Legal type="terms" />;
  } else if (path === "/admin") {
    view = <Admin navigate={navigate} />;
  } else {
    // 404 View
    view = (
      <div id="not-found-screen" className="mx-auto max-w-md px-4 py-16 text-center animate-fade-in font-sans">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-50 mb-4">
          <Info className="h-6 w-6" />
        </div>
        <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Invalid Route Path</h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">
          The requested path <code className="font-mono bg-zinc-100 px-1.5 py-0.5 rounded dark:bg-zinc-900">{path}</code> does not correspond to an automated discoverability or public sitemap page.
        </p>
        <button
          onClick={() => navigate("/")}
          className="mt-6 inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 text-white px-4 py-2 text-xs font-semibold hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-100 transition-colors cursor-pointer"
        >
          Return to Matrix <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50 transition-colors duration-200">
      {/* Persisting Header */}
      <Header currentPath={path} navigate={navigate} isAdmin={isAdmin} />

      {/* Primary Page Content Wrapper */}
      <div className="flex-grow">
        {view}
      </div>

      {/* Persisting Footer */}
      <Footer navigate={navigate} />
    </div>
  );
}
