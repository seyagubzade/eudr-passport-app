import { Box } from "@chakra-ui/react";

export function StatusBox({ children }: { children: string }) {
  return (
    <Box bg="white" rounded="2xl" p="4" color="fg.muted" fontSize="sm">
      {children}
    </Box>
  );
}
