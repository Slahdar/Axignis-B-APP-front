import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import EquipmentsPage from "./pages/EquipmentsPage";
import DocumentsPage from "./pages/DocumentsPage";
import BrandsPage from "./pages/BrandsPage";
import DomainsPage from "./pages/DomainsPage";
import FamiliesPage from "./pages/FamiliesPage";
import EquipmentTypesPage from "./pages/EquipmentTypesPage";
import DocumentTypesPage from "./pages/DocumentTypesPage";
import UsersPage from "./pages/UsersPage";
import UserPermissionsPage from "./pages/UserPermissionsPage";
import InventoryPage from "./pages/InventoryPage";
import AuthPage from "./pages/AuthPage";
import NotFound from "./pages/NotFound";
import { apiService } from "./services/api";

const queryClient = new QueryClient();

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    setIsAuthenticated(apiService.isAuthenticated());
  }, []);

  if (!isAuthenticated) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AuthPage onAuthSuccess={() => setIsAuthenticated(true)} />
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/equipments" element={<EquipmentsPage />} />
              <Route path="/documents" element={<DocumentsPage />} />
              <Route path="/brands" element={<BrandsPage />} />
              <Route path="/domains" element={<DomainsPage />} />
              <Route path="/families" element={<FamiliesPage />} />
              <Route path="/equipment-types" element={<EquipmentTypesPage />} />
              <Route path="/document-types" element={<DocumentTypesPage />} />
              <Route path="/users" element={<UsersPage />} />
              <Route path="/user-permissions" element={<UserPermissionsPage />} />
              <Route path="/inventory" element={<InventoryPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
