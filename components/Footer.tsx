import Link from "next/link";
import { categories } from "@/data/tools";

export default function Footer() {
  return (
    <footer className="border-t border-gray-200/60 dark:border-gray-800/60 bg-white/50 dark:bg-[#0a0b0f]/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2.5 text-lg font-bold text-gray-900 dark:text-white">
              <div className="w-6 h-6 rounded-md bg-accent flex items-center justify-center">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/></svg>
              </div>
              PDFToolkit
            </Link>
            <p className="mt-3 text-sm text-gray-500 dark:text-gray-400 max-w-xs leading-relaxed">
              Free online PDF tools for students and professionals. Process files in your browser — no uploads, no signups.
            </p>
          </div>
          {categories.slice(0, 3).map(cat => (
            <div key={cat.slug}>
              <h3 className="text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-3">{cat.name}</h3>
              <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                <li><Link href={`/category/${cat.slug}`} className="hover:text-accent transition-colors">All {cat.name} Tools</Link></li>
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 pt-6 border-t border-gray-200/60 dark:border-gray-800/60 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-gray-400 dark:text-gray-500">
          <p>&copy; {new Date().getFullYear()} PDFToolkit. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors">Terms</Link>
            <Link href="#" className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
