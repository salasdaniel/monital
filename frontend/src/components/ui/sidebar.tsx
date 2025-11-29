import React, { useState, useEffect } from 'react';
import { Button } from './button';
import { cn } from '../../lib/utils';
import { useNavigate } from 'react-router-dom';
import {
  Home,
  Building2,
  ChevronLeft,
  ChevronRight,
  User,
  Users,
  Coins,
  ChartColumnIncreasing,
  Car,
  SlidersHorizontal
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
  name?: string;
  last_name?: string;
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
      id: 'panel',
      label: 'Panel de Control',
      icon: <SlidersHorizontal className="h-5 w-5" />,
      href: '/panel-control',
      roles: ['admin']
    },
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
      roles: ['admin', 'moderator']
    },
    {
      id: 'users',
      label: 'Usuarios',
      icon: <Users className="h-5 w-5" />,
      href: '/users',
      roles: ['admin',  'moderator']
    },
    {
      id: 'ventas',
      label: 'Ventas',
      icon: <Coins className="h-5 w-5" />,
      href: '/ventas',
      roles: ['admin', 'user', 'moderator']
    },
    {
      id: 'ventas-detalle',
      label: 'Ventas Detalle',
      icon: <ChartColumnIncreasing className="h-5 w-5" />,
      href: '/ventas-detalle',
      roles: ['admin', 'user', 'moderator']
    },
    {
      id: 'matriculas',
      label: 'Matriculas',
      icon: <Car className="h-5 w-5" />,
      href: '/matriculas',
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
    <div 
      className={cn(
        "border-r border-white-700 shadow-sm transition-all duration-300 ease-in-out flex flex-col fixed left-0 top-0 h-screen z-40",
        isCollapsed ? "w-16" : "w-64"
      )}
      style={{ backgroundColor: '#20409a' }}
    >
      {/* Header */}
      <div className="p-4 border-b border-white-700">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center justify-center w-full">
              <img 
                src="/logotek.png" 
                alt="Logo" 
                className="h-12 w-auto object-contain"
              />
            </div>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className={cn(
              "h-8 w-8 p-0 text-white hover:bg-white/10",
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
              "w-full justify-start h-10 px-3 text-white hover:bg-white/10",
              isCollapsed ? "px-2" : "px-3",
              currentPath === item.href && "bg-white/20 text-white"
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
      
      <div className="p-4">
        {!isCollapsed ? (
          <div className="space-y-3">
            {/* Perfil de Usuario */}
            <div className="text-white text-center py-3">
              <div className="flex items-center justify-center gap-2 mb-2">
               
                <p className="text-sm font-semibold truncate"> 
                  {user?.name || 'Usuario'} {user?.last_name || ''}
                </p>
              </div>
              <p className="text-xl font-bold text-white truncate my-2">
                {user?.empresa_nombre || 'Empresa'}
              </p>
              <p className="text-sm text-white/60 truncate">
                {user?.empresa_ruc || 'RUC'}
              </p>
            </div>
            
            {/* Versión */}
            <div className="text-xs text-white/50 text-center pt-2 border-t border-white-700/50">
              <p>Protek Flotas</p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <span className="text-xs text-white font-semibold">
                {user?.name?.charAt(0) || 'U'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;