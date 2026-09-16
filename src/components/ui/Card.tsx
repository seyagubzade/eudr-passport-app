import { Card as ChakraCard, Flex } from "@chakra-ui/react";
import type { ReactNode } from "react";

interface CardProps {
  title?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
}

export function Card({ title, action, children }: CardProps) {
  return (
    <ChakraCard.Root rounded="2xl" bg="white" shadow="none" border="0">
      {title || action ? (
        <ChakraCard.Header px="5" pt="5" pb="0">
          <Flex
            justify="space-between"
            align={{ base: "stretch", md: "center" }}
            gap="3"
            direction={{ base: "column", md: "row" }}
          >
            {title ? <ChakraCard.Title fontSize="md">{title}</ChakraCard.Title> : <span />}
            {action}
          </Flex>
        </ChakraCard.Header>
      ) : null}
      <ChakraCard.Body px="5" py="4" pt={title || action ? "3.5" : "4"}>
        {children}
      </ChakraCard.Body>
    </ChakraCard.Root>
  );
}
