#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const GUIDE = path.join(__dirname, "guide");

const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";
const DIM = "\x1b[2m";
const RED = "\x1b[31m";
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const BLUE = "\x1b[34m";
const MAGENTA = "\x1b[35m";
const CYAN = "\x1b[36m";

function write(msg, code) {
  process.stdout.write(code + msg + RESET + "\n");
}

const ansiRe = /\x1b\[[0-9;]*m/g;

function bannerLine(line) {
  return /^[\\/'_^`()\[\]L.,|*+\- ]+$/.test(line);
}

function colourLine(line) {
  if (!line.trim()) return "";
  const stripped = line.trimEnd();

  if (/^[-=#]{3,}$/.test(stripped.trim())) return "\x1b[90m" + line + RESET;

  if (bannerLine(stripped.trim())) {
    return RED + line + RESET;
  }

  if (stripped.startsWith("CONGRATULATIONS") || /^CHAPTER \d+/.test(stripped)) {
    return BOLD + RED + line + RESET;
  }

  if (/^\d+\.\d+\s+\S/.test(stripped.trim())) {
    return BOLD + YELLOW + line + RESET;
  }

  if (/^[A-Z][A-Z0-9 &()'/-]{2,}:?$/.test(stripped.trim()) && stripped.trim().length <= 60) {
    return BOLD + CYAN + line + RESET;
  }

  if (/^(Move|Moving) on/.test(stripped.trim()) || stripped.trim().startsWith("Run curl")) {
    return MAGENTA + line + RESET;
  }

  if (line.startsWith("    ") || line.startsWith("\t")) {
    const codeContent = line.replace(/^(\s+)/, "");
    if (codeContent.trim().startsWith("#")) {
      return DIM + GREEN + line + RESET;
    }
    return GREEN + line + RESET;
  }

  return line;
}

function processFile(fname) {
  const src = path.join(GUIDE, fname);
  if (!fs.existsSync(src)) return;
  const text = fs.readFileSync(src, "utf8");
  const out = text
    .replace(ansiRe, "")
    .split("\n")
    .map(colourLine)
    .join("\n");
  fs.writeFileSync(src, out);
  write(fname + " coloured", GREEN);
}

["intro.txt", "ch0_install.txt", "ch1_hello.txt", "ch2_types.txt", "ch3_strings.txt",
 "ch4_arrays.txt", "ch5_flow.txt", "ch6_loops.txt", "ch7_methods.txt", "ch8_classes.txt",
 "ch9_blocks.txt", "ch10_files.txt", "ch11_gems.txt", "ch12_examples.txt",
 "ch13_web.txt", "ch14_games.txt", "ch15_gems_build.txt", "ch16_rails.txt",
 "ch17_adv_examples.txt", "ch18_errors.txt", "ch19_regex.txt",
 "ch20_enumerable.txt", "ch21_dates.txt", "ch22_threads.txt",
 "ch23_testing.txt", "ch24_career.txt"].forEach(processFile);

write("All chapters coloured.", CYAN);
