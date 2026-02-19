import { useState, useRef, useEffect } from "react";
import JSZip from "jszip";
import { removeBackground } from "@imgly/background-removal";

// ─── Inline styles ──────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Fira+Code:wght@400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg0: #06060f;
    --bg1: #0d0d1a;
    --bg2: #13131f;
    --bg3: #1a1a2e;
    --card: #111120;
    --border: rgba(120,120,255,0.12);
    --border-hover: rgba(120,120,255,0.35);
    --acc1: #5b4fff;
    --acc2: #8b5cf6;
    --acc3: #00e5ff;
    --text1: #f0f0ff;
    --text2: #9090b8;
    --text3: #5a5a7a;
    --ok: #00e5a0;
    --err: #ff4f6e;
    --warn: #ffb547;
  }

  body {
    font-family: 'Space Grotesk', sans-serif;
    background: var(--bg0);
    color: var(--text1);
    min-height: 100vh;
    overflow-x: hidden;
  }

  .mp-wrap {
    max-width: 1000px;
    margin: 0 auto;
    padding: 2.5rem 1.5rem 4rem;
  }

  /* ── grid bg ── */
  .mp-wrap::before {
    content: '';
    position: fixed; inset: 0;
    background-image:
      linear-gradient(rgba(91,79,255,0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(91,79,255,0.04) 1px, transparent 1px);
    background-size: 48px 48px;
    pointer-events: none; z-index: -1;
  }

  /* ── header ── */
  .mp-header { text-align: center; margin-bottom: 3rem; padding-top: 1rem; }
  .mp-badge {
    display: inline-flex; align-items: center; gap: 0.5rem;
    background: rgba(91,79,255,0.15); border: 1px solid rgba(91,79,255,0.3);
    padding: 0.35rem 1rem; border-radius: 999px;
    font-size: 0.75rem; font-weight: 600; letter-spacing: 0.12em;
    color: #a89cff; text-transform: uppercase; margin-bottom: 1.25rem;
  }
  .mp-title {
    font-size: clamp(2rem, 5vw, 3.2rem); font-weight: 700; letter-spacing: -0.04em;
    line-height: 1.1; margin-bottom: 0.75rem;
  }
  .mp-title span {
    background: linear-gradient(135deg, #a89cff 0%, #00e5ff 100%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  }
  .mp-sub { color: var(--text2); font-size: 1.05rem; max-width: 600px; margin: 0 auto; line-height: 1.6; }

  /* ── card ── */
  .card {
    background: var(--card); border: 1px solid var(--border);
    border-radius: 20px; padding: 1.75rem; transition: border-color 0.3s;
    margin-bottom: 1.25rem;
  }
  .card:hover { border-color: var(--border-hover); }
  .card-title { font-size: 0.9rem; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; color: var(--text3); margin-bottom: 1.25rem; display: flex; align-items: center; gap: 0.5rem; }

  /* ── inputs ── */
  .form-textarea {
    width: 100%; background: var(--bg2); border: 1px solid var(--border);
    color: var(--text1); font-family: inherit; padding: 1rem;
    border-radius: 12px; transition: all 0.2s; min-height: 140px; resize: vertical;
    font-size: 0.9rem; line-height: 1.6;
  }
  .form-textarea:focus { outline: none; border-color: var(--acc1); box-shadow: 0 0 0 3px rgba(91,79,255,0.15); }
  
  .ai-badge {
    display: inline-flex; align-items: center; gap: 0.4rem;
    font-size: 0.75rem; color: var(--acc3);
    background: rgba(0,229,255,0.1); padding: 0.2rem 0.6rem;
    border-radius: 6px; margin-bottom: 0.8rem;
  }

  .data-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1rem; margin-top: 1rem; }
  .data-item { background: rgba(91,79,255,0.05); padding: 0.8rem; border-radius: 8px; border: 1px solid rgba(91,79,255,0.1); }
  .data-label { font-size: 0.75rem; color: var(--text2); display: block; margin-bottom: 0.25rem; }
  .data-val { font-size: 0.9rem; color: var(--text1); font-weight: 500; word-break: break-word; }

  /* ── upload ── */
  .upload-zone {
    border: 2px dashed var(--border); border-radius: 16px; padding: 3rem 2rem;
    text-align: center; cursor: pointer; transition: all 0.3s ease;
    background: var(--bg1); position: relative; overflow: hidden;
  }
  .upload-zone:hover { border-color: var(--acc1); background: rgba(91,79,255,0.02); }
  .upload-icon-wrap {
    width: 64px; height: 64px; margin: 0 auto 1rem; border-radius: 16px;
    display: flex; align-items: center; justify-content: center; font-size: 1.8rem;
    background: linear-gradient(135deg, var(--acc1), var(--acc2));
  }

  /* ── process btn ── */
  .process-btn {
    width: 100%; padding: 1.2rem;
    background: linear-gradient(135deg, var(--acc1) 0%, var(--acc2) 100%);
    border: none; border-radius: 14px; color: #fff;
    font-family: 'Space Grotesk', sans-serif; font-size: 1.1rem; font-weight: 600;
    cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.75rem;
    transition: all 0.3s ease; box-shadow: 0 4px 20px rgba(91,79,255,0.25);
  }
  .process-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 12px 40px rgba(91,79,255,0.4); }
  .process-btn:disabled { opacity: 0.6; cursor: wait; filter: saturate(0.5); }

  /* ── progress ── */
  .prog-bar-track { height: 6px; background: var(--bg2); border-radius: 3px; overflow: hidden; margin: 1rem 0; }
  .prog-bar-fill { height: 100%; background: linear-gradient(90deg, var(--acc1), var(--acc3)); transition: width 0.4s ease; }
  .steps { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.5rem; margin-top: 1rem; }
  .step { font-size: 0.8rem; color: var(--text3); display: flex; align-items: center; gap: 0.5rem; }
  .step.done { color: var(--ok); }
  .step.active { color: var(--acc3); font-weight: 500; }

  /* ── asset grid ── */
  .category-title { font-size: 0.85rem; color: var(--text2); margin: 1.5rem 0 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid var(--border); padding-bottom: 0.5rem; }
  .assets-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 1rem; }
  .asset-card {
    background: var(--bg1); border: 1px solid var(--border);
    border-radius: 12px; overflow: hidden; transition: all 0.2s;
  }
  .asset-card:hover { border-color: var(--acc3); transform: translateY(-3px); }
  .asset-preview {
    height: 100px; background: var(--bg2);
    /* Checkboard */
    background-image: linear-gradient(45deg, #1a1a2e 25%, transparent 25%), linear-gradient(-45deg, #1a1a2e 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #1a1a2e 75%), linear-gradient(-45deg, transparent 75%, #1a1a2e 75%);
    background-size: 16px 16px;
    display: flex; align-items: center; justify-content: center; padding: 0.8rem;
  }
  .asset-preview img { max-width: 100%; max-height: 100%; object-fit: contain; }
  .asset-info { padding: 0.6rem; text-align: center; }
  .asset-name { font-size: 0.7rem; color: var(--text1); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 0.4rem; }
  .dl-mini-btn {
    background: rgba(91,79,255,0.1); border: none; color: var(--acc3);
    padding: 0.3rem 0.8rem; border-radius: 4px; font-size: 0.7rem; cursor: pointer; width: 100%;
  }
  .dl-mini-btn:hover { background: rgba(91,79,255,0.25); }

  /* ── code block ── */
  .code-wrap { background: var(--bg0); border-radius: 12px; padding: 1rem; overflow-x: auto; max-height: 300px; }
  .code-wrap pre { font-family: 'Fira Code', monospace; font-size: 0.75rem; color: #9090b8; }

  /* ── download section ── */
  .dl-main-btn {
    width: 100%; padding: 1rem; margin-top: 1rem;
    background: var(--ok); border: none; border-radius: 12px;
    color: #06060f; font-weight: 700; font-size: 1rem; cursor: pointer;
    transition: all 0.2s;
  }
  .dl-main-btn:hover { transform: scale(1.02); box-shadow: 0 0 20px rgba(0,229,160,0.4); }

  .spin { animation: spin 1s linear infinite; display: inline-block; }
  @keyframes spin { to { transform: rotate(360deg); } }
`;

// ─── Constants ───────────────────────────────────────────────────────────────
const STEPS_LABELS = [
  "Lendo imagem & texto",
  "Removendo fundo (IA)",
  "Gerando Cortes (Normal)",
  "Gerando Cortes (Circular)",
  "Gerando Cortes (Arredondado)",
  "Otimizando SEO & Schema",
];

// ─── Helpers: Parser de Metadados IPTC/XMP ───────────────────────────────────
function parseFormText(text) {
  if (!text) return { name: "Empresa", category: "Negócio Local" };

  const data = {
    // Campos principais para nome de arquivo e SEO
    name: "",
    category: "",
    subcategory: "",
    desc: "",
    phone: "",
    address: "",
    hours: "",
    keywords: "",
    // Campos IPTC / XMP
    fileName: "",
    title: "",
    headline: "",
    creator: "",
    creatorJobTitle: "",
    creditLine: "",
    copyright: "",
    rightsUsage: "",
    source: "",
    location: "",
    region: "",
    whatsapp: "",
    founded: "",
    targetAudience: ""
  };

  // Extrai valor após rótulo (suporta rótulos com emoji, número, etc.)
  const extract = (label) => {
    const regex = new RegExp(`(?:${label})\\s*[:\\n]\\s*([^\\n]+)`, "i");
    const match = text.match(regex);
    return match ? match[1].trim() : "";
  };

  // ── Nome do Arquivo ──
  const fileNameMatch = text.match(/[\w\-]+\.(?:jpg|jpeg|png|webp|svg)/i);
  data.fileName = fileNameMatch ? fileNameMatch[0].replace(/\.\w+$/, "") : "";

  // ── IPTC Principais ──
  data.title = extract("Title");
  data.headline = extract("Headline");
  data.desc = extract("Description(?:\\s*\\/\\s*Caption)?|Description");
  data.keywords = extract("Keywords");
  data.category = extract("Category");
  data.subcategory = extract("Subcategory");

  // ── Dados da Empresa ──
  data.creator = extract("Creator(?!\\s*Job)");
  data.creatorJobTitle = extract("Creator Job Title");
  data.creditLine = extract("Credit Line");
  data.copyright = extract("Copyright(?:\\s*Notice)?|Copyright");
  data.rightsUsage = extract("Rights Usage Terms");
  data.source = extract("Source");

  // ── Localização ──
  data.location = extract("Location");
  data.region = extract("Region");
  data.address = data.location;

  // ── Contato ──
  data.phone = extract("Phone");
  data.whatsapp = extract("WhatsApp");
  data.hours = extract("Opening Hours");
  data.founded = extract("Founded");

  // ── Público-alvo (keywords extras) ──
  const audienceLines = [];
  const lines = text.split("\n").map(l => l.trim());
  let inAudience = false;
  for (const line of lines) {
    if (/público.alvo/i.test(line)) { inAudience = true; continue; }
    if (inAudience && line.length > 3 && !line.startsWith("📦") && !line.startsWith("🏷") && !line.startsWith("#")) {
      if (/^\w/.test(line) || /^advogado|^direito|^aposentadoria/i.test(line)) {
        audienceLines.push(line);
      }
    }
    if (inAudience && (line.startsWith("📦") || line.startsWith("🏷") || line === "")) inAudience = false;
  }
  data.targetAudience = audienceLines.join(", ");

  // ── Nome da empresa (fallback) ──
  if (!data.name) data.name = data.creator || data.title?.split("–")[0]?.trim() || "Empresa";
  if (!data.desc) data.desc = data.headline || "Empresa especializada.";

  return data;
}

function slugify(text) {
  return (text || "empresa")
    .toString().toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '').replace(/-+$/, '');
}

// ─── Helpers: Canvas Processing ──────────────────────────────────────────────
function processImage(img, width, format = "normal", radius = 0) {
  const height = width ? Math.round(img.height * (width / img.width)) : img.height;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  // Aplicar máscaras
  if (format === "circular") {
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, Math.min(width, height) / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
  } else if (format === "rounded") {
    const r = radius || width * 0.15; // 15% de raio padrão
    ctx.beginPath();
    ctx.moveTo(r, 0);
    ctx.lineTo(width - r, 0);
    ctx.quadraticCurveTo(width, 0, width, r);
    ctx.lineTo(width, height - r);
    ctx.quadraticCurveTo(width, height, width - r, height);
    ctx.lineTo(r, height);
    ctx.quadraticCurveTo(0, height, 0, height - r);
    ctx.lineTo(0, r);
    ctx.quadraticCurveTo(0, 0, r, 0);
    ctx.closePath();
    ctx.clip();
  }

  ctx.drawImage(img, 0, 0, width, height);
  return canvas.toDataURL("image/webp", 0.95);
}

// ─── Build Assets Logic ──────────────────────────────────────────────────────
// Processa imagem no tamanho real (sem redimensionar), apenas compactando para webp
function processImageRealSize(img, format = "normal", radius = 0) {
  const width = img.width;
  const height = img.height;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  // Aplicar máscaras
  if (format === "circular") {
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, Math.min(width, height) / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
  } else if (format === "rounded") {
    const r = radius || width * 0.15;
    ctx.beginPath();
    ctx.moveTo(r, 0);
    ctx.lineTo(width - r, 0);
    ctx.quadraticCurveTo(width, 0, width, r);
    ctx.lineTo(width, height - r);
    ctx.quadraticCurveTo(width, height, width - r, height);
    ctx.lineTo(r, height);
    ctx.quadraticCurveTo(0, height, 0, height - r);
    ctx.lineTo(0, r);
    ctx.quadraticCurveTo(0, 0, r, 0);
    ctx.closePath();
    ctx.clip();
  }

  ctx.drawImage(img, 0, 0, width, height);
  return canvas.toDataURL("image/webp", 0.90);
}

async function generateAllVariations(imgOriginal, imgNoBg, baseName, companyData) {
  const assets = [];
  // Usa fileName dos metadados IPTC se disponível, senão fallback para slug
  const baseFileName = companyData.fileName || slugify(companyData.name);
  const seoPrefix = baseFileName;

  // Imagens fonte
  const imgComFundo = imgOriginal;
  const imgSemFundo = imgNoBg || imgOriginal;

  // ═══════════════════════════════════════════════════════════════════════════
  // PASTA: Icons
  // ═══════════════════════════════════════════════════════════════════════════

  // --- Icons / Normal Com Fundo ---
  const iconNormalComFundoFolder = "Icons/Normal Com Fundo";
  assets.push({ name: `icon-${seoPrefix}-original.webp`, dataUrl: processImageRealSize(imgComFundo, "normal"), folder: iconNormalComFundoFolder, type: "Icon Normal Com Fundo - Tamanho Real", desc: `Ícone ${companyData.name} normal com fundo - tamanho real` });
  assets.push({ name: `icon-${seoPrefix}-512.webp`, dataUrl: processImage(imgComFundo, 512, "normal"), folder: iconNormalComFundoFolder, type: "Icon Normal Com Fundo - 512", desc: `Ícone ${companyData.name} normal com fundo 512px` });
  assets.push({ name: `icon-${seoPrefix}-192.webp`, dataUrl: processImage(imgComFundo, 192, "normal"), folder: iconNormalComFundoFolder, type: "Icon Normal Com Fundo - 192", desc: `Ícone ${companyData.name} normal com fundo 192px` });
  assets.push({ name: `icon-${seoPrefix}-favicon.ico`, dataUrl: processImage(imgComFundo, 32, "normal"), folder: iconNormalComFundoFolder, type: "Icon Normal Com Fundo - Favicon", desc: `Favicon ${companyData.name} normal com fundo` });

  // --- Icons / Arredondado Com Fundo ---
  const iconArredondadoComFundoFolder = "Icons/Arredondado Com Fundo";
  assets.push({ name: `icon-${seoPrefix}-original.webp`, dataUrl: processImageRealSize(imgComFundo, "rounded", 40), folder: iconArredondadoComFundoFolder, type: "Icon Arredondado Com Fundo - Tamanho Real", desc: `Ícone ${companyData.name} arredondado com fundo - tamanho real` });
  assets.push({ name: `icon-${seoPrefix}-512.webp`, dataUrl: processImage(imgComFundo, 512, "rounded", 50), folder: iconArredondadoComFundoFolder, type: "Icon Arredondado Com Fundo - 512", desc: `Ícone ${companyData.name} arredondado com fundo 512px` });
  assets.push({ name: `icon-${seoPrefix}-192.webp`, dataUrl: processImage(imgComFundo, 192, "rounded", 20), folder: iconArredondadoComFundoFolder, type: "Icon Arredondado Com Fundo - 192", desc: `Ícone ${companyData.name} arredondado com fundo 192px` });
  assets.push({ name: `icon-${seoPrefix}-favicon.ico`, dataUrl: processImage(imgComFundo, 32, "rounded", 5), folder: iconArredondadoComFundoFolder, type: "Icon Arredondado Com Fundo - Favicon", desc: `Favicon ${companyData.name} arredondado com fundo` });

  // --- Icons / Circular Com Fundo ---
  const iconCircularComFundoFolder = "Icons/Circular Com Fundo";
  assets.push({ name: `icon-${seoPrefix}-original.webp`, dataUrl: processImageRealSize(imgComFundo, "circular"), folder: iconCircularComFundoFolder, type: "Icon Circular Com Fundo - Tamanho Real", desc: `Ícone ${companyData.name} circular com fundo - tamanho real` });
  assets.push({ name: `icon-${seoPrefix}-512.webp`, dataUrl: processImage(imgComFundo, 512, "circular"), folder: iconCircularComFundoFolder, type: "Icon Circular Com Fundo - 512", desc: `Ícone ${companyData.name} circular com fundo 512px` });
  assets.push({ name: `icon-${seoPrefix}-192.webp`, dataUrl: processImage(imgComFundo, 192, "circular"), folder: iconCircularComFundoFolder, type: "Icon Circular Com Fundo - 192", desc: `Ícone ${companyData.name} circular com fundo 192px` });
  assets.push({ name: `icon-${seoPrefix}-favicon.ico`, dataUrl: processImage(imgComFundo, 32, "circular"), folder: iconCircularComFundoFolder, type: "Icon Circular Com Fundo - Favicon", desc: `Favicon ${companyData.name} circular com fundo` });

  // --- Icons / Sem Fundo ---
  const iconSemFundoFolder = "Icons/Sem Fundo";
  assets.push({ name: `icon-${seoPrefix}-original.webp`, dataUrl: processImageRealSize(imgSemFundo, "normal"), folder: iconSemFundoFolder, type: "Icon Sem Fundo - Tamanho Real", desc: `Ícone ${companyData.name} sem fundo - tamanho real` });
  assets.push({ name: `icon-${seoPrefix}-512.webp`, dataUrl: processImage(imgSemFundo, 512, "normal"), folder: iconSemFundoFolder, type: "Icon Sem Fundo - 512", desc: `Ícone ${companyData.name} sem fundo 512px` });
  assets.push({ name: `icon-${seoPrefix}-192.webp`, dataUrl: processImage(imgSemFundo, 192, "normal"), folder: iconSemFundoFolder, type: "Icon Sem Fundo - 192", desc: `Ícone ${companyData.name} sem fundo 192px` });
  assets.push({ name: `icon-${seoPrefix}-favicon.ico`, dataUrl: processImage(imgSemFundo, 32, "normal"), folder: iconSemFundoFolder, type: "Icon Sem Fundo - Favicon", desc: `Favicon ${companyData.name} sem fundo` });

  // ═══════════════════════════════════════════════════════════════════════════
  // PASTA: Imagens
  // ═══════════════════════════════════════════════════════════════════════════

  // --- Imagens / Sem Fundo ---
  const imgSemFundoFolder = "Imagens/Sem Fundo";
  assets.push({ name: `img-${seoPrefix}-original.webp`, dataUrl: processImageRealSize(imgSemFundo, "normal"), folder: imgSemFundoFolder, type: "Imagem Sem Fundo - Tamanho Real", desc: `Imagem ${companyData.name} sem fundo - tamanho real` });
  assets.push({ name: `img-${seoPrefix}-desktop.webp`, dataUrl: processImage(imgSemFundo, 400, "normal"), folder: imgSemFundoFolder, type: "Imagem Sem Fundo - Desktop", desc: `Imagem ${companyData.name} sem fundo para desktop` });
  assets.push({ name: `img-${seoPrefix}-mobile.webp`, dataUrl: processImage(imgSemFundo, 200, "normal"), folder: imgSemFundoFolder, type: "Imagem Sem Fundo - Mobile", desc: `Imagem ${companyData.name} sem fundo para mobile` });

  // --- Imagens / Com Fundo / Normal ---
  const imgComFundoNormalFolder = "Imagens/Com Fundo/Normal";
  assets.push({ name: `img-${seoPrefix}-original.webp`, dataUrl: processImageRealSize(imgComFundo, "normal"), folder: imgComFundoNormalFolder, type: "Imagem Com Fundo Normal - Tamanho Real", desc: `Imagem ${companyData.name} com fundo normal - tamanho real` });
  assets.push({ name: `img-${seoPrefix}-desktop.webp`, dataUrl: processImage(imgComFundo, 400, "normal"), folder: imgComFundoNormalFolder, type: "Imagem Com Fundo Normal - Desktop", desc: `Imagem ${companyData.name} com fundo normal para desktop` });
  assets.push({ name: `img-${seoPrefix}-mobile.webp`, dataUrl: processImage(imgComFundo, 200, "normal"), folder: imgComFundoNormalFolder, type: "Imagem Com Fundo Normal - Mobile", desc: `Imagem ${companyData.name} com fundo normal para mobile` });

  // --- Imagens / Com Fundo / Circular ---
  const imgComFundoCircularFolder = "Imagens/Com Fundo/Circular";
  assets.push({ name: `img-${seoPrefix}-original.webp`, dataUrl: processImageRealSize(imgComFundo, "circular"), folder: imgComFundoCircularFolder, type: "Imagem Com Fundo Circular - Tamanho Real", desc: `Imagem ${companyData.name} com fundo circular - tamanho real` });
  assets.push({ name: `img-${seoPrefix}-desktop.webp`, dataUrl: processImage(imgComFundo, 400, "circular"), folder: imgComFundoCircularFolder, type: "Imagem Com Fundo Circular - Desktop", desc: `Imagem ${companyData.name} com fundo circular para desktop` });
  assets.push({ name: `img-${seoPrefix}-mobile.webp`, dataUrl: processImage(imgComFundo, 200, "circular"), folder: imgComFundoCircularFolder, type: "Imagem Com Fundo Circular - Mobile", desc: `Imagem ${companyData.name} com fundo circular para mobile` });

  // --- Imagens / Com Fundo / Arredondada ---
  const imgComFundoArredondadaFolder = "Imagens/Com Fundo/Arredondada";
  assets.push({ name: `img-${seoPrefix}-original.webp`, dataUrl: processImageRealSize(imgComFundo, "rounded", 40), folder: imgComFundoArredondadaFolder, type: "Imagem Com Fundo Arredondada - Tamanho Real", desc: `Imagem ${companyData.name} com fundo arredondada - tamanho real` });
  assets.push({ name: `img-${seoPrefix}-desktop.webp`, dataUrl: processImage(imgComFundo, 400, "rounded", 40), folder: imgComFundoArredondadaFolder, type: "Imagem Com Fundo Arredondada - Desktop", desc: `Imagem ${companyData.name} com fundo arredondada para desktop` });
  assets.push({ name: `img-${seoPrefix}-mobile.webp`, dataUrl: processImage(imgComFundo, 200, "rounded", 20), folder: imgComFundoArredondadaFolder, type: "Imagem Com Fundo Arredondada - Mobile", desc: `Imagem ${companyData.name} com fundo arredondada para mobile` });

  return assets;
}

function buildSchema(data, baseFileName) {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "LegalService",
    "name": data.title || data.name,
    "description": data.desc,
    "image": `https://site.com/assets/Imagens/Sem Fundo/img-${baseFileName}-desktop.webp`,
    "telephone": data.phone,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": data.location,
      "addressRegion": data.region,
      "addressCountry": "BR"
    },
    "openingHours": data.hours,
    "founder": data.creator,
    "foundingDate": data.founded,
    "priceRange": "$$"
  }, null, 2);
}

