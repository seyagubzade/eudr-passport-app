import { Box, Field, Input, NativeSelect, Text, Textarea, type InputProps, type TextareaProps } from "@chakra-ui/react";
import type { ReactNode, SelectHTMLAttributes } from "react";

export function FieldValue({ label, value }: { label: string; value: string }) {
  return (
    <Box>
      <Text fontSize="12px" color="fg.muted" mb="1">
        {label}
      </Text>
      <Text fontSize="sm" fontWeight="semibold">
        {value}
      </Text>
    </Box>
  );
}

export function FormField({
  label,
  full,
  children,
}: {
  label: string;
  full?: boolean;
  children: ReactNode;
}) {
  return (
    <Field.Root gridColumn={full ? "1 / -1" : undefined}>
      <Field.Label>{label}</Field.Label>
      {children}
    </Field.Root>
  );
}

export function TextInput(props: InputProps) {
  return <Input rounded="xl" {...props} />;
}

export function TextArea(props: TextareaProps) {
  return <Textarea rounded="xl" {...props} />;
}

export function Select(props: Omit<SelectHTMLAttributes<HTMLSelectElement>, "size">) {
  return (
    <NativeSelect.Root>
      <NativeSelect.Field rounded="xl" {...props} />
      <NativeSelect.Indicator />
    </NativeSelect.Root>
  );
}

export { FieldValue as Field };
