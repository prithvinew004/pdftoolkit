"use client";
import { useState } from "react";
import { Tool } from "@/data/tools";
import FileUploadZone from "./FileUploadZone";
import ProcessingStatus, { Status } from "./ProcessingStatus";
import { addTextToPdf, downloadPdfBytes, parsePageNumbers } from "@/lib/pdf-utils";

export default function AddTextTool({ tool }: { tool: Tool }) {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [text, setText] = useState("");
  const [fontSize, setFontSize] = useState(16);
  const [color, setColor] = useState("#000000");
  const [position, setPosition] = useState("top-left");
  const [page, setPage] = useState("all");
  const [result, setResult] = useState<Uint8Array | null>(null);
  const [error, setError] = useState("");

  const handleFiles = (files: File[]) => setFile(files[0]);

  const process = async () => {
    if (!file || !text) return;
    setStatus("processing");
    setError("");
    try {
      const pageNums = page.toLowerCase() === "all" ? undefined : parsePageNumbers(page);
      const bytes = await addTextToPdf(file, text, fontSize, color, position, pageNums);
      setResult(bytes);
      setStatus("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to add text");
      setStatus("error");
    }
  };

  const download = () => { if (result) downloadPdfBytes(result, `text_added_${file?.name || "document.pdf"}`); };
  const reset = () => { setFile(null); setStatus("idle"); setResult(null); setError(""); setText(""); };

  if (status !== "idle") {
    return <ProcessingStatus status={status} fileName={file?.name} errorMsg={error} onDownload={download} onReset={reset} />;
  }

  const positions = [
    ["top-left", "Top Left"], ["top-center", "Top Center"], ["top-right", "Top Right"],
    ["bottom-left", "Bottom Left"], ["bottom-center", "Bottom Center"], ["bottom-right", "Bottom Right"],
  ] as const;

  return (
    <div className="space-y-6">
      {!file ? (
        <FileUploadZone accept={tool.acceptedFiles} icon={tool.icon} label="Drop your PDF to add text" onFiles={handleFiles} />
      ) : (
        <>
          <div className="flex items-center gap-3 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/></svg>
            <div className="flex-1"><p className="text-sm font-medium text-gray-900 dark:text-white">{file.name}</p><p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p></div>
            <button onClick={reset} className="text-sm text-red-500 hover:text-red-700 transition-colors">Remove</button>
          </div>
          <div className="rounded-2xl border border-gray-200/50 dark:border-gray-800/50 bg-white/60 dark:bg-gray-900/40 backdrop-blur-md p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Add Text</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Text Content</label>
                <textarea value={text} onChange={e => setText(e.target.value)} rows={3} placeholder="Enter the text you want to add..." className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Position</label>
                <div className="grid grid-cols-3 gap-2">
                  {positions.map(([key, label]) => (
                    <button key={key} onClick={() => setPosition(key)} className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${position === key ? "bg-blue-600 text-white shadow-md" : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"}`}>{label}</button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Size</label>
                  <input type="number" min={8} max={72} value={fontSize} onChange={e => setFontSize(Number(e.target.value))} className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Color</label>
                  <input type="color" value={color} onChange={e => setColor(e.target.value)} className="w-full h-[46px] rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 cursor-pointer" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Pages</label>
                  <input type="text" value={page} onChange={e => setPage(e.target.value)} placeholder="all" className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
                </div>
              </div>
            </div>
            <button onClick={process} disabled={!text} className="mt-6 w-full px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 text-white font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed">Add Text &amp; Download</button>
          </div>
        </>
      )}
    </div>
  );
}
