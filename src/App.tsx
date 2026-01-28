import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider } from "@/context/AppContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { FolderProvider } from "@/context/FolderContext";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Documents from "./pages/Documents";
import Integrations from "./pages/Integrations";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <AppProvider>
          <FolderProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Navigate to="/documents" replace />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/documents" element={<Documents />} />
                <Route path="/integrations" element={<Integrations />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </FolderProvider>
        </AppProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
