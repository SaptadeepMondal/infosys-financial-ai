import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { DashShell } from './components/dashboard/DashShell';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Landing } from './pages/Landing';
import { Dashboard } from './pages/Dashboard';
import { Workspace } from './pages/Workspace';
import { Documents } from './pages/Documents';
import { Reports } from './pages/Reports';
import { Profile } from './pages/Profile';

const shell = (Page) => (
  <ProtectedRoute>
    <DashShell>
      <Page />
    </DashShell>
  </ProtectedRoute>
);

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <Routes>
          {/* Public entry experience */}
          <Route path="/" element={<Landing />} />

          {/* Public Authentication Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected application — one shared light command-center shell */}
          <Route path="/dashboard" element={shell(Dashboard)} />
          <Route path="/workspace" element={shell(Workspace)} />
          <Route path="/documents" element={shell(Documents)} />
          <Route path="/reports" element={shell(Reports)} />
          <Route path="/profile" element={shell(Profile)} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
