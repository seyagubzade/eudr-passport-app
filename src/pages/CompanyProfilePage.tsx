import { Box, Grid, Link as ChakraLink, SimpleGrid, Stack, Text } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import { Banner } from "../components/ui/Banner";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Field, FormField, Select, TextArea, TextInput } from "../components/ui/Field";
import { ModalForm } from "../components/ui/Modal";
import { PageHeader } from "../components/ui/PageHeader";
import type { CompanyProfile } from "../types/api";
import { useAppHref } from "../utils/appId";
import { errorMessage } from "../utils/error";

export function CompanyProfilePage() {
  const href = useAppHref();
  const [company, setCompany] = useState<CompanyProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [eoriOpen, setEoriOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    companyName: "",
    vatNumber: "",
    country: "",
    size: "",
    address: "",
    city: "",
    name: "",
    role: "",
    email: "",
    phone: "",
  });
  const [newEori, setNewEori] = useState("");
  const [reason, setReason] = useState("");

  useEffect(() => {
    void api
      .getCompany()
      .then(setCompany)
      .catch((err: unknown) => setError(errorMessage(err, "Could not load company")));
  }, []);

  function openEdit() {
    if (!company) return;
    setForm({
      companyName: company.companyName,
      vatNumber: company.vatNumber,
      country: company.country,
      size: company.size,
      address: company.address,
      city: company.city,
      name: company.contact.name,
      role: company.contact.role,
      email: company.contact.email,
      phone: company.contact.phone,
    });
    setEditOpen(true);
  }

  async function saveDetails() {
    setBusy(true);
    try {
      const next = await api.updateCompany({
        companyName: form.companyName,
        vatNumber: form.vatNumber,
        country: form.country,
        size: form.size,
        address: form.address,
        city: form.city,
        contact: {
          name: form.name,
          role: form.role,
          email: form.email,
          phone: form.phone,
        },
      });
      setCompany({ ...next, countries: company?.countries ?? next.countries, sizes: company?.sizes ?? next.sizes });
      setEditOpen(false);
    } finally {
      setBusy(false);
    }
  }

  async function saveEori() {
    setBusy(true);
    try {
      const next = await api.changeEori({ eori: newEori, reason });
      setCompany({ ...next, countries: company?.countries ?? [], sizes: company?.sizes ?? [] });
      setEoriOpen(false);
      setNewEori("");
      setReason("");
    } finally {
      setBusy(false);
    }
  }

  if (error) return <Box bg="white" rounded="2xl" p="4" color="fg.muted">{error}</Box>;
  if (!company) return <Box bg="white" rounded="2xl" p="4" color="fg.muted">Loading company profile…</Box>;

  const eoriMissing = !company.eori;

  return (
    <Stack gap="4">
      <PageHeader
        title="Company profile"
        lede="The identity the EU checks when you file. Not a second home page."
      />

      <Banner
        tone={eoriMissing ? "bad" : "ok"}
        pill={eoriMissing ? "Blocked" : "Ready"}
        title={eoriMissing ? "Identity is blocking filing" : "Identity ready for EU submit"}
        detail={
          eoriMissing
            ? "EORI is missing. This is the only field on this page that can block filing."
            : `EORI is set and was last checked on ${company.eoriCheckedAt}. This is the only field on this page that can block filing.`
        }
      />

      <Box bg="white" rounded="2xl" px="5" py="5">
        <Grid templateColumns={{ base: "1fr", md: "1fr auto" }} gap="4" alignItems="start">
          <Box>
            <Text fontSize="12px" color="fg.muted" mb="1.5">
              EORI — used when you file
            </Text>
            <Text fontSize="22px" fontWeight="bold" letterSpacing="0.02em">
              {company.eori || "Not set"}
            </Text>
            <Text fontSize="sm" color="fg.muted" mt="1.5" lineHeight="1.45">
              Set · last checked {company.eoriCheckedAt} against the EU system. Changing this can make in-flight statements fail.
            </Text>
          </Box>
          <Button variant="danger" w={{ base: "full", md: "auto" }} onClick={() => setEoriOpen(true)}>
            Change EORI
          </Button>
        </Grid>
      </Box>

      <Card title="Company" action={<Button w={{ base: "full", md: "auto" }} onClick={openEdit}>Edit details</Button>}>
        <SimpleGrid columns={{ base: 1, md: 2 }} gap="4" columnGap="8">
          <Field label="Company" value={company.companyName} />
          <Field label="VAT number" value={company.vatNumber} />
          <Field label="Registered country" value={company.country} />
          <Field label="Company size" value={company.size} />
          <Field label="Address" value={company.address} />
          <Field label="Postcode / city" value={company.city} />
        </SimpleGrid>
      </Card>

      <Card title="EUDR contact" action={<Button w={{ base: "full", md: "auto" }} onClick={openEdit}>Edit details</Button>}>
        <Text color="fg.muted" fontSize="sm" mb="3.5" lineHeight="1.45">
          The person the EU can reach. One person only — not repeated under company identity.
        </Text>
        <SimpleGrid columns={{ base: 1, md: 2 }} gap="4" columnGap="8">
          <Field label="Name" value={company.contact.name} />
          <Field label="Role" value={company.contact.role} />
          <Field label="Email" value={company.contact.email} />
          <Field label="Phone" value={company.contact.phone} />
        </SimpleGrid>
      </Card>

      <Text fontSize="sm" color="fg.muted">
        Last updated {company.updatedAt} by {company.updatedBy}.{" "}
        <ChakraLink asChild color="blue.600" fontWeight="semibold">
          <Link to={href("/permissions")}>Who can change EORI</Link>
        </ChakraLink>{" "}
        is set in Permissions.
      </Text>

      <ModalForm
        open={editOpen}
        title="Edit company details"
        lede="Address, VAT and contact. EORI is not here — it has its own confirm step because the EU validates it at submit."
        wide
        submitLabel="Save details"
        busy={busy}
        onClose={() => setEditOpen(false)}
        onSubmit={saveDetails}
      >
        <SimpleGrid columns={{ base: 1, md: 2 }} gap="3">
          <FormField label="Company">
            <TextInput value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} required />
          </FormField>
          <FormField label="VAT number">
            <TextInput value={form.vatNumber} onChange={(e) => setForm({ ...form, vatNumber: e.target.value })} />
          </FormField>
          <FormField label="Registered country">
            <Select value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })}>
              {company.countries.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </Select>
          </FormField>
          <FormField label="Company size">
            <Select value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value })}>
              {company.sizes.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </Select>
          </FormField>
          <FormField label="Address">
            <TextInput value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </FormField>
          <FormField label="Postcode / city">
            <TextInput value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          </FormField>
          <FormField label="Contact name">
            <TextInput value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </FormField>
          <FormField label="Role">
            <TextInput value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} />
          </FormField>
          <FormField label="Email">
            <TextInput type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </FormField>
          <FormField label="Phone">
            <TextInput value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </FormField>
        </SimpleGrid>
      </ModalForm>

      <ModalForm
        open={eoriOpen}
        title="Change EORI"
        lede="The EU validates this EORI when a due diligence statement is submitted."
        submitLabel="Save changes"
        busy={busy}
        onClose={() => setEoriOpen(false)}
        onSubmit={saveEori}
      >
        <Box bg="red.50" color="red.800" rounded="xl" p="3" fontSize="sm" mb="4">
          If this number is wrong, filing will fail. Statements already in progress may fail until the EU accepts the new EORI. Only people allowed in Permissions can do this.
        </Box>
        <SimpleGrid columns={{ base: 1, md: 2 }} gap="3">
          <FormField label="Current EORI">
            <TextInput value={company.eori} disabled />
          </FormField>
          <FormField label="New EORI">
            <TextInput value={newEori} required maxLength={20} onChange={(e) => setNewEori(e.target.value)} />
          </FormField>
          <FormField label="Why are you changing it?" full>
            <TextArea rows={3} required value={reason} onChange={(e) => setReason(e.target.value)} />
          </FormField>
        </SimpleGrid>
      </ModalForm>
    </Stack>
  );
}
