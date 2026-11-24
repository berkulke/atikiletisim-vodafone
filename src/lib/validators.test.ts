import { describe, expect, it } from "vitest";
import { campaignInputSchema, createOrderSchema } from "./validators";

describe("validators", () => {
  it("validates Turkish GSM phone and checkout payload", () => {
    const ok = createOrderSchema.safeParse({
      customerName: "Ahmet Yılmaz",
      customerPhone: "05421234567",
      customerEmail: "ahmet@example.com",
      tcIdentityLast4: "1234",
      city: "İstanbul",
      district: "Kadıköy",
      addressLine: "Bağdat Caddesi No: 120 Daire: 4",
      paymentMethod: "ADD_TO_BILL",
      items: [{ productId: "prod_1", quantity: 1, purchaseMode: "INSTALLMENT" }],
    });
    expect(ok.success).toBe(true);

    const badPhone = createOrderSchema.safeParse({
      customerName: "Ahmet Yılmaz",
      customerPhone: "12345",
      customerEmail: "ahmet@example.com",
      city: "İstanbul",
      district: "Kadıköy",
      addressLine: "Bağdat Caddesi No: 120 Daire: 4",
      items: [{ productId: "prod_1", quantity: 1 }],
    });
    expect(badPhone.success).toBe(false);
  });

  it("validates admin manual campaign payload", () => {
    const res = campaignInputSchema.safeParse({
      title: "Hafta Sonu Ekstra 10 GB",
      summary: "Tüm faturalı hatlara özel hafta sonu hediye internet.",
      description: "Vodafone Yanımda üzerinden aktif edilebilir 10 GB hediye paketi.",
      imageUrl: "https://cms.vodafone.com.tr/static/img/content/26-11/13/_640x427_.jpg",
      categorySlug: "faturali-kampanyalar",
      categoryName: "Faturalı Kampanyalar",
      tags: ["Vodafone’lulara Özel"],
    });
    expect(res.success).toBe(true);
  });
});
