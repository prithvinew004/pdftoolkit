import { Tool } from "@/data/tools";
import ToolCard from "./ToolCard";

export default function ToolGrid({ tools, title }: { tools: Tool[]; title?: string }) {
  return (
    <section>
      {title && <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{title}</h2>}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tools.map(t => <ToolCard key={t.slug} tool={t} />)}
      </div>
    </section>
  );
}
