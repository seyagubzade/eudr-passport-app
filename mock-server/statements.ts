import type { Statement } from "./contracts";

const products = [
  "Cocoa mass",
  "Green coffee",
  "Palm oil, crude",
  "Natural rubber",
  "Cocoa beans, roasted",
  "Soybeans",
  "Sawn wood",
  "Cattle leather",
  "Plywood",
  "Rubber latex",
  "Soy meal",
  "Timber logs",
  "Cocoa butter",
  "Green coffee, lot A",
];
const suppliers = [
  "Conway Dixon Associates",
  "No supplier yet",
  "Local",
  "QB",
  "Hood and White Traders",
  "Lott and Bradford Traders",
  "Mclean Alvarado Traders",
  "Allen Mercado Plc",
  "Rivas and Alford Plc",
  "Dillard Ballard Traders",
  "Trusty origin",
];
const roles = ["Downstream operator or trader", "Upstream operator"];
const skus = [
  "Aut veritatis volupt",
  "—",
  "Local",
  "qb",
  "Dolore dignissimos v",
  "test",
  "85",
  "plj",
  "testing, not mandatory",
  "SKU-1042",
  "LOT-A19",
  "N/A",
  "cocoa-24",
  "CF-8891",
];
const whys = [
  "Deforestation risk",
  "Country risk",
  "Supply chain too complex",
  "Rights check failed",
];

const seed = [
  { n: 240, sku: "Aut veritatis volupt", supplier: "Conway Dixon Associates", role: roles[0], name: "Cocoa mass" },
  { n: 239, sku: "—", supplier: "No supplier yet", role: roles[1], name: "Green coffee" },
  { n: 238, sku: "Local", supplier: "Local", role: roles[1], name: "Palm oil, crude" },
  { n: 237, sku: "qb", supplier: "QB", role: roles[1], name: "Natural rubber" },
  { n: 236, sku: "Dolore dignissimos v", supplier: "Hood and White Traders", role: roles[0], name: "Cocoa beans, roasted" },
  { n: 232, sku: "test", supplier: "Lott and Bradford Traders", role: roles[1], name: "Soybeans" },
  { n: 229, sku: "85", supplier: "Mclean Alvarado Traders", role: roles[1], name: "Sawn wood" },
  { n: 228, sku: "plj", supplier: "Allen Mercado Plc", role: roles[1], name: "Cattle leather" },
  { n: 227, sku: "testing, not mandatory", supplier: "Rivas and Alford Plc", role: roles[1], name: "Plywood" },
  { n: 225, sku: "—", supplier: "Dillard Ballard Traders", role: roles[1], name: "Rubber latex" },
];

function padRef(n: number) {
  return `TRUSTYc4ca${String(n).padStart(9, "0")}`;
}

function seedStatements(): Statement[] {
  const used = new Set(seed.map((item) => item.n));
  let cursor = 224;
  let alt = 400;
  const dash = "—";

  function nextRef() {
    while (cursor >= 1) {
      if (!used.has(cursor)) {
        used.add(cursor);
        return padRef(cursor--);
      }
      cursor -= 1;
    }
    while (used.has(alt)) alt -= 1;
    used.add(alt);
    return padRef(alt--);
  }

  const rows: Statement[] = seed.map((item, index) => ({
    id: `d${index}`,
    ref: padRef(item.n),
    sku: item.sku,
    name: item.name,
    supplier: item.supplier,
    role: item.role,
    queue: "blocked",
    risk: "Non-negligible",
    created: dash,
    validity: dash,
    progress: "~1%",
    why: `Cannot file — ${whys[index % whys.length]}`,
    locked: false,
  }));

  for (let i = 0; i < 240; i += 1) {
    rows.push({
      id: `b${i}`,
      ref: nextRef(),
      sku: skus[i % skus.length],
      name: products[i % products.length],
      supplier: suppliers[i % suppliers.length],
      role: roles[i % roles.length],
      queue: "blocked",
      risk: "Non-negligible",
      created: dash,
      validity: dash,
      progress: "~1%",
      why: `Cannot file — ${whys[i % whys.length]}`,
      locked: false,
    });
  }

  const readySeed = [
    { name: "Cocoa beans, roasted", supplier: "Trusty origin", sku: "CB-ROAST-01", locked: false },
    { name: "Green coffee, lot A", supplier: "Local", sku: "LOT-A19", locked: false },
    { name: "Soy meal", supplier: "Hood and White Traders", sku: "SOY-MEAL", locked: true },
    { name: "Timber logs", supplier: "Local", sku: "WOOD-22", locked: false },
    { name: "Cocoa butter", supplier: "Conway Dixon Associates", sku: "CBUT-9", locked: false },
  ];

  readySeed.forEach((item, index) => {
    rows.push({
      id: `r${index}`,
      ref: nextRef(),
      sku: item.sku,
      name: item.name,
      supplier: item.supplier,
      role: roles[index % roles.length],
      queue: "ready",
      risk: "Negligible",
      created: "11 Sep 2026",
      validity: dash,
      progress: "82%",
      why: "Negligible risk · EORI set",
      locked: item.locked,
    });
  });

  for (let i = 5; i < 24; i += 1) {
    rows.push({
      id: `r${i}`,
      ref: nextRef(),
      sku: skus[i % skus.length],
      name: products[i % products.length],
      supplier: suppliers[i % suppliers.length],
      role: roles[i % roles.length],
      queue: "ready",
      risk: "Negligible",
      created: "11 Sep 2026",
      validity: dash,
      progress: "82%",
      why: "Negligible risk · EORI set",
      locked: false,
    });
  }

  for (let i = 0; i < 40; i += 1) {
    const day = 1 + (i % 12);
    rows.push({
      id: `s${i}`,
      ref: nextRef(),
      sku: skus[i % skus.length],
      name: products[i % products.length],
      supplier: suppliers[i % suppliers.length],
      role: roles[i % roles.length],
      queue: "submitted",
      risk: "Negligible",
      created: `${day} Sep 2026`,
      validity: `${day} Sep 2027`,
      progress: "100%",
      why: `Filed ${day} Sep 2026 · valid 12 months`,
      locked: false,
    });
  }

  return rows;
}

export const statements: Statement[] = seedStatements();
