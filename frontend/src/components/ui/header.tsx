import React, { useState, useEffect } from "react";
import { Button } from "./button";
import { User, LogOut } from "lucide-react";
import { getUser, logout } from "../../utils/auth";

interface UserData {
  email?: string;
  empresa_id?: number;
  empresa_nombre?: string;
  last_name?: string;
  name?: string;
  role?: string;
  ruc?: string;
  username: string;
}

interface HeaderProps {
  title: string;
  subtitle: string;
}

const Header: React.FC<HeaderProps> = ({ title, subtitle }) => {
  const [user, setUser] = useState<UserData | null>(null);

  useEffect(() => {
    // Obtener datos del usuario desde localStorage
    const userData = getUser();
    setUser(userData);
    // console.log(userData);
  }, []);

  const handleLogout = () => {
    // Limpiar localStorage usando la función de auth
    logout();
  };
 


  return (
    <header className="fixed top-0 right-0 left-0 md:left-64 bg-white shadow-sm border-b z-30">
      <div className="px-4 md:px-6 py-3 md:py-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-lg md:text-2xl font-bold text-gray-900">{title}</h1>
            <p className="text-xs md:text-sm text-gray-500 hidden sm:block">{subtitle}</p>
          </div>
          
          <div className="flex items-center space-x-2 md:space-x-4">
            <div className="hidden md:flex items-center space-x-2">
              <User className="h-5 w-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">
                {user?.name + ' ' + user?.last_name || 'Usuario'}
              </span>
            </div>
            
            {/* Usuario en móvil - solo iniciales */}
            <div className="md:hidden flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-semibold text-sm">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleLogout}
              className="flex items-center space-x-1 md:space-x-2"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Cerrar Sesión</span>
              <span className="sm:hidden">Salir</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;