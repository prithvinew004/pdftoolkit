export type ToolType =
  | "convert"
  | "edit-text"
  | "add-text"
  | "add-image"
  | "annotate"
  | "highlight"
  | "signature"
  | "compress"
  | "password-add"
  | "password-remove"
  | "encrypt"
  | "merge"
  | "split"
  | "rotate"
  | "extract"
  | "page-numbers"
  | "watermark"
  | "ai-summary";

export interface Tool {
  name: string;
  slug: string;
  description: string;
  category: string;
  categorySlug: string;
  icon: string;
  popular?: boolean;
  toolType: ToolType;
  acceptedFiles: string;
  outputFormat?: string;
  faqs: { q: string; a: string }[];
}

export interface Category {
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
}

export const categories: Category[] = [
  { name: "PDF Conversion", slug: "pdf-conversion", description: "Convert PDFs to and from various formats", icon: "ArrowLeftRight", color: "from-blue-500 to-cyan-500" },
  { name: "PDF Editing", slug: "pdf-editing", description: "Edit and modify your PDF documents", icon: "Pencil", color: "from-purple-500 to-pink-500" },
  { name: "PDF Compression", slug: "pdf-compression", description: "Reduce PDF file size without losing quality", icon: "Minimize2", color: "from-green-500 to-emerald-500" },
  { name: "PDF Security", slug: "pdf-security", description: "Protect and secure your PDF files", icon: "Shield", color: "from-orange-500 to-red-500" },
  { name: "PDF Utilities", slug: "pdf-utilities", description: "Merge, split, rotate and more", icon: "Wrench", color: "from-indigo-500 to-violet-500" },
  { name: "AI Tools", slug: "ai-tools", description: "AI-powered PDF analysis and summarization", icon: "Sparkles", color: "from-violet-500 to-fuchsia-500" },
];

const faq = (tool: string): { q: string; a: string }[] => [
  { q: `Is ${tool} free to use?`, a: `Yes, ${tool} is completely free with no hidden charges.` },
  { q: `Is my file secure?`, a: `Absolutely. Files are processed in your browser and deleted from our servers immediately after processing.` },
  { q: `What is the maximum file size?`, a: `You can upload files up to 100MB for free.` },
  { q: `Do I need to create an account?`, a: `No account is needed. Just upload your file and get started.` },
];

