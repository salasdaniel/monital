import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import Sidebar from '../components/ui/sidebar';
import Header from '../components/ui/header';
import { Building2, Users, Fuel, ShoppingCart, TrendingUp, AlertCircle, Home, Coins, ChartColumnIncreasing, Car, SlidersHorizontal } from 'lucide-react';
import { getUser } from "../utils/auth";
import { API_URLS, APP_KEY } from '../api/config';

interface UserData {
  username: string;
  role: string | 'user';
}

interface DashboardAdminData {
  fecha_inicio: string | null;
  fecha_fin: string;
  kpis_sistema: {
    total_empresas: number;
    empresas_activas: number;
    empresas_inactivas: number;
    total_usuarios: number;
    usuarios_activos: number;
    usuarios_inactivos: number;
    total_matriculas_sistema: number;
    total_cargas_sistema: number;
  };
  metricas_por_empresa: Array<{
    empresa_id: number;
    empresa: string;
    ruc: string;
    total_usuarios: number;
    usuarios_activos: number;
    usuarios_inactivos: number;
    porcentaje_actividad: number;
    total_matriculas: number;
    total_cargas: number;
    total_venta: number;
    dias_inactiva: number | null;
    ultima_carga: string | null;
  }>;
  resumen_uso_plataforma: {
    total_cargas_mes: number;
    total_usuarios_nuevos_mes: number;
    total_matriculas_nuevas_mes: number;
    total_empresas_nuevas_mes: number;
    combustible_mas_cargado: {
      nombre: string;
      litros: number;
    };
    estacion_mas_frecuentada: {
      nombre: string;
      cargas: number;
    };
    monto_total_mes: number;
  };
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<UserData | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardAdminData | null>(null);


