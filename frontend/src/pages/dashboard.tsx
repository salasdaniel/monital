import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import Sidebar from '../components/ui/sidebar';
import { LogOut, User } from 'lucide-react';

interface UserData {
  username: string;
  role?: string;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<UserData | null>(null);

  useEffect(() => {
    // Obtener datos del usuario desde localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        console.log('User from localStorage:', parsedUser);
      } catch (error) {
        console.error('Error al parsear datos del usuario:', error);
      }
    }
  }, []);

  const handleLogout = () => {
    // Limpiar localStorage
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    
    // Redireccionar al login
    navigate('/');
  };

  const handleMenuClick = (menuId: string) => {
    // Manejar navegación de menús
    console.log('Menu clicked:', menuId);
    
    // Por ahora solo manejamos algunos menús básicos
    switch (menuId) {
      case 'dashboard':
        navigate('/dashboard');
        break;
      case 'profile':
        console.log('Navegando a perfil...');
        break;
      case 'settings':
        console.log('Navegando a configuración...');
        break;
      default:
        console.log(`Funcionalidad ${menuId} en desarrollo`);
    }
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

  const getUserRole = (): string => {
    return user?.role || 'user';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <Sidebar 
        userRole={getUserRole()}
        currentPath={location.pathname}
        onMenuClick={handleMenuClick}
      />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="px-6 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-sm text-gray-500">Panel de Control Principal</p>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">
                    {getUserDisplayName()}
                  </span>
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full capitalize">
                    {getUserRole()}
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

        {/* Main Content Area */}
        <main className="flex-1 p-6">
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
                  <p className="text-sm text-gray-500 mt-2">
                    Usa el menú lateral para navegar entre las diferentes secciones.
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

            {/* Stats Cards - Filtradas por rol */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Monitoreo Activo</CardTitle>
                  <CardDescription>Servicios en línea</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">24/7</div>
                  <p className="text-sm text-gray-500">Todos los sistemas operativos</p>
                </CardContent>
              </Card>
              
              {(getUserRole() === 'admin' || getUserRole() === 'moderator') && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Usuarios Conectados</CardTitle>
                    <CardDescription>Sesiones activas</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">12</div>
                    <p className="text-sm text-gray-500">En las últimas 24h</p>
                  </CardContent>
                </Card>
              )}
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Estado del Sistema</CardTitle>
                  <CardDescription>Rendimiento general</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">98.5%</div>
                  <p className="text-sm text-gray-500">Uptime este mes</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
