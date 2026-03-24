"use client";
import { useState } from "react";
import { Tool } from "@/data/tools";
import FileUploadZone from "./FileUploadZone";
import ProcessingStatus, { Status } from "./ProcessingStatus";
import { imagesToPdf, pdfToImages, pdfToDocx, wordToPdf, pdfToExcel, excelToPdf, downloadPdfBytes, downloadImages, triggerDownload } from "@/lib/pdf-utils";

export default function ConvertTool({ tool }: { tool: Tool }) {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [quality, setQuality] = useState<"high" | "medium" | "low">("high");
  const [resultPdf, setResultPdf] = useState<Uint8Array | null>(null);
  const [resultImages, setResultImages] = useState<Blob[] | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [error, setError] = useState("");
  const [unsupported, setUnsupported] = useState(false);

  const handleFiles = (files: File[]) => setFile(files[0]);

  const process = async () => {
    if (!file) return;
    setStatus("processing");
    setError("");
    try {
      const slug = tool.slug;

      // Image to PDF
      if (["jpg-to-pdf", "png-to-pdf"].includes(slug)) {
        const bytes = await imagesToPdf([file]);
        setResultPdf(bytes);
        setStatus("done");
        return;
      }

      // PDF to Image
      if (["pdf-to-jpg", "pdf-to-png"].includes(slug)) {
        const format = slug === "pdf-to-jpg" ? "jpeg" : "png";
        const blobs = await pdfToImages(file, format);
        setResultImages(blobs);
        setStatus("done");
        return;
      }

      // PDF to Word
      if (slug === "pdf-to-word") {
        const blob = await pdfToDocx(file);
        setResultBlob(blob);
        setStatus("done");
        return;
      }

      // Word to PDF
      if (slug === "word-to-pdf") {
        const bytes = await wordToPdf(file);
        setResultPdf(bytes);
        setStatus("done");
        return;
      }

      // PDF to Excel
      if (slug === "pdf-to-excel") {
        const blob = await pdfToExcel(file);
        setResultBlob(blob);
        setStatus("done");
        return;
      }

      // Excel to PDF
      if (slug === "excel-to-pdf") {
        const bytes = await excelToPdf(file);
        setResultPdf(bytes);
        setStatus("done");
        return;
      }

      setError("This conversion type is not yet supported client-side");
      setStatus("error");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Conversion failed");
      setStatus("error");
    }
  };

  const download = () => {
    if (!file) return;
    const baseName = file.name.replace(/\.[^.]+$/, "");

    if (resultPdf) {
      downloadPdfBytes(resultPdf, `${baseName}.pdf`);
      return;
    }

    if (resultImages) {
      const ext = tool.slug.includes("jpg") ? "jpg" : "png";
      downloadImages(resultImages, baseName, ext);
      return;
    }

    if (resultBlob) {
      const ext = tool.slug === "pdf-to-excel" ? "xlsx" : "docx";
      const mime = tool.slug === "pdf-to-excel"
        ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        : "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
      triggerDownload(resultBlob, `${baseName}.${ext}`, mime);
      return;
    }
  };

  const reset = () => { setFile(null); setStatus("idle"); setResultPdf(null); setResultImages(null); setResultBlob(null); setError(""); setUnsupported(false); };

  if (status !== "idle" && status !== "done") {
    return <ProcessingStatus status={status} fileName={file?.name} errorMsg={error} onDownload={download} onReset={reset} />;
  }

  if (status === "done") {
    return (
      <div className="space-y-4">
        {unsupported ? (
          <div className="rounded-2xl border border-amber-200 dark:border-amber-800/50 bg-amber-50/50 dark:bg-amber-900/10 p-8 text-center">
            <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-4">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-600"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
            </div>
            <p className="font-medium text-gray-900 dark:text-white mb-2">Server-side conversion required</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Converting {tool.acceptedFiles} to {tool.outputFormat} requires a server-side processing engine (like LibreOffice or CloudConvert). This conversion cannot be done in the browser alone.
            </p>
            <button onClick={reset} className="mt-4 px-6 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">Go Back</button>
          </div>
        ) : (
          <>
            <ProcessingStatus status={status} fileName={file?.name} errorMsg={error} onDownload={download} onReset={reset} />
          </>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <FileUploadZone accept={tool.acceptedFiles} icon={tool.icon} label={`Drop your file to convert to ${tool.outputFormat}`} sublabel={`Accepted formats: ${tool.acceptedFiles}`} onFiles={handleFiles} />
      {file && (
        <div className="space-y-6">
          <div className="flex items-center gap-3 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/></svg>
            <div className="flex-1"><p className="text-sm font-medium text-gray-900 dark:text-white">{file.name}</p><p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p></div>
            <button onClick={reset} className="text-sm text-red-500 hover:text-red-700 transition-colors">Remove</button>
          </div>
          <div className="rounded-2xl border border-gray-200/50 dark:border-gray-800/50 bg-white/60 dark:bg-gray-900/40 backdrop-blur-md p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Conversion Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Output Format</label>
                <div className="inline-flex items-center px-4 py-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-sm font-medium">{tool.outputFormat}</div>
              </div>
              {["pdf-to-jpg", "pdf-to-png"].includes(tool.slug) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Quality</label>
                  <div className="flex gap-3">
                    {(["high", "medium", "low"] as const).map(q => (
                      <button key={q} onClick={() => setQuality(q)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${quality === q ? "bg-blue-600 text-white shadow-md" : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"}`}>{q.charAt(0).toUpperCase() + q.slice(1)}</button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <button onClick={process} className="mt-6 w-full px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 text-white font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300">Convert to {tool.outputFormat}</button>
          </div>
        </div>
      )}
    </div>
  );
}
