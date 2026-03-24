"use client";
import {
  FileText, Image, Table, Type, ImagePlus, MessageSquare, Highlighter,
  PenTool, Minimize2, ArrowDownToLine, Zap, Lock, Unlock, KeyRound,
  ShieldCheck, Merge, Split, RotateCw, FileOutput, Hash, Droplets,
  ArrowLeftRight, Pencil, Shield, Wrench, Sparkles, LayoutDashboard, LucideProps,
} from "lucide-react";
import { ForwardRefExoticComponent, RefAttributes } from "react";

type IconComponent = ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;

const iconMap: Record<string, IconComponent> = {
  FileText, Image, Table, Type, ImagePlus, MessageSquare, Highlighter,
  PenTool, Minimize2, ArrowDownToLine, Zap, Lock, Unlock, KeyRound,
  ShieldCheck, Merge, Split, RotateCw, FileOutput, Hash, Droplets,
  ArrowLeftRight, Pencil, Shield, Wrench, Sparkles, LayoutDashboard,
};

interface Props {
  name: string;
  size?: number;
  className?: string;
}

export default function DynamicIcon({ name, size, className }: Props) {
  const Icon = iconMap[name] || FileText;
  return <Icon size={size} className={className} />;
}
