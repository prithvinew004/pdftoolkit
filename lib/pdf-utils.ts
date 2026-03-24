import { PDFDocument, rgb, StandardFonts, degrees } from "pdf-lib";

// ─── FILE I/O ───

export function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

export function triggerDownload(data: Uint8Array | ArrayBuffer | Blob, filename: string, mime = "application/pdf") {
  let blob: Blob;
  if (data instanceof Blob) {
    blob = data;
  } else if (data instanceof ArrayBuffer) {
    blob = new Blob([new Uint8Array(data)], { type: mime });
  } else {
    // Uint8Array — create a clean ArrayBuffer copy for Blob compatibility
    const ab = new ArrayBuffer(data.byteLength);
    new Uint8Array(ab).set(data);
    blob = new Blob([ab], { type: mime });
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

export function downloadPdfBytes(bytes: Uint8Array, filename: string) {
  const ab = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(ab).set(bytes);
  const blob = new Blob([ab], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

export async function downloadMultiplePdfs(pdfs: Uint8Array[], baseName: string) {
  if (pdfs.length === 1) {
    downloadPdfBytes(pdfs[0], `${baseName}_part_1.pdf`);
    return;
  }
  // Bundle multiple PDFs into a zip
  const JSZip = (await import("jszip")).default;
  const zip = new JSZip();
  pdfs.forEach((bytes, i) => {
    zip.file(`${baseName}_part_${i + 1}.pdf`, bytes);
  });
  const blob = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${baseName}_split.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

export async function downloadImages(blobs: Blob[], baseName: string, ext: string) {
  if (blobs.length === 1) {
    triggerDownload(blobs[0], `${baseName}_page_1.${ext}`, blobs[0].type);
    return;
  }
  // Bundle multiple images into a zip
  const JSZip = (await import("jszip")).default;
  const zip = new JSZip();
  for (let i = 0; i < blobs.length; i++) {
    const arrayBuf = await blobs[i].arrayBuffer();
    zip.file(`${baseName}_page_${i + 1}.${ext}`, new Uint8Array(arrayBuf));
  }
  const blob = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${baseName}_images.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

// ─── MERGE ───

export async function mergePdfs(files: File[]): Promise<Uint8Array> {
  const merged = await PDFDocument.create();
  for (const file of files) {
    const bytes = await readFileAsArrayBuffer(file);
    const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
    const pages = await merged.copyPages(doc, doc.getPageIndices());
    pages.forEach(p => merged.addPage(p));
  }
  return merged.save();
}

// ─── SPLIT ───

export async function splitPdfByRanges(file: File, ranges: [number, number][]): Promise<Uint8Array[]> {
  const bytes = await readFileAsArrayBuffer(file);
  const src = await PDFDocument.load(bytes, { ignoreEncryption: true });
  const total = src.getPageCount();
  const results: Uint8Array[] = [];

  for (const [start, end] of ranges) {
    const doc = await PDFDocument.create();
    const indices: number[] = [];
    for (let i = Math.max(0, start - 1); i < Math.min(end, total); i++) {
      indices.push(i);
    }
    if (indices.length === 0) continue;
    const pages = await doc.copyPages(src, indices);
    pages.forEach(p => doc.addPage(p));
    results.push(await doc.save());
  }
  return results;
}

export async function splitPdfEveryN(file: File, n: number): Promise<Uint8Array[]> {
  const bytes = await readFileAsArrayBuffer(file);
  const src = await PDFDocument.load(bytes);
  const total = src.getPageCount();
  const ranges: [number, number][] = [];
  for (let i = 0; i < total; i += n) {
    ranges.push([i + 1, Math.min(i + n, total)]);
  }
  return splitPdfByRanges(file, ranges);
}

export async function extractPdfPages(file: File, pageNumbers: number[]): Promise<Uint8Array> {
  const bytes = await readFileAsArrayBuffer(file);
  const src = await PDFDocument.load(bytes, { ignoreEncryption: true });
  const total = src.getPageCount();
  const doc = await PDFDocument.create();
  const indices = pageNumbers.map(p => p - 1).filter(i => i >= 0 && i < total);
  if (indices.length === 0) throw new Error("No valid pages to extract");
  const pages = await doc.copyPages(src, indices);
  pages.forEach(p => doc.addPage(p));
  return doc.save();
}

// ─── ROTATE ───

export async function rotatePdf(file: File, angle: number, pageNumbers?: number[]): Promise<Uint8Array> {
  const bytes = await readFileAsArrayBuffer(file);
  const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
  doc.getPages().forEach((page, i) => {
    if (!pageNumbers || pageNumbers.includes(i + 1)) {
      page.setRotation(degrees(page.getRotation().angle + angle));
    }
  });
  return doc.save();
}

// ─── ADD PAGE NUMBERS ───

export async function addPageNumbers(
  file: File,
  position: string,
  format: "numeric" | "roman" | "alpha",
  startFrom: number,
  fontSize: number
): Promise<Uint8Array> {
  const bytes = await readFileAsArrayBuffer(file);
  const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
  const font = await doc.embedFont(StandardFonts.Helvetica);

  const toRoman = (n: number): string => {
    const vals = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];
    const syms = ["M", "CM", "D", "CD", "C", "XC", "L", "XL", "X", "IX", "V", "IV", "I"];
    let r = "";
    for (let i = 0; i < vals.length; i++) { while (n >= vals[i]) { r += syms[i]; n -= vals[i]; } }
    return r;
  };

  const toAlpha = (n: number): string => {
    let r = "";
    while (n > 0) { n--; r = String.fromCharCode(65 + (n % 26)) + r; n = Math.floor(n / 26); }
    return r;
  };

  doc.getPages().forEach((page, i) => {
    const num = startFrom + i;
    const label = format === "roman" ? toRoman(num) : format === "alpha" ? toAlpha(num) : String(num);
    const { width, height } = page.getSize();
    const textWidth = font.widthOfTextAtSize(label, fontSize);

    let x = (width - textWidth) / 2;
    let y = 30;
    if (position.includes("left")) x = 40;
    else if (position.includes("right")) x = width - textWidth - 40;
    if (position.includes("top")) y = height - 40;

    page.drawText(label, { x, y, size: fontSize, font, color: rgb(0.3, 0.3, 0.3) });
  });

  return doc.save();
}

// ─── WATERMARK ───

export async function addWatermark(
  file: File,
  text: string,
  fontSize: number,
  colorHex: string,
  opacity: number,
  rotation: number,
  tiled: boolean
): Promise<Uint8Array> {
  const bytes = await readFileAsArrayBuffer(file);
  const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
  const font = await doc.embedFont(StandardFonts.HelveticaBold);

  const color = hexToRgb(colorHex);

  doc.getPages().forEach(page => {
    const { width, height } = page.getSize();
    if (tiled) {
      const tw = font.widthOfTextAtSize(text, fontSize) + 80;
      for (let py = 0; py < height; py += fontSize * 3) {
        for (let px = 0; px < width; px += tw) {
          page.drawText(text, { x: px, y: py, size: fontSize, font, color, opacity: opacity / 100, rotate: degrees(rotation) });
        }
      }
    } else {
      const tw = font.widthOfTextAtSize(text, fontSize);
      page.drawText(text, { x: (width - tw) / 2, y: height / 2, size: fontSize, font, color, opacity: opacity / 100, rotate: degrees(rotation) });
    }
  });

  return doc.save();
}

// ─── PARSE HEX COLOR ───

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return rgb(r, g, b);
}

// ─── ADD TEXT ───

export async function addTextToPdf(
  file: File,
  text: string,
  fontSize: number,
  colorHex: string,
  position: string,
  pageNumbers?: number[]
): Promise<Uint8Array> {
  const bytes = await readFileAsArrayBuffer(file);
  const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const color = hexToRgb(colorHex);

  const lines = text.split("\n");

  doc.getPages().forEach((page, i) => {
    if (!pageNumbers || pageNumbers.includes(i + 1)) {
      const { width, height } = page.getSize();
      let x = 50;
      let y = height - 50;
      if (position.includes("center")) x = width / 2 - (font.widthOfTextAtSize(lines[0] || "", fontSize) / 2);
      if (position.includes("right")) x = width - font.widthOfTextAtSize(lines[0] || "", fontSize) - 50;
      if (position.includes("bottom")) y = 50 + (lines.length - 1) * (fontSize + 4);

      lines.forEach((line, li) => {
        page.drawText(line, { x, y: y - li * (fontSize + 4), size: fontSize, font, color });
      });
    }
  });

  return doc.save();
}

// ─── ADD IMAGE ───

export async function addImageToPdf(
  file: File,
  imageFile: File,
  scale: number,
  position: string,
  pageNumbers?: number[]
): Promise<Uint8Array> {
  const pdfBytes = await readFileAsArrayBuffer(file);
  const imgBytes = await readFileAsArrayBuffer(imageFile);
  const doc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });

  const isPng = imageFile.type === "image/png" || imageFile.name.toLowerCase().endsWith(".png");
  const img = isPng ? await doc.embedPng(new Uint8Array(imgBytes)) : await doc.embedJpg(new Uint8Array(imgBytes));
  const scaledDims = img.scale(scale / 100);

  doc.getPages().forEach((page, i) => {
    if (!pageNumbers || pageNumbers.includes(i + 1)) {
      const { width, height } = page.getSize();
      let x = (width - scaledDims.width) / 2;
      let y = (height - scaledDims.height) / 2;
      if (position.includes("top")) y = height - scaledDims.height - 20;
      if (position.includes("bottom")) y = 20;
      if (position.includes("left")) x = 20;
      if (position.includes("right")) x = width - scaledDims.width - 20;
      page.drawImage(img, { x, y, width: scaledDims.width, height: scaledDims.height });
    }
  });

  return doc.save();
}

// ─── COPY PDF ───

export async function copyPdf(file: File): Promise<Uint8Array> {
  const bytes = await readFileAsArrayBuffer(file);
  const src = await PDFDocument.load(bytes, { ignoreEncryption: true });
  const doc = await PDFDocument.create();
  const pages = await doc.copyPages(src, src.getPageIndices());
  pages.forEach(p => doc.addPage(p));
  return doc.save();
}

// ─── HIGHLIGHT TEXT (draws a colored rectangle overlay) ───

export async function highlightPdf(
  file: File,
  colorHex: string,
  opacity: number,
  pageNumbers?: number[]
): Promise<Uint8Array> {
  const bytes = await readFileAsArrayBuffer(file);
  const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
  const color = hexToRgb(colorHex);

  // This adds a highlight bar across the top area of specified pages as a demo
  doc.getPages().forEach((page, i) => {
    if (!pageNumbers || pageNumbers.includes(i + 1)) {
      const { width } = page.getSize();
      page.drawRectangle({
        x: 40,
        y: page.getSize().height - 60,
        width: width - 80,
        height: 20,
        color,
        opacity: opacity / 100,
      });
    }
  });

  return doc.save();
}

// ─── ANNOTATE (adds a text annotation/note) ───

export async function annotatePdf(
  file: File,
  noteText: string,
  colorHex: string,
  pageNum: number
): Promise<Uint8Array> {
  const bytes = await readFileAsArrayBuffer(file);
  const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const color = hexToRgb(colorHex);

  const pageIdx = Math.min(Math.max(pageNum - 1, 0), doc.getPageCount() - 1);
  const page = doc.getPage(pageIdx);
  const { width, height } = page.getSize();

  // Draw a note box in the top-right corner
  const boxW = 200;
  const boxH = Math.max(60, noteText.length * 0.8);
  const boxX = width - boxW - 20;
  const boxY = height - boxH - 20;

  page.drawRectangle({ x: boxX, y: boxY, width: boxW, height: boxH, color: rgb(1, 1, 0.8), borderColor: color, borderWidth: 1 });

  // Wrap text into the box
  const maxCharsPerLine = Math.floor(boxW / (7));
  const words = noteText.split(" ");
  const lines: string[] = [];
  let currentLine = "";
  for (const word of words) {
    if ((currentLine + " " + word).trim().length > maxCharsPerLine) {
      lines.push(currentLine.trim());
      currentLine = word;
    } else {
      currentLine += " " + word;
    }
  }
  if (currentLine.trim()) lines.push(currentLine.trim());

  lines.slice(0, 5).forEach((line, i) => {
    page.drawText(line, {
      x: boxX + 8,
      y: boxY + boxH - 18 - i * 14,
      size: 10,
      font,
      color: rgb(0.1, 0.1, 0.1),
    });
  });

  return doc.save();
}

// ─── ENCRYPT PDF ───

export async function encryptPdf(
  file: File,
  password: string,
  options?: { algorithm?: "AES-256" | "RC4"; allowPrinting?: boolean; allowCopying?: boolean; allowModifying?: boolean }
): Promise<Uint8Array> {
  const { encryptPDF } = await import("@pdfsmaller/pdf-encrypt");
  const bytes = new Uint8Array(await readFileAsArrayBuffer(file));
  return encryptPDF(bytes, password, {
    algorithm: options?.algorithm ?? "AES-256",
    allowPrinting: options?.allowPrinting ?? true,
    allowCopying: options?.allowCopying ?? true,
    allowModifying: options?.allowModifying ?? true,
  });
}

// ─── ADD PASSWORD ───
// Renders pages as high-quality images first to avoid pdf-lib re-serialization
// corrupting fonts/layout, then encrypts the flattened PDF.

export async function addPasswordToPdf(
  file: File,
  password: string,
  permissions?: { print?: boolean; copy?: boolean; edit?: boolean }
): Promise<Uint8Array> {
  const flatBytes = await flattenPdfAsImages(file, 2.5, 0.95);
  const { encryptPDF } = await import("@pdfsmaller/pdf-encrypt");
  return encryptPDF(flatBytes, password, {
    algorithm: "AES-256",
    allowPrinting: permissions?.print ?? true,
    allowCopying: permissions?.copy ?? false,
    allowModifying: permissions?.edit ?? false,
  });
}

// ─── DECRYPT / REMOVE PASSWORD ───
// Decrypts then flattens pages as high-quality images to avoid pdf-lib
// re-serialization corrupting fonts/layout.

export async function removePasswordFromPdf(file: File, password: string): Promise<Uint8Array> {
  const { decryptPDF } = await import("@pdfsmaller/pdf-decrypt");
  const bytes = new Uint8Array(await readFileAsArrayBuffer(file));
  const decryptedBytes = await decryptPDF(bytes, password);
  return flattenPdfAsImages(decryptedBytes, 2.5, 0.95);
}

// ─── FLATTEN PDF (render pages as images to preserve visual fidelity) ───

async function flattenPdfAsImages(
  input: File | Uint8Array,
  scale: number,
  quality: number
): Promise<Uint8Array> {
  const arrayBuffer = input instanceof File
    ? await readFileAsArrayBuffer(input)
    : input.buffer;
  const data = new Uint8Array(arrayBuffer);
  const pdfjsLib = await getPdfjsLib();
  const pdf = await pdfjsLib.getDocument({ data }).promise;
  const doc = await PDFDocument.create();

  for (let i = 1; i <= pdf.numPages; i++) {
    const pdfPage = await pdf.getPage(i);
    const viewport = pdfPage.getViewport({ scale });
    const origViewport = pdfPage.getViewport({ scale: 1.0 });
    const canvas = document.createElement("canvas");
    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    await pdfPage.render({ canvasContext: ctx, viewport }).promise;

    const jpegBlob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        b => (b ? resolve(b) : reject(new Error("Blob failed"))),
        "image/jpeg",
        quality
      );
    });
    const jpegBytes = new Uint8Array(await jpegBlob.arrayBuffer());
    const img = await doc.embedJpg(jpegBytes);
    const page = doc.addPage([origViewport.width, origViewport.height]);
    page.drawImage(img, {
      x: 0,
      y: 0,
      width: origViewport.width,
      height: origViewport.height,
    });
  }

  return doc.save();
}

