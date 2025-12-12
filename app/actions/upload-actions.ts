"use server";

import { uploadToR2 } from "@/lib/r2";
// Import Buffer from node:buffer if you are using TypeScript and need the specific type
// import { Buffer } from "node:buffer";

/**
 * Handles the upload of a file passed via FormData from the client.
 * This function is a dedicated Server Action.
 * @param formData The FormData object containing the file.
 * @returns The result of the R2 upload.
 */
export async function handleFileUploadAction(formData: FormData) {
  // 1. Get the File object from the FormData instance
  const file = formData.get("croppedFile");

  // 2. Validate the file object
  if (!(file instanceof File)) {
    throw new Error("Invalid file uploaded or file not found in FormData.");
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const bufferBody = Buffer.from(arrayBuffer); // Use Buffer to create a hashable object

    // 3. Generate a safe, slugified filename for the key to avoid long
    // metadata-like suffixes (e.g. "...jpg (JPEG Image ...) — Scaled (...).png").
    const originalName = file.name || "image";

    // Try to cut the name at the first recognized image extension to avoid
    // leftover metadata that some browsers include in the filename.
    const extMatch = originalName.match(/\.(jpg|jpeg|png|webp|gif|heic)/i);
    let baseName = originalName;
    let extFromName = "";
    if (extMatch) {
      // Keep everything up to the first recognized extension (exclude extension)
      const idx = originalName.toLowerCase().indexOf(extMatch[0].toLowerCase());
      baseName = originalName.slice(0, idx);
      extFromName = extMatch[0];
    } else {
      // No extension found in name — strip any trailing weird characters
      baseName = originalName.replace(/\.[^.]*$/g, "");
    }

    // Slugify baseName: replace spaces with '-', remove unsafe chars
    const slug = baseName
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-_\.]/g, "")
      .replace(/-+/g, "-")
      .replace(/^[-\.]+|[-\.]+$/g, "");

    // Determine extension from MIME type as the authoritative source
    const mimeToExt: Record<string, string> = {
      "image/jpeg": ".jpg",
      "image/png": ".png",
      "image/webp": ".webp",
      "image/gif": ".gif",
      "image/heic": ".heic",
    };
    const ext = mimeToExt[file.type] || extFromName || ".jpg";

    // 3. Generate a unique key
    const key = `product-images/${Date.now()}-${slug || "image"}${ext}`;

    // 4. Call the low-level R2 upload function securely
    const uploadResult = await uploadToR2(
      key,
      bufferBody, // Pass the hashable Buffer object
      file.type
    );

    // Return information needed by the client
    return {
      success: true,
      key: key,
      eTag: uploadResult.ETag,
      url: `${process.env.R2_PUBLIC_ENDPOINT}/${key}`,
    };
  } catch (error) {
    console.error("R2 Upload Failed in Server Action:", error);
    // Ensure you throw a generic error to the client
    throw new Error("Failed to upload image to storage.");
  }
}
