import { Box, Checkbox, Flex, Stack, Text } from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import { Banner } from "../components/ui/Banner";
import { Button } from "../components/ui/Button";
import { Drawer } from "../components/ui/Drawer";
import { FilterInput, FilterSelect } from "../components/ui/FilterField";
import { Modal } from "../components/ui/Modal";
import { PageHeader } from "../components/ui/PageHeader";
import { Pagination } from "../components/ui/Pagination";
import { SearchInput } from "../components/ui/SearchInput";
import { StatusLabel } from "../components/ui/StatusLabel";
import { Table, type TableColumn } from "../components/ui/Table";
import { Tabs } from "../components/ui/Tabs";
import type { Statement, StatementPage } from "../types/api";
import { useAppHref } from "../utils/appId";
import { parseDdsFilters, DDS_FILTER_DEFAULTS, useFilterParams } from "../utils/listQuery";
import { bannerFor, generatePool as getGeneratePool } from "../utils/dds";
import { errorMessage } from "../utils/error";

type DdsState = {
  page: StatementPage | null;
  error: string | null;
  selected: Set<string>;
  resolveName: string | null;
  confirmRow: Statement | null;
  lockedOpen: boolean;
  generateOpen: boolean;
};

const initialState: DdsState = {
  page: null,
  error: null,
  selected: new Set(),
  resolveName: null,
  confirmRow: null,
  lockedOpen: false,
  generateOpen: false,
};

