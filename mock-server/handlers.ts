import { company, COMPANY_SIZES, COUNTRIES } from "./company";
import type { Product, ProductProfile, ProductStatus, StatementQueue } from "./contracts";
import { inboxNeedsYou, inboxWaiting, products, resolveInfoFor } from "./data";
import { statements } from "./statements";
import { getCurrentUser, loginUser, parseAppId } from "./users";

const PRODUCT_STATUSES = new Set<ProductStatus>(["blocked", "waiting", "incomplete", "ready"]);
const STATEMENT_QUEUES = new Set<StatementQueue>(["blocked", "ready", "submitted"]);

export class HttpError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export function getSession() {
  const user = getCurrentUser();
  if (!user) throw new HttpError(401, "Not logged in");
  return user;
}

export function loginSession(appId: string) {
  const id = parseAppId(appId);
  if (!id) throw new HttpError(400, "Invalid app id");
  const user = loginUser(id);
  if (!user) throw new HttpError(404, "Unknown user");
  return user;
}

export function getProfile(): ProductProfile {
  const blocked = products.filter((product) => product.status === "blocked");
  const readyCount = products.filter((product) => product.status === "ready").length;
  const completeProfiles = 18;
  return {
    banner: {
      tone: blocked.length > 0 ? "bad" : "ok",
      pill: blocked.length > 0 ? "Blocked" : "Ready",
      title: blocked.length > 0 ? "You cannot submit" : "Ready to submit",
      detail: `${blocked.length} products are blocked by risk. Next up: complete Trusty’s request — due 30 Sep.`,
      cta: "Complete request",
    },
    gates: [
      {
        key: "identity",
        label: "Identity",
        value: "EORI set",
        detail: "Ready for EU filing",
        pill: "Ready",
        tone: "ok",
      },
      {
        key: "profiles",
        label: "Profiles",
        value: `${completeProfiles} of ${products.length} complete`,
        detail: `${products.length - completeProfiles} still need data`,
        pill: "In progress",
        tone: "wait",
      },
      {
        key: "risk",
        label: "Risk",
        value: `${blocked.length} blocked`,
        detail: "Cannot file until resolved",
        pill: "Blocked",
        tone: blocked.length > 0 ? "bad" : "ok",
      },
      {
        key: "ready",
        label: "Ready to file",
        value: `${readyCount} of ${products.length}`,
        detail: readyCount === 0 ? "Nothing can be submitted yet" : "Can be submitted",
        pill: readyCount === 0 ? "Not ready" : "Ready",
        tone: readyCount === 0 ? "idle" : "ok",
      },
    ],
    needsYou: inboxNeedsYou,
    waitingOnOthers: inboxWaiting,
    blockedProducts: blocked,
  };
}

export function getProducts(params: { page: number; pageSize: number; status: string; q: string }) {
  const query = parseSearch(params.q);
  const status = parseProductStatus(params.status);
  const pageSize = parsePageSize(params.pageSize);
  const filtered = products.filter((product) => {
    const statusOk = status === "all" || product.status === status;
    const haystack = `${product.name} ${product.hint} ${product.why}`.toLowerCase();
    return statusOk && (!query || haystack.includes(query));
  });
  return paginate(filtered, params.page, pageSize);
}

export function createProduct(input: { name: string; origin: string }) {
  const name = parseName(input.name);
  const origin = parseOrigin(input.origin);
  if (!name) throw new HttpError(400, "A product name is required");
  const product: Product = {
    id: `prod-${Date.now()}`,
    name,
    hint: origin || "New profile",
    status: "incomplete",
    why: "Still missing data",
    action: "Finish",
    kind: "ghost",
    origin: origin || undefined,
  };
  products.unshift(product);
  return product;
}

export function nudgeProduct(id: string) {
  const product = products.find((item) => item.id === id);
  if (!product) throw new HttpError(404, "Product not found");
  return { ok: true, message: `Reminder sent for ${product.name}` };
}

export function getResolveInfo(id: string) {
  const product = products.find((item) => item.id === id);
  if (!product) throw new HttpError(404, "Product not found");
  return resolveInfoFor(product);
}

export function getCompany() {
  return { ...company, countries: COUNTRIES, sizes: COMPANY_SIZES };
}

export function updateCompany(input: {
  companyName: string;
  vatNumber: string;
  country: string;
  size: string;
  address: string;
  city: string;
  contact: { name: string; role: string; email: string; phone: string };
}) {
  const nextName = parseName(input.companyName);
  const vatNumber = parseOrigin(input.vatNumber);
  const country = parseOrigin(input.country);
  const size = parseOrigin(input.size);
  const address = parseName(input.address);
  const city = parseName(input.city);
  const contactName = parseName(input.contact?.name);
  const contactRole = parseOrigin(input.contact?.role);
  const email = parseEmail(input.contact?.email);
  const phone = parseOrigin(input.contact?.phone);

  if (!nextName || !email) {
    throw new HttpError(400, "Company name and a valid email are required");
  }

  company.companyName = nextName;
  company.vatNumber = vatNumber || company.vatNumber;
  company.country = COUNTRIES.includes(country) ? country : company.country;
  company.size = COMPANY_SIZES.includes(size) ? size : company.size;
  company.address = address || company.address;
  company.city = city || company.city;
  company.contact = {
    name: contactName || company.contact.name,
    role: contactRole || company.contact.role,
    email,
    phone: phone || company.contact.phone,
  };
  company.updatedAt = "today";
  return getCompany();
}

