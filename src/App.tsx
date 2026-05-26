import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/i18n/LanguageContext";
import ProtectedRoute from "@/components/ProtectedRoute";

import LandingPage from "@/pages/LandingPage";
import AuthPage from "@/pages/AuthPage";
import Dashboard from "@/pages/Dashboard";
import PharmacyInventory from "@/pages/PharmacyInventory";
import MedicineSearch from "@/pages/MedicineSearch";
import SymptomChecker from "@/pages/symptomchecker";
import NotFound from "@/pages/NotFound";

// 🔥 NEW IMPORTS
import BookConsultation from "@/pages/BookConsultation";
import DoctorRequests from "@/pages/DoctorRequest";
import VideoCallPage from "@/pages/videocall";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <LanguageProvider>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/auth" element={<AuthPage />} />

              <Route
                path="/dashboard"
                element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
              />

              <Route
                path="/inventory"
                element={<ProtectedRoute><PharmacyInventory /></ProtectedRoute>}
              />

              <Route
                path="/medicines"
                element={<ProtectedRoute><MedicineSearch /></ProtectedRoute>}
              />

              <Route
                path="/symptom-checker"
                element={<ProtectedRoute><SymptomChecker /></ProtectedRoute>}
              />

              {/* 🧪 PUBLIC TEST ROUTE — remove after verifying Groq API */}
              <Route path="/groq-test" element={<SymptomChecker />} />

              {/* ✅ PATIENT SIDE */}
              <Route
                path="/book-consultation"
                element={<ProtectedRoute><BookConsultation /></ProtectedRoute>}
              />

              {/* ✅ DOCTOR SIDE */}
              <Route
                path="/doctor-requests"
                element={<ProtectedRoute><DoctorRequests /></ProtectedRoute>}
              />

              {/* ✅ VIDEO CALL */}
              <Route
                path="/call/:channelName"
                element={<ProtectedRoute><VideoCallPage /></ProtectedRoute>}
              />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </LanguageProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;