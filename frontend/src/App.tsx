import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
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
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/empresas" 
          element={
            <ProtectedRoute>
              <Empresas />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/users" 
          element={
            <ProtectedRoute>
              <Users />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/ventas" 
          element={
            <ProtectedRoute>
              <Ventas />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/ventas-detalle" 
          element={
            <ProtectedRoute>
              <VentasDetalle />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/matriculas" 
          element={
            <ProtectedRoute>
              <Matriculas />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;
