import { Button as ChakraButton, type ButtonProps as ChakraButtonProps } from "@chakra-ui/react";

type Variant = "primary" | "ghost" | "danger" | "danger-solid" | "purple";

interface ButtonProps extends Omit<ChakraButtonProps, "variant"> {
  variant?: Variant;
}

const mapped = {
  primary: { colorPalette: "blue", variant: "solid" },
  ghost: { colorPalette: "gray", variant: "outline" },
  danger: { colorPalette: "red", variant: "outline" },
  "danger-solid": { colorPalette: "red", variant: "solid" },
  purple: { colorPalette: "purple", variant: "outline" },
} as const;

export function Button({ variant = "ghost", size = "sm", children, ...props }: ButtonProps) {
  const look = mapped[variant];
  return (
    <ChakraButton
      colorPalette={look.colorPalette}
      variant={look.variant}
      size={size}
      rounded="xl"
      fontWeight="semibold"
      bg={variant === "purple" ? "white" : undefined}
      color={variant === "purple" ? "purple.600" : undefined}
      _hover={variant === "purple" ? { bg: "white" } : undefined}
      {...props}
    >
      {children}
    </ChakraButton>
  );
}
