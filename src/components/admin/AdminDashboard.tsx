"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  LayoutDashboard,
  RefreshCw,
  Plus,
  Trash2,
  LogOut,
  ShieldCheck,
  Gift,
  ShoppingBag,
  Package,
  Pencil,
  FileText,
  Settings,
  Mail,
  X,
  Globe,
  ExternalLink,
  Search,
  Menu,
  TrendingUp,
  PanelLeftClose,
  PanelLeftOpen,
  Palette,
  MapPin,
  BookOpen,
  HelpCircle,
  Activity,
} from "lucide-react";
import { formatTry } from "@/lib/slug";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import {
  AdminDialog,
  Pagination,
  ToastStack,
  ToggleSwitch,
  Tooltip,
  type ToastItem,
} from "@/components/admin/AdminDialog";
import type { CampaignDto } from "@/components/campaigns/CampaignCard";
import type { ProductDto } from "@/components/products/ProductCard";
import type { SiteSettingsDto } from "@/lib/settings";

interface AdminUser {
  email: string;
  name: string;
}

interface SyncLogDto {
  id: string;
  status: string;
  fetchedCount: number;
  createdCount: number;
  updatedCount: number;
  errorMessage: string | null;
  startedAt: string;
}

interface AdminOrderDto {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  city: string;
  district: string;
  totalAmount: string | number;
  status: "PENDING" | "CONFIRMED" | "SHIPPED" | "COMPLETED" | "CANCELLED";
  paymentMethod: string;
  createdAt: string;
  items: Array<{ id: string; title: string; quantity: number }>;
}

interface CustomPageDto {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  content: string;
  metaTitle: string | null;
  metaDescription: string | null;
  showInHeader: boolean;
  showInFooter: boolean;
  isPublished: boolean;
}

interface ContactMessageDto {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  subject: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

interface BranchDto {
  id: string;
  name: string;
  city: string;
  district: string;
  address: string;
  phone: string;
  whatsappPhone: string;
  workingHours: string;
  mapUrl: string;
  sortOrder: number;
  isActive: boolean;
}

interface BlogPostDto {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImageUrl: string;
  category: string;
  author: string;
  metaTitle: string | null;
  metaDescription: string | null;
  isPublished: boolean;
  publishedAt: string;
}

interface FaqItemDto {
  id: string;
  question: string;
  answer: string;
  category: string;
  sortOrder: number;
  isActive: boolean;
}

interface VisitorLogDto {
  id: string;
  ipAddress: string;
  country: string;
  city: string;
  region: string;
  isp: string;
  path: string;
  referrer: string;
  deviceType: string;
  createdAt: string;
}

interface VisitorStatsDto {
  totalVisits: number;
  uniqueIps: number;
  topCity: string;
  topReferrer: string;
}

const CAMPAIGN_CATEGORIES = [
  { slug: "faturali-kampanyalar", name: "Faturalı Kampanyalar" },
  { slug: "red-marka-ayricaliklari", name: "Red Marka Ayrıcalıkları" },
  { slug: "freezone-guzellikleri", name: "FreeZone Güzellikleri" },
  { slug: "kupon-kodu-kampanyalari", name: "Kupon Kodu Kampanyaları" },
  { slug: "faturasiz-kampanyalar", name: "Faturasız Kampanyalar" },
  { slug: "ev-interneti-kampanyalari", name: "Ev İnterneti Kampanyaları" },
];

type AdminSection =
  | "overview"
  | "campaigns"
  | "products"
  | "orders"
  | "branches"
  | "blog"
  | "faq"
  | "pages"
  | "visitors"
  | "brand"
  | "seo"
  | "messages";

interface CampaignFormState {
  id?: string;
  title: string;
  summary: string;
  description: string;
  imageUrl: string;
  targetUrl: string;
  categorySlug: string;
  badgeLabel: string;
  tagsText: string;
  isFeatured: boolean;
  isActive: boolean;
}

interface ProductFormState {
  id?: string;
  title: string;
  subtitle: string;
  description: string;
  category: ProductDto["category"];
  brand: string;
  price: string;
  installmentPrice: string;
  installmentMonths: string;
  imageUrl: string;
  stock: string;
  isFeatured: boolean;
  isActive: boolean;
}

interface PageFormState {
  id?: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  metaTitle: string;
  metaDescription: string;
  showInHeader: boolean;
  showInFooter: boolean;
  isPublished: boolean;
}

interface BranchFormState {
  id?: string;
  name: string;
  city: string;
  district: string;
  address: string;
  phone: string;
  whatsappPhone: string;
  workingHours: string;
  mapUrl: string;
  sortOrder: string;
  isActive: boolean;
}

const EMPTY_BRANCH_FORM: BranchFormState = {
  name: "",
  city: "Gaziantep",
  district: "Şahinbey",
  address: "",
  phone: "",
  whatsappPhone: "",
  workingHours: "09:00 - 20:00",
  mapUrl: "",
  sortOrder: "0",
  isActive: true,
};

interface BlogFormState {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImageUrl: string;
  category: string;
  author: string;
  metaTitle: string;
  metaDescription: string;
  isPublished: boolean;
}

const EMPTY_BLOG_FORM: BlogFormState = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  coverImageUrl: "",
  category: "Teknoloji & Telekom",
  author: "Atik İletişim",
  metaTitle: "",
  metaDescription: "",
  isPublished: true,
};

interface FaqFormState {
  id?: string;
  question: string;
  answer: string;
  category: string;
  sortOrder: string;
  isActive: boolean;
}

const EMPTY_FAQ_FORM: FaqFormState = {
  question: "",
  answer: "",
  category: "Genel",
  sortOrder: "0",
  isActive: true,
};

const EMPTY_CAMPAIGN_FORM: CampaignFormState = {
  title: "",
  summary: "",
  description: "",
  imageUrl: "",
  targetUrl: "",
  categorySlug: "faturali-kampanyalar",
  badgeLabel: "Özel Fırsat",
  tagsText: "Vodafone’lulara Özel",
  isFeatured: true,
  isActive: true,
};

const EMPTY_PRODUCT_FORM: ProductFormState = {
  title: "",
  subtitle: "",
  description: "",
  category: "DEVICE",
  brand: "",
  price: "",
  installmentPrice: "",
  installmentMonths: "12",
  imageUrl: "",
  stock: "50",
  isFeatured: true,
  isActive: true,
};

const EMPTY_PAGE_FORM: PageFormState = {
  title: "",
  slug: "",
  summary: "",
  content: "",
  metaTitle: "",
  metaDescription: "",
  showInHeader: false,
  showInFooter: true,
  isPublished: true,
};

