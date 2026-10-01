// Utilitas unduh gambar referensi PM (mentah / produksi).
//
// Gambar referensi bisa berupa dua hal:
// 1. Berkas raster yang diunggah kontraktor atau tim teknis -> tersedia di
//    order.rawImage / order.productionImage sebagai URL, dan `<img>` dirender
//    oleh DrawingPreview.
// 2. TechnicalDrawing (SVG) sebagai fallback ketika tidak ada berkas diunggah.
//
// Karena itu unduhan dibaca dari DOM pratinjau, bukan dari state order, agar
// kedua sumber tersebut tetap bisa diunduh.

// Atribut visual yang perlu ditulis literal ke SVG hasil serialisasi.
// `currentColor` hanya resolve lewat CSS pada dokumen, sehingga harus
// ditukar menjadi nilai computed sebelum SVG berdiri sendiri sebagai berkas.
const SVG_STYLE_PROPS = [
  "stroke",
  "fill",
  "stroke-width",
  "font-family",
  "font-size",
  "letter-spacing",
  "opacity",
] as const;

const SVG_NS = "http://www.w3.org/2000/svg";

function sanitizeFileName(value: string, fallback: string): string {
  const cleaned = value.trim().replace(/[\\/:*?"<>|]+/g, "-").replace(/\s+/g, " ");
  return cleaned || fallback;
}

function withExtension(fileName: string, extension: string): string {
  if (fileName.toLowerCase().endsWith(extension)) return fileName;
  return `${fileName.replace(/\.[a-z0-9]+$/i, "")}${extension}`;
}

function triggerDownload(href: string, fileName: string): void {
  const link = document.createElement("a");
  link.href = href;
  link.download = fileName;
  link.rel = "noopener";
  document.body.append(link);
  link.click();
  link.remove();
}

// Buat object URL sementara lalu lepas setelah browser sempat memulai unduhan.
function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  triggerDownload(url, fileName);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

async function downloadImage(source: string, fileName: string): Promise<void> {
  try {
    const response = await fetch(source);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    downloadBlob(await response.blob(), fileName);
  } catch {
    // Gambar lintas origin tanpa header CORS tidak bisa diblob-kan di sisi
    // klien, jadi turunkan ke navigasi biasa (browser tetap mengunduh berkas).
    triggerDownload(source, fileName);
  }
}

function downloadSvg(svg: SVGSVGElement, fileName: string): void {
  const clone = svg.cloneNode(true) as SVGSVGElement;
  const sourceNodes = Array.from(svg.querySelectorAll<SVGElement>("*"));
  const cloneNodes = Array.from(clone.querySelectorAll<SVGElement>("*"));

  // Ganti property yang diwarisi/di-resolve CSS menjadi nilai literal.
  sourceNodes.forEach((node, index) => {
    const target = cloneNodes[index];
    if (!target) return;
    const style = getComputedStyle(node);
    for (const prop of SVG_STYLE_PROPS) {
      const value = style.getPropertyValue(prop);
      if (value) target.setAttribute(prop, value);
    }
  });

  clone.removeAttribute("style");
  clone.removeAttribute("class");
  clone.setAttribute("xmlns", SVG_NS);

  const viewBox = (svg.getAttribute("viewBox") ?? "0 0 600 400").trim().split(/\s+/).map(Number);
  const [minX, minY, width, height] = viewBox.length === 4 && viewBox.every(Number.isFinite)
    ? viewBox
    : [0, 0, 600, 400];
  clone.setAttribute("x", String(minX));
  clone.setAttribute("y", String(minY));
  clone.setAttribute("width", String(width));
  clone.setAttribute("height", String(height));

  const markup = `<?xml version="1.0" encoding="UTF-8"?>\n${new XMLSerializer().serializeToString(clone)}`;
  downloadBlob(new Blob([markup], { type: "image/svg+xml;charset=utf-8" }), fileName);
}

export async function downloadDrawing(scopeId: string, rawFileName: string): Promise<void> {
  const scope = document.getElementById(scopeId);
  if (!scope) throw new Error("Pratinjau gambar tidak ditemukan.");

  const fileName = sanitizeFileName(rawFileName, "gambar-referensi");

  const image = scope.querySelector<HTMLImageElement>("img[src]");
  const source = image?.currentSrc || image?.src;
  if (source) {
    await downloadImage(source, fileName);
    return;
  }

  const svg = scope.querySelector<SVGSVGElement>("svg");
  if (!svg) throw new Error("Gambar belum tersedia untuk diunduh.");

  downloadSvg(svg, withExtension(fileName, ".svg"));
}
