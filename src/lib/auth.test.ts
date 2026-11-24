import { describe, expect, it } from "vitest";
import { signAdminToken, verifyAdminToken } from "./auth";

describe("auth JWT", () => {
  it("signs and verifies a valid admin token", async () => {
    const token = await signAdminToken({
      sub: "admin-1",
      email: "admin@vodafone-clone.local",
      name: "Admin",
      role: "ADMIN",
    });

    const verified = await verifyAdminToken(token);
    expect(verified).toMatchObject({
      sub: "admin-1",
      email: "admin@vodafone-clone.local",
      role: "ADMIN",
    });
  });

  it("rejects tampered or invalid tokens", async () => {
    expect(await verifyAdminToken("invalid.token.value")).toBeNull();
  });
});
