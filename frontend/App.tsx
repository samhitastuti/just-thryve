import React, { ReactNode } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ESGProvider } from "./context/ESGContext";
import { NotificationProvider } from "./context/NotificationContext";
import { DashboardLayout } from "./layouts/DashboardLayout";
import { LandingPage } from "./pages/LandingPage";
import { AuthPages } from "./pages/AuthPages";
import { DashboardOverview } from "./pages/DashboardOverview";
import { LoanApplication } from "./pages/LoanApplication";
import { OffersPage } from "./pages/OffersPage";
import { ESGInsights } from "./pages/ESGInsights";
import { AuditLogs } from "./pages/AuditLogs";
import { Repayments } from "./pages/Repayments";
import { ProfilePage } from "./pages/ProfilePage";
import { NotificationsPage } from "./pages/NotificationsPage";

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  return <>{children}</>;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ESGProvider>
          <NotificationProvider>
            <BrowserRouter>
              <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<AuthPages />} />
              
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <DashboardOverview />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/dashboard/apply" element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <LoanApplication />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/dashboard/offers" element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <OffersPage />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/dashboard/repayments" element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Repayments />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/dashboard/esg" element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <ESGInsights />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/dashboard/audit" element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <AuditLogs />
                  </DashboardLayout>
                </ProtectedRoute>
              } />

              <Route path="/dashboard/profile" element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <ProfilePage />
                  </DashboardLayout>
                </ProtectedRoute>
              } />

              <Route path="/dashboard/notifications" element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <NotificationsPage />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
            </Routes>
          </BrowserRouter>
        </NotificationProvider>
      </ESGProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
