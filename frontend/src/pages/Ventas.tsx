import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "../components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "../components/ui/command";
import { useToast } from "../components/ui/use-toast";
import { Toaster } from "../components/ui/toaster";
import Sidebar from '../components/ui/sidebar';
import Header from '../components/ui/header';
import { ShoppingCart, DollarSign, Check, ChevronsUpDown, MapPin, Car } from "lucide-react";
import { getUser } from "../utils/auth";
import { API_URLS, APP_KEY } from '../api/config';
import { cn } from "../lib/utils";

// Interfaces basadas en la API de ventas
interface VentaLinea {
  id: number;
  codigo_producto: string | null;
  nombre_producto: string | null;
  precio_unitario: string | null;
  cantidad: string | null;
  subtotal: string | null;
}

interface Venta {
  id: number;
  tipo: string | null;
  identificador_tr: string | null;
  ticket: string | null;
  fecha: string | null;
  codigo_cliente: string | null;
  ruc_cliente: string | null;
  nombre_cliente: string | null;
  codigo_estacion: string | null;
  nombre_estacion: string | null;
  codigo_moneda: string | null;
  total: string | null;
  documento_chofer: string | null;
  nombre_chofer: string | null;
  matricula: string | null;
  matricula_id: number | null;
  matricula_nro: string | null;
  kilometraje: number | null;
  tarjeta: string | null;
  empresa_id: number | null;
  empresa_nombre: string | null;
  empresa_ruc: string | null;
  lineas: VentaLinea[];
  created_at: string;
  updated_at: string;
}

interface ApiResponse {
  message: string;
  count: number;
  ventas: Venta[];
}

interface UserData {
  username: string;
  role?: string;
  empresa_id?: number;
}

interface Empresa {
  id: number;
  nombre_comercial: string;
  ruc: string;
}

