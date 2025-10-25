import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../components/ui/select";
import { Label } from "../components/ui/label";
import Sidebar from '../components/ui/sidebar';
import Header from '../components/ui/header';
import { Building2, Users, Fuel, ShoppingCart, TrendingUp, AlertCircle } from 'lucide-react';
import { getUser } from "../utils/auth";
import { API_URLS, APP_KEY } from '../api/config';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "../components/ui/chart";
import { PieChart, Pie, Cell } from 'recharts';

interface UserData {
  username: string;
  role: string | 'user';
}

interface DashboardAdminData {
  fecha_inicio: string;
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
    tasa_actividad_empresas: number;
    tasa_actividad_usuarios: number;
    promedio_usuarios_por_empresa: number;
    promedio_matriculas_por_empresa: number;
    promedio_cargas_por_empresa: number;
    empresas_nuevas_periodo: number;
    empresas_inactivadas_periodo: number;
  };
}

const Dashboard: React.FC = () => {
  //   const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<UserData | null>(null);

  const [periodo, setPeriodo] = useState<string>('30');
  const [error, setError] = useState<string | null>(null);
  // const [empresaId, setEmpresaId] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardAdminData | null>(null);
  // const [empresas, setEmpresas] = useState<Array<{ id: number; razon_social: string; ruc: string }>>([]);
  // const [empresaSeleccionada, setEmpresaSeleccionada] = useState<string>('');
  // const [openCombobox, setOpenCombobox] = useState(false);


  useEffect(() => {
    // Obtener datos del usuario desde localStorage
    const userData = getUser();
    setUser(userData);

  }, []);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      let url = `${API_URLS.PANEL}?cant_dias=${periodo}`;
      
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
  }, [periodo]); // ← Agregar periodo como dependencia

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar userRole={user?.role ?? 'user'} currentPath={location.pathname} />
        <div className="flex-1 flex flex-col">
          <Header title="Dashboard Admin" subtitle="Panel de Control del Sistema" />
          <main className="flex-1 p-6 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Cargando datos del sistema...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar userRole={user?.role ?? 'user'} currentPath={location.pathname} />
        <div className="flex-1 flex flex-col">
          <Header title="Dashboard Admin" subtitle="Panel de Control del Sistema" />
          <main className="flex-1 p-6">
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
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <Sidebar
        userRole={user?.role ?? 'user'}
        currentPath={location.pathname}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <Header
          title="Dashboard Admin"
          subtitle="Panel de Control del Sistema"
        />

        {/* Main Content Area */}
        <main className="flex-1 p-6">
          <div className="space-y-6">
            {/* Filtros */}
            <Card className="shadow-md border-gray-200">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">{getWelcomeMessage()}</h2>
                    <p className="text-gray-500">
                      {dashboardData && `Período: ${new Date(dashboardData.fecha_inicio).toLocaleDateString('es-ES')} - ${new Date(dashboardData.fecha_fin).toLocaleDateString('es-ES')}`}
                    </p>
                  </div>

                  {/* Selector de Período */}
                  <div className="flex items-center gap-3">
                    <Label className="text-sm font-semibold text-gray-700">Período:</Label>
                    <Select value={periodo} onValueChange={setPeriodo}>
                      <SelectTrigger className="w-[180px] border-gray-200 bg-white hover:bg-gray-50 transition-colors">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7">Últimos 7 días</SelectItem>
                        <SelectItem value="15">Últimos 15 días</SelectItem>
                        <SelectItem value="30">Últimos 30 días</SelectItem>
                        <SelectItem value="60">Últimos 60 días</SelectItem>
                        <SelectItem value="90">Últimos 90 días</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* KPIs del Sistema - 4 Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                  <Users className="h-5 w-5 text-purple-600" />
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
                  <Fuel className="h-5 w-5 text-orange-600" />
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
                    Cargas del Período
                  </CardTitle>
                  <ShoppingCart className="h-5 w-5 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">
                    {formatNumber(dashboardData?.kpis_sistema.total_cargas_sistema || 0)}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Transacciones realizadas
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Resumen de Uso de la Plataforma */}
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  Resumen de Uso de la Plataforma
                </CardTitle>
                <CardDescription>Métricas generales del sistema</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Tasa Actividad Empresas</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {dashboardData?.resumen_uso_plataforma.tasa_actividad_empresas.toFixed(1)}%
                    </p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Tasa Actividad Usuarios</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {dashboardData?.resumen_uso_plataforma.tasa_actividad_usuarios.toFixed(1)}%
                    </p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Promedio Usuarios/Empresa</p>
                    <p className="text-2xl font-bold text-green-600">
                      {dashboardData?.resumen_uso_plataforma.promedio_usuarios_por_empresa.toFixed(0)}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Promedio Matrículas/Empresa</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {dashboardData?.resumen_uso_plataforma.promedio_matriculas_por_empresa.toFixed(0)}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-pink-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Promedio Cargas/Empresa</p>
                    <p className="text-2xl font-bold text-pink-600">
                      {dashboardData?.resumen_uso_plataforma.promedio_cargas_por_empresa.toFixed(1)}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="text-center p-4 bg-indigo-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Empresas Nuevas (Período)</p>
                    <p className="text-2xl font-bold text-indigo-600">
                      +{dashboardData?.resumen_uso_plataforma.empresas_nuevas_periodo}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Empresas Inactivadas (Período)</p>
                    <p className="text-2xl font-bold text-red-600">
                      {dashboardData?.resumen_uso_plataforma.empresas_inactivadas_periodo}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Top 5 Empresas - 3 columnas */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                            <p className="text-sm font-bold text-orange-600">{empresa.total_matriculas}</p>
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
                            <p className="text-sm font-bold text-green-600">{empresa.total_cargas}</p>
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
              <Card className="shadow-md border-yellow-200 bg-yellow-50">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2 text-yellow-800">
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
                            <p className="text-sm font-bold text-yellow-700">{empresa.dias_inactiva} días</p>
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
    </div>
  );
};

export default Dashboard;
