import { Drawer as ChakraDrawer, Portal, Text } from "@chakra-ui/react";
import type { ReactNode } from "react";
import { Button } from "./Button";

interface DrawerProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}

export function Drawer({ open, title, onClose, children }: DrawerProps) {
  return (
    <ChakraDrawer.Root
      open={open}
      onOpenChange={(event) => {
        if (!event.open) onClose();
      }}
      placement="end"
      size="md"
    >
      <Portal>
        <ChakraDrawer.Backdrop />
        <ChakraDrawer.Positioner>
          <ChakraDrawer.Content>
            <ChakraDrawer.Header>
              <Button variant="ghost" size="sm" onClick={onClose}>
                Close
              </Button>
              <ChakraDrawer.Title mt="2">{title}</ChakraDrawer.Title>
            </ChakraDrawer.Header>
            <ChakraDrawer.Body>
              <Text as="div">{children}</Text>
            </ChakraDrawer.Body>
          </ChakraDrawer.Content>
        </ChakraDrawer.Positioner>
      </Portal>
    </ChakraDrawer.Root>
  );
}
