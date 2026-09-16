import { useParams } from "react-router-dom";

export const DEFAULT_APP_ID = "7c2e9a4f-1b58-4d03-9e6a-c8f4d2b7a015";
export const APP_ID_STORAGE_KEY = "eudr.appId";
const APP_ID_PATTERN = /^[A-Za-z0-9-]{3,80}$/;

export function isValidAppId(value: string): boolean {
  return APP_ID_PATTERN.test(value);
}

export function readStoredAppId(): string {
  try {
    const stored = sessionStorage.getItem(APP_ID_STORAGE_KEY) ?? "";
    return isValidAppId(stored) ? stored : DEFAULT_APP_ID;
  } catch {
    return DEFAULT_APP_ID;
  }
}

export function storeAppId(appId: string): void {
  if (!isValidAppId(appId)) return;
  try {
    sessionStorage.setItem(APP_ID_STORAGE_KEY, appId);
  } catch {
    // Ignore quota / private-mode failures; the URL still carries the id.
  }
}

export function appHref(appId: string, path = ""): string {
  const suffix = !path || path === "/" ? "" : path.startsWith("/") ? path : `/${path}`;
  return `/${appId}${suffix}`;
}

export function useAppHref() {
  const { appId = DEFAULT_APP_ID } = useParams();
  return (path = "") => appHref(appId, path);
}
