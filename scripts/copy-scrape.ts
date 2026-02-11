#!/usr/bin/env ts-node
/**
 * Copy Audit Script for Next.js Project
 *
 * Extracts all published text content from app/ and components/ directories
 * and generates an auditable inventory in Markdown format.
 */

import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

// Get __dirname equivalent for ESM/TypeScript
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface TextEntry {
  text: string;
  characters: number;
  words: number;
  format: string;
  file: string;
  path: string;
}

interface FileStats {
  file: string;
  path: string;
  count: number;
}

// Allowed HTML tags for text extraction
const ALLOWED_TAGS = new Set([
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "p",
  "span",
  "li",
  "button",
  "label",
  "a",
  "small",
  "strong",
  "em",
  "th",
  "td",
  "caption",
  "div",
  "section",
  "article",
  "header",
  "footer",
  "nav",
  "aside",
  "main",
  "figure",
  "figcaption",
  "blockquote",
  "cite",
  "code",
  "pre",
  "time",
  "mark",
  "abbr",
]);

// Allowed attributes for text extraction
const ALLOWED_ATTRIBUTES = new Set([
  "alt",
  "title",
  "aria-label",
  "placeholder",
]);

// Format mapping
const FORMAT_MAP: Record<string, string> = {
  h1: "H1",
  h2: "H2",
  h3: "H3",
  h4: "H4",
  h5: "H5",
  h6: "H6",
  p: "P",
  span: "SPAN",
  li: "LI",
  button: "BTN",
  label: "LABEL",
  a: "A",
  small: "SMALL",
  strong: "STRONG",
  em: "EM",
  th: "TH",
  td: "TD",
  caption: "CAPTION",
  div: "DIV",
  section: "SECTION",
  article: "ARTICLE",
  header: "HEADER",
  footer: "FOOTER",
  nav: "NAV",
  aside: "ASIDE",
  main: "MAIN",
  figure: "FIGURE",
  figcaption: "FIGCAPTION",
  blockquote: "BLOCKQUOTE",
  cite: "CITE",
  code: "CODE",
  pre: "PRE",
  time: "TIME",
  mark: "MARK",
  abbr: "ABBR",
};

// Attribute format mapping
const ATTR_FORMAT_MAP: Record<string, string> = {
  alt: "ALT",
  title: "TITLE",
  "aria-label": "ARIA",
  placeholder: "PLACEHOLDER",
};

/**
 * Normalize text: trim and collapse multiple spaces
 */
function normalizeText(text: string): string {
  return text.trim().replace(/\s+/g, " ");
}

/**
 * Calculate word count
 */
function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

/**
 * Determine the group based on file path
 */
function getGroup(
  filePath: string,
): "marketing" | "demo" | "dashboard" | "common" {
  const normalizedPath = filePath.replace(/\\/g, "/");

  // Check for marketing pages
  if (
    normalizedPath.includes("app/page.tsx") ||
    normalizedPath.includes("app/welcome/") ||
    normalizedPath.includes("app/(marketing)/") ||
    normalizedPath.includes("/landing/")
  ) {
    return "marketing";
  }

  // Check for demo pages
  if (normalizedPath.includes("app/demo/")) {
    return "demo";
  }

  // Check for dashboard pages
  if (
    normalizedPath.includes("app/dashboard/") ||
    normalizedPath.includes("/dashboard")
  ) {
    return "dashboard";
  }

  // Everything else is common (components)
  return "common";
}

/**
 * Recursively get all TSX/TS files from a directory
 */
