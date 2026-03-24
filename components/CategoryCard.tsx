import Link from "next/link";
import { Category } from "@/data/tools";
import DynamicIcon from "./DynamicIcon";

export default function CategoryCard({ category }: { category: Category }) {
  return (
    <Link href={`/category/${category.slug}`} className="group relative overflow-hidden rounded-xl border border-gray-200/60 dark:border-gray-800/60 bg-white/50 dark:bg-gray-900/30 p-5 hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-200">
      <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${category.color} flex items-center justify-center text-white mb-3 group-hover:scale-110 transition-transform duration-200`}>
        <DynamicIcon name={category.icon} size={16} />
      </div>
      <h3 className="font-medium text-sm text-gray-900 dark:text-white">{category.name}</h3>
      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{category.description}</p>
    </Link>
  );
}
