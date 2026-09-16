export type ProductStatus = "blocked" | "waiting" | "incomplete" | "ready";
export type ActionKind = "danger" | "ghost" | "primary";
export type GateTone = "ok" | "wait" | "bad" | "idle";
export type BannerTone = "ok" | "bad" | "idle";
export type StatementQueue = "blocked" | "ready" | "submitted";
export type RiskLevel = "Negligible" | "Non-negligible";
export type StatusTone = "ok" | "bad" | "warn" | "idle" | "muted";

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

export interface BannerData {
  tone: BannerTone;
  pill?: string;
  title: string;
  detail: string;
  cta?: string;
}

export interface ProductProfile {
  banner: BannerData;
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
  countries: string[];
  sizes: string[];
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

export interface StatementPage extends PageResult<Statement> {
  counts: { all: number; blocked: number; ready: number; submitted: number };
  filters: { suppliers: string[]; products: string[]; roles: string[] };
  readyInView: number;
  blockedInView: number;
}
