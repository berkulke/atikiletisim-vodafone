import bcrypt from "bcryptjs";
import { PrismaClient, ProductCategory } from "@prisma/client";
import { syncVodafoneCampaigns } from "../src/lib/sync/campaign-sync";

const prisma = new PrismaClient();

const INITIAL_PRODUCTS: Array<{
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  category: ProductCategory;
  brand: string;
  price: number;
  installmentPrice: number | null;
  installmentMonths: number | null;
  specs: Record<string, string>;
  imageUrl: string;
  stock: number;
  isFeatured: boolean;
}> = [
  {
    slug: "iphone-16-pro-256gb",
    title: "iPhone 16 Pro 256 GB",
    subtitle: "A18 Pro Çip • Titanyum Tasarım • 5G",
    description:
      "Vodafone Online Mağaza'ya özel faturaya ek 12 ay taksit veya peşin ödeme avantajıyla iPhone 16 Pro 256 GB.",
    category: "DEVICE",
    brand: "Apple",
    price: 89999,
    installmentPrice: 8299,
    installmentMonths: 12,
    specs: { Depolama: "256 GB", Ekran: '6.3" Super Retina', Bağlantı: "5G" },
    imageUrl:
      "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80",
    stock: 45,
    isFeatured: true,
  },
  {
    slug: "samsung-galaxy-s25-ultra-512gb",
    title: "Samsung Galaxy S25 Ultra 512 GB",
    subtitle: "Galaxy AI • 200 MP Kamera • S Pen",
    description:
      "Yapay zeka destekli profesyonel kamera ve titanyum gövdeyle Galaxy S25 Ultra şimdi Vodafone'da.",
    category: "DEVICE",
    brand: "Samsung",
    price: 78999,
    installmentPrice: 7199,
    installmentMonths: 12,
    specs: { Depolama: "512 GB", Kamera: "200 MP", Bağlantı: "5G" },
    imageUrl:
      "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=800&q=80",
    stock: 60,
    isFeatured: true,
  },
  {
    slug: "red-sinirsiz-sosyal-60gb",
    title: "Vodafone Red Sınırsız Sosyal 60 GB",
    subtitle: "60 GB İnternet + Sınırsız WhatsApp, Instagram, YouTube",
    description:
      "Sosyal medyada kotanızdan yemeyen, yurtdışında da geçerli Red ayrıcalıklarıyla dolu faturalı tarife.",
    category: "TARIFF",
    brand: "Vodafone Red",
    price: 690,
    installmentPrice: null,
    installmentMonths: null,
    specs: { İnternet: "60 GB", Konuşma: "3000 DK", Sosyal: "Sınırsız" },
    imageUrl:
      "https://cms.vodafone.com.tr/static/img/neo/featured-campaigns/26-11/03/yemeksepeti_1012x674-1793684776.png",
    stock: 999,
    isFeatured: true,
  },
  {
    slug: "freezone-genc-25gb",
    title: "FreeZone Genç 25 GB Tarifesi",
    subtitle: "25 GB + Sınırsız İletişim Uygulamaları",
    description:
      "26 yaş altı gençlere özel FreeZone dünyası: oyun, müzik ve marka indirimleri bir arada.",
    category: "TARIFF",
    brand: "Vodafone FreeZone",
    price: 390,
    installmentPrice: null,
    installmentMonths: null,
    specs: { İnternet: "25 GB", Konuşma: "1500 DK", SMS: "250 SMS" },
    imageUrl:
      "https://cms.vodafone.com.tr/static/img/neo/featured-campaigns/26-11/03/coffy_1012x674-1793684805.png",
    stock: 999,
    isFeatured: true,
  },
  {
    slug: "vodafone-fiber-1000-mbps",
    title: "Vodafone Ev İnterneti 1000 Mbps Fiber",
    subtitle: "30 Gün Memnuniyet Garantisi • Ücretsiz Kurulum",
    description:
      "Mobil faturalı Vodafone'lulara özel ek indirimli ultra hızlı limitsiz fiber ev interneti.",
    category: "HOME_INTERNET",
    brand: "Vodafone Fiber",
    price: 599,
    installmentPrice: null,
    installmentMonths: null,
    specs: { Hız: "1000 Mbps", Kota: "Limitsiz", Modem: "Wi-Fi 6 Dahil" },
    imageUrl:
      "https://cms.vodafone.com.tr/static/img/neo/featured-campaigns/26-11/03/migros_1012x674-1793684853.png",
    stock: 999,
    isFeatured: true,
  },
  {
    slug: "airpods-pro-2-usb-c",
    title: "Apple AirPods Pro 2 (USB-C)",
    subtitle: "Aktif Gürültü Engelleme • MagSafe Şarj",
    description:
      "Faturaya ek ödeme kolaylığıyla Apple AirPods Pro 2. nesil kablosuz kulaklık.",
    category: "ACCESSORY",
    brand: "Apple",
    price: 10999,
    installmentPrice: 999,
    installmentMonths: 12,
    specs: { ANC: "Aktif", Şarj: "USB-C / MagSafe", Pil: "30 Saat" },
    imageUrl:
      "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=800&q=80",
    stock: 80,
    isFeatured: true,
  },
];

