import { createClient } from "@/lib/supabase/client";

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);

export function imageValidationError(file: File) {
  if (!IMAGE_TYPES.has(file.type)) {
    return "Choose a JPEG, PNG, WebP, or AVIF image.";
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return "Choose an image smaller than 8 MB.";
  }
  return "";
}

export async function uploadDataImage(
  dataUrl: string,
  ownerId: string,
  kind: "event" | "live" | "avatar",
) {
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  const extension = mimeExtension(blob.type);
  const supabase = createClient();
  if (kind === "avatar") {
    const { data: existing } = await supabase.storage
      .from("event-media")
      .list(`${ownerId}/avatar`, { limit: 20 });
    if (existing?.length) {
      await supabase.storage
        .from("event-media")
        .remove(
          existing.map(
            (file: { name: string }) => `${ownerId}/avatar/${file.name}`,
          ),
        );
    }
  }
  // Live media must not be traceable to an account: a public URL under
  // `<ownerId>/` would name the author of a supposedly anonymous post.
  const path =
    kind === "live"
      ? `live/${crypto.randomUUID()}.${extension}`
      : `${ownerId}/${kind}/${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage
    .from("event-media")
    .upload(path, blob, {
      contentType: blob.type,
      cacheControl: "31536000",
      upsert: false,
    });
  if (error) throw error;
  return path;
}

export async function removeStoragePath(path: string) {
  const { error } = await createClient()
    .storage.from("event-media")
    .remove([path]);
  if (error) throw error;
}

function mimeExtension(type: string) {
  if (type === "image/png") return "png";
  if (type === "image/webp") return "webp";
  if (type === "image/avif") return "avif";
  if (type === "image/jpeg") return "jpg";
  throw new Error("Unsupported image type");
}
