import { Input, NativeSelect, type InputProps } from "@chakra-ui/react";

const control = {
  h: "36px",
  px: "3",
  fontSize: "13px",
  bg: "white",
  borderWidth: "1px",
  borderColor: "blackAlpha.200",
  rounded: "xl",
  shadow: "none",
  color: "fg",
  _placeholder: { color: "fg.muted" },
  _focusVisible: { borderColor: "blue.400", outline: "none" },
} as const;

export function FilterInput(props: InputProps) {
  return <Input {...control} minW="0" {...props} />;
}

export function FilterSelect({
  value,
  placeholder,
  items,
  onChange,
  minW = "148px",
}: {
  value: string;
  placeholder: string;
  items: string[];
  onChange: (value: string) => void;
  minW?: string;
}) {
  return (
    <NativeSelect.Root width="auto" minW={minW} h="36px" flexShrink={0}>
      <NativeSelect.Field
        value={value}
        onChange={(event) => onChange(event.target.value)}
        h="36px"
        px="3"
        pe="8"
        fontSize="13px"
        bg="white"
        borderWidth="1px"
        borderColor="blackAlpha.200"
        rounded="xl"
        shadow="none"
        color={value ? "fg" : "fg.muted"}
        css={{ appearance: "none" }}
      >
        <option value="">{placeholder}</option>
        {items.map((item) => (
          <option key={item} value={item}>
            {item[0].toUpperCase() + item.slice(1)}
          </option>
        ))}
      </NativeSelect.Field>
      <NativeSelect.Indicator />
    </NativeSelect.Root>
  );
}
