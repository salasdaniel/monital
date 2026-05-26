import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import DashboardCliente from './pages/DashboardCliente';
import Empresas from './pages/Empresas';
import Users from './pages/Users';
import Ventas from './pages/Ventas';
import VentasDetalle from './pages/VentasDetalle';
import Matriculas from './pages/Matriculas';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route 
          path="/panel-control" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/empresas" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Empresas />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/users" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Users />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/ventas" 
          element={
            <ProtectedRoute allowedRoles={['admin', 'user']}>
              <Ventas />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/ventas-detalle" 
          element={
            <ProtectedRoute allowedRoles={['admin', 'user']}>
              <VentasDetalle />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/matriculas" 
          element={
            <ProtectedRoute allowedRoles={['admin', 'user']}>
              <Matriculas />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute allowedRoles={['admin', 'user']}>
              <DashboardCliente />
            </ProtectedRoute>
          } 
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
