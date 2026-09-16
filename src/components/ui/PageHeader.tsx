import { Heading, Text, Stack } from "@chakra-ui/react";

export function PageHeader({ title, lede }: { title: string; lede: string }) {
  return (
    <Stack gap="1">
      <Heading size="lg">{title}</Heading>
      <Text color="fg.muted" fontSize="sm">
        {lede}
      </Text>
    </Stack>
  );
}
