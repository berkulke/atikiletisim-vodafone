export function sanitizeRichHtml(html: string): string {
  if (!html) return "";

  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, "")
    .replace(/<embed\b[^>]*>/gi, "")
    .replace(/\son[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/(href|src)\s*=\s*(?:"\s*(?:javascript|data|vbscript):[^"]*"|'\s*(?:javascript|data|vbscript):[^']*')/gi, '$1="#"');
}

export function isSafeHttpUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export function containsDangerousSvgContent(svgText: string): boolean {
  const lower = svgText.toLowerCase();
  return (
    lower.includes("<script") ||
    /\son[a-z]+\s*=/.test(lower) ||
    lower.includes("javascript:") ||
    lower.includes("<foreignobject")
  );
}
