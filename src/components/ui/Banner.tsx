import { Flex, Heading, Text } from "@chakra-ui/react";
import type { ReactNode } from "react";
import type { BannerTone, StatusTone } from "../../types/api";
import { Button } from "./Button";
import { StatusLabel } from "./StatusLabel";

const toneMap: Record<BannerTone, StatusTone> = {
  ok: "ok",
  bad: "bad",
  idle: "idle",
};

interface BannerProps {
  tone?: BannerTone;
  pill?: string;
  title: ReactNode;
  detail: ReactNode;
  action?: ReactNode;
  cta?: string;
  ctaDisabled?: boolean;
  onCta?: () => void;
}

export function Banner({
  tone = "idle",
  pill,
  title,
  detail,
  action,
  cta,
  ctaDisabled,
  onCta,
}: BannerProps) {
  return (
    <Flex
      bg="white"
      rounded="2xl"
      p="5"
      gap="4"
      align={{ base: "stretch", md: "center" }}
      justify="space-between"
      direction={{ base: "column", md: "row" }}
    >
      <div>
        <Heading size="md" display="flex" alignItems="center" gap="2" flexWrap="wrap">
          {pill ? (
            <StatusLabel tone={toneMap[tone]} caps solid>
              {pill}
            </StatusLabel>
          ) : null}{" "}
          {title}
        </Heading>
        <Text mt="1.5" fontSize="sm" color="fg.muted">
          {detail}
        </Text>
      </div>
      {action}
      {cta ? (
        <Button variant="primary" disabled={ctaDisabled} onClick={onCta}>
          {cta}
        </Button>
      ) : null}
    </Flex>
  );
}
