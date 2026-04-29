#!/usr/bin/env node
/* =============================================================
   MR. WRITE — Production Build Script
   =============================================================
   Usage:
     node scripts/build.js              # full build
     node scripts/build.js --only=images
     node scripts/build.js --only=css
     node scripts/build.js --only=js

   What it does:
     1. IMAGES — copies images/ → dist/images/ preserving the full
        folder structure, optimising JPEGs (quality 80, max 1200px)
        and PNGs (max 1200px) via macOS sips.
     2. CSS    — strips comments & collapses whitespace →
                 dist/css/style.min.css
     3. JS     — strips comments & collapses whitespace →
                 dist/js/main.min.js
                 dist/js/booking.min.js

   Requirements:
     - Node >= 18 (uses fs/promises, structuredClone, etc.)
     - macOS sips for image optimisation (pre-installed on macOS).
       On Linux/CI, sips is skipped and images are copied as-is;
       replace with `sharp` or `imagemin` for cross-platform builds.
   ============================================================= */

'use strict';

const fs            = require('fs');
const path          = require('path');
const { execSync }  = require('child_process');

// ----------------------------------------------------------
// Config
// ----------------------------------------------------------
const ROOT      = path.resolve(__dirname, '..');
const SRC_IMG   = path.join(ROOT, 'images');
const DST_IMG   = path.join(ROOT, 'dist', 'images');
const SRC_CSS   = [path.join(ROOT, 'css', 'style.css')];
const DST_CSS   = path.join(ROOT, 'dist', 'css');
const SRC_JS    = [
  path.join(ROOT, 'js', 'main.js'),
  path.join(ROOT, 'js', 'booking.js'),
];
const DST_JS    = path.join(ROOT, 'dist', 'js');

// Image optimisation settings
const IMG_MAX_DIM  = 1200;   // max width/height (px)
const JPEG_QUALITY = 80;     // sips quality (0–100)

// Files/dirs to skip inside images/
const IMG_SKIP = new Set(['.DS_Store', '.gitkeep', 'Thumbs.db']);

// ----------------------------------------------------------
// CLI args  --only=images|css|js
// ----------------------------------------------------------
const only = (() => {
  const arg = process.argv.find(a => a.startsWith('--only='));
  return arg ? arg.split('=')[1].toLowerCase() : 'all';
})();

const run = (task) => only === 'all' || only === task;

// ----------------------------------------------------------
// Utilities
// ----------------------------------------------------------
function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function log(msg)  { process.stdout.write(`  ${msg}\n`); }
function ok(msg)   { process.stdout.write(`  \u2705 ${msg}\n`); }
function warn(msg) { process.stdout.write(`  \u26a0\ufe0f  ${msg}\n`); }
function header(title) {
  const line = '\u2500'.repeat(50);
  process.stdout.write(`\n${line}\n  ${title}\n${line}\n`);
}

function hasSips() {
  try { execSync('which sips', { stdio: 'ignore' }); return true; }
  catch { return false; }
}

// ----------------------------------------------------------
// 1. IMAGE BUILD
// ----------------------------------------------------------
function buildImages() {
  header('Building images');

  const sips = hasSips();
  if (!sips) {
    warn('sips not found — images will be copied without optimisation.');
    warn('Install ImageMagick or add sharp to package.json for CI.');
  }

  // Wipe and recreate dst root so stale files don't linger
  if (fs.existsSync(DST_IMG)) fs.rmSync(DST_IMG, { recursive: true });
  ensureDir(DST_IMG);

  let copied = 0;
  let optimised = 0;
  let skipped = 0;

  function walk(srcDir, dstDir) {
    ensureDir(dstDir);
    const entries = fs.readdirSync(srcDir, { withFileTypes: true });

    for (const entry of entries) {
      if (IMG_SKIP.has(entry.name)) { skipped++; continue; }

      const srcPath = path.join(srcDir, entry.name);
      const dstPath = path.join(dstDir, entry.name);

      if (entry.isDirectory()) {
        walk(srcPath, dstPath);
        continue;
      }

      const ext = path.extname(entry.name).toLowerCase();

      if (sips && (ext === '.jpg' || ext === '.jpeg')) {
        try {
          execSync(
            `sips -Z ${IMG_MAX_DIM} "${srcPath}" ` +
            `--setProperty formatOptions ${JPEG_QUALITY} ` +
            `--out "${dstPath}"`,
            { stdio: 'pipe' }
          );
          optimised++;
          log(`optimised  ${path.relative(ROOT, srcPath)}`);
        } catch {
          fs.copyFileSync(srcPath, dstPath);
          copied++;
          warn(`sips failed — copied as-is: ${entry.name}`);
        }
      } else if (sips && ext === '.png') {
        try {
          execSync(
            `sips -Z ${IMG_MAX_DIM} "${srcPath}" --out "${dstPath}"`,
            { stdio: 'pipe' }
          );
          optimised++;
          log(`optimised  ${path.relative(ROOT, srcPath)}`);
        } catch {
          fs.copyFileSync(srcPath, dstPath);
          copied++;
          warn(`sips failed — copied as-is: ${entry.name}`);
        }
      } else {
        // Non-image assets (ico, webmanifest, svg, etc.) — copy verbatim
        fs.copyFileSync(srcPath, dstPath);
        copied++;
        log(`copied     ${path.relative(ROOT, srcPath)}`);
      }
    }
  }

  walk(SRC_IMG, DST_IMG);

  ok(`${optimised} image(s) optimised, ${copied} file(s) copied, ${skipped} skipped.`);
}

