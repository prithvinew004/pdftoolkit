import Link from "next/link";
import { Tool } from "@/data/tools";
import DynamicIcon from "./DynamicIcon";

export default function ToolCard({ tool }: { tool: Tool }) {
  return (
    <Link href={`/tools/${tool.slug}`} className="group relative rounded-xl border border-gray-200/60 dark:border-gray-800/60 bg-white/50 dark:bg-gray-900/30 p-5 hover:border-accent/30 hover:bg-accent/[0.02] transition-all duration-200">
      <div className="flex items-start gap-3.5">
        <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center text-accent group-hover:scale-110 transition-transform duration-200">
          <DynamicIcon name={tool.icon} size={16} />
        </div>
        <div className="min-w-0">
          <h3 className="font-medium text-sm text-gray-900 dark:text-white group-hover:text-accent transition-colors">{tool.name}</h3>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">{tool.description}</p>
        </div>
      </div>
    </Link>
  );
}
