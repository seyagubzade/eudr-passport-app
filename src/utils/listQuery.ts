import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import type { ProductStatus } from "../types/api";

const PAGE_SIZES = new Set([10, 20, 50]);
const PRODUCT_STATUSES = new Set(["all", "blocked", "waiting", "incomplete", "ready"]);
const QUEUES = new Set(["all", "blocked", "ready", "submitted"]);

function parseText(value: string | null, max = 100): string {
  if (typeof value !== "string") return "";
  return value.replace(/[\u0000-\u001F\u007F]/g, "").slice(0, max);
}

function parsePage(value: string | null): number {
  const page = Number.parseInt(value ?? "1", 10);
  if (!Number.isInteger(page) || page < 1) return 1;
  return Math.min(page, 1000);
}

function parsePageSize(value: string | null): number {
  const size = Number.parseInt(value ?? "10", 10);
  return PAGE_SIZES.has(size) ? size : 10;
}

function parseOneOf<T extends string>(value: string | null, allowed: Set<string>, fallback: T): T {
  if (value && allowed.has(value)) return value as T;
  return fallback;
}

export type ProductListFilters = {
  page: number;
  pageSize: number;
  status: "all" | ProductStatus;
  q: string;
};

export const PRODUCT_FILTER_DEFAULTS: ProductListFilters = {
  page: 1,
  pageSize: 10,
  status: "all",
  q: "",
};

export function parseProductFilters(params: URLSearchParams): ProductListFilters {
  return {
    page: parsePage(params.get("page")),
    pageSize: parsePageSize(params.get("pageSize")),
    status: parseOneOf(params.get("status"), PRODUCT_STATUSES, "all"),
    q: parseText(params.get("q")),
  };
}

export type DdsListFilters = {
  page: number;
  pageSize: number;
  queue: string;
  q: string;
  supplier: string;
  product: string;
  ref: string;
  sku: string;
  role: string;
};

export const DDS_FILTER_DEFAULTS: DdsListFilters = {
  page: 1,
  pageSize: 10,
  queue: "all",
  q: "",
  supplier: "",
  product: "",
  ref: "",
  sku: "",
  role: "",
};

export function parseDdsFilters(params: URLSearchParams): DdsListFilters {
  return {
    page: parsePage(params.get("page")),
    pageSize: parsePageSize(params.get("pageSize")),
    queue: parseOneOf(params.get("queue"), QUEUES, "all"),
    q: parseText(params.get("q")),
    supplier: parseText(params.get("supplier"), 120),
    product: parseText(params.get("product"), 120),
    ref: parseText(params.get("ref")),
    sku: parseText(params.get("sku")),
    role: parseText(params.get("role"), 80),
  };
}

export function useFilterParams<T extends Record<string, string | number>>(
  defaults: T,
  parse: (params: URLSearchParams) => T,
) {
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = useMemo(() => parse(searchParams), [parse, searchParams]);

  const setFilters = useCallback((patch: Partial<T>) => {
    setSearchParams((current) => {
      const next = { ...parse(current), ...patch };
      const params = new URLSearchParams();
      for (const key of Object.keys(defaults) as (keyof T)[]) {
        const value = next[key];
        if (value === defaults[key] || value === "") continue;
        params.set(String(key), String(value));
      }
      return params;
    }, { replace: true });
  }, [defaults, parse, setSearchParams]);

  return [filters, setFilters] as const;
}
