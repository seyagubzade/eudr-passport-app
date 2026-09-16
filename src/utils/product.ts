import type { GateTone, ProductStatus, StatusTone } from "../types/api";

export const statusFilters: { id: "all" | ProductStatus; label: string }[] = [
  { id: "all", label: "All" },
  { id: "blocked", label: "Blocked" },
  { id: "waiting", label: "Waiting" },
  { id: "incomplete", label: "Incomplete" },
  { id: "ready", label: "Ready" },
];

export const statusTone: Record<ProductStatus, StatusTone> = {
  blocked: "bad",
  waiting: "warn",
  incomplete: "idle",
  ready: "ok",
};

export const statusLabel: Record<ProductStatus, string> = {
  blocked: "Blocked",
  waiting: "Waiting",
  incomplete: "Incomplete",
  ready: "Ready",
};

export function statusToneFromGate(tone: GateTone): StatusTone {
  if (tone === "ok") return "ok";
  if (tone === "wait") return "warn";
  if (tone === "bad") return "bad";
  return "idle";
}
