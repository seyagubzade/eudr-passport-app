import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";

const config = defineConfig({
  theme: {
    breakpoints: {
      sm: "480px",
      md: "768px",
      lg: "980px",
      xl: "1280px",
      "2xl": "1536px",
    },
    tokens: {
      fonts: {
        heading: { value: "Inter, ui-sans-serif, system-ui, sans-serif" },
        body: { value: "Inter, ui-sans-serif, system-ui, sans-serif" },
      },
      colors: {
        brand: {
          50: { value: "#e8f7fc" },
          100: { value: "#c5ebf7" },
          400: { value: "#33b5e6" },
          500: { value: "#00a3e0" },
          600: { value: "#0089bd" },
        },
      },
    },
  },
  globalCss: {
    html: { height: "100%", overflow: "hidden" },
    body: {
      height: "100%",
      overflow: "hidden",
      bg: "#f2f2f7",
      color: "#1a1a1a",
    },
    "#root": { height: "100%" },
  },
});

export const system = createSystem(defaultConfig, config);
