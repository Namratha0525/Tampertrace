import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { Layout } from './components/layout/Layout';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { SignDocument } from './pages/SignDocument';
import { VerifyDocument } from './pages/VerifyDocument';
import { Documents } from './pages/Documents';
import { DocumentDetails } from './pages/DocumentDetails';
import { KeyManagement } from './pages/KeyManagement';
import { VerificationReport } from './pages/VerificationReport';

// Auth wrapper
const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      <Route element={<Layout />}>
        <Route path="/" element={<RequireAuth><Dashboard /></RequireAuth>} />
        <Route path="/sign" element={<RequireAuth><SignDocument /></RequireAuth>} />
        <Route path="/verify" element={<RequireAuth><VerifyDocument /></RequireAuth>} />
        <Route path="/documents" element={<RequireAuth><Documents /></RequireAuth>} />
        <Route path="/documents/:id" element={<RequireAuth><DocumentDetails /></RequireAuth>} />
        <Route path="/keys" element={<RequireAuth><KeyManagement /></RequireAuth>} />
        <Route path="/reports/:id" element={<RequireAuth><VerificationReport /></RequireAuth>} />
      </Route>
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