// ----------------------------------------------------------
// 2. CSS BUILD
// ----------------------------------------------------------
function buildCSS() {
  header('Building CSS');
  ensureDir(DST_CSS);

  for (const srcFile of SRC_CSS) {
    const filename = path.basename(srcFile, '.css') + '.min.css';
    const dstFile  = path.join(DST_CSS, filename);

    let src = fs.readFileSync(srcFile, 'utf8');

    // Strip block comments (/* ... */)
    src = src.replace(/\/\*[\s\S]*?\*\//g, '');
    // Strip line-end comments after declarations (uncommon in CSS but safe)
    src = src.replace(/(?<=[;{}])\s*\/\/.*$/gm, '');
    // Collapse runs of whitespace / newlines
    src = src.replace(/\s+/g, ' ');
    // Tighten around punctuation
    src = src.replace(/\s*([{}:;,>~+])\s*/g, '$1');
    // Remove semicolon before closing brace
    src = src.replace(/;}/g, '}');
    src = src.trim();

    fs.writeFileSync(dstFile, src, 'utf8');
    const orig = fs.statSync(srcFile).size;
    const mini = fs.statSync(dstFile).size;
    ok(`${path.relative(ROOT, srcFile)} → ${filename}  (${kb(orig)} → ${kb(mini)}, saved ${pct(orig, mini)})`);
  }
}

// ----------------------------------------------------------
// 3. JS BUILD
// ----------------------------------------------------------
function buildJS() {
  header('Building JS');
  ensureDir(DST_JS);

  for (const srcFile of SRC_JS) {
    const filename = path.basename(srcFile, '.js') + '.min.js';
    const dstFile  = path.join(DST_JS, filename);

    let src = fs.readFileSync(srcFile, 'utf8');

    // Strip block comments (but preserve licence headers starting with /*!)
    src = src.replace(/\/\*(?!![\s\S]*?\*\/)([\s\S]*?)\*\//g, '');
    // Strip single-line comments (careful: skip URLs like https://)
    src = src.replace(/(?<![:/])\/\/(?!https?:).*$/gm, '');
    // Collapse runs of whitespace
    src = src.replace(/\n\s*/g, ' ');
    src = src.replace(/\s{2,}/g, ' ');
    src = src.trim();

    fs.writeFileSync(dstFile, src, 'utf8');
    const orig = fs.statSync(srcFile).size;
    const mini = fs.statSync(dstFile).size;
    ok(`${path.relative(ROOT, srcFile)} → ${filename}  (${kb(orig)} → ${kb(mini)}, saved ${pct(orig, mini)})`);
  }
}

// ----------------------------------------------------------
// Helpers
// ----------------------------------------------------------
function kb(bytes) { return (bytes / 1024).toFixed(1) + ' KB'; }
function pct(orig, mini) {
  return Math.round((1 - mini / orig) * 100) + '%';
}

// ----------------------------------------------------------
// Entry point
// ----------------------------------------------------------
const started = Date.now();
console.log('\nMr. Write — Production Build');

if (run('images')) buildImages();
if (run('css'))    buildCSS();
if (run('js'))     buildJS();

header('Done');
console.log(`  Build completed in ${Date.now() - started}ms\n`);
