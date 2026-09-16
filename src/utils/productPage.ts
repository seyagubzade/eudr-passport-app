import { api } from "../api/client";
import type { Product, ProductStatus } from "../types/api";

export async function loadProductPage(params: {
  page: number;
  pageSize: number;
  status: "all" | ProductStatus;
  q: string;
}) {
  const [profile, products] = await Promise.all([
    api.getProfile(),
    api.getProducts(params),
  ]);
  return { profile, products };
}

export async function createProductAndReload(input: {
  name: string;
  origin: string;
  pageSize: number;
}) {
  await api.createProduct({ name: input.name, origin: input.origin });
  return loadProductPage({
    page: 1,
    pageSize: input.pageSize,
    status: "all",
    q: "",
  });
}

export async function runProductAction(product: Product) {
  if (product.status === "blocked") {
    return { kind: "blocked" as const, name: product.name };
  }
  if (product.status === "waiting") {
    const result = await api.nudgeProduct(product.id);
    return { kind: "notice" as const, message: result.message };
  }
  return {
    kind: "notice" as const,
    message: `${product.action} is mocked for ${product.name}.`,
  };
}
