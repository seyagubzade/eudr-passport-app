import { Box, Flex, Text } from "@chakra-ui/react";
import type { Product } from "../../types/api";
import { statusLabel, statusTone } from "../../utils/product";
import { Button } from "../ui/Button";
import { StatusLabel } from "../ui/StatusLabel";

interface ProductCardProps {
  product: Product;
  onAction: () => void;
}

export function ProductCard({ product, onAction }: ProductCardProps) {
  return (
    <Box py="4" borderTopWidth="1px">
      <Flex justify="space-between" align="flex-start" gap="3">
        <Box minW="0">
          <Text fontWeight="bold">{product.name}</Text>
          <Text fontSize="xs" color="fg.muted" mt="0.5">{product.hint}</Text>
        </Box>
        <StatusLabel tone={statusTone[product.status]} caps solid>
          {statusLabel[product.status]}
        </StatusLabel>
      </Flex>
      <Text fontSize="sm" mt="2">{product.why}</Text>
      <Button
        w="full"
        mt="3"
        variant={product.kind === "danger" ? "danger" : "ghost"}
        onClick={onAction}
      >
        {product.action}
      </Button>
    </Box>
  );
}
