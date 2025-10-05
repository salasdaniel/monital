import React, { useState } from 'react';
import { Button } from './button';
import { cn } from '../../lib/utils';
import { 
  Home, 
  Building2,
  Users, 
  Settings, 
  BarChart3, 
  FileText, 
  Database,
  Shield,
  ChevronLeft,
  ChevronRight,
  User,
  Monitor,
  AlertTriangle
} from 'lucide-react';

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href?: string;
  onClick?: () => void;
  roles: string[]; // Roles que pueden ver este menú
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
    // {
    //   id: 'analytics',
    //   label: 'Análisis',
    //   icon: <BarChart3 className="h-5 w-5" />,
    //   href: '/analytics',
    //   roles: ['admin', 'moderator'] // Solo admin y moderador
    // },
    // {
    //   id: 'alerts',
    //   label: 'Alertas',
    //   icon: <AlertTriangle className="h-5 w-5" />,
    //   href: '/alerts',
    //   roles: ['admin', 'user', 'moderator']
    // },
    // {
    //   id: 'reports',
    //   label: 'Reportes',
    //   icon: <FileText className="h-5 w-5" />,
    //   href: '/reports',
    //   roles: ['admin', 'moderator']
    // },
    // {
    //   id: 'users',
    //   label: 'Usuarios',
    //   icon: <Users className="h-5 w-5" />,
    //   href: '/users',
    //   roles: ['admin'] // Solo admin
    // },
    // {
    //   id: 'database',
    //   label: 'Base de Datos',
    //   icon: <Database className="h-5 w-5" />,
    //   href: '/database',
    //   roles: ['admin']
    // },
    // {
    //   id: 'security',
    //   label: 'Seguridad',
    //   icon: <Shield className="h-5 w-5" />,
    //   href: '/security',
    //   roles: ['admin']
    // },
    // {
    //   id: 'profile',
    //   label: 'Perfil',
    //   icon: <User className="h-5 w-5" />,
    //   href: '/profile',
    //   roles: ['admin', 'user', 'moderator']
    // },
    // {
    //   id: 'settings',
    //   label: 'Configuración',
    //   icon: <Settings className="h-5 w-5" />,
    //   href: '/settings',
    //   roles: ['admin', 'moderator']
    // }
  ];

  // Filtrar menús según el rol del usuario
  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(userRole.toLowerCase())
  );

  const handleMenuClick = (item: MenuItem) => {
    if (item.onClick) {
      item.onClick();
    } else if (onMenuClick) {
      onMenuClick(item.id);
    }
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

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
                <h2 className="text-lg font-semibold text-gray-900">Monital</h2>
                <p className="text-xs text-gray-500 capitalize">{userRole}</p>
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