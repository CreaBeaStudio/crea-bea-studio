import { Storage } from "@google-cloud/storage";

// Same credential pattern as lib/fulfillOrder.ts's private getStorageClient
// -- pulled out here since the new swatch-order routes and the webhook's
// custom-swatch branch need a Storage client too, and fulfillOrder.ts
// doesn't export its copy.
//
// Save this file as lib/gcs.ts

export const GCS_BUCKET_NAME = process.env.GCS_ORDERS_BUCKET || "crea-bea-pbn-orders";

export function getStorageClient(): Storage {
  const b64 = process.env.GCS_SERVICE_ACCOUNT_KEY_BASE64;
  if (!b64) {
    throw new Error("GCS_SERVICE_ACCOUNT_KEY_BASE64 is not configured");
  }
  let credentials: any;
  try {
    credentials = JSON.parse(Buffer.from(b64, "base64").toString("utf-8"));
  } catch {
    throw new Error("GCS_SERVICE_ACCOUNT_KEY_BASE64 could not be decoded/parsed -- check it was base64-encoded before pasting into Vercel");
  }
  return new Storage({ credentials, projectId: credentials.project_id });
}
