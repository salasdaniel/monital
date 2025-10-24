import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from '../components/ui/sidebar';
import Header from '../components/ui/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../components/ui/select";
import { Label } from "../components/ui/label";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Area, AreaChart } from 'recharts';
import { TrendingDown, DollarSign, ShoppingCart, MapPin, Fuel, ArrowUp } from "lucide-react";
import { getUser } from "../utils/auth";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, type ChartConfig } from "../components/ui/chart";

// Datos estáticos para los gráficos
const ventasPorPeriodoData = [
  { fecha: '01 Oct', ventas: 45, monto: 12500000 },
  { fecha: '03 Oct', ventas: 52, monto: 14800000 },
  { fecha: '05 Oct', ventas: 48, monto: 13200000 },
  { fecha: '07 Oct', ventas: 61, monto: 16500000 },
  { fecha: '09 Oct', ventas: 55, monto: 15100000 },
  { fecha: '11 Oct', ventas: 67, monto: 18300000 },
  { fecha: '13 Oct', ventas: 58, monto: 15900000 },
  { fecha: '15 Oct', ventas: 72, monto: 19800000 },
  { fecha: '17 Oct', ventas: 65, monto: 17600000 },
  { fecha: '19 Oct', ventas: 78, monto: 21200000 },
];

const ventasPorEstacionData = [
  { estacion: 'Shell San Isidro', cargas: 234, monto: 64200000 },
  { estacion: 'Copetrol Mcal. López', cargas: 198, monto: 54300000 },
  { estacion: 'Petrobras Aviadores', cargas: 187, monto: 51200000 },
  { estacion: 'Shell Villa Morra', cargas: 165, monto: 45300000 },
  { estacion: 'Copetrol Madame Lynch', cargas: 142, monto: 38900000 },
  { estacion: 'Esso San Lorenzo', cargas: 128, monto: 35100000 },
  { estacion: 'Petrobras Trinidad', cargas: 115, monto: 31500000 },
  { estacion: 'Shell Luque', cargas: 98, monto: 26800000 },
];

const combustiblesData = [
  { nombre: 'Diesel B5', valor: 45, litros: 18500 },
  { nombre: 'Gasolina 95', valor: 30, litros: 12300 },
  { nombre: 'Gasolina 97', valor: 15, litros: 6200 },
  { nombre: 'GLP', valor: 10, litros: 4100 },
];

const topMatriculasData = [
  { matricula: 'ABC-1234', cargas: 45, litros: 2250 },
  { matricula: 'XYZ-5678', cargas: 38, litros: 1900 },
  { matricula: 'DEF-9012', cargas: 32, litros: 1600 },
  { matricula: 'GHI-3456', cargas: 28, litros: 1400 },
  { matricula: 'JKL-7890', cargas: 25, litros: 1250 },
  { matricula: 'MNO-2345', cargas: 22, litros: 1100 },
  { matricula: 'PQR-6789', cargas: 19, litros: 950 },
  { matricula: 'STU-0123', cargas: 16, litros: 800 },
];

const comparativaMensualData = [
  { metrica: 'Cargas', mesActual: 1267, mesAnterior: 1134 },
  { metrica: 'Litros', mesActual: 52300, mesAnterior: 48900 },
  { metrica: 'Monto (M)', mesActual: 143, mesAnterior: 128 },
];

