import React, { useState, useEffect } from 'react';
import { Button } from './button';
import { cn } from '../../lib/utils';
import { useNavigate } from 'react-router-dom';
import {
  Home,
  Building2,
  ChevronLeft,
  ChevronRight,
  Monitor,
  Users,
  Coins
} from 'lucide-react';


import { getUser } from "../../utils/auth";

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href: string;
  onClick?: () => void;
  roles: string[]; // Roles que pueden ver este menú
}

interface UserData {
  empresa_id?: number;
  empresa_nombre?: string;
  empresa_ruc?: string;
}
interface SidebarProps {
  userRole: string;
  currentPath?: string;
  onMenuClick?: (menuId: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  userRole,
  currentPath = '/dashboard',
  onMenuClick
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate()

  // Definir menús basados en roles
  const menuItems: MenuItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <Home className="h-5 w-5" />,
      href: '/dashboard',
      roles: ['admin', 'user', 'moderator'] // Todos los roles
    },
    {
      id: 'empresas',
      label: 'Empresas',
      icon: <Building2 className="h-5 w-5" />,
      href: '/empresas',
      roles: ['admin', 'user', 'moderator']
    },
    {
      id: 'users',
      label: 'Usuarios',
      icon: <Users className="h-5 w-5" />,
      href: '/users',
      roles: ['admin', 'user', 'moderator']
    },
    {
      id: 'ventas',
      label: 'Ventas',
      icon: <Coins className="h-5 w-5" />,
      href: '/ventas',
      roles: ['admin', 'user', 'moderator']
    },
  ];

  // Filtrar menús según el rol del usuario
  const filteredMenuItems = menuItems.filter(item =>
    item.roles.includes(userRole.toLowerCase())
  );

  const handleMenuClick = (item: MenuItem) => {
    // window.location.href =(item.href || '/dashboard');
    navigate(item.href);
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };
  const [user, setUser] = useState<UserData | null>(null);

  useEffect(() => {
    // Obtener datos del usuario desde localStorage
    const userData = getUser();
    setUser(userData);
    // console.log(userData);
  }, []);

  return (
    <div className={cn(
      "bg-white border-r border-gray-200 shadow-sm transition-all duration-300 ease-in-out flex flex-col",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center space-x-2">
              <div className="bg-primary rounded-lg p-2">
                <Monitor className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{user?.empresa_nombre || 'Empresa'}</h2>
                <p className="text-sm text-gray-500">{user?.empresa_ruc || 'RUC'}</p>
              </div>
            </div>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className={cn(
              "h-8 w-8 p-0",
              isCollapsed && "mx-auto"
            )}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1">
        {filteredMenuItems.map((item) => (
          <Button
            key={item.id}
            variant={currentPath === item.href ? "secondary" : "ghost"}
            className={cn(
              "w-full justify-start h-10 px-3",
              isCollapsed ? "px-2" : "px-3",
              currentPath === item.href && "bg-primary/10 text-primary border-primary/20"
            )}
            onClick={() => handleMenuClick(item)}
          >
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                {item.icon}
              </div>
              {!isCollapsed && (
                <span className="text-sm font-medium truncate">
                  {item.label}
                </span>
              )}
            </div>
          </Button>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        {!isCollapsed && (
          <div className="text-xs text-gray-500 text-center">
            <p>Monital v1.0</p>
            <p>Sistema de Monitoreo</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;