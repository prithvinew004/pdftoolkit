"use client";
import { useState, useRef } from "react";
import { Tool } from "@/data/tools";
import FileUploadZone from "./FileUploadZone";
import ProcessingStatus, { Status } from "./ProcessingStatus";
import { addSignatureImage, downloadPdfBytes } from "@/lib/pdf-utils";

export default function SignatureTool({ tool }: { tool: Tool }) {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [sigMode, setSigMode] = useState<"draw" | "type" | "upload">("draw");
  const [typedSig, setTypedSig] = useState("");
  const [sigFont, setSigFont] = useState("cursive");
  const [isDrawing, setIsDrawing] = useState(false);
  const [uploadedSig, setUploadedSig] = useState<File | null>(null);
  const [result, setResult] = useState<Uint8Array | null>(null);
  const [error, setError] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFiles = (files: File[]) => setFile(files[0]);

  const startDraw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#1a1a1a";
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const getSignatureDataUrl = (): string | null => {
    if (sigMode === "draw") {
      return canvasRef.current?.toDataURL("image/png") || null;
    }
    if (sigMode === "type" && typedSig) {
      const canvas = document.createElement("canvas");
      canvas.width = 400;
      canvas.height = 100;
      const ctx = canvas.getContext("2d")!;
      ctx.font = `32px ${sigFont}`;
      ctx.fillStyle = "#1a1a1a";
      ctx.fillText(typedSig, 10, 60);
      return canvas.toDataURL("image/png");
    }
    return null;
  };

  const process = async () => {
    if (!file) return;
    setStatus("processing");
    setError("");
    try {
      const sigDataUrl = getSignatureDataUrl();
      if (!sigDataUrl) throw new Error("Please create a signature first");
      const bytes = await addSignatureImage(file, sigDataUrl, 1);
      setResult(bytes);
      setStatus("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to add signature");
      setStatus("error");
    }
  };

  const download = () => { if (result) downloadPdfBytes(result, `signed_${file?.name || "document.pdf"}`); };
  const reset = () => { setFile(null); setStatus("idle"); setResult(null); setError(""); setTypedSig(""); clearCanvas(); };

  if (status !== "idle") {
    return <ProcessingStatus status={status} fileName={file?.name} errorMsg={error} onDownload={download} onReset={reset} />;
  }

  return (
    <div className="space-y-6">
      {!file ? (
        <FileUploadZone accept={tool.acceptedFiles} icon={tool.icon} label="Drop your PDF to add a signature" onFiles={handleFiles} />
      ) : (
        <>
          <div className="flex items-center gap-3 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/></svg>
            <div className="flex-1"><p className="text-sm font-medium text-gray-900 dark:text-white">{file.name}</p></div>
            <button onClick={reset} className="text-sm text-red-500 hover:text-red-700 transition-colors">Remove</button>
          </div>
          <div className="rounded-2xl border border-gray-200/50 dark:border-gray-800/50 bg-white/60 dark:bg-gray-900/40 backdrop-blur-md p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Create Your Signature</h3>
            <div className="flex gap-2 mb-4">
              {([["draw", "✏️ Draw"], ["type", "⌨️ Type"], ["upload", "📁 Upload"]] as const).map(([key, label]) => (
                <button key={key} onClick={() => setSigMode(key)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${sigMode === key ? "bg-blue-600 text-white shadow-md" : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"}`}>{label}</button>
              ))}
            </div>
            {sigMode === "draw" && (
              <div>
                <div className="relative">
                  <canvas ref={canvasRef} width={500} height={150} onMouseDown={startDraw} onMouseMove={draw} onMouseUp={() => setIsDrawing(false)} onMouseLeave={() => setIsDrawing(false)} className="w-full h-36 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white cursor-crosshair" />
                  <button onClick={clearCanvas} className="absolute top-2 right-2 px-3 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">Clear</button>
                </div>
                <p className="mt-1 text-xs text-gray-400">Draw your signature using your mouse</p>
              </div>
            )}
            {sigMode === "type" && (
              <div className="space-y-3">
                <input type="text" value={typedSig} onChange={e => setTypedSig(e.target.value)} placeholder="Type your name" className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
                <div className="flex gap-2">
                  {["cursive", "serif", "monospace"].map(f => (
                    <button key={f} onClick={() => setSigFont(f)} className={`px-4 py-2 rounded-lg text-sm transition-all ${sigFont === f ? "bg-blue-600 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"}`} style={{ fontFamily: f }}>{typedSig || "Preview"}</button>
                  ))}
                </div>
                {typedSig && <div className="p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-center"><p style={{ fontFamily: sigFont, fontSize: "28px" }} className="text-gray-900 dark:text-white">{typedSig}</p></div>}
              </div>
            )}
            {sigMode === "upload" && (
              <div onClick={() => document.getElementById("sig-upload")?.click()} className="cursor-pointer p-8 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 text-center hover:border-blue-400 transition-colors">
                <input id="sig-upload" type="file" accept=".png,.jpg,.jpeg" onChange={e => { if (e.target.files?.[0]) setUploadedSig(e.target.files[0]); }} className="hidden" />
                <p className="text-sm text-gray-500 dark:text-gray-400">{uploadedSig ? uploadedSig.name : "Upload a signature image (PNG recommended)"}</p>
              </div>
            )}
            <button onClick={process} className="mt-4 w-full px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 text-white font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300">Add Signature &amp; Download</button>
          </div>
        </>
      )}
    </div>
  );
}
