/**
 * Returns the full URL to the support page (support.html).
 * On web uses current origin; on native uses EXPO_PUBLIC_WEB_APP_URL or EXPO_PUBLIC_API_URL.
 */
export function getSupportUrl(): string {
  if (typeof window !== "undefined" && (window as any).location?.origin) {
    return `${(window as any).location.origin}/support.html`;
  }
  const base =
    process.env.EXPO_PUBLIC_WEB_APP_URL ||
    process.env.EXPO_PUBLIC_API_URL ||
    "";
  const baseClean = base ? base.replace(/\/$/, "") : "";
  return baseClean ? `${baseClean}/support.html` : "/support.html";
}
