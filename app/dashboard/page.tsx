"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { tools, categories, getPopularTools } from "@/data/tools";
import DynamicIcon from "@/components/DynamicIcon";

interface RecentFile {
  name: string;
  tool: string;
  toolSlug: string;
  date: string;
  size: string;
}

export default function DashboardPage() {
  const [recentFiles, setRecentFiles] = useState<RecentFile[]>([]);
  const [greeting, setGreeting] = useState("Good morning");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 12 && hour < 17) setGreeting("Good afternoon");
    else if (hour >= 17) setGreeting("Good evening");

    // Load recent files from localStorage
    const stored = localStorage.getItem("pdftoolkit_recent");
    if (stored) {
      try { setRecentFiles(JSON.parse(stored)); } catch {}
    }
  }, []);

  const quickTools = getPopularTools().slice(0, 8);

  return (
    <div className="bg-grid min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-10 animate-fade-in">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{greeting} 👋</h1>
          <p className="mt-2 text-gray-500 dark:text-gray-400">What would you like to do with your PDFs today?</p>
        </div>

        {/* Quick Actions Grid */}
        <section className="mb-10 animate-slide-up">
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {quickTools.map(tool => (
              <Link
                key={tool.slug}
                href={`/tools/${tool.slug}`}
                className="group flex flex-col items-center gap-3 p-5 rounded-xl border border-gray-200/60 dark:border-gray-800/60 bg-white/50 dark:bg-gray-900/30 hover:border-accent/40 hover:bg-accent/[0.02] transition-all duration-200"
              >
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center text-accent group-hover:scale-110 transition-transform">
                  <DynamicIcon name={tool.icon} size={18} />
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center">{tool.name}</span>
              </Link>
            ))}
          </div>
        </section>

        <div className="grid lg:grid-cols-[1fr_320px] gap-8">
          {/* Main content */}
          <div className="space-y-8">
            {/* Recent Files */}
            <section>
              <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Recent Files</h2>
              {recentFiles.length > 0 ? (
                <div className="rounded-xl border border-gray-200/60 dark:border-gray-800/60 bg-white/50 dark:bg-gray-900/30 divide-y divide-gray-200/60 dark:divide-gray-800/60 overflow-hidden">
                  {recentFiles.map((file, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors">
                      <div className="w-9 h-9 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center flex-shrink-0">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/></svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{file.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{file.tool} · {file.size}</p>
                      </div>
                      <span className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0">{file.date}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-gray-200/60 dark:border-gray-800/60 border-dashed bg-white/30 dark:bg-gray-900/20 p-12 text-center">
                  <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/></svg>
                  </div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No recent files</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Files you process will appear here</p>
                </div>
              )}
            </section>

            {/* All Categories */}
            <section>
              <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">All Categories</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {categories.map(cat => (
                  <Link
                    key={cat.slug}
                    href={`/category/${cat.slug}`}
                    className="group flex items-center gap-4 p-4 rounded-xl border border-gray-200/60 dark:border-gray-800/60 bg-white/50 dark:bg-gray-900/30 hover:border-gray-300 dark:hover:border-gray-700 transition-all"
                  >
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${cat.color} flex items-center justify-center text-white flex-shrink-0 group-hover:scale-110 transition-transform`}>
                      <DynamicIcon name={cat.icon} size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{cat.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{cat.description}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Stats */}
            <div className="rounded-xl border border-gray-200/60 dark:border-gray-800/60 bg-white/50 dark:bg-gray-900/30 p-5">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Your Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Files processed</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">{recentFiles.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Tools available</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">{tools.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Storage used</span>
                  <span className="text-sm font-semibold text-green-600">0 MB (local)</span>
                </div>
              </div>
            </div>

            {/* AI Feature Card */}
            <Link href="/tools/ai-pdf-summary" className="block rounded-xl border border-violet-200/60 dark:border-violet-800/40 bg-gradient-to-br from-violet-50 to-fuchsia-50 dark:from-violet-900/10 dark:to-fuchsia-900/10 p-5 hover:shadow-lg hover:shadow-violet-500/5 transition-all">
              <div className="flex items-center gap-2 mb-3">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-violet-500"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
                <span className="text-sm font-semibold text-violet-700 dark:text-violet-300">AI Summary</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Summarize research papers, articles, and textbooks instantly with AI.</p>
              <span className="inline-flex items-center gap-1 mt-3 text-xs font-medium text-violet-600 dark:text-violet-400">
                Try it now
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </span>
            </Link>

            {/* Tips */}
            <div className="rounded-xl border border-gray-200/60 dark:border-gray-800/60 bg-white/50 dark:bg-gray-900/30 p-5">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">💡 Tips</h3>
              <ul className="space-y-2.5 text-sm text-gray-500 dark:text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">•</span>
                  All processing happens in your browser — your files never leave your device
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">•</span>
                  Drag and drop files directly onto any tool page
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-violet-500 mt-0.5">•</span>
                  Use AI Summary for quick understanding of long documents
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
