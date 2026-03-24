"use client";
import { useState } from "react";
import { Tool } from "@/data/tools";
import FileUploadZone from "./FileUploadZone";
import ProcessingStatus, { Status } from "./ProcessingStatus";
import { extractPdfPages, downloadPdfBytes, parsePageNumbers } from "@/lib/pdf-utils";

export default function ExtractTool({ tool }: { tool: Tool }) {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [pages, setPages] = useState("");
  const [result, setResult] = useState<Uint8Array | null>(null);
  const [error, setError] = useState("");

  const handleFiles = (files: File[]) => setFile(files[0]);

  const process = async () => {
    if (!file || !pages) return;
    setStatus("processing");
    setError("");
    try {
      const pageNums = parsePageNumbers(pages);
      const bytes = await extractPdfPages(file, pageNums);
      setResult(bytes);
      setStatus("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to extract pages");
      setStatus("error");
    }
  };

  const download = () => { if (result) downloadPdfBytes(result, `extracted_${file?.name || "document.pdf"}`); };
  const reset = () => { setFile(null); setStatus("idle"); setResult(null); setError(""); setPages(""); };

  if (status !== "idle") {
    return <ProcessingStatus status={status} fileName={file?.name} errorMsg={error} onDownload={download} onReset={reset} />;
  }

  return (
    <div className="space-y-6">
      {!file ? (
        <FileUploadZone accept={tool.acceptedFiles} icon={tool.icon} label="Drop your PDF to extract pages" onFiles={handleFiles} />
      ) : (
        <>
          <div className="flex items-center gap-3 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/></svg>
            <div className="flex-1"><p className="text-sm font-medium text-gray-900 dark:text-white">{file.name}</p></div>
            <button onClick={reset} className="text-sm text-red-500 hover:text-red-700 transition-colors">Remove</button>
          </div>
          <div className="rounded-2xl border border-gray-200/50 dark:border-gray-800/50 bg-white/60 dark:bg-gray-900/40 backdrop-blur-md p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Extract Settings</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Pages to Extract</label>
              <input type="text" value={pages} onChange={e => setPages(e.target.value)} placeholder="e.g. 1, 3, 5-8, 12" className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" />
              <p className="mt-1 text-xs text-gray-400">Use commas for individual pages and hyphens for ranges</p>
            </div>
            <button onClick={process} disabled={!pages} className="mt-6 w-full px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 text-white font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed">Extract Pages</button>
          </div>
        </>
      )}
    </div>
  );
}
