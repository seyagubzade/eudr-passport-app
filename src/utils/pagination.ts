export function pageItems(current: number, total: number): Array<number | "…"> {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const items: Array<number | "…"> = [1];
  const from = Math.max(2, current - 1);
  const to = Math.min(total - 1, current + 1);
  if (from > 2) items.push("…");
  for (let i = from; i <= to; i += 1) items.push(i);
  if (to < total - 1) items.push("…");
  items.push(total);
  return items;
}

export function pageRange(page: number, pageSize: number, total: number) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const start = total === 0 ? 0 : (page - 1) * pageSize;
  const end = Math.min(start + pageSize, total);
  return { pages, start, end };
}
