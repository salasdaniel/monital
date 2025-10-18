import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "../components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "../components/ui/command";
import { Toaster } from "../components/ui/toaster";
import Sidebar from '../components/ui/sidebar';
import Header from '../components/ui/header';
import { ShoppingCart, Package, DollarSign, TrendingUp, Check, ChevronsUpDown } from "lucide-react";
import { getUser } from "../utils/auth";
import { API_URLS, APP_KEY } from '../api/config';
import { cn } from "../lib/utils";

// Interfaces basadas en la vista SQL vw_venta_detalle
interface VentaDetalle {
  venta_id: number;
  tipo: string;
  identificador_tr: string;
  ticket: string;
  fecha: string;
  codigo_cliente: string;
  ruc_cliente: string;
  nombre_cliente: string;
  codigo_estacion: string;
  nombre_estacion: string;
  codigo_moneda: string;
  nombre_chofer: string;
  matricula: string;
  codigo_producto: string;
  nombre_producto: string;
  cantidad: string;
  precio_unitario: string;
  subtotal: string;
  empresa_id: number;
  matricula_id: number;
}

interface ApiResponse {
  message: string;
  count: number;
  detalles: VentaDetalle[];
}

interface UserData {
  username: string;
  role?: string;
}

interface Empresa {
  id: number;
  nombre_comercial: string;
  ruc: string;
}

