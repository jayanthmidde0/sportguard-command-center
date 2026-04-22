import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/auth";
import { ProtectedRoute } from "@/components/sg/ProtectedRoute";
import { AppShell } from "@/components/sg/AppShell";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import UploadPage from "./pages/UploadPage";
import DetectPage from "./pages/DetectPage";
import Detections from "./pages/Detections";
import Analytics from "./pages/Analytics";
import ManualSearch from "./pages/ManualSearch";
import Monitoring from "./pages/Monitoring";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner theme="dark" position="top-right" richColors closeButton />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
              <Route path="/app" element={<Dashboard />} />
              <Route path="/app/upload" element={<UploadPage />} />
              <Route path="/app/detect" element={<DetectPage />} />
              <Route path="/app/detections" element={<Detections />} />
              <Route path="/app/analytics" element={<Analytics />} />
              <Route path="/app/search" element={<ManualSearch />} />
              <Route path="/app/monitoring" element={<Monitoring />} />
              <Route path="/app/settings" element={<Settings />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
