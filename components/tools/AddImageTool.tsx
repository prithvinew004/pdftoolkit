"use client";
import { useState } from "react";
import { Tool } from "@/data/tools";
import FileUploadZone from "./FileUploadZone";
import ProcessingStatus, { Status } from "./ProcessingStatus";
import { addImageToPdf, downloadPdfBytes, parsePageNumbers } from "@/lib/pdf-utils";

export default function AddImageTool({ tool }: { tool: Tool }) {
  const [file, setFile] = useState<File | null>(null);
  const [image, setImage] = useState<File | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [scale, setScale] = useState(50);
  const [page, setPage] = useState("1");
  const [position, setPosition] = useState<string>("center");
  const [result, setResult] = useState<Uint8Array | null>(null);
  const [error, setError] = useState("");

  const handleFiles = (files: File[]) => setFile(files[0]);

  const process = async () => {
    if (!file || !image) return;
    setStatus("processing");
    setError("");
    try {
      const pageNums = page.toLowerCase() === "all" ? undefined : parsePageNumbers(page);
      const bytes = await addImageToPdf(file, image, scale, position, pageNums);
      setResult(bytes);
      setStatus("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to add image");
      setStatus("error");
    }
  };

  const download = () => { if (result) downloadPdfBytes(result, `image_added_${file?.name || "document.pdf"}`); };
  const reset = () => { setFile(null); setImage(null); setStatus("idle"); setResult(null); setError(""); };

  if (status !== "idle") {
    return <ProcessingStatus status={status} fileName={file?.name} errorMsg={error} onDownload={download} onReset={reset} />;
  }

  return (
    <div className="space-y-6">
      {!file ? (
        <FileUploadZone accept={tool.acceptedFiles} icon={tool.icon} label="Drop your PDF to add an image" onFiles={handleFiles} />
      ) : (
        <>
          <div className="flex items-center gap-3 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/></svg>
            <div className="flex-1"><p className="text-sm font-medium text-gray-900 dark:text-white">{file.name}</p></div>
            <button onClick={reset} className="text-sm text-red-500 hover:text-red-700 transition-colors">Remove</button>
          </div>
          <div className="rounded-2xl border border-gray-200/50 dark:border-gray-800/50 bg-white/60 dark:bg-gray-900/40 backdrop-blur-md p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Image to Add</h3>
            {!image ? (
              <div onClick={() => document.getElementById("img-upload")?.click()} className="cursor-pointer p-8 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 text-center hover:border-blue-400 transition-colors">
                <input id="img-upload" type="file" accept=".jpg,.jpeg,.png" onChange={e => { if (e.target.files?.[0]) setImage(e.target.files[0]); }} className="hidden" />
                <p className="text-sm text-gray-500 dark:text-gray-400">Click to upload image (JPG, PNG)</p>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                <span className="text-sm font-medium text-gray-900 dark:text-white flex-1 truncate">{image.name}</span>
                <button onClick={() => setImage(null)} className="text-xs text-red-500">Remove</button>
              </div>
            )}
            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Position</label>
                <div className="flex flex-wrap gap-2">
                  {["center", "top-left", "top-right", "bottom-left", "bottom-right"].map(p => (
                    <button key={p} onClick={() => setPosition(p)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${position === p ? "bg-blue-600 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"}`}>{p.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Scale: {scale}%</label>
                <input type="range" min={10} max={100} value={scale} onChange={e => setScale(Number(e.target.value))} className="w-full accent-blue-600" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Page</label>
                <input type="text" value={page} onChange={e => setPage(e.target.value)} placeholder="e.g. 1 or all" className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
              </div>
            </div>
            <button onClick={process} disabled={!image} className="mt-6 w-full px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 text-white font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed">Add Image &amp; Download</button>
          </div>
        </>
      )}
    </div>
  );
}