function getFiles(dir: string, baseDir: string): string[] {
  const files: string[] = [];

  if (!fs.existsSync(dir)) {
    return files;
  }

  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const relativePath = path.relative(baseDir, fullPath);
    const stat = fs.statSync(fullPath);

    // Skip excluded directories
    if (stat.isDirectory()) {
      const excludeDirs = [
        ".next",
        "node_modules",
        "dist",
        "build",
        "coverage",
        "public",
        "_archive",
      ];
      if (!excludeDirs.includes(item) && !item.startsWith(".")) {
        files.push(...getFiles(fullPath, baseDir));
      }
    } else if (
      (item.endsWith(".tsx") || item.endsWith(".ts")) &&
      !item.endsWith(".d.ts") &&
      !item.includes(".test.") &&
      !item.includes(".spec.")
    ) {
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * Extract text content from a file using regex-based parsing (faster than Babel for simple extraction)
 */
function extractTextFromFile(filePath: string, repoRoot: string): TextEntry[] {
  const entries: TextEntry[] = [];
  const content = fs.readFileSync(filePath, "utf-8");
  const basename = path.basename(filePath);
  const relativePath = path.relative(repoRoot, filePath);

  try {
    // Extract from JSX tags
    // Match opening tags with their content: <tag>content</tag>
    const tagRegex = new RegExp(
      `<(${Array.from(ALLOWED_TAGS).join("|")})(?:\\s[^>]*)?>([^<]*(?:<(?!\\/${Array.from(ALLOWED_TAGS).join("|")}>)[^<]*)*)<\\/\\1>`,
      "gi",
    );

    let match;
    while ((match = tagRegex.exec(content)) !== null) {
      const tagName = match[1].toLowerCase();
      const innerContent = match[2];

      // Extract text from the content, skipping nested JSX
      const text = normalizeText(innerContent.replace(/<[^>]+>/g, "").trim());

      if (text && text.length > 1) {
        const nonContentPatterns = [
          /^\{\{.*\}\}$/,
          /^\{.*\}$/,
          /^\s*$/,
          /^(true|false|null|undefined)$/i,
          /^(className|style|onClick|onChange|onSubmit)$/i,
        ];

        const isNonContent = nonContentPatterns.some((pattern) =>
          pattern.test(text),
        );

        if (!isNonContent) {
          entries.push({
            text,
            characters: text.length,
            words: countWords(text),
            format: FORMAT_MAP[tagName] || tagName.toUpperCase(),
            file: basename,
            path: relativePath,
          });
        }
      }
    }

    // Extract from JSX attributes
    for (const attr of ALLOWED_ATTRIBUTES) {
      // Match attribute="value" or attribute='value'
      const attrRegex = new RegExp(`${attr}=["']([^"']+)["']`, "gi");

      while ((match = attrRegex.exec(content)) !== null) {
        const text = normalizeText(match[1]);

        if (text && text.length > 0) {
          entries.push({
            text,
            characters: text.length,
            words: countWords(text),
            format: ATTR_FORMAT_MAP[attr] || attr.toUpperCase(),
            file: basename,
            path: relativePath,
          });
        }
      }
    }
  } catch (error) {
    console.warn(
      `Warning: Could not parse ${relativePath}:`,
      (error as Error).message,
    );
  }

  return entries;
}

/**
 * Generate Markdown report
 */
function generateMarkdown(
  allEntries: TextEntry[],
  fileStats: FileStats[],
  timestamp: string,
): string {
  // Calculate metrics
  const totalEntries = allEntries.length;
  const formatCounts: Record<string, number> = {};

  allEntries.forEach((entry) => {
    formatCounts[entry.format] = (formatCounts[entry.format] || 0) + 1;
  });

  // Group entries
  const groups: Record<string, TextEntry[]> = {
    marketing: [],
    demo: [],
    dashboard: [],
    common: [],
  };

  allEntries.forEach((entry) => {
    const group = getGroup(entry.path);
    groups[group].push(entry);
  });

  // Build markdown
  let md = `# Copy Audit Report\n\n`;
  md += `**Generated:** ${timestamp} UTC\n\n`;

  // Summary
  md += `## Summary\n\n`;
  md += `- **Total Entries:** ${totalEntries}\n`;
  md += `- **Total Characters:** ${allEntries.reduce((sum, e) => sum + e.characters, 0)}\n`;
  md += `- **Total Words:** ${allEntries.reduce((sum, e) => sum + e.words, 0)}\n`;
  md += `- **Files Analyzed:** ${fileStats.length}\n\n`;

  md += `### Breakdown by Format\n\n`;
  md += `| Formato | Cantidad |\n`;
  md += `|---------|----------|\n`;
  Object.entries(formatCounts)
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([format, count]) => {
      md += `| ${format} | ${count} |\n`;
    });
  md += `\n`;

  // Sections by group
  const groupOrder: Array<"marketing" | "demo" | "dashboard" | "common"> = [
    "marketing",
    "demo",
    "dashboard",
    "common",
  ];

  for (const group of groupOrder) {
    const entries = groups[group];
    if (entries.length === 0) continue;

    md += `## ${group.charAt(0).toUpperCase() + group.slice(1)}\n\n`;

    // Group by file
    const byFile: Record<string, TextEntry[]> = {};
    entries.forEach((entry) => {
      if (!byFile[entry.path]) {
        byFile[entry.path] = [];
      }
      byFile[entry.path].push(entry);
    });

    for (const [filePath, fileEntries] of Object.entries(byFile)) {
      md += `### ${path.basename(filePath)}\n\n`;
      md += `**Path:** \`${filePath}\`\n\n`;

      md += `| Texto | Caracteres | Palabras | Formato | Archivo | Ruta |\n`;
      md += `|-------|------------|----------|---------|---------|------|\n`;

      fileEntries.forEach((entry) => {
        // Escape pipe characters and newlines in text
        const safeText = entry.text
          .replace(/\|/g, "\\|")
          .replace(/\n/g, " ")
          .replace(/\r/g, "");
        // Truncate very long text
        const displayText =
          safeText.length > 80 ? safeText.substring(0, 77) + "..." : safeText;

        md += `| ${displayText} | ${entry.characters} | ${entry.words} | ${entry.format} | ${entry.file} | ${entry.path} |\n`;
      });

      md += `\n`;
    }
  }

  // Analyzed Files List
  md += `## Analyzed Files List\n\n`;
  md += `| Archivo | Ruta | Entradas |\n`;
  md += `|---------|------|----------|\n`;

  fileStats
    .sort((a, b) => a.path.localeCompare(b.path))
    .forEach((stat) => {
      md += `| ${stat.file} | ${stat.path} | ${stat.count} |\n`;
    });

  md += `\n---\n\n`;
  md += `*Report generated by Copy Audit Script*\n`;

  return md;
}

/**
 * Main execution
 */
function main() {
  const repoRoot = path.resolve(__dirname, "..");
  const appDir = path.join(repoRoot, "app");
  const componentsDir = path.join(repoRoot, "components");

  console.log("🔍 Starting copy audit...\n");

  // Collect all files
  const files: string[] = [];

  if (fs.existsSync(appDir)) {
    console.log("📁 Scanning app/ directory...");
    files.push(...getFiles(appDir, repoRoot));
  }

  if (fs.existsSync(componentsDir)) {
    console.log("📁 Scanning components/ directory...");
    files.push(...getFiles(componentsDir, repoRoot));
  }

  console.log(`\n📄 Found ${files.length} files to analyze\n`);

  // Extract text from all files
  const allEntries: TextEntry[] = [];
  const fileStats: FileStats[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const entries = extractTextFromFile(file, repoRoot);
    if (entries.length > 0) {
      allEntries.push(...entries);
      fileStats.push({
        file: path.basename(file),
        path: path.relative(repoRoot, file),
        count: entries.length,
      });
    }

    // Progress indicator every 10 files
    if ((i + 1) % 10 === 0 || i === files.length - 1) {
      process.stdout.write(
        `\r   Progress: ${i + 1}/${files.length} files processed`,
      );
    }
  }

  console.log("\n");
  console.log(
    `✅ Extracted ${allEntries.length} text entries from ${fileStats.length} files\n`,
  );

  // Generate timestamp
  const timestamp = new Date().toISOString().replace("T", " ").slice(0, 19);

  // Generate markdown
  const markdown = generateMarkdown(allEntries, fileStats, timestamp);

  // Ensure docs directory exists
  const docsDir = path.join(repoRoot, "docs");
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }

  // Write markdown file
  const outputPath = path.join(docsDir, "copy-audit.md");
  fs.writeFileSync(outputPath, markdown, "utf-8");

  console.log(`📝 Report written to: ${outputPath}\n`);

  // Print summary
  const formatCounts: Record<string, number> = {};
  allEntries.forEach((entry) => {
    formatCounts[entry.format] = (formatCounts[entry.format] || 0) + 1;
  });

  console.log("📊 Summary:");
  console.log(`   Total entries: ${allEntries.length}`);
  console.log(
    `   Total characters: ${allEntries.reduce((sum, e) => sum + e.characters, 0)}`,
  );
  console.log(
    `   Total words: ${allEntries.reduce((sum, e) => sum + e.words, 0)}`,
  );
  console.log(`   Files analyzed: ${fileStats.length}`);
  console.log("\n   By format:");
  Object.entries(formatCounts)
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([format, count]) => {
      console.log(`     ${format}: ${count}`);
    });

  console.log("\n✨ Copy audit complete!");
}

main();
