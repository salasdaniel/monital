import React from 'react';
import { Navigate } from 'react-router-dom';
import { getHomePathForRole, getUserRole, isAuthenticated } from "../utils/auth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {

  // Si no hay token o datos de usuario, redireccionar al login
  if (!isAuthenticated()) {
    return <Navigate to="/" replace />;
  }

  const userRole = getUserRole();

  // Si el usuario no tiene el rol requerido, redireccionar a su inicio permitido
  if (allowedRoles?.length && (!userRole || !allowedRoles.includes(userRole))) {
    return <Navigate to={getHomePathForRole(userRole)} replace />;
  }

  // Si hay token y usuario, mostrar el componente protegido
  return <>{children}</>;
};

export default ProtectedRoute;
