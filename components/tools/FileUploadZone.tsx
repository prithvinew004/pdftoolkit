"use client";
import { useRef, useState, DragEvent, ChangeEvent } from "react";
import DynamicIcon from "@/components/DynamicIcon";

interface Props {
  accept: string;
  multiple?: boolean;
  icon: string;
  label?: string;
  sublabel?: string;
  onFiles: (files: File[]) => void;
}

export default function FileUploadZone({ accept, multiple, icon, label, sublabel, onFiles }: Props) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length) onFiles(files);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length) onFiles(files);
    e.target.value = "";
  };

  return (
    <div
      onDragOver={e => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`cursor-pointer relative rounded-2xl border-2 border-dashed p-12 text-center transition-all duration-300 ${dragOver ? "border-blue-500 bg-blue-50/50 dark:bg-blue-500/10" : "border-gray-300 dark:border-gray-700 bg-white/50 dark:bg-gray-900/30 backdrop-blur-md hover:border-blue-400 dark:hover:border-blue-600"}`}
    >
      <input ref={inputRef} type="file" accept={accept} multiple={multiple} onChange={handleChange} className="hidden" />
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/10 to-violet-500/10 dark:from-blue-500/20 dark:to-violet-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
          <DynamicIcon name={icon} size={28} />
        </div>
        <div>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">{label || "Drop your file here"}</p>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{sublabel || "or click to browse from your computer"}</p>
        </div>
        <button type="button" className="mt-2 px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 text-white font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0">
          {multiple ? "Choose Files" : "Choose File"}
        </button>
        <p className="text-xs text-gray-400 dark:text-gray-500">Accepted: {accept} · Max 100MB</p>
      </div>
    </div>
  );
}
