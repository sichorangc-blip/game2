#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const root = process.cwd();
const outDir = path.join(root, "www");
const filesToCopy = ["index.html", "app.js", "styles.css"];

fs.mkdirSync(outDir, { recursive: true });

for (const file of filesToCopy) {
  const src = path.join(root, file);
  const dest = path.join(outDir, file);
  if (!fs.existsSync(src)) {
    console.error(`[cap:prepare] Missing required file: ${file}`);
    process.exit(1);
  }
  fs.copyFileSync(src, dest);
}

console.log("[cap:prepare] Copied web assets to ./www");