// ─── WORD TO PDF ───

export async function wordToPdf(file: File): Promise<Uint8Array> {
  const mammoth = await import("mammoth");
  const arrayBuffer = await readFileAsArrayBuffer(file);
  const { value: html } = await mammoth.convertToHtml({ arrayBuffer });

  // Render HTML into a hidden iframe to measure and capture layout
  const iframe = document.createElement("iframe");
  iframe.style.cssText = "position:fixed;left:-9999px;top:0;width:794px;height:1123px;border:none;";
  document.body.appendChild(iframe);
  const iframeDoc = iframe.contentDocument!;
  iframeDoc.open();
  iframeDoc.write(`<!DOCTYPE html><html><head><style>
    body{margin:40px;font-family:serif;font-size:12pt;line-height:1.5;color:#000;}
    h1{font-size:20pt;margin:16px 0 8px;} h2{font-size:16pt;margin:14px 0 6px;} h3{font-size:13pt;margin:12px 0 4px;}
    p{margin:0 0 8px;} table{border-collapse:collapse;width:100%;margin:8px 0;}
    td,th{border:1px solid #999;padding:4px 8px;text-align:left;}
    img{max-width:100%;}
  </style></head><body>${html}</body></html>`);
  iframeDoc.close();

  await new Promise(r => setTimeout(r, 200));

  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = pdf.internal.pageSize.getWidth() - 80;

  // Extract text lines from the rendered HTML
  const walker = iframeDoc.createTreeWalker(iframeDoc.body, NodeFilter.SHOW_ELEMENT);
  let y = 40;
  const lineHeight = 16;
  const pageH = pdf.internal.pageSize.getHeight() - 80;

  const addPageIfNeeded = (needed: number) => {
    if (y + needed > pageH) {
      pdf.addPage();
      y = 40;
    }
  };

  let node: Node | null = walker.currentNode;
  while (node) {
    if (node instanceof HTMLElement) {
      const tag = node.tagName;
      const text = node.innerText?.trim();

      if (text && ["P", "H1", "H2", "H3", "H4", "LI", "TD", "TH", "SPAN", "DIV"].includes(tag)) {
        let fontSize = 12;
        if (tag === "H1") fontSize = 20;
        else if (tag === "H2") fontSize = 16;
        else if (tag === "H3") fontSize = 13;

        pdf.setFontSize(fontSize);
        const lines = pdf.splitTextToSize(text, pageW) as string[];
        addPageIfNeeded(lines.length * lineHeight + 8);
        pdf.text(lines, 40, y);
        y += lines.length * lineHeight + 8;
      }
    }
    node = walker.nextNode();
  }

  document.body.removeChild(iframe);
  return new Uint8Array(pdf.output("arraybuffer"));
}

