import { Badge } from "@chakra-ui/react";
import type { StatusTone } from "../../types/api";

const palettes: Record<StatusTone, string> = {
  ok: "green",
  bad: "red",
  warn: "orange",
  idle: "gray",
  muted: "gray",
};

export function StatusLabel({
  tone = "idle",
  caps,
  solid,
  children,
}: {
  tone?: StatusTone;
  caps?: boolean;
  solid?: boolean;
  children: string;
}) {
  return (
    <Badge
      colorPalette={palettes[tone]}
      variant={solid ? "solid" : "subtle"}
      rounded="full"
      px="2.5"
      py="0.5"
      textTransform={caps ? "uppercase" : "none"}
      letterSpacing={caps ? "0.04em" : "normal"}
      fontSize="10px"
      fontWeight="bold"
      flexShrink={0}
    >
      {children}
    </Badge>
  );
}
