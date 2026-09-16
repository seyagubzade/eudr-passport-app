import {
  HttpError,
  changeEori,
  createProduct,
  generateStatements,
  getCompany,
  getProducts,
  getProfile,
  getResolveInfo,
  getSession,
  getStatements,
  loginSession,
  nudgeProduct,
  submitStatement,
  updateCompany,
} from "../../mock-server/handlers";

async function run<T>(fn: () => T): Promise<T> {
  try {
    return fn();
  } catch (error) {
    if (error instanceof HttpError) throw new Error(error.message);
    throw error;
  }
}

export const localMock = {
  getSession: () => run(getSession),
  loginSession: (appId: string) => run(() => loginSession(appId)),
  getProfile: () => run(getProfile),
  getProducts: (params: { page: number; pageSize: number; status: string; q: string }) =>
    run(() => getProducts(params)),
  createProduct: (input: { name: string; origin: string }) => run(() => createProduct(input)),
  nudgeProduct: (id: string) => run(() => nudgeProduct(id)),
  getResolveInfo: (id: string) => run(() => getResolveInfo(id)),
  getCompany: () => run(getCompany),
  updateCompany: (input: {
    companyName: string;
    vatNumber: string;
    country: string;
    size: string;
    address: string;
    city: string;
    contact: { name: string; role: string; email: string; phone: string };
  }) => run(() => updateCompany(input)),
  changeEori: (input: { eori: string; reason: string }) => run(() => changeEori(input)),
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
  }) => run(() => getStatements(params)),
  submitStatement: (id: string) => run(() => submitStatement(id)),
  generateStatements: (input: {
    ids?: string[];
    q?: string;
    queue?: string;
    supplier?: string;
    product?: string;
    ref?: string;
    sku?: string;
    role?: string;
  }) => run(() => generateStatements(input)),
};