// ─── PDF TO EXCEL ───

export async function pdfToExcel(file: File): Promise<Blob> {
  const arrayBuffer = await readFileAsArrayBuffer(file);
  const data = new Uint8Array(arrayBuffer);
  const pdfjsLib = await getPdfjsLib();
  const XLSX = await import("xlsx");
  const pdf = await pdfjsLib.getDocument({ data }).promise;
  const wb = XLSX.utils.book_new();

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();

    // Group text items into rows by Y coordinate
    const rows: Map<number, { x: number; str: string }[]> = new Map();
    for (const item of content.items) {
      if (!("str" in item) || !(item as any).str) continue;
      const t = item as { str: string; transform: number[] };
      const y = Math.round(t.transform[5]);
      const x = Math.round(t.transform[4]);
      if (!rows.has(y)) rows.set(y, []);
      rows.get(y)!.push({ x, str: t.str });
    }

    // Sort rows top-to-bottom, cells left-to-right
    const sortedYs = Array.from(rows.keys()).sort((a, b) => b - a);
    const sheetData: string[][] = [];
    for (const y of sortedYs) {
      const cells = rows.get(y)!.sort((a, b) => a.x - b.x);
      sheetData.push(cells.map(c => c.str));
    }

    const ws = XLSX.utils.aoa_to_sheet(sheetData);
    XLSX.utils.book_append_sheet(wb, ws, `Page ${i}`);
  }

  const xlsxBuf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  return new Blob([xlsxBuf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
}

// ─── EXCEL TO PDF ───

export async function excelToPdf(file: File): Promise<Uint8Array> {
  const XLSX = await import("xlsx");
  const { jsPDF } = await import("jspdf");
  const arrayBuffer = await readFileAsArrayBuffer(file);
  const wb = XLSX.read(new Uint8Array(arrayBuffer), { type: "array" });
  const pdf = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  let firstSheet = true;

  for (const sheetName of wb.SheetNames) {
    if (!firstSheet) pdf.addPage();
    firstSheet = false;

    const ws = wb.Sheets[sheetName];
    const rows: string[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });
    if (rows.length === 0) continue;

    const maxCols = Math.max(...rows.map(r => r.length), 1);
    const colW = (pageW - 80) / maxCols;
    const rowH = 18;
    let y = 50;

    // Sheet title
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.text(sheetName, 40, y);
    y += 24;
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);

    for (const row of rows) {
      if (y + rowH > pageH - 40) {
        pdf.addPage();
        y = 50;
      }
      for (let c = 0; c < maxCols; c++) {
        const x = 40 + c * colW;
        pdf.rect(x, y - 12, colW, rowH);
        const cellVal = row[c] != null ? String(row[c]) : "";
        const truncated = cellVal.substring(0, Math.floor(colW / 5));
        pdf.text(truncated, x + 3, y);
      }
      y += rowH;
    }
  }

  return new Uint8Array(pdf.output("arraybuffer"));
}

