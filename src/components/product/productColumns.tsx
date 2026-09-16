import { Box, Text } from "@chakra-ui/react";
import type { Product } from "../../types/api";
import { statusLabel, statusTone } from "../../utils/product";
import { Button } from "../ui/Button";
import { StatusLabel } from "../ui/StatusLabel";
import type { TableColumn } from "../ui/Table";

export function productColumns(onAction: (product: Product) => void): TableColumn<Product>[] {
  return [
    {
      id: "product",
      header: "Product",
      cell: (product) => (
        <Box>
          <Text fontWeight="bold" fontSize="sm">{product.name}</Text>
          <Text fontSize="xs" color="fg.muted" mt="0.5">{product.hint}</Text>
        </Box>
      ),
    },
    {
      id: "status",
      header: "Status",
      width: "140px",
      cell: (product) => (
        <StatusLabel tone={statusTone[product.status]} caps>
          {statusLabel[product.status]}
        </StatusLabel>
      ),
    },
    { id: "why", header: "Why", cell: (product) => product.why },
    {
      id: "action",
      header: "Action",
      align: "end",
      width: "120px",
      cell: (product) => (
        <Button
          size="xs"
          rounded="lg"
          variant={product.kind === "danger" ? "danger" : "ghost"}
          onClick={() => onAction(product)}
        >
          {product.action}
        </Button>
      ),
    },
  ];
}
