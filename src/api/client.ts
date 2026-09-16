import type {
  CompanyProfile,
  PageResult,
  Product,
  ProductProfile,
  ResolveInfo,
  Session,
  StatementPage,
} from "../types/api";
import { apiList } from "./apiList";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: {
      Accept: "application/json",
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
  });

  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const payload = (await response.json()) as { error?: string };
      if (payload.error) message = payload.error;
    } catch {
      // Keep the generic status message when the body is not JSON.
    }
    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

export const api = {
  getSession: () => request<Session>(apiList.session),
  loginSession: (appId: string) => request<Session>(apiList.sessionByAppId(appId)),
  getProfile: () => request<ProductProfile>(apiList.profile),
  getProducts: (params: { page: number; pageSize: number; status: string; q: string }) =>
    request<PageResult<Product>>(apiList.productsQuery(params)),
  createProduct: (input: { name: string; origin: string }) =>
    request<Product>(apiList.products, { method: "POST", body: JSON.stringify(input) }),
  nudgeProduct: (id: string) =>
    request<{ ok: boolean; message: string }>(apiList.nudgeProduct(id), { method: "POST" }),
  getResolveInfo: (id: string) => request<ResolveInfo>(apiList.resolveProduct(id)),
  getCompany: () => request<CompanyProfile>(apiList.company),
  updateCompany: (input: {
    companyName: string;
    vatNumber: string;
    country: string;
    size: string;
    address: string;
    city: string;
    contact: CompanyProfile["contact"];
  }) => request<CompanyProfile>(apiList.company, { method: "PATCH", body: JSON.stringify(input) }),
  changeEori: (input: { eori: string; reason: string }) =>
    request<CompanyProfile>(apiList.companyEori, { method: "POST", body: JSON.stringify(input) }),
  getStatements: (params: {
    page: number;
    pageSize: number;
    q: string;
    queue: string;
    supplier: string;
    product: string;
    ref: string;
    sku: string;
    role: string;
  }) => request<StatementPage>(apiList.statementsQuery(params)),
  submitStatement: (id: string) =>
    request<StatementPage["items"][number]>(apiList.submitStatement(id), { method: "POST" }),
  generateStatements: (input: {
    ids?: string[];
    q?: string;
    queue?: string;
    supplier?: string;
    product?: string;
    ref?: string;
    sku?: string;
    role?: string;
  }) =>
    request<{ ok: boolean; generated: { id: string; name: string; supplier: string }[] }>(
      apiList.generateStatements,
      { method: "POST", body: JSON.stringify(input) },
    ),
};
