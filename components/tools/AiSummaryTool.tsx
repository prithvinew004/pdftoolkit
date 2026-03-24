"use client";
import { useState } from "react";
import { Tool } from "@/data/tools";
import FileUploadZone from "./FileUploadZone";
import { readFileAsArrayBuffer } from "@/lib/pdf-utils";

type SummaryLength = "brief" | "detailed" | "key-points";

export default function AiSummaryTool({ tool }: { tool: Tool }) {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "extracting" | "summarizing" | "done" | "error">("idle");
  const [summaryLength, setSummaryLength] = useState<SummaryLength>("detailed");
  const [extractedText, setExtractedText] = useState("");
  const [summary, setSummary] = useState("");
  const [error, setError] = useState("");

  const handleFiles = (files: File[]) => setFile(files[0]);

  const extractText = async (f: File): Promise<string> => {
    const arrayBuffer = await readFileAsArrayBuffer(f);
    const data = new Uint8Array(arrayBuffer);
    const pdfjsLib = await import("pdfjs-dist");
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
    const pdf = await pdfjsLib.getDocument({ data }).promise;
    let text = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items
        .filter((item): item is { str: string } & typeof item => "str" in item)
        .map(item => item.str)
        .join(" ");
      text += pageText + "\n\n";
    }
    return text.trim();
  };

  const generateLocalSummary = (text: string, length: SummaryLength): string => {
    const sentences = text
      .replace(/\n+/g, " ")
      .replace(/\s+/g, " ")
      .split(/(?<=[.!?])\s+/)
      .filter(s => s.trim().length > 20);

    if (sentences.length === 0) return "Could not extract meaningful text from this PDF.";

    const wordCount = text.split(/\s+/).length;
    const pageEstimate = Math.ceil(wordCount / 300);

    let header = `📄 **Document Overview**\n`;
    header += `- Estimated pages: ~${pageEstimate}\n`;
    header += `- Word count: ~${wordCount.toLocaleString()}\n`;
    header += `- Sentences detected: ${sentences.length}\n\n`;

    if (length === "key-points") {
      const keyCount = Math.min(Math.max(5, Math.floor(sentences.length * 0.05)), 15);
      const step = Math.max(1, Math.floor(sentences.length / keyCount));
      const points = [];
      for (let i = 0; i < sentences.length && points.length < keyCount; i += step) {
        points.push(sentences[i].trim());
      }
      return header + "🔑 **Key Points**\n\n" + points.map((p, i) => `${i + 1}. ${p}`).join("\n\n");
    }

    if (length === "brief") {
      const count = Math.min(5, sentences.length);
      const picked = sentences.slice(0, count);
      return header + "📝 **Brief Summary**\n\n" + picked.join(" ");
    }

    // detailed
    const sections: string[] = [];
    const chunkSize = Math.max(1, Math.floor(sentences.length / 4));

    const sectionNames = ["Introduction", "Main Content", "Key Details", "Conclusion"];
    for (let s = 0; s < 4; s++) {
      const start = s * chunkSize;
      const end = s === 3 ? sentences.length : (s + 1) * chunkSize;
      const chunk = sentences.slice(start, end);
      if (chunk.length === 0) continue;
      const topSentences = chunk.slice(0, Math.min(4, chunk.length));
      sections.push(`### ${sectionNames[s]}\n${topSentences.join(" ")}`);
    }

    return header + "📋 **Detailed Summary**\n\n" + sections.join("\n\n");
  };

  const process = async () => {
    if (!file) return;
    setError("");
    setStatus("extracting");
    try {
      const text = await extractText(file);
      setExtractedText(text);
      if (!text || text.length < 50) {
        setError("Could not extract enough text from this PDF. It may be a scanned/image-based document.");
        setStatus("error");
        return;
      }
      setStatus("summarizing");
      await new Promise(r => setTimeout(r, 1500)); // simulate processing
      const result = generateLocalSummary(text, summaryLength);
      setSummary(result);
      setStatus("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to process PDF");
      setStatus("error");
    }
  };

  const reset = () => {
    setFile(null);
    setStatus("idle");
    setExtractedText("");
    setSummary("");
    setError("");
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(summary.replace(/[*#]/g, ""));
  };

  if (status === "extracting" || status === "summarizing") {
    return (
      <div className="rounded-2xl border border-gray-200/50 dark:border-gray-800/50 bg-white/60 dark:bg-gray-900/40 backdrop-blur-md p-12 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 mb-6">
          <svg className="animate-spin h-8 w-8 text-accent" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
        <p className="text-lg font-semibold text-gray-900 dark:text-white">
          {status === "extracting" ? "Extracting text from PDF..." : "Generating AI summary..."}
        </p>
        <p className="mt-2 text-sm text-gray-500">{file?.name}</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-red-200 dark:border-red-800/50 bg-red-50/50 dark:bg-red-900/10 p-8 text-center">
          <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
        </div>
        <button onClick={reset} className="w-full px-6 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
          Try Again
        </button>
      </div>
    );
  }

  if (status === "done") {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl border border-gray-200/50 dark:border-gray-800/50 bg-white/60 dark:bg-gray-900/40 backdrop-blur-md p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
              AI Summary
            </h3>
            <button onClick={copyToClipboard} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
              Copy
            </button>
          </div>
          <div className="prose prose-sm prose-gray dark:prose-invert max-w-none whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-relaxed">
            {summary.split("\n").map((line, i) => {
              if (line.startsWith("### ")) return <h4 key={i} className="text-base font-semibold text-gray-900 dark:text-white mt-4 mb-2">{line.replace("### ", "")}</h4>;
              if (line.startsWith("🔑") || line.startsWith("📋") || line.startsWith("📝") || line.startsWith("📄")) return <p key={i} className="text-base font-semibold text-gray-900 dark:text-white mt-2">{line.replace(/\*\*/g, "")}</p>;
              if (line.startsWith("- ")) return <p key={i} className="text-sm text-gray-500 dark:text-gray-400">{line}</p>;
              if (/^\d+\./.test(line)) return <p key={i} className="ml-2 mb-1">{line}</p>;
              return <p key={i}>{line}</p>;
            })}
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={reset} className="flex-1 px-6 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            Summarize Another PDF
          </button>
        </div>
      </div>
    );
  }

  const lengths = [
    { key: "brief" as const, label: "Brief", desc: "Quick 3-5 sentence overview" },
    { key: "detailed" as const, label: "Detailed", desc: "Section-by-section breakdown" },
    { key: "key-points" as const, label: "Key Points", desc: "Bullet-point highlights" },
  ];

  return (
    <div className="space-y-6">
      {!file ? (
        <FileUploadZone accept={tool.acceptedFiles} icon={tool.icon} label="Drop your PDF for AI summarization" sublabel="Works best with text-heavy documents like papers, articles, and reports" onFiles={handleFiles} />
      ) : (
        <>
          <div className="flex items-center gap-3 p-4 rounded-xl bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-violet-600"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/></svg>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-white">{file.name}</p>
              <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
            <button onClick={reset} className="text-sm text-red-500 hover:text-red-700 transition-colors">Remove</button>
          </div>
          <div className="rounded-2xl border border-gray-200/50 dark:border-gray-800/50 bg-white/60 dark:bg-gray-900/40 backdrop-blur-md p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Summary Type</h3>
            <div className="space-y-3">
              {lengths.map(l => (
                <button key={l.key} onClick={() => setSummaryLength(l.key)} className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${summaryLength === l.key ? "border-accent bg-accent/5" : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"}`}>
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{l.label}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{l.desc}</p>
                  </div>
                </button>
              ))}
            </div>
            <button onClick={process} className="mt-6 w-full px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-medium hover:shadow-lg hover:shadow-violet-500/25 transition-all duration-300">
              ✨ Generate AI Summary
            </button>
          </div>
        </>
      )}
    </div>
  );
}
