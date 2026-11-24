import { describe, expect, it } from "vitest";
import { formatTry, slugifyTr } from "./slug";

describe("slugifyTr & formatTry", () => {
  it("converts Turkish characters to clean URL slugs", () => {
    expect(slugifyTr("Şahinbey Şubesi İletişim & Fırsatlar")).toBe(
      "sahinbey-subesi-iletisim-firsatlar"
    );
    expect(slugifyTr("Ücretsiz Çark Kampanyası")).toBe(
      "ucretsiz-cark-kampanyasi"
    );
  });

  it("formats Turkish Lira amounts cleanly", () => {
    expect(formatTry(89999)).toBe("89.999 TL");
    expect(formatTry("599")).toBe("599 TL");
    expect(formatTry("invalid")).toBe("0 TL");
  });
});
