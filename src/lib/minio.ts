import { Client } from "minio";

const globalForMinio = globalThis as unknown as {
  minioClient: Client | undefined;
  bucketReady: boolean | undefined;
};

function getMinioConfig() {
  return {
    endPoint: process.env.MINIO_ENDPOINT || "localhost",
    port: Number(process.env.MINIO_PORT || "9002"),
    useSSL: process.env.MINIO_USE_SSL === "true",
    accessKey: process.env.MINIO_ACCESS_KEY || "vodafone_minio",
    secretKey: process.env.MINIO_SECRET_KEY || "vodafone_minio_secret",
    bucket: process.env.MINIO_BUCKET || "vodafone-media",
    publicUrl: (process.env.MINIO_PUBLIC_URL || "http://localhost:9002").replace(/\/$/, ""),
  };
}

function getMinioClient(): Client {
  if (!globalForMinio.minioClient) {
    const cfg = getMinioConfig();
    globalForMinio.minioClient = new Client({
      endPoint: cfg.endPoint,
      port: cfg.port,
      useSSL: cfg.useSSL,
      accessKey: cfg.accessKey,
      secretKey: cfg.secretKey,
    });
  }
  return globalForMinio.minioClient;
}

async function ensurePublicBucket(client: Client, bucket: string): Promise<void> {
  if (globalForMinio.bucketReady) return;
  const exists = await client.bucketExists(bucket);
  if (!exists) {
    await client.makeBucket(bucket, "us-east-1");
  }
  const policy = {
    Version: "2012-10-17",
    Statement: [
      {
        Effect: "Allow",
        Principal: { AWS: ["*"] },
        Action: ["s3:GetObject"],
        Resource: [`arn:aws:s3:::${bucket}/*`],
      },
    ],
  };
  await client.setBucketPolicy(bucket, JSON.stringify(policy));
  globalForMinio.bucketReady = true;
}

export async function uploadMediaToMinio(
  buffer: Buffer,
  objectName: string,
  contentType: string
): Promise<string> {
  const cfg = getMinioConfig();
  const client = getMinioClient();
  await ensurePublicBucket(client, cfg.bucket);

  await client.putObject(cfg.bucket, objectName, buffer, buffer.length, {
    "Content-Type": contentType,
  });

  return `${cfg.publicUrl}/${cfg.bucket}/${objectName}`;
}
