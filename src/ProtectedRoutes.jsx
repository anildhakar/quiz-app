import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function ProtectedAdminRoute({ children }) {
  const { isAdmin, isInitialized } = useAuth();

  if (!isInitialized) return null;

  if (!isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }
   
  return children;
}
