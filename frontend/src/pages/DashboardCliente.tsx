import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Sidebar from '../components/ui/sidebar';
import Header from '../components/ui/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../components/ui/select";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "../components/ui/command";
import { PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Area, AreaChart } from 'recharts';
import { DollarSign, ShoppingCart, MapPin, Fuel, Check, ChevronsUpDown, Home, Building2, Users, Coins, ChartColumnIncreasing, Car, SlidersHorizontal } from "lucide-react";
import { getUser } from "../utils/auth";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, type ChartConfig } from "../components/ui/chart";
import { API_URLS, APP_KEY } from '../api/config';
import { cn } from "../lib/utils";
// Datos estáticos para los gráficos

interface DashboardData {
  fecha_inicio: string;
  fecha_fin: string;
  encabezados: {
    total_cargas: number;
    total_venta: number;
    litros_totales: number;
    total_matriculas: number;
  };
  ventas_por_periodo: Array<{
    fecha: string;
    litros: number;
    monto: number;
  }>;
  indicadores: {
    ticket_promedio: number;
    litros_por_carga: number;
    estaciones: number;
    matriculas: number;
  };
  top_estaciones: Array<{
    estacion: string;
    cargas: number;
    monto: number;
  }>;
  combustibles: Array<{
    nombre: string;
    valor: number;
    litros: number;
  }>;
  top_matriculas: Array<{
    matricula: string;
    cargas: number;
    litros: number;
  }>;
}