// ─── Gera JSON completo de metadados IPTC/XMP para incluir no ZIP ────────────
function buildIptcMetadata(data) {
  return JSON.stringify({
    "IPTC": {
      "Title": data.title,
      "Headline": data.headline,
      "Description": data.desc,
      "Keywords": data.keywords,
      "Category": data.category,
      "Subcategory": data.subcategory
    },
    "Empresa": {
      "Creator": data.creator,
      "CreatorJobTitle": data.creatorJobTitle,
      "CreditLine": data.creditLine,
      "CopyrightNotice": data.copyright,
      "RightsUsageTerms": data.rightsUsage,
      "Source": data.source
    },
    "Localizacao": {
      "Location": data.location,
      "Region": data.region
    },
    "Contato": {
      "Phone": data.phone,
      "WhatsApp": data.whatsapp,
      "OpeningHours": data.hours,
      "Founded": data.founded
    },
    "PublicoAlvo": data.targetAudience,
    "NomeArquivoBase": data.fileName
  }, null, 2);
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function MaquinaPerformance() {
  const [file, setFile] = useState(null);
  const [inputText, setInputText] = useState("");
  const [parsedData, setParsedData] = useState(null);

  const [processing, setProc] = useState(false);
  const [statusText, setStatus] = useState("");
  const [assets, setAssets] = useState(null);
  const [error, setError] = useState(null);
  const fileRef = useRef();

  // Parse Live
  useEffect(() => {
    if (inputText.length > 10) {
      const data = parseFormText(inputText);
      setParsedData(data);
    }
  }, [inputText]);

  const handleProcess = async () => {
    if (!file) { setError("Por favor, selecione um logo."); return; }
    setProc(true); setError(null); setAssets(null);
    try {
      const finalData = parsedData || { name: "Empresa", desc: "Descrição" };

      // 1. Load Original
      setStatus("Lendo imagem original...");
      const imgOriginal = await loadImage(file);

      // 2. Remove BG
      setStatus("Removendo fundo da imagem (IA)...");
      let imgNoBg = null;
      try {
        const resultBlob = await removeBackground(file);
        imgNoBg = await loadImage(resultBlob);
      } catch (err) {
        console.warn("Background removal failed, proceeding with original only.");
      }

      // 3. Generate Variations
      setStatus("Criando cortes: Normal, Circular e Arredondado...");
      await new Promise(r => setTimeout(r, 500)); // UI Breath

      const generatedAssets = await generateAllVariations(imgOriginal, imgNoBg, file.name, finalData);

      setAssets(generatedAssets);
      setStatus("Concluído!");
    } catch (e) {
      setError(e.message);
    } finally {
      setProc(false);
    }
  };

  const loadImage = (src) => new Promise((resolve, reject) => {
    const url = src instanceof Blob ? URL.createObjectURL(src) : src;
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });

  const downloadZip = async () => {
    const zip = new JSZip();
    assets.forEach(a => {
      // Remover prefixo data:image/xxx;base64,
      zip.folder(a.folder).file(a.name, a.dataUrl.split(",")[1], { base64: true });
    });

    // Usa fileName dos metadados IPTC como base
    const d = parsedData || {};
    const baseFileName = d.fileName || slugify(d.name);
    const schema = buildSchema(d, baseFileName);
    const seoPrefix = baseFileName;

    const html = `<!-- SEO & Assets para ${d.title || d.name} -->
<!-- IPTC: ${d.title} -->
<title>${d.title || d.name} - ${d.category}</title>
<meta name="description" content="${d.desc}">
<meta name="keywords" content="${d.keywords}">
<meta name="author" content="${d.creator}">
<meta name="copyright" content="${d.copyright}">
<!-- Preload da Versão Mais Usada (Desktop Sem Fundo) -->
<link rel="preload" as="image" href="/assets/Imagens/Sem Fundo/img-${seoPrefix}-desktop.webp">
<!-- Favicon -->
<link rel="icon" type="image/x-icon" href="/assets/Icons/Normal Com Fundo/icon-${seoPrefix}-favicon.ico">
<!-- PWA Icons -->
<link rel="apple-touch-icon" sizes="192x192" href="/assets/Icons/Normal Com Fundo/icon-${seoPrefix}-192.webp">
<link rel="apple-touch-icon" sizes="512x512" href="/assets/Icons/Normal Com Fundo/icon-${seoPrefix}-512.webp">
<script type="application/ld+json">${schema}</script>`;

    zip.file("seo-metadados.html", html);
    zip.file("metadados-iptc.json", buildIptcMetadata(d));
    zip.file("site.webmanifest", JSON.stringify({
      name: d.title || d.name,
      short_name: baseFileName,
      icons: [
        { src: `/assets/Icons/Normal Com Fundo/icon-${seoPrefix}-192.webp`, sizes: "192x192", type: "image/webp" },
        { src: `/assets/Icons/Normal Com Fundo/icon-${seoPrefix}-512.webp`, sizes: "512x512", type: "image/webp" }
      ]
    }, null, 2));

    const content = await zip.generateAsync({ type: "blob" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(content);
    a.download = `${baseFileName}-kit-completo.zip`;
    a.click();
  };

  return (
    <>
      <style>{css}</style>
      <div className="mp-wrap">
        <header className="mp-header">
          <div className="mp-badge">⚡ V4.0 Ultra Generator</div>
          <h1 className="mp-title">Máquina de <span>Identidade Visual</span></h1>
          <p className="mp-sub">Cole as respostas do formulário do cliente e receba um kit completo com todas as variações de imagem (Circular, Arredondada, Sem Fundo) organizadas e otimizadas.</p>
        </header>

        <div className="upload-zone" onClick={() => fileRef.current.click()}>
          <input type="file" ref={fileRef} style={{ display: 'none' }} onChange={e => { setFile(e.target.files[0]); setAssets(null) }} accept="image/*" />
          <div className="upload-icon-wrap">{file ? "✅" : "📁"}</div>
          <h3>{file ? file.name : "Carregar Logo do Cliente"}</h3>
          <p>Formatos suportados: PNG, JPG, SVG, WebP</p>
        </div>

        <div className="card" style={{ marginTop: '1.5rem' }}>
          <div className="card-title">🏷️ Metadados IPTC / XMP (Cole Aqui)</div>
          <div className="form-group">
            <span className="ai-badge">📋 Estrutura de Metadados Pronta</span>
            <textarea
              className="form-textarea"
              style={{ minHeight: '220px' }}
              placeholder={"Cole aqui a estrutura completa de metadados IPTC/XMP:\n\nTitle:\nViana Advogado & Associados – Direito Trabalhista\n\nHeadline:\nEscritório especializado...\n\nDescription:\n...\n\nKeywords:\nadvogado trabalhista RJ, ...\n\nCreator:\nViana Advogado & Associados\n\nCopyright:\n© 2021 ..."}
              value={inputText}
              onChange={e => setInputText(e.target.value)}
            />
          </div>

          {parsedData && parsedData.name && (
            <div className="data-grid">
              <div className="data-item"><span className="data-label">📁 Nome Arquivo</span><div className="data-val">{parsedData.fileName || "---"}</div></div>
              <div className="data-item"><span className="data-label">🏷️ Title (IPTC)</span><div className="data-val">{parsedData.title || "---"}</div></div>
              <div className="data-item"><span className="data-label">📰 Headline</span><div className="data-val">{parsedData.headline || "---"}</div></div>
              <div className="data-item" style={{ gridColumn: '1 / -1' }}><span className="data-label">📝 Description</span><div className="data-val">{parsedData.desc || "---"}</div></div>
              <div className="data-item" style={{ gridColumn: '1 / -1' }}><span className="data-label">🔑 Keywords</span><div className="data-val">{parsedData.keywords || "---"}</div></div>
              <div className="data-item"><span className="data-label">📂 Category</span><div className="data-val">{parsedData.category || "---"}</div></div>
              <div className="data-item"><span className="data-label">📂 Subcategory</span><div className="data-val">{parsedData.subcategory || "---"}</div></div>
              <div className="data-item"><span className="data-label">👤 Creator</span><div className="data-val">{parsedData.creator || "---"}</div></div>
              <div className="data-item"><span className="data-label">©️ Copyright</span><div className="data-val">{parsedData.copyright || "---"}</div></div>
              <div className="data-item"><span className="data-label">📍 Location</span><div className="data-val">{parsedData.location || "---"}</div></div>
              <div className="data-item"><span className="data-label">🗺️ Region</span><div className="data-val">{parsedData.region || "---"}</div></div>
              <div className="data-item"><span className="data-label">📞 Phone</span><div className="data-val">{parsedData.phone || "---"}</div></div>
              <div className="data-item"><span className="data-label">💬 WhatsApp</span><div className="data-val">{parsedData.whatsapp || "---"}</div></div>
              <div className="data-item"><span className="data-label">🕐 Horário</span><div className="data-val">{parsedData.hours || "---"}</div></div>
              <div className="data-item"><span className="data-label">📅 Fundação</span><div className="data-val">{parsedData.founded || "---"}</div></div>
            </div>
          )}
        </div>

        <button className="process-btn" onClick={handleProcess} disabled={processing || !file}>
          {processing ? <><span className="spin">⚙️</span> {statusText}</> : "⚡ Processar Kit Completo"}
        </button>

        {error && <div className="card" style={{ color: 'var(--err)', borderColor: 'var(--err)' }}>❌ {error}</div>}

        {assets && (
          <div style={{ marginTop: '2rem' }}>
            <div className="mp-title" style={{ fontSize: '1.5rem' }}>📦 Kit Gerado ({assets.length} arquivos)</div>

            {/* ── ICONS ── */}
            <div className="category-title" style={{ fontSize: '1rem', color: 'var(--acc3)', borderBottom: '2px solid var(--acc3)' }}>🗂️ Icons</div>
            {[
              "Icons/Normal Com Fundo",
              "Icons/Arredondado Com Fundo",
              "Icons/Circular Com Fundo",
              "Icons/Sem Fundo"
            ].map(cat => (
              <div key={cat}>
                <div className="category-title">📂 {cat}</div>
                <div className="assets-grid">
                  {assets.filter(a => a.folder === cat).map((asset, i) => (
                    <div key={i} className="asset-card">
                      <div className="asset-preview">
                        <img src={asset.dataUrl} alt="Preview" />
                      </div>
                      <div className="asset-info">
                        <div className="asset-name" title={asset.name}>{asset.name}</div>
                        <button className="dl-mini-btn" onClick={() => {
                          const a = document.createElement("a"); a.href = asset.dataUrl; a.download = asset.name; a.click();
                        }}>Baixar</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* ── IMAGENS ── */}
            <div className="category-title" style={{ fontSize: '1rem', color: 'var(--acc3)', borderBottom: '2px solid var(--acc3)', marginTop: '2rem' }}>🗂️ Imagens</div>
            {[
              "Imagens/Sem Fundo",
              "Imagens/Com Fundo/Normal",
              "Imagens/Com Fundo/Circular",
              "Imagens/Com Fundo/Arredondada"
            ].map(cat => (
              <div key={cat}>
                <div className="category-title">📂 {cat}</div>
                <div className="assets-grid">
                  {assets.filter(a => a.folder === cat).map((asset, i) => (
                    <div key={i} className="asset-card">
                      <div className="asset-preview">
                        <img src={asset.dataUrl} alt="Preview" />
                      </div>
                      <div className="asset-info">
                        <div className="asset-name" title={asset.name}>{asset.name}</div>
                        <button className="dl-mini-btn" onClick={() => {
                          const a = document.createElement("a"); a.href = asset.dataUrl; a.download = asset.name; a.click();
                        }}>Baixar</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div className="dl-section">
              <button className="dl-main-btn" onClick={downloadZip}>
                ⬇ Baixar ZIP (Tudo Organizado em Pastas)
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