// ─── EDIT TEXT (extract, allow editing, re-render) ───

export interface PdfTextLine {
  text: string;
  fontSize: number;
  y: number;
  x: number;
  pageIndex: number;
}

export async function extractTextFromPdf(file: File): Promise<PdfTextLine[]> {
  const arrayBuffer = await readFileAsArrayBuffer(file);
  const data = new Uint8Array(arrayBuffer);
  const pdfjsLib = await getPdfjsLib();
  const pdf = await pdfjsLib.getDocument({ data }).promise;
  const lines: PdfTextLine[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const lineMap: Map<number, { x: number; str: string; fontSize: number }[]> = new Map();

    for (const item of content.items) {
      if (!("str" in item) || !(item as any).str) continue;
      const t = item as { str: string; transform: number[]; height: number };
      const y = Math.round(t.transform[5]);
      const x = Math.round(t.transform[4]);
      if (!lineMap.has(y)) lineMap.set(y, []);
      lineMap.get(y)!.push({ x, str: t.str, fontSize: t.height });
    }

    const sortedYs = Array.from(lineMap.keys()).sort((a, b) => b - a);
    for (const y of sortedYs) {
      const items = lineMap.get(y)!.sort((a, b) => a.x - b.x);
      lines.push({
        text: items.map(it => it.str).join(" "),
        fontSize: items[0].fontSize,
        y,
        x: items[0].x,
        pageIndex: i - 1,
      });
    }
  }

  return lines;
}

