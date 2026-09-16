import { Input, InputGroup, type InputProps } from "@chakra-ui/react";
import { Icon } from "../Icon";

export function SearchInput({ width, rounded = "full", ...props }: InputProps) {
  return (
    <InputGroup
      startElement={<Icon name="search" size={14} />}
      w={width ?? { base: "full", md: "220px" }}
      flexShrink={0}
    >
      <Input type="search" rounded={rounded} size="sm" h="36px" bg="white" fontSize="13px" {...props} />
    </InputGroup>
  );
}
