/**
 * Mock API contracts for the EUDR Passport frontend.
 * All routes are served by `mock-server/index.ts` and consumed via `/api/*`.
 */

export type ProductStatus = "blocked" | "waiting" | "incomplete" | "ready";
export type ActionKind = "danger" | "ghost" | "primary";
export type GateTone = "ok" | "wait" | "bad" | "idle";
export type BannerTone = "ok" | "bad" | "idle";
export type StatementQueue = "blocked" | "ready" | "submitted";
export type RiskLevel = "Negligible" | "Non-negligible";

export interface Session {
  appId: string;
  name: string;
  initials: string;
  credits: number;
}

export interface Product {
  id: string;
  name: string;
  hint: string;
  status: ProductStatus;
  why: string;
  action: string;
  kind: ActionKind;
  origin?: string;
  plots?: number;
  suppliers?: number;
}

export interface InboxItem {
  id: string;
  title: string;
  meta: string;
  due?: boolean;
  waiting?: boolean;
  cancelled?: boolean;
  action?: string;
}

export interface Gate {
  key: string;
  label: string;
  value: string;
  detail: string;
  pill: string;
  tone: GateTone;
}

export interface Banner {
  tone: BannerTone;
  pill?: string;
  title: string;
  detail: string;
  cta?: string;
}

export interface ProductProfile {
  banner: Banner;
  gates: Gate[];
  needsYou: InboxItem[];
  waitingOnOthers: InboxItem[];
  blockedProducts: Product[];
}

export interface PageResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ResolveOption {
  title: string;
  body: string;
  action: string;
  featured?: boolean;
}

export interface ResolveInfo {
  productId?: string;
  title: string;
  summary: string;
  verdictUrl: string;
  options: ResolveOption[];
  note: string;
}

export interface CompanyContact {
  name: string;
  role: string;
  email: string;
  phone: string;
}

export interface CompanyProfile {
  eori: string;
  eoriCheckedAt: string;
  companyName: string;
  vatNumber: string;
  country: string;
  size: string;
  address: string;
  city: string;
  contact: CompanyContact;
  updatedAt: string;
  updatedBy: string;
}

export interface Statement {
  id: string;
  ref: string;
  sku: string;
  name: string;
  supplier: string;
  role: string;
  queue: StatementQueue;
  risk: RiskLevel;
  created: string;
  validity: string;
  progress: string;
  why: string;
  locked: boolean;
}

export interface StatementFilters {
  suppliers: string[];
  products: string[];
  roles: string[];
}

export interface StatementCounts {
  all: number;
  blocked: number;
  ready: number;
  submitted: number;
}

export interface StatementPage extends PageResult<Statement> {
  counts: StatementCounts;
  filters: StatementFilters;
  readyInView: number;
  blockedInView: number;
}

/**
 * GET    /api/health
 * GET    /api/session
 * GET    /api/session/:appId
 * GET    /api/profile
 * GET    /api/products?q&status&page&pageSize
 * POST   /api/products                 { name, origin? }
 * POST   /api/products/:id/nudge
 * GET    /api/products/:id/resolve
 * GET    /api/company
 * PATCH  /api/company                  company + contact fields
 * POST   /api/company/eori             { eori, reason }
 * GET    /api/statements?q&queue&supplier&product&ref&sku&role&page&pageSize
 * POST   /api/statements/:id/submit
 * POST   /api/statements/generate      { ids: string[] }
 */
export const API_PATHS = {
  health: "/api/health",
  session: "/api/session",
  sessionByAppId: "/api/session/:appId",
  profile: "/api/profile",
  products: "/api/products",
  company: "/api/company",
  companyEori: "/api/company/eori",
  statements: "/api/statements",
  statementsGenerate: "/api/statements/generate",
} as const;
