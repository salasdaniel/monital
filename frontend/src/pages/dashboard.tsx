import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { LogOut, User, Home } from 'lucide-react';
import { getUser, logout } from "../utils/auth";

interface UserData {
  username: string;
  role?: string;
}

const Dashboard: React.FC = () => {
//   const navigate = useNavigate();
  const [user, setUser] = useState<UserData | null>(null);

  
//   if (!isAuthenticated()) {
//     return <Navigate to="/login" replace />;
//   }
  useEffect(() => {
    // Obtener datos del usuario desde utils auth
    let user = getUser();
    setUser(user);
    console.log('User from getUser():', user);

  }, []);

  const handleLogout = () => {
    logout();
  };

  const getWelcomeMessage = (): string => {
    const currentHour = new Date().getHours();
    
    if (currentHour < 12) {
      return '¡Buenos días!';
    } else if (currentHour < 18) {
      return '¡Buenas tardes!';
    } else {
      return '¡Buenas noches!';
    }
  };

  const getUserDisplayName = (): string => {
    return user?.username || 'Usuario';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="bg-primary rounded-lg p-2">
                <Home className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Monital</h1>
                <p className="text-sm text-gray-500">Panel de Control</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">
                  {getUserDisplayName()}
                </span>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleLogout}
                className="flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Cerrar Sesión</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Welcome Card */}
          <Card className="w-full">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center mb-4">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full p-4">
                  <User className="h-8 w-8 text-white" />
                </div>
              </div>
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {getWelcomeMessage()}
              </CardTitle>
              <CardDescription className="text-lg mt-2">
                Bienvenido/a de vuelta, <span className="font-semibold text-gray-700">{getUserDisplayName()}</span>
              </CardDescription>
            </CardHeader>
            
            <CardContent className="text-center">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                  ¡Tu sesión ha iniciado correctamente!
                </h2>
                <p className="text-gray-600">
                  Ahora puedes acceder a todas las funcionalidades del sistema Monital.
                </p>
              </div>
              
              <div className="text-sm text-gray-500">
                <p>Última conexión: {new Date().toLocaleDateString('es-ES', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</p>
              </div>
            </CardContent>
          </Card>

          {/* Placeholder para futuras secciones */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="opacity-50">
              <CardHeader>
                <CardTitle className="text-lg">Próximamente</CardTitle>
                <CardDescription>Estadísticas del sistema</CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="opacity-50">
              <CardHeader>
                <CardTitle className="text-lg">Próximamente</CardTitle>
                <CardDescription>Reportes y análisis</CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="opacity-50">
              <CardHeader>
                <CardTitle className="text-lg">Próximamente</CardTitle>
                <CardDescription>Configuraciones</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
