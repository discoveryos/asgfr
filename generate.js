#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const BASE = __dirname;
const GUIDE = path.join(BASE, "guide");
const VIEWS = path.join(BASE, "views");

const BANNER = ' ___   _____ _____ ____________\n' +
    ' / _ \\ /  ___|  __ \\|  ___| ___ \\\n' +
    '/ /_ \\\\ `--.| |  \\/| |_  | |_/ /\n' +
    '|  _  | `--. \\ | __ |  _| |    /\n' +
    '| | | |/\\__/ / |_\\ \\| |   | |\\ \\\n' +
    '\\_| |_/\\____/ \\____/\\_|   \\_| \\_|';

const PAGE_CSS = `
        :root {
            --ruby: #cc342d;
            --bg: #14141a;
            --panel: #1d1d26;
            --text: #e8e8ee;
            --muted: #9a9aa8;
            --border: #2c2c38;
            --accent: #f2b841;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: ui-monospace, "SF Mono", "Cascadia Code", Consolas, monospace;
            background: var(--bg);
            color: var(--text);
            line-height: 1.7;
            padding: 40px 20px;
        }
        .wrap {
            max-width: 800px;
            margin: 0 auto;
            background: var(--panel);
            border: 1px solid var(--border);
            border-radius: 10px;
            padding: 40px;
        }
        .topbar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 12px;
            margin-bottom: 28px;
            padding-bottom: 16px;
            border-bottom: 1px solid var(--border);
        }
        .topbar a { color: var(--accent); text-decoration: none; font-size: 14px; }
        .topbar a:hover { text-decoration: underline; }
        h1 { color: var(--ruby); font-size: 26px; margin-bottom: 6px; }
        .tagline { color: var(--accent); margin-bottom: 24px; }
        pre.code {
            background: #14141a;
            border: 1px solid var(--border);
            border-radius: 6px;
            padding: 14px 16px;
            margin: 8px 0 20px;
            overflow-x: auto;
            color: #a8c6a8;
            white-space: pre;
        }
        h2 { color: var(--accent); font-size: 18px; margin: 26px 0 10px; padding-top: 18px; border-top: 1px solid var(--border); }
        p { margin: 8px 0; }
        .footer { margin-top: 28px; color: var(--muted); font-size: 13px; }
`;

const CHAPTERS = [
  ["/ch0", "ch0_install.txt", "Installing Ruby"],
  ["/ch1", "ch1_hello.txt", "Hello World & Setup"],
  ["/ch2", "ch2_types.txt", "Variables & Data Types"],
  ["/ch3", "ch3_strings.txt", "Strings & Numbers"],
  ["/ch4", "ch4_arrays.txt", "Arrays & Hashes"],
  ["/ch5", "ch5_flow.txt", "Control Flow"],
  ["/ch6", "ch6_loops.txt", "Loops & Iteration"],
  ["/ch7", "ch7_methods.txt", "Methods"],
  ["/ch8", "ch8_classes.txt", "Classes & Objects"],
  ["/ch9", "ch9_blocks.txt", "Blocks & Procs"],
  ["/ch10", "ch10_files.txt", "File I/O"],
  ["/ch11", "ch11_gems.txt", "Gems & Projects"],
];

function escapeHtml(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderBody(text) {
  const out = [];
  let inCode = false;
  let codeLines = [];
  const lines = text.split("\n");

  for (const raw of lines) {
    const line = raw;

    if (line.startsWith("    ") || line.startsWith("\t")) {
      if (!inCode) {
        inCode = true;
        codeLines = [];
      }
      codeLines.push(line);
      continue;
    } else {
      if (inCode) {
        out.push(`<pre class="code">${escapeHtml(codeLines.join("\n"))}</pre>`);
        inCode = false;
        codeLines = [];
      }
    }

    const stripped = line.trim();
    if (!stripped) continue;
    if (/^[-=#]{3,}$/.test(stripped)) continue;
    if (/^[A-Z][A-Z0-9 &()'/-]{2,}:?$/.test(stripped) && stripped.length <= 60) {
      out.push(`<h2>${escapeHtml(stripped)}</h2>`);
    } else if (/^\d+\.\d+\s+\S/.test(stripped) || /^\d+\.\s/.test(stripped)) {
      out.push(`<h2>${escapeHtml(stripped)}</h2>`);
    } else {
      out.push(`<p>${escapeHtml(stripped)}</p>`);
    }
  }

  if (inCode) {
    out.push(`<pre class="code">${escapeHtml(codeLines.join("\n"))}</pre>`);
  }

  return out.join("\n");
}

function makeChapterPage(idx) {
  const [route, fname, title] = CHAPTERS[idx];
  const text = fs.readFileSync(path.join(GUIDE, fname), "utf8");
  const body = renderBody(text);

  const prev = idx > 0 ? CHAPTERS[idx - 1] : null;
  const next = idx + 1 < CHAPTERS.length ? CHAPTERS[idx + 1] : null;

  const prevA = prev
    ? `<a href="${prev[0]}">&larr; ${escapeHtml(prev[2])}</a>`
    : "<span></span>";
  const nextA = next
    ? `<a href="${next[0]}">${escapeHtml(next[2])} &rarr;</a>`
    : "<span></span>";

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(title)} - ASGFR</title>
    <style>${PAGE_CSS}</style>
</head>
<body>
    <div class="wrap">
        <div class="topbar">${prevA}<a href="/">Menu</a>${nextA}</div>
        <h1>${escapeHtml(title)}</h1>
        <div class="tagline">A Simple Ruby Guide</div>
        ${body}
        <div class="footer">ASGFR &middot; A Simple Ruby Guide</div>
    </div>
</body>
</html>
`;
}

function makeIndex() {
  const rows = CHAPTERS.map(
    ([route, , title]) =>
      `<li><span class="route">${route}</span><a href="${route}">${escapeHtml(title)}</a></li>`
  ).join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ASGFR - A Simple Ruby Guide</title>
    <style>${PAGE_CSS}
        .menu { list-style: none; border-top: 1px solid var(--border); }
        .menu li { display: flex; align-items: baseline; gap: 16px; padding: 12px 0; border-bottom: 1px solid var(--border); }
        .menu .route { color: var(--muted); width: 120px; flex-shrink: 0; font-size: 13px; }
        .menu a { color: var(--text); text-decoration: none; }
        .menu a:hover { color: var(--accent); }
        pre.ascii { color: var(--ruby); font-size: 12px; line-height: 1.1; margin-bottom: 8px; overflow-x: auto; user-select: none; }
    </style>
</head>
<body>
    <div class="wrap">
        <pre class="ascii">${BANNER}</pre>
        <h1>ASGFR</h1>
        <div class="tagline">A Simple Ruby Guide</div>
        <ul class="menu">
            ${rows}
        </ul>
        <div class="footer">
            Read it from the terminal too:
            <br><code style="background:#2c2c38;padding:2px 6px;border-radius:4px;color:var(--accent)">curl asgfr.vercel.app/ch1</code>
        </div>
    </div>
</body>
</html>
`;
}

fs.mkdirSync(VIEWS, { recursive: true });

fs.writeFileSync(path.join(VIEWS, "index.html"), makeIndex());

for (let i = 0; i < CHAPTERS.length; i++) {
  const route = CHAPTERS[i][0];
  const htmlName = `page-${route.replace("/", "")}.html`;
  fs.writeFileSync(path.join(VIEWS, htmlName), makeChapterPage(i));
}

console.log("Generated:", fs.readdirSync(VIEWS).sort().join(", "));