export const tools: Tool[] = [
  // PDF Conversion
  { name: "PDF to Word", slug: "pdf-to-word", description: "Convert PDF documents to editable Word files instantly.", category: "PDF Conversion", categorySlug: "pdf-conversion", icon: "FileText", popular: true, toolType: "convert", acceptedFiles: ".pdf", outputFormat: "DOCX", faqs: faq("PDF to Word") },
  { name: "Word to PDF", slug: "word-to-pdf", description: "Convert Word documents to PDF format with perfect formatting.", category: "PDF Conversion", categorySlug: "pdf-conversion", icon: "FileText", popular: true, toolType: "convert", acceptedFiles: ".doc,.docx", outputFormat: "PDF", faqs: faq("Word to PDF") },
  { name: "PDF to JPG", slug: "pdf-to-jpg", description: "Convert PDF pages to high-quality JPG images.", category: "PDF Conversion", categorySlug: "pdf-conversion", icon: "Image", popular: true, toolType: "convert", acceptedFiles: ".pdf", outputFormat: "JPG", faqs: faq("PDF to JPG") },
  { name: "JPG to PDF", slug: "jpg-to-pdf", description: "Convert JPG images to PDF documents easily.", category: "PDF Conversion", categorySlug: "pdf-conversion", icon: "Image", toolType: "convert", acceptedFiles: ".jpg,.jpeg", outputFormat: "PDF", faqs: faq("JPG to PDF") },
  { name: "PDF to PNG", slug: "pdf-to-png", description: "Convert PDF pages to PNG images with transparency support.", category: "PDF Conversion", categorySlug: "pdf-conversion", icon: "Image", toolType: "convert", acceptedFiles: ".pdf", outputFormat: "PNG", faqs: faq("PDF to PNG") },
  { name: "PNG to PDF", slug: "png-to-pdf", description: "Convert PNG images to PDF documents.", category: "PDF Conversion", categorySlug: "pdf-conversion", icon: "Image", toolType: "convert", acceptedFiles: ".png", outputFormat: "PDF", faqs: faq("PNG to PDF") },
  { name: "PDF to Excel", slug: "pdf-to-excel", description: "Extract tables from PDF and convert to Excel spreadsheets.", category: "PDF Conversion", categorySlug: "pdf-conversion", icon: "Table", popular: true, toolType: "convert", acceptedFiles: ".pdf", outputFormat: "XLSX", faqs: faq("PDF to Excel") },
  { name: "Excel to PDF", slug: "excel-to-pdf", description: "Convert Excel spreadsheets to PDF format.", category: "PDF Conversion", categorySlug: "pdf-conversion", icon: "Table", toolType: "convert", acceptedFiles: ".xls,.xlsx", outputFormat: "PDF", faqs: faq("Excel to PDF") },

  // PDF Editing
  { name: "Edit PDF Text", slug: "edit-pdf-text", description: "Edit text directly in your PDF documents.", category: "PDF Editing", categorySlug: "pdf-editing", icon: "Type", popular: true, toolType: "edit-text", acceptedFiles: ".pdf", faqs: faq("Edit PDF Text") },
  { name: "Add Text to PDF", slug: "add-text-to-pdf", description: "Add new text anywhere on your PDF pages.", category: "PDF Editing", categorySlug: "pdf-editing", icon: "Type", toolType: "add-text", acceptedFiles: ".pdf", faqs: faq("Add Text to PDF") },
  { name: "Add Image to PDF", slug: "add-image-to-pdf", description: "Insert images into your PDF documents.", category: "PDF Editing", categorySlug: "pdf-editing", icon: "ImagePlus", toolType: "add-image", acceptedFiles: ".pdf", faqs: faq("Add Image to PDF") },
  { name: "Annotate PDF", slug: "annotate-pdf", description: "Add annotations, comments and notes to PDFs.", category: "PDF Editing", categorySlug: "pdf-editing", icon: "MessageSquare", toolType: "annotate", acceptedFiles: ".pdf", faqs: faq("Annotate PDF") },
  { name: "Highlight PDF", slug: "highlight-pdf", description: "Highlight important text in your PDF documents.", category: "PDF Editing", categorySlug: "pdf-editing", icon: "Highlighter", toolType: "highlight", acceptedFiles: ".pdf", faqs: faq("Highlight PDF") },
  { name: "Add Signature", slug: "add-signature", description: "Add digital signatures to your PDF documents.", category: "PDF Editing", categorySlug: "pdf-editing", icon: "PenTool", popular: true, toolType: "signature", acceptedFiles: ".pdf", faqs: faq("Add Signature") },

  // PDF Compression
  { name: "Compress PDF", slug: "compress-pdf", description: "Reduce PDF file size while maintaining quality.", category: "PDF Compression", categorySlug: "pdf-compression", icon: "Minimize2", popular: true, toolType: "compress", acceptedFiles: ".pdf", faqs: faq("Compress PDF") },
  { name: "Reduce PDF File Size", slug: "reduce-pdf-file-size", description: "Make your PDF files smaller for easy sharing.", category: "PDF Compression", categorySlug: "pdf-compression", icon: "ArrowDownToLine", toolType: "compress", acceptedFiles: ".pdf", faqs: faq("Reduce PDF File Size") },
  { name: "Optimize PDF", slug: "optimize-pdf", description: "Optimize PDF for web, print or archival.", category: "PDF Compression", categorySlug: "pdf-compression", icon: "Zap", toolType: "compress", acceptedFiles: ".pdf", faqs: faq("Optimize PDF") },

  // PDF Security
  { name: "Add Password to PDF", slug: "add-password-to-pdf", description: "Protect your PDF with a strong password.", category: "PDF Security", categorySlug: "pdf-security", icon: "Lock", popular: true, toolType: "password-add", acceptedFiles: ".pdf", faqs: faq("Add Password to PDF") },
  { name: "Remove Password", slug: "remove-password", description: "Remove password protection from PDF files.", category: "PDF Security", categorySlug: "pdf-security", icon: "Unlock", toolType: "password-remove", acceptedFiles: ".pdf", faqs: faq("Remove Password") },
  { name: "Unlock PDF", slug: "unlock-pdf", description: "Unlock restricted PDF documents.", category: "PDF Security", categorySlug: "pdf-security", icon: "KeyRound", toolType: "password-remove", acceptedFiles: ".pdf", faqs: faq("Unlock PDF") },
  { name: "Encrypt PDF", slug: "encrypt-pdf", description: "Encrypt PDF files with advanced security.", category: "PDF Security", categorySlug: "pdf-security", icon: "ShieldCheck", toolType: "encrypt", acceptedFiles: ".pdf", faqs: faq("Encrypt PDF") },

  // PDF Utilities
  { name: "Merge PDF", slug: "merge-pdf", description: "Combine multiple PDF files into one document.", category: "PDF Utilities", categorySlug: "pdf-utilities", icon: "Merge", popular: true, toolType: "merge", acceptedFiles: ".pdf", faqs: faq("Merge PDF") },
  { name: "Split PDF", slug: "split-pdf", description: "Split a PDF into multiple separate documents.", category: "PDF Utilities", categorySlug: "pdf-utilities", icon: "Split", popular: true, toolType: "split", acceptedFiles: ".pdf", faqs: faq("Split PDF") },
  { name: "Rotate PDF", slug: "rotate-pdf", description: "Rotate PDF pages to any orientation.", category: "PDF Utilities", categorySlug: "pdf-utilities", icon: "RotateCw", toolType: "rotate", acceptedFiles: ".pdf", faqs: faq("Rotate PDF") },
  { name: "Extract Pages", slug: "extract-pages", description: "Extract specific pages from a PDF document.", category: "PDF Utilities", categorySlug: "pdf-utilities", icon: "FileOutput", toolType: "extract", acceptedFiles: ".pdf", faqs: faq("Extract Pages") },
  { name: "Add Page Numbers", slug: "add-page-numbers", description: "Add page numbers to your PDF documents.", category: "PDF Utilities", categorySlug: "pdf-utilities", icon: "Hash", toolType: "page-numbers", acceptedFiles: ".pdf", faqs: faq("Add Page Numbers") },
  { name: "Watermark PDF", slug: "watermark-pdf", description: "Add text or image watermarks to PDF files.", category: "PDF Utilities", categorySlug: "pdf-utilities", icon: "Droplets", toolType: "watermark", acceptedFiles: ".pdf", faqs: faq("Watermark PDF") },

  // AI Tools
  { name: "AI PDF Summary", slug: "ai-pdf-summary", description: "Get an instant AI-powered summary of your PDF document. Perfect for students and researchers.", category: "AI Tools", categorySlug: "ai-tools", icon: "Sparkles", popular: true, toolType: "ai-summary", acceptedFiles: ".pdf", faqs: [
    { q: "How does AI PDF Summary work?", a: "Our AI reads the text content of your PDF and generates a concise summary highlighting key points, main arguments, and important details." },
    { q: "Is AI PDF Summary free?", a: "Yes, AI PDF Summary is completely free with no hidden charges." },
    { q: "What types of PDFs work best?", a: "Text-heavy documents like research papers, articles, reports, and textbooks work best. Scanned image PDFs may have limited results." },
    { q: "Is my document data safe?", a: "Your PDF is processed in your browser. The extracted text is sent to the AI model for summarization but is never stored." },
  ] },
];

export const getToolsByCategory = (slug: string) => tools.filter(t => t.categorySlug === slug);
export const getPopularTools = () => tools.filter(t => t.popular);
export const getRelatedTools = (currentSlug: string, categorySlug: string) =>
  tools.filter(t => t.categorySlug === categorySlug && t.slug !== currentSlug).slice(0, 4);
export const getToolBySlug = (slug: string) => tools.find(t => t.slug === slug);
export const getCategoryBySlug = (slug: string) => categories.find(c => c.slug === slug);
