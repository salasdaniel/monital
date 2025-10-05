import React from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated } from "../utils/auth";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {

  // Si no hay token o datos de usuario, redireccionar al login
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  // Si hay token y usuario, mostrar el componente protegido
  return <>{children}</>;
};

export default ProtectedRoute;