export async function rebuildPdfWithEditedText(file: File, editedLines: PdfTextLine[]): Promise<Uint8Array> {
  const arrayBuffer = await readFileAsArrayBuffer(file);
  const src = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);

  // Copy pages as background (rendered as images to preserve layout)
  const data = new Uint8Array(arrayBuffer);
  const pdfjsLib = await getPdfjsLib();
  const pdf = await pdfjsLib.getDocument({ data }).promise;

  for (let i = 1; i <= pdf.numPages; i++) {
    const pdfPage = await pdf.getPage(i);
    const viewport = pdfPage.getViewport({ scale: 2 });
    const origViewport = pdfPage.getViewport({ scale: 1 });
    const canvas = document.createElement("canvas");
    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Render page but we'll overlay edited text
    await pdfPage.render({ canvasContext: ctx, viewport }).promise;

    // White-out original text areas for this page's edited lines
    const pageLines = editedLines.filter(l => l.pageIndex === i - 1);
    const scaleX = viewport.width / origViewport.width;
    const scaleY = viewport.height / origViewport.height;
    ctx.fillStyle = "#ffffff";
    for (const line of pageLines) {
      const cx = line.x * scaleX;
      const cy = viewport.height - line.y * scaleY - line.fontSize * scaleY;
      ctx.fillRect(cx - 2, cy - 2, viewport.width - cx, line.fontSize * scaleY + 6);
    }

    const jpegBlob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(b => b ? resolve(b) : reject(new Error("Blob failed")), "image/jpeg", 0.92);
    });
    const jpegBytes = new Uint8Array(await jpegBlob.arrayBuffer());
    const img = await doc.embedJpg(jpegBytes);
    const page = doc.addPage([origViewport.width, origViewport.height]);
    page.drawImage(img, { x: 0, y: 0, width: origViewport.width, height: origViewport.height });

    // Draw edited text
    for (const line of pageLines) {
      const size = Math.max(8, Math.min(line.fontSize, 24));
      page.drawText(line.text, {
        x: line.x,
        y: line.y - size,
        size,
        font,
        color: rgb(0, 0, 0),
      });
    }
  }

  return doc.save();
}

