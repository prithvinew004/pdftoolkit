import { Metadata } from "next";
import { notFound } from "next/navigation";
import { categories, getCategoryBySlug, getToolsByCategory } from "@/data/tools";
import { categoryMeta } from "@/lib/seo";
import ToolGrid from "@/components/ToolGrid";
import AdPlaceholder from "@/components/AdPlaceholder";
import DynamicIcon from "@/components/DynamicIcon";

interface Props { params: { slug: string } }

export async function generateStaticParams() {
  return categories.map(c => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const cat = getCategoryBySlug(params.slug);
  if (!cat) return {};
  return categoryMeta(cat.name, cat.description, cat.slug);
}

export default function CategoryPage({ params }: Props) {
  const cat = getCategoryBySlug(params.slug);
  if (!cat) notFound();
  const catTools = getToolsByCategory(cat.slug);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <nav className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        <a href="/" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Home</a>
        <span className="mx-2">/</span>
        <span className="text-gray-900 dark:text-white">{cat.name}</span>
      </nav>

      <div className="flex items-center gap-4 mb-8 animate-fade-in">
        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-white`}>
          <DynamicIcon name={cat.icon} size={26} />
        </div>
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">{cat.name}</h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400">{cat.description}</p>
        </div>
      </div>

      <AdPlaceholder slot="horizontal" />
      <ToolGrid tools={catTools} />
      <AdPlaceholder slot="horizontal" />
    </div>
  );
}
