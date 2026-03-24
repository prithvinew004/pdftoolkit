export type Status = "idle" | "processing" | "done" | "error";

interface Props {
  status: Status;
  fileName?: string;
  errorMsg?: string;
  onDownload?: () => void;
  onReset?: () => void;
}

export default function ProcessingStatus({ status, fileName, errorMsg, onDownload, onReset }: Props) {
  if (status === "idle") return null;

  return (
    <div className="rounded-2xl border border-gray-200/50 dark:border-gray-800/50 bg-white/60 dark:bg-gray-900/40 backdrop-blur-md p-6 animate-scale-in">
      {status === "processing" && (
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-white">Processing {fileName}...</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">This may take a moment</p>
          </div>
        </div>
      )}

      {status === "done" && (
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-green-600"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Processing complete!</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{fileName} is ready</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={onDownload} className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white font-medium hover:shadow-lg hover:shadow-green-500/25 transition-all duration-300 text-sm">
              Download
            </button>
            <button onClick={onReset} className="px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all text-sm">
              New File
            </button>
          </div>
        </div>
      )}

      {status === "error" && (
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-600"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Something went wrong</p>
              <p className="text-sm text-red-500">{errorMsg || "Please try again"}</p>
            </div>
          </div>
          <button onClick={onReset} className="px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all text-sm">
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}
