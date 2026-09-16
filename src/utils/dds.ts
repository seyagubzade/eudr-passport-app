import type { Statement, StatementPage } from "../types/api";

export function bannerFor(queue: string, page: StatementPage) {
  if (queue === "blocked") {
    return {
      tone: "bad" as const,
      pill: "Blocked",
      title: "You cannot file these yet",
      detail: `${page.blockedInView} statements are blocked by risk. Generate is skipped until they are Ready.`,
    };
  }
  if (queue === "ready") {
    return {
      tone: "ok" as const,
      pill: "Ready",
      title: "These can be generated and filed",
      detail: "Tick rows or generate all Ready in this filter. Confirm is still the legal step after generate.",
    };
  }
  if (queue === "submitted") {
    return {
      tone: "idle" as const,
      title: "Submitted — five-year evidence trail",
      detail: "Already filed. Generate does not apply here.",
    };
  }
  return {
    tone: "idle" as const,
    title: `Filtered list · ${page.total}`,
    detail: page.readyInView
      ? `${page.readyInView} Ready in this list can be generated. Blocked rows are skipped.`
      : "Nothing Ready in this filter — generate will not run. Unblock risk first, or add Ready.",
  };
}

export function generatePool(page: StatementPage | null, selected: Set<string>) {
  if (!page) return { ready: [] as Statement[], skipped: 0 };
  const pool = selected.size
    ? page.items.filter((row) => selected.has(row.id))
    : page.items.filter((row) => row.queue === "ready" && !row.locked);
  const ready = pool.filter((row) => row.queue === "ready" && !row.locked);
  return {
    ready,
    skipped: selected.size ? selected.size - ready.length : page.items.length - ready.length,
  };
}
