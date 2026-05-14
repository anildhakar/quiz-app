import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider } from "./providers/AuthProvider";
import { useAuth } from "./hooks/useAuth";

import { Navbar } from "./pages/User/Navbar";
import Home from "./pages/User/Home";
import AdminLogin from "./pages/Admin/AdminLogin";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import QuizEditor from "./pages/Admin/QuizEditor";


const ProtectedAdminRoute = ({ children }) => {
  const { isAdmin, isInitialized } = useAuth();
  if (!isInitialized) return null;
  if (!isAdmin) return <Navigate to="/admin/login" />;
  return children;
};

function AppContent() {
  return (
    <div>
      <Navbar />
      <Routes>
      
        <Route path="/" element={<Home />} />
      

        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={
          <ProtectedAdminRoute>
            <AdminDashboard />
          </ProtectedAdminRoute>
        } />
        <Route path="/admin/quiz/new" element={
          <ProtectedAdminRoute>
            <QuizEditor />
          </ProtectedAdminRoute>
        } />
        <Route path="/admin/quiz/:id/edit" element={
          <ProtectedAdminRoute>
            <QuizEditor />
          </ProtectedAdminRoute>
        } />

          <Route path="*" element={
                  <div style={{ textAlign: 'center', padding: '50px' }}>   
                 <h1>Page Not Found</h1> </div>
  } 
/>
      </Routes>
    </div>
  );
}

export default function App() {
  return (                       
    <AuthProvider>             
      <AppContent />            
    </AuthProvider>
  );
}