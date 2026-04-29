#!/usr/bin/env node
/* =============================================================
   MR. WRITE — Production Build Script
   =============================================================
   Usage:
     node scripts/build.js          # minify CSS + JS
     node scripts/build.js --only=css
     node scripts/build.js --only=js

   What it does:
     1. CSS — strips comments & collapses whitespace →
              dist/css/style.min.css
     2. JS  — strips comments & collapses whitespace →
              dist/js/main.min.js
              dist/js/booking.min.js

   Images are NOT processed here. Keep images/ in the repo and
   deploy them directly. Resize/compress manually before committing.
   ============================================================= */

'use strict';

const fs   = require('fs');
const path = require('path');

// ----------------------------------------------------------
// Config
// ----------------------------------------------------------
const ROOT    = path.resolve(__dirname, '..');

const SRC_CSS = [path.join(ROOT, 'css', 'style.css')];
const DST_CSS = path.join(ROOT, 'dist', 'css');

const SRC_JS  = [
  path.join(ROOT, 'js', 'main.js'),
  path.join(ROOT, 'js', 'booking.js'),
];
const DST_JS  = path.join(ROOT, 'dist', 'js');

// ----------------------------------------------------------
// CLI args  --only=css|js
// ----------------------------------------------------------
const only = (() => {
  const arg = process.argv.find(a => a.startsWith('--only='));
  return arg ? arg.split('=')[1].toLowerCase() : 'all';
})();

const run = (task) => only === 'all' || only === task;

// ----------------------------------------------------------
// Utilities
// ----------------------------------------------------------
function ensureDir(dir) { fs.mkdirSync(dir, { recursive: true }); }
function ok(msg)  { process.stdout.write(`  \u2705 ${msg}\n`); }
function header(title) {
  const line = '\u2500'.repeat(50);
  process.stdout.write(`\n${line}\n  ${title}\n${line}\n`);
}
function kb(bytes)       { return (bytes / 1024).toFixed(1) + ' KB'; }
function pct(orig, mini) { return Math.round((1 - mini / orig) * 100) + '%'; }

// ----------------------------------------------------------
// 1. CSS BUILD
// ----------------------------------------------------------
function buildCSS() {
  header('Building CSS');
  ensureDir(DST_CSS);

  for (const srcFile of SRC_CSS) {
    const filename = path.basename(srcFile, '.css') + '.min.css';
    const dstFile  = path.join(DST_CSS, filename);

    let src = fs.readFileSync(srcFile, 'utf8');

    src = src.replace(/\/\*[\s\S]*?\*\//g, '');   // block comments
    src = src.replace(/\s+/g, ' ');                // collapse whitespace
    src = src.replace(/\s*([{}:;,>~+])\s*/g, '$1'); // tighten punctuation
    src = src.replace(/;}/g, '}');                 // drop trailing semicolons
    src = src.trim();

    fs.writeFileSync(dstFile, src, 'utf8');
    const orig = fs.statSync(srcFile).size;
    const mini = fs.statSync(dstFile).size;
    ok(`${path.relative(ROOT, srcFile)} → ${filename}  (${kb(orig)} → ${kb(mini)}, saved ${pct(orig, mini)})`);
  }
}

// ----------------------------------------------------------
// 2. JS BUILD
// ----------------------------------------------------------
function buildJS() {
  header('Building JS');
  ensureDir(DST_JS);

  for (const srcFile of SRC_JS) {
    const filename = path.basename(srcFile, '.js') + '.min.js';
    const dstFile  = path.join(DST_JS, filename);

    let src = fs.readFileSync(srcFile, 'utf8');

    // Strip block comments (preserve /*! licence headers)
    src = src.replace(/\/\*(?!!)([\s\S]*?)\*\//g, '');
    // Strip single-line comments (skip URLs like https://)
    src = src.replace(/(?<![:/])\/\/(?!https?:).*$/gm, '');
    // Collapse whitespace
    src = src.replace(/\n\s*/g, ' ').replace(/\s{2,}/g, ' ').trim();

    fs.writeFileSync(dstFile, src, 'utf8');
    const orig = fs.statSync(srcFile).size;
    const mini = fs.statSync(dstFile).size;
    ok(`${path.relative(ROOT, srcFile)} → ${filename}  (${kb(orig)} → ${kb(mini)}, saved ${pct(orig, mini)})`);
  }
}

// ----------------------------------------------------------
// Entry point
// ----------------------------------------------------------
const started = Date.now();
console.log('\nMr. Write — Production Build');

if (run('css')) buildCSS();
if (run('js'))  buildJS();

header('Done');
console.log(`  Build completed in ${Date.now() - started}ms\n`);
