import { useEffect, useState } from "react";
import { Cpu, Moon, Sun, Menu, X, Lock } from "lucide-react";

interface HeaderProps {
  currentPath: string;
  navigate: (path: string) => void;
  isAdmin: boolean;
}

export default function Header({ currentPath, navigate, isAdmin }: HeaderProps) {
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("theme");
      if (saved) return saved === "dark";
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return false;
  });

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  const navItems = [
    { label: "Benchmarks", path: "/" },
    { label: "About Standards", path: "/about" },
    { label: "Contact", path: "/contact" },
  ];

  const handleLinkClick = (path: string) => {
    setMobileMenuOpen(false);
    navigate(path);
  };

  return (
    <header id="main-header" className="sticky top-0 z-50 w-full border-b border-gray-150 bg-white/90 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/90 transition-colors duration-200">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <div 
          id="brand-logo"
          className="flex cursor-pointer items-center gap-2.5 text-zinc-900 dark:text-zinc-50"
          onClick={() => handleLinkClick("/")}
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-zinc-950 shadow-md shadow-emerald-500/15">
            <Cpu className="h-4.5 w-4.5 text-zinc-950 font-bold" />
          </div>
          <span className="font-display font-bold text-lg tracking-tight">LLMReview<span className="text-emerald-500 font-mono">Pro</span></span>
        </div>

        {/* Desktop Navigation */}
        <nav id="desktop-nav" className="hidden md:flex items-center gap-6">
          {navItems.map((item) => {
            const isActive = currentPath === item.path || (item.path !== "/" && currentPath.startsWith(item.path));
            return (
              <button
                key={item.path}
                onClick={() => handleLinkClick(item.path)}
                className={`font-sans text-sm font-medium transition-colors cursor-pointer ${
                  isActive 
                    ? "text-emerald-600 dark:text-emerald-400" 
                    : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Utility Actions */}
        <div id="header-utilities" className="flex items-center gap-2">
          {/* Admin Indicator */}
          {isAdmin && (
            <button
              onClick={() => handleLinkClick("/admin")}
              className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 font-mono text-[11px] font-medium text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 cursor-pointer"
            >
              <Lock className="h-3 w-3" />
              <span>Admin Panel</span>
            </button>
          )}

          {!isAdmin && (
            <button
              onClick={() => handleLinkClick("/admin")}
              title="Admin Access"
              className="p-2 text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-400 cursor-pointer"
            >
              <Lock className="h-4 w-4" />
            </button>
          )}

          {/* Dark Mode Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="rounded-lg p-2 text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
            aria-label="Toggle dark mode"
          >
            {darkMode ? (
              <Sun className="h-4 w-4 text-amber-400" />
            ) : (
              <Moon className="h-4 w-4 text-indigo-600" />
            )}
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg p-2 text-zinc-600 hover:bg-zinc-100 md:hidden dark:text-zinc-400 dark:hover:bg-zinc-900 cursor-pointer"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div id="mobile-nav-drawer" className="border-t border-zinc-150 bg-white px-4 py-3 md:hidden dark:border-zinc-800 dark:bg-zinc-950 transition-colors">
          <div className="flex flex-col gap-2.5">
            {navItems.map((item) => {
              const isActive = currentPath === item.path || (item.path !== "/" && currentPath.startsWith(item.path));
              return (
                <button
                  key={item.path}
                  onClick={() => handleLinkClick(item.path)}
                  className={`w-full text-left font-sans text-sm font-medium py-2 px-3 rounded-lg transition-colors cursor-pointer ${
                    isActive 
                      ? "bg-zinc-100 text-emerald-600 dark:bg-zinc-900 dark:text-emerald-400" 
                      : "text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-900/50"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
            {isAdmin && (
              <button
                onClick={() => handleLinkClick("/admin")}
                className="w-full text-left font-mono text-xs font-semibold py-2 px-3 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 hover:bg-emerald-500/10 rounded-lg cursor-pointer flex items-center gap-2"
              >
                <Lock className="h-3 w-3" />
                Go to Admin Dashboard
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
