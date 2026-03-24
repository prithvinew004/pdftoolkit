"use client";
import { useState } from "react";
import { Tool } from "@/data/tools";
import FileUploadZone from "./FileUploadZone";
import ProcessingStatus, { Status } from "./ProcessingStatus";
import { addWatermark, downloadPdfBytes } from "@/lib/pdf-utils";

export default function WatermarkTool({ tool }: { tool: Tool }) {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [text, setText] = useState("CONFIDENTIAL");
  const [opacity, setOpacity] = useState(30);
  const [rotation, setRotation] = useState(-45);
  const [position, setPosition] = useState<"center" | "tile">("center");
  const [fontSize, setFontSize] = useState(48);
  const [color, setColor] = useState("#999999");
  const [result, setResult] = useState<Uint8Array | null>(null);
  const [error, setError] = useState("");

  const handleFiles = (files: File[]) => setFile(files[0]);

  const process = async () => {
    if (!file || !text) return;
    setStatus("processing");
    setError("");
    try {
      const bytes = await addWatermark(file, text, fontSize, color, opacity, rotation, position === "tile");
      setResult(bytes);
      setStatus("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to add watermark");
      setStatus("error");
    }
  };

  const download = () => { if (result) downloadPdfBytes(result, `watermarked_${file?.name || "document.pdf"}`); };
  const reset = () => { setFile(null); setStatus("idle"); setResult(null); setError(""); };

  if (status !== "idle") {
    return <ProcessingStatus status={status} fileName={file?.name} errorMsg={error} onDownload={download} onReset={reset} />;
  }

  return (
    <div className="space-y-6">
      {!file ? (
        <FileUploadZone accept={tool.acceptedFiles} icon={tool.icon} label="Drop your PDF to add watermark" onFiles={handleFiles} />
      ) : (
        <>
          <div className="flex items-center gap-3 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/></svg>
            <div className="flex-1"><p className="text-sm font-medium text-gray-900 dark:text-white">{file.name}</p></div>
            <button onClick={reset} className="text-sm text-red-500 hover:text-red-700 transition-colors">Remove</button>
          </div>
          <div className="rounded-2xl border border-gray-200/50 dark:border-gray-800/50 bg-white/60 dark:bg-gray-900/40 backdrop-blur-md p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Watermark Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Watermark Text</label>
                <input type="text" value={text} onChange={e => setText(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Font Size</label>
                  <input type="number" min={12} max={120} value={fontSize} onChange={e => setFontSize(Number(e.target.value))} className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Color</label>
                  <input type="color" value={color} onChange={e => setColor(e.target.value)} className="w-full h-[46px] rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 cursor-pointer" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Opacity: {opacity}%</label>
                  <input type="range" min={5} max={100} value={opacity} onChange={e => setOpacity(Number(e.target.value))} className="w-full accent-blue-600" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Rotation: {rotation}°</label>
                  <input type="range" min={-180} max={180} value={rotation} onChange={e => setRotation(Number(e.target.value))} className="w-full accent-blue-600" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Layout</label>
                <div className="flex gap-3">
                  <button onClick={() => setPosition("center")} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${position === "center" ? "bg-blue-600 text-white shadow-md" : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"}`}>Centered</button>
                  <button onClick={() => setPosition("tile")} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${position === "tile" ? "bg-blue-600 text-white shadow-md" : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"}`}>Tiled</button>
                </div>
              </div>
              {/* Preview */}
              <div className="relative w-full h-40 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 overflow-hidden flex items-center justify-center">
                <p style={{ fontSize: `${Math.min(fontSize / 2, 32)}px`, color, opacity: opacity / 100, transform: `rotate(${rotation}deg)` }} className="font-bold select-none whitespace-nowrap">{text || "Preview"}</p>
                <span className="absolute bottom-2 right-3 text-[10px] text-gray-400">Preview</span>
              </div>
            </div>
            <button onClick={process} disabled={!text} className="mt-6 w-full px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 text-white font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed">Add Watermark</button>
          </div>
        </>
      )}
    </div>
  );
}
