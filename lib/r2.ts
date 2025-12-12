// lib/r2.ts

"use server"; // 🛑 Server Directive MUST stay at the top

import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  PutObjectCommandInput,
  GetObjectCommandOutput,
  PutObjectCommandOutput,
} from "@aws-sdk/client-s3";
import type { StreamingBlobPayloadInputTypes } from "@smithy/types";

// Initialize the R2 Client
const r2 = new S3Client({
  // The client is defined here, making it accessible to the exported functions.
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY as string,
  },
  region: "apac",
});

const BUCKETNAME = "gusto-ko" as const;

// --- Upload Function (Async Function Export - OK) ---

export async function uploadToR2(
  key: string,
  body: StreamingBlobPayloadInputTypes,
  contentType: string,
  contentEncoding?: string,
  options?: Partial<PutObjectCommandInput>
): Promise<PutObjectCommandOutput> {
  const command = new PutObjectCommand({
    Bucket: BUCKETNAME,
    Key: key,
    Body: body,
    ContentEncoding: contentEncoding,
    ContentType: contentType,
    ...options,
  });

  return r2.send(command);
}

// --- Get File Function (Async Function Export - OK) ---

export async function getFileR2(key: string): Promise<GetObjectCommandOutput> {
  const command = new GetObjectCommand({
    Bucket: BUCKETNAME,
    Key: key,
  });

  return r2.send(command);
}

// 🛑 REMOVED: export default r2;
// The S3Client instance 'r2' is used internally and NOT exported.
