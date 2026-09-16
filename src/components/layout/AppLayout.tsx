import { Box, Drawer, Grid, GridItem, Heading, Portal, Text, useBreakpointValue } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { Outlet, useLocation, useParams } from "react-router-dom";
import { api } from "../../api/client";
import type { Session } from "../../types/api";
import { DEFAULT_APP_ID, isValidAppId, storeAppId } from "../../utils/appId";
import { AppHeader } from "./AppHeader";
import { Sidebar } from "./Sidebar";

export function AppLayout() {
  const { appId = "" } = useParams();
  const location = useLocation();
  const [session, setSession] = useState<Session | null>(null);
  const [status, setStatus] = useState<"loading" | "ok" | "missing">("loading");
  const [navCollapsed, setNavCollapsed] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const isDrawer = useBreakpointValue({ base: true, lg: false }) ?? true;

  useEffect(() => {
    if (!isValidAppId(appId)) {
      setSession(null);
      setStatus("missing");
      return;
    }

    let cancelled = false;
    setStatus("loading");
    setSession(null);
    void api
      .loginSession(appId)
      .then((next) => {
        if (cancelled) return;
        storeAppId(appId);
        setSession(next);
        setStatus("ok");
      })
      .catch(() => {
        if (cancelled) return;
        setSession(null);
        setStatus("missing");
      });

    return () => {
      cancelled = true;
    };
  }, [appId]);

  useEffect(() => {
    setNavOpen(false);
  }, [location.pathname, isDrawer]);

  function handleMenuClick() {
    if (isDrawer) {
      setNavOpen(true);
      return;
    }
    setNavCollapsed((current) => !current);
  }

  return (
    <Grid
      h="100vh"
      overflow="hidden"
      templateRows="64px 1fr"
      templateColumns={{ base: "1fr", lg: navCollapsed ? "72px 1fr" : "248px 1fr" }}
    >
      <GridItem colSpan={{ base: 1, lg: 2 }} bg="white" zIndex="20">
        <AppHeader session={session} onMenuClick={handleMenuClick} />
      </GridItem>
      <GridItem display={{ base: "none", lg: "block" }} bg="white" borderRightWidth="1px" minH="0" overflow="hidden">
        <Sidebar
          credits={session?.credits ?? 0}
          collapsed={navCollapsed}
          onNavigate={() => undefined}
        />
      </GridItem>
      <GridItem bg="#f2f2f7" overflow="auto" minH="0">
        <Box as="main" px={{ base: 4, md: 7 }} py={{ base: 4, md: 6 }} w="full">
          {status === "ok" ? <Outlet /> : null}
          {status === "loading" ? (
            <Text color="fg.muted">Checking this user…</Text>
          ) : null}
          {status === "missing" ? (
            <Box bg="white" rounded="2xl" p="6" maxW="lg">
              <Heading size="md">Unknown user</Heading>
              <Text mt="2" color="fg.muted">
                No operator is logged in for this app id. Use a known id such as{" "}
                <Text as="span" fontFamily="mono">{DEFAULT_APP_ID}</Text>.
              </Text>
            </Box>
          ) : null}
        </Box>
      </GridItem>

      <Drawer.Root
        open={isDrawer && navOpen}
        onOpenChange={(event) => setNavOpen(event.open)}
        placement="start"
        size="xs"
      >
        <Portal>
          <Drawer.Backdrop />
          <Drawer.Positioner>
            <Drawer.Content>
              <Sidebar
                credits={session?.credits ?? 0}
                onClose={() => setNavOpen(false)}
                onNavigate={() => setNavOpen(false)}
              />
            </Drawer.Content>
          </Drawer.Positioner>
        </Portal>
      </Drawer.Root>
    </Grid>
  );
}
