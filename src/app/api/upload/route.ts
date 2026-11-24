import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { uploadMediaToMinio } from "@/lib/minio";
import { slugifyTr } from "@/lib/slug";
import { containsDangerousSvgContent } from "@/lib/security";

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/svg+xml",
  "image/avif",
  "image/x-icon",
  "image/vnd.microsoft.icon",
]);

const MAX_BYTES = 5 * 1024 * 1024;

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Yüklenecek görsel dosyası bulunamadı" },
        { status: 400 }
      );
    }

    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: "Sadece JPG, PNG, WEBP, AVIF veya SVG görselleri yüklenebilir" },
        { status: 400 }
      );
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: "Dosya boyutu 5 MB sınırını aşamaz" },
        { status: 400 }
      );
    }

    const ext = file.name.split(".").pop()?.toLowerCase() || "png";
    const baseName = slugifyTr(file.name.replace(/\.[^.]+$/, "")) || "gorsel";
    const objectName = `uploads/${Date.now()}-${baseName}.${ext}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (file.type === "image/svg+xml" && containsDangerousSvgContent(buffer.toString("utf8"))) {
      return NextResponse.json(
        { error: "Güvenlik nedeniyle betik içeren SVG dosyaları reddedildi" },
        { status: 400 }
      );
    }

    const url = await uploadMediaToMinio(buffer, objectName, file.type);

    return NextResponse.json({ url }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "MinIO görsel yükleme servisi şu an erişilebilir değil" },
      { status: 502 }
    );
  }
}