  useEffect(() => {
    // Obtener datos del usuario desde localStorage
    const userData = getUser();
    setUser(userData);

  }, []);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      const url = API_URLS.PANEL; // Ya no se envía cant_dias
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'X-App-Key': APP_KEY
        }
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Error ${response.status}: ${errorData}`);
      }

      const apiResponse: DashboardAdminData = await response.json();
      setDashboardData(apiResponse);
      setError(null);
      console.log(apiResponse);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar los datos del dashboard de administrador');
    } finally {
      setLoading(false);
    }
  }, []); // Sin dependencia de periodo

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchDashboardData();
    }
  }, [user, fetchDashboardData]); // ← Ahora sí incluir fetchDashboardData

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

  // Formatear números con separadores de miles
  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('es-PY').format(num);
  };

  // Formatear moneda
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('es-PY', {
      style: 'currency',
      currency: 'PYG',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Menú de navegación inferior para móviles (solo admin)
  const bottomNavItems = [
    { icon: SlidersHorizontal, label: 'Panel', path: '/panel' },
    { icon: Home, label: 'Dashboard', path: '/dashboard' },
    { icon: Building2, label: 'Empresas', path: '/empresas' },
    { icon: Users, label: 'Usuarios', path: '/users' },
    { icon: Coins, label: 'Ventas', path: '/ventas' },
    { icon: ChartColumnIncreasing, label: 'Detalle', path: '/ventas-detalle' },
    { icon: Car, label: 'Matrículas', path: '/matriculas' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="hidden md:block">
          <Sidebar userRole={user?.role ?? 'user'} currentPath={location.pathname} />
        </div>
        <div className="flex items-center justify-center min-h-screen md:ml-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando datos del sistema...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="hidden md:block">
          <Sidebar userRole={user?.role ?? 'user'} currentPath={location.pathname} />
        </div>
        <div className="flex-1 flex flex-col pb-16 md:pb-0 md:ml-64">
          <Header title="Dashboard Admin" subtitle="Panel de Control del Sistema" />
          <main className="flex-1 p-4 md:p-6 pt-[76px] md:pt-[92px]">
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="text-red-600 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Error al cargar datos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-red-600">{error}</p>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    );
  }



  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar - Oculto en móviles, Fixed en desktop */}
      <div className="hidden md:block">
        <Sidebar
          userRole={user?.role ?? 'user'}
          currentPath={location.pathname}
        />
      </div>

      {/* Main Content - Con margen izquierdo para el sidebar en desktop */}
      <div className="flex-1 flex flex-col pb-16 md:pb-0 md:ml-64">
        {/* Header */}
        <Header
          title="Dashboard Admin"
          subtitle="Panel de Control del Sistema"
        />

        {/* Main Content Area */}
        <main className="flex-1 p-4 md:p-6 pt-[76px] md:pt-[92px]">
          <div className="space-y-4 md:space-y-6">
            {/* Filtros */}
            <Card className="shadow-md border-gray-200">
              <CardContent className="pt-4 md:pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold text-gray-800">{getWelcomeMessage()}</h2>
                    <p className="text-xs md:text-sm text-gray-500">
                      {dashboardData && `Dashboard del Sistema - Actualizado al ${new Date(dashboardData.fecha_fin).toLocaleDateString('es-ES')}`}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* KPIs del Sistema - 4 Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {/* Empresas */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Empresas del Sistema
                  </CardTitle>
                  <Building2 className="h-5 w-5 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">
                    {dashboardData?.kpis_sistema.total_empresas || 0}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    <span className="text-green-600 font-semibold">
                      {dashboardData?.kpis_sistema.empresas_activas || 0} activas
                    </span>
                    {' / '}
                    <span className="text-red-600">
                      {dashboardData?.kpis_sistema.empresas_inactivas || 0} inactivas
                    </span>
                  </p>
                </CardContent>
              </Card>

              {/* Usuarios */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Usuarios del Sistema
                  </CardTitle>
                  <Users className="h-5 w-5 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">
                    {dashboardData?.kpis_sistema.total_usuarios || 0}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    <span className="text-green-600 font-semibold">
                      {dashboardData?.kpis_sistema.usuarios_activos || 0} activos
                    </span>
                    {' / '}
                    <span className="text-red-600">
                      {dashboardData?.kpis_sistema.usuarios_inactivos || 0} inactivos
                    </span>
                  </p>
                </CardContent>
              </Card>

              {/* Matrículas */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Matrículas Totales
                  </CardTitle>
                  <Fuel className="h-5 w-5 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">
                    {formatNumber(dashboardData?.kpis_sistema.total_matriculas_sistema || 0)}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Vehículos registrados
                  </p>
                </CardContent>
              </Card>

              {/* Cargas */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Cargas Totales
                  </CardTitle>
                  <ShoppingCart className="h-5 w-5 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">
                    {formatNumber(dashboardData?.kpis_sistema.total_cargas_sistema || 0)}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Transacciones históricas
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Resumen de Uso de la Plataforma */}
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  Resumen del Mes Actual
                </CardTitle>
                <CardDescription>Métricas del mes en curso</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Total Cargas Mes</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {formatNumber(dashboardData?.resumen_uso_plataforma.total_cargas_mes || 0)}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Usuarios Nuevos Mes</p>
                    <p className="text-2xl font-bold text-blue-600">
                      +{dashboardData?.resumen_uso_plataforma.total_usuarios_nuevos_mes || 0}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Matrículas Nuevas Mes</p>
                    <p className="text-2xl font-bold text-blue-600">
                      +{dashboardData?.resumen_uso_plataforma.total_matriculas_nuevas_mes || 0}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Empresas Nuevas Mes</p>
                    <p className="text-2xl font-bold text-blue-600">
                      +{dashboardData?.resumen_uso_plataforma.total_empresas_nuevas_mes || 0}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Combustible Más Cargado</p>
                    <p className="text-xl font-bold text-blue-600">
                      {dashboardData?.resumen_uso_plataforma.combustible_mas_cargado.nombre || 'N/A'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatNumber(dashboardData?.resumen_uso_plataforma.combustible_mas_cargado.litros || 0)} litros
                    </p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Estación Más Frecuentada</p>
                    <p className="text-xl font-bold text-blue-600 truncate">
                      {dashboardData?.resumen_uso_plataforma.estacion_mas_frecuentada.nombre || 'N/A'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatNumber(dashboardData?.resumen_uso_plataforma.estacion_mas_frecuentada.cargas || 0)} cargas
                    </p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Monto Total Mes</p>
                    <p className="text-xl font-bold text-blue-600">
                      {formatCurrency(dashboardData?.resumen_uso_plataforma.monto_total_mes || 0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Top 5 Empresas - 3 columnas */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
              {/* Top 5 por Usuarios */}
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg">Top 5 Empresas por Usuarios</CardTitle>
                  <CardDescription>Empresas con más usuarios registrados</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {dashboardData?.metricas_por_empresa
                      .sort((a, b) => b.total_usuarios - a.total_usuarios)
                      .slice(0, 5)
                      .map((empresa, index) => (
                        <div key={empresa.empresa_id} className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {index + 1}. {empresa.empresa}
                            </p>
                            <p className="text-xs text-gray-500">{empresa.ruc}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-blue-600">{empresa.total_usuarios}</p>
                            <p className="text-xs text-gray-500">usuarios</p>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              {/* Top 5 por Matrículas */}
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg">Top 5 Empresas por Matrículas</CardTitle>
                  <CardDescription>Empresas con más vehículos</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {dashboardData?.metricas_por_empresa
                      .sort((a, b) => b.total_matriculas - a.total_matriculas)
                      .slice(0, 5)
                      .map((empresa, index) => (
                        <div key={empresa.empresa_id} className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {index + 1}. {empresa.empresa}
                            </p>
                            <p className="text-xs text-gray-500">{empresa.ruc}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-blue-600">{empresa.total_matriculas}</p>
                            <p className="text-xs text-gray-500">matrículas</p>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              {/* Top 5 por Cargas */}
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg">Top 5 Empresas por Cargas</CardTitle>
                  <CardDescription>Empresas con más transacciones</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {dashboardData?.metricas_por_empresa
                      .sort((a, b) => b.total_cargas - a.total_cargas)
                      .slice(0, 5)
                      .map((empresa, index) => (
                        <div key={empresa.empresa_id} className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {index + 1}. {empresa.empresa}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatCurrency(empresa.total_venta)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-blue-600">{empresa.total_cargas}</p>
                            <p className="text-xs text-gray-500">cargas</p>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Empresas Sin Actividad */}
            {dashboardData && dashboardData.metricas_por_empresa.filter(e => e.dias_inactiva !== null && e.dias_inactiva > 30).length > 0 && (
              <Card className="shadow-md border-blue-200 bg-blue-50">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2 text-blue-800">
                    <AlertCircle className="h-5 w-5" />
                    Alertas: Empresas Sin Actividad (+30 días)
                  </CardTitle>
                  <CardDescription>Empresas que no han realizado cargas en más de 30 días</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {dashboardData.metricas_por_empresa
                      .filter(e => e.dias_inactiva !== null && e.dias_inactiva > 30)
                      .map((empresa) => (
                        <div key={empresa.empresa_id} className="flex items-center justify-between p-3 bg-white rounded-lg">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{empresa.empresa}</p>
                            <p className="text-xs text-gray-500">{empresa.ruc}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-blue-700">{empresa.dias_inactiva} días</p>
                            <p className="text-xs text-gray-500">
                              Última carga: {empresa.ultima_carga ? new Date(empresa.ultima_carga).toLocaleDateString('es-ES') : 'N/A'}
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>

      {/* Barra de navegación inferior - Solo en móviles */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
        <div className="overflow-x-auto">
          <div className="flex min-w-max">
            {bottomNavItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center justify-center space-y-1 px-4 py-2 min-w-[80px] h-16 ${
                  location.pathname === item.path
                    ? 'text-blue-600 bg-blue-50 border-t-2 border-blue-600'
                    : 'text-gray-600'
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span className="text-xs font-medium whitespace-nowrap">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Dashboard;
