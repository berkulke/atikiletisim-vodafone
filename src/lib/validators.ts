import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Geçerli bir e-posta adresi giriniz"),
  password: z.string().min(6, "Şifre en az 6 karakter olmalıdır"),
});

export const campaignInputSchema = z.object({
  title: z.string().min(3, "Başlık en az 3 karakter olmalıdır").max(180),
  summary: z.string().min(5, "Özet en az 5 karakter olmalıdır").max(400),
  description: z.string().min(10, "Açıklama en az 10 karakter olmalıdır"),
  imageUrl: z.string().url("Geçerli bir görsel URL'si giriniz"),
  targetUrl: z.string().url("Geçerli bir hedef URL giriniz").optional().or(z.literal("")),
  categorySlug: z.string().min(2).max(80).default("faturali-kampanyalar"),
  categoryName: z.string().min(2).max(100).default("Faturalı Kampanyalar"),
  badgeLabel: z.string().max(40).optional().nullable(),
  badgeColor: z.enum(["red", "green", "orange", "blue"]).optional().nullable(),
  tags: z.array(z.string().min(1).max(50)).default([]),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
  startsAt: z.string().datetime().optional().nullable(),
  endsAt: z.string().datetime().optional().nullable(),
});

export const productInputSchema = z.object({
  title: z.string().min(3).max(160),
  subtitle: z.string().max(200).optional().nullable(),
  description: z.string().min(10),
  category: z.enum(["DEVICE", "TARIFF", "HOME_INTERNET", "ACCESSORY"]),
  brand: z.string().min(2).max(80),
  price: z.number().positive("Fiyat sıfırdan büyük olmalıdır"),
  installmentPrice: z.number().positive().optional().nullable(),
  installmentMonths: z.number().int().positive().max(36).optional().nullable(),
  specs: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).default({}),
  imageUrl: z.string().url("Geçerli bir görsel URL'si giriniz"),
  stock: z.number().int().min(0).default(100),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

export const orderItemInputSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().min(1).max(10),
  purchaseMode: z.enum(["CASH", "INSTALLMENT"]).default("CASH"),
});

export const createOrderSchema = z.object({
  customerName: z.string().min(3, "Ad soyad en az 3 karakter olmalıdır").max(120),
  customerPhone: z
    .string()
    .regex(/^(\+90|0)?5\d{9}$/, "Geçerli bir Türkiye GSM numarası giriniz (5XX XXX XX XX)"),
  customerEmail: z.string().email("Geçerli bir e-posta adresi giriniz"),
  tcIdentityLast4: z
    .string()
    .regex(/^\d{4}$/, "TC Kimlik son 4 hanesi 4 rakam olmalıdır")
    .optional()
    .or(z.literal("")),
  city: z.string().min(2, "İl seçimi zorunludur").max(60),
  district: z.string().min(2, "İlçe zorunludur").max(60),
  addressLine: z.string().min(10, "Açık adres en az 10 karakter olmalıdır").max(400),
  paymentMethod: z.enum(["CREDIT_CARD", "ON_DELIVERY", "ADD_TO_BILL"]).default("ADD_TO_BILL"),
  notes: z.string().max(400).optional(),
  items: z.array(orderItemInputSchema).min(1, "Sepetinizde en az bir ürün olmalıdır"),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "SHIPPED", "COMPLETED", "CANCELLED"]),
});

export const siteSettingsSchema = z.object({
  brandName: z.string().min(2).max(120),
  tagline: z.string().min(2).max(200),
  siteUrl: z.string().url("Geçerli bir site adresi giriniz (https://...)"),
  logoUrl: z.string().url("Geçerli bir logo URL'si giriniz").optional().or(z.literal("")),
  faviconUrl: z.string().url("Geçerli bir favicon URL'si giriniz").optional().or(z.literal("")),
  phone: z.string().min(5).max(40),
  whatsappPhone: z.string().regex(/^\d{10,15}$/, "WhatsApp numarası sadece rakamlardan oluşmalıdır (örn: 905421234567)"),
  whatsappMessage: z.string().min(2).max(300),
  email: z.string().email("Geçerli bir e-posta giriniz"),
  instagramUrl: z.string().url("Geçerli bir Instagram URL'si giriniz").optional().or(z.literal("")),
  address: z.string().min(3).max(300),
  city: z.string().min(2).max(80),
  district: z.string().min(2).max(80),
  geoRegion: z.string().min(2).max(20),
  geoLatitude: z.string().min(2).max(30),
  geoLongitude: z.string().min(2).max(30),
  workingHours: z.string().min(2).max(160),
  seoTitle: z.string().min(5).max(160),
  seoDescription: z.string().min(10).max(320),
  seoKeywords: z.string().max(400),
  ogImageUrl: z.string().url("Geçerli bir OG görsel URL'si giriniz").optional().or(z.literal("")),
  cookiebotId: z.string().max(80).optional().or(z.literal("")),
});

export const customPageSchema = z.object({
  title: z.string().min(2, "Sayfa başlığı en az 2 karakter olmalıdır").max(160),
  slug: z.string().min(2).max(120).optional(),
  summary: z.string().max(300).optional().nullable(),
  content: z.string().min(10, "Sayfa içeriği en az 10 karakter olmalıdır"),
  metaTitle: z.string().max(160).optional().nullable(),
  metaDescription: z.string().max(320).optional().nullable(),
  showInHeader: z.boolean().default(false),
  showInFooter: z.boolean().default(true),
  isPublished: z.boolean().default(true),
});

export const contactMessageSchema = z.object({
  name: z.string().min(2, "Ad soyad zorunludur").max(120),
  phone: z.string().min(7, "Geçerli bir telefon numarası giriniz").max(30),
  email: z.string().email("Geçerli bir e-posta giriniz").optional().or(z.literal("")),
  subject: z.string().min(2, "Konu zorunludur").max(160),
  message: z.string().min(5, "Mesajınız en az 5 karakter olmalıdır").max(2000),
});

export const branchInputSchema = z.object({
  name: z.string().min(2, "Şube adı en az 2 karakter olmalıdır").max(120),
  city: z.string().min(2).max(60).default("Gaziantep"),
  district: z.string().max(60).default("Şahinbey"),
  address: z.string().max(300).default(""),
  phone: z.string().max(40).default(""),
  whatsappPhone: z.string().max(20).default(""),
  workingHours: z.string().max(120).default("09:00 - 20:00"),
  mapUrl: z.string().url("Geçerli bir harita URL'si giriniz").optional().or(z.literal("")),
  sortOrder: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

export const blogPostSchema = z.object({
  title: z.string().min(3, "Başlık en az 3 karakter olmalıdır").max(180),
  slug: z.string().max(140).optional(),
  excerpt: z.string().min(10, "Özet en az 10 karakter olmalıdır").max(400),
  content: z.string().min(10, "İçerik en az 10 karakter olmalıdır"),
  coverImageUrl: z.string().url("Geçerli bir kapak görseli yükleyin").optional().or(z.literal("")),
  category: z.string().min(2).max(80).default("Teknoloji & Telekom"),
  author: z.string().min(2).max(80).default("Atik İletişim Editör"),
  metaTitle: z.string().max(160).optional().nullable(),
  metaDescription: z.string().max(320).optional().nullable(),
  isPublished: z.boolean().default(true),
});

export const faqItemSchema = z.object({
  question: z.string().min(5, "Soru en az 5 karakter olmalıdır").max(300),
  answer: z.string().min(5, "Cevap en az 5 karakter olmalıdır").max(3000),
  category: z.string().min(2).max(80).default("Genel"),
  sortOrder: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