const Ventas: React.FC = () => {
  const location = useLocation();
  const { toast } = useToast();
  const [user, setUser] = useState<UserData | null>(null);
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Estados para filtros y paginación
  const [ordenarPor, setOrdenarPor] = useState<string>('fecha');
  const [ordenDireccion, setOrdenDireccion] = useState<'asc' | 'desc'>('desc');
  const [itemsPorPagina, setItemsPorPagina] = useState<number>(10);
  const [paginaActual, setPaginaActual] = useState<number>(1);

  const [empresaId, setEmpresaId] = useState<number | null>(null);
  
  // Estados para combobox de empresas
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [openCombobox, setOpenCombobox] = useState(false);
  
  // Estados para filtros de fecha
  const [fechaDesde, setFechaDesde] = useState<string>('');
  const [fechaHasta, setFechaHasta] = useState<string>('');

  useEffect(() => {
    const userData = getUser();
    setUser(userData);

    if (userData.role === 'user') {
      setEmpresaId(userData.empresa_id);
    } else {
      setEmpresaId(0); // Admin ve todas las empresas por defecto
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cargar empresas para el combobox (solo si el rol NO es 'user')
  useEffect(() => {
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

  useEffect(() => {
    // Solo ejecutar fetchVentas si empresaId ya está inicializado
    if (empresaId !== null) {
      fetchVentas();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [empresaId]);

  useEffect(() => {
    setPaginaActual(1);
  }, [searchTerm, ordenarPor, ordenDireccion, itemsPorPagina, fechaDesde, fechaHasta]);

  const fetchVentas = async () => {

    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      const role = user?.role;

      
      let url = API_URLS.VENTAS;
      // console.log('url enviada', url, 'empresaId', empresaId, 'role', role);
      if (role === 'user') {
        url = `${API_URLS.VENTAS}?empresa_id=${empresaId}`;
      } else if (empresaId && empresaId > 0) {
        url = `${API_URLS.VENTAS}?empresa_id=${empresaId}`;
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
      setVentas(data.ventas || []);
      setError(null);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al cargar las ventas';
      setError(errorMsg);
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Filtrar y ordenar ventas
  const ventasFiltradas = ventas.filter((venta) => {
    const searchLower = searchTerm.toLowerCase();
    const matchSearch = !searchTerm ||
      venta.ticket?.toLowerCase().includes(searchLower) ||
      venta.nombre_cliente?.toLowerCase().includes(searchLower) ||
      venta.ruc_cliente?.toLowerCase().includes(searchLower) ||
      venta.matricula?.toLowerCase().includes(searchLower) ||
      venta.nombre_chofer?.toLowerCase().includes(searchLower);

    // Filtro de fechas
    const ventaFecha = venta.fecha ? new Date(venta.fecha) : null;
    const matchFechaDesde = !fechaDesde || !ventaFecha || ventaFecha >= new Date(fechaDesde + ' 00:00:00');
    const matchFechaHasta = !fechaHasta || !ventaFecha || ventaFecha <= new Date(fechaHasta + ' 23:59:59');

    return matchSearch && matchFechaDesde && matchFechaHasta;
  }).sort((a, b) => {
    let comparison = 0;

    switch (ordenarPor) {
      case 'fecha':
        comparison = new Date(a.fecha || 0).getTime() - new Date(b.fecha || 0).getTime();
        break;
      case 'total':
        comparison = (parseFloat(a.total || '0')) - (parseFloat(b.total || '0'));
        break;
      case 'ticket':
        comparison = (a.ticket || '').localeCompare(b.ticket || '');
        break;
      case 'cliente':
        comparison = (a.nombre_cliente || '').localeCompare(b.nombre_cliente || '');
        break;
      default:
        comparison = 0;
    }

    return ordenDireccion === 'asc' ? comparison : -comparison;
  });

  // Calcular métricas DINÁMICAS basadas en ventasFiltradas
  const totalVentas = ventasFiltradas.length;
  const totalMonto = ventasFiltradas.reduce((sum, venta) => {
    return sum + (venta.total ? parseFloat(venta.total) : 0);
  }, 0);

  // Card 2: Estación más utilizada (por cantidad de ventas)
  let estacionMasUtilizada = 'N/A';
  let estacionCantidad = 0;
  {
    const acumulado = new Map<string, number>();
    for (const venta of ventasFiltradas) {
      const key = venta.nombre_estacion || venta.codigo_estacion || 'Desconocida';
      acumulado.set(key, (acumulado.get(key) || 0) + 1);
    }
    Array.from(acumulado.entries()).forEach(([k, v]) => {
      if (v > estacionCantidad) {
        estacionCantidad = v;
        estacionMasUtilizada = k;
      }
    });
  }

  // Card 3: Chapa (matrícula) con más cargas
  let chapaConMasCargas = 'N/A';
  let chapaCantidad = 0;
  {
    const acumulado = new Map<string, number>();
    for (const venta of ventasFiltradas) {
      const key = venta.matricula || 'Sin matrícula';
      acumulado.set(key, (acumulado.get(key) || 0) + 1);
    }
    Array.from(acumulado.entries()).forEach(([k, v]) => {
      if (v > chapaCantidad) {
        chapaCantidad = v;
        chapaConMasCargas = k;
      }
    });
  }

  // Paginación
  const totalPaginas = Math.ceil(ventasFiltradas.length / itemsPorPagina);
  const ventasPaginadas = ventasFiltradas.slice(
    (paginaActual - 1) * itemsPorPagina,
    paginaActual * itemsPorPagina
  );

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
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
      return dateString;
    }
  };

  const formatCurrency = (value: string | null) => {
    if (!value) return 'Gs. 0';
    try {
      const num = parseFloat(value);
      return num.toLocaleString('es-PY', { style: 'currency', currency: 'PYG', minimumFractionDigits: 0, maximumFractionDigits: 0 });
    } catch {
      return 'Gs. 0';
    }
  };

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
            <p className="mt-4 text-lg text-gray-600">Cargando ventas...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar
          userRole={user?.role ?? 'user'}
          currentPath={location.pathname}
        />

        <div className="flex-1 flex flex-col">
          <Header title="Ventas" subtitle="Visualización de ventas registradas" />

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

          <main className="flex-1 p-6">
            <div className="flex flex-col gap-6">
              {/* Tarjetas de métricas */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border border-gray-200">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Total Ventas</CardTitle>
                    <ShoppingCart className="h-4 w-4 text-gray-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">
                      {totalVentas}
                    </div>
                    <p className="text-xs text-gray-500">Registros totales</p>
                  </CardContent>
                </Card>

                <Card className="border border-gray-200">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Monto Total</CardTitle>
                    <DollarSign className="h-4 w-4 text-gray-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">
                      {formatCurrency(totalMonto.toString())}
                    </div>
                    <p className="text-xs text-gray-500">Suma de todas las ventas</p>
                  </CardContent>
                </Card>

                <Card className="border border-gray-200">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Estación más utilizada</CardTitle>
                    <MapPin className="h-4 w-4 text-gray-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">
                      {estacionMasUtilizada}
                    </div>
                    <p className="text-xs text-gray-500">{estacionCantidad.toLocaleString('es-PY')} cargas</p>
                  </CardContent>
                </Card>

                <Card className="border border-gray-200">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Chapa con más cargas</CardTitle>
                    <Car className="h-4 w-4 text-gray-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">
                      {chapaConMasCargas}
                    </div>
                    <p className="text-xs text-gray-500">{chapaCantidad.toLocaleString('es-PY')} cargas</p>
                  </CardContent>
                </Card>
              </div>

              {/* Filtros y tabla */}
              <Card className="border border-gray-200">
                <div className="p-4 m-4">
                  <div className="flex flex-wrap items-end gap-4">
                    <div className="flex flex-col">
                      <Label className="text-sm font-medium text-gray-700 mb-1">Buscar</Label>
                      <Input
                        placeholder="Ticket, cliente, matrícula, chofer..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        variant="minimal"
                        fieldSize="sm"
                        className="w-[300px]"
                      />
                    </div>

                    {/* Combobox de Empresas (solo para admin) */}
                    {user?.role !== 'user' && (
                      <div className="flex flex-col">
                        <Label className="text-sm font-medium text-gray-700 mb-1">Empresa</Label>
                        <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="minimal"
                              role="combobox"
                              aria-expanded={openCombobox}
                              className="w-[240px] justify-between h-9"
                            >
                              {empresaId === 0
                                ? "Todas las empresas"
                                : empresas.find((empresa) => empresa.id === empresaId)?.nombre_comercial || "Seleccionar empresa..."
                              }
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[300px] p-0">
                            <Command>
                              <CommandInput placeholder="Buscar empresa..." />
                              <CommandList>
                                <CommandEmpty>No se encontraron empresas.</CommandEmpty>
                                <CommandGroup>
                                  <CommandItem
                                    value="todas"
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

                    {/* Fecha Desde */}
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

                    {/* Fecha Hasta */}
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
                          <SelectItem value="total">Monto</SelectItem>
                          <SelectItem value="ticket">Ticket</SelectItem>
                          <SelectItem value="cliente">Cliente</SelectItem>
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
                          <th className="text-center px-3 py-1 text-gray-700 font-medium">ID</th>
                          <th className="text-center px-3 py-1 text-gray-700 font-medium">Ticket</th>
                          <th className="text-center px-3 py-1 text-gray-700 font-medium">Fecha</th>

                          <th className="text-center px-3 py-1 text-gray-700 font-medium">Empresa</th>
                          <th className="text-center px-3 py-1 text-gray-700 font-medium">Chofer</th>

                          <th className="text-center px-3 py-1 text-gray-700 font-medium">Matrícula</th>
                          <th className="text-center px-3 py-1 text-gray-700 font-medium">Kilometraje</th>
                          <th className="text-center px-3 py-1 text-gray-700 font-medium">Estación</th>
                          <th className="text-center px-3 py-1 text-gray-700 font-medium">Total</th>
                          <th className="text-center px-3 py-1 text-gray-700 font-medium">Items</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ventasPaginadas.map((venta) => (
                          <tr key={venta.id} className="">

                            <td className="px-3 py-2 text-center text-gray-700">
                              <span className="font-medium ">{venta.identificador_tr || 'N/A'}</span>
                            </td>

                            <td className="px-3 py-2 text-center text-gray-700">
                              <span className="font-medium ">{venta.ticket || 'N/A'}</span>
                            </td>

                            {/* <td className="px-3 py-1 text-center text-gray-700">
                              {venta.ticket || '-'}
                            </td> */}
                            <td className="px-3 py-1 text-center text-gray-700">
                              {formatDate(venta.fecha)}
                            </td>

                            <td className="px-3 py-1 text-left text-gray-700">
                              <div className="flex flex-col">
                                <span className="font-medium">{venta.nombre_cliente || 'N/A'}</span>
                                <span className="text-xs text-gray-500">RUC: {venta.ruc_cliente || ''}</span>
                              </div>
                            </td>

                            <td className="px-3 py-1 text-left text-gray-700">
                              <div className="flex flex-col">
                                <span className="font-medium">{venta.nombre_chofer || 'N/A'}</span>
                                <span className="text-xs text-gray-500">CI: {venta.documento_chofer || ''}</span>
                              </div>
                            </td>


                            <td className="px-3 py-1 text-center text-gray-700">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-600">
                                {venta.matricula || 'N/A'}
                              </span>
                            </td>

                            <td className="px-3 py-2 text-center text-gray-700">
                              <span className="font-medium">
                                {venta.kilometraje ? venta.kilometraje.toLocaleString('es-PY', { maximumFractionDigits: 0 }) : '0'} km.
                              </span>
                            </td>

                            <td className="px-3 py-1 text-left text-gray-700">
                              <div className="flex flex-col">
                                <span className="font-medium">{venta.nombre_estacion || 'N/A'}</span>
                                <span className="text-xs text-gray-500">COD: {venta.codigo_estacion || ''}</span>
                              </div>
                            </td>




                            <td className="px-3 py-1 text-center text-gray-700 font-semibold">
                              {formatCurrency(venta.total)}
                            </td>
                            <td className="px-3 py-1 text-center">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-600">
                                {venta.lineas.length}
                              </span>
                            </td>

                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {ventasFiltradas.length === 0 && (
                    <div className="text-center py-12">
                      <ShoppingCart className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {searchTerm ? 'No se encontraron ventas' : 'No hay ventas registradas'}
                      </h3>
                      <p className="text-gray-500 mb-4">
                        {searchTerm
                          ? 'No hay ventas que coincidan con tu búsqueda.'
                          : 'Las ventas registradas aparecerán aquí.'
                        }
                      </p>
                    </div>
                  )}
                </CardContent>

                <div className="flex justify-between items-center px-6 py-4 border-t border-gray-200 mb-4">
                  <Button
                    variant="minimal"
                    size="sm"
                    className="px-3 text-gray-700"
                    disabled={paginaActual === 1}
                    onClick={() => setPaginaActual(paginaActual - 1)}
                  >
                    Anterior
                  </Button>

                  <span className="text-sm text-gray-500">
                    Página {paginaActual} de {totalPaginas} - {ventasFiltradas.length} registros
                  </span>

                  <Button
                    variant="minimal"
                    size="sm"
                    className="px-3 text-gray-700"
                    disabled={paginaActual === totalPaginas}
                    onClick={() => setPaginaActual(paginaActual + 1)}
                  >
                    Siguiente
                  </Button>
                </div>
              </Card>
            </div>
          </main>
        </div>
      </div>
      <Toaster />
    </>
  );
};

export default Ventas;
