import { Box } from "@chakra-ui/react";
import { PageHeader } from "../components/ui/PageHeader";

export function PlaceholderPage({ title, lede }: { title: string; lede: string }) {
  return (
    <>
      <PageHeader title={title} lede={lede} />
      <Box bg="white" rounded="2xl" p="4" color="fg.muted" fontSize="sm">
        This screen is in the app shell. The mock API currently serves Product profile, Company profile, and Due Diligence Statements.
      </Box>
    </>
  );
}
