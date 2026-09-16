import type { ReactNode } from "react";

export type IconName =
  | "menu"
  | "close"
  | "product"
  | "company"
  | "dds"
  | "permissions"
  | "suppliers"
  | "requests"
  | "search";

const paths: Record<IconName, ReactNode> = {
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  close: <path d="M6 6l12 12M18 6L6 18" />,
  product: (
    <>
      <path d="M4 8l8-4 8 4v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8z" />
      <path d="M9 20v-6h6v6" />
    </>
  ),
  company: <path d="M4 20h16M6 20V9l6-4 6 4v11M9 20v-6h6v6" />,
  dds: (
    <>
      <path d="M7 3h8l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" />
      <path d="M15 3v5h5M9 13h6M9 17h4" />
    </>
  ),
  permissions: <path d="M12 3l8 4v5c0 5-3.4 8.4-8 9-4.6-.6-8-4-8-9V7l8-4z" />,
  suppliers: (
    <>
      <path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
      <circle cx="9.5" cy="7" r="3" />
      <path d="M20 8v6M17 11h6" />
    </>
  ),
  requests: (
    <>
      <path d="M4 6h16v12H4z" />
      <path d="M4 8l8 6 8-6" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="M16 16l4 4" />
    </>
  ),
};

export function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{ flexShrink: 0, display: "block" }}
    >
      {paths[name]}
    </svg>
  );
}
