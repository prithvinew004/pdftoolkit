"use client";
import { useState } from "react";
import { Tool } from "@/data/tools";
import FileUploadZone from "./FileUploadZone";
import ProcessingStatus, { Status } from "./ProcessingStatus";
import { compressPdf, downloadPdfBytes } from "@/lib/pdf-utils";

export default function CompressTool({ tool }: { tool: Tool }) {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [level, setLevel] = useState<"low" | "medium" | "high">("medium");
  const [result, setResult] = useState<Uint8Array | null>(null);
  const [error, setError] = useState("");

  const handleFiles = (files: File[]) => setFile(files[0]);

  const process = async () => {
    if (!file) return;
    setStatus("processing");
    setError("");
    try {
      const bytes = await compressPdf(file, level);
      setResult(bytes);
      setStatus("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to compress PDF");
      setStatus("error");
    }
  };

  const download = () => {
    if (result) downloadPdfBytes(result, `compressed_${file?.name || "document.pdf"}`);
  };

  const reset = () => { setFile(null); setStatus("idle"); setResult(null); setError(""); };

  if (status !== "idle") {
    const origSize = file ? (file.size / 1024 / 1024).toFixed(2) : "0";
    const newSize = result ? (result.length / 1024 / 1024).toFixed(2) : "0";
    return (
      <div className="space-y-4">
        <ProcessingStatus status={status} fileName={file?.name} errorMsg={error} onDownload={download} onReset={reset} />
        {status === "done" && result && file && (
          <div className="rounded-2xl border border-gray-200/50 dark:border-gray-800/50 bg-white/60 dark:bg-gray-900/40 backdrop-blur-md p-6 text-center">
            <div className="flex items-center justify-center gap-8">
              <div><p className="text-2xl font-bold text-gray-900 dark:text-white">{origSize} MB</p><p className="text-xs text-gray-500">Original</p></div>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              <div><p className="text-2xl font-bold text-green-600">{newSize} MB</p><p className="text-xs text-gray-500">Compressed</p></div>
            </div>
            <p className="mt-3 text-sm text-green-600 font-medium">Reduced by {Math.max(0, ((1 - result.length / file.size) * 100)).toFixed(1)}%</p>
          </div>
        )}
      </div>
    );
  }

  const levels = [
    { key: "low" as const, label: "Low Compression", desc: "Best quality, slight size reduction", reduction: "~20%" },
    { key: "medium" as const, label: "Recommended", desc: "Good quality, significant size reduction", reduction: "~50%" },
    { key: "high" as const, label: "Maximum Compression", desc: "Smaller file, some quality loss", reduction: "~75%" },
  ];

  return (
    <div className="space-y-6">
      {!file ? (
        <FileUploadZone accept={tool.acceptedFiles} icon={tool.icon} label="Drop your PDF to compress" onFiles={handleFiles} />
      ) : (
        <>
          <div className="flex items-center gap-3 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/></svg>
            <div className="flex-1"><p className="text-sm font-medium text-gray-900 dark:text-white">{file.name}</p><p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p></div>
            <button onClick={reset} className="text-sm text-red-500 hover:text-red-700 transition-colors">Remove</button>
          </div>
          <div className="rounded-2xl border border-gray-200/50 dark:border-gray-800/50 bg-white/60 dark:bg-gray-900/40 backdrop-blur-md p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Compression Level</h3>
            <div className="space-y-3">
              {levels.map(l => (
                <button key={l.key} onClick={() => setLevel(l.key)} className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${level === l.key ? "border-blue-500 bg-blue-50/50 dark:bg-blue-900/20" : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"}`}>
                  <div className="text-left"><p className="text-sm font-medium text-gray-900 dark:text-white">{l.label}</p><p className="text-xs text-gray-500 dark:text-gray-400">{l.desc}</p></div>
                  <span className={`text-sm font-bold ${level === l.key ? "text-blue-600" : "text-gray-400"}`}>{l.reduction}</span>
                </button>
              ))}
            </div>
            <button onClick={process} className="mt-6 w-full px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 text-white font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300">Compress PDF</button>
          </div>
        </>
      )}
    </div>
  );
}
