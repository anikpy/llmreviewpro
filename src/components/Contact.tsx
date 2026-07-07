import { useState, FormEvent } from "react";
import { Mail, MessageSquare, Send, CheckCircle2 } from "lucide-react";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: ""
  });
  // Anti-spam Honeypot field
  const [honeypot, setHoneypot] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    // If the honeypot field is filled, silently discard (spam protection)
    if (honeypot) {
      console.warn("Spam detected");
      setSubmitted(true);
      return;
    }

    // Simulate submission
    setSubmitted(true);
  };

  return (
    <div id="contact-page" className="mx-auto max-w-xl px-4 py-8 sm:px-6 lg:px-8 animate-fade-in">
      <header className="mb-8 text-center">
        <h1 className="font-sans text-2xl font-extrabold tracking-tight text-zinc-900 sm:text-3xl dark:text-zinc-50">
          Get in Touch
        </h1>
        <p className="font-sans text-xs text-zinc-500 dark:text-zinc-400 mt-2 max-w-xs mx-auto">
          For benchmarking inquiries, publisher partnerships, and custom advertising placement.
        </p>
      </header>

      {submitted ? (
        <div id="contact-success" className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-6 text-center dark:border-emerald-950/30 dark:bg-emerald-950/10 transition-colors">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 mb-4">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <h2 className="font-sans text-base font-bold text-zinc-900 dark:text-zinc-50">Message Sent Successfully</h2>
          <p className="font-sans text-xs text-zinc-500 dark:text-zinc-400 mt-2">
            Our editorial desk typically reviews routing and commercial benchmark submissions within 24 business hours.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-xl border border-zinc-150 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950 shadow-sm">
          
          {/* Honeypot field: Hidden from humans, but filled by automated spam bots */}
          <div className="absolute overflow-hidden -z-50 h-0 w-0 opacity-0 pointer-events-none">
            <label htmlFor="username">Do not fill this field if you are human:</label>
            <input 
              type="text" 
              id="username" 
              name="username" 
              value={honeypot} 
              onChange={(e) => setHoneypot(e.target.value)} 
              tabIndex={-1} 
              autoComplete="off" 
            />
          </div>

          <div>
            <label className="block font-sans text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5" htmlFor="name">
              Your Name
            </label>
            <input
              type="text"
              id="name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 placeholder-zinc-400 focus:border-emerald-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
              placeholder="e.g. Dr. Ada Lovelace"
            />
          </div>

          <div>
            <label className="block font-sans text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5" htmlFor="email">
              Work Email
            </label>
            <input
              type="email"
              id="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 placeholder-zinc-400 focus:border-emerald-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
              placeholder="e.g. ada@analytics.org"
            />
          </div>

          <div>
            <label className="block font-sans text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5" htmlFor="message">
              Message / Submission Details
            </label>
            <textarea
              id="message"
              required
              rows={4}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 placeholder-zinc-400 focus:border-emerald-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
              placeholder="Details regarding hardware config, sample sizes, or custom partner slot queries."
            />
          </div>

          <button
            type="submit"
            className="inline-flex items-center justify-center gap-1.5 w-full rounded-lg bg-zinc-900 text-white font-sans text-xs font-semibold py-2.5 hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-100 transition-colors cursor-pointer mt-2"
          >
            <Send className="h-3.5 w-3.5" /> Send Message
          </button>
        </form>
      )}
    </div>
  );
}
