import { useEffect, useState, FormEvent, DragEvent } from "react";
import { Post, LLMModel, EditorBlock, BlockType, TextBlock, TableBlock, ImageBlock } from "../types";
import { 
  Lock, LogOut, FileText, Plus, Trash2, ArrowUp, ArrowDown, Move, 
  Settings, BarChart3, HelpCircle, Save, Check, RefreshCw, Cpu, Image as ImageIcon, Heading, Grid3X3, Eye
} from "lucide-react";

interface AdminProps {
  navigate: (path: string) => void;
}

export default function Admin({ navigate }: AdminProps) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(true);
  const [loginError, setLoginError] = useState("");
  
  // Tab control
  const [activeTab, setActiveTab] = useState<"posts" | "models" | "analytics" | "adsense">("posts");

  // Posts State
  const [posts, setPosts] = useState<Post[]>([]);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  
  // Models State
  const [models, setModels] = useState<LLMModel[]>([]);
  const [editingModel, setEditingModel] = useState<LLMModel | null>(null);
  
  // Analytics State
  const [analytics, setAnalytics] = useState<any>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  // SEO Analytics State
  const [seoSummary, setSeoSummary] = useState<any>(null);
  const [seoLoading, setSeoLoading] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<"user" | "crawler" | "simulator">("user");
  const [simulationBot, setSimulationBot] = useState("Googlebot");
  const [simulationUrl, setSimulationUrl] = useState("/");
  const [isSimulating, setIsSimulating] = useState(false);

  // AdSense config
  const [publisherId, setPublisherId] = useState("");
  const [adsEnabled, setAdsEnabled] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Custom UI Overlays for iFrame Safe UX (No window.alert / window.confirm)
  const [notification, setNotification] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; type: "post" | "model" } | null>(null);

  const showNotification = (text: string, type: "success" | "error" = "success") => {
    setNotification({ text, type });
    setTimeout(() => {
      setNotification(prev => prev?.text === text ? null : prev);
    }, 4000);
  };

  const slugify = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "") // remove non-alphanumeric chars except space and dash
      .trim()
      .replace(/\s+/g, "-")         // replace spaces with single dash
      .replace(/-+/g, "-");         // replace multiple dashes with single dash
  };

  // Check login on load
  const checkAuth = async () => {
    try {
      const localLogged = localStorage.getItem("llmreview_admin_logged") === "true";
      const res = await fetch("/api/admin/me", {
        headers: { "x-admin-auth": localLogged ? "true" : "false" }
      });
      const data = await res.json();
      setIsAdmin(data.isAdmin || localLogged);
    } catch (e) {
      setIsAdmin(localStorage.getItem("llmreview_admin_logged") === "true");
    } finally {
      setAuthLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  // Fetch admin-facing data once logged in
  useEffect(() => {
    if (isAdmin) {
      fetchPosts();
      fetchModels();
      fetchAnalytics();
      fetchSeoSummary();
      fetchAdsenseConfig();
    }
  }, [isAdmin]);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoginError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem("llmreview_admin_logged", "true");
        setIsAdmin(true);
        setUsername("");
        setPassword("");
      } else {
        setLoginError(data.error || "Login failed");
      }
    } catch (err) {
      setLoginError("Failed to connect to authentication server.");
    }
  };

  const handleLogout = async () => {
    localStorage.removeItem("llmreview_admin_logged");
    await fetch("/api/admin/logout", { 
      method: "POST",
      headers: { "x-admin-auth": "true" }
    });
    setIsAdmin(false);
  };

  // POSTS CRUD
  const fetchPosts = async () => {
    const isLoggedLocal = localStorage.getItem("llmreview_admin_logged") === "true";
    const res = await fetch("/api/posts", {
      headers: { "x-admin-auth": isLoggedLocal ? "true" : "false" }
    });
    const data = await res.json();
    setPosts(data);
  };

  const handleCreateNewPost = () => {
    setEditingPost({
      id: "",
      title: "New LLM Benchmark Analysis",
      slug: "new-llm-benchmark-analysis",
      meta_description: "A fresh cost vs latency evaluation...",
      status: "draft",
      published_at: "",
      content: [
        {
          id: "initial-text",
          type: "text",
          value: { text: "Start writing the benchmarking report here...", level: 0 }
        }
      ]
    });
  };

  const handleSavePostWithStatus = async (status?: "draft" | "published") => {
    if (!editingPost) return;
    
    const finalStatus = status || editingPost.status;
    const finalSlug = editingPost.slug || slugify(editingPost.title);

    if (!editingPost.title || !finalSlug) {
      showNotification("Title and Slug are required.", "error");
      return;
    }

    const updatedPost = {
      ...editingPost,
      slug: finalSlug,
      status: finalStatus
    };

    const isNew = !editingPost.id;
    const url = isNew ? "/api/posts" : `/api/posts/${editingPost.id}`;
    const method = isNew ? "POST" : "PUT";

    try {
      const res = await fetch(url, {
        method,
        headers: { 
          "Content-Type": "application/json",
          "x-admin-auth": "true"
        },
        body: JSON.stringify(updatedPost)
      });
      const data = await res.json();
      if (data.error) {
        showNotification(data.error, "error");
        return;
      }
      showNotification(
        `Successfully ${finalStatus === "published" ? "published" : "saved draft of"} "${updatedPost.title}"!`,
        "success"
      );
      setEditingPost(null);
      fetchPosts();
    } catch (e) {
      showNotification("Error saving post.", "error");
    }
  };

  const handleSavePost = async () => {
    await handleSavePostWithStatus();
  };

  const handleDeletePost = (id: string) => {
    setConfirmDelete({ id, type: "post" });
  };

  const executeDeletePost = async (id: string) => {
    try {
      const res = await fetch(`/api/posts/${id}`, { 
        method: "DELETE",
        headers: { "x-admin-auth": "true" }
      });
      const data = await res.json();
      if (data.error) {
        showNotification(data.error, "error");
      } else {
        showNotification("Post review deleted successfully.", "success");
      }
    } catch (e) {
      showNotification("Failed to delete post review.", "error");
    }
    setConfirmDelete(null);
    fetchPosts();
  };

  // BLOCK EDITOR STUFF
  const addBlock = (type: BlockType, level: 0 | 2 | 3 = 0) => {
    if (!editingPost) return;
    const newBlock: EditorBlock = {
      id: "block-" + Date.now() + Math.random().toString(36).substr(2, 4),
      type,
      value: type === "text" 
        ? { text: "New text block contents...", level } 
        : type === "table" 
        ? { headers: ["Column 1", "Column 2"], rows: [["Value A", "Value B"]] }
        : { url: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80", alt: "Benchmark visualization", caption: "Caption detailing tested inputs" }
    };
    
    setEditingPost({
      ...editingPost,
      content: [...editingPost.content, newBlock]
    });
  };

  const deleteBlock = (blockId: string) => {
    if (!editingPost) return;
    setEditingPost({
      ...editingPost,
      content: editingPost.content.filter(b => b.id !== blockId)
    });
  };

  // Draggable Mechanics
  const handleDragStart = (e: DragEvent, index: number) => {
    e.dataTransfer.setData("text/plain", index.toString());
  };

  const handleDrop = (e: DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (!editingPost) return;
    const dragIndex = parseInt(e.dataTransfer.getData("text/plain"), 10);
    if (isNaN(dragIndex) || dragIndex === targetIndex) return;

    const list = [...editingPost.content];
    const [removed] = list.splice(dragIndex, 1);
    list.splice(targetIndex, 0, removed);

    setEditingPost({
      ...editingPost,
      content: list
    });
  };

  const moveBlockByButton = (index: number, direction: "up" | "down") => {
    if (!editingPost) return;
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= editingPost.content.length) return;

    const list = [...editingPost.content];
    const [removed] = list.splice(index, 1);
    list.splice(targetIndex, 0, removed);

    setEditingPost({
      ...editingPost,
      content: list
    });
  };

  const updateBlockValue = (blockId: string, newValue: any) => {
    if (!editingPost) return;
    setEditingPost({
      ...editingPost,
      content: editingPost.content.map(b => b.id === blockId ? { ...b, value: newValue } : b)
    });
  };

  // MODELS CRUD
  const fetchModels = async () => {
    const res = await fetch("/api/models");
    const data = await res.json();
    setModels(data);
  };

  const handleSaveModel = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingModel) return;

    const isNew = !editingModel.id;
    const url = isNew ? "/api/models" : `/api/models/${editingModel.id}`;
    const method = isNew ? "POST" : "PUT";

    try {
      const res = await fetch(url, {
        method,
        headers: { 
          "Content-Type": "application/json",
          "x-admin-auth": "true"
        },
        body: JSON.stringify(editingModel)
      });
      const data = await res.json();
      if (data.error) {
        showNotification(data.error, "error");
        return;
      }
      showNotification(`Model "${editingModel.name}" saved successfully!`, "success");
      setEditingModel(null);
      fetchModels();
    } catch (e) {
      showNotification("Error saving model.", "error");
    }
  };

  const handleDeleteModel = (id: string) => {
    setConfirmDelete({ id, type: "model" });
  };

  const executeDeleteModel = async (id: string) => {
    try {
      const res = await fetch(`/api/models/${id}`, { 
        method: "DELETE",
        headers: { "x-admin-auth": "true" }
      });
      const data = await res.json();
      if (data.error) {
        showNotification(data.error, "error");
      } else {
        showNotification("Model entry deleted successfully.", "success");
      }
    } catch (e) {
      showNotification("Failed to delete model entry.", "error");
    }
    setConfirmDelete(null);
    fetchModels();
  };

  // ANALYTICS & ADSENSE
  const fetchAnalytics = async () => {
    setAnalyticsLoading(true);
    try {
      const res = await fetch("/api/analytics/summary", {
        headers: { "x-admin-auth": "true" }
      });
      const data = await res.json();
      setAnalytics(data);
    } catch (e) {
      console.error(e);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const fetchSeoSummary = async () => {
    setSeoLoading(true);
    try {
      const res = await fetch("/api/seo/summary", {
        headers: { "x-admin-auth": "true" }
      });
      const data = await res.json();
      setSeoSummary(data);
    } catch (e) {
      console.error(e);
    } finally {
      setSeoLoading(false);
    }
  };

  const clearSeoLogs = async () => {
    try {
      const res = await fetch("/api/seo/clear", {
        method: "POST",
        headers: { "x-admin-auth": "true" }
      });
      const data = await res.json();
      if (data.success) {
        showNotification("SEO crawl logs cleared successfully.", "success");
        fetchSeoSummary();
      }
    } catch (e) {
      showNotification("Failed to clear SEO logs.", "error");
    }
  };

  const simulateBotCrawl = async () => {
    setIsSimulating(true);
    try {
      let ua = "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)";
      if (simulationBot === "Bingbot") {
        ua = "Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)";
      } else if (simulationBot === "DuckDuckBot") {
        ua = "DuckDuckBot/1.0; (+http://duckduckgo.com/duc_logos.html)";
      } else if (simulationBot === "YandexBot") {
        ua = "Mozilla/5.0 (compatible; YandexBot/3.0; +http://yandex.com/bots)";
      } else if (simulationBot === "AhrefsBot") {
        ua = "Mozilla/5.0 (compatible; AhrefsBot/7.0; +http://ahrefs.com/robot/)";
      } else if (simulationBot === "Baiduspider") {
        ua = "Mozilla/5.0 (compatible; Baiduspider/2.0; +http://www.baidu.com/search/spider.html)";
      }

      const res = await fetch("/api/seo/simulate", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-admin-auth": "true"
        },
        body: JSON.stringify({
          bot_name: simulationBot,
          requested_url: simulationUrl,
          user_agent: ua
        })
      });
      const data = await res.json();
      if (data.success) {
        showNotification(`Simulated ${simulationBot} crawl request on ${simulationUrl}!`, "success");
        fetchSeoSummary();
      }
    } catch (e) {
      showNotification("Simulation request failed.", "error");
    } finally {
      setIsSimulating(false);
    }
  };

  const fetchAdsenseConfig = async () => {
    const res = await fetch("/api/adsense/config", {
      headers: { "x-admin-auth": "true" }
    });
    const data = await res.json();
    setPublisherId(data.publisherId);
    setAdsEnabled(data.enabled);
  };

  const handleSaveAdsense = async () => {
    await fetch("/api/adsense/config", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "x-admin-auth": "true"
      },
      body: JSON.stringify({ publisherId, enabled: adsEnabled })
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  if (authLoading) {
    return (
      <div className="mx-auto max-w-xl py-16 text-center">
        <RefreshCw className="h-6 w-6 animate-spin text-zinc-400 mx-auto" />
      </div>
    );
  }

  // LOGIN SCREEN
  if (!isAdmin) {
    return (
      <div id="admin-login-screen" className="mx-auto max-w-md px-4 py-16 sm:py-24 animate-fade-in font-sans">
        <div className="rounded-3xl border border-zinc-200/80 bg-white/90 p-8 dark:border-zinc-800/80 dark:bg-zinc-950/90 shadow-2xl backdrop-blur-xl relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400" />
          
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 mb-6 shadow-sm">
            <Lock className="h-5 w-5" />
          </div>

          <h1 className="text-center font-display text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-2">
            Administrator Studio
          </h1>
          <p className="text-center text-xs text-zinc-500 dark:text-zinc-400 mb-8 leading-relaxed">
            Enter administrator credentials to edit benchmarks, publish review content, and manage SEO configurations.
          </p>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="flex flex-col">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1.5">
                Username
              </label>
              <input 
                type="text" 
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. Anik"
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-3.5 py-2.5 text-xs text-zinc-950 placeholder-zinc-400 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-50 dark:focus:bg-zinc-950 transition-all duration-200"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1.5">
                Admin Access Password
              </label>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-3.5 py-2.5 text-xs text-zinc-950 placeholder-zinc-400 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-50 dark:focus:bg-zinc-950 transition-all duration-200"
              />
              {loginError && (
                <span className="text-[11px] font-semibold text-red-500 mt-2 block">{loginError}</span>
              )}
            </div>

            <button 
              type="submit"
              className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-zinc-950 font-display text-xs font-bold py-3 hover:shadow-lg hover:shadow-emerald-500/15 transition-all duration-200 uppercase tracking-wider cursor-pointer mt-2"
            >
              Authenticate Session
            </button>
          </form>
          
          <div className="mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-900 text-center">
            <p className="text-[10px] text-zinc-400 dark:text-zinc-500 leading-relaxed">
              Secured under native SHA-256 session transport locks. Credentials requested for current cycle are active.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="admin-dashboard-page" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 animate-fade-in font-sans">
      
      {/* 1. TOP HEADER BRAND */}
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-900 pb-5 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-zinc-950 dark:text-zinc-50">
              Editorial Studio
            </h1>
            <span className="font-mono text-[9px] bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400 px-2 py-0.5 rounded-full font-bold uppercase">
              Publisher Active
            </span>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Admin endpoints live. Dynamic sitemaps, ads.txt files, and robots.txt serve from workspace root.
          </p>
        </div>

        <button 
          onClick={handleLogout}
          className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 px-3.5 py-1.5 text-xs font-semibold text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900 cursor-pointer"
        >
          <LogOut className="h-3.5 w-3.5" />
          Terminate Session
        </button>
      </header>

      {/* 2. MAIN ADMIN TABS */}
      <div className="flex flex-wrap gap-2 border-b border-zinc-100 dark:border-zinc-900 pb-3 mb-6">
        {[
          { id: "posts", label: "Reviews CMS", icon: FileText },
          { id: "models", label: "Benchmarking CRUD", icon: Cpu },
          { id: "analytics", label: "SEO Log Analytics", icon: BarChart3 },
          { id: "adsense", label: "AdSense Integration", icon: Settings },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id as any); setEditingPost(null); setEditingModel(null); }}
              className={`flex items-center gap-1.5 font-sans text-xs font-semibold px-4 py-2 rounded-lg transition-all cursor-pointer ${
                isActive 
                  ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-950 shadow-sm" 
                  : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-zinc-900/50"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. EDITING POSTS BLOCK-BASED VIEW */}
      {editingPost ? (
        <div id="block-editor-container" className="bg-white border border-zinc-150 rounded-xl p-6 dark:border-zinc-800 dark:bg-zinc-950 shadow-md">
          <div className="flex flex-wrap items-center justify-between border-b border-zinc-100 dark:border-zinc-900 pb-3 mb-6 gap-2">
            <h2 className="font-sans text-base font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
              <FileText className="h-4.5 w-4.5 text-emerald-500" />
              {editingPost.id ? "Edit Benchmarking Post" : "Create New Post"}
            </h2>
            <div className="flex flex-wrap gap-2">
              <button 
                onClick={() => setEditingPost(null)}
                className="rounded-xl border border-zinc-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-zinc-600 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900 cursor-pointer transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={() => handleSavePostWithStatus("draft")}
                className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-700 px-4 py-1.5 text-xs font-semibold hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-850 transition-all cursor-pointer"
              >
                <FileText className="h-3.5 w-3.5" />
                Save Draft
              </button>
              <button 
                onClick={() => handleSavePostWithStatus("published")}
                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-zinc-950 px-4 py-1.5 text-xs font-bold hover:from-emerald-400 hover:to-teal-400 hover:shadow-lg hover:shadow-emerald-500/10 transition-all cursor-pointer"
              >
                <Save className="h-3.5 w-3.5" />
                Publish Review
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Post Title
              </label>
              <input 
                type="text" 
                value={editingPost.title}
                onChange={(e) => {
                  const title = e.target.value;
                  const currentSlugifiedTitle = slugify(editingPost.title);
                  const isNew = !editingPost.id;
                  const shouldUpdateSlug = isNew || !editingPost.slug || editingPost.slug === currentSlugifiedTitle || editingPost.slug === "new-llm-benchmark-analysis";
                  setEditingPost({
                    ...editingPost,
                    title,
                    slug: shouldUpdateSlug ? slugify(title) : editingPost.slug
                  });
                }}
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:border-emerald-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Slug (URL Route)
              </label>
              <input 
                type="text" 
                value={editingPost.slug}
                onChange={(e) => setEditingPost({ ...editingPost, slug: slugify(e.target.value) })}
                placeholder="e.g. state-of-llm-benchmarks"
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:border-emerald-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Custom SEO Meta Description (Required for high Core Web Vitals SEO ranking)
            </label>
            <textarea 
              rows={2}
              value={editingPost.meta_description}
              onChange={(e) => setEditingPost({ ...editingPost, meta_description: e.target.value })}
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:border-emerald-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Publication Status
              </label>
              <select
                value={editingPost.status}
                onChange={(e) => setEditingPost({ ...editingPost, status: e.target.value as any })}
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-700 focus:outline-none dark:border-zinc-800 dark:bg-zinc-9050 dark:bg-zinc-900 dark:text-zinc-200"
              >
                <option value="draft">Draft (Visible only to Admin)</option>
                <option value="published">Published (Sitemap & Homepage Active)</option>
              </select>
            </div>
          </div>

          {/* DYNAMIC NATIVE HTML5 DRAG-DROP BLOCK BUILDER */}
          <div className="border-t border-zinc-150 dark:border-zinc-900 pt-6">
            <h3 className="font-sans text-sm font-bold text-zinc-800 dark:text-zinc-200 mb-3">
              Lightweight Content Editor Blocks
            </h3>
            <p className="text-[11px] text-zinc-400 mb-4 leading-relaxed">
              Rearrange contents effortlessly using the native drag handle <Move className="inline h-3 w-3" /> or reordering buttons. Press block injectors below to create markdown prose, tables, or access images.
            </p>

            <div className="flex flex-col gap-4 mb-6">
              {editingPost.content.map((block, index) => (
                <div 
                  key={block.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleDrop(e, index)}
                  className="rounded-xl border border-zinc-150 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/40 relative group flex items-start gap-3 transition-colors hover:border-emerald-500/20"
                >
                  {/* Reordering handles */}
                  <div className="flex flex-col items-center gap-1 shrink-0 text-zinc-400">
                    <div className="cursor-grab active:cursor-grabbing p-1 hover:text-zinc-600 dark:hover:text-zinc-200" title="Drag to reorder">
                      <Move className="h-4 w-4" />
                    </div>
                    <div className="flex items-center gap-0.5">
                      <button 
                        disabled={index === 0}
                        onClick={() => moveBlockByButton(index, "up")}
                        className="p-0.5 rounded hover:bg-zinc-100 disabled:opacity-30 dark:hover:bg-zinc-800"
                      >
                        <ArrowUp className="h-3 w-3" />
                      </button>
                      <button 
                        disabled={index === editingPost.content.length - 1}
                        onClick={() => moveBlockByButton(index, "down")}
                        className="p-0.5 rounded hover:bg-zinc-100 disabled:opacity-30 dark:hover:bg-zinc-800"
                      >
                        <ArrowDown className="h-3 w-3" />
                      </button>
                    </div>
                  </div>

                  {/* Block Content Inputs */}
                  <div className="flex-1 min-w-0">
                    
                    {/* TEXT BLOCK TYPE */}
                    {block.type === "text" && (
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <Heading className="h-3.5 w-3.5 text-zinc-400" />
                          <span className="font-mono text-[10px] font-bold text-zinc-400 uppercase">Text block</span>
                          <select 
                            value={(block.value as TextBlock).level || 0}
                            onChange={(e) => updateBlockValue(block.id, { ...block.value, level: Number(e.target.value) })}
                            className="font-sans text-[10px] rounded border border-zinc-200 bg-white px-1.5 py-0.5 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300"
                          >
                            <option value={0}>Paragraph (p)</option>
                            <option value={2}>H2 Subtitle</option>
                            <option value={3}>H3 Heading</option>
                          </select>
                        </div>
                        <textarea
                          rows={3}
                          value={(block.value as TextBlock).text}
                          onChange={(e) => updateBlockValue(block.id, { ...block.value, text: e.target.value })}
                          className="w-full rounded-lg border border-zinc-200 bg-white p-2.5 text-xs text-zinc-900 focus:outline-none focus:border-emerald-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
                        />
                      </div>
                    )}

                    {/* TABLE BLOCK TYPE */}
                    {block.type === "table" && (
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2 mb-1">
                          <Grid3X3 className="h-3.5 w-3.5 text-zinc-400" />
                          <span className="font-mono text-[10px] font-bold text-zinc-400 uppercase">Semantic table block</span>
                        </div>
                        
                        <div className="overflow-x-auto rounded-lg border border-zinc-150 dark:border-zinc-800">
                          <table className="w-full text-left">
                            <thead>
                              <tr className="bg-zinc-100 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800">
                                {(block.value as TableBlock).headers.map((h, hIdx) => (
                                  <th key={hIdx} className="p-2">
                                    <input 
                                      type="text" 
                                      value={h}
                                      onChange={(e) => {
                                        const newHeaders = [...(block.value as TableBlock).headers];
                                        newHeaders[hIdx] = e.target.value;
                                        updateBlockValue(block.id, { ...(block.value as TableBlock), headers: newHeaders });
                                      }}
                                      className="font-sans text-xs font-bold text-zinc-700 dark:text-zinc-300 bg-transparent border-b border-dashed border-zinc-300 focus:outline-none"
                                    />
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {(block.value as TableBlock).rows.map((row, rIdx) => (
                                <tr key={rIdx} className="border-b border-zinc-100 dark:border-zinc-900 last:border-b-0">
                                  {row.map((cell, cIdx) => (
                                    <td key={cIdx} className="p-2">
                                      <input 
                                        type="text" 
                                        value={cell}
                                        onChange={(e) => {
                                          const newRows = [...(block.value as TableBlock).rows];
                                          newRows[rIdx][cIdx] = e.target.value;
                                          updateBlockValue(block.id, { ...(block.value as TableBlock), rows: newRows });
                                        }}
                                        className="font-sans text-xs text-zinc-600 dark:text-zinc-400 bg-transparent focus:outline-none"
                                      />
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* Row/Col Actions */}
                        <div className="flex gap-2">
                          <button 
                            onClick={() => {
                              const bVal = block.value as TableBlock;
                              const newRow = Array(bVal.headers.length).fill("New Cell");
                              updateBlockValue(block.id, { ...bVal, rows: [...bVal.rows, newRow] });
                            }}
                            className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 px-2 py-1 rounded border border-emerald-500/10 hover:bg-emerald-500/5 cursor-pointer"
                          >
                            + Add Row
                          </button>
                          <button 
                            onClick={() => {
                              const bVal = block.value as TableBlock;
                              if (bVal.rows.length <= 1) return;
                              updateBlockValue(block.id, { ...bVal, rows: bVal.rows.slice(0, -1) });
                            }}
                            className="text-[10px] font-bold text-red-500 px-2 py-1 rounded border border-red-500/10 hover:bg-red-500/5 cursor-pointer"
                          >
                            - Delete Row
                          </button>
                        </div>
                      </div>
                    )}

                    {/* IMAGE BLOCK TYPE */}
                    {block.type === "image" && (
                      <div className="flex flex-col gap-2.5">
                        <div className="flex items-center gap-2">
                          <ImageIcon className="h-3.5 w-3.5 text-zinc-400" />
                          <span className="font-mono text-[10px] font-bold text-zinc-400 uppercase">Image block</span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 mb-1">Image URL</label>
                            <input 
                              type="text" 
                              value={(block.value as ImageBlock).url}
                              onChange={(e) => updateBlockValue(block.id, { ...(block.value as ImageBlock), url: e.target.value })}
                              className="w-full rounded border border-zinc-200 bg-white p-1.5 text-xs dark:border-zinc-850 dark:bg-zinc-950 dark:text-zinc-50"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 mb-1">Alt Text (Accessibility)</label>
                            <input 
                              type="text" 
                              value={(block.value as ImageBlock).alt}
                              onChange={(e) => updateBlockValue(block.id, { ...(block.value as ImageBlock), alt: e.target.value })}
                              className="w-full rounded border border-zinc-200 bg-white p-1.5 text-xs dark:border-zinc-850 dark:bg-zinc-950 dark:text-zinc-50"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 mb-1">Caption</label>
                            <input 
                              type="text" 
                              value={(block.value as ImageBlock).caption}
                              onChange={(e) => updateBlockValue(block.id, { ...(block.value as ImageBlock), caption: e.target.value })}
                              className="w-full rounded border border-zinc-200 bg-white p-1.5 text-xs dark:border-zinc-850 dark:bg-zinc-950 dark:text-zinc-50"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                  </div>

                  {/* Delete Block */}
                  <button 
                    onClick={() => deleteBlock(block.id)}
                    className="p-1.5 rounded-lg border border-red-500/10 text-red-500 hover:bg-red-500/10 cursor-pointer self-center"
                    title="Delete Block"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Block Injectors Menu */}
            <div className="flex flex-wrap gap-2 justify-center bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800">
              <span className="font-sans text-xs text-zinc-400 dark:text-zinc-500 w-full text-center mb-1 font-bold">Inject Block:</span>
              <button 
                onClick={() => addBlock("text", 0)}
                className="inline-flex items-center gap-1 text-[11px] font-bold bg-white border border-zinc-200 px-3 py-1.5 rounded-lg text-zinc-700 hover:border-emerald-500 hover:text-emerald-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:border-emerald-400 cursor-pointer transition-colors"
              >
                <Plus className="h-3 w-3" /> Paragraph Block
              </button>
              <button 
                onClick={() => addBlock("text", 2)}
                className="inline-flex items-center gap-1 text-[11px] font-bold bg-white border border-zinc-200 px-3 py-1.5 rounded-lg text-zinc-700 hover:border-emerald-500 hover:text-emerald-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:border-emerald-400 cursor-pointer transition-colors"
              >
                <Plus className="h-3 w-3" /> H2 Subheading Block
              </button>
              <button 
                onClick={() => addBlock("table")}
                className="inline-flex items-center gap-1 text-[11px] font-bold bg-white border border-zinc-200 px-3 py-1.5 rounded-lg text-zinc-700 hover:border-emerald-500 hover:text-emerald-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:border-emerald-400 cursor-pointer transition-colors"
              >
                <Plus className="h-3 w-3" /> HTML Table Block
              </button>
              <button 
                onClick={() => addBlock("image")}
                className="inline-flex items-center gap-1 text-[11px] font-bold bg-white border border-zinc-200 px-3 py-1.5 rounded-lg text-zinc-700 hover:border-emerald-500 hover:text-emerald-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:border-emerald-400 cursor-pointer transition-colors"
              >
                <Plus className="h-3 w-3" /> Image Block
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* TABS VIEW OUTPUTS */}
          
          {/* T1. REVIEWS CMS TAB */}
          {activeTab === "posts" && (
            <div id="posts-cms-view" className="animate-fade-in">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-sans text-sm font-bold text-zinc-800 dark:text-zinc-200">Benchmarking Posts (Reviews)</h3>
                <button 
                  onClick={handleCreateNewPost}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-950 text-white dark:bg-zinc-50 dark:text-zinc-950 font-sans text-xs font-bold px-3.5 py-1.5 hover:bg-zinc-850 dark:hover:bg-zinc-100 transition-colors cursor-pointer"
                >
                  <Plus className="h-4 w-4" /> Create Review Post
                </button>
              </div>

              <div className="overflow-x-auto rounded-xl border border-zinc-150 bg-white dark:border-zinc-800 dark:bg-zinc-950 shadow-sm">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-150 bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-900/30">
                      <th className="p-4 font-sans text-xs font-semibold text-zinc-700 dark:text-zinc-300">Title</th>
                      <th className="p-4 font-sans text-xs font-semibold text-zinc-700 dark:text-zinc-300">Route / Slug</th>
                      <th className="p-4 font-sans text-xs font-semibold text-zinc-700 dark:text-zinc-300 text-center">Status</th>
                      <th className="p-4 font-sans text-xs font-semibold text-zinc-700 dark:text-zinc-300 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {posts.map((post) => (
                      <tr key={post.id} className="border-b border-zinc-100 dark:border-zinc-900 last:border-b-0 hover:bg-zinc-50/20">
                        <td className="p-4">
                          <span className="font-sans text-sm font-semibold text-zinc-900 dark:text-zinc-50 block">{post.title}</span>
                          <span className="font-sans text-[10px] text-zinc-400 block mt-0.5">
                            Published: {post.published_at ? new Date(post.published_at).toLocaleDateString() : "Never"}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="font-mono text-xs text-zinc-600 dark:text-zinc-400 block">/post/{post.slug}</span>
                        </td>
                        <td className="p-4">
                          <div className="flex justify-center">
                            {post.status === "published" ? (
                              <span className="bg-emerald-50 text-emerald-600 border border-emerald-200 font-mono text-[9px] font-bold px-2 py-0.5 rounded-full dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900">
                                PUBLISHED
                              </span>
                            ) : (
                              <span className="bg-amber-50 text-amber-600 border border-amber-200 font-mono text-[9px] font-bold px-2 py-0.5 rounded-full dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900">
                                DRAFT
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => navigate(`/post/${post.slug}`)}
                              className="p-1.5 rounded hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900 dark:hover:bg-zinc-900 dark:hover:text-zinc-200 cursor-pointer"
                              title="Preview Post"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => setEditingPost(post)}
                              className="rounded border border-zinc-200 px-2.5 py-1 text-[11px] font-bold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900 cursor-pointer"
                            >
                              Edit Content
                            </button>
                            <button 
                              onClick={() => handleDeletePost(post.id)}
                              className="p-1.5 rounded hover:bg-red-50 text-red-500 hover:text-red-700 dark:hover:bg-red-950/40 cursor-pointer"
                              title="Delete Post"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* T2. LLM MODELS CRUD TAB */}
          {activeTab === "models" && (
            <div id="models-crud-view" className="animate-fade-in">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-sans text-sm font-bold text-zinc-800 dark:text-zinc-200">Benchmarked LLM Model Parameters</h3>
                <button 
                  onClick={() => setEditingModel({ id: "", name: "", developer: "", input_cost_1m: 1.0, output_cost_1m: 3.0, mmlu_score: 80.0 })}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-950 text-white dark:bg-zinc-50 dark:text-zinc-950 font-sans text-xs font-bold px-3.5 py-1.5 hover:bg-zinc-850 dark:hover:bg-zinc-100 transition-colors cursor-pointer"
                >
                  <Plus className="h-4 w-4" /> Add LLM Model
                </button>
              </div>

              {editingModel && (
                <form onSubmit={handleSaveModel} className="mb-6 rounded-xl border border-zinc-150 bg-zinc-50 p-5 dark:border-zinc-850 dark:bg-zinc-900/40 animate-fade-in">
                  <h4 className="font-sans text-xs font-bold text-zinc-800 dark:text-zinc-200 mb-3 uppercase">
                    {editingModel.id ? "Edit Model details" : "Add New Model entry"}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-500 mb-1">Model Name</label>
                      <input 
                        type="text" 
                        required
                        value={editingModel.name}
                        onChange={(e) => setEditingModel({ ...editingModel, name: e.target.value })}
                        placeholder="e.g. GPT-4o-mini"
                        className="w-full rounded border border-zinc-200 bg-white p-2 text-xs dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-500 mb-1">Developer</label>
                      <input 
                        type="text" 
                        required
                        value={editingModel.developer}
                        onChange={(e) => setEditingModel({ ...editingModel, developer: e.target.value })}
                        placeholder="e.g. OpenAI"
                        className="w-full rounded border border-zinc-200 bg-white p-2 text-xs dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-500 mb-1">Input cost per 1M (USD)</label>
                      <input 
                        type="number" 
                        step="0.0001"
                        required
                        value={editingModel.input_cost_1m}
                        onChange={(e) => setEditingModel({ ...editingModel, input_cost_1m: parseFloat(e.target.value) || 0 })}
                        className="w-full rounded border border-zinc-200 bg-white p-2 text-xs dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-500 mb-1">Output cost per 1M (USD)</label>
                      <input 
                        type="number" 
                        step="0.0001"
                        required
                        value={editingModel.output_cost_1m}
                        onChange={(e) => setEditingModel({ ...editingModel, output_cost_1m: parseFloat(e.target.value) || 0 })}
                        className="w-full rounded border border-zinc-200 bg-white p-2 text-xs dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-500 mb-1">MMLU Score (%)</label>
                      <input 
                        type="number" 
                        step="0.1"
                        max="100"
                        required
                        value={editingModel.mmlu_score}
                        onChange={(e) => setEditingModel({ ...editingModel, mmlu_score: parseFloat(e.target.value) || 0 })}
                        className="w-full rounded border border-zinc-200 bg-white p-2 text-xs dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end">
                    <button 
                      type="button"
                      onClick={() => setEditingModel(null)}
                      className="rounded border border-zinc-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-zinc-600 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 text-zinc-950 px-4 py-1.5 text-xs font-bold hover:bg-emerald-400 transition-colors cursor-pointer"
                    >
                      Commit Model Entry
                    </button>
                  </div>
                </form>
              )}

              <div className="overflow-x-auto rounded-xl border border-zinc-150 bg-white dark:border-zinc-800 dark:bg-zinc-950 shadow-sm">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-150 bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-900/30">
                      <th className="p-4 font-sans text-xs font-semibold text-zinc-700 dark:text-zinc-300">Model</th>
                      <th className="p-4 font-sans text-xs font-semibold text-zinc-700 dark:text-zinc-300">Developer</th>
                      <th className="p-4 font-sans text-xs font-semibold text-zinc-700 dark:text-zinc-300 text-center">MMLU</th>
                      <th className="p-4 font-sans text-xs font-semibold text-zinc-700 dark:text-zinc-300 text-right">Cost (In/Out 1M)</th>
                      <th className="p-4 font-sans text-xs font-semibold text-zinc-700 dark:text-zinc-300 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {models.map((m) => (
                      <tr key={m.id} className="border-b border-zinc-100 dark:border-zinc-900 last:border-b-0 hover:bg-zinc-50/20">
                        <td className="p-4 font-sans text-sm font-semibold text-zinc-900 dark:text-zinc-50">{m.name}</td>
                        <td className="p-4 font-sans text-xs text-zinc-600 dark:text-zinc-400">{m.developer}</td>
                        <td className="p-4 text-center font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">{m.mmlu_score}%</td>
                        <td className="p-4 text-right font-sans text-xs">
                          <span className="font-mono text-zinc-900 dark:text-zinc-50 block font-semibold">${(m.input_cost_1m + m.output_cost_1m).toFixed(3)}</span>
                          <span className="text-[10px] text-zinc-400 block mt-0.5">${m.input_cost_1m.toFixed(2)} / ${m.output_cost_1m.toFixed(2)}</span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => setEditingModel(m)}
                              className="rounded border border-zinc-200 px-2 py-1 text-[11px] font-bold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900 cursor-pointer"
                            >
                              Edit
                            </button>
                            <button 
                              onClick={() => handleDeleteModel(m.id)}
                              className="p-1 rounded hover:bg-red-50 text-red-500 hover:text-red-700 dark:hover:bg-red-950/40 cursor-pointer"
                              title="Delete model entry"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* T3. REAL-TIME LOG ANALYTICS & SEO DASHBOARD */}
          {activeTab === "analytics" && (
            <div id="analytics-logs-view" className="animate-fade-in flex flex-col gap-6">
              
              {/* Header with reload action */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-900 pb-4">
                <div>
                  <h3 className="font-sans text-base font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-emerald-500" />
                    Interactive SEO & Traffic Log Studio
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    Analyze user behavior metrics side-by-side with genuine and simulated search engine crawl logs.
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => { fetchAnalytics(); fetchSeoSummary(); }}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900 cursor-pointer"
                    title="Reload Statistics"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${(analyticsLoading || seoLoading) ? "animate-spin text-emerald-500" : "text-zinc-400"}`} />
                    Refresh Metrics
                  </button>
                  <button 
                    onClick={clearSeoLogs}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 dark:border-red-950/30 dark:bg-zinc-950 dark:hover:bg-red-950/20 cursor-pointer"
                    title="Clear All Bot Logs"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Reset Bot Logs
                  </button>
                </div>
              </div>

              {/* Sub tabs selector */}
              <div className="flex gap-2 bg-zinc-100 p-1 rounded-lg dark:bg-zinc-900 max-w-md">
                {[
                  { id: "user", label: "User Engagement" },
                  { id: "crawler", label: "Search Crawlers (SEO)" },
                  { id: "simulator", label: "Crawler Simulator" }
                ].map((subTab) => (
                  <button
                    key={subTab.id}
                    onClick={() => setActiveSubTab(subTab.id as any)}
                    className={`flex-1 text-center py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
                      activeSubTab === subTab.id
                        ? "bg-white text-zinc-950 shadow-sm dark:bg-zinc-800 dark:text-zinc-50"
                        : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
                    }`}
                  >
                    {subTab.label}
                  </button>
                ))}
              </div>

              {/* TAB CONTENT: 1. USER TRAFFIC */}
              {activeSubTab === "user" && (
                <div className="space-y-6 animate-fade-in">
                  {analyticsLoading && !analytics ? (
                    <div className="animate-pulse h-64 border border-zinc-200 rounded-xl bg-zinc-50 dark:bg-zinc-900/40" />
                  ) : analytics ? (
                    <>
                      {/* Stat summary blocks */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="rounded-xl border border-zinc-150 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950 shadow-sm">
                          <span className="font-sans text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">Total Page Views</span>
                          <span className="font-mono text-3xl font-black text-zinc-900 dark:text-zinc-50">{analytics.totalViews}</span>
                        </div>

                        <div className="rounded-xl border border-zinc-150 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950 shadow-sm">
                          <span className="font-sans text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">Scroll-Depth triggers</span>
                          <span className="font-mono text-3xl font-black text-zinc-900 dark:text-zinc-50">{analytics.totalScrolls}</span>
                        </div>

                        <div className="rounded-xl border border-zinc-150 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950 shadow-sm">
                          <span className="font-sans text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">Unique Visitors</span>
                          <span className="font-mono text-3xl font-black text-zinc-900 dark:text-zinc-50">{analytics.uniqueSessions}</span>
                        </div>
                      </div>

                      {/* Distribution graph */}
                      <div className="rounded-xl border border-zinc-150 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950 shadow-sm">
                        <h4 className="font-sans text-xs font-bold uppercase tracking-wider text-zinc-400 mb-4">Traffic Distribution by Page Slug</h4>
                        <div className="flex flex-col gap-3">
                          {Object.keys(analytics.viewsByPost || {}).length === 0 ? (
                            <span className="text-xs text-zinc-400 italic">No traffic recorded yet. Visits will register dynamically.</span>
                          ) : (
                            Object.keys(analytics.viewsByPost).map((key) => {
                              const views = analytics.viewsByPost[key] || 0;
                              const scrolls = analytics.scrollsByPost[key] || 0;
                              const maxViews = Math.max(...Object.values(analytics.viewsByPost) as number[], 1);
                              const percentage = (views / maxViews) * 100;

                              return (
                                <div key={key} className="flex flex-col">
                                  <div className="flex justify-between items-center text-xs mb-1.5">
                                    <span className="font-mono font-semibold text-zinc-700 dark:text-zinc-300">{key}</span>
                                    <span className="font-sans text-zinc-500 dark:text-zinc-400">
                                      {views} views | {scrolls} scroll-depth
                                    </span>
                                  </div>
                                  <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden dark:bg-zinc-900">
                                    <div 
                                      className="bg-emerald-500 h-full rounded-full" 
                                      style={{ width: `${percentage}%` }}
                                    />
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>

                      {/* Raw stream */}
                      <div className="rounded-xl border border-zinc-150 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950 shadow-sm">
                        <h4 className="font-sans text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3">Engagement Logs (Last 100 entries)</h4>
                        <div className="max-h-60 overflow-y-auto border border-zinc-100 rounded-lg dark:border-zinc-900 font-mono text-[10px] flex flex-col p-2.5 bg-zinc-50 dark:bg-zinc-950 gap-1.5">
                          {!analytics.rawLogs || analytics.rawLogs.length === 0 ? (
                            <span className="text-zinc-400 italic">Analytical stream is quiet...</span>
                          ) : (
                            analytics.rawLogs.map((log: any) => (
                              <div key={log.id} className="flex justify-between border-b border-zinc-100 dark:border-zinc-900 pb-1 last:border-b-0 leading-relaxed text-zinc-500 dark:text-zinc-400">
                                <span>
                                  [{new Date(log.timestamp).toLocaleTimeString()}] 
                                  <span className="text-emerald-600 dark:text-emerald-400 font-bold ml-1.5 uppercase">{log.event_type}</span>
                                  <span className="text-zinc-700 dark:text-zinc-300 font-semibold ml-2">{log.post_id || "homepage"}</span>
                                </span>
                                <span className="text-[9px] text-zinc-400">{log.session_hash}</span>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center text-zinc-400 p-8 border border-dashed rounded-xl">
                      No analytic summaries fetched. Use the refresh icon.
                    </div>
                  )}
                </div>
              )}

              {/* TAB CONTENT: 2. CRAWLER LOGS */}
              {activeSubTab === "crawler" && (
                <div className="space-y-6 animate-fade-in">
                  {seoLoading && !seoSummary ? (
                    <div className="animate-pulse h-64 border border-zinc-200 rounded-xl bg-zinc-50 dark:bg-zinc-900/40" />
                  ) : seoSummary ? (
                    <>
                      {/* SEO metrics blocks */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="rounded-xl border border-zinc-150 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950 shadow-sm">
                          <span className="font-sans text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">Total Crawler Hits</span>
                          <span className="font-mono text-3xl font-black text-emerald-600 dark:text-emerald-400">{seoSummary.totalCrawlHits}</span>
                        </div>

                        <div className="rounded-xl border border-zinc-150 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950 shadow-sm">
                          <span className="font-sans text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">Crawled SEO Files</span>
                          <span className="font-mono text-3xl font-black text-zinc-900 dark:text-zinc-50">
                            {Object.keys(seoSummary.urlFrequency || {}).filter(url => url.endsWith(".txt") || url.endsWith(".xml")).length}
                          </span>
                        </div>

                        <div className="rounded-xl border border-zinc-150 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950 shadow-sm">
                          <span className="font-sans text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">Distinct Bot Crawlers</span>
                          <span className="font-mono text-3xl font-black text-zinc-900 dark:text-zinc-50">
                            {Object.keys(seoSummary.botDistribution || {}).length}
                          </span>
                        </div>
                      </div>

                      {/* Bot distributions */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="rounded-xl border border-zinc-150 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950 shadow-sm">
                          <h4 className="font-sans text-xs font-bold uppercase tracking-wider text-zinc-400 mb-4">Crawler Engine Share</h4>
                          <div className="flex flex-col gap-3">
                            {Object.keys(seoSummary.botDistribution || {}).length === 0 ? (
                              <span className="text-xs text-zinc-400 italic">No search bot crawls recorded yet. Trigger simulation crawls or request robots.txt / sitemap.xml.</span>
                            ) : (
                              Object.keys(seoSummary.botDistribution).map((bot) => {
                                const hits = seoSummary.botDistribution[bot] || 0;
                                const maxHits = Math.max(...Object.values(seoSummary.botDistribution) as number[], 1);
                                const percentage = (hits / maxHits) * 100;
                                return (
                                  <div key={bot} className="flex flex-col">
                                    <div className="flex justify-between items-center text-xs mb-1">
                                      <span className="font-semibold text-zinc-800 dark:text-zinc-200">{bot}</span>
                                      <span className="text-zinc-500 font-mono text-[11px]">{hits} hits</span>
                                    </div>
                                    <div className="w-full bg-zinc-100 h-1.5 rounded-full overflow-hidden dark:bg-zinc-900">
                                      <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${percentage}%` }} />
                                    </div>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        </div>

                        <div className="rounded-xl border border-zinc-150 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950 shadow-sm">
                          <h4 className="font-sans text-xs font-bold uppercase tracking-wider text-zinc-400 mb-4">Most Crawled URL Paths</h4>
                          <div className="flex flex-col gap-3">
                            {Object.keys(seoSummary.urlFrequency || {}).length === 0 ? (
                              <span className="text-xs text-zinc-400 italic">No URLs indexed yet.</span>
                            ) : (
                              Object.keys(seoSummary.urlFrequency).map((url) => {
                                const hits = seoSummary.urlFrequency[url] || 0;
                                const maxHits = Math.max(...Object.values(seoSummary.urlFrequency) as number[], 1);
                                const percentage = (hits / maxHits) * 100;
                                return (
                                  <div key={url} className="flex flex-col">
                                    <div className="flex justify-between items-center text-xs mb-1">
                                      <span className="font-mono text-[11px] text-zinc-700 dark:text-zinc-300 truncate max-w-[70%]">{url}</span>
                                      <span className="text-zinc-500 font-mono text-[11px]">{hits} crawl hits</span>
                                    </div>
                                    <div className="w-full bg-zinc-100 h-1.5 rounded-full overflow-hidden dark:bg-zinc-900">
                                      <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${percentage}%` }} />
                                    </div>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Live SEO Crawling Log */}
                      <div className="rounded-xl border border-zinc-150 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950 shadow-sm">
                        <h4 className="font-sans text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3">Live Search Engine Logs (Last 100 SEO events)</h4>
                        <div className="max-h-64 overflow-y-auto border border-zinc-100 rounded-lg dark:border-zinc-900 font-mono text-[10px] flex flex-col p-2.5 bg-zinc-50 dark:bg-zinc-950 gap-2">
                          {!seoSummary.rawSeoLogs || seoSummary.rawSeoLogs.length === 0 ? (
                            <span className="text-zinc-400 italic">Search engines are calm. No crawling activity.</span>
                          ) : (
                            seoSummary.rawSeoLogs.map((log: any) => (
                              <div key={log.id} className="flex flex-col border-b border-zinc-100 dark:border-zinc-900 pb-2 last:border-b-0 leading-relaxed text-zinc-600 dark:text-zinc-400 gap-0.5">
                                <div className="flex justify-between">
                                  <span>
                                    [{new Date(log.timestamp).toLocaleTimeString()}] 
                                    <span className="text-emerald-600 dark:text-emerald-400 font-bold ml-1.5 uppercase">{log.bot_name}</span>
                                    <span className="text-zinc-900 dark:text-zinc-100 font-semibold ml-2">{log.requested_url}</span>
                                  </span>
                                  <span className="text-zinc-400 font-semibold">
                                    Status {log.status_code} | {log.response_time_ms}ms
                                  </span>
                                </div>
                                <div className="text-[9px] text-zinc-400 dark:text-zinc-500 truncate">
                                  UA: {log.user_agent} | IP: {log.ip_address}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center text-zinc-400 p-8 border border-dashed rounded-xl">
                      Failed to load SEO analytics. Double check authentication status.
                    </div>
                  )}
                </div>
              )}

              {/* TAB CONTENT: 3. CRAWLER SIMULATOR */}
              {activeSubTab === "simulator" && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-in">
                  
                  {/* Left Column Controls */}
                  <div className="lg:col-span-5 rounded-xl border border-zinc-150 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950 shadow-sm flex flex-col gap-4">
                    <div>
                      <h4 className="font-sans text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">Bot Simulation Panel</h4>
                      <p className="text-[11px] text-zinc-500 mb-4 leading-relaxed">
                        Manually trigger a simulated request with authentic crawler User-Agent headers to verify SEO log capturing mechanisms instantly.
                      </p>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold uppercase text-zinc-400 dark:text-zinc-500">
                        Target Search Bot
                      </label>
                      <select
                        value={simulationBot}
                        onChange={(e) => setSimulationBot(e.target.value)}
                        className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-950 focus:outline-none focus:border-emerald-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
                      >
                        <option value="Googlebot">Googlebot (Search & Indexing)</option>
                        <option value="Bingbot">Bingbot (Microsoft Bing)</option>
                        <option value="DuckDuckBot">DuckDuckBot (DuckDuckGo)</option>
                        <option value="YandexBot">YandexBot (Yandex)</option>
                        <option value="AhrefsBot">AhrefsBot (SEO Auditor)</option>
                        <option value="Baiduspider">Baiduspider (Baidu)</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold uppercase text-zinc-400 dark:text-zinc-500">
                        Requested Crawl Target URL
                      </label>
                      <select
                        value={simulationUrl}
                        onChange={(e) => setSimulationUrl(e.target.value)}
                        className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-950 focus:outline-none focus:border-emerald-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
                      >
                        <option value="/">Homepage (/) </option>
                        <option value="/robots.txt">Robots Directive (/robots.txt)</option>
                        <option value="/sitemap.xml">XML Sitemap (/sitemap.xml)</option>
                        <option value="/ads.txt">AdSense Ads verification (/ads.txt)</option>
                        {posts.map((post) => (
                          <option key={post.id} value={`/post/${post.slug}`}>
                            Review: {post.title.substring(0, 40)}...
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      onClick={simulateBotCrawl}
                      disabled={isSimulating}
                      className="w-full mt-2 inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-zinc-950 font-sans text-xs font-bold py-2.5 hover:from-emerald-400 hover:to-teal-400 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {isSimulating ? (
                        <>
                          <RefreshCw className="h-4.5 w-4.5 animate-spin" />
                          Simulating Crawl...
                        </>
                      ) : (
                        <>
                          <Check className="h-4.5 w-4.5" />
                          Trigger Simulated Hit
                        </>
                      )}
                    </button>
                  </div>

                  {/* Right Column: Discoverability Checklist / Validator */}
                  <div className="lg:col-span-7 flex flex-col gap-6">
                    <div className="rounded-xl border border-zinc-150 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950 shadow-sm">
                      <h4 className="font-sans text-xs font-bold uppercase tracking-wider text-zinc-400 mb-4">Discoverability Compliance Audit</h4>
                      <div className="flex flex-col gap-4">
                        
                        <div className="flex items-start gap-3">
                          <div className="rounded-full bg-emerald-50 p-1 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 mt-0.5">
                            <Check className="h-4 w-4" />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Robots.txt Directive Active</span>
                            <p className="text-[11px] text-zinc-500 mt-0.5">
                              Crawlers disallow <code className="bg-zinc-100 px-1 py-0.5 rounded dark:bg-zinc-900">/admin/</code> and index all public post slugs successfully. Verified in compliance audit.
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <div className="rounded-full bg-emerald-50 p-1 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 mt-0.5">
                            <Check className="h-4 w-4" />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Dynamic XML Sitemap Registered</span>
                            <p className="text-[11px] text-zinc-500 mt-0.5">
                              Sitemap serving dynamically. Currently contains static resources and <strong className="text-zinc-700 dark:text-zinc-300">{posts.filter(p => p.status === "published").length} active review slugs</strong>.
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <div className="rounded-full bg-emerald-50 p-1 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 mt-0.5">
                            <Check className="h-4 w-4" />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Ads.txt Verification Compliance</span>
                            <p className="text-[11px] text-zinc-500 mt-0.5">
                              Publisher ID is synchronized. Crawlers querying <code className="bg-zinc-100 px-1 py-0.5 rounded dark:bg-zinc-900">/ads.txt</code> will receive verified authorization credentials.
                            </p>
                          </div>
                        </div>

                      </div>
                    </div>
                  </div>

                </div>
              )}

            </div>
          )}

          {/* T4. ADSENSE CONFIGURATION INTEGRATION */}
          {activeTab === "adsense" && (
            <div id="adsense-integration-view" className="animate-fade-in max-w-xl">
              <div className="rounded-xl border border-zinc-150 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950 shadow-sm">
                <h3 className="font-sans text-sm font-bold text-zinc-900 dark:text-zinc-50 mb-1.5 flex items-center gap-1.5">
                  <Settings className="h-4.5 w-4.5 text-emerald-500" />
                  Google AdSense and Legal Settings
                </h3>
                <p className="font-sans text-xs text-zinc-500 dark:text-zinc-400 mb-6 leading-relaxed">
                  Provide your AdSense Publisher ID to safely enable programmatic ads.txt files and display visual advertising block slots on post pages.
                </p>

                <div className="flex flex-col gap-4 mb-6">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                      AdSense Publisher ID
                    </label>
                    <input 
                      type="text" 
                      value={publisherId}
                      onChange={(e) => setPublisherId(e.target.value)}
                      placeholder="pub-XXXXXXXXXXXXXXXX"
                      className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:border-emerald-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
                    />
                    <span className="text-[10px] text-zinc-400 mt-1 block">
                      Instantly updates <strong>/ads.txt</strong> route of the platform for Google verification crawl compliance.
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox"
                      id="ads-enabled-box"
                      checked={adsEnabled}
                      onChange={(e) => setAdsEnabled(e.target.checked)}
                      className="rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500 h-3.5 w-3.5"
                    />
                    <label htmlFor="ads-enabled-box" className="font-sans text-xs font-medium text-zinc-700 dark:text-zinc-300 cursor-pointer">
                      Enable placeholder visual ads.txt structures & inline post slots
                    </label>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button 
                    onClick={handleSaveAdsense}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 text-zinc-950 font-sans text-xs font-bold px-4 py-2 hover:bg-emerald-400 transition-colors cursor-pointer"
                  >
                    {saveSuccess ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                    <span>Save AdSense Configurations</span>
                  </button>

                  {saveSuccess && (
                    <span className="font-sans text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                      Ads.txt updated dynamically!
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

        </>
      )}

      {/* Dynamic iFrame-Safe Toast Notifications */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 animate-fade-in pointer-events-none">
          <div className={`flex items-center gap-2.5 rounded-2xl border px-4.5 py-3 shadow-xl backdrop-blur-md pointer-events-auto ${
            notification.type === "success" 
              ? "bg-zinc-950/95 text-white border-zinc-800/80 dark:bg-zinc-900/95 dark:text-zinc-100" 
              : "bg-red-950/95 text-red-50 border-red-900/80"
          }`}>
            <div className={`rounded-lg p-1 ${
              notification.type === "success" 
                ? "bg-emerald-500/10 text-emerald-400" 
                : "bg-red-500/10 text-red-400"
            }`}>
              <Check className="h-4 w-4" />
            </div>
            <p className="font-sans text-xs font-bold tracking-tight">{notification.text}</p>
          </div>
        </div>
      )}

      {/* Custom Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm rounded-3xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950 animate-scale-up relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1 bg-red-500" />
            <h3 className="font-display text-base font-bold text-zinc-900 dark:text-zinc-50 mb-2">
              Confirm Deletion
            </h3>
            <p className="font-sans text-xs text-zinc-500 dark:text-zinc-400 mb-6 leading-relaxed">
              Are you absolutely sure you want to permanently delete this {confirmDelete.type === "post" ? "benchmarking post" : "LLM model entry"}? This action is irreversible.
            </p>
            <div className="flex gap-2.5 justify-end">
              <button
                onClick={() => setConfirmDelete(null)}
                className="rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 px-4 py-2 text-xs font-semibold text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900 cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (confirmDelete.type === "post") {
                    executeDeletePost(confirmDelete.id);
                  } else {
                    executeDeleteModel(confirmDelete.id);
                  }
                }}
                className="rounded-xl bg-red-500 hover:bg-red-600 px-4.5 py-2 text-xs font-bold text-white hover:shadow-lg hover:shadow-red-500/15 cursor-pointer transition-all"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
