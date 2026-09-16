import { Avatar, Flex, IconButton, Text } from "@chakra-ui/react";
import type { Session } from "../../types/api";
import { Icon } from "../Icon";
import { Button } from "../ui/Button";

interface AppHeaderProps {
  session: Session | null;
  onMenuClick: () => void;
}

export function AppHeader({ session, onMenuClick }: AppHeaderProps) {
  return (
    <Flex
      as="header"
      h="64px"
      px="5"
      align="center"
      justify="space-between"
      bg="white"
      borderBottomWidth="1px"
      gap="3"
      zIndex="20"
    >
      <Flex align="center" gap="3" minW="0">
        <IconButton variant="ghost" rounded="lg" aria-label="Open menu" onClick={onMenuClick}>
          <Icon name="menu" />
        </IconButton>
        <Flex
          boxSize="32px"
          rounded="10px"
          bg="blue.50"
          color="brand.500"
          align="center"
          justify="center"
          fontSize="11px"
          fontWeight="extrabold"
        >
          RG
        </Flex>
        <Text fontSize="lg" fontWeight="bold" color="brand.500" whiteSpace="nowrap">
          EUDR Passport
        </Text>
      </Flex>
      <Flex align="center" gap="2.5" fontSize="sm" color="fg.muted">
        <Text fontWeight="semibold" color="fg" display={{ base: "none", md: "block" }}>
          {session?.name ?? "—"}
        </Text>
        <Avatar.Root size="sm" bg="gray.100" color="fg">
          <Avatar.Fallback>{session?.initials ?? "RG"}</Avatar.Fallback>
        </Avatar.Root>
        <Button variant="ghost">Log out</Button>
      </Flex>
    </Flex>
  );
}
