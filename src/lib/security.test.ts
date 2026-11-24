import { describe, expect, it, beforeEach } from "vitest";
import {
  containsDangerousSvgContent,
  isSafeHttpUrl,
  sanitizeRichHtml,
} from "./security";
import { checkRateLimit, resetMemoryRateLimiterForTests } from "./rate-limit";

describe("security hardening", () => {
  beforeEach(() => {
    resetMemoryRateLimiterForTests();
  });

  it("strips script, iframe, inline event handlers and javascript: URLs", () => {
    const dirty =
      '<h2>Başlık</h2><script>alert(1)</script><p onclick="steal()">Metin</p><a href="javascript:alert(2)">Tıkla</a><iframe src="https://evil.test"></iframe>';
    const clean = sanitizeRichHtml(dirty);

    expect(clean).toContain("<h2>Başlık</h2>");
    expect(clean).not.toContain("<script");
    expect(clean).not.toContain("<iframe");
    expect(clean).not.toContain("onclick");
    expect(clean).not.toContain("javascript:");
  });

  it("detects dangerous SVG payloads", () => {
    expect(containsDangerousSvgContent('<svg onload="alert(1)"></svg>')).toBe(true);
    expect(containsDangerousSvgContent("<svg><script>x()</script></svg>")).toBe(true);
    expect(containsDangerousSvgContent('<svg viewBox="0 0 10 10"><circle r="4"/></svg>')).toBe(
      false
    );
  });

  it("validates http/https URLs safely", () => {
    expect(isSafeHttpUrl("https://atikiletisim.com")).toBe(true);
    expect(isSafeHttpUrl("http://localhost:9002/bucket/img.png")).toBe(true);
    expect(isSafeHttpUrl("javascript:alert(1)")).toBe(false);
    expect(isSafeHttpUrl("data:text/html,<script>")).toBe(false);
  });

  it("enforces rate limits when threshold is exceeded", async () => {
    const key = "test-login-1.2.3.4";
    expect((await checkRateLimit(key, 2, 60)).allowed).toBe(true);
    expect((await checkRateLimit(key, 2, 60)).allowed).toBe(true);
    const third = await checkRateLimit(key, 2, 60);
    expect(third.allowed).toBe(false);
    expect(third.remaining).toBe(0);
  });
});
