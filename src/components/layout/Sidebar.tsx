import { Box, Flex, IconButton, Stack, Text } from "@chakra-ui/react";
import { NavLink } from "react-router-dom";
import { useAppHref } from "../../utils/appId";
import { Icon } from "../Icon";
import { navItems } from "./nav";

interface SidebarProps {
  credits: number;
  collapsed?: boolean;
  onClose?: () => void;
  onNavigate: () => void;
}

export function Sidebar({ credits, collapsed, onClose, onNavigate }: SidebarProps) {
  const href = useAppHref();

  return (
    <Flex direction="column" bg="white" h="100%" p="3" minW="0" overflow="hidden">
      {onClose ? (
        <Flex justify="flex-end" mb="2">
          <IconButton variant="ghost" aria-label="Close menu" onClick={onClose}>
            <Icon name="close" />
          </IconButton>
        </Flex>
      ) : null}
      <Stack gap="1" flex="1" overflowY="auto" minH="0">
        {navItems.map((item) => (
          <NavLink
            key={item.path || "index"}
            to={href(item.path)}
            end={!item.path}
            title={item.label}
            onClick={onNavigate}
            style={{ textDecoration: "none" }}
          >
            {({ isActive }) => (
              <Flex
                align="center"
                gap="2.5"
                px={collapsed ? "2" : "3.5"}
                py="2.5"
                rounded="14px"
                justify={collapsed ? "center" : "flex-start"}
                bg={isActive ? "blue.50" : "transparent"}
                color={isActive ? "blue.600" : "fg"}
                fontWeight={isActive ? "semibold" : "normal"}
                fontSize="sm"
                _hover={{ bg: isActive ? "blue.50" : "blackAlpha.50" }}
              >
                <Icon name={item.icon} />
                {collapsed ? null : (
                  <Text whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">
                    {item.label}
                  </Text>
                )}
              </Flex>
            )}
          </NavLink>
        ))}
      </Stack>
      {collapsed ? null : (
        <Box mt="auto" p="3.5" fontSize="xs" color="fg.muted" borderWidth="1px" rounded="2xl">
          Credits available
          <Text color="fg" fontWeight="semibold" mt="0.5">
            {credits.toLocaleString("en-US")}
          </Text>
        </Box>
      )}
    </Flex>
  );
}
