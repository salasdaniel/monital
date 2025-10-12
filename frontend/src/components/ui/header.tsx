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
    <header className="bg-white shadow-sm border-b">
      <div className="px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            <p className="text-sm text-gray-500">{subtitle}</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">
                {user?.name + ' ' + user?.last_name || 'Usuario'}
                
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
  );
};

export default Header;