// ─── COMPRESS ───

export async function compressPdf(file: File, level?: string): Promise<Uint8Array> {
  const scale = level === "high" ? 1.0 : level === "low" ? 2.0 : 1.5;
  const quality = level === "high" ? 0.4 : level === "low" ? 0.85 : 0.6;

  const arrayBuffer = await readFileAsArrayBuffer(file);
  const data = new Uint8Array(arrayBuffer);
  const pdfjsLib = await getPdfjsLib();
  const pdf = await pdfjsLib.getDocument({ data }).promise;
  const doc = await PDFDocument.create();

  for (let i = 1; i <= pdf.numPages; i++) {
    const pdfPage = await pdf.getPage(i);
    const viewport = pdfPage.getViewport({ scale });
    const canvas = document.createElement("canvas");
    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    await pdfPage.render({ canvasContext: ctx, viewport }).promise;

    const jpegBlob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(b => b ? resolve(b) : reject(new Error("Blob failed")), "image/jpeg", quality);
    });
    const jpegBytes = new Uint8Array(await jpegBlob.arrayBuffer());
    const img = await doc.embedJpg(jpegBytes);

    // Use original page dimensions (in points) so the output matches the source layout
    const origViewport = pdfPage.getViewport({ scale: 1.0 });
    const page = doc.addPage([origViewport.width, origViewport.height]);
    page.drawImage(img, { x: 0, y: 0, width: origViewport.width, height: origViewport.height });
  }

  return doc.save({ useObjectStreams: true });
}

