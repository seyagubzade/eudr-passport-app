import { Box, Flex, Grid, Heading, SimpleGrid, Stack, Text } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { InboxRow } from "../components/product/InboxRow";
import { ProductCard } from "../components/product/ProductCard";
import { productColumns } from "../components/product/productColumns";
import { StatusBox } from "../components/product/StatusBox";
import { Banner } from "../components/ui/Banner";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Drawer } from "../components/ui/Drawer";
import { FormField, TextInput } from "../components/ui/Field";
import { ModalForm } from "../components/ui/Modal";
import { PageHeader } from "../components/ui/PageHeader";
import { Pagination } from "../components/ui/Pagination";
import { SearchInput } from "../components/ui/SearchInput";
import { StatusLabel } from "../components/ui/StatusLabel";
import { Table } from "../components/ui/Table";
import { FilterChip } from "../components/ui/Tabs";
import type { Product, ProductProfile } from "../types/api";
import { errorMessage } from "../utils/error";
import { parseProductFilters, PRODUCT_FILTER_DEFAULTS, useFilterParams } from "../utils/listQuery";
import { statusFilters, statusToneFromGate } from "../utils/product";
import { createProductAndReload, loadProductPage, runProductAction } from "../utils/productPage";

export function ProductProfilePage() {
  const [filters, setFilters] = useFilterParams(PRODUCT_FILTER_DEFAULTS, parseProductFilters);
  const [profile, setProfile] = useState<ProductProfile | null>(null);
  const [items, setItems] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [debouncedQuery, setDebouncedQuery] = useState(filters.q);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [resolveName, setResolveName] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [addBusy, setAddBusy] = useState(false);
  const [name, setName] = useState("");
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(filters.q), 250);
    return () => window.clearTimeout(timer);
  }, [filters.q]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setError(null);
        const { profile: nextProfile, products } = await loadProductPage({
          page: filters.page,
          pageSize: filters.pageSize,
          status: filters.status,
          q: debouncedQuery,
        });
        if (cancelled) return;
        setProfile(nextProfile);
        setItems(products.items);
        setTotal(products.total);
        if (products.page !== filters.page) setFilters({ page: products.page });
      } catch (err) {
        if (!cancelled) setError(errorMessage(err, "Could not load products"));
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, filters.page, filters.pageSize, filters.status, setFilters]);

  async function handleAction(product: Product) {
    const result = await runProductAction(product);
    if (result.kind === "blocked") {
      setResolveName(result.name);
      return;
    }
    setNotice(result.message);
  }

  async function handleAdd() {
    try {
      setAddBusy(true);
      const { profile: nextProfile, products } = await createProductAndReload({
        name,
        origin,
        pageSize: filters.pageSize,
      });
      setAddOpen(false);
      setName("");
      setOrigin("");
      setFilters({ page: 1, status: "all", q: "" });
      setDebouncedQuery("");
      setProfile(nextProfile);
      setItems(products.items);
      setTotal(products.total);
    } finally {
      setAddBusy(false);
    }
  }

  if (error && !profile) return <StatusBox>{error}</StatusBox>;
  if (!profile) return <StatusBox>Loading product profile…</StatusBox>;

  return (
    <Stack gap="4">
      <PageHeader title="Product profile" lede="What you can file, what is blocking you, and what to do next." />
      {notice ? <StatusBox>{notice}</StatusBox> : null}

      <Banner
        tone={profile.banner.tone}
        pill={profile.banner.pill}
        title={profile.banner.title}
        detail={profile.banner.detail}
        cta={profile.banner.cta}
      />

      <SimpleGrid columns={{ base: 1, md: 4 }} gap="3">
        {profile.gates.map((gate) => (
          <Box key={gate.key} bg="white" rounded="2xl" p="4">
            <Flex justify="space-between" align="center" mb="2">
              <Text fontSize="xs" color="fg.muted">{gate.label}</Text>
              <StatusLabel tone={statusToneFromGate(gate.tone)}>{gate.pill}</StatusLabel>
            </Flex>
            <Text fontWeight="bold" fontSize="lg">{gate.value}</Text>
            <Text fontSize="xs" color="fg.muted" mt="1">{gate.detail}</Text>
          </Box>
        ))}
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, md: 2 }} gap="3">
        <Card title={<>Needs you <StatusLabel tone="warn">2 due</StatusLabel></>}>
          {profile.needsYou.map((item) => (
            <InboxRow key={item.id} title={item.title} meta={item.meta} emphasis={item.due ? "due" : undefined} action={item.action} primary={item.due} />
          ))}
        </Card>
        <Card title={<>Waiting on others <StatusLabel tone="muted">1 late</StatusLabel></>}>
          {profile.waitingOnOthers.map((item) => (
            <InboxRow
              key={item.id}
              title={item.title}
              meta={item.meta}
              emphasis={item.waiting ? "wait" : undefined}
              action={item.cancelled ? undefined : item.action}
              badge={item.cancelled ? "Cancelled" : undefined}
            />
          ))}
        </Card>
      </SimpleGrid>

      <Flex justify="space-between" align={{ base: "stretch", md: "flex-end" }} gap="3" direction={{ base: "column", md: "row" }}>
        <Box>
          <Heading size="md">Your products</Heading>
          <Text fontSize="sm" color="fg.muted">The 4 blocked items stay on top. The full list is a table with pages — 10 at a time.</Text>
        </Box>
        <Button variant="primary" w={{ base: "full", md: "auto" }} onClick={() => setAddOpen(true)}>+ Add product</Button>
      </Flex>

      <Box bg="white" rounded="2xl" overflow="hidden">
        <Flex px="5" py="4" direction={{ base: "column", md: "row" }} justify="space-between" gap="3" align={{ md: "center" }}>
          <Text fontWeight="bold" fontSize="md">
            All products{total ? ` · ${total}` : ""}
          </Text>
          <Flex gap="2" wrap="wrap" align="center" direction={{ base: "column", md: "row" }}>
            <SearchInput
              width={{ base: "full", md: "220px" }}
              placeholder="Search product..."
              value={filters.q}
              onChange={(event) => setFilters({ q: event.target.value, page: 1 })}
            />
            <Flex gap="2" wrap="wrap" w={{ base: "full", md: "auto" }}>
              {statusFilters.map((filter) => (
                <FilterChip
                  key={filter.id}
                  label={filter.label}
                  active={filters.status === filter.id}
                  onClick={() => setFilters({ status: filter.id, page: 1 })}
                />
              ))}
            </Flex>
          </Flex>
        </Flex>
        <Box display={{ base: "none", md: "block" }}>
          <Table columns={productColumns((product) => void handleAction(product))} rows={items} rowKey={(row) => row.id} empty="No products match these filters." />
        </Box>
        <Box display={{ base: "block", md: "none" }} px="5">
          {items.length === 0 ? (
            <Text color="fg.muted" textAlign="center" py="8">No products match these filters.</Text>
          ) : (
            items.map((product) => (
              <ProductCard key={product.id} product={product} onAction={() => void handleAction(product)} />
            ))
          )}
        </Box>
        <Pagination
          page={filters.page}
          pageSize={filters.pageSize}
          total={total}
          onPage={(next) => setFilters({ page: next })}
          onPageSize={(size) => setFilters({ pageSize: size, page: 1 })}
        />
      </Box>

      <Drawer open={Boolean(resolveName)} title={resolveName ?? "Unblock"} onClose={() => setResolveName(null)}>
        <Text color="fg.muted" fontSize="sm">
          Under progress. This flow is not yet worked on.
        </Text>
      </Drawer>

      <ModalForm
        open={addOpen}
        title="Add product"
        lede="Creates a new incomplete profile on the mock server."
        submitLabel="Add product"
        busy={addBusy}
        onClose={() => setAddOpen(false)}
        onSubmit={handleAdd}
      >
        <Grid gap="3">
          <FormField label="Product name" full>
            <TextInput value={name} maxLength={120} required onChange={(event) => setName(event.target.value)} />
          </FormField>
          <FormField label="Origin (optional)" full>
            <TextInput value={origin} maxLength={80} onChange={(event) => setOrigin(event.target.value)} />
          </FormField>
        </Grid>
      </ModalForm>
    </Stack>
  );
}