export function AdminDashboard({ initialUser }: { initialUser: AdminUser | null }) {
  const [user, setUser] = useState<AdminUser | null>(initialUser);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  const [section, setSection] = useState<AdminSection>("overview");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarTheme, setSidebarTheme] = useState<"dark" | "vodafone" | "slate">("dark");

  const [campaigns, setCampaigns] = useState<CampaignDto[]>([]);
  const [syncLogs, setSyncLogs] = useState<SyncLogDto[]>([]);
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [orders, setOrders] = useState<AdminOrderDto[]>([]);
  const [pages, setPages] = useState<CustomPageDto[]>([]);
  const [branches, setBranches] = useState<BranchDto[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPostDto[]>([]);
  const [faqItems, setFaqItems] = useState<FaqItemDto[]>([]);
  const [visitorLogs, setVisitorLogs] = useState<VisitorLogDto[]>([]);
  const [visitorStats, setVisitorStats] = useState<VisitorStatsDto>({
    totalVisits: 0,
    uniqueIps: 0,
    topCity: "-",
    topReferrer: "-",
  });
  const [visitorSearch, setVisitorSearch] = useState("");
  const [visitorPage, setVisitorPage] = useState(1);
  const [messages, setMessages] = useState<ContactMessageDto[]>([]);
  const [settings, setSettings] = useState<SiteSettingsDto | null>(null);

  const [campaignSearch, setCampaignSearch] = useState("");
  const [campaignSourceFilter, setCampaignSourceFilter] = useState<
    "ALL" | "VODAFONE_SYNC" | "ADMIN_MANUAL"
  >("ALL");
  const [productSearch, setProductSearch] = useState("");

  const [syncing, setSyncing] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const [campaignPage, setCampaignPage] = useState(1);
  const [productPage, setProductPage] = useState(1);
  const [orderPage, setOrderPage] = useState(1);
  const [customPageNum, setCustomPageNum] = useState(1);
  const [branchPage, setBranchPage] = useState(1);
  const [blogPage, setBlogPage] = useState(1);
  const [faqPage, setFaqPage] = useState(1);

  const pushToast = useCallback((type: "ok" | "err", msg: string) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setToasts((prev) => [...prev, { id, type, msg }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  // Dialog states
  const [campaignDialogOpen, setCampaignDialogOpen] = useState(false);
  const [campaignForm, setCampaignForm] = useState<CampaignFormState>(EMPTY_CAMPAIGN_FORM);

  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [productForm, setProductForm] = useState<ProductFormState>(EMPTY_PRODUCT_FORM);

  const [pageDialogOpen, setPageDialogOpen] = useState(false);
  const [pageForm, setPageForm] = useState<PageFormState>(EMPTY_PAGE_FORM);

  const [branchDialogOpen, setBranchDialogOpen] = useState(false);
  const [branchForm, setBranchForm] = useState<BranchFormState>(EMPTY_BRANCH_FORM);

  const [blogDialogOpen, setBlogDialogOpen] = useState(false);
  const [blogForm, setBlogForm] = useState<BlogFormState>(EMPTY_BLOG_FORM);

  const [faqDialogOpen, setFaqDialogOpen] = useState(false);
  const [faqForm, setFaqForm] = useState<FaqFormState>(EMPTY_FAQ_FORM);

  const loadAll = useCallback(async () => {
    try {
      const [cRes, lRes, pRes, oRes, pgRes, bRes, blRes, fqRes, vRes, sRes, mRes] =
        await Promise.all([
          fetch("/api/campaigns?includeInactive=true"),
          fetch("/api/campaigns/sync"),
          fetch("/api/products?includeInactive=true"),
          fetch("/api/orders"),
          fetch("/api/pages?all=true"),
          fetch("/api/branches?includeInactive=true"),
          fetch("/api/blog?all=true"),
          fetch("/api/faq?includeInactive=true"),
          fetch("/api/analytics/visit"),
          fetch("/api/settings"),
          fetch("/api/contact"),
        ]);
      if (cRes.ok) setCampaigns(((await cRes.json()) as { campaigns: CampaignDto[] }).campaigns);
      if (lRes.ok) setSyncLogs(((await lRes.json()) as { logs: SyncLogDto[] }).logs);
      if (pRes.ok) setProducts(((await pRes.json()) as { products: ProductDto[] }).products);
      if (oRes.ok) setOrders(((await oRes.json()) as { orders: AdminOrderDto[] }).orders);
      if (pgRes.ok) setPages(((await pgRes.json()) as { pages: CustomPageDto[] }).pages);
      if (bRes.ok) setBranches(((await bRes.json()) as { branches: BranchDto[] }).branches);
      if (blRes.ok) setBlogPosts(((await blRes.json()) as { posts: BlogPostDto[] }).posts);
      if (fqRes.ok) setFaqItems(((await fqRes.json()) as { items: FaqItemDto[] }).items);
      if (vRes.ok) {
        const vData = (await vRes.json()) as {
          logs: VisitorLogDto[];
          stats: VisitorStatsDto;
        };
        setVisitorLogs(vData.logs);
        setVisitorStats(vData.stats);
      }
      if (sRes.ok) setSettings(((await sRes.json()) as { settings: SiteSettingsDto }).settings);
      if (mRes.ok) setMessages(((await mRes.json()) as { messages: ContactMessageDto[] }).messages);
    } catch {
      // ignore load errors
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    const id = window.setTimeout(() => {
      void loadAll();
    }, 0);
    return () => window.clearTimeout(id);
  }, [user, loadAll]);

  const filteredCampaigns = useMemo(() => {
    const q = campaignSearch.trim().toLowerCase();
    return campaigns.filter((c) => {
      if (campaignSourceFilter !== "ALL" && c.source !== campaignSourceFilter) return false;
      if (q && !c.title.toLowerCase().includes(q) && !c.categoryName.toLowerCase().includes(q)) {
        return false;
      }
      return true;
    });
  }, [campaigns, campaignSearch, campaignSourceFilter]);

  const filteredProducts = useMemo(() => {
    const q = productSearch.trim().toLowerCase();
    return products.filter(
      (p) => !q || p.title.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q)
    );
  }, [products, productSearch]);

  const PAGE_SIZE = 10;
  const pagedCampaigns = useMemo(
    () => filteredCampaigns.slice((campaignPage - 1) * PAGE_SIZE, campaignPage * PAGE_SIZE),
    [filteredCampaigns, campaignPage]
  );
  const pagedProducts = useMemo(
    () => filteredProducts.slice((productPage - 1) * PAGE_SIZE, productPage * PAGE_SIZE),
    [filteredProducts, productPage]
  );
  const pagedOrders = useMemo(
    () => orders.slice((orderPage - 1) * PAGE_SIZE, orderPage * PAGE_SIZE),
    [orders, orderPage]
  );
  const pagedPages = useMemo(
    () => pages.slice((customPageNum - 1) * PAGE_SIZE, customPageNum * PAGE_SIZE),
    [pages, customPageNum]
  );
  const pagedBranches = useMemo(
    () => branches.slice((branchPage - 1) * PAGE_SIZE, branchPage * PAGE_SIZE),
    [branches, branchPage]
  );
  const pagedBlogPosts = useMemo(
    () => blogPosts.slice((blogPage - 1) * PAGE_SIZE, blogPage * PAGE_SIZE),
    [blogPosts, blogPage]
  );
  const pagedFaqItems = useMemo(
    () => faqItems.slice((faqPage - 1) * PAGE_SIZE, faqPage * PAGE_SIZE),
    [faqItems, faqPage]
  );

  const filteredVisitors = useMemo(() => {
    const q = visitorSearch.trim().toLowerCase();
    return visitorLogs.filter(
      (v) =>
        !q ||
        v.ipAddress.toLowerCase().includes(q) ||
        v.city.toLowerCase().includes(q) ||
        v.path.toLowerCase().includes(q) ||
        v.referrer.toLowerCase().includes(q)
    );
  }, [visitorLogs, visitorSearch]);

  const pagedVisitors = useMemo(
    () => filteredVisitors.slice((visitorPage - 1) * PAGE_SIZE, visitorPage * PAGE_SIZE),
    [filteredVisitors, visitorPage]
  );

  const totalRevenue = useMemo(
    () => orders.reduce((sum, o) => sum + (o.status !== "CANCELLED" ? Number(o.totalAmount) : 0), 0),
    [orders]
  );

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = (await res.json()) as { error?: string; user?: AdminUser };
      if (!res.ok || !data.user) {
        setAuthError(data.error ?? "Giriş başarısız");
        return;
      }
      setUser(data.user);
    } catch {
      setAuthError("Bağlantı hatası");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
  };

  const handleSyncNow = async () => {
    setSyncing(true);
    try {
      const res = await fetch("/api/campaigns/sync", { method: "POST" });
      const data = (await res.json()) as {
        fetchedCount: number;
        createdCount: number;
        updatedCount: number;
        errors?: string[];
      };
      if (!res.ok) {
        pushToast("err", data.errors?.[0] ?? "Senkronizasyon başarısız");
      } else {
        pushToast(
          "ok",
          `Vodafone kampanyaları güncellendi: ${data.fetchedCount} çekildi, ${data.createdCount} yeni, ${data.updatedCount} güncellendi.`
        );
      }
      await loadAll();
    } catch {
      pushToast("err", "Senkronizasyon isteği başarısız");
    } finally {
      setSyncing(false);
    }
  };

  const handleSaveCampaignDialog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaignForm.imageUrl) {
      pushToast("err", "Lütfen MinIO üzerinden bir kampanya görseli yükleyin.");
      return;
    }
    const cat = CAMPAIGN_CATEGORIES.find((c) => c.slug === campaignForm.categorySlug);
    const payload = {
      title: campaignForm.title,
      summary: campaignForm.summary,
      description: campaignForm.description || campaignForm.summary,
      imageUrl: campaignForm.imageUrl,
      targetUrl: campaignForm.targetUrl || "",
      categorySlug: campaignForm.categorySlug,
      categoryName: cat?.name ?? "Faturalı Kampanyalar",
      badgeLabel: campaignForm.badgeLabel || null,
      badgeColor: "red",
      tags: campaignForm.tagsText
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      isFeatured: campaignForm.isFeatured,
      isActive: campaignForm.isActive,
    };

    const url = campaignForm.id ? `/api/campaigns/${campaignForm.id}` : "/api/campaigns";
    const method = campaignForm.id ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = (await res.json()) as { error?: string };
    if (!res.ok) {
      pushToast("err", data.error ?? "Kampanya kaydedilemedi");
      return;
    }
    setCampaignDialogOpen(false);
    pushToast("ok", campaignForm.id ? "Kampanya güncellendi." : "Yeni kampanya eklendi.");
    await loadAll();
  };

  const handleSaveProductDialog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.imageUrl) {
      pushToast("err", "Lütfen MinIO üzerinden bir ürün görseli yükleyin.");
      return;
    }
    const payload = {
      title: productForm.title,
      subtitle: productForm.subtitle || null,
      description: productForm.description || productForm.title,
      category: productForm.category,
      brand: productForm.brand,
      price: Number(productForm.price),
      installmentPrice: productForm.installmentPrice ? Number(productForm.installmentPrice) : null,
      installmentMonths: productForm.installmentPrice ? Number(productForm.installmentMonths) : null,
      imageUrl: productForm.imageUrl,
      stock: Number(productForm.stock),
      isFeatured: productForm.isFeatured,
      isActive: productForm.isActive,
    };

    const url = productForm.id ? `/api/products/${productForm.id}` : "/api/products";
    const method = productForm.id ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = (await res.json()) as { error?: string };
    if (!res.ok) {
      pushToast("err", data.error ?? "Ürün kaydedilemedi");
      return;
    }
    setProductDialogOpen(false);
    pushToast("ok", productForm.id ? "Ürün güncellendi." : "Yeni ürün eklendi.");
    await loadAll();
  };

  const handleSavePageDialog = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title: pageForm.title,
      slug: pageForm.slug || undefined,
      summary: pageForm.summary || null,
      content: pageForm.content,
      metaTitle: pageForm.metaTitle || null,
      metaDescription: pageForm.metaDescription || null,
      showInHeader: pageForm.showInHeader,
      showInFooter: pageForm.showInFooter,
      isPublished: pageForm.isPublished,
    };

    const url = pageForm.id ? `/api/pages/${pageForm.id}` : "/api/pages";
    const method = pageForm.id ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = (await res.json()) as { error?: string };
    if (!res.ok) {
      pushToast("err", data.error ?? "Sayfa kaydedilemedi");
      return;
    }
    setPageDialogOpen(false);
    pushToast("ok", pageForm.id ? "Sayfa güncellendi." : "Yeni sayfa oluşturuldu.");
    await loadAll();
  };

  const handleSaveBranchDialog = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: branchForm.name,
      city: branchForm.city,
      district: branchForm.district,
      address: branchForm.address,
      phone: branchForm.phone,
      whatsappPhone: branchForm.whatsappPhone,
      workingHours: branchForm.workingHours,
      mapUrl: branchForm.mapUrl || "",
      sortOrder: Number(branchForm.sortOrder) || 0,
      isActive: branchForm.isActive,
    };

    const url = branchForm.id ? `/api/branches/${branchForm.id}` : "/api/branches";
    const method = branchForm.id ? "PATCH" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = (await res.json()) as { error?: string };
    if (!res.ok) {
      pushToast("err", data.error ?? "Şube kaydedilemedi");
      return;
    }
    setBranchDialogOpen(false);
    pushToast("ok", branchForm.id ? "Şube güncellendi." : "Yeni şube eklendi.");
    await loadAll();
  };

  const handleSaveBlogDialog = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title: blogForm.title,
      slug: blogForm.slug || undefined,
      excerpt: blogForm.excerpt,
      content: blogForm.content,
      coverImageUrl: blogForm.coverImageUrl || "",
      category: blogForm.category,
      author: blogForm.author,
      metaTitle: blogForm.metaTitle || null,
      metaDescription: blogForm.metaDescription || null,
      isPublished: blogForm.isPublished,
    };

    const url = blogForm.id ? `/api/blog/${blogForm.id}` : "/api/blog";
    const method = blogForm.id ? "PATCH" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = (await res.json()) as { error?: string };
    if (!res.ok) {
      pushToast("err", data.error ?? "Blog yazısı kaydedilemedi");
      return;
    }
    setBlogDialogOpen(false);
    pushToast("ok", blogForm.id ? "Blog yazısı güncellendi." : "Blog yazısı yayınlandı.");
    await loadAll();
  };

  const handleSaveFaqDialog = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      question: faqForm.question,
      answer: faqForm.answer,
      category: faqForm.category,
      sortOrder: Number(faqForm.sortOrder) || 0,
      isActive: faqForm.isActive,
    };

    const url = faqForm.id ? `/api/faq/${faqForm.id}` : "/api/faq";
    const method = faqForm.id ? "PATCH" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = (await res.json()) as { error?: string };
    if (!res.ok) {
      pushToast("err", data.error ?? "Soru kaydedilemedi");
      return;
    }
    setFaqDialogOpen(false);
    pushToast("ok", faqForm.id ? "Soru güncellendi." : "Yeni soru eklendi.");
    await loadAll();
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setSavingSettings(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = (await res.json()) as { error?: string; settings?: SiteSettingsDto };
      if (!res.ok) {
        pushToast("err", data.error ?? "Ayarlar kaydedilemedi");
      } else {
        if (data.settings) setSettings(data.settings);
        pushToast("ok", "Site, Logo, WhatsApp ve SEO/GEO ayarları kaydedildi.");
      }
    } finally {
      setSavingSettings(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0b0d12] via-[#171923] to-[#2b0505] px-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl border border-neutral-200">
          <div className="flex items-center gap-3 mb-6">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#e60000] text-white shadow-md">
              <ShieldCheck className="h-6 w-6" />
            </span>
            <div>
              <h1 className="text-xl font-extrabold text-[#0d0d0d]">
                Atik İletişim Yönetim Paneli
              </h1>
              <p className="text-xs text-[#666666]">Bağımsız Yönetici Oturumu</p>
            </div>
          </div>

          {authError && (
            <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-xs font-semibold text-[#e60000]">
              {authError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#333333] mb-1">
                Yönetici E-posta
              </label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@vodafone-clone.local"
                className="w-full rounded-xl border border-neutral-300 px-3.5 py-2.5 text-sm outline-none focus:border-[#e60000]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#333333] mb-1">Şifre</label>
              <input
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-neutral-300 px-3.5 py-2.5 text-sm outline-none focus:border-[#e60000]"
              />
            </div>
            <button
              type="submit"
              disabled={authLoading}
              className="w-full rounded-xl bg-[#e60000] py-3 text-sm font-bold text-white hover:bg-[#bd0000] disabled:opacity-60"
            >
              {authLoading ? "Giriş Yapılıyor..." : "Yönetim Paneline Giriş Yap"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const NAV_ITEMS: Array<{
    key: AdminSection;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
  }> = [
    { key: "overview", label: "Genel Bakış", icon: LayoutDashboard },
    { key: "campaigns", label: "Kampanyalar & Sync", icon: Gift, badge: campaigns.length },
    { key: "products", label: "Ürün & Tarifeler", icon: Package, badge: products.length },
    { key: "orders", label: "Sipariş Yönetimi", icon: ShoppingBag, badge: orders.length },
    { key: "branches", label: "Şubelerimiz", icon: MapPin, badge: branches.length },
    { key: "blog", label: "Blog Yazıları", icon: BookOpen, badge: blogPosts.length },
    { key: "faq", label: "Sıkça Sorulan Sorular", icon: HelpCircle, badge: faqItems.length },
    { key: "pages", label: "Sayfa Oluşturucu", icon: FileText, badge: pages.length },
    { key: "visitors", label: "Ziyaretçi Kayıtları", icon: Activity, badge: visitorLogs.length },
    { key: "brand", label: "Site, Logo & WhatsApp", icon: Settings },
    { key: "seo", label: "SEO & GEO Ayarları", icon: Globe },
    {
      key: "messages",
      label: "Gelen Mesajlar",
      icon: Mail,
      badge: messages.filter((m) => !m.isRead).length,
    },
  ];

  const activeNav = NAV_ITEMS.find((n) => n.key === section);

  return (
    <div className="min-h-screen flex bg-[#f1f3f5] text-[#111827]">
      {mobileNavOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileNavOpen(false)}
        />
      )}

      {/* Left Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col transition-all duration-200 lg:static lg:translate-x-0 ${
          sidebarCollapsed ? "w-20" : "w-68"
        } ${
          sidebarTheme === "vodafone"
            ? "bg-[#7a0000] text-red-100"
            : sidebarTheme === "slate"
              ? "bg-[#0f172a] text-slate-300"
              : "bg-[#0f1117] text-neutral-300"
        } ${mobileNavOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex items-center justify-between px-4 h-16 border-b border-white/10">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#e60000] text-white font-black text-base">
              {settings?.brandName.charAt(0).toUpperCase() ?? "A"}
            </span>
            {!sidebarCollapsed && (
              <div className="leading-tight min-w-0">
                <p className="text-sm font-extrabold text-white truncate max-w-[140px]">
                  {settings?.brandName ?? "Atik İletişim"}
                </p>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-[#ff8080]">
                  Admin Console
                </p>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => setSidebarCollapsed((v) => !v)}
            aria-label="Sidebar Daralt/Genişlet"
            className="hidden lg:flex p-1.5 rounded-lg text-neutral-300 hover:bg-white/10 hover:text-white"
          >
            {sidebarCollapsed ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </button>
          <button
            type="button"
            onClick={() => setMobileNavOpen(false)}
            className="lg:hidden p-1 text-neutral-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = section === item.key;
            return (
              <button
                key={item.key}
                type="button"
                title={item.label}
                onClick={() => {
                  setSection(item.key);
                  setMobileNavOpen(false);
                }}
                className={`w-full flex items-center ${
                  sidebarCollapsed ? "justify-center" : "justify-between"
                } rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-colors ${
                  active
                    ? "bg-[#e60000] text-white shadow-sm"
                    : "text-neutral-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                <span className="flex items-center gap-3">
                  <Icon className="h-4 w-4 shrink-0" />
                  {!sidebarCollapsed && <span>{item.label}</span>}
                </span>
                {!sidebarCollapsed && item.badge !== undefined && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      active ? "bg-white/20 text-white" : "bg-white/10 text-neutral-300"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-3 space-y-2">
          {!sidebarCollapsed && (
            <div className="flex items-center justify-between px-2 py-1 text-[11px] text-neutral-400">
              <span className="inline-flex items-center gap-1">
                <Palette className="h-3.5 w-3.5" />
                <span>Tema</span>
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setSidebarTheme("dark")}
                  aria-label="Koyu Tema"
                  className={`h-4 w-4 rounded-full bg-[#0f1117] border ${
                    sidebarTheme === "dark" ? "border-white scale-110" : "border-white/30"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setSidebarTheme("vodafone")}
                  aria-label="Vodafone Kırmızı Tema"
                  className={`h-4 w-4 rounded-full bg-[#e60000] border ${
                    sidebarTheme === "vodafone" ? "border-white scale-110" : "border-white/30"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setSidebarTheme("slate")}
                  aria-label="Lacivert Tema"
                  className={`h-4 w-4 rounded-full bg-[#1e293b] border ${
                    sidebarTheme === "slate" ? "border-white scale-110" : "border-white/30"
                  }`}
                />
              </div>
            </div>
          )}
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-xs font-semibold text-white hover:bg-white/20"
          >
            <ExternalLink className="h-3.5 w-3.5 shrink-0" />
            {!sidebarCollapsed && <span>Mağazayı Görüntüle</span>}
          </a>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-red-300 hover:bg-red-500/20"
          >
            <LogOut className="h-3.5 w-3.5 shrink-0" />
            {!sidebarCollapsed && <span>Güvenli Çıkış</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-neutral-200 px-4 sm:px-6 flex items-center justify-between gap-4 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              aria-label="Menüyü aç"
              className="lg:hidden p-2 rounded-lg border border-neutral-200 text-neutral-700"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-base sm:text-lg font-extrabold text-[#0d0d0d]">
                {activeNav?.label ?? "Yönetim Paneli"}
              </h1>
              <p className="hidden sm:block text-xs text-neutral-500">
                {user.name} ({user.email})
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={syncing}
            onClick={handleSyncNow}
            className="inline-flex items-center gap-2 rounded-xl bg-[#e60000] px-4 py-2 text-xs sm:text-sm font-bold text-white hover:bg-[#bd0000] disabled:opacity-60"
          >
            <RefreshCw className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
            <span>{syncing ? "Güncelleniyor..." : "Vodafone Kampanyalarını Güncelle"}</span>
          </button>
        </header>

        <div className="p-4 sm:p-6 space-y-6 flex-1">
          <ToastStack
            toasts={toasts}
            onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))}
          />

          {/* OVERVIEW */}
          {section === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-2xl bg-white p-5 border border-neutral-200 shadow-xs">
                  <div className="flex items-center justify-between text-xs font-semibold text-neutral-500">
                    <span>Toplam Ciro</span>
                    <TrendingUp className="h-4 w-4 text-emerald-600" />
                  </div>
                  <p className="mt-2 text-2xl font-black text-[#0d0d0d]">
                    {formatTry(totalRevenue)}
                  </p>
                  <p className="mt-1 text-xs text-neutral-500">{orders.length} toplam sipariş</p>
                </div>

                <div className="rounded-2xl bg-white p-5 border border-neutral-200 shadow-xs">
                  <div className="flex items-center justify-between text-xs font-semibold text-neutral-500">
                    <span>Aktif Kampanyalar</span>
                    <Gift className="h-4 w-4 text-[#e60000]" />
                  </div>
                  <p className="mt-2 text-2xl font-black text-[#0d0d0d]">
                    {campaigns.filter((c) => c.isActive).length}
                  </p>
                  <p className="mt-1 text-xs text-[#007c92]">
                    {campaigns.filter((c) => c.source === "VODAFONE_SYNC").length} Vodafone Sync •{" "}
                    {campaigns.filter((c) => c.source === "ADMIN_MANUAL").length} Manuel
                  </p>
                </div>

                <div className="rounded-2xl bg-white p-5 border border-neutral-200 shadow-xs">
                  <div className="flex items-center justify-between text-xs font-semibold text-neutral-500">
                    <span>Katalog Ürünleri</span>
                    <Package className="h-4 w-4 text-indigo-600" />
                  </div>
                  <p className="mt-2 text-2xl font-black text-[#0d0d0d]">{products.length}</p>
                  <p className="mt-1 text-xs text-neutral-500">Cihaz, Tarife &amp; Fiber</p>
                </div>

                <div className="rounded-2xl bg-white p-5 border border-neutral-200 shadow-xs">
                  <div className="flex items-center justify-between text-xs font-semibold text-neutral-500">
                    <span>Okunmamış Mesaj</span>
                    <Mail className="h-4 w-4 text-amber-600" />
                  </div>
                  <p className="mt-2 text-2xl font-black text-[#0d0d0d]">
                    {messages.filter((m) => !m.isRead).length}
                  </p>
                  <p className="mt-1 text-xs text-neutral-500">
                    Toplam {messages.length} iletişim mesajı
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="rounded-2xl bg-white p-6 border border-neutral-200 shadow-xs">
                  <h2 className="text-base font-extrabold text-[#0d0d0d] mb-4">Son Siparişler</h2>
                  {orders.length === 0 ? (
                    <p className="text-sm text-neutral-500">Henüz sipariş alınmadı.</p>
                  ) : (
                    <div className="space-y-3">
                      {orders.slice(0, 5).map((o) => (
                        <div
                          key={o.id}
                          className="flex items-center justify-between rounded-xl bg-[#f8f9fa] px-4 py-3 text-sm"
                        >
                          <div>
                            <p className="font-bold text-[#0d0d0d]">{o.orderNumber}</p>
                            <p className="text-xs text-neutral-500">{o.customerName}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-extrabold text-[#e60000]">
                              {formatTry(Number(o.totalAmount))}
                            </p>
                            <p className="text-[11px] font-semibold text-neutral-600">{o.status}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="rounded-2xl bg-white p-6 border border-neutral-200 shadow-xs">
                  <h2 className="text-base font-extrabold text-[#0d0d0d] mb-4">
                    Son Vodafone Sync Logları
                  </h2>
                  {syncLogs.length === 0 ? (
                    <p className="text-sm text-neutral-500">Henüz sync logu yok.</p>
                  ) : (
                    <div className="space-y-3">
                      {syncLogs.slice(0, 5).map((l) => (
                        <div
                          key={l.id}
                          className="flex items-center justify-between rounded-xl bg-[#f8f9fa] px-4 py-3 text-xs"
                        >
                          <div>
                            <span className="font-bold text-emerald-700">{l.status}</span>
                            <span className="ml-2 text-neutral-600">
                              {l.fetchedCount} çekildi ({l.createdCount} yeni)
                            </span>
                          </div>
                          <span className="text-neutral-500">
                            {new Date(l.startedAt).toLocaleString("tr-TR")}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* CAMPAIGNS TABLE FIRST */}
          {section === "campaigns" && (
            <div className="rounded-2xl bg-white border border-neutral-200 shadow-xs overflow-hidden">
              <div className="p-5 border-b border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-extrabold text-[#0d0d0d]">
                    Kampanyalar ({filteredCampaigns.length})
                  </h2>
                  <p className="text-xs text-neutral-500">
                    Tablodan kampanyaları açıp kapatabilir, düzenleyebilir veya yeni ekleyebilirsiniz.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={campaignSourceFilter}
                    onChange={(e) =>
                      setCampaignSourceFilter(
                        e.target.value as "ALL" | "VODAFONE_SYNC" | "ADMIN_MANUAL"
                      )
                    }
                    className="rounded-xl border border-neutral-300 bg-white px-3 py-2 text-xs font-semibold"
                  >
                    <option value="ALL">Tüm Kaynaklar</option>
                    <option value="VODAFONE_SYNC">Vodafone Sync</option>
                    <option value="ADMIN_MANUAL">Admin Manuel</option>
                  </select>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
                    <input
                      value={campaignSearch}
                      onChange={(e) => {
                        setCampaignSearch(e.target.value);
                        setCampaignPage(1);
                      }}
                      placeholder="Kampanya ara..."
                      className="rounded-xl border border-neutral-300 pl-8 pr-3 py-2 text-xs outline-none focus:border-[#e60000]"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setCampaignForm(EMPTY_CAMPAIGN_FORM);
                      setCampaignDialogOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#e60000] px-4 py-2 text-xs font-bold text-white hover:bg-[#bd0000]"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Kampanya Ekle</span>
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-neutral-50 text-xs uppercase text-neutral-500 border-b border-neutral-200">
                    <tr>
                      <th className="px-4 py-3">Görsel</th>
                      <th className="px-4 py-3">Kampanya</th>
                      <th className="px-4 py-3">Kategori</th>
                      <th className="px-4 py-3">Kaynak</th>
                      <th className="px-4 py-3">Durum</th>
                      <th className="px-4 py-3 text-right">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    {pagedCampaigns.map((c) => (
                      <tr key={c.id} className="hover:bg-neutral-50">
                        <td className="px-4 py-3">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={c.imageUrl}
                            alt={c.title}
                            className="h-10 w-16 rounded-lg object-cover border border-neutral-200"
                          />
                        </td>
                        <td className="px-4 py-3 max-w-xs">
                          <p className="font-bold text-[#0d0d0d] truncate">{c.title}</p>
                          <p className="text-xs text-neutral-500 truncate">{c.summary}</p>
                        </td>
                        <td className="px-4 py-3 text-xs text-neutral-600">{c.categoryName}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold text-white ${
                              c.source === "VODAFONE_SYNC" ? "bg-[#007c92]" : "bg-[#e60000]"
                            }`}
                          >
                            {c.source === "VODAFONE_SYNC" ? "Vodafone Sync" : "Admin Manuel"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <ToggleSwitch
                            checked={c.isActive}
                            label={`${c.title} durum`}
                            onChange={async () => {
                              await fetch(`/api/campaigns/${c.id}`, {
                                method: "PATCH",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ isActive: !c.isActive }),
                              });
                              await loadAll();
                            }}
                          />
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="inline-flex items-center gap-1">
                            <Tooltip text="Düzenle">
                              <button
                                type="button"
                                onClick={() => {
                                  setCampaignForm({
                                    id: c.id,
                                    title: c.title,
                                    summary: c.summary,
                                    description: c.description,
                                    imageUrl: c.imageUrl,
                                    targetUrl: c.targetUrl ?? "",
                                    categorySlug: c.categorySlug,
                                    badgeLabel: c.badgeLabel ?? "",
                                    tagsText: c.tags.join(", "),
                                    isFeatured: c.isFeatured,
                                    isActive: c.isActive,
                                  });
                                  setCampaignDialogOpen(true);
                                }}
                                aria-label="Düzenle"
                                className="p-2 rounded-lg text-neutral-500 hover:bg-neutral-100 hover:text-[#0d0d0d]"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>
                            </Tooltip>
                            <Tooltip text="Sil">
                              <button
                                type="button"
                                onClick={async () => {
                                  await fetch(`/api/campaigns/${c.id}`, { method: "DELETE" });
                                  pushToast("ok", "Kampanya silindi.");
                                  await loadAll();
                                }}
                                aria-label="Sil"
                                className="p-2 rounded-lg text-neutral-400 hover:bg-red-50 hover:text-[#e60000]"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </Tooltip>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination
                totalItems={filteredCampaigns.length}
                pageSize={PAGE_SIZE}
                currentPage={campaignPage}
                onPageChange={setCampaignPage}
              />
            </div>
          )}

          {/* PRODUCTS TABLE FIRST */}
          {section === "products" && (
            <div className="rounded-2xl bg-white border border-neutral-200 shadow-xs overflow-hidden">
              <div className="p-5 border-b border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-extrabold text-[#0d0d0d]">
                    Ürün &amp; Tarifeler ({filteredProducts.length})
                  </h2>
                  <p className="text-xs text-neutral-500">
                    Cihaz, tarife ve ev interneti paketlerini yönetin.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
                    <input
                      value={productSearch}
                      onChange={(e) => {
                        setProductSearch(e.target.value);
                        setProductPage(1);
                      }}
                      placeholder="Ürün ara..."
                      className="rounded-xl border border-neutral-300 pl-8 pr-3 py-2 text-xs outline-none focus:border-[#e60000]"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setProductForm(EMPTY_PRODUCT_FORM);
                      setProductDialogOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#e60000] px-4 py-2 text-xs font-bold text-white hover:bg-[#bd0000]"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Ürün Ekle</span>
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-neutral-50 text-xs uppercase text-neutral-500 border-b border-neutral-200">
                    <tr>
                      <th className="px-4 py-3">Görsel</th>
                      <th className="px-4 py-3">Ürün / Tarife</th>
                      <th className="px-4 py-3">Kategori</th>
                      <th className="px-4 py-3">Fiyat</th>
                      <th className="px-4 py-3">Stok</th>
                      <th className="px-4 py-3">Durum</th>
                      <th className="px-4 py-3 text-right">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    {pagedProducts.map((p) => (
                      <tr key={p.id} className="hover:bg-neutral-50">
                        <td className="px-4 py-3">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={p.imageUrl}
                            alt={p.title}
                            className="h-10 w-10 rounded-lg object-contain border border-neutral-200 bg-white"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-bold text-[#0d0d0d]">{p.title}</p>
                          <p className="text-xs text-neutral-500">{p.brand}</p>
                        </td>
                        <td className="px-4 py-3 text-xs text-neutral-600">{p.category}</td>
                        <td className="px-4 py-3 font-bold text-[#e60000]">
                          {formatTry(p.price)}
                        </td>
                        <td className="px-4 py-3 text-xs font-semibold">{p.stock}</td>
                        <td className="px-4 py-3">
                          <ToggleSwitch
                            checked={p.isActive ?? true}
                            label={`${p.title} durum`}
                            onChange={async () => {
                              await fetch(`/api/products/${p.id}`, {
                                method: "PATCH",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ isActive: !(p.isActive ?? true) }),
                              });
                              await loadAll();
                            }}
                          />
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="inline-flex items-center gap-1">
                            <Tooltip text="Düzenle">
                              <button
                                type="button"
                                onClick={() => {
                                  setProductForm({
                                    id: p.id,
                                    title: p.title,
                                    subtitle: p.subtitle ?? "",
                                    description: p.description,
                                    category: p.category,
                                    brand: p.brand,
                                    price: String(p.price),
                                    installmentPrice: p.installmentPrice
                                      ? String(p.installmentPrice)
                                      : "",
                                    installmentMonths: p.installmentMonths
                                      ? String(p.installmentMonths)
                                      : "12",
                                    imageUrl: p.imageUrl,
                                    stock: String(p.stock),
                                    isFeatured: p.isFeatured,
                                    isActive: p.isActive ?? true,
                                  });
                                  setProductDialogOpen(true);
                                }}
                                aria-label="Düzenle"
                                className="p-2 rounded-lg text-neutral-500 hover:bg-neutral-100 hover:text-[#0d0d0d]"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>
                            </Tooltip>
                            <Tooltip text="Sil">
                              <button
                                type="button"
                                onClick={async () => {
                                  await fetch(`/api/products/${p.id}`, { method: "DELETE" });
                                  pushToast("ok", "Ürün silindi.");
                                  await loadAll();
                                }}
                                aria-label="Sil"
                                className="p-2 rounded-lg text-neutral-400 hover:bg-red-50 hover:text-[#e60000]"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </Tooltip>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination
                totalItems={filteredProducts.length}
                pageSize={PAGE_SIZE}
                currentPage={productPage}
                onPageChange={setProductPage}
              />
            </div>
          )}

          {/* ORDERS TABLE */}
          {section === "orders" && (
            <div className="rounded-2xl bg-white border border-neutral-200 shadow-xs overflow-hidden">
              <div className="p-5 border-b border-neutral-200">
                <h2 className="text-base font-extrabold text-[#0d0d0d]">
                  Sipariş Yönetimi ({orders.length})
                </h2>
              </div>
              {orders.length === 0 ? (
                <p className="p-6 text-sm text-neutral-500">Henüz sipariş bulunmuyor.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-neutral-50 text-xs uppercase text-neutral-500 border-b border-neutral-200">
                      <tr>
                        <th className="px-4 py-3">Sipariş No</th>
                        <th className="px-4 py-3">Müşteri</th>
                        <th className="px-4 py-3">Ürünler</th>
                        <th className="px-4 py-3">Tutar</th>
                        <th className="px-4 py-3">Durum</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200">
                      {pagedOrders.map((o) => (
                        <tr key={o.id} className="hover:bg-neutral-50">
                          <td className="px-4 py-3 font-black text-[#0d0d0d]">{o.orderNumber}</td>
                          <td className="px-4 py-3">
                            <p className="font-bold">{o.customerName}</p>
                            <p className="text-xs text-neutral-500">
                              {o.customerPhone} • {o.district}/{o.city}
                            </p>
                          </td>
                          <td className="px-4 py-3 text-xs text-neutral-700">
                            {o.items.map((i) => `${i.title} (x${i.quantity})`).join(", ")}
                          </td>
                          <td className="px-4 py-3 font-extrabold text-[#e60000]">
                            {formatTry(Number(o.totalAmount))}
                          </td>
                          <td className="px-4 py-3">
                            <select
                              value={o.status}
                              onChange={async (e) => {
                                await fetch(`/api/orders/${o.id}`, {
                                  method: "PATCH",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ status: e.target.value }),
                                });
                                await loadAll();
                              }}
                              className="rounded-xl border border-neutral-300 bg-white px-3 py-1.5 text-xs font-bold"
                            >
                              <option value="PENDING">PENDING</option>
                              <option value="CONFIRMED">CONFIRMED</option>
                              <option value="SHIPPED">SHIPPED</option>
                              <option value="COMPLETED">COMPLETED</option>
                              <option value="CANCELLED">CANCELLED</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <Pagination
                totalItems={orders.length}
                pageSize={PAGE_SIZE}
                currentPage={orderPage}
                onPageChange={setOrderPage}
              />
            </div>
          )}

          {/* BRANCHES TABLE FIRST */}
          {section === "branches" && (
            <div className="rounded-2xl bg-white border border-neutral-200 shadow-xs overflow-hidden">
              <div className="p-5 border-b border-neutral-200 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-extrabold text-[#0d0d0d]">
                    Şubelerimiz ({branches.length})
                  </h2>
                  <p className="text-xs text-neutral-500">
                    Gaziantep ve diğer illerdeki Atik İletişim şubelerini yönetin.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setBranchForm(EMPTY_BRANCH_FORM);
                    setBranchDialogOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#e60000] px-4 py-2 text-xs font-bold text-white hover:bg-[#bd0000]"
                >
                  <Plus className="h-4 w-4" />
                  <span>Şube Ekle</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-neutral-50 text-xs uppercase text-neutral-500 border-b border-neutral-200">
                    <tr>
                      <th className="px-4 py-3">Sıra</th>
                      <th className="px-4 py-3">Şube Adı</th>
                      <th className="px-4 py-3">İl / İlçe</th>
                      <th className="px-4 py-3">Telefon / Saat</th>
                      <th className="px-4 py-3">Durum</th>
                      <th className="px-4 py-3 text-right">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    {pagedBranches.map((b) => (
                      <tr key={b.id} className="hover:bg-neutral-50">
                        <td className="px-4 py-3 text-xs font-bold text-neutral-500">
                          {b.sortOrder}
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-bold text-[#0d0d0d]">{b.name}</p>
                          <p className="text-xs text-neutral-500 truncate max-w-xs">{b.address}</p>
                        </td>
                        <td className="px-4 py-3 text-xs font-semibold text-neutral-700">
                          {b.city} / {b.district}
                        </td>
                        <td className="px-4 py-3 text-xs text-neutral-600">
                          {b.phone || "-"} • {b.workingHours}
                        </td>
                        <td className="px-4 py-3">
                          <ToggleSwitch
                            checked={b.isActive}
                            label={`${b.name} durum`}
                            onChange={async () => {
                              await fetch(`/api/branches/${b.id}`, {
                                method: "PATCH",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ isActive: !b.isActive }),
                              });
                              await loadAll();
                            }}
                          />
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="inline-flex items-center gap-1">
                            <Tooltip text="Düzenle">
                              <button
                                type="button"
                                onClick={() => {
                                  setBranchForm({
                                    id: b.id,
                                    name: b.name,
                                    city: b.city,
                                    district: b.district,
                                    address: b.address,
                                    phone: b.phone,
                                    whatsappPhone: b.whatsappPhone,
                                    workingHours: b.workingHours,
                                    mapUrl: b.mapUrl,
                                    sortOrder: String(b.sortOrder),
                                    isActive: b.isActive,
                                  });
                                  setBranchDialogOpen(true);
                                }}
                                aria-label="Düzenle"
                                className="p-2 rounded-lg text-neutral-500 hover:bg-neutral-100 hover:text-[#0d0d0d]"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>
                            </Tooltip>
                            <Tooltip text="Sil">
                              <button
                                type="button"
                                onClick={async () => {
                                  await fetch(`/api/branches/${b.id}`, { method: "DELETE" });
                                  pushToast("ok", "Şube silindi.");
                                  await loadAll();
                                }}
                                aria-label="Sil"
                                className="p-2 rounded-lg text-neutral-400 hover:bg-red-50 hover:text-[#e60000]"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </Tooltip>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination
                totalItems={branches.length}
                pageSize={PAGE_SIZE}
                currentPage={branchPage}
                onPageChange={setBranchPage}
              />
            </div>
          )}

          {/* BLOG TABLE FIRST */}
          {section === "blog" && (
            <div className="rounded-2xl bg-white border border-neutral-200 shadow-xs overflow-hidden">
              <div className="p-5 border-b border-neutral-200 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-extrabold text-[#0d0d0d]">
                    Blog Yazıları ({blogPosts.length})
                  </h2>
                  <p className="text-xs text-neutral-500">
                    CKEditor 5 ve MinIO kapak görseli ile blog içerikleri yayınlayın.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setBlogForm(EMPTY_BLOG_FORM);
                    setBlogDialogOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#e60000] px-4 py-2 text-xs font-bold text-white hover:bg-[#bd0000]"
                >
                  <Plus className="h-4 w-4" />
                  <span>Blog Yazısı Ekle</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-neutral-50 text-xs uppercase text-neutral-500 border-b border-neutral-200">
                    <tr>
                      <th className="px-4 py-3">Başlık</th>
                      <th className="px-4 py-3">Kategori</th>
                      <th className="px-4 py-3">Yazar</th>
                      <th className="px-4 py-3">Yayın</th>
                      <th className="px-4 py-3 text-right">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    {pagedBlogPosts.map((post) => (
                      <tr key={post.id} className="hover:bg-neutral-50">
                        <td className="px-4 py-3 max-w-xs">
                          <p className="font-bold text-[#0d0d0d] truncate">{post.title}</p>
                          <a
                            href={`/blog/${post.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-[#007c92] hover:underline"
                          >
                            /blog/{post.slug}
                          </a>
                        </td>
                        <td className="px-4 py-3 text-xs text-neutral-600">{post.category}</td>
                        <td className="px-4 py-3 text-xs text-neutral-600">{post.author}</td>
                        <td className="px-4 py-3">
                          <ToggleSwitch
                            checked={post.isPublished}
                            label={`${post.title} yayın durumu`}
                            onChange={async () => {
                              await fetch(`/api/blog/${post.id}`, {
                                method: "PATCH",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ isPublished: !post.isPublished }),
                              });
                              await loadAll();
                            }}
                          />
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="inline-flex items-center gap-1">
                            <Tooltip text="Düzenle">
                              <button
                                type="button"
                                onClick={() => {
                                  setBlogForm({
                                    id: post.id,
                                    title: post.title,
                                    slug: post.slug,
                                    excerpt: post.excerpt,
                                    content: post.content,
                                    coverImageUrl: post.coverImageUrl,
                                    category: post.category,
                                    author: post.author,
                                    metaTitle: post.metaTitle ?? "",
                                    metaDescription: post.metaDescription ?? "",
                                    isPublished: post.isPublished,
                                  });
                                  setBlogDialogOpen(true);
                                }}
                                aria-label="Düzenle"
                                className="p-2 rounded-lg text-neutral-500 hover:bg-neutral-100 hover:text-[#0d0d0d]"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>
                            </Tooltip>
                            <Tooltip text="Sil">
                              <button
                                type="button"
                                onClick={async () => {
                                  await fetch(`/api/blog/${post.id}`, { method: "DELETE" });
                                  pushToast("ok", "Blog yazısı silindi.");
                                  await loadAll();
                                }}
                                aria-label="Sil"
                                className="p-2 rounded-lg text-neutral-400 hover:bg-red-50 hover:text-[#e60000]"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </Tooltip>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination
                totalItems={blogPosts.length}
                pageSize={PAGE_SIZE}
                currentPage={blogPage}
                onPageChange={setBlogPage}
              />
            </div>
          )}

          {/* FAQ TABLE FIRST */}
          {section === "faq" && (
            <div className="rounded-2xl bg-white border border-neutral-200 shadow-xs overflow-hidden">
              <div className="p-5 border-b border-neutral-200 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-extrabold text-[#0d0d0d]">
                    Sıkça Sorulan Sorular ({faqItems.length})
                  </h2>
                  <p className="text-xs text-neutral-500">
                    Kurumsal / SSS sayfasında görüntülenen soru ve cevapları yönetin.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setFaqForm(EMPTY_FAQ_FORM);
                    setFaqDialogOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#e60000] px-4 py-2 text-xs font-bold text-white hover:bg-[#bd0000]"
                >
                  <Plus className="h-4 w-4" />
                  <span>Soru Ekle</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-neutral-50 text-xs uppercase text-neutral-500 border-b border-neutral-200">
                    <tr>
                      <th className="px-4 py-3">Sıra</th>
                      <th className="px-4 py-3">Soru</th>
                      <th className="px-4 py-3">Kategori</th>
                      <th className="px-4 py-3">Durum</th>
                      <th className="px-4 py-3 text-right">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    {pagedFaqItems.map((item) => (
                      <tr key={item.id} className="hover:bg-neutral-50">
                        <td className="px-4 py-3 text-xs font-bold text-neutral-500">
                          {item.sortOrder}
                        </td>
                        <td className="px-4 py-3 max-w-md">
                          <p className="font-bold text-[#0d0d0d]">{item.question}</p>
                          <p className="text-xs text-neutral-500 truncate">{item.answer}</p>
                        </td>
                        <td className="px-4 py-3 text-xs text-neutral-600">{item.category}</td>
                        <td className="px-4 py-3">
                          <ToggleSwitch
                            checked={item.isActive}
                            label={`${item.question} durum`}
                            onChange={async () => {
                              await fetch(`/api/faq/${item.id}`, {
                                method: "PATCH",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ isActive: !item.isActive }),
                              });
                              await loadAll();
                            }}
                          />
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="inline-flex items-center gap-1">
                            <Tooltip text="Düzenle">
                              <button
                                type="button"
                                onClick={() => {
                                  setFaqForm({
                                    id: item.id,
                                    question: item.question,
                                    answer: item.answer,
                                    category: item.category,
                                    sortOrder: String(item.sortOrder),
                                    isActive: item.isActive,
                                  });
                                  setFaqDialogOpen(true);
                                }}
                                aria-label="Düzenle"
                                className="p-2 rounded-lg text-neutral-500 hover:bg-neutral-100 hover:text-[#0d0d0d]"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>
                            </Tooltip>
                            <Tooltip text="Sil">
                              <button
                                type="button"
                                onClick={async () => {
                                  await fetch(`/api/faq/${item.id}`, { method: "DELETE" });
                                  pushToast("ok", "Soru silindi.");
                                  await loadAll();
                                }}
                                aria-label="Sil"
                                className="p-2 rounded-lg text-neutral-400 hover:bg-red-50 hover:text-[#e60000]"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </Tooltip>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination
                totalItems={faqItems.length}
                pageSize={PAGE_SIZE}
                currentPage={faqPage}
                onPageChange={setFaqPage}
              />
            </div>
          )}

          {/* PAGES TABLE FIRST */}
          {section === "pages" && (
            <div className="rounded-2xl bg-white border border-neutral-200 shadow-xs overflow-hidden">
              <div className="p-5 border-b border-neutral-200 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-extrabold text-[#0d0d0d]">
                    Sayfalar ({pages.length})
                  </h2>
                  <p className="text-xs text-neutral-500">
                    CKEditor ile zengin içerikli dinamik sayfalar oluşturun.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setPageForm(EMPTY_PAGE_FORM);
                    setPageDialogOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#e60000] px-4 py-2 text-xs font-bold text-white hover:bg-[#bd0000]"
                >
                  <Plus className="h-4 w-4" />
                  <span>Sayfa Oluştur</span>
                </button>
              </div>

              {pages.length === 0 ? (
                <p className="p-6 text-sm text-neutral-500">Henüz özel sayfa oluşturulmadı.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-neutral-50 text-xs uppercase text-neutral-500 border-b border-neutral-200">
                      <tr>
                        <th className="px-4 py-3">Başlık</th>
                        <th className="px-4 py-3">URL</th>
                        <th className="px-4 py-3">Menü</th>
                        <th className="px-4 py-3">Yayın Durumu</th>
                        <th className="px-4 py-3 text-right">İşlemler</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200">
                      {pagedPages.map((pg) => (
                        <tr key={pg.id} className="hover:bg-neutral-50">
                          <td className="px-4 py-3 font-bold text-[#0d0d0d]">{pg.title}</td>
                          <td className="px-4 py-3 text-xs">
                            <a
                              href={`/sayfa/${pg.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#007c92] hover:underline"
                            >
                              /sayfa/{pg.slug}
                            </a>
                          </td>
                          <td className="px-4 py-3 text-xs text-neutral-600">
                            {pg.showInHeader ? "Üst Menü " : ""}
                            {pg.showInFooter ? "Footer" : ""}
                          </td>
                          <td className="px-4 py-3">
                            <ToggleSwitch
                              checked={pg.isPublished}
                              label={`${pg.title} yayın durumu`}
                              onChange={async () => {
                                await fetch(`/api/pages/${pg.id}`, {
                                  method: "PATCH",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ isPublished: !pg.isPublished }),
                                });
                                await loadAll();
                              }}
                            />
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="inline-flex items-center gap-1">
                              <Tooltip text="Düzenle">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setPageForm({
                                      id: pg.id,
                                      title: pg.title,
                                      slug: pg.slug,
                                      summary: pg.summary ?? "",
                                      content: pg.content,
                                      metaTitle: pg.metaTitle ?? "",
                                      metaDescription: pg.metaDescription ?? "",
                                      showInHeader: pg.showInHeader,
                                      showInFooter: pg.showInFooter,
                                      isPublished: pg.isPublished,
                                    });
                                    setPageDialogOpen(true);
                                  }}
                                  aria-label="Düzenle"
                                  className="p-2 rounded-lg text-neutral-500 hover:bg-neutral-100 hover:text-[#0d0d0d]"
                                >
                                  <Pencil className="h-4 w-4" />
                                </button>
                              </Tooltip>
                              <Tooltip text="Sil">
                                <button
                                  type="button"
                                  onClick={async () => {
                                    await fetch(`/api/pages/${pg.id}`, { method: "DELETE" });
                                    pushToast("ok", "Sayfa silindi.");
                                    await loadAll();
                                  }}
                                  aria-label="Sil"
                                  className="p-2 rounded-lg text-neutral-400 hover:bg-red-50 hover:text-[#e60000]"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </Tooltip>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <Pagination
                totalItems={pages.length}
                pageSize={PAGE_SIZE}
                currentPage={customPageNum}
                onPageChange={setCustomPageNum}
              />
            </div>
          )}

          {/* VISITORS LOGS */}
          {section === "visitors" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-2xl bg-white p-5 border border-neutral-200 shadow-xs">
                  <p className="text-xs font-semibold text-neutral-500">Toplam Ziyaret</p>
                  <p className="mt-2 text-2xl font-black text-[#0d0d0d]">
                    {visitorStats.totalVisits}
                  </p>
                </div>
                <div className="rounded-2xl bg-white p-5 border border-neutral-200 shadow-xs">
                  <p className="text-xs font-semibold text-neutral-500">Tekil IP Adresi</p>
                  <p className="mt-2 text-2xl font-black text-[#e60000]">
                    {visitorStats.uniqueIps}
                  </p>
                </div>
                <div className="rounded-2xl bg-white p-5 border border-neutral-200 shadow-xs">
                  <p className="text-xs font-semibold text-neutral-500">En Yoğun İl</p>
                  <p className="mt-2 text-lg font-extrabold text-[#0d0d0d] truncate">
                    {visitorStats.topCity}
                  </p>
                </div>
                <div className="rounded-2xl bg-white p-5 border border-neutral-200 shadow-xs">
                  <p className="text-xs font-semibold text-neutral-500">En Çok Kaynak</p>
                  <p className="mt-2 text-lg font-extrabold text-[#007c92] truncate">
                    {visitorStats.topReferrer}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl bg-white border border-neutral-200 shadow-xs overflow-hidden">
                <div className="p-5 border-b border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-base font-extrabold text-[#0d0d0d]">
                      Canlı Ziyaretçi Kayıtları ({filteredVisitors.length})
                    </h2>
                    <p className="text-xs text-neutral-500">
                      IP adresi, il/ülke, geldiği kaynak (referrer), gezdiği sayfa ve cihaz bilgisi.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
                      <input
                        value={visitorSearch}
                        onChange={(e) => {
                          setVisitorSearch(e.target.value);
                          setVisitorPage(1);
                        }}
                        placeholder="IP, il, sayfa ara..."
                        className="rounded-xl border border-neutral-300 pl-8 pr-3 py-2 text-xs outline-none focus:border-[#e60000]"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => void loadAll()}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-300 bg-white px-3 py-2 text-xs font-bold text-neutral-700 hover:bg-neutral-50"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      <span>Yenile</span>
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-neutral-50 text-xs uppercase text-neutral-500 border-b border-neutral-200">
                      <tr>
                        <th className="px-4 py-3">IP Adresi</th>
                        <th className="px-4 py-3">İl / Ülke</th>
                        <th className="px-4 py-3">Nereden Geldi</th>
                        <th className="px-4 py-3">Gezilen Sayfa</th>
                        <th className="px-4 py-3">Cihaz</th>
                        <th className="px-4 py-3">Tarih</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200">
                      {pagedVisitors.map((v) => (
                        <tr key={v.id} className="hover:bg-neutral-50">
                          <td className="px-4 py-3 font-mono text-xs font-bold text-[#0d0d0d]">
                            {v.ipAddress}
                          </td>
                          <td className="px-4 py-3 text-xs">
                            <p className="font-bold text-[#0d0d0d]">{v.city}</p>
                            <p className="text-neutral-500">
                              {v.country}
                              {v.isp ? ` • ${v.isp}` : ""}
                            </p>
                          </td>
                          <td className="px-4 py-3 text-xs text-[#007c92] max-w-[200px] truncate">
                            {v.referrer}
                          </td>
                          <td className="px-4 py-3 font-mono text-xs text-neutral-700">
                            {v.path}
                          </td>
                          <td className="px-4 py-3 text-xs font-semibold text-neutral-600">
                            {v.deviceType}
                          </td>
                          <td className="px-4 py-3 text-xs text-neutral-500 whitespace-nowrap">
                            {new Date(v.createdAt).toLocaleString("tr-TR")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <Pagination
                  totalItems={filteredVisitors.length}
                  pageSize={PAGE_SIZE}
                  currentPage={visitorPage}
                  onPageChange={setVisitorPage}
                />
              </div>
            </div>
          )}

          {/* BRAND, LOGO & WHATSAPP */}
          {section === "brand" && settings && (
            <form
              onSubmit={handleSaveSettings}
              className="rounded-2xl bg-white p-6 sm:p-8 border border-neutral-200 shadow-xs space-y-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-extrabold text-[#0d0d0d]">
                    Marka, Logo (MinIO), Site Adresi &amp; WhatsApp Ayarları
                  </h2>
                  <p className="text-xs text-neutral-500">
                    Logo sadece dosya seçerek MinIO üzerine yüklenir.
                  </p>
                </div>
                <button
                  type="submit"
                  disabled={savingSettings}
                  className="rounded-xl bg-[#e60000] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#bd0000] disabled:opacity-60"
                >
                  {savingSettings ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <label className="block text-xs font-bold mb-1">Marka / Firma Adı</label>
                  <input
                    required
                    value={settings.brandName}
                    onChange={(e) => setSettings({ ...settings, brandName: e.target.value })}
                    className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">Slogan</label>
                  <input
                    required
                    value={settings.tagline}
                    onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                    className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">Site Adresi (Domain URL)</label>
                  <input
                    required
                    type="url"
                    value={settings.siteUrl}
                    onChange={(e) => setSettings({ ...settings, siteUrl: e.target.value })}
                    className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <ImageUploadField
                    label="Mağaza Logosu (MinIO)"
                    value={settings.logoUrl}
                    onChange={(url) => setSettings({ ...settings, logoUrl: url })}
                  />
                </div>
                <div>
                  <ImageUploadField
                    label="Site Favicon (MinIO - ICO/PNG/SVG)"
                    value={settings.faviconUrl}
                    onChange={(url) => setSettings({ ...settings, faviconUrl: url })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">Instagram URL</label>
                  <input
                    value={settings.instagramUrl}
                    onChange={(e) => setSettings({ ...settings, instagramUrl: e.target.value })}
                    className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">Telefon</label>
                  <input
                    required
                    value={settings.phone}
                    onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                    className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">WhatsApp Numarası (905XXXXXXXXX)</label>
                  <input
                    required
                    value={settings.whatsappPhone}
                    onChange={(e) => setSettings({ ...settings, whatsappPhone: e.target.value })}
                    className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">E-posta</label>
                  <input
                    required
                    type="email"
                    value={settings.email}
                    onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                    className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold mb-1">WhatsApp Karşılama Mesajı</label>
                  <input
                    required
                    value={settings.whatsappMessage}
                    onChange={(e) => setSettings({ ...settings, whatsappMessage: e.target.value })}
                    className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">Çalışma Saatleri</label>
                  <input
                    required
                    value={settings.workingHours}
                    onChange={(e) => setSettings({ ...settings, workingHours: e.target.value })}
                    className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm"
                  />
                </div>
                <div className="sm:col-span-3">
                  <label className="block text-xs font-bold mb-1">Mağaza Adresi</label>
                  <input
                    required
                    value={settings.address}
                    onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                    className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm"
                  />
                </div>
              </div>
            </form>
          )}

          {/* SEO & GEO */}
          {section === "seo" && settings && (
            <form
              onSubmit={handleSaveSettings}
              className="rounded-2xl bg-white p-6 sm:p-8 border border-neutral-200 shadow-xs space-y-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-extrabold text-[#0d0d0d]">
                    SEO, GEO &amp; Cookiebot Ayarları
                  </h2>
                  <p className="text-xs text-neutral-500">
                    Google meta etiketleri, AI arama (/llms.txt), Schema.org ve Cookiebot ID.
                  </p>
                </div>
                <button
                  type="submit"
                  disabled={savingSettings}
                  className="rounded-xl bg-[#e60000] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#bd0000] disabled:opacity-60"
                >
                  {savingSettings ? "Kaydediliyor..." : "SEO & GEO Kaydet"}
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold mb-1">SEO Meta Başlık (Title)</label>
                  <input
                    required
                    value={settings.seoTitle}
                    onChange={(e) => setSettings({ ...settings, seoTitle: e.target.value })}
                    className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <ImageUploadField
                    label="OG Sosyal Paylaşım Görseli (MinIO)"
                    value={settings.ogImageUrl}
                    onChange={(url) => setSettings({ ...settings, ogImageUrl: url })}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold mb-1">SEO Meta Açıklama (Description)</label>
                  <textarea
                    required
                    rows={3}
                    value={settings.seoDescription}
                    onChange={(e) => setSettings({ ...settings, seoDescription: e.target.value })}
                    className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">Anahtar Kelimeler</label>
                  <input
                    value={settings.seoKeywords}
                    onChange={(e) => setSettings({ ...settings, seoKeywords: e.target.value })}
                    className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">Cookiebot Domain Group ID</label>
                  <input
                    value={settings.cookiebotId}
                    onChange={(e) => setSettings({ ...settings, cookiebotId: e.target.value })}
                    placeholder="Opsiyonel Cookiebot ID"
                    className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div className="border-t border-neutral-200 pt-5 grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div>
                  <label className="block text-xs font-bold mb-1">İl (GEO)</label>
                  <input
                    required
                    value={settings.city}
                    onChange={(e) => setSettings({ ...settings, city: e.target.value })}
                    className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">İlçe (GEO)</label>
                  <input
                    required
                    value={settings.district}
                    onChange={(e) => setSettings({ ...settings, district: e.target.value })}
                    className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">Bölge Kodu</label>
                  <input
                    required
                    value={settings.geoRegion}
                    onChange={(e) => setSettings({ ...settings, geoRegion: e.target.value })}
                    className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">Enlem (Lat)</label>
                  <input
                    required
                    value={settings.geoLatitude}
                    onChange={(e) => setSettings({ ...settings, geoLatitude: e.target.value })}
                    className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">Boylam (Lng)</label>
                  <input
                    required
                    value={settings.geoLongitude}
                    onChange={(e) => setSettings({ ...settings, geoLongitude: e.target.value })}
                    className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-sm"
                  />
                </div>
              </div>
            </form>
          )}

          {/* MESSAGES TABLE */}
          {section === "messages" && (
            <div className="rounded-2xl bg-white border border-neutral-200 shadow-xs overflow-hidden">
              <div className="p-5 border-b border-neutral-200">
                <h2 className="text-base font-extrabold text-[#0d0d0d]">
                  İletişim Formu Mesajları ({messages.length})
                </h2>
              </div>
              {messages.length === 0 ? (
                <p className="p-6 text-sm text-neutral-500">Henüz gelen mesaj yok.</p>
              ) : (
                <div className="divide-y divide-neutral-200">
                  {messages.map((m) => (
                    <div
                      key={m.id}
                      className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        m.isRead ? "bg-white" : "bg-red-50/30"
                      }`}
                    >
                      <div>
                        <p className="text-sm font-bold text-[#0d0d0d]">
                          {m.subject} — {m.name} ({m.phone})
                        </p>
                        <p className="text-xs text-neutral-500">
                          {m.email || "E-posta yok"} •{" "}
                          {new Date(m.createdAt).toLocaleString("tr-TR")}
                        </p>
                        <p className="mt-1.5 text-sm text-neutral-700">{m.message}</p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <ToggleSwitch
                          checked={m.isRead}
                          label="Okundu durumu"
                          onChange={async () => {
                            await fetch(`/api/contact/${m.id}`, {
                              method: "PATCH",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ isRead: !m.isRead }),
                            });
                            await loadAll();
                          }}
                        />
                        <button
                          type="button"
                          onClick={async () => {
                            await fetch(`/api/contact/${m.id}`, { method: "DELETE" });
                            await loadAll();
                          }}
                          className="p-2 text-neutral-400 hover:text-[#e60000]"
                          aria-label="Mesajı sil"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* DIALOG: Campaign Add / Edit */}
      <AdminDialog
        open={campaignDialogOpen}
        title={campaignForm.id ? "Kampanyayı Düzenle" : "Yeni Kampanya Ekle"}
        onClose={() => setCampaignDialogOpen(false)}
      >
        <form onSubmit={handleSaveCampaignDialog} className="space-y-4">
          <input
            required
            value={campaignForm.title}
            onChange={(e) => setCampaignForm({ ...campaignForm, title: e.target.value })}
            placeholder="Kampanya Başlığı"
            className="w-full rounded-xl border border-neutral-300 px-3.5 py-2 text-sm"
          />
          <input
            required
            value={campaignForm.summary}
            onChange={(e) => setCampaignForm({ ...campaignForm, summary: e.target.value })}
            placeholder="Kısa Özet"
            className="w-full rounded-xl border border-neutral-300 px-3.5 py-2 text-sm"
          />
          <RichTextEditor
            label="Detaylı Açıklama (CKEditor)"
            value={campaignForm.description}
            onChange={(val) => setCampaignForm({ ...campaignForm, description: val })}
          />
          <ImageUploadField
            label="Kampanya Görseli (MinIO Dosya Yükleme)"
            value={campaignForm.imageUrl}
            onChange={(url) => setCampaignForm({ ...campaignForm, imageUrl: url })}
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <select
              value={campaignForm.categorySlug}
              onChange={(e) =>
                setCampaignForm({ ...campaignForm, categorySlug: e.target.value })
              }
              className="rounded-xl border border-neutral-300 bg-white px-3 py-2 text-xs font-semibold"
            >
              {CAMPAIGN_CATEGORIES.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
            <input
              value={campaignForm.badgeLabel}
              onChange={(e) =>
                setCampaignForm({ ...campaignForm, badgeLabel: e.target.value })
              }
              placeholder="Rozet (Örn: Yeni)"
              className="rounded-xl border border-neutral-300 px-3 py-2 text-xs"
            />
          </div>
          <input
            value={campaignForm.tagsText}
            onChange={(e) => setCampaignForm({ ...campaignForm, tagsText: e.target.value })}
            placeholder="Etiketler (virgülle ayırın)"
            className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-xs"
          />
          <div className="flex items-center justify-between pt-2 border-t border-neutral-200">
            <label className="flex items-center gap-2 text-xs font-bold">
              <ToggleSwitch
                checked={campaignForm.isActive}
                label="Kampanya aktif"
                onChange={() =>
                  setCampaignForm({ ...campaignForm, isActive: !campaignForm.isActive })
                }
              />
              <span>Yayında</span>
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setCampaignDialogOpen(false)}
                className="rounded-xl border border-neutral-300 px-4 py-2 text-xs font-bold"
              >
                İptal
              </button>
              <button
                type="submit"
                className="rounded-xl bg-[#e60000] px-5 py-2 text-xs font-bold text-white hover:bg-[#bd0000]"
              >
                {campaignForm.id ? "Güncelle" : "Kaydet"}
              </button>
            </div>
          </div>
        </form>
      </AdminDialog>

      {/* DIALOG: Product Add / Edit */}
      <AdminDialog
        open={productDialogOpen}
        title={productForm.id ? "Ürünü Düzenle" : "Yeni Ürün / Tarife Ekle"}
        onClose={() => setProductDialogOpen(false)}
      >
        <form onSubmit={handleSaveProductDialog} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              required
              value={productForm.title}
              onChange={(e) => setProductForm({ ...productForm, title: e.target.value })}
              placeholder="Ürün / Tarife Adı"
              className="rounded-xl border border-neutral-300 px-3.5 py-2 text-sm"
            />
            <input
              required
              value={productForm.brand}
              onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
              placeholder="Marka"
              className="rounded-xl border border-neutral-300 px-3.5 py-2 text-sm"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <select
              value={productForm.category}
              onChange={(e) =>
                setProductForm({
                  ...productForm,
                  category: e.target.value as ProductDto["category"],
                })
              }
              className="rounded-xl border border-neutral-300 bg-white px-3 py-2 text-xs font-semibold"
            >
              <option value="DEVICE">Telefon / Cihaz</option>
              <option value="TARIFF">Mobil Tarife</option>
              <option value="HOME_INTERNET">Ev İnterneti</option>
              <option value="ACCESSORY">Aksesuar</option>
            </select>
            <input
              value={productForm.subtitle}
              onChange={(e) => setProductForm({ ...productForm, subtitle: e.target.value })}
              placeholder="Alt Başlık"
              className="rounded-xl border border-neutral-300 px-3.5 py-2 text-xs"
            />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <input
              required
              type="number"
              value={productForm.price}
              onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
              placeholder="Peşin Fiyat"
              className="rounded-xl border border-neutral-300 px-3 py-2 text-xs"
            />
            <input
              type="number"
              value={productForm.installmentPrice}
              onChange={(e) =>
                setProductForm({ ...productForm, installmentPrice: e.target.value })
              }
              placeholder="Aylık Taksit"
              className="rounded-xl border border-neutral-300 px-3 py-2 text-xs"
            />
            <input
              type="number"
              value={productForm.installmentMonths}
              onChange={(e) =>
                setProductForm({ ...productForm, installmentMonths: e.target.value })
              }
              placeholder="Ay"
              className="rounded-xl border border-neutral-300 px-3 py-2 text-xs"
            />
            <input
              required
              type="number"
              value={productForm.stock}
              onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
              placeholder="Stok"
              className="rounded-xl border border-neutral-300 px-3 py-2 text-xs"
            />
          </div>
          <RichTextEditor
            label="Ürün Açıklaması (CKEditor)"
            value={productForm.description}
            onChange={(val) => setProductForm({ ...productForm, description: val })}
          />
          <ImageUploadField
            label="Ürün Görseli (MinIO Dosya Yükleme)"
            value={productForm.imageUrl}
            onChange={(url) => setProductForm({ ...productForm, imageUrl: url })}
            required
          />
          <div className="flex items-center justify-between pt-2 border-t border-neutral-200">
            <label className="flex items-center gap-2 text-xs font-bold">
              <ToggleSwitch
                checked={productForm.isActive}
                label="Ürün aktif"
                onChange={() =>
                  setProductForm({ ...productForm, isActive: !productForm.isActive })
                }
              />
              <span>Satışta</span>
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setProductDialogOpen(false)}
                className="rounded-xl border border-neutral-300 px-4 py-2 text-xs font-bold"
              >
                İptal
              </button>
              <button
                type="submit"
                className="rounded-xl bg-[#e60000] px-5 py-2 text-xs font-bold text-white hover:bg-[#bd0000]"
              >
                {productForm.id ? "Güncelle" : "Kaydet"}
              </button>
            </div>
          </div>
        </form>
      </AdminDialog>

      {/* DIALOG: Branch Add / Edit */}
      <AdminDialog
        open={branchDialogOpen}
        title={branchForm.id ? "Şubeyi Düzenle" : "Yeni Şube Ekle"}
        onClose={() => setBranchDialogOpen(false)}
      >
        <form onSubmit={handleSaveBranchDialog} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              required
              value={branchForm.name}
              onChange={(e) => setBranchForm({ ...branchForm, name: e.target.value })}
              placeholder="Şube Adı (Örn: BALIKLI ŞUBESİ)"
              className="sm:col-span-2 rounded-xl border border-neutral-300 px-3.5 py-2 text-sm"
            />
            <input
              type="number"
              value={branchForm.sortOrder}
              onChange={(e) => setBranchForm({ ...branchForm, sortOrder: e.target.value })}
              placeholder="Sıra"
              className="rounded-xl border border-neutral-300 px-3.5 py-2 text-sm"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              required
              value={branchForm.city}
              onChange={(e) => setBranchForm({ ...branchForm, city: e.target.value })}
              placeholder="İl (Gaziantep)"
              className="rounded-xl border border-neutral-300 px-3.5 py-2 text-sm"
            />
            <input
              value={branchForm.district}
              onChange={(e) => setBranchForm({ ...branchForm, district: e.target.value })}
              placeholder="İlçe (Şahinbey / Şehitkamil)"
              className="rounded-xl border border-neutral-300 px-3.5 py-2 text-sm"
            />
          </div>
          <textarea
            rows={2}
            value={branchForm.address}
            onChange={(e) => setBranchForm({ ...branchForm, address: e.target.value })}
            placeholder="Açık Şube Adresi"
            className="w-full rounded-xl border border-neutral-300 px-3.5 py-2 text-sm"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              value={branchForm.phone}
              onChange={(e) => setBranchForm({ ...branchForm, phone: e.target.value })}
              placeholder="Telefon"
              className="rounded-xl border border-neutral-300 px-3.5 py-2 text-sm"
            />
            <input
              value={branchForm.whatsappPhone}
              onChange={(e) => setBranchForm({ ...branchForm, whatsappPhone: e.target.value })}
              placeholder="WhatsApp (905XXXXXXXXX)"
              className="rounded-xl border border-neutral-300 px-3.5 py-2 text-sm"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              value={branchForm.workingHours}
              onChange={(e) => setBranchForm({ ...branchForm, workingHours: e.target.value })}
              placeholder="Çalışma Saatleri (09:00 - 20:00)"
              className="rounded-xl border border-neutral-300 px-3.5 py-2 text-sm"
            />
            <input
              type="url"
              value={branchForm.mapUrl}
              onChange={(e) => setBranchForm({ ...branchForm, mapUrl: e.target.value })}
              placeholder="Google Haritalar URL (opsiyonel)"
              className="rounded-xl border border-neutral-300 px-3.5 py-2 text-sm"
            />
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-neutral-200">
            <label className="flex items-center gap-2 text-xs font-bold">
              <ToggleSwitch
                checked={branchForm.isActive}
                label="Şube aktif"
                onChange={() =>
                  setBranchForm({ ...branchForm, isActive: !branchForm.isActive })
                }
              />
              <span>Aktif Şube</span>
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setBranchDialogOpen(false)}
                className="rounded-xl border border-neutral-300 px-4 py-2 text-xs font-bold"
              >
                İptal
              </button>
              <button
                type="submit"
                className="rounded-xl bg-[#e60000] px-5 py-2 text-xs font-bold text-white hover:bg-[#bd0000]"
              >
                {branchForm.id ? "Güncelle" : "Kaydet"}
              </button>
            </div>
          </div>
        </form>
      </AdminDialog>

      {/* DIALOG: Blog Add / Edit */}
      <AdminDialog
        open={blogDialogOpen}
        title={blogForm.id ? "Blog Yazısını Düzenle" : "Yeni Blog Yazısı Ekle"}
        onClose={() => setBlogDialogOpen(false)}
      >
        <form onSubmit={handleSaveBlogDialog} className="space-y-4">
          <input
            required
            value={blogForm.title}
            onChange={(e) => setBlogForm({ ...blogForm, title: e.target.value })}
            placeholder="Yazı Başlığı"
            className="w-full rounded-xl border border-neutral-300 px-3.5 py-2 text-sm"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              value={blogForm.category}
              onChange={(e) => setBlogForm({ ...blogForm, category: e.target.value })}
              placeholder="Kategori"
              className="rounded-xl border border-neutral-300 px-3.5 py-2 text-sm"
            />
            <input
              value={blogForm.author}
              onChange={(e) => setBlogForm({ ...blogForm, author: e.target.value })}
              placeholder="Yazar"
              className="rounded-xl border border-neutral-300 px-3.5 py-2 text-sm"
            />
          </div>
          <input
            required
            value={blogForm.excerpt}
            onChange={(e) => setBlogForm({ ...blogForm, excerpt: e.target.value })}
            placeholder="Kısa Özet"
            className="w-full rounded-xl border border-neutral-300 px-3.5 py-2 text-sm"
          />
          <RichTextEditor
            label="Yazı İçeriği (CKEditor)"
            value={blogForm.content}
            onChange={(val) => setBlogForm({ ...blogForm, content: val })}
          />
          <ImageUploadField
            label="Kapak Görseli (MinIO Dosya Yükleme)"
            value={blogForm.coverImageUrl}
            onChange={(url) => setBlogForm({ ...blogForm, coverImageUrl: url })}
          />
          <div className="flex items-center justify-between pt-2 border-t border-neutral-200">
            <label className="flex items-center gap-2 text-xs font-bold">
              <ToggleSwitch
                checked={blogForm.isPublished}
                label="Yazı yayında"
                onChange={() =>
                  setBlogForm({ ...blogForm, isPublished: !blogForm.isPublished })
                }
              />
              <span>Yayında</span>
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setBlogDialogOpen(false)}
                className="rounded-xl border border-neutral-300 px-4 py-2 text-xs font-bold"
              >
                İptal
              </button>
              <button
                type="submit"
                className="rounded-xl bg-[#e60000] px-5 py-2 text-xs font-bold text-white hover:bg-[#bd0000]"
              >
                {blogForm.id ? "Güncelle" : "Yayınla"}
              </button>
            </div>
          </div>
        </form>
      </AdminDialog>

      {/* DIALOG: FAQ Add / Edit */}
      <AdminDialog
        open={faqDialogOpen}
        title={faqForm.id ? "Soruyu Düzenle" : "Yeni SSS Sorusu Ekle"}
        onClose={() => setFaqDialogOpen(false)}
      >
        <form onSubmit={handleSaveFaqDialog} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              required
              value={faqForm.category}
              onChange={(e) => setFaqForm({ ...faqForm, category: e.target.value })}
              placeholder="Kategori (Genel, Teslimat...)"
              className="sm:col-span-2 rounded-xl border border-neutral-300 px-3.5 py-2 text-sm"
            />
            <input
              type="number"
              value={faqForm.sortOrder}
              onChange={(e) => setFaqForm({ ...faqForm, sortOrder: e.target.value })}
              placeholder="Sıra"
              className="rounded-xl border border-neutral-300 px-3.5 py-2 text-sm"
            />
          </div>
          <input
            required
            value={faqForm.question}
            onChange={(e) => setFaqForm({ ...faqForm, question: e.target.value })}
            placeholder="Soru"
            className="w-full rounded-xl border border-neutral-300 px-3.5 py-2 text-sm"
          />
          <textarea
            required
            rows={5}
            value={faqForm.answer}
            onChange={(e) => setFaqForm({ ...faqForm, answer: e.target.value })}
            placeholder="Cevap"
            className="w-full rounded-xl border border-neutral-300 px-3.5 py-2 text-sm"
          />
          <div className="flex items-center justify-between pt-2 border-t border-neutral-200">
            <label className="flex items-center gap-2 text-xs font-bold">
              <ToggleSwitch
                checked={faqForm.isActive}
                label="Soru aktif"
                onChange={() =>
                  setFaqForm({ ...faqForm, isActive: !faqForm.isActive })
                }
              />
              <span>Yayında</span>
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setFaqDialogOpen(false)}
                className="rounded-xl border border-neutral-300 px-4 py-2 text-xs font-bold"
              >
                İptal
              </button>
              <button
                type="submit"
                className="rounded-xl bg-[#e60000] px-5 py-2 text-xs font-bold text-white hover:bg-[#bd0000]"
              >
                {faqForm.id ? "Güncelle" : "Kaydet"}
              </button>
            </div>
          </div>
        </form>
      </AdminDialog>

      {/* DIALOG: Custom Page Add / Edit */}
      <AdminDialog
        open={pageDialogOpen}
        title={pageForm.id ? "Sayfayı Düzenle" : "Yeni Sayfa Oluştur"}
        onClose={() => setPageDialogOpen(false)}
      >
        <form onSubmit={handleSavePageDialog} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              required
              value={pageForm.title}
              onChange={(e) => setPageForm({ ...pageForm, title: e.target.value })}
              placeholder="Sayfa Başlığı"
              className="rounded-xl border border-neutral-300 px-3.5 py-2 text-sm"
            />
            <input
              value={pageForm.slug}
              onChange={(e) => setPageForm({ ...pageForm, slug: e.target.value })}
              placeholder="URL Slug (opsiyonel)"
              className="rounded-xl border border-neutral-300 px-3.5 py-2 text-sm"
            />
          </div>
          <input
            value={pageForm.summary}
            onChange={(e) => setPageForm({ ...pageForm, summary: e.target.value })}
            placeholder="Kısa Özet"
            className="w-full rounded-xl border border-neutral-300 px-3.5 py-2 text-sm"
          />
          <RichTextEditor
            label="Sayfa İçeriği (CKEditor)"
            value={pageForm.content}
            onChange={(val) => setPageForm({ ...pageForm, content: val })}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              value={pageForm.metaTitle}
              onChange={(e) => setPageForm({ ...pageForm, metaTitle: e.target.value })}
              placeholder="SEO Meta Başlık"
              className="rounded-xl border border-neutral-300 px-3 py-2 text-xs"
            />
            <input
              value={pageForm.metaDescription}
              onChange={(e) =>
                setPageForm({ ...pageForm, metaDescription: e.target.value })
              }
              placeholder="SEO Meta Açıklama"
              className="rounded-xl border border-neutral-300 px-3 py-2 text-xs"
            />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-neutral-200">
            <div className="flex items-center gap-4 text-xs font-semibold">
              <label className="flex items-center gap-1.5">
                <input
                  type="checkbox"
                  checked={pageForm.showInHeader}
                  onChange={(e) =>
                    setPageForm({ ...pageForm, showInHeader: e.target.checked })
                  }
                />
                <span>Üst Menü</span>
              </label>
              <label className="flex items-center gap-1.5">
                <input
                  type="checkbox"
                  checked={pageForm.showInFooter}
                  onChange={(e) =>
                    setPageForm({ ...pageForm, showInFooter: e.target.checked })
                  }
                />
                <span>Footer</span>
              </label>
              <label className="flex items-center gap-1.5">
                <ToggleSwitch
                  checked={pageForm.isPublished}
                  label="Sayfa yayın durumu"
                  onChange={() =>
                    setPageForm({ ...pageForm, isPublished: !pageForm.isPublished })
                  }
                />
                <span>Yayında</span>
              </label>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPageDialogOpen(false)}
                className="rounded-xl border border-neutral-300 px-4 py-2 text-xs font-bold"
              >
                İptal
              </button>
              <button
                type="submit"
                className="rounded-xl bg-[#e60000] px-5 py-2 text-xs font-bold text-white hover:bg-[#bd0000]"
              >
                {pageForm.id ? "Güncelle" : "Yayınla"}
              </button>
            </div>
          </div>
        </form>
      </AdminDialog>
    </div>
  );
}