export function changeEori(input: { eori: string; reason: string }) {
  const eori = parseEori(input.eori);
  const reason = parseName(input.reason);
  if (!eori || !reason) throw new HttpError(400, "A new EORI and a reason are required");
  company.updatedAt = "today";
  return getCompany();
}

export function getStatements(params: {
  page: number;
  pageSize: number;
  q: string;
  queue: string;
  supplier: string;
  product: string;
  ref: string;
  sku: string;
  role: string;
}) {
  const pageSize = parsePageSize(params.pageSize);
  const filtered = filterStatements(params);
  const page = paginate(filtered, params.page, pageSize);
  return {
    ...page,
    counts: {
      all: statements.length,
      blocked: statements.filter((row) => row.queue === "blocked").length,
      ready: statements.filter((row) => row.queue === "ready").length,
      submitted: statements.filter((row) => row.queue === "submitted").length,
    },
    filters: {
      suppliers: unique(statements.map((row) => row.supplier)),
      products: unique(statements.map((row) => row.name)),
      roles: unique(statements.map((row) => row.role)),
    },
    readyInView: filtered.filter((row) => row.queue === "ready" && !row.locked).length,
    blockedInView: filtered.filter((row) => row.queue === "blocked").length,
  };
}

export function submitStatement(id: string) {
  const row = statements.find((item) => item.id === id);
  if (!row) throw new HttpError(404, "Statement not found");
  if (row.queue !== "ready" || row.locked) {
    throw new HttpError(409, "This statement cannot be submitted");
  }
  row.queue = "submitted";
  row.progress = "100%";
  row.created = "today";
  row.validity = "today + 12 months";
  row.why = "Filed today · valid 12 months";
  return row;
}

export function generateStatements(input: {
  ids?: string[];
  q?: string;
  queue?: string;
  supplier?: string;
  product?: string;
  ref?: string;
  sku?: string;
  role?: string;
}) {
  const ids = Array.isArray(input.ids) ? input.ids.filter((id) => typeof id === "string") : [];
  const pool = ids.length ? statements.filter((row) => ids.includes(row.id)) : filterStatements(input);
  const generated = pool.filter((row) => row.queue === "ready" && !row.locked);
  if (generated.length === 0) throw new HttpError(400, "Nothing Ready to generate");
  return {
    ok: true,
    generated: generated.map((row) => ({ id: row.id, name: row.name, supplier: row.supplier })),
  };
}

function paginate<T>(items: T[], pageValue: unknown, pageSize: number) {
  const total = items.length;
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(parsePage(pageValue), pages);
  const start = total === 0 ? 0 : (page - 1) * pageSize;
  return { items: items.slice(start, start + pageSize), total, page, pageSize };
}

function unique(values: string[]) {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b));
}

function filterStatements(params: Record<string, unknown>) {
  const query = parseSearch(params.q);
  const queue = parseQueue(params.queue);
  const supplier = parseSearch(params.supplier);
  const product = parseSearch(params.product);
  const ref = parseSearch(params.ref);
  const sku = parseSearch(params.sku);
  const role = parseSearch(params.role);
  return statements.filter((row) => {
    const queueOk = queue === "all" || row.queue === queue;
    const hay = `${row.ref} ${row.sku} ${row.name} ${row.supplier} ${row.role} ${row.why}`.toLowerCase();
    return (
      queueOk &&
      (!query || hay.includes(query)) &&
      (!supplier || row.supplier.toLowerCase() === supplier) &&
      (!product || row.name.toLowerCase() === product) &&
      (!ref || row.ref.toLowerCase().includes(ref)) &&
      (!sku || row.sku.toLowerCase().includes(sku)) &&
      (!role || row.role.toLowerCase() === role)
    );
  });
}

function parsePage(value: unknown): number {
  const page = Number.parseInt(String(value ?? "1"), 10);
  if (!Number.isInteger(page) || page < 1) return 1;
  return Math.min(page, 1000);
}

function parsePageSize(value: unknown): number {
  const size = Number.parseInt(String(value ?? "10"), 10);
  if (size === 10 || size === 20 || size === 50) return size;
  return 10;
}

function parseProductStatus(value: unknown): ProductStatus | "all" {
  if (typeof value === "string" && PRODUCT_STATUSES.has(value as ProductStatus)) return value as ProductStatus;
  return "all";
}

function parseQueue(value: unknown): StatementQueue | "all" {
  if (typeof value === "string" && STATEMENT_QUEUES.has(value as StatementQueue)) return value as StatementQueue;
  return "all";
}

function parseSearch(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.replace(/[\u0000-\u001F\u007F]/g, "").trim().slice(0, 100).toLowerCase();
}

function parseName(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.replace(/[\u0000-\u001F\u007F]/g, "").trim().slice(0, 120);
}

function parseOrigin(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.replace(/[\u0000-\u001F\u007F]/g, "").trim().slice(0, 80);
}

function parseEmail(value: unknown): string {
  const email = parseOrigin(value).toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : "";
}

function parseEori(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.replace(/[^a-zA-Z0-9]/g, "").slice(0, 20);
}
