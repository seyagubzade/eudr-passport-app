import { Flex, HStack, NativeSelect, Text } from "@chakra-ui/react";
import { pageItems, pageRange } from "../../utils/pagination";
import { Button } from "./Button";

interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPage: (page: number) => void;
  onPageSize: (size: number) => void;
}

export function Pagination({ page, pageSize, total, onPage, onPageSize }: PaginationProps) {
  const { pages, start, end } = pageRange(page, pageSize, total);
  const items = pageItems(page, pages);

  return (
    <Flex
      justify="space-between"
      wrap="wrap"
      px="4"
      py="3"
      gap="3"
      color="fg.muted"
      fontSize="sm"
      direction={{ base: "column", md: "row" }}
      align={{ base: "stretch", md: "center" }}
    >
      <Text>{total ? `Showing ${start + 1}-${end} of ${total}` : "Showing 0 of 0"}</Text>
      <HStack gap="1" overflowX="auto">
        <Button size="xs" variant="ghost" rounded="md" disabled={page === 1} onClick={() => onPage(page - 1)}>
          &lt;
        </Button>
        {items.map((item, index) =>
          item === "…" ? (
            <Text key={`e-${index}`} px="1">
              …
            </Text>
          ) : (
            <Button
              key={item}
              size="xs"
              minW="7"
              rounded="md"
              variant={item === page ? "primary" : "ghost"}
              onClick={() => onPage(item)}
            >
              {item}
            </Button>
          ),
        )}
        <Button size="xs" variant="ghost" rounded="md" disabled={page === pages} onClick={() => onPage(page + 1)}>
          &gt;
        </Button>
      </HStack>
      <HStack gap="2">
        <Text>Rows</Text>
        <NativeSelect.Root size="sm" width="72px">
          <NativeSelect.Field value={pageSize} onChange={(event) => onPageSize(Number(event.target.value))}>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </NativeSelect.Field>
          <NativeSelect.Indicator />
        </NativeSelect.Root>
      </HStack>
    </Flex>
  );
}
