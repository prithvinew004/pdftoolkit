"use client";
import { useState } from "react";
import { Tool } from "@/data/tools";
import FileUploadZone from "./FileUploadZone";
import ProcessingStatus, { Status } from "./ProcessingStatus";
import { splitPdfByRanges, splitPdfEveryN, extractPdfPages, downloadPdfBytes, downloadMultiplePdfs, parsePageRanges, parsePageNumbers } from "@/lib/pdf-utils";

export default function SplitTool({ tool }: { tool: Tool }) {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [mode, setMode] = useState<"range" | "every" | "extract">("range");
  const [pageRange, setPageRange] = useState("1-3, 4-6");
  const [everyN, setEveryN] = useState(1);
  const [extractPagesInput, setExtractPagesInput] = useState("1, 3, 5");
  const [results, setResults] = useState<Uint8Array[]>([]);
  const [singleResult, setSingleResult] = useState<Uint8Array | null>(null);
  const [error, setError] = useState("");

  const handleFiles = (files: File[]) => setFile(files[0]);

  const process = async () => {
    if (!file) return;
    setStatus("processing");
    setError("");
    try {
      if (mode === "range") {
        const ranges = parsePageRanges(pageRange);
        const pdfs = await splitPdfByRanges(file, ranges);
        setResults(pdfs);
      } else if (mode === "every") {
        const pdfs = await splitPdfEveryN(file, everyN);
        setResults(pdfs);
      } else {
        const pages = parsePageNumbers(extractPagesInput);
        const pdf = await extractPdfPages(file, pages);
        setSingleResult(pdf);
      }
      setStatus("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to split PDF");
      setStatus("error");
    }
  };

  const download = () => {
    const name = file?.name.replace(".pdf", "") || "split";
    if (singleResult) {
      downloadPdfBytes(singleResult, `${name}_extracted.pdf`);
    } else {
      downloadMultiplePdfs(results, name);
    }
  };

  const reset = () => { setFile(null); setStatus("idle"); setResults([]); setSingleResult(null); setError(""); };

  if (status !== "idle") {
    return <ProcessingStatus status={status} fileName={file?.name} errorMsg={error} onDownload={download} onReset={reset} />;
  }

  return (
    <div className="space-y-6">
      {!file ? (
        <FileUploadZone accept={tool.acceptedFiles} icon={tool.icon} label="Drop your PDF to split" onFiles={handleFiles} />
      ) : (
        <>
          <div className="flex items-center gap-3 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/></svg>
            <div className="flex-1"><p className="text-sm font-medium text-gray-900 dark:text-white">{file.name}</p><p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p></div>
            <button onClick={reset} className="text-sm text-red-500 hover:text-red-700 transition-colors">Remove</button>
          </div>
          <div className="rounded-2xl border border-gray-200/50 dark:border-gray-800/50 bg-white/60 dark:bg-gray-900/40 backdrop-blur-md p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Split Options</h3>
            <div className="flex gap-3 mb-6">
              {([["range", "By Page Ranges"], ["every", "Split Every N Pages"], ["extract", "Extract Specific Pages"]] as const).map(([key, label]) => (
                <button key={key} onClick={() => setMode(key)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${mode === key ? "bg-blue-600 text-white shadow-md" : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"}`}>{label}</button>
              ))}
            </div>
            {mode === "range" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Page Ranges</label>
                <input type="text" value={pageRange} onChange={e => setPageRange(e.target.value)} placeholder="e.g. 1-3, 4-6, 7-10" className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" />
                <p className="mt-1 text-xs text-gray-400">Each range becomes a separate PDF.</p>
              </div>
            )}
            {mode === "every" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Split every</label>
                <div className="flex items-center gap-3">
                  <input type="number" min={1} max={100} value={everyN} onChange={e => setEveryN(Number(e.target.value))} className="w-24 px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" />
                  <span className="text-sm text-gray-500">page(s)</span>
                </div>
              </div>
            )}
            {mode === "extract" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Pages to Extract</label>
                <input type="text" value={extractPagesInput} onChange={e => setExtractPagesInput(e.target.value)} placeholder="e.g. 1, 3, 5, 8" className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" />
                <p className="mt-1 text-xs text-gray-400">Comma-separated page numbers.</p>
              </div>
            )}
            <button onClick={process} className="mt-6 w-full px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 text-white font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300">Split PDF</button>
          </div>
        </>
      )}
    </div>
  );
}
