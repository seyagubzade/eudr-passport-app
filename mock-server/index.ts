import cors from "cors";
import express from "express";
import helmet from "helmet";
import { company, COMPANY_SIZES, COUNTRIES } from "./company";
import { inboxNeedsYou, inboxWaiting, products, resolveInfoFor } from "./data";
import { statements } from "./statements";
import { getCurrentUser, loginUser, parseAppId } from "./users";
import type { Product, ProductStatus, StatementQueue } from "./contracts";

const PORT = parsePort(process.env.PORT);
const ALLOWED_ORIGINS = new Set(
  (process.env.CLIENT_ORIGIN ?? "http://localhost:5173,http://127.0.0.1:5173")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
);
const PRODUCT_STATUSES = new Set<ProductStatus>(["blocked", "waiting", "incomplete", "ready"]);
const STATEMENT_QUEUES = new Set<StatementQueue>(["blocked", "ready", "submitted"]);

const app = express();
app.disable("x-powered-by");
app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || ALLOWED_ORIGINS.has(origin)) {
        callback(null, true);
        return;
      }
      callback(null, false);
    },
    methods: ["GET", "POST", "PATCH"],
  }),
);
app.use(express.json({ limit: "32kb" }));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.get("/api/session", (_req, res) => {
  const user = getCurrentUser();
  if (!user) {
    res.status(401).json({ error: "Not logged in" });
    return;
  }
  res.json(user);
});

app.get("/api/session/:appId", (req, res) => {
  const appId = parseAppId(req.params.appId);
  if (!appId) {
    res.status(400).json({ error: "Invalid app id" });
    return;
  }
  const user = loginUser(appId);
  if (!user) {
    res.status(404).json({ error: "Unknown user" });
    return;
  }
  res.json(user);
});

app.get("/api/profile", (_req, res) => {
  const blocked = products.filter((product) => product.status === "blocked");
  const readyCount = products.filter((product) => product.status === "ready").length;
  const completeProfiles = 18;
  res.json({
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
  });
});

app.get("/api/products", (req, res) => {
  const query = parseSearch(req.query.q);
  const status = parseProductStatus(req.query.status);
  const pageSize = parsePageSize(req.query.pageSize);
  const filtered = products.filter((product) => {
    const statusOk = status === "all" || product.status === status;
    const haystack = `${product.name} ${product.hint} ${product.why}`.toLowerCase();
    return statusOk && (!query || haystack.includes(query));
  });
  res.json(paginate(filtered, req.query.page, pageSize));
});

app.get("/api/products/:id/resolve", (req, res) => {
  const product = products.find((item) => item.id === req.params.id);
  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }
  res.json(resolveInfoFor(product));
});

app.post("/api/products", (req, res) => {
  const name = parseName(req.body?.name);
  const origin = parseOrigin(req.body?.origin);
  if (!name) {
    res.status(400).json({ error: "A product name is required" });
    return;
  }
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
  res.status(201).json(product);
});

app.post("/api/products/:id/nudge", (req, res) => {
  const product = products.find((item) => item.id === req.params.id);
  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }
  res.json({ ok: true, message: `Reminder sent for ${product.name}` });
});

app.get("/api/company", (_req, res) => {
  res.json({
    ...company,
    countries: COUNTRIES,
    sizes: COMPANY_SIZES,
  });
});

app.patch("/api/company", (req, res) => {
  const nextName = parseName(req.body?.companyName);
  const vatNumber = parseOrigin(req.body?.vatNumber);
  const country = parseOrigin(req.body?.country);
  const size = parseOrigin(req.body?.size);
  const address = parseName(req.body?.address);
  const city = parseName(req.body?.city);
  const contactName = parseName(req.body?.contact?.name);
  const contactRole = parseOrigin(req.body?.contact?.role);
  const email = parseEmail(req.body?.contact?.email);
  const phone = parseOrigin(req.body?.contact?.phone);

  if (!nextName || !email) {
    res.status(400).json({ error: "Company name and a valid email are required" });
    return;
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
  res.json({ ...company, countries: COUNTRIES, sizes: COMPANY_SIZES });
});

app.post("/api/company/eori", (req, res) => {
  const eori = parseEori(req.body?.eori);
  const reason = parseName(req.body?.reason);
  if (!eori || !reason) {
    res.status(400).json({ error: "A new EORI and a reason are required" });
    return;
  }
  company.updatedAt = "today";
  res.json({ ...company, countries: COUNTRIES, sizes: COMPANY_SIZES });
});

app.get("/api/statements", (req, res) => {
  const pageSize = parsePageSize(req.query.pageSize);
  const filtered = filterStatements(req.query);
  const page = paginate(filtered, req.query.page, pageSize);
  res.json({
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
  });
});

app.post("/api/statements/:id/submit", (req, res) => {
  const row = statements.find((item) => item.id === req.params.id);
  if (!row) {
    res.status(404).json({ error: "Statement not found" });
    return;
  }
  if (row.queue !== "ready" || row.locked) {
    res.status(409).json({ error: "This statement cannot be submitted" });
    return;
  }
  row.queue = "submitted";
  row.progress = "100%";
  row.created = "today";
  row.validity = "today + 12 months";
  row.why = "Filed today · valid 12 months";
  res.json(row);
});

app.post("/api/statements/generate", (req, res) => {
  const ids = Array.isArray(req.body?.ids)
    ? req.body.ids.filter((id: unknown) => typeof id === "string")
    : [];
  const pool = ids.length
    ? statements.filter((row) => ids.includes(row.id))
    : filterStatements(req.body ?? {});
  const generated = pool.filter((row) => row.queue === "ready" && !row.locked);
  if (generated.length === 0) {
    res.status(400).json({ error: "Nothing Ready to generate" });
    return;
  }
  res.json({
    ok: true,
    generated: generated.map((row) => ({ id: row.id, name: row.name, supplier: row.supplier })),
  });
});

app.use((_req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`Mock API listening on http://localhost:${PORT}`);
});

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

function parsePort(value: string | undefined): number {
  const port = Number.parseInt(value ?? "4000", 10);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("PORT must be an integer between 1 and 65535");
  }
  return port;
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