const VentasDetalle: React.FC = () => {
  const location = useLocation();
  const [user, setUser] = useState<UserData | null>(null);
  const [detalles, setDetalles] = useState<VentaDetalle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Estados para filtros y paginación
  const [ordenarPor, setOrdenarPor] = useState<string>('fecha');
  const [ordenDireccion, setOrdenDireccion] = useState<'asc' | 'desc'>('desc');
  const [itemsPorPagina, setItemsPorPagina] = useState<number>(10);
  const [paginaActual, setPaginaActual] = useState<number>(1);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [empresaId, setEmpresaId] = useState<number | null>(null);
  const [openCombobox, setOpenCombobox] = useState(false);
  const [fechaDesde, setFechaDesde] = useState<string>('');
  const [fechaHasta, setFechaHasta] = useState<string>('');

  useEffect(() => {
    // Obtener datos del usuario desde localStorage
    const userData = getUser();
    setUser(userData);
    
    // Si el usuario es 'user', se asigna su empresa_id automáticamente
    // Si es admin u otro rol, se inicializa en 0 (todas las empresas)
    if (userData.role === 'user') {
      setEmpresaId(userData.empresa_id);
    } else {
      setEmpresaId(0); // Admin ve todas las empresas por defecto
    }
  }, []);

  useEffect(() => {
    // Solo ejecutar fetchDetalles si empresaId ya está inicializado
    if (empresaId !== null) {
      fetchDetalles();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [empresaId]);

  // Cargar empresas para el combobox (solo si el rol NO es 'user')
  useEffect(() => {
    // Si el rol es 'user', no necesitamos cargar la lista de empresas
    if (user?.role === 'user') {
      return;
    }

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
      } catch (_) {
        // swallow error en UI de solo lectura
      }
    };
    fetchEmpresas();
  }, [user]);

  // Resetear a página 1 cuando cambian los filtros
  useEffect(() => {
    setPaginaActual(1);
  }, [searchTerm, ordenarPor, ordenDireccion, itemsPorPagina, empresaId, fechaDesde, fechaHasta]);

  const fetchDetalles = async () => {

    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      const role = user?.role;
      
      // Construir URL: si es 'user' siempre envía su empresa_id
      // Si es admin y seleccionó una empresa (empresaId > 0), envía ese filtro
      // Si es admin y NO seleccionó empresa (empresaId === 0), no envía filtro (trae todas)
      let url = API_URLS.VENTAS_DETALLE;
      if (role === 'user') {
        url = `${API_URLS.VENTAS_DETALLE}?empresa_id=${empresaId}`;
      } else if (empresaId && empresaId > 0) {
        url = `${API_URLS.VENTAS_DETALLE}?empresa_id=${empresaId}`;
      }
  
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

      const data: ApiResponse = await response.json();
      setDetalles(data.detalles || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar los detalles de ventas');
    } finally {
      setLoading(false);
    }
  };

  // Formatear fecha
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-PY', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Fecha inválida';
    }
  };

  // Formatear moneda (estilo Perú, 2 decimales)
  const formatCurrency = (value: string | null) => {
    if (!value) return 'Gs. 0';
    try {
      const num = parseFloat(value);
      return num.toLocaleString('es-PY', { style: 'currency', currency: 'PYG', minimumFractionDigits: 0, maximumFractionDigits: 0 });
    } catch {
      return 'Gs. 0';
    }
  };

  // Helpers de formateo
  const formatInteger = (n: number) => n.toLocaleString('es-PY');

  // Aplicar filtros y ordenamiento
  const filteredDetalles = detalles
    .filter((detalle) => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        detalle.ticket?.toLowerCase().includes(searchLower) ||
        detalle.nombre_cliente?.toLowerCase().includes(searchLower) ||
        detalle.nombre_producto?.toLowerCase().includes(searchLower) ||
        detalle.nombre_chofer?.toLowerCase().includes(searchLower) ||
        detalle.matricula?.toLowerCase().includes(searchLower) ||
        detalle.codigo_producto?.toLowerCase().includes(searchLower);

      // Filtro de rango de fechas
      let matchesFecha = true;
      if (fechaDesde || fechaHasta) {
        const fechaDetalle = detalle.fecha ? new Date(detalle.fecha) : null;
        if (fechaDetalle) {
          if (fechaDesde) {
            const desde = new Date(fechaDesde);
            desde.setHours(0, 0, 0, 0);
            if (fechaDetalle < desde) matchesFecha = false;
          }
          if (fechaHasta) {
            const hasta = new Date(fechaHasta);
            hasta.setHours(23, 59, 59, 999);
            if (fechaDetalle > hasta) matchesFecha = false;
          }
        } else {
          matchesFecha = false;
        }
      }

      return matchesSearch && matchesFecha;
    })
    .sort((a, b) => {
      let comparison = 0;

      switch (ordenarPor) {
        case 'fecha':
          comparison = new Date(a.fecha || 0).getTime() - new Date(b.fecha || 0).getTime();
          break;
        case 'ticket':
          comparison = (a.ticket || '').localeCompare(b.ticket || '');
          break;
        case 'cliente':
          comparison = (a.nombre_cliente || '').localeCompare(b.nombre_cliente || '');
          break;
        case 'producto':
          comparison = (a.nombre_producto || '').localeCompare(b.nombre_producto || '');
          break;
        case 'subtotal':
          comparison = parseFloat(a.subtotal || '0') - parseFloat(b.subtotal || '0');
          break;
        default:
          comparison = 0;
      }

      return ordenDireccion === 'asc' ? comparison : -comparison;
    });

  // Calcular métricas DINÁMICAS basadas en filteredDetalles
  const totalVentas = new Set(filteredDetalles.map(d => d.venta_id)).size;
  const montoTotal = filteredDetalles.reduce((sum, d) => sum + parseFloat(d.subtotal || '0'), 0);

  // Card 2: combustible más utilizado (por cantidad) - de datos filtrados
  let topProductoNombre = 'N/A';
  let topProductoCantidad = 0;
  {
    const acumulado = new Map<string, number>();
    for (const d of filteredDetalles) {
      const key = d.nombre_producto || d.codigo_producto || 'Desconocido';
      const cant = isNaN(parseFloat(d.cantidad || '0')) ? 0 : parseFloat(d.cantidad || '0');
      acumulado.set(key, (acumulado.get(key) || 0) + cant);
    }
    Array.from(acumulado.entries()).forEach(([k, v]) => {
      if (v > topProductoCantidad) {
        topProductoCantidad = v;
        topProductoNombre = k;
      }
    });
  }

  // Card 4: Carga promedio (promedio de suma de cantidades por venta) - de datos filtrados
  let cargaPromedio = 0;
  if (totalVentas > 0) {
    const porVenta = new Map<number, number>();
    for (const d of filteredDetalles) {
      const cant = isNaN(parseFloat(d.subtotal || '0')) ? 0 : parseFloat(d.subtotal || '0');
      porVenta.set(d.venta_id, (porVenta.get(d.venta_id) || 0) + cant);
    }
    const totalCarga = Array.from(porVenta.values()).reduce((a, b) => a + b, 0);
    cargaPromedio = totalCarga / porVenta.size;
  }

  // Paginación
  const totalPaginas = Math.ceil(filteredDetalles.length / itemsPorPagina);
  const detallesPaginados = filteredDetalles.slice(
    (paginaActual - 1) * itemsPorPagina,
    paginaActual * itemsPorPagina
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar
          userRole={user?.role ?? 'user'}
          currentPath={location.pathname}
        />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-lg text-gray-600">Cargando detalles de ventas...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 flex">
        {/* Sidebar */}
        <Sidebar
          userRole={user?.role ?? 'user'}
          currentPath={location.pathname}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          <Header title="Detalles de Ventas" subtitle="Vista detallada de líneas de productos vendidos" />

          {/* Error general */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 m-4">
              <div className="flex">
                <div className="ml-3">
                  <div className="mt-2 text-sm text-red-700">
                    {error}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Main Content Area */}
          <main className="flex-1 p-6">
            <div className="flex flex-col gap-6">
              {/* Tarjetas de métricas */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border border-gray-200">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Total Cargas</CardTitle>
                    <ShoppingCart className="h-4 w-4 text-gray-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-500">
                      {formatInteger(totalVentas)}
                    </div>
                    <p className="text-xs text-gray-500">Ventas únicas</p>
                  </CardContent>
                </Card>

                <Card className="border border-gray-200">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Combustible más utilizado</CardTitle>
                    <Package className="h-4 w-4 text-gray-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-500">
                      {formatInteger(Math.round(topProductoCantidad))} L.
                    </div>
                    <p className="text-xs text-gray-500">{topProductoNombre}</p>
                  </CardContent>
                </Card>

                <Card className="border border-gray-200">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Monto Total</CardTitle>
                    <DollarSign className="h-4 w-4 text-gray-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-500">
                      {formatCurrency(montoTotal.toString())}
                    </div>
                    <p className="text-xs text-gray-500">Total en ventas</p>
                  </CardContent>
                </Card>

                <Card className="border border-gray-200">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Carga promedio</CardTitle>
                    <TrendingUp className="h-4 w-4 text-gray-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-500">
                      {formatCurrency(cargaPromedio.toString())}
                    </div>
                    <p className="text-xs text-gray-500">Promedio por venta (cantidad)</p>
                  </CardContent>
                </Card>
              </div>

              {/* Filtros y tabla */}
              <Card className="border border-gray-200">
                {/* Filtros en fila horizontal */}
                <div className="p-4 m-4">
                  <div className="flex flex-wrap items-end gap-4">
                    <div className="flex flex-col">
                      <Label className="text-sm font-medium text-gray-700 mb-1">Buscar</Label>
                      <Input
                        placeholder="Ticket, cliente, producto, matrícula..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        variant="minimal"
                        fieldSize="sm"
                        className="w-[300px]"
                      />
                    </div>
                    {/* Ocultar combobox de empresas si el rol es 'user' */}
                    {user?.role !== 'user' && (
                      <div className="flex flex-col">
                        <Label className="text-sm font-medium text-gray-700 mb-1">Empresa</Label>
                        <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="minimal"
                              size="sm"
                              role="combobox"
                              aria-expanded={openCombobox}
                              className="w-[240px] justify-between"
                            >
                              {user?.role === 'admin'
                                ? "Todas las empresas"
                                : empresas.find((e) => e.id === empresaId)?.nombre_comercial || "Seleccionar..."}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[240px] p-0">
                            <Command>
                              <CommandInput placeholder="Buscar empresa..." />
                              <CommandList>
                                <CommandEmpty>No se encontró empresa.</CommandEmpty>
                                <CommandGroup>
                                  <CommandItem
                                    value="todos"
                                    onSelect={() => {
                                      setEmpresaId(0);
                                      setOpenCombobox(false);
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        empresaId === 0 ? "opacity-100" : "opacity-0"
                                      )}
                                    />
                                    Todas las empresas
                                  </CommandItem>
                                  {empresas.map((empresa) => (
                                    <CommandItem
                                      key={empresa.id}
                                      value={`${empresa.nombre_comercial} ${empresa.ruc}`}
                                      onSelect={() => {
                                        setEmpresaId(empresa.id);
                                        setOpenCombobox(false);
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          empresaId === empresa.id ? "opacity-100" : "opacity-0"
                                        )}
                                      />
                                      {empresa.nombre_comercial} ({empresa.ruc})
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      </div>
                    )}
                    <div className="flex flex-col">
                      <Label className="text-sm font-medium text-gray-700 mb-1">Fecha desde</Label>
                      <Input
                        type="date"
                        value={fechaDesde}
                        onChange={(e) => setFechaDesde(e.target.value)}
                        variant="minimal"
                        fieldSize="sm"
                        className="w-[150px]"
                      />
                    </div>
                    <div className="flex flex-col">
                      <Label className="text-sm font-medium text-gray-700 mb-1">Fecha hasta</Label>
                      <Input
                        type="date"
                        value={fechaHasta}
                        onChange={(e) => setFechaHasta(e.target.value)}
                        variant="minimal"
                        fieldSize="sm"
                        className="w-[150px]"
                      />
                    </div>
                    <div className="flex flex-col">
                      <Label className="text-sm font-medium text-gray-700 mb-1">Ordenar por</Label>
                      <Select value={ordenarPor} onValueChange={setOrdenarPor}>
                        <SelectTrigger variant="minimal" size="sm" className="w-[150px]">
                          <SelectValue placeholder="Ordenar por" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fecha">Fecha</SelectItem>
                          <SelectItem value="ticket">Ticket</SelectItem>
                          <SelectItem value="cliente">Cliente</SelectItem>
                          <SelectItem value="producto">Producto</SelectItem>
                          <SelectItem value="subtotal">Subtotal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      variant="minimal"
                      size="sm"
                      className="px-3"
                      onClick={() => setOrdenDireccion(ordenDireccion === 'asc' ? 'desc' : 'asc')}
                    >
                      {ordenDireccion === 'asc' ? 'Ascendente' : 'Descendente'}
                    </Button>
                    <div className="flex flex-col">
                      <Label className="text-sm font-medium text-gray-700 mb-1">Items por página</Label>
                      <Select value={itemsPorPagina.toString()} onValueChange={(value) => setItemsPorPagina(Number(value))}>
                        <SelectTrigger variant="minimal" size="sm" className="w-[80px]">
                          <SelectValue placeholder="Items" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="10">10</SelectItem>
                          <SelectItem value="20">20</SelectItem>
                          <SelectItem value="50">50</SelectItem>
                          <SelectItem value="100">100</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <CardContent className="p-0">
                  <div className="overflow-x-auto mx-4">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-center px-3 py-1 text-gray-700 font-medium">Ticket</th>
                          <th className="text-center px-3 py-1 text-gray-700 font-medium">Fecha</th>
                          <th className="text-center px-3 py-1 text-gray-700 font-medium">Cliente</th>
                          <th className="text-center px-3 py-1 text-gray-700 font-medium">Chofer</th>
                          <th className="text-center px-3 py-1 text-gray-700 font-medium">Matrícula</th>
                          <th className="text-center px-3 py-1 text-gray-700 font-medium">Estación</th>
                          <th className="text-center px-3 py-1 text-gray-700 font-medium">Producto</th>
                          <th className="text-center px-3 py-1 text-gray-700 font-medium">Cantidad</th>
                          <th className="text-center px-3 py-1 text-gray-700 font-medium">P. Unitario</th>
                          <th className="text-center px-3 py-1 text-gray-700 font-medium">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {detallesPaginados.map((detalle, index) => (
                          <tr key={`${detalle.venta_id}-${index}`} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="px-3 py-2 text-center text-gray-700">
                              <span className="font-medium ">{detalle.ticket || 'N/A'}</span>
                            </td>
                            <td className="px-3 py-2 text-center text-gray-600 text-xs">
                              {formatDate(detalle.fecha)}
                            </td>
                            <td className="px-3 py-2 text-left text-gray-700">
                              <div className="flex flex-col">
                                <span className="font-medium">{detalle.nombre_cliente || 'N/A'}</span>
                                <span className="text-xs text-gray-500">{detalle.ruc_cliente || ''}</span>
                              </div>
                            </td>
                            <td className="px-3 py-2 text-left text-gray-700">
                              <div className="flex flex-col">
                                <span className="font-medium">{detalle.nombre_chofer || 'N/A'}</span>
                              </div>
                            </td>
                            <td className="px-3 py-2 text-center text-gray-700">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-500">
                                {detalle.matricula || 'N/A'}
                              </span>
                            </td>
                            <td className="px-3 py-2 text-center text-gray-600 text-xs">
                              {detalle.nombre_estacion || 'N/A'}
                            </td>
                            <td className="px-3 py-2 text-left text-gray-700">
                              <div className="flex flex-col">
                                <span className="font-medium">{detalle.nombre_producto || 'N/A'}</span>
                                <span className="text-xs text-gray-500">{detalle.codigo_producto || ''}</span>
                              </div>
                            </td>
                            <td className="px-3 py-2 text-center text-gray-700">
                              {(detalle.cantidad && !isNaN(parseFloat(detalle.cantidad)))
                                ? parseFloat(detalle.cantidad).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                                : '0.00'}
                            </td>
                            <td className="px-3 py-2 text-right text-gray-700">
                              {formatCurrency(detalle.precio_unitario)}
                            </td>
                            <td className="px-3 py-2 text-right text-gray-700 font-semibold">
                              {formatCurrency(detalle.subtotal)}
                            </td>
                          </tr>
                        ))}
                        {detallesPaginados.length === 0 && (
                          <tr>
                            <td colSpan={10} className="px-3 py-8 text-center text-gray-500">
                              No se encontraron detalles de ventas
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Paginación */}
                  {totalPaginas > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
                      <div className="text-sm text-gray-500">
                        Mostrando {((((paginaActual - 1) * itemsPorPagina) + 1)).toLocaleString('es-PE')} a{' '}
                        {Math.min(paginaActual * itemsPorPagina, filteredDetalles.length).toLocaleString('es-PE')} de{' '}
                        {filteredDetalles.length.toLocaleString('es-PE')} resultados
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="minimal"
                          size="sm"
                          onClick={() => setPaginaActual(p => Math.max(1, p - 1))}
                          disabled={paginaActual === 1}
                        >
                          Anterior
                        </Button>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: Math.min(5, totalPaginas) }, (_, i) => {
                            let pageNumber: number;
                            if (totalPaginas <= 5) {
                              pageNumber = i + 1;
                            } else if (paginaActual <= 3) {
                              pageNumber = i + 1;
                            } else if (paginaActual >= totalPaginas - 2) {
                              pageNumber = totalPaginas - 4 + i;
                            } else {
                              pageNumber = paginaActual - 2 + i;
                            }

                            return (
                              <Button
                                key={i}
                                variant={paginaActual === pageNumber ? "default" : "minimal"}
                                size="sm"
                                onClick={() => setPaginaActual(pageNumber)}
                                className="w-8"
                              >
                                {pageNumber}
                              </Button>
                            );
                          })}
                        </div>
                        <Button
                          variant="minimal"
                          size="sm"
                          onClick={() => setPaginaActual(p => Math.min(totalPaginas, p + 1))}
                          disabled={paginaActual === totalPaginas}
                        >
                          Siguiente
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
      <Toaster />
    </>
  );
};

export default VentasDetalle;
