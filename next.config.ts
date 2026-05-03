import type { NextConfig } from "next";

function normalizeBasePath(): string {
  // Avoid MSYS path conversion on Windows Git Bash (vars containing `PATH` get rewritten)
  // Prefer NEXT_PUBLIC_BASEPATH, but keep backward compatibility with NEXT_PUBLIC_BASE_PATH.
  let value = (
    process.env.NEXT_PUBLIC_BASEPATH ??
    process.env.NEXT_PUBLIC_BASE_PATH ??
    ""
  ).trim();
  if (!value) return "";
  if (!value.startsWith("/")) value = `/${value}`;
  return value.replace(/\/+$/, "") || "";
}

const basePath = normalizeBasePath();

const nextConfig: NextConfig = {
  output: "export",
  basePath: basePath || undefined,
  trailingSlash: true,
};

export default nextConfig;
