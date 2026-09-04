#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const BASE = __dirname;
const GUIDE = path.join(BASE, "guide");
const VIEWS = path.join(BASE, "views");

const BANNER = '                          ___         \n' +
    "                        /'___\\        \n" +
    '   __      ____     __ /\\ \\__/  _ __  \n' +
    " /'__`\\   /',__\\  /'_ `\\ \\ ,__/\\`'__\\\n" +
    "/\\ \\L\\.\\_/\\__, `\\/\\ \\L\\ \\ \\ \\_/\\ \\ \\/ \n" +
    "\\ \\__/\\.\\_/\\____/\\ \\____ \\ \\_\\  \\ \\_\\ \n" +
    " \\/__/\\_//\\/___/  \\/___L\\ \\/_/   \\/_/ \n" +
    "                    /\\____/           \n" +
    "                    \\_/__/            ";

const PAGE_CSS = `
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: "Courier New", Courier, monospace;
            background: #f4f4f0;
            color: #333;
            line-height: 1.6;
            padding: 40px 20px;
        }
        .wrap {
            max-width: 700px;
            margin: 0 auto;
        }
        .topbar {
            margin-bottom: 24px;
            font-size: 13px;
        }
        .topbar a { color: #b03030; text-decoration: none; }
        .topbar a:hover { text-decoration: underline; }
        .topbar span { color: #999; }
        h1 { font-size: 24px; margin-bottom: 4px; }
        .chapter-num { color: #999; font-size: 13px; margin-bottom: 20px; }
        pre.code {
            background: #e8e8e4;
            border: 1px solid #ddd;
            border-radius: 2px;
            padding: 12px;
            margin: 12px 0 16px;
            overflow-x: auto;
            color: #333;
            font-size: 13px;
            line-height: 1.4;
        }
        h2 { font-size: 16px; margin: 20px 0 8px; color: #b03030; }
        p { margin: 8px 0; font-size: 14px; }
        .footer { margin-top: 28px; color: #999; font-size: 13px; border-top: 1px solid #ddd; padding-top: 12px; }
        .footer a { color: #b03030; text-decoration: none; }
        .footer a:hover { text-decoration: underline; }
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
  ["/ch12", "ch12_examples.txt", "Worked Examples"],
  ["/ch13", "ch13_web.txt", "Web Development", "advance"],
  ["/ch14", "ch14_games.txt", "Game Development", "advance"],
];

function escapeHtml(s) {
  return s
    .replace(/\x1b\[[0-9;]*m/g, "")
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

  const chapterOptions = CHAPTERS.map(
    ([route, , t]) =>
      `<option value="${route}"${route === CHAPTERS[idx][0] ? " selected" : ""}>${escapeHtml(t)}</option>`
  ).join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(title)} - ASGFR</title>
    <style>${PAGE_CSS}
        .topbar select {
            font-family: "Courier New", Courier, monospace;
            font-size: 13px;
            padding: 2px 4px;
            background: #e8e8e4;
            border: 1px solid #ddd;
            color: #333;
        }
    </style>
</head>
<body>
    <div class="wrap">
        <div class="topbar">
            ${prevA}
            <a href="/">Menu</a>
            <select onchange="if(this.value) window.location.href=this.value">
                <option value="">Chapter...</option>
                ${chapterOptions}
            </select>
            ${nextA}
        </div>
        <h1>${escapeHtml(title)}</h1>
        <div class="chapter-num">${CHAPTERS[idx][0]}</div>
        ${body}
        <div class="footer">ASGFR &middot; Made by Kevin Dan Mathew</div>
    </div>
</body>
</html>
`;
}

function makeIndex() {
  const baseRows = CHAPTERS
    .filter((c) => !c[3])
    .map(
      ([route, , title]) =>
        `<tr><td><a href="${route}">${route}</a></td><td>${escapeHtml(title)}</td></tr>`
    )
    .join("\n");

  const advRows = CHAPTERS
    .filter((c) => c[3] === "advance")
    .map(
      ([route, , title]) =>
        `<tr><td><a href="${route}">${route}</a></td><td>${escapeHtml(title)}</td></tr>`
    )
    .join("\n");

  const advSection = advRows
    ? `<h2 class="sec-title">asgfr advance</h2>
       <table>
           <thead><tr><th>#</th><th>Chapter</th></tr></thead>
           <tbody>
               ${advRows}
           </tbody>
       </table>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ASGFR - A Simple Ruby Guide</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: "Courier New", Courier, monospace;
            background: #f4f4f0;
            color: #333;
            line-height: 1.6;
            padding: 40px 20px;
        }
        .container {
            max-width: 700px;
            margin: 0 auto;
        }
        pre.ascii {
            color: #b03030;
            font-size: 11px;
            line-height: 1.1;
            margin-bottom: 4px;
            overflow-x: auto;
        }
        h1 {
            font-size: 32px;
            font-weight: bold;
            margin-bottom: 4px;
        }
        .subtitle {
            color: #666;
            font-size: 14px;
            margin-bottom: 24px;
        }
        .sec-title {
            font-size: 13px;
            text-transform: uppercase;
            letter-spacing: 2px;
            color: #b03030;
            margin: 24px 0 8px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 24px;
        }
        th {
            text-align: left;
            font-weight: bold;
            border-bottom: 2px solid #333;
            padding: 8px 12px;
            font-size: 13px;
        }
        td {
            border-bottom: 1px solid #ddd;
            padding: 8px 12px;
        }
        td:first-child {
            font-family: "Courier New", Courier, monospace;
            color: #999;
            font-size: 13px;
            width: 80px;
        }
        a {
            color: #b03030;
            text-decoration: none;
        }
        a:hover {
            text-decoration: underline;
        }
        .note {
            font-size: 13px;
            color: #666;
            margin-bottom: 20px;
        }
        code {
            background: #e8e8e4;
            padding: 2px 5px;
            border-radius: 2px;
            font-size: 13px;
        }
        footer {
            border-top: 1px solid #ddd;
            padding-top: 12px;
            font-size: 13px;
            color: #999;
        }
    </style>
</head>
<body>
    <div class="container">
        <pre class="ascii">${BANNER}</pre>
        <h1>asgfr</h1>
        <div class="subtitle">a simple ruby guide</div>
        <h2 class="sec-title">core</h2>
        <table>
            <thead><tr><th>#</th><th>Chapter</th></tr></thead>
            <tbody>
                ${baseRows}
            </tbody>
        </table>
        ${advSection}
        <div class="note">
            read it from the terminal: <code>curl asgfr.vercel.app/ch1</code>
        </div>
        <footer>
            Made by Kevin Dan Mathew
        </footer>
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
