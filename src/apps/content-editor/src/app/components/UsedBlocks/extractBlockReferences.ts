/**
 * extractBlockReferences.ts
 *
 * Parses a Zesty code file (e.g. something.html) and returns all block
 * references found in it, covering every known syntax pattern.
 *
 * Supported patterns:
 *  1. Basic path:                 {{block('/-/block/name.html')}}
 *  2. Path with version:          {{block('/-/block/name.html?version=5')}}
 *  3. Path with variant:          {{block('/-/block/name.html?variant=7-xxx')}}
 *  4. Positional params:          {{block('/-/block/name.html', 'variantZUID')}}
 *                                 {{block('/-/block/name.html', 'variantZUID', '4')}}
 *  5. Full preview URL:           https://instance.preview.zesty.io/-/block/name.html
 *                                 https://instance.preview.zesty.io/-/block/name.html?variant=7-xxx
 */

export interface BlockReference {
  raw: string;
  blockName: string | null;
  variant: string | null;
  version: string | null;
}

/**
 * Parses comma-separated Parsley block() arguments, respecting single and double quotes.
 * e.g. "'/-/block/foo.html', '7-abc123', '2'" => ['/-/block/foo.html', '7-abc123', '2']
 */
function parseArgs(str: string): string[] {
  const args: string[] = [];
  let current = "";
  let inQuote = false;
  let quoteChar = "";

  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    if (!inQuote && (ch === '"' || ch === "'")) {
      inQuote = true;
      quoteChar = ch;
    } else if (inQuote && ch === quoteChar) {
      inQuote = false;
      args.push(current.trim());
      current = "";
    } else if (!inQuote && ch === ",") {
      if (current.trim()) args.push(current.trim());
      current = "";
    } else if (inQuote) {
      current += ch;
    } else if (ch !== " ") {
      current += ch;
    }
  }

  if (current.trim()) args.push(current.trim());
  return args;
}

/**
 * Extracts all block references from a Zesty HTML/ZHTML code file string.
 *
 * @param code - The raw file content to parse
 * @returns Array of BlockReference objects
 */
export function extractBlockReferences(code: string): BlockReference[] {
  const references: BlockReference[] = [];

  // ─── Patterns 1–4: Parsley {{block(...)}} calls ──────────────────────────
  const parsleyRegex = /\{\{\s*block\s*\(([^)]+)\)\s*\}\}/g;
  let match: RegExpExecArray | null;

  while ((match = parsleyRegex.exec(code)) !== null) {
    const raw = match[0];
    const argsStr = match[1].trim();
    const ref: BlockReference = {
      raw,
      blockName: null,
      variant: null,
      version: null,
    };

    // Skip block selector field patterns:
    // {{block(this.selector)}} and {{block({this.some_field})}}
    if (argsStr.startsWith("this.") || argsStr.startsWith("{this.")) continue;

    const args = parseArgs(argsStr);
    const fullPath = args[0] ?? "";

    // Full URL passed as argument —
    // {{block('https://instance/-/block/name.html')}} or {{block(https://...)}}
    if (fullPath.startsWith("http://") || fullPath.startsWith("https://")) {
      const url = new URL(fullPath);
      ref.blockName = url.pathname.split("/").pop() ?? null;
      ref.variant = url.searchParams.get("variant");
      ref.version = url.searchParams.get("version");
    } else {
      const [filePath, queryString] = fullPath.split("?");
      ref.blockName = filePath.split("/").pop() ?? null;

      if (args.length >= 2) {
        // Positional params — variant is 2nd argument, version is 3rd
        ref.variant = args[1];
        if (args.length >= 3) ref.version = args[2];
      } else if (queryString) {
        const params = new URLSearchParams(queryString);
        ref.variant = params.get("variant");
        ref.version = params.get("version");
      }
    }

    references.push(ref);
  }

  // ─── Pattern 5: Standalone full preview URLs (not already inside a block() call) ───
  // Strip all {{block(...)}} calls first to avoid double-matching URLs inside them
  const codeWithoutBlockCalls = code.replace(
    /\{\{\s*block\s*\([^)]+\)\s*\}\}/g,
    ""
  );
  const urlRegex =
    /https?:\/\/[^\s"']+\/-\/block\/([\w-]+\.html)(\?[^\s"'{}]*)?/g;

  while ((match = urlRegex.exec(codeWithoutBlockCalls)) !== null) {
    const raw = match[0];
    const blockFile = match[1];
    const queryString = match[2] ?? "";
    const ref: BlockReference = {
      raw,
      blockName: blockFile,
      variant: null,
      version: null,
    };

    if (queryString) {
      const params = new URLSearchParams(queryString.slice(1));
      ref.variant = params.get("variant");
      ref.version = params.get("version");
    }

    references.push(ref);
  }

  return references;
}