export function DdsPage() {
  const href = useAppHref();
  const [filters, setFilters] = useFilterParams(DDS_FILTER_DEFAULTS, parseDdsFilters);
  const [state, setState] = useState<DdsState>(initialState);
  const [debouncedQuery, setDebouncedQuery] = useState(filters.q);
  const {
    page,
    error,
    selected,
    resolveName,
    confirmRow,
    lockedOpen,
    generateOpen,
  } = state;
  const { page: pageNumber, pageSize, queue, supplier, product, ref, sku, role } = filters;

  function patch(next: Partial<DdsState>) {
    setState((current) => ({ ...current, ...next }));
  }

  function setFilter(next: Partial<typeof filters>) {
    setFilters({ ...next, page: 1 });
  }

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(filters.q), 250);
    return () => window.clearTimeout(timer);
  }, [filters.q]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        patch({ error: null });
        const next = await api.getStatements({
          page: pageNumber,
          pageSize,
          q: debouncedQuery,
          queue,
          supplier,
          product,
          ref,
          sku,
          role,
        });
        if (cancelled) return;
        patch({ page: next });
        if (next.page !== pageNumber) setFilters({ page: next.page });
      } catch (err) {
        if (!cancelled) patch({ error: errorMessage(err, "Could not load statements") });
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [pageNumber, pageSize, debouncedQuery, queue, supplier, product, ref, sku, role, setFilters]);

  const generatePool = useMemo(() => getGeneratePool(page, selected), [page, selected]);

  if (error && !page) return <Box bg="white" rounded="2xl" p="4" color="fg.muted">{error}</Box>;
  if (!page) return <Box bg="white" rounded="2xl" p="4" color="fg.muted">Loading statements…</Box>;

  const banner = bannerFor(queue, page);

  const columns: TableColumn<Statement>[] = [
    {
      id: "check",
      header: (
        <RowCheck
          checked={page.items.length > 0 && page.items.every((row) => selected.has(row.id))}
          onChange={(checked) => {
            const next = new Set(selected);
            page.items.forEach((row) => {
              if (checked) next.add(row.id);
              else next.delete(row.id);
            });
            patch({ selected: next });
          }}
          label="Select all on this page"
        />
      ),
      cell: (row) => (
        <RowCheck
          checked={selected.has(row.id)}
          onChange={(checked) => {
            const next = new Set(selected);
            if (checked) next.add(row.id);
            else next.delete(row.id);
            patch({ selected: next });
          }}
        />
      ),
    },
    {
      id: "ref",
      header: "Internal Reference Number",
      cell: (row) => (
        <Text fontFamily="mono" fontSize="xs">
          {row.ref}
        </Text>
      ),
    },
    {
      id: "sku",
      header: "SKU",
      cell: (row) => (
        <Box>
          <Text fontWeight="bold">{row.sku}</Text>
          <Text fontSize="xs" color="fg.muted">{row.name}</Text>
        </Box>
      ),
    },
    { id: "supplier", header: "Supplier Company Names", cell: (row) => row.supplier },
    {
      id: "risk",
      header: "Risk Level",
      cell: (row) => (
        <StatusLabel tone={row.risk === "Non-negligible" ? "bad" : "ok"}>
          {row.risk === "Non-negligible" ? "Non-negligible" : "Negligible"}
        </StatusLabel>
      ),
    },
    { id: "role", header: "Your Role", cell: (row) => row.role },
    { id: "progress", header: "Statement Progress", cell: (row) => row.progress },
    {
      id: "action",
      header: "Next step",
      cell: (row) => <NextStep row={row} onResolve={(name) => patch({ resolveName: name })} onConfirm={(next) => patch({ confirmRow: next })} onLocked={() => patch({ lockedOpen: true })} />,
    },
  ];

  return (
    <Stack gap="4">
      <PageHeader title="Due Diligence Statements" lede="DDS files are generated from your product profiles." />

      <Banner
        tone={banner.tone}
        pill={banner.pill}
        title={banner.title}
        detail={banner.detail}
        cta="Generate files"
        ctaDisabled={page.readyInView === 0 && generatePool.ready.length === 0}
        onCta={() => patch({ generateOpen: true })}
      />

      <Box bg="white" rounded="2xl" overflow="hidden">
        <Flex px="4" py="3.5" justify="space-between" gap="3" wrap="wrap" align="center" borderBottomWidth="1px">
          <Tabs
            activeId={queue}
            onChange={(id) => setFilter({ queue: id })}
            items={[
              { id: "all", label: "All" },
              { id: "blocked", label: "Blocked", tone: "bad" },
              { id: "ready", label: "Ready", tone: "ok" },
              { id: "submitted", label: "Submitted" },
            ]}
          />
          <SearchInput
            placeholder="Search product…"
            width={{ base: "full", md: "280px" }}
            rounded="xl"
            value={filters.q}
            onChange={(event) => setFilter({ q: event.target.value })}
          />
        </Flex>
        <Flex px="4" py="3.5" gap="2" wrap="wrap" align="center">
          <FilterSelect value={supplier} placeholder="All suppliers" items={page.filters.suppliers} onChange={(value) => setFilter({ supplier: value })} />
          <FilterSelect value={product} placeholder="All products" items={page.filters.products} onChange={(value) => setFilter({ product: value })} />
          <FilterInput
            placeholder="Reference #"
            value={ref}
            maxW="148px"
            onChange={(event) => setFilter({ ref: event.target.value })}
          />
          <FilterInput
            placeholder="SKU"
            value={sku}
            maxW="120px"
            onChange={(event) => setFilter({ sku: event.target.value })}
          />
          <FilterSelect value={role} placeholder="All roles" items={page.filters.roles} onChange={(value) => setFilter({ role: value })} />
          <FilterSelect
            value={queue === "all" ? "" : queue}
            placeholder="All statuses"
            items={["blocked", "ready", "submitted"]}
            onChange={(value) => setFilter({ queue: value || "all" })}
          />
        </Flex>
        <Table columns={columns} rows={page.items} rowKey={(row) => row.id} empty="No statements match these filters." />
        <Pagination
          page={page.page}
          pageSize={page.pageSize}
          total={page.total}
          onPage={(next) => setFilters({ page: next })}
          onPageSize={(size) => setFilters({ pageSize: size, page: 1 })}
        />
      </Box>

      <Drawer open={Boolean(resolveName)} title={resolveName ?? "Unblock"} onClose={() => patch({ resolveName: null })}>
        <Text color="fg.muted" fontSize="sm">
          Under progress. This flow is not yet worked on.
        </Text>
      </Drawer>

      <Modal
        open={Boolean(confirmRow)}
        title="Confirm and submit"
        lede={confirmRow ? `${confirmRow.name}. Risk is negligible. EORI is set.` : ""}
        onClose={() => patch({ confirmRow: null })}
        footer={
          <>
            <Button onClick={() => patch({ confirmRow: null })}>Cancel</Button>
            <Button
              variant="primary"
              onClick={async () => {
                if (!confirmRow) return;
                await api.submitStatement(confirmRow.id);
                patch({
                  confirmRow: null,
                  page: await api.getStatements({
                    page: pageNumber, pageSize, q: debouncedQuery, queue, supplier, product, ref, sku, role,
                  }),
                });
              }}
            >
              Confirm and submit
            </Button>
          </>
        }
      >
        <Box bg="blue.50" rounded="xl" p="3" fontSize="sm" mb="3">
          Only the client may confirm this statement. That is a legal boundary, not a disabled button. You are signed in as Robert at Trusty Company 123.
        </Box>
        <Text fontSize="xs" color="fg.muted">This files the due diligence statement to the EU system. Four-eyes: the person who overrode risk cannot also confirm.</Text>
      </Modal>

      <Modal
        open={lockedOpen}
        title="You cannot confirm this"
        lede="Four-eyes is on. You can override risk, so you cannot also confirm and submit."
        onClose={() => patch({ lockedOpen: false })}
        footer={
          <>
            <Button onClick={() => patch({ lockedOpen: false })}>Close</Button>
            <Button variant="primary" asChild>
              <Link to={href("/permissions")}>Open Permissions</Link>
            </Button>
          </>
        }
      >
        <Box bg="red.50" color="red.800" rounded="xl" p="3" fontSize="sm">
          Ask a colleague who does <strong>not</strong> hold risk override to confirm. We do not grey out the button with no explanation.
        </Box>
      </Modal>

      <Modal
        open={generateOpen}
        title="Generate from this list"
        lede={generatePool.ready.length ? "These Ready statements will be generated from your filters/selection." : "Nothing Ready to generate."}
        onClose={() => patch({ generateOpen: false })}
        footer={
          <>
            <Button onClick={() => patch({ generateOpen: false })}>Cancel</Button>
            <Button
              variant="primary"
              disabled={generatePool.ready.length === 0}
              onClick={async () => {
                await api.generateStatements(
                  selected.size
                    ? { ids: generatePool.ready.map((row) => row.id) }
                    : { q: debouncedQuery, queue, supplier, product, ref, sku, role },
                );
                patch({ generateOpen: false });
              }}
            >
              Generate statements
            </Button>
          </>
        }
      >
        {generatePool.skipped > 0 ? (
          <Box bg="orange.50" rounded="xl" p="3" fontSize="sm" mb="3">
            {generatePool.skipped} selected/filtered rows are Blocked, Submitted, or locked by four-eyes — they will be skipped.
          </Box>
        ) : null}
        <Box as="ul" pl="4" fontSize="sm">
          {generatePool.ready.length ? generatePool.ready.map((row) => (
            <li key={row.id}>{row.name} · {row.supplier}</li>
          )) : <li>None</li>}
        </Box>
      </Modal>
    </Stack>
  );
}

function RowCheck({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
}) {
  return (
    <Checkbox.Root
      checked={checked}
      onCheckedChange={(event) => onChange(event.checked === true)}
      aria-label={label}
    >
      <Checkbox.HiddenInput />
      <Checkbox.Control>
        <Checkbox.Indicator />
      </Checkbox.Control>
    </Checkbox.Root>
  );
}

function NextStep({
  row,
  onResolve,
  onConfirm,
  onLocked,
}: {
  row: Statement;
  onResolve: (name: string) => void;
  onConfirm: (row: Statement) => void;
  onLocked: () => void;
}) {
  if (row.queue === "blocked") {
    return <Button variant="danger" onClick={() => onResolve(row.name)}>Review Risk</Button>;
  }
  if (row.queue === "ready" && row.locked) {
    return <Button onClick={onLocked}>Why you cannot confirm</Button>;
  }
  if (row.queue === "ready") {
    return <Button variant="primary" onClick={() => onConfirm(row)}>Confirm and submit</Button>;
  }
  return <Button>View statement</Button>;
}
