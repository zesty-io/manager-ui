// The limits mcp-remote's /client enforces on a prompt's images. Checked
// here so a file it would refuse is never uploaded.
export const MAX_ATTACHMENTS = 5;
export const MAX_ATTACHMENT_BYTES = 20 * 1024 * 1024;
export const MAX_ATTACHMENT_MB = MAX_ATTACHMENT_BYTES / 1024 / 1024;

const ACCEPTED_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/heic",
  "image/heif",
];
// Browsers often report no MIME type for HEIC/HEIF, so a file without one is
// judged by its extension instead.
const ACCEPTED_EXTENSIONS = [
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
  ".heic",
  ".heif",
];

// For the refusal message. File-format names, not copy.
export const ATTACHMENT_TYPE_NAMES = "PNG, JPEG, WebP, HEIC, HEIF";

export const ATTACHMENT_ACCEPT = [
  ...ACCEPTED_TYPES,
  ...ACCEPTED_EXTENSIONS,
].join(",");

// A picked file, before and after it reaches the media library.
export type PromptAttachment = {
  id: string;
  file: File;
  previewUrl: string;
  // Set once uploaded, so a retry after a failed send skips it.
  uploaded?: PromptImage;
};

// An image as a sent prompt carries it. A reloaded one may lack its ZUID.
export type PromptImage = { fileZuid?: string; url: string };

// The /client `imageFileZuids` for a prompt's images.
export const toImageFileZUIDs = (images: PromptImage[] = []) =>
  images.flatMap((image) => (image.fileZuid ? [image.fileZuid] : []));

export type AttachmentRefusalReason = "count" | "size" | "total" | "type";

export type AttachmentRefusal = {
  filename: string;
  reason: AttachmentRefusalReason;
};

// The MIME types a browser reports when it does not know the file's type.
const UNKNOWN_TYPES = ["", "application/octet-stream"];

// A known MIME type decides; the extension only stands in for a missing one,
// so a GIF renamed to .png is still refused.
const isAcceptedType = (file: File) => {
  if (!UNKNOWN_TYPES.includes(file.type)) {
    return ACCEPTED_TYPES.includes(file.type);
  }
  const name = file.name.toLowerCase();
  return ACCEPTED_EXTENSIONS.some((extension) => name.endsWith(extension));
};

// Accepts `incoming` files in order while they fit beside `existing`.
export const validateAttachments = (existing: File[], incoming: File[]) => {
  const accepted: File[] = [];
  const refusals: AttachmentRefusal[] = [];
  let totalBytes = existing.reduce((total, file) => total + file.size, 0);

  incoming.forEach((file) => {
    const refuse = (reason: AttachmentRefusalReason) =>
      refusals.push({ filename: file.name, reason });

    if (!isAcceptedType(file)) return refuse("type");
    if (file.size > MAX_ATTACHMENT_BYTES) return refuse("size");
    if (existing.length + accepted.length >= MAX_ATTACHMENTS) {
      return refuse("count");
    }
    if (totalBytes + file.size > MAX_ATTACHMENT_BYTES) return refuse("total");

    accepted.push(file);
    totalBytes += file.size;
  });

  return { accepted, refusals };
};
