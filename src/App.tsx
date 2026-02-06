import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";

import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Celulas from "./pages/Celulas";
import Membros from "./pages/Membros";
import Presenca from "./pages/Presenca";
import Redes from "./pages/Redes";
import Coordenacoes from "./pages/Coordenacoes";
import Configuracoes from "./pages/Configuracoes";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/auth" element={<Auth />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/celulas"
              element={
                <ProtectedRoute>
                  <Celulas />
                </ProtectedRoute>
              }
            />
            <Route
              path="/membros"
              element={
                <ProtectedRoute>
                  <Membros />
                </ProtectedRoute>
              }
            />
            <Route
              path="/presenca"
              element={
                <ProtectedRoute>
                  <Presenca />
                </ProtectedRoute>
              }
            />
            <Route
              path="/redes"
              element={
                <ProtectedRoute>
                  <Redes />
                </ProtectedRoute>
              }
            />
            <Route
              path="/coordenacoes"
              element={
                <ProtectedRoute>
                  <Coordenacoes />
                </ProtectedRoute>
              }
            />
            <Route
              path="/configuracoes"
              element={
                <ProtectedRoute>
                  <Configuracoes />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
