"use client";
import { useState } from "react";
import { Tool } from "@/data/tools";
import FileUploadZone from "./FileUploadZone";
import ProcessingStatus, { Status } from "./ProcessingStatus";
import { extractTextFromPdf, rebuildPdfWithEditedText, downloadPdfBytes, PdfTextLine } from "@/lib/pdf-utils";

export default function EditTextTool({ tool }: { tool: Tool }) {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [lines, setLines] = useState<PdfTextLine[]>([]);
  const [editing, setEditing] = useState(false);
  const [result, setResult] = useState<Uint8Array | null>(null);
  const [error, setError] = useState("");

  const handleFiles = (files: File[]) => setFile(files[0]);

  const extractText = async () => {
    if (!file) return;
    setStatus("processing");
    setError("");
    try {
      const extracted = await extractTextFromPdf(file);
      setLines(extracted);
      setEditing(true);
      setStatus("idle");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to extract text");
      setStatus("error");
    }
  };

  const updateLine = (idx: number, text: string) => {
    setLines(prev => prev.map((l, i) => i === idx ? { ...l, text } : l));
  };

  const buildPdf = async () => {
    if (!file) return;
    setStatus("processing");
    setError("");
    try {
      const bytes = await rebuildPdfWithEditedText(file, lines);
      setResult(bytes);
      setEditing(false);
      setStatus("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to rebuild PDF");
      setStatus("error");
    }
  };

  const download = () => { if (result) downloadPdfBytes(result, `edited_${file?.name || "document.pdf"}`); };
  const reset = () => { setFile(null); setStatus("idle"); setResult(null); setError(""); setLines([]); setEditing(false); };

  if (status === "processing" || status === "done" || status === "error") {
    if (!editing) {
      return <ProcessingStatus status={status} fileName={file?.name} errorMsg={error} onDownload={download} onReset={reset} />;
    }
  }

  if (editing) {
    const pages = Array.from(new Set(lines.map(l => l.pageIndex))).sort();
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 dark:text-white">Edit Text — {lines.length} lines extracted</h3>
          <div className="flex gap-2">
            <button onClick={reset} className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">Cancel</button>
            <button onClick={buildPdf} className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 text-white text-sm font-medium hover:shadow-lg transition-all">Save & Download PDF</button>
          </div>
        </div>
        <div className="rounded-2xl border border-gray-200/50 dark:border-gray-800/50 bg-white/60 dark:bg-gray-900/40 backdrop-blur-md p-4 max-h-[600px] overflow-y-auto space-y-4">
          {pages.map(pageIdx => (
            <div key={pageIdx}>
              <p className="text-xs font-medium text-gray-400 dark:text-gray-500 mb-2 sticky top-0 bg-white/90 dark:bg-gray-900/90 py-1">Page {pageIdx + 1}</p>
              <div className="space-y-1">
                {lines.filter(l => l.pageIndex === pageIdx).map((line, i) => {
                  const globalIdx = lines.indexOf(line);
                  return (
                    <input
                      key={globalIdx}
                      value={line.text}
                      onChange={e => updateLine(globalIdx, e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                      style={{ fontSize: `${Math.min(Math.max(line.fontSize * 0.8, 10), 18)}px` }}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {!file ? (
        <FileUploadZone accept={tool.acceptedFiles} icon={tool.icon} label="Drop your PDF to edit text" onFiles={handleFiles} />
      ) : (
        <>
          <div className="flex items-center gap-3 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/></svg>
            <div className="flex-1"><p className="text-sm font-medium text-gray-900 dark:text-white">{file.name}</p></div>
            <button onClick={reset} className="text-sm text-red-500 hover:text-red-700 transition-colors">Remove</button>
          </div>
          <button onClick={extractText} className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 text-white font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300">Extract & Edit Text</button>
        </>
      )}
    </div>
  );
}
