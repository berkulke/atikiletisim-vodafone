export function slugifyTr(input: string): string {
  const charMap: Record<string, string> = {
    ç: "c",
    ğ: "g",
    ı: "i",
    ö: "o",
    ş: "s",
    ü: "u",
    Ç: "c",
    Ğ: "g",
    İ: "i",
    Ö: "o",
    Ş: "s",
    Ü: "u",
  };

  return input
    .split("")
    .map((ch) => charMap[ch] ?? ch)
    .join("")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function formatTry(amount: number | string): string {
  const numeric = typeof amount === "string" ? Number(amount) : amount;
  if (!Number.isFinite(numeric)) {
    return "0 TL";
  }
  return new Intl.NumberFormat("tr-TR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(numeric) + " TL";
}
