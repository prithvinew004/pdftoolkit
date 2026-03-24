import { tools, categories, getPopularTools } from "@/data/tools";
import SearchBar from "@/components/SearchBar";
import CategoryCard from "@/components/CategoryCard";
import ToolGrid from "@/components/ToolGrid";
import AdPlaceholder from "@/components/AdPlaceholder";
import Link from "next/link";

export default function Home() {
  return (
    <div className="bg-grid">
      {/* Hero */}
      <section className="relative overflow-hidden pt-20 sm:pt-28 pb-16 sm:pb-20">
        <div className="hero-glow bg-accent left-1/2 top-0 -translate-x-1/2" />
        <div className="hero-glow bg-fuchsia-500 right-0 top-20" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center animate-fade-in">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-accent/20 bg-accent/5 text-[13px] font-medium text-accent mb-8">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
              Now with AI-powered PDF summarization
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-bold tracking-tight text-gray-900 dark:text-white leading-[1.1]">
              The modern toolkit for
              <br />
              <span className="bg-gradient-to-r from-accent via-violet-500 to-fuchsia-500 bg-clip-text text-transparent">all your PDF needs</span>
            </h1>
            <p className="mt-6 text-base sm:text-lg text-gray-500 dark:text-gray-400 max-w-xl mx-auto leading-relaxed">
              Convert, edit, compress, secure and summarize PDFs — all in your browser. No signup, no installation, completely free.
            </p>
            <div className="mt-8 flex items-center justify-center gap-3">
              <Link href="/dashboard" className="px-6 py-2.5 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent-dark shadow-lg shadow-accent/20 hover:shadow-accent/30 transition-all duration-200">
                Open Dashboard
              </Link>
              <Link href="/tools/ai-pdf-summary" className="px-6 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-all duration-200">
                Try AI Summary →
              </Link>
            </div>
          </div>

          {/* Search */}
          <div className="mt-12 animate-slide-up">
            <SearchBar />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Stats bar */}
        <section className="pb-16 animate-fade-in">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "PDF Tools", value: `${tools.length}+` },
              { label: "Categories", value: `${categories.length}` },
              { label: "100% Free", value: "Always" },
              { label: "No Signup", value: "Required" },
            ].map(s => (
              <div key={s.label} className="rounded-xl border border-gray-200/60 dark:border-gray-800/60 bg-white/50 dark:bg-gray-900/30 p-4 text-center">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{s.value}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        <AdPlaceholder slot="horizontal" />

        {/* Categories */}
        <section className="pb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Browse by Category</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
            {categories.map(c => <CategoryCard key={c.slug} category={c} />)}
          </div>
        </section>

        {/* Popular Tools */}
        <section className="pb-16">
          <ToolGrid tools={getPopularTools()} title="⚡ Popular Tools" />
        </section>

        <AdPlaceholder slot="horizontal" />

        {/* Feature highlight: AI Summary */}
        <section className="pb-16">
          <div className="rounded-2xl border border-gray-200/60 dark:border-gray-800/60 bg-gradient-to-br from-violet-50 to-fuchsia-50 dark:from-violet-900/10 dark:to-fuchsia-900/10 p-8 sm:p-12">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 text-xs font-medium mb-4">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
                  NEW — AI Powered
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                  Summarize any PDF<br />with AI instantly
                </h3>
                <p className="mt-4 text-gray-600 dark:text-gray-400 leading-relaxed">
                  Upload a research paper, article, or textbook and get an instant AI-generated summary. Perfect for students who need to quickly understand long documents.
                </p>
                <Link href="/tools/ai-pdf-summary" className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent-dark shadow-lg shadow-accent/20 transition-all">
                  Try AI Summary
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                </Link>
              </div>
              <div className="hidden md:block">
                <div className="rounded-xl border border-gray-200/60 dark:border-gray-700/60 bg-white/80 dark:bg-gray-900/60 p-6 shadow-xl shadow-violet-500/5">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                  <div className="space-y-3">
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
                    <div className="mt-4 p-3 rounded-lg bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800">
                      <div className="flex items-center gap-2 mb-2">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-violet-500"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
                        <span className="text-xs font-medium text-violet-600 dark:text-violet-400">AI Summary</span>
                      </div>
                      <div className="space-y-1.5">
                        <div className="h-1.5 bg-violet-200 dark:bg-violet-800 rounded w-full" />
                        <div className="h-1.5 bg-violet-200 dark:bg-violet-800 rounded w-4/5" />
                        <div className="h-1.5 bg-violet-200 dark:bg-violet-800 rounded w-3/4" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* All Tools */}
        <section className="pb-16">
          <ToolGrid tools={tools} title="All Tools" />
        </section>

        <AdPlaceholder slot="horizontal" />

        {/* Why PDFToolkit */}
        <section className="pb-20">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-8 text-center">Built for students, by students</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: "🔒", title: "Privacy First", desc: "Files are processed in your browser. Nothing is uploaded to any server." },
              { icon: "⚡", title: "Lightning Fast", desc: "All tools run client-side for instant results. No waiting for server processing." },
              { icon: "🎓", title: "Student Friendly", desc: "Designed for students — summarize papers, annotate notes, compress assignments." },
              { icon: "💰", title: "100% Free", desc: "No hidden fees, no premium tiers, no credit card required. Free forever." },
              { icon: "🌐", title: "Works Everywhere", desc: "Use on any device with a browser — Windows, Mac, Linux, mobile." },
              { icon: "🤖", title: "AI Powered", desc: "Smart PDF summarization to help you understand documents faster." },
            ].map(f => (
              <div key={f.title} className="rounded-xl border border-gray-200/60 dark:border-gray-800/60 bg-white/50 dark:bg-gray-900/30 p-5 hover:border-gray-300 dark:hover:border-gray-700 transition-colors">
                <span className="text-2xl">{f.icon}</span>
                <h3 className="mt-3 font-semibold text-gray-900 dark:text-white text-sm">{f.title}</h3>
                <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
