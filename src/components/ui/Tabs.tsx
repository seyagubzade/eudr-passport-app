import { HStack } from "@chakra-ui/react";
import { Button } from "./Button";

interface TabItem {
  id: string;
  label: string;
  tone?: "bad" | "ok" | "";
}

export function Tabs({
  items,
  activeId,
  onChange,
}: {
  items: TabItem[];
  activeId: string;
  onChange: (id: string) => void;
}) {
  return (
    <HStack gap="2" wrap="wrap">
      {items.map((item) => {
        const active = activeId === item.id;
        const variant = active && item.tone === "bad" ? "danger-solid" : active && item.tone === "ok" ? "primary" : active ? "primary" : "ghost";
        return (
          <Button key={item.id} size="sm" rounded="full" variant={variant} onClick={() => onChange(item.id)}>
            {item.label}
          </Button>
        );
      })}
    </HStack>
  );
}

export function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <Button size="sm" rounded="full" variant={active ? "primary" : "ghost"} onClick={onClick}>
      {label}
    </Button>
  );
}
