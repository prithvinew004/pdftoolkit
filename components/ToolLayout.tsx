"use client";
import { Tool } from "@/data/tools";
import { getRelatedTools } from "@/data/tools";
import ToolCard from "./ToolCard";
import AdPlaceholder from "./AdPlaceholder";
import ToolInterface from "./tools";

export default function ToolLayout({ tool }: { tool: Tool }) {
  const related = getRelatedTools(tool.slug, tool.categorySlug);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        <a href="/" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Home</a>
        <span className="mx-2">/</span>
        <a href={`/category/${tool.categorySlug}`} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">{tool.category}</a>
        <span className="mx-2">/</span>
        <span className="text-gray-900 dark:text-white">{tool.name}</span>
      </nav>

      <div className="grid lg:grid-cols-[1fr_300px] gap-8">
        <div className="space-y-8 animate-fade-in">
          {/* Tool Header */}
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">{tool.name}</h1>
            <p className="mt-2 text-lg text-gray-500 dark:text-gray-400">{tool.description}</p>
          </div>

          {/* Tool-specific Interface */}
          <ToolInterface tool={tool} />

          <AdPlaceholder slot="in-article" />

          {/* Description */}
          <section className="rounded-2xl border border-gray-200/50 dark:border-gray-800/50 bg-white/60 dark:bg-gray-900/40 backdrop-blur-md p-6 sm:p-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">About {tool.name}</h2>
            <div className="prose prose-gray dark:prose-invert max-w-none text-sm leading-relaxed text-gray-600 dark:text-gray-300 space-y-3">
              <p>{tool.description} Our free online tool makes it quick and easy — no software installation required.</p>
              <p>Simply upload your file, let our tool process it, and download the result. Your files are securely processed and automatically deleted after conversion.</p>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white !mt-6">How to use {tool.name}</h3>
              <ol className="list-decimal list-inside space-y-1">
                <li>Click &quot;Choose File&quot; or drag and drop your file above</li>
                <li>Configure the settings for your specific needs</li>
                <li>Click the action button to process your file</li>
                <li>Download your processed file</li>
              </ol>
            </div>
          </section>

          {/* FAQ */}
          <section className="rounded-2xl border border-gray-200/50 dark:border-gray-800/50 bg-white/60 dark:bg-gray-900/40 backdrop-blur-md p-6 sm:p-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {tool.faqs.map((faq, i) => (
                <details key={i} className="group">
                  <summary className="flex items-center justify-between cursor-pointer py-3 text-sm font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                    {faq.q}
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 ml-2 transition-transform group-open:rotate-180"><path d="m6 9 6 6 6-6"/></svg>
                  </summary>
                  <p className="pb-3 text-sm text-gray-500 dark:text-gray-400">{faq.a}</p>
                </details>
              ))}
            </div>
          </section>

          {/* Related Tools */}
          {related.length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Related Tools</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {related.map(t => <ToolCard key={t.slug} tool={t} />)}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <aside className="hidden lg:block space-y-6">
          <AdPlaceholder slot="sidebar" />
          <div className="rounded-2xl border border-gray-200/50 dark:border-gray-800/50 bg-white/60 dark:bg-gray-900/40 backdrop-blur-md p-5">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm">Why PDFToolkit?</h3>
            <ul className="space-y-3 text-sm text-gray-500 dark:text-gray-400">
              {["100% Free", "No Registration", "Secure Processing", "Fast & Reliable", "Works on All Devices"].map(f => (
                <li key={f} className="flex items-center gap-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-green-500 flex-shrink-0"><polyline points="20 6 9 17 4 12"/></svg>
                  {f}
                </li>
              ))}
            </ul>
          </div>
          <AdPlaceholder slot="sidebar" />
        </aside>
      </div>
    </div>
  );
}
