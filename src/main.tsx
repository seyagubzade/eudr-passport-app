import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Provider } from "./components/ui/Provider.tsx";
import { AppLayout } from "./components/layout/AppLayout.tsx";
import { RedirectToApp, RedirectToAppIndex } from "./components/layout/RedirectToApp.tsx";
import { CompanyProfilePage } from "./pages/CompanyProfilePage.tsx";
import { DdsPage } from "./pages/DdsPage.tsx";
import { PlaceholderPage } from "./pages/PlaceholderPage.tsx";
import { ProductProfilePage } from "./pages/ProductProfilePage.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider>
      <BrowserRouter>
      <Routes>
        <Route path="/" element={<RedirectToApp />} />
        <Route path="company" element={<RedirectToApp />} />
        <Route path="dds" element={<RedirectToApp />} />
        <Route path="permissions" element={<RedirectToApp />} />
        <Route path="suppliers" element={<RedirectToApp />} />
        <Route path="requests" element={<RedirectToApp />} />
        <Route path="/:appId" element={<AppLayout />}>
          <Route index element={<ProductProfilePage />} />
          <Route path="company" element={<CompanyProfilePage />} />
          <Route path="dds" element={<DdsPage />} />
          <Route
            path="permissions"
            element={
              <PlaceholderPage
                title="Permissions"
                lede="Who can view and edit this operator’s EUDR Passport."
              />
            }
          />
          <Route
            path="suppliers"
            element={
              <PlaceholderPage
                title="My Suppliers"
                lede="Suppliers you request product and plot data from."
              />
            }
          />
          <Route
            path="requests"
            element={
              <PlaceholderPage
                title="Received Requests"
                lede="Incoming requests from customers that need a product profile."
              />
            }
          />
          <Route path="*" element={<RedirectToAppIndex />} />
        </Route>
      </Routes>
      </BrowserRouter>
    </Provider>
  </StrictMode>,
);