// ─── IMAGE TO PDF ───

export async function imagesToPdf(files: File[]): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  for (const file of files) {
    const imgBytes = await readFileAsArrayBuffer(file);
    const isPng = file.type === "image/png" || file.name.toLowerCase().endsWith(".png");
    let img;
    try {
      img = isPng ? await doc.embedPng(imgBytes) : await doc.embedJpg(imgBytes);
    } catch {
      // If PNG embed fails (e.g. unsupported format), try as JPG and vice versa
      img = isPng ? await doc.embedJpg(imgBytes) : await doc.embedPng(imgBytes);
    }
    const page = doc.addPage([img.width, img.height]);
    page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
  }
  return doc.save();
}

// ─── PDF TO IMAGE ───

async function getPdfjsLib() {
  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
  return pdfjsLib;
}

export async function pdfToImages(file: File, format: "png" | "jpeg"): Promise<Blob[]> {
  const arrayBuffer = await readFileAsArrayBuffer(file);
  const data = new Uint8Array(arrayBuffer);

  const pdfjsLib = await getPdfjsLib();
  const pdf = await pdfjsLib.getDocument({ data }).promise;
  const blobs: Blob[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 2 });
    const canvas = document.createElement("canvas");
    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);
    const ctx = canvas.getContext("2d")!;
    // Fill white background for JPEG (no transparency)
    if (format === "jpeg") {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    await page.render({ canvasContext: ctx, viewport }).promise;
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        b => b ? resolve(b) : reject(new Error("Failed to create image blob")),
        `image/${format}`,
        0.95
      );
    });
    blobs.push(blob);
  }

  return blobs;
}

// ─── SIGNATURE ───

