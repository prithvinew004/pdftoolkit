import { Metadata } from "next";
import { notFound } from "next/navigation";
import { tools, getToolBySlug } from "@/data/tools";
import { toolMeta } from "@/lib/seo";
import ToolLayout from "@/components/ToolLayout";

interface Props { params: { slug: string } }

export async function generateStaticParams() {
  return tools.map(t => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const tool = getToolBySlug(params.slug);
  if (!tool) return {};
  return toolMeta(tool.name, tool.description, tool.slug);
}

export default function ToolPage({ params }: Props) {
  const tool = getToolBySlug(params.slug);
  if (!tool) notFound();
  return <ToolLayout tool={tool} />;
}
