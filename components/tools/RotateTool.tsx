"use client";
import { useState } from "react";
import { Tool } from "@/data/tools";
import FileUploadZone from "./FileUploadZone";
import ProcessingStatus, { Status } from "./ProcessingStatus";
import { rotatePdf, downloadPdfBytes, parsePageNumbers } from "@/lib/pdf-utils";

export default function RotateTool({ tool }: { tool: Tool }) {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [angle, setAngle] = useState(90);
  const [applyTo, setApplyTo] = useState<"all" | "specific">("all");
  const [pages, setPages] = useState("");
  const [result, setResult] = useState<Uint8Array | null>(null);
  const [error, setError] = useState("");

  const handleFiles = (files: File[]) => setFile(files[0]);

  const process = async () => {
    if (!file) return;
    setStatus("processing");
    setError("");
    try {
      const pageNums = applyTo === "specific" ? parsePageNumbers(pages) : undefined;
      const bytes = await rotatePdf(file, angle, pageNums);
      setResult(bytes);
      setStatus("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to rotate PDF");
      setStatus("error");
    }
  };

  const download = () => { if (result) downloadPdfBytes(result, `rotated_${file?.name || "document.pdf"}`); };
  const reset = () => { setFile(null); setStatus("idle"); setResult(null); setError(""); };

  if (status !== "idle") {
    return <ProcessingStatus status={status} fileName={file?.name} errorMsg={error} onDownload={download} onReset={reset} />;
  }

  return (
    <div className="space-y-6">
      {!file ? (
        <FileUploadZone accept={tool.acceptedFiles} icon={tool.icon} label="Drop your PDF to rotate" onFiles={handleFiles} />
      ) : (
        <>
          <div className="flex items-center gap-3 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/></svg>
            <div className="flex-1"><p className="text-sm font-medium text-gray-900 dark:text-white">{file.name}</p></div>
            <button onClick={reset} className="text-sm text-red-500 hover:text-red-700 transition-colors">Remove</button>
          </div>
          <div className="rounded-2xl border border-gray-200/50 dark:border-gray-800/50 bg-white/60 dark:bg-gray-900/40 backdrop-blur-md p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Rotation Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Rotation Angle</label>
                <div className="flex gap-3">
                  {[90, 180, 270].map(a => (
                    <button key={a} onClick={() => setAngle(a)} className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${angle === a ? "border-blue-500 bg-blue-50/50 dark:bg-blue-900/20" : "border-gray-200 dark:border-gray-700"}`}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600 dark:text-gray-300" style={{ transform: `rotate(${a}deg)` }}><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{a}°</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Apply To</label>
                <div className="flex gap-3">
                  <button onClick={() => setApplyTo("all")} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${applyTo === "all" ? "bg-blue-600 text-white shadow-md" : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"}`}>All Pages</button>
                  <button onClick={() => setApplyTo("specific")} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${applyTo === "specific" ? "bg-blue-600 text-white shadow-md" : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"}`}>Specific Pages</button>
                </div>
                {applyTo === "specific" && <input type="text" value={pages} onChange={e => setPages(e.target.value)} placeholder="e.g. 1, 3, 5-8" className="mt-3 w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" />}
              </div>
            </div>
            <button onClick={process} className="mt-6 w-full px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 text-white font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300">Rotate PDF</button>
          </div>
        </>
      )}
    </div>
  );
}
