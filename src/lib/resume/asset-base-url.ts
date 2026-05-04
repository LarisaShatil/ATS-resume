export function normalizeBasePath(value: string | undefined): string {
  const raw = (value ?? "").trim();
  if (!raw) return "";
  const withSlash = raw.startsWith("/") ? raw : `/${raw}`;
  return withSlash.replace(/\/+$/, "");
}

export function pdfAssetBaseUrlFromWindow(): string | undefined {
  if (typeof window === "undefined") return undefined;
  const basePath = normalizeBasePath(process.env.NEXT_PUBLIC_BASEPATH);
  return `${window.location.origin}${basePath}`;
}

