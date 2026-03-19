const API_URL = import.meta.env.VITE_API_URL as string | undefined;

function tryGetOrigin(url: string | undefined) {
  if (!url) return undefined;
  try {
    return new URL(url).origin;
  } catch {
    return undefined;
  }
}

const DEFAULT_ORIGIN = tryGetOrigin(API_URL);

const THUMBNAIL_BASE_URL =
  (import.meta.env.VITE_THUMBNAIL_BASE_URL as string | undefined) || DEFAULT_ORIGIN;

const MEDIA_BASE_URL =
  (import.meta.env.VITE_MEDIA_BASE_URL as string | undefined) || DEFAULT_ORIGIN;

function isAbsoluteUrl(value: string) {
  return /^(https?:)?\/\//i.test(value);
}

function resolveWithBase(value: string | undefined | null, baseUrl: string | undefined) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (raw.startsWith("data:") || raw.startsWith("blob:")) return raw;
  if (isAbsoluteUrl(raw)) {
    if (!raw.startsWith("//")) return raw;
    const protocol =
      typeof window !== "undefined" && window.location?.protocol
        ? window.location.protocol
        : "https:";
    return `${protocol}${raw}`;
  }

  const path = raw.startsWith("/") ? raw : `/${raw}`;
  if (!baseUrl) return path;

  try {
    return new URL(path, baseUrl).toString();
  } catch {
    return path;
  }
}

export function resolveThumbnailUrl(value: string | undefined | null) {
  return resolveWithBase(value, THUMBNAIL_BASE_URL);
}

export function resolveMediaUrl(value: string | undefined | null) {
  return resolveWithBase(value, MEDIA_BASE_URL);
}