// Configuraciones de gráficos
const ventasPorPeriodoConfig = {
  ventas: {
    label: "Cantidad de Ventas",
    color: "hsl(var(--chart-1))",
  },
  monto: {
    label: "Monto (Gs.)",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

const combustiblesConfig = {
  "Diesel B5": {
    label: "Diesel B5",
    color: "hsl(var(--chart-1))",
  },
  "Gasolina 95": {
    label: "Gasolina 95",
    color: "hsl(var(--chart-2))",
  },
  "Gasolina 97": {
    label: "Gasolina 97",
    color: "hsl(var(--chart-3))",
  },
  "GLP": {
    label: "GLP",
    color: "hsl(var(--chart-4))",
  },
} satisfies ChartConfig;

const comparativaMensualConfig = {
  mesActual: {
    label: "Mes Actual",
    color: "hsl(var(--chart-1))",
  },
  mesAnterior: {
    label: "Mes Anterior",
    color: "hsl(var(--chart-5))",
  },
} satisfies ChartConfig;

interface UserData {
  username: string;
  role: string;
  empresa_id?: number;
  name: string;
}

const DashboardCliente: React.FC = () => {
  const location = useLocation();
  const [user, setUser] = useState<UserData | null>(null);
  const [periodo, setPeriodo] = useState<string>('30');

  useEffect(() => {
    const userData = getUser();
    if (userData) {
      setUser(userData);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar
        userRole={user?.role ?? 'user'}
        currentPath={location.pathname}
      />

      <div className="flex-1 flex flex-col">
        <Header title="Dashboard" subtitle="Resumen de ventas y consumo de combustible" />

        <main className="flex-1 p-6">
          {/* Card de Bienvenida y Filtros */}
          <Card className="border-0 shadow-sm mb-6">
            <CardContent className="pt-6 pb-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                {/* Mensaje de Bienvenida */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">
                    Bienvenido {user?.name || 'Usuario'}
                  </h2>
                  <p className="text-sm text-gray-500">
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

                {/* Selector de Período */}
                <div className="flex items-center gap-3">
                  <Label className="text-sm font-semibold text-gray-700">Período:</Label>
                  <Select value={periodo} onValueChange={setPeriodo}>
                    <SelectTrigger className="w-[200px] border-gray-200 bg-white hover:bg-gray-50 transition-colors">
                      <SelectValue placeholder="Seleccionar período" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">Últimos 7 días</SelectItem>
                      <SelectItem value="30">Últimos 30 días</SelectItem>
                      <SelectItem value="90">Últimos 3 meses</SelectItem>
                      <SelectItem value="180">Últimos 6 meses</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* KPIs Cards - Estilo Horizon UI */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
            {/* Total Ventas */}
            <Card className="border-0 shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Total Cargas</p>
                    <h3 className="text-2xl font-bold text-gray-900">1,267</h3>
                    <div className="flex items-center gap-1 mt-2">
                      <span className="text-xs font-semibold text-green-500 flex items-center">
                        <ArrowUp className="h-3 w-3" />
                        +12%
                      </span>
                      <span className="text-xs text-gray-400">vs mes anterior</span>
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
                    <p className="text-sm text-gray-500 mb-1">Monto Total</p>
                    <h3 className="text-2xl font-bold text-gray-900">Gs. 143M</h3>
                    <div className="flex items-center gap-1 mt-2">
                      <span className="text-xs font-semibold text-green-500 flex items-center">
                        <ArrowUp className="h-3 w-3" />
                        +8%
                      </span>
                      <span className="text-xs text-gray-400">vs mes anterior</span>
                    </div>
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
                    <p className="text-sm text-gray-500 mb-1">Litros Totales</p>
                    <h3 className="text-2xl font-bold text-gray-900">52,300</h3>
                    <div className="flex items-center gap-1 mt-2">
                      <span className="text-xs font-semibold text-green-500 flex items-center">
                        <ArrowUp className="h-3 w-3" />
                        +7%
                      </span>
                      <span className="text-xs text-gray-400">vs mes anterior</span>
                    </div>
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
                    <p className="text-sm text-gray-500 mb-1">Matriculas</p>
                    <h3 className="text-2xl font-bold text-gray-900">24</h3>
                    <div className="flex items-center gap-1 mt-2">
                      <span className="text-xs font-semibold text-green-500 flex items-center">
                        <ArrowUp className="h-3 w-3" />
                        +2
                      </span>
                      <span className="text-xs text-gray-400">este mes</span>
                    </div>
                  </div>
                  <div className="h-14 w-14 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center shadow-lg">
                    <MapPin className="h-7 w-7 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Fila con gráfico principal y card lateral */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 mb-6">
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
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">Gs. 143M</p>
                      <p className="text-sm text-green-500 font-semibold flex items-center justify-end gap-1">
                        <ArrowUp className="h-4 w-4" />
                        +8.2%
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pb-4">
                  <ChartContainer config={ventasPorPeriodoConfig} className="h-[280px] w-full">
                    <AreaChart data={ventasPorPeriodoData} accessibilityLayer>
                      <defs>
                        <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorMonto" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0}/>
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
                        dataKey="ventas"
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
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Ticket Promedio</span>
                        <span className="text-lg font-bold text-gray-900">Gs. 112K</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full" style={{width: '75%'}}></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Litros/Carga</span>
                        <span className="text-lg font-bold text-gray-900">41.3 L</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full" style={{width: '60%'}}></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Estaciones</span>
                        <span className="text-lg font-bold text-gray-900">24</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-purple-400 to-purple-600 rounded-full" style={{width: '85%'}}></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Vehículos</span>
                        <span className="text-lg font-bold text-gray-900">185</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-orange-400 to-orange-600 rounded-full" style={{width: '90%'}}></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Fila con 3 gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
            {/* Top Estaciones - Estilo Horizon UI */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold text-gray-900">Top Estaciones</CardTitle>
                <CardDescription className="text-sm text-gray-500">Ranking por cargas</CardDescription>
              </CardHeader>
              <CardContent className="pb-4">
                <div className="space-y-5">
                  {ventasPorEstacionData.slice(0, 5).map((estacion, index) => {
                    const maxCargas = ventasPorEstacionData[0].cargas;
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
                            style={{width: `${percentage}%`}}
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
                  <ChartContainer config={combustiblesConfig} className="h-[180px] w-full">
                    <PieChart accessibilityLayer>
                      <Pie
                        data={combustiblesData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={75}
                        paddingAngle={3}
                        dataKey="valor"
                      >
                        {combustiblesData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={`var(--color-${entry.nombre.replace(' ', '-')})`}
                          />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </PieChart>
                  </ChartContainer>
                  
                  <div className="w-full mt-4 grid grid-cols-2 gap-3">
                    {combustiblesData.map((item, index) => {
                      const colors = [
                        'bg-blue-500',
                        'bg-green-500',
                        'bg-orange-500',
                        'bg-purple-500'
                      ];
                      return (
                        <div key={index} className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-sm ${colors[index]}`}></div>
                          <span className="text-xs text-gray-600">{item.nombre}</span>
                          <span className="text-xs font-bold text-gray-900 ml-auto">{item.valor}%</span>
                        </div>
                      );
                    })}
                  </div>
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
                  
                  {topMatriculasData.slice(0, 7).map((vehiculo, index) => {
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
                      <th className="text-right px-4 py-3 text-gray-700 font-semibold">Variación</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-gray-700">Total de Cargas</td>
                      <td className="text-right px-4 py-3 font-bold text-gray-900">1,267</td>
                      <td className="text-right px-4 py-3">
                        <span className="text-green-600 font-semibold flex items-center justify-end gap-1">
                          <ArrowUp className="h-3 w-3" />
                          +12%
                        </span>
                      </td>
                    </tr>
                    <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-gray-700">Litros Totales</td>
                      <td className="text-right px-4 py-3 font-bold text-gray-900">52,300</td>
                      <td className="text-right px-4 py-3">
                        <span className="text-green-600 font-semibold flex items-center justify-end gap-1">
                          <ArrowUp className="h-3 w-3" />
                          +7%
                        </span>
                      </td>
                    </tr>
                    <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-gray-700">Monto Total</td>
                      <td className="text-right px-4 py-3 font-bold text-gray-900">Gs. 143M</td>
                      <td className="text-right px-4 py-3">
                        <span className="text-green-600 font-semibold flex items-center justify-end gap-1">
                          <ArrowUp className="h-3 w-3" />
                          +8%
                        </span>
                      </td>
                    </tr>
                    <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-gray-700">Promedio por Carga (litros)</td>
                      <td className="text-right px-4 py-3 font-bold text-gray-900">41.3</td>
                      <td className="text-right px-4 py-3">
                        <span className="text-red-600 font-semibold flex items-center justify-end gap-1">
                          <TrendingDown className="h-3 w-3" />
                          -3%
                        </span>
                      </td>
                    </tr>
                    <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-gray-700">Ticket Promedio</td>
                      <td className="text-right px-4 py-3 font-bold text-gray-900">Gs. 112,893</td>
                      <td className="text-right px-4 py-3">
                        <span className="text-green-600 font-semibold flex items-center justify-end gap-1">
                          <ArrowUp className="h-3 w-3" />
                          +5%
                        </span>
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-gray-700">Estaciones Utilizadas</td>
                      <td className="text-right px-4 py-3 font-bold text-gray-900">24</td>
                      <td className="text-right px-4 py-3">
                        <span className="text-green-600 font-semibold flex items-center justify-end gap-1">
                          <ArrowUp className="h-3 w-3" />
                          +2
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default DashboardCliente;