export async function addSignatureImage(
  file: File,
  signatureDataUrl: string,
  pageNum: number,
  x = 50,
  y = 50,
  scale = 0.5
): Promise<Uint8Array> {
  const pdfBytes = await readFileAsArrayBuffer(file);
  const doc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });

  const base64 = signatureDataUrl.split(",")[1];
  const binaryStr = atob(base64);
  const sigArray = new Uint8Array(binaryStr.length);
  for (let i = 0; i < binaryStr.length; i++) {
    sigArray[i] = binaryStr.charCodeAt(i);
  }

  const isPng = signatureDataUrl.includes("image/png");
  // Pass the Uint8Array directly, not .buffer (which may have extra bytes)
  const sigImg = isPng
    ? await doc.embedPng(sigArray)
    : await doc.embedJpg(sigArray);
  const scaled = sigImg.scale(scale);
  const pageIdx = Math.min(Math.max(pageNum - 1, 0), doc.getPageCount() - 1);
  const page = doc.getPage(pageIdx);
  page.drawImage(sigImg, { x, y, width: scaled.width, height: scaled.height });

  return doc.save();
}

// ─── PDF TO DOCX ───

function escapeXml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export async function pdfToDocx(file: File): Promise<Blob> {
  const arrayBuffer = await readFileAsArrayBuffer(file);
  const data = new Uint8Array(arrayBuffer);

  const pdfjsLib = await getPdfjsLib();
  const JSZip = (await import("jszip")).default;

  const pdf = await pdfjsLib.getDocument({ data }).promise;

  // Extract text from all pages, grouped into lines
  let bodyXml = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();

    const lines: { y: number; texts: { str: string; fontSize: number }[] }[] = [];
    for (const item of content.items) {
      if (!("str" in item) || !(item as any).str) continue;
      const t = item as { str: string; transform: number[]; height: number };
      const y = Math.round(t.transform[5]);
      const existing = lines.find(l => Math.abs(l.y - y) <= 2);
      if (existing) {
        existing.texts.push({ str: t.str, fontSize: t.height });
      } else {
        lines.push({ y, texts: [{ str: t.str, fontSize: t.height }] });
      }
    }

    lines.sort((a, b) => b.y - a.y);

    for (const line of lines) {
      const runsXml = line.texts.map(t => {
        const sz = Math.round(t.fontSize * 2);
        return `<w:r><w:rPr><w:sz w:val="${sz}"/><w:szCs w:val="${sz}"/></w:rPr><w:t xml:space="preserve">${escapeXml(t.str)} </w:t></w:r>`;
      }).join("");
      bodyXml += `<w:p>${runsXml}</w:p>`;
    }

    // Page break between pages (except last)
    if (i < pdf.numPages) {
      bodyXml += `<w:p><w:r><w:br w:type="page"/></w:r></w:p>`;
    }
  }

  // Build the DOCX zip structure
  const zip = new JSZip();

  zip.file("[Content_Types].xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">` +
    `<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>` +
    `<Default Extension="xml" ContentType="application/xml"/>` +
    `<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>` +
    `</Types>`);

  zip.file("_rels/.rels",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">` +
    `<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>` +
    `</Relationships>`);

  zip.file("word/_rels/document.xml.rels",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">` +
    `</Relationships>`);

  zip.file("word/document.xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">` +
    `<w:body>${bodyXml}<w:sectPr><w:pgSz w:w="12240" w:h="15840"/><w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440"/></w:sectPr></w:body>` +
    `</w:document>`);

  return zip.generateAsync({ type: "blob", mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
}

// ─── PARSE HELPERS ───

export function parsePageRanges(input: string): [number, number][] {
  return input.split(",").map(s => s.trim()).filter(Boolean).map(s => {
    if (s.includes("-")) {
      const [a, b] = s.split("-").map(Number);
      return [a, b] as [number, number];
    }
    return [Number(s), Number(s)] as [number, number];
  });
}

export function parsePageNumbers(input: string): number[] {
  const nums: number[] = [];
  input.split(",").map(s => s.trim()).filter(Boolean).forEach(s => {
    if (s.includes("-")) {
      const [a, b] = s.split("-").map(Number);
      for (let i = a; i <= b; i++) nums.push(i);
    } else {
      nums.push(Number(s));
    }
  });
  return nums;
}
