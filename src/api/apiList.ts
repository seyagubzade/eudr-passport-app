const baseUrl = "/api";

const PRODUCTS = "products";
const COMPANY = "company";
const STATEMENTS = "statements";

function withQuery(path: string, params: Record<string, string | number>) {
  const query = new URLSearchParams(
    Object.fromEntries(Object.entries(params).map(([key, value]) => [key, String(value)])),
  );
  return `${path}?${query.toString()}`;
}

export const apiList = {
  health: `${baseUrl}/health`,
  session: `${baseUrl}/session`,
  sessionByAppId: (appId: string) => `${baseUrl}/session/${encodeURIComponent(appId)}`,
  profile: `${baseUrl}/profile`,

  products: `${baseUrl}/${PRODUCTS}`,
  productsQuery: (params: { page: number; pageSize: number; status: string; q: string }) =>
    withQuery(`${baseUrl}/${PRODUCTS}`, params),
  nudgeProduct: (id: string) => `${baseUrl}/${PRODUCTS}/${encodeURIComponent(id)}/nudge`,
  resolveProduct: (id: string) => `${baseUrl}/${PRODUCTS}/${encodeURIComponent(id)}/resolve`,

  company: `${baseUrl}/${COMPANY}`,
  companyEori: `${baseUrl}/${COMPANY}/eori`,

  statements: `${baseUrl}/${STATEMENTS}`,
  statementsQuery: (params: {
    page: number;
    pageSize: number;
    q: string;
    queue: string;
    supplier: string;
    product: string;
    ref: string;
    sku: string;
    role: string;
  }) => withQuery(`${baseUrl}/${STATEMENTS}`, params),
  submitStatement: (id: string) => `${baseUrl}/${STATEMENTS}/${encodeURIComponent(id)}/submit`,
  generateStatements: `${baseUrl}/${STATEMENTS}/generate`,
} as const;
