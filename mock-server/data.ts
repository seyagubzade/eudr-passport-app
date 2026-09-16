import type { InboxItem, Product, ResolveInfo } from "./contracts";

const extraNames = [
  "Cocoa beans, roasted",
  "Coffee, roasted",
  "Palm kernel oil",
  "Plywood",
  "Cattle leather",
  "Soy meal",
  "Rubber latex",
  "Timber logs",
  "Cocoa butter",
  "Green coffee, lot 3",
];

function seedProducts(): Product[] {
  const catalog: Product[] = [
    {
      id: "prod-1",
      name: "Cocoa mass",
      hint: "Côte d’Ivoire · 12 plots",
      status: "blocked",
      why: "Deforestation risk — cannot file",
      action: "Unblock",
      kind: "danger",
      origin: "Côte d’Ivoire",
      plots: 12,
    },
    {
      id: "prod-2",
      name: "Green coffee",
      hint: "Brazil · 4 plots",
      status: "blocked",
      why: "Country risk — cannot file",
      action: "Unblock",
      kind: "danger",
      origin: "Brazil",
      plots: 4,
    },
    {
      id: "prod-3",
      name: "Palm oil, crude",
      hint: "Indonesia · 2 suppliers",
      status: "blocked",
      why: "Supply chain too complex",
      action: "Unblock",
      kind: "danger",
      origin: "Indonesia",
      suppliers: 2,
    },
    {
      id: "prod-4",
      name: "Natural rubber",
      hint: "Vietnam",
      status: "blocked",
      why: "Rights check failed",
      action: "Unblock",
      kind: "danger",
      origin: "Vietnam",
    },
    {
      id: "prod-5",
      name: "Green coffee, second lot",
      hint: "Waiting on prady",
      status: "waiting",
      why: "No reply for 21 days",
      action: "Remind",
      kind: "ghost",
    },
    {
      id: "prod-6",
      name: "Sawn wood",
      hint: "HS 4407",
      status: "incomplete",
      why: "Plot location is missing",
      action: "Finish",
      kind: "ghost",
    },
    {
      id: "prod-7",
      name: "Soybeans",
      hint: "Brazil",
      status: "incomplete",
      why: "Supplier is missing",
      action: "Finish",
      kind: "ghost",
      origin: "Brazil",
    },
  ];

  for (let i = catalog.length; i < 59; i += 1) {
    const status =
      i % 11 === 0 ? "ready" : i % 9 === 0 ? "waiting" : "incomplete";
    catalog.push({
      id: `prod-${i + 1}`,
      name: `${extraNames[i % extraNames.length]} · ${i + 1}`,
      hint: `Profile ${i + 1}`,
      status,
      why:
        status === "ready"
          ? "Negligible risk — can file"
          : status === "waiting"
            ? "Waiting on supplier"
            : "Still missing data",
      action:
        status === "ready"
          ? "View"
          : status === "waiting"
            ? "Remind"
            : "Finish",
      kind: "ghost",
    });
  }

  return catalog;
}

export const products: Product[] = seedProducts();

export const inboxNeedsYou: InboxItem[] = [
  {
    id: "req-1",
    title: "Full product profile · Cocoa beans, roasted",
    meta: "From Trusty Company 123 · Due 30 Sep · 15 days",
    due: true,
    action: "Complete",
  },
  {
    id: "req-2",
    title: "Full product profile · Cocoa beans, roasted",
    meta: "From Trusty Company 123 · Due 15 Oct",
    action: "Complete",
  },
];

export const inboxWaiting: InboxItem[] = [
  {
    id: "wait-1",
    title: "prady · Product profile",
    meta: "Waiting 21 days · no reply yet",
    waiting: true,
    action: "Nudge",
  },
  {
    id: "wait-2",
    title: "prady · Product profile",
    meta: "Cancelled 25 Aug",
    cancelled: true,
  },
];

const resolveCopy: Record<string, Omit<ResolveInfo, "productId">> = {
  "prod-1": {
    title: "Cocoa mass — cannot file",
    summary:
      "Deforestation risk. Filing is blocked until this is resolved. Evidence is one click away.",
    verdictUrl: "#",
    options: [
      {
        title: "1. Fix it yourself",
        body: "Ask the supplier for plot geolocation that is outside the risk area, or replace this source. You stay in control; it can take longer.",
        action: "Request new plot data",
      },
      {
        title: "2. We can run this for you",
        body: "Activate the deforestation module for this risk. We monitor it for 12 months. Optional — you can comply without buying this.",
        action: "Review module",
        featured: true,
      },
    ],
    note: "Buying is one way to resolve this risk. It is not required by the regulation. You can also fix the data yourself and file when the verdict is negligible.",
  },
};

export function resolveInfoFor(product: Product): ResolveInfo {
  const preset = resolveCopy[product.id];
  if (preset) {
    return { productId: product.id, ...preset };
  }

  return {
    productId: product.id,
    title: `${product.name} — cannot file`,
    summary: `${product.why}. Filing is blocked until this is resolved.`,
    verdictUrl: "#",
    options: [
      {
        title: "1. Fix it yourself",
        body: "Update the missing or high-risk data, then re-run the check. You stay in control; it can take longer.",
        action: "Request new plot data",
      },
      {
        title: "2. We can run this for you",
        body: "Activate the matching risk module. Optional — you can comply without buying this.",
        action: "Review module",
        featured: true,
      },
    ],
    note: "Buying is one way to resolve this risk. It is not required by the regulation. You can also fix the data yourself and file when the verdict is negligible.",
  };
}
