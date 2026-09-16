import { Box, Flex, Text } from "@chakra-ui/react";
import { Button } from "../ui/Button";
import { StatusLabel } from "../ui/StatusLabel";

interface InboxRowProps {
  title: string;
  meta: string;
  action?: string;
  emphasis?: "due" | "wait";
  primary?: boolean;
  badge?: string;
}

export function InboxRow({
  title,
  meta,
  action,
  emphasis,
  primary,
  badge,
}: InboxRowProps) {
  return (
    <Flex py="3" borderTopWidth="1px" _first={{ borderTopWidth: 0, pt: 0 }} justify="space-between" gap="3" align="center">
      <Box>
        <Text fontSize="sm">{title}</Text>
        <Text
          fontSize="xs"
          color={emphasis === "due" ? "red.700" : emphasis === "wait" ? "orange.700" : "fg.muted"}
          fontWeight={emphasis ? "semibold" : "normal"}
        >
          {meta}
        </Text>
      </Box>
      {badge ? <StatusLabel tone="muted">{badge}</StatusLabel> : null}
      {action ? <Button size="sm" variant={primary ? "primary" : "ghost"}>{action}</Button> : null}
    </Flex>
  );
}