async function main() {
  const adminEmail = (process.env.ADMIN_EMAIL || "admin@vodafone-clone.local").toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || "VodafoneAdmin2026!";
  const passwordHash = await bcrypt.hash(adminPassword, 12);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { passwordHash },
    create: {
      email: adminEmail,
      name: "Vodafone Sistem Yöneticisi",
      passwordHash,
      role: "ADMIN",
    },
  });

  for (const product of INITIAL_PRODUCTS) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: product,
      create: product,
    });
  }

  await prisma.siteSettings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      brandName: "Atik İletişim",
      tagline: "Vodafone Yetkili Satış & İletişim Merkezi",
      siteUrl: "https://atikiletisim.com",
      instagramUrl: "https://www.instagram.com/atikiletisim/",
      city: "Gaziantep",
      district: "Şahinbey",
      geoRegion: "TR-27",
      geoLatitude: "37.0662",
      geoLongitude: "37.3833",
    },
  });

  const GAZIANTEP_BRANCHES = [
    { name: "BALIKLI ŞUBESİ", district: "Şahinbey", sortOrder: 1 },
    { name: "HEYKEL ŞUBESİ", district: "Şahinbey", sortOrder: 2 },
    { name: "KARAGÖZ ŞUBESİ", district: "Şahinbey", sortOrder: 3 },
    { name: "DÜZTEPE ŞUBESİ", district: "Şahinbey", sortOrder: 4 },
    { name: "KARŞIYAKA ŞUBESİ", district: "Şehitkamil", sortOrder: 5 },
    { name: "KAYAÖNÜ ŞUBESİ", district: "Şehitkamil", sortOrder: 6 },
    { name: "GAZİKENT ŞUBESİ", district: "Şehitkamil", sortOrder: 7 },
    { name: "CUMHURİYET ŞUBESİ", district: "Şahinbey", sortOrder: 8 },
    { name: "KARATAŞ ŞUBESİ", district: "Şahinbey", sortOrder: 9 },
    { name: "PRİMEMALL ŞUBESİ", district: "Şehitkamil", sortOrder: 10 },
  ];

  const existingBranches = await prisma.branch.count();
  if (existingBranches === 0) {
    await prisma.branch.createMany({
      data: GAZIANTEP_BRANCHES.map((b) => ({
        name: b.name,
        city: "Gaziantep",
        district: b.district,
        address: `${b.name.replace(" ŞUBESİ", "")} Mevkii, ${b.district} / Gaziantep`,
        workingHours: "09:00 - 20:00",
        sortOrder: b.sortOrder,
        isActive: true,
      })),
    });
  }

  await prisma.customPage.upsert({
    where: { slug: "hakkimizda" },
    update: {},
    create: {
      slug: "hakkimizda",
      title: "Hakkımızda",
      summary: "Atik İletişim — Gaziantep'in Güvenilir Vodafone Yetkili Satış ve İletişim Merkezi",
      content:
        "<h2>Atik İletişim Kimdir?</h2><p>Atik İletişim olarak Gaziantep genelindeki 10 şubemizle bireysel ve kurumsal müşterilerimize Vodafone Türkiye güvencesiyle mobil hat, faturalı/faturasız tarifeler, fiber ev interneti ve akıllı cihaz çözümleri sunuyoruz.</p><p>Müşteri memnuniyetini merkeze alan hizmet anlayışımızla, en güncel Vodafone kampanyalarını ve faturaya ek cihaz fırsatlarını şubelerimizde ve online mağazamızda sizlerle buluşturuyoruz.</p>",
      metaTitle: "Hakkımızda | Atik İletişim",
      metaDescription:
        "Atik İletişim Gaziantep Vodafone Yetkili Satış Noktaları hakkında kurumsal bilgi.",
      showInHeader: false,
      showInFooter: false,
      isPublished: true,
    },
  });

  await prisma.customPage.upsert({
    where: { slug: "misyon-vizyon" },
    update: {},
    create: {
      slug: "misyon-vizyon",
      title: "Misyon & Vizyon",
      summary: "Teknolojiyi herkes için erişilebilir, şeffaf ve hızlı kılma hedefimiz.",
      content:
        "<h2>Misyonumuz</h2><p>Gaziantep'in her noktasında müşterilerimize ihtiyaçlarına en uygun iletişim çözümlerini, şeffaf fiyatlandırma ve uzman danışmanlıkla ulaştırmak.</p><h2>Vizyonumuz</h2><p>Bölgenin dijital dönüşümüne liderlik eden, hem fiziksel şubeleriyle hem de online satış kanallarıyla Türkiye'nin örnek telekomünikasyon perakende markası olmak.</p>",
      metaTitle: "Misyon & Vizyon | Atik İletişim",
      metaDescription: "Atik İletişim misyonu, vizyonu ve kurumsal değerleri.",
      showInHeader: false,
      showInFooter: false,
      isPublished: true,
    },
  });

  const existingFaqs = await prisma.faqItem.count();
  if (existingFaqs === 0) {
    await prisma.faqItem.createMany({
      data: [
        {
          question: "Faturaya ek cihaz almak için şartlar nelerdir?",
          answer:
            "Aktif bir Vodafone faturalı hattınızın bulunması ve kredi/puanlama kriterlerini sağlamanız yeterlidir. Şubelerimizden veya online sepetinizden 12 aya varan taksitlerle cihaz alabilirsiniz.",
          category: "Cihaz & Satış",
          sortOrder: 1,
        },
        {
          question: "Online verdiğim sipariş kaç günde teslim edilir?",
          answer:
            "Gaziantep içi siparişleriniz aynı gün veya ertesi iş günü kuryemizle ücretsiz olarak adresinize teslim edilir. Sipariş Takip sayfasından anlık durumunuzu görebilirsiniz.",
          category: "Teslimat",
          sortOrder: 2,
        },
        {
          question: "Kampanyalar ne sıklıkla güncelleniyor?",
          answer:
            "Sitemizdeki kampanyalar Vodafone Türkiye ile otomatik olarak senkronize edilmekte, ayrıca Atik İletişim şubelerimize özel ek fırsatlar anlık olarak yayınlanmaktadır.",
          category: "Kampanyalar",
          sortOrder: 3,
        },
        {
          question: "Numaramı Vodafone'a nasıl taşıyabilirim?",
          answer:
            "Online mağazamızdan beğendiğiniz tarifeyi seçerek başvurabilir veya Gaziantep'teki 10 şubemizden herhangi birini ziyaret ederek numara taşıma işleminizi dakikalar içinde tamamlayabilirsiniz.",
          category: "Tarife & Hat",
          sortOrder: 4,
        },
      ],
    });
  }

  const existingPosts = await prisma.blogPost.count();
  if (existingPosts === 0) {
    await prisma.blogPost.createMany({
      data: [
        {
          slug: "gaziantep-fiber-ev-interneti-hiz-rehberi",
          title: "Gaziantep'te Fiber Ev İnterneti Seçerken Dikkat Edilmesi Gerekenler",
          excerpt:
            "1000 Mbps'e varan fiber hızlar, Wi-Fi 6 modem avantajı ve mobil faturalı Vodafone'lulara özel indirimler.",
          content:
            "<h2>Yüksek Hızlı Fiber Deneyimi</h2><p>Evden çalışma, 4K yayın ve çevrimiçi oyunlar için düşük gecikmeli fiber internet artık bir ihtiyaç. Vodafone Ev İnterneti paketleri, 30 gün memnuniyet garantisi ve ücretsiz kurulum avantajıyla sunulmaktadır.</p><p>Mobil hattınız Vodafone faturalı ise ev interneti paketlerinde ek indirimlerden yararlanabilirsiniz.</p>",
          coverImageUrl:
            "https://cms.vodafone.com.tr/static/img/neo/featured-campaigns/26-11/03/migros_1012x674-1793684853.png",
          category: "İnternet & Fiber",
          author: "Atik İletişim",
          isPublished: true,
        },
        {
          slug: "faturaya-ek-akilli-telefon-avantajlari",
          title: "Faturaya Ek Akıllı Telefon Almanın Avantajları Nelerdir?",
          excerpt:
            "Kredi kartı limitinizi doldurmadan, mevcut Vodafone faturanıza ek 12 ay taksitle yeni nesil akıllı telefon sahibi olun.",
          content:
            "<h2>Kredi Kartsız Kolay Ödeme</h2><p>Atik İletişim mağazalarımızda ve online vitrinimizde iPhone, Samsung ve Xiaomi modellerine faturaya ek ödeme kolaylığı ile ulaşabilirsiniz.</p>",
          coverImageUrl:
            "https://cms.vodafone.com.tr/static/img/neo/featured-campaigns/26-11/03/yemeksepeti_1012x674-1793684776.png",
          category: "Cihaz Rehberi",
          author: "Atik İletişim",
          isPublished: true,
        },
      ],
    });
  }

  console.log("Vodafone canlı kampanyaları senkronize ediliyor...");
  const syncResult = await syncVodafoneCampaigns();
  console.log("Kampanya senkronizasyon sonucu:", syncResult);
}

main()
  .catch((err) => {
    console.error("Seed hatası:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
