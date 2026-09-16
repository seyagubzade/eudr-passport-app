import type { Session } from "./contracts";

export const DEFAULT_APP_ID = "7c2e9a4f-1b58-4d03-9e6a-c8f4d2b7a015";
const APP_ID_PATTERN = /^[A-Za-z0-9-]{3,80}$/;

export const users: Session[] = [
  {
    appId: DEFAULT_APP_ID,
    name: "Robert",
    initials: "RG",
    credits: 989773,
  },
];

let currentUser: Session | null = null;

export function parseAppId(value: unknown): string {
  if (typeof value !== "string") return "";
  const appId = value.trim();
  return APP_ID_PATTERN.test(appId) ? appId : "";
}

export function loginUser(appId: string): Session | null {
  const user = users.find((item) => item.appId === appId);
  if (!user) return null;
  currentUser = user;
  return currentUser;
}

export function getCurrentUser(): Session | null {
  return currentUser;
}