// Configuraciones de gráficos
const ventasPorPeriodoConfig = {
  litros: {
    label: "Litros",
    color: "hsl(var(--chart-1))",
  },
  monto: {
    label: "Monto (₲)",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

interface UserData {
  username: string;
  role: string;
  empresa_id?: number;
  name: string;
}
const DashboardCliente: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<UserData | null>(null);
  const [periodo, setPeriodo] = useState<string>('30');
  const [error, setError] = useState<string | null>(null);
  const [empresaId, setEmpresaId] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [empresas, setEmpresas] = useState<Array<{ id: number; razon_social: string; ruc: string }>>([]);
  const [empresaSeleccionada, setEmpresaSeleccionada] = useState<string>('');
  const [openCombobox, setOpenCombobox] = useState(false);

  // Menú de navegación inferior para móviles
  const bottomNavItems = user?.role === 'admin' 
    ? [
        { icon: SlidersHorizontal, label: 'Panel', path: '/panel' },
        { icon: Home, label: 'Dashboard', path: '/dashboard' },
        { icon: Building2, label: 'Empresas', path: '/empresas' },
        { icon: Users, label: 'Usuarios', path: '/users' },
        { icon: Coins, label: 'Ventas', path: '/ventas' },
        { icon: ChartColumnIncreasing, label: 'Detalle', path: '/ventas-detalle' },
        { icon: Car, label: 'Matrículas', path: '/matriculas' },
      ]
    : [
        { icon: Home, label: 'Dashboard', path: '/dashboard' },
        { icon: Coins, label: 'Ventas', path: '/ventas' },
        { icon: ChartColumnIncreasing, label: 'Detalle', path: '/ventas-detalle' },
        { icon: Car, label: 'Matrículas', path: '/matriculas' },
      ];


  useEffect(() => {
    const userData = getUser();
    if (userData) {
      setUser(userData);
      setEmpresaId(userData.empresa_id);
    }
  }, []);

  // Cargar empresas si es admin
  useEffect(() => {
    if (user?.role === 'admin') {
      fetchEmpresas();
    }
  }, [user]);

  const fetchEmpresas = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(API_URLS.EMPRESAS, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'X-App-Key': APP_KEY
        }
      });
      if (!response.ok) {
        throw new Error(`Error ${response.status}`);
      }
      const data = await response.json();
      setEmpresas(data.empresas || []);
      console.log('Empresas cargadas:', data.empresas);
    } catch (err) {
      console.error('Error al cargar empresas:', err);
    }
  };

   useEffect(() => {
      // Determinar qué empresa usar
      const idEmpresa = user?.role === 'admin' && empresaSeleccionada 
        ? parseInt(empresaSeleccionada) 
        : empresaId;
        
      // Solo ejecutar si hay una empresa válida
      if (idEmpresa !== 0) {
        fetchDashboardData();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [empresaId, empresaSeleccionada, periodo]);

  const fetchDashboardData = async () => {
    try {

      setLoading(true);
      const token = localStorage.getItem('access_token');
      
      // Determinar qué empresa usar: si es admin y hay empresa seleccionada, usar esa; sino usar empresaId del usuario
      const idEmpresa = user?.role === 'admin' && empresaSeleccionada 
        ? parseInt(empresaSeleccionada) 
        : empresaId;
      
      let url = `${API_URLS.DASHBOARD}?empresa_id=${idEmpresa}&cant_dias=${periodo}`;

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

      const apiResponse: DashboardData = await response.json();
      setDashboardData(apiResponse);
      setError(null);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar los datos del dashboard de ventas');
 
    }finally{
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="hidden md:block">
        <Sidebar
          userRole={user?.role ?? 'user'}
          currentPath={location.pathname}
        />
      </div>

      <div className="flex-1 flex flex-col pb-16 md:pb-0 md:ml-64">
        <Header title="Dashboard" subtitle="Resumen de ventas y consumo de combustible" />

        <main className="flex-1 p-4 md:p-6 pt-[76px] md:pt-[92px]">
          {/* Card de Bienvenida y Filtros */}
          <Card className="border-0 shadow-sm mb-6">
            <CardContent className="pt-6 pb-6">
              <div className="flex flex-col gap-4">
                {/* Mensaje de Bienvenida */}
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">
                    Bienvenido {user?.name || 'Usuario'}
                  </h2>
                  <p className="text-xs md:text-sm text-gray-500">
                    {new Date().toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}, {new Date().toLocaleTimeString('es-ES', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>

                {/* Filtros */}
                <div className="flex flex-col gap-3">
                  {/* Selector de Empresa - Solo para Admin */}
                  {user?.role === 'admin' && (
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                      <Label className="text-xs md:text-sm font-semibold text-gray-700 min-w-[70px]">Empresa:</Label>
                      <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="minimal"
                            role="combobox"
                            aria-expanded={openCombobox}
                            className="w-full sm:w-[280px] md:w-[300px] justify-between h-9 border-gray-200 bg-white hover:bg-gray-50"
                          >
                            {empresaSeleccionada === ''
                              ? "Seleccionar empresa..."
                              : empresas.find((empresa) => empresa.id.toString() === empresaSeleccionada)?.razon_social || "Seleccionar empresa..."
                            }
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[calc(100vw-2rem)] sm:w-[280px] md:w-[300px] p-0">
                          <Command>
                            <CommandInput placeholder="Buscar empresa..." />
                            <CommandList>
                              <CommandEmpty>No se encontraron empresas.</CommandEmpty>
                              <CommandGroup>
                                {empresas.map((empresa) => (
                                  <CommandItem
                                    key={empresa.id}
                                    value={`${empresa.razon_social} ${empresa.ruc}`}
                                    onSelect={() => {
                                      setEmpresaSeleccionada(empresa.id.toString());
                                      setOpenCombobox(false);
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        empresaSeleccionada === empresa.id.toString() ? "opacity-100" : "opacity-0"
                                      )}
                                    />
                                    {empresa.razon_social}-{empresa.ruc}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>
                  )}

                  {/* Selector de Período */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                    <Label className="text-xs md:text-sm font-semibold text-gray-700 min-w-[70px]">Período:</Label>
                    <Select value={periodo} onValueChange={setPeriodo}>
                      <SelectTrigger className="w-full sm:w-[180px] md:w-[200px] border-gray-200 bg-white hover:bg-gray-50 transition-colors">
                        <SelectValue placeholder="Seleccionar período" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7">Últimos 7 días</SelectItem>
                        <SelectItem value="30">Últimos 30 días</SelectItem>
                        <SelectItem value="60">Últimos 60 días</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Indicador de Carga */}
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Cargando datos...</span>
            </div>
          )}

          {/* Mensaje de Error */}
          {error && !loading && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              <p className="font-semibold">Error al cargar los datos:</p>
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* KPIs Cards - Estilo Horizon UI */}
          {!loading && dashboardData && (
          <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 mb-4 md:mb-6">
            {/* Total Ventas */}
            <Card className="border-0 shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs md:text-sm text-gray-500 mb-1">Total Cargas</p>
                    <h3 className="text-xl md:text-2xl font-bold text-gray-900">{dashboardData?.encabezados?.total_cargas || 0}</h3>
                    <div className="flex items-center gap-1 mt-2">
                      {/* <span className="text-xs font-semibold text-green-500 flex items-center">
                        <ArrowUp className="h-3 w-3" />
                        +12%
                      </span>
                      <span className="text-xs text-gray-400">vs mes anterior</span> */}
                    </div>
                  </div>
                  <div className="h-14 w-14 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg">
                    <ShoppingCart className="h-7 w-7 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Monto Total */}
            <Card className="border-0 shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs md:text-sm text-gray-500 mb-1">Monto Total</p>
                    <h3 className="text-xl md:text-2xl font-bold text-gray-900">
                      ₲{dashboardData?.encabezados?.total_venta 
                        ? new Intl.NumberFormat('es-PY').format(dashboardData.encabezados.total_venta) 
                        : '0'}
                    </h3>
                  </div>
                  <div className="h-14 w-14 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-lg">
                    <DollarSign className="h-7 w-7 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Litros Totales */}
            <Card className="border-0 shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs md:text-sm text-gray-500 mb-1">Total Estaciones</p>
                    <h3 className="text-xl md:text-2xl font-bold text-gray-900">
                      {dashboardData?.encabezados?.litros_totales 
                        ? new Intl.NumberFormat('es-PY').format(dashboardData.encabezados.litros_totales) 
                        : '0'} L
                    </h3>
                  </div>
                  <div className="h-14 w-14 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-lg">
                    <Fuel className="h-7 w-7 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Estaciones Activas */}
            <Card className="border-0 shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs md:text-sm text-gray-500 mb-1">Matriculas</p>
                    <h3 className="text-xl md:text-2xl font-bold text-gray-900">
                      {dashboardData?.encabezados?.total_matriculas || 0}
                    </h3>
                  </div>
                  <div className="h-14 w-14 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center shadow-lg">
                    <MapPin className="h-7 w-7 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Fila con gráfico principal y card lateral */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 mb-4 md:mb-6">
            {/* Gráfico de Ventas por Período - 3 columnas */}
            <div className="lg:col-span-3">
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg font-bold text-gray-900">Ventas por Período</CardTitle>
                      <CardDescription className="text-sm text-gray-500 mt-1">
                        Evolución de ventas en los últimos {periodo} días
                      </CardDescription>
                    </div>
                    {/* <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">Gs. 143M</p>
                      <p className="text-sm text-green-500 font-semibold flex items-center justify-end gap-1">
                        <ArrowUp className="h-4 w-4" />
                        +8.2%
                      </p>
                    </div> */}
                  </div>
                </CardHeader>
                <CardContent className="pb-4">
                  <ChartContainer config={ventasPorPeriodoConfig} className="h-[280px] w-full">
                    <AreaChart data={dashboardData?.ventas_por_periodo || []} accessibilityLayer>
                      <defs>
                        <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorMonto" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="fecha" tick={{ fontSize: 12, fill: '#9ca3af' }} />
                      <YAxis yAxisId="left" tick={{ fontSize: 12, fill: '#9ca3af' }} />
                      <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12, fill: '#9ca3af' }} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <ChartLegend content={<ChartLegendContent />} />
                      <Area
                        yAxisId="left"
                        type="monotone"
                        dataKey="litros"
                        stroke="hsl(var(--chart-1))"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorVentas)"
                      />
                      <Area
                        yAxisId="right"
                        type="monotone"
                        dataKey="monto"
                        stroke="hsl(var(--chart-2))"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorMonto)"
                      />
                    </AreaChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>

            {/* Card de Indicadores Clave - 1 columna */}
            <div className="lg:col-span-1">
              <Card className="border-0 shadow-sm h-full">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-bold text-gray-900">Indicadores</CardTitle>
                  <CardDescription className="text-sm text-gray-500">Métricas del período</CardDescription>
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="space-y-4 md:space-y-6">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Ticket Promedio</span>
                        <span className="text-lg font-bold text-gray-900">
                          ₲{dashboardData?.indicadores?.ticket_promedio 
                            ? new Intl.NumberFormat('es-PY').format(dashboardData.indicadores.ticket_promedio) 
                            : '0'}
                        </span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full" style={{ width: '75%' }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Litros/Carga</span>
                        <span className="text-lg font-bold text-gray-900">
                          {dashboardData?.indicadores?.litros_por_carga?.toFixed(1) || '0'} L
                        </span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full" style={{ width: '60%' }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Estaciones</span>
                        <span className="text-lg font-bold text-gray-900">
                          {dashboardData?.indicadores?.estaciones || 0}
                        </span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-purple-400 to-purple-600 rounded-full" style={{ width: '85%' }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Vehículos</span>
                        <span className="text-lg font-bold text-gray-900">
                          {dashboardData?.indicadores?.matriculas || 0}
                        </span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-orange-400 to-orange-600 rounded-full" style={{ width: '90%' }}></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Fila con 3 gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-5 mb-4 md:mb-6">
            {/* Top Estaciones - Estilo Horizon UI */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold text-gray-900">Top Estaciones</CardTitle>
                <CardDescription className="text-sm text-gray-500">Ranking por cargas</CardDescription>
              </CardHeader>
              <CardContent className="pb-4">
                <div className="space-y-5">
                  {(dashboardData?.top_estaciones || []).slice(0, 5).map((estacion, index) => {
                    const maxCargas = dashboardData?.top_estaciones?.[0]?.cargas || 1;
                    const percentage = (estacion.cargas / maxCargas) * 100;
                    const colors = [
                      'from-blue-400 to-blue-600',
                      'from-purple-400 to-purple-600',
                      'from-green-400 to-green-600',
                      'from-orange-400 to-orange-600',
                      'from-pink-400 to-pink-600'
                    ];

                    return (
                      <div key={index}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700 truncate pr-2">{estacion.estacion}</span>
                          <span className="text-sm font-bold text-gray-900">{estacion.cargas}</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full bg-gradient-to-r ${colors[index]} rounded-full transition-all duration-500`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Distribución de Combustibles - Estilo Horizon UI */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold text-gray-900">Combustibles</CardTitle>
                <CardDescription className="text-sm text-gray-500">Distribución de consumo</CardDescription>
              </CardHeader>
              <CardContent className="pb-4">
                <div className="flex flex-col items-center">
                  {(() => {
                    // Generar configuración dinámica basada en los combustibles de la API
                    const combustibles = dashboardData?.combustibles || [];
                    const dynamicConfig: ChartConfig = {};
                    const chartColors = [
                      'hsl(var(--chart-1))', // Azul
                      'hsl(var(--chart-2))', // Verde
                      'hsl(var(--chart-3))', // Naranja
                      'hsl(var(--chart-4))', // Morado
                      'hsl(var(--chart-5))', // Rosa
                    ];
                    const tailwindColors = [
                      'bg-blue-500',
                      'bg-green-500',
                      'bg-orange-500',
                      'bg-purple-500',
                      'bg-pink-500'
                    ];

                    combustibles.forEach((combustible, index) => {
                      dynamicConfig[combustible.nombre] = {
                        label: combustible.nombre,
                        color: chartColors[index % chartColors.length],
                      };
                    });

                    return (
                      <>
                        <ChartContainer config={dynamicConfig} className="h-[180px] w-full">
                          <PieChart accessibilityLayer>
                            <Pie
                              data={combustibles}
                              cx="50%"
                              cy="50%"
                              innerRadius={50}
                              outerRadius={75}
                              paddingAngle={3}
                              dataKey="valor"
                            >
                              {combustibles.map((entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={chartColors[index % chartColors.length]}
                                />
                              ))}
                            </Pie>
                            <ChartTooltip content={<ChartTooltipContent />} />
                          </PieChart>
                        </ChartContainer>

                        <div className="w-full mt-4 grid grid-cols-2 gap-3">
                          {combustibles.map((item, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <div className={`w-3 h-3 rounded-sm ${tailwindColors[index % tailwindColors.length]}`}></div>
                              <span className="text-xs text-gray-600">{item.nombre}</span>
                              <span className="text-xs font-bold text-gray-900 ml-auto">{item.valor.toFixed(1)}%</span>
                            </div>
                          ))}
                        </div>
                      </>
                    );
                  })()}
                </div>
              </CardContent>
            </Card>

            {/* Top Vehículos - Estilo Horizon UI Tabla */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold text-gray-900">Top Vehículos</CardTitle>
                <CardDescription className="text-sm text-gray-500">Ranking por cargas</CardDescription>
              </CardHeader>
              <CardContent className="pb-4">
                <div className="space-y-1">
                  <div className="grid grid-cols-12 gap-2 pb-2 border-b border-gray-200">
                    <span className="col-span-2 text-xs font-semibold text-gray-500">#</span>
                    <span className="col-span-5 text-xs font-semibold text-gray-500">Matrícula</span>
                    <span className="col-span-3 text-xs font-semibold text-gray-500 text-right">Cargas</span>
                    <span className="col-span-2 text-xs font-semibold text-gray-500 text-right">Litros</span>
                  </div>

                  {(dashboardData?.top_matriculas || []).slice(0, 7).map((vehiculo, index) => {
                    const colors = [
                      'bg-blue-500',
                      'bg-purple-500',
                      'bg-green-500',
                      'bg-gray-400',
                      'bg-gray-400',
                      'bg-gray-400',
                      'bg-gray-400'
                    ];

                    return (
                      <div key={index} className="grid grid-cols-12 gap-2 py-2 hover:bg-gray-50 transition-colors rounded">
                        <div className="col-span-2 flex items-center">
                          <span className={`w-6 h-6 rounded-full ${colors[index]} text-white text-xs font-bold flex items-center justify-center`}>
                            {index + 1}
                          </span>
                        </div>
                        <span className="col-span-5 text-sm font-medium text-gray-900 flex items-center">{vehiculo.matricula}</span>
                        <span className="col-span-3 text-sm font-bold text-gray-900 text-right flex items-center justify-end">{vehiculo.cargas}</span>
                        <span className="col-span-2 text-xs text-gray-500 text-right flex items-center justify-end">{vehiculo.litros.toLocaleString()}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Comparativa Mensual */}
          {/* <div className="mb-6">
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold text-gray-900">Comparativa Mensual</CardTitle>
                <CardDescription className="text-sm text-gray-500">Mes actual vs mes anterior</CardDescription>
              </CardHeader>
              <CardContent className="pb-4">
                <ChartContainer config={comparativaMensualConfig} className="h-[240px] w-full">
                  <BarChart data={comparativaMensualData} accessibilityLayer barGap={8}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="metrica" tick={{ fontSize: 12, fill: '#6b7280' }} />
                    <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Bar dataKey="mesActual" fill="hsl(var(--chart-1))" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="mesAnterior" fill="hsl(var(--chart-5))" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div> */}

          {/* Tabla resumen */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-bold text-gray-900">Resumen de Indicadores</CardTitle>
              <CardDescription className="text-sm text-gray-500">Métricas clave del período seleccionado</CardDescription>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left px-4 py-3 text-gray-700 font-semibold">Indicador</th>
                      <th className="text-right px-4 py-3 text-gray-700 font-semibold">Valor</th>
                      {/* <th className="text-right px-4 py-3 text-gray-700 font-semibold">Variación</th> */}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-gray-700">Total de Cargas</td>
                      <td className="text-right px-4 py-3 font-bold text-gray-900">
                        {dashboardData?.encabezados?.total_cargas 
                          ? new Intl.NumberFormat('es-PY').format(dashboardData.encabezados.total_cargas) 
                          : '0'}
                      </td>
                      {/* <td className="text-right px-4 py-3">
                        <span className="text-gray-400 text-sm">-</span>
                      </td> */}
                    </tr>
                    <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-gray-700">Litros Totales</td>
                      <td className="text-right px-4 py-3 font-bold text-gray-900">
                        {dashboardData?.encabezados?.litros_totales 
                          ? new Intl.NumberFormat('es-PY').format(dashboardData.encabezados.litros_totales) 
                          : '0'}
                      </td>
                      {/* <td className="text-right px-4 py-3">
                        <span className="text-gray-400 text-sm">-</span>
                      </td> */}
                    </tr>
                    <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-gray-700">Monto Total</td>
                      <td className="text-right px-4 py-3 font-bold text-gray-900">
                        ₲{dashboardData?.encabezados?.total_venta 
                          ? new Intl.NumberFormat('es-PY').format(dashboardData.encabezados.total_venta) 
                          : '0'}
                      </td>
                      {/* <td className="text-right px-4 py-3">
                        <span className="text-gray-400 text-sm">-</span>
                      </td> */}
                    </tr>
                    <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-gray-700">Promedio por Carga (litros)</td>
                      <td className="text-right px-4 py-3 font-bold text-gray-900">
                        {dashboardData?.indicadores?.litros_por_carga?.toFixed(1) || '0'}
                      </td>
                      {/* <td className="text-right px-4 py-3">
                        <span className="text-gray-400 text-sm">-</span>
                      </td> */}
                    </tr>
                    <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-gray-700">Ticket Promedio</td>
                      <td className="text-right px-4 py-3 font-bold text-gray-900">
                        ₲{dashboardData?.indicadores?.ticket_promedio 
                          ? new Intl.NumberFormat('es-PY').format(dashboardData.indicadores.ticket_promedio) 
                          : '0'}
                      </td>
                      {/* <td className="text-right px-4 py-3">
                        <span className="text-gray-400 text-sm">-</span>
                      </td> */}
                    </tr>
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-gray-700">Estaciones Utilizadas</td>
                      <td className="text-right px-4 py-3 font-bold text-gray-900">
                        {dashboardData?.indicadores?.estaciones || 0}
                      </td>
                      {/* <td className="text-right px-4 py-3">
                        <span className="text-gray-400 text-sm">-</span>
                      </td> */}
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
          </>
          )}
        </main>
      </div>

      {/* Barra de navegación inferior - Solo móvil */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-50">
        <div className="overflow-x-auto">
          <div className="flex min-w-max">
            {bottomNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`flex-1 min-w-[80px] flex flex-col items-center justify-center py-2 px-3 transition-colors ${
                    isActive
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-5 w-5 mb-1" />
                  <span className="text-xs font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardCliente;
