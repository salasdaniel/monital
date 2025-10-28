import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../components/ui/select";
import { useToast } from "../components/ui/use-toast";
import { Toaster } from "../components/ui/toaster";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";
import Sidebar from '../components/ui/sidebar';
import Header from '../components/ui/header';
import { Plus, Building2, AlertCircle, X, Edit2, Power, Home, Users, Coins, ChartColumnIncreasing, Car, SlidersHorizontal } from "lucide-react";
import { getUser } from "../utils/auth";
import { API_URLS, APP_KEY } from '../api/config';

// Interfaces basadas en la API
interface Empresa {
  id: number;
  razon_social: string;
  nombre_comercial: string;
  ruc: string;
  direccion: string;
  correo_referencia?: string;
  numero_referencia?: string;
  activo: boolean;
  created_at: string;
  updated_at: string;
  usuario_creacion?: string;
}

interface EmpresaFormData {
  razon_social: string;
  nombre_comercial: string;
  ruc: string;
  direccion: string;
  correo_referencia: string;
  numero_referencia: string;
  activo: boolean;
}

interface ApiResponse {
  message: string;
  count: number;
  empresas: Empresa[];
}

interface UserData {
  username: string;
  role?: string;
}

const Empresas: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [user, setUser] = useState<UserData | null>(null);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingEmpresa, setEditingEmpresa] = useState<Empresa | null>(null);
  const [formLoading, setFormLoading] = useState(false);

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

  // Estados para filtros y paginación
  const [estadoFiltro, setEstadoFiltro] = useState<string>('todos');
  const [ordenarPor, setOrdenarPor] = useState<string>('fecha');
  const [ordenDireccion, setOrdenDireccion] = useState<'asc' | 'desc'>('desc');
  const [itemsPorPagina, setItemsPorPagina] = useState<number>(10);
  const [paginaActual, setPaginaActual] = useState<number>(1);

  // Estados para el AlertDialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [empresaToDelete, setEmpresaToDelete] = useState<{ id: number; activo: boolean } | null>(null);

  const [formData, setFormData] = useState<EmpresaFormData>({
    razon_social: '',
    nombre_comercial: '',
    ruc: '',
    direccion: '',
    correo_referencia: '',
    numero_referencia: '',
    activo: true,
  });

  useEffect(() => {
    // Obtener datos del usuario desde localStorage
    const user = getUser();
    setUser(user);

  }, []);

  useEffect(() => {
    fetchEmpresas();
  }, []);

  // Resetear a página 1 cuando cambian los filtros
  useEffect(() => {
    setPaginaActual(1);
  }, [searchTerm, estadoFiltro, ordenarPor, ordenDireccion, itemsPorPagina]);


  const fetchEmpresas = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      const response = await fetch(API_URLS.EMPRESAS, {
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
      setEmpresas(data.empresas || []);
      setError(null);
      // console.log(data)
    } catch (err) {
      // console.error('Error al obtener empresas:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar las empresas');
    } finally {
      setLoading(false);
    }
  };


  // Función para crear una nueva empresa
  const createEmpresa = async () => {

    try {
      setFormLoading(true);
      const token = localStorage.getItem('access_token');

      // Filtrar campos vacíos opcionales
      const payload = {
        razon_social: formData.razon_social,
        nombre_comercial: formData.nombre_comercial,
        ruc: formData.ruc,
        direccion: formData.direccion,
        activo: formData.activo,
        ...(formData.correo_referencia && { correo_referencia: formData.correo_referencia }),
        ...(formData.numero_referencia && { numero_referencia: formData.numero_referencia }),
      };

      const response = await fetch(API_URLS.ADD_EMPRESAS, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'X-App-Key': APP_KEY
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Error ${response.status}: ${errorData}`);
      }

      // const result = await response.json();
      // console.log('Empresa creada:', result);

      // Actualizar la lista de empresas
      await fetchEmpresas();

      // Mostrar toast de éxito
      toast({
        title: "¡Empresa creada exitosamente!",
        description: `${formData.razon_social} ha sido agregada al sistema.`,
        variant: "success",
      });

      // Limpiar formulario y cerrar modal
      resetForm();
      setIsCreateModalOpen(false);
      setError(null);
    } catch (err) {
      // console.error('Error al crear empresa:', err);
      setError(err instanceof Error ? err.message : 'Error al crear la empresa');
    } finally {
      setFormLoading(false);
    }
  };

  const updateEmpresa = async (id:number) => {
    try {

      setFormLoading(true);
      const token = localStorage.getItem('access_token');
      const payload = {
        razon_social: formData.razon_social,
        nombre_comercial: formData.nombre_comercial,
        ruc: formData.ruc,
        direccion: formData.direccion,
        activo: formData.activo,
        ...(formData.correo_referencia && { correo_referencia: formData.correo_referencia }),
        ...(formData.numero_referencia && { numero_referencia: formData.numero_referencia }),
      };

      const response = await fetch(API_URLS.UPDATE_EMPRESAS(id), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'X-App-Key': APP_KEY
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Error ${response.status}: ${errorData}`);
      }

      // const result = await response.json();
      // console.log('Empresa actualizada:', result);

      // Actualizar la lista de empresas
      await fetchEmpresas();

      // Mostrar toast de éxito
      toast({
        title: "¡Empresa actualizada exitosamente!",
        description: `${formData.razon_social} ha sido actualizada`,
        variant: "success",
      });

      // Limpiar formulario y cerrar modal
      resetForm();
      setIsCreateModalOpen(false);
      setError(null);
    } catch (err) {
      // console.error('Error al crear empresa:', err);
      setError(err instanceof Error ? err.message : 'Error al crear la empresa');
    } 
  };
  
  // Función para abrir el dialog de confirmación
  const openDeleteDialog = (id: number, activo: boolean) => {
    setEmpresaToDelete({ id, activo });
    setDeleteDialogOpen(true);
  };

  //funcion para inactivar una empresa (ejecuta después de confirmar)
  const handleDelete = async (id: number, activo: boolean) => {
    try {

      const token = localStorage.getItem('access_token');
      const response = await fetch(API_URLS.DEACTIVATE_EMPRESAS(id), {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'X-App-Key': APP_KEY
        },
        body: JSON.stringify({ activo })
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Error ${response.status}: ${errorData}`);
      }

      // const result = await response.json();
      // console.log('Estado de empresa cambiado:', result);

      toast({
        title: activo ? "¡Empresa inactivada exitosamente!" : "¡Empresa activada exitosamente!",
        variant: "success",
      });

      setError(null);
      await fetchEmpresas();

    } catch (err) {

      // console.error('Error al cambiar estado de empresa:', err);
      setError(err instanceof Error ? err.message : 'Error al cambiar el estado de la empresa');

    } finally {
      setDeleteDialogOpen(false);
      setEmpresaToDelete(null);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingEmpresa) {
      await updateEmpresa(editingEmpresa.id)
      // console.log('Actualizando empresa:', editingEmpresa.id);
    } else {
      await createEmpresa();
    }
  };

  

  const resetForm = () => {
    setFormData({
      razon_social: '',
      nombre_comercial: '',
      ruc: '',
      direccion: '',
      correo_referencia: '',
      numero_referencia: '',
      activo: true,
    });
    setEditingEmpresa(null);
    setError(null);
  };

  // Función para manejar la edición
  const handleEdit = (empresa: Empresa) => {
    setEditingEmpresa(empresa);
    setFormData({
      razon_social: empresa.razon_social,
      nombre_comercial: empresa.nombre_comercial,
      ruc: empresa.ruc,
      direccion: empresa.direccion,
      correo_referencia: empresa.correo_referencia || '',
      numero_referencia: empresa.numero_referencia || '',
      activo: empresa.activo,
    });
    setIsCreateModalOpen(true);
  };

  // Lógica de filtrado, ordenamiento y paginación
  const filteredEmpresas = empresas
    .filter(empresa => {
      // Filtro por búsqueda
      const matchesSearch =
        empresa.razon_social.toLowerCase().includes(searchTerm.toLowerCase()) ||
        empresa.nombre_comercial.toLowerCase().includes(searchTerm.toLowerCase()) ||
        empresa.ruc.includes(searchTerm);

      // Filtro por estado
      const matchesEstado =
        estadoFiltro === 'todos' ? true :
          estadoFiltro === 'activo' ? empresa.activo :
            !empresa.activo;

      return matchesSearch && matchesEstado;
    })
    .sort((a, b) => {
      // Ordenamiento
      let comparison = 0;

      switch (ordenarPor) {
        case 'fecha':
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
        case 'nombre':
          comparison = a.razon_social.localeCompare(b.razon_social);
          break;
        case 'ruc':
          comparison = a.ruc.localeCompare(b.ruc);
          break;
        default:
          comparison = 0;
      }

      return ordenDireccion === 'asc' ? comparison : -comparison;
    });

  // Paginación
  const totalPaginas = Math.ceil(filteredEmpresas.length / itemsPorPagina);
  const empresasPaginadas = filteredEmpresas.slice(
    (paginaActual - 1) * itemsPorPagina,
    paginaActual * itemsPorPagina
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="hidden md:block">
          <Sidebar
            userRole={user?.role ?? 'user'}
            currentPath={location.pathname}
          />
        </div>
        <div className="flex items-center justify-center min-h-screen md:ml-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-lg text-gray-600">Cargando empresas...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <div className="hidden md:block">
          <Sidebar
            userRole={user?.role ?? 'user'}
            currentPath={location.pathname}
          />
        </div>

        <div className="flex-1 flex flex-col pb-16 md:pb-0 md:ml-64">
          <Header title="Empresas" subtitle="Gestión de empresas del sistema" />
          {/* Error general */}

          {error && !isCreateModalOpen && (
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
          <main className="flex-1 p-6 pt-[76px] md:pt-[92px]">
            <div className="flex flex-col gap-6">
              {/* Tarjetas de métricas - Exactamente como en la imagen */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border border-gray-200">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Total Empresas</CardTitle>
                    <Building2 className="h-4 w-4 text-gray-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {empresas.length}
                    </div>
                    <p className="text-xs text-gray-500">Total registradas</p>
                  </CardContent>
                </Card>

                <Card className="border border-gray-200">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Empresas Activas</CardTitle>
                    <Building2 className="h-4 w-4 text-gray-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-500">
                      {empresas.filter(e => e.activo).length}
                    </div>
                    <p className="text-xs text-gray-500">Empresas activas</p>
                  </CardContent>
                </Card>

                <Card className="border border-gray-200">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Empresas Inactivas</CardTitle>
                    <Building2 className="h-4 w-4 text-gray-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-purple-600">
                      {empresas.filter(e => !e.activo).length}
                    </div>
                    <p className="text-xs text-gray-500">Empresas inactivas</p>
                  </CardContent>
                </Card>

                <Card className="border border-gray-200">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Nuevas este Mes</CardTitle>
                    <Building2 className="h-4 w-4 text-gray-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-orange-500">
                      {empresas.filter(e => {
                        const createdDate = new Date(e.created_at);
                        const currentDate = new Date();
                        return createdDate.getMonth() === currentDate.getMonth() &&
                          createdDate.getFullYear() === currentDate.getFullYear();
                      }).length}
                    </div>
                    <p className="text-xs text-gray-500">Empresas nuevas</p>
                  </CardContent>
                </Card>
              </div>

              {/* Filtros y tabla - Exactamente como en la imagen */}
              <Card className="border border-gray-200 ">


                {/* Filtros en fila horizontal */}
                <div className="p-4  m-4">
                  <div className="flex flex-wrap items-end gap-4">
                    <div className="flex flex-col">
                      <Label className="text-sm font-medium text-gray-700 mb-1">Buscar</Label>
                      <Input
                        placeholder="Razón social, RUC..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        variant="minimal"
                        fieldSize="sm"
                        className="w-[200px]"
                      />
                    </div>
                    <div className="flex flex-col">
                      <Label className="text-sm font-medium text-gray-700 mb-1">Estado</Label>
                      <Select value={estadoFiltro} onValueChange={setEstadoFiltro}>
                        <SelectTrigger variant="minimal" size="sm" className="w-[120px]">
                          <SelectValue placeholder="Estado" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todos">Todos</SelectItem>
                          <SelectItem value="activo">Activo</SelectItem>
                          <SelectItem value="inactivo">Inactivo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex flex-col">
                      <Label className="text-sm font-medium text-gray-700 mb-1">Ordenar por</Label>
                      <Select value={ordenarPor} onValueChange={setOrdenarPor}>
                        <SelectTrigger variant="minimal" size="sm" className="w-[150px]">
                          <SelectValue placeholder="Ordenar por" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fecha">Fecha Creación</SelectItem>
                          <SelectItem value="nombre">Nombre</SelectItem>
                          <SelectItem value="ruc">RUC</SelectItem>
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

                    <Button
                      onClick={() => setIsCreateModalOpen(true)}
                      variant="minimal"
                      size="sm"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Nueva Empresa
                    </Button>
                  </div>
                </div>



                <CardContent className="p-0">
                  <div className="overflow-x-auto mx-4">
                    <table className="w-full text-sm ">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-center px-3 py-1 text-gray-700 font-medium">ID</th>
                          <th className="text-center px-3 py-1 text-gray-700 font-medium">Razon Social</th>
                          {/* <th className="text-center px-3 py-1 text-gray-700 font-medium">Nombre comercial</th> */}
                          <th className="text-center px-3 py-1 text-gray-700 font-medium">Ruc</th>
                          <th className="text-center px-3 py-1 text-gray-700 font-medium">Direccion</th>
                          <th className="text-center px-3 py-1 text-gray-700 font-medium">Usuario Creacion</th>
                          <th className="text-center px-3 py-1 text-gray-700 font-medium">Fecha Creacion </th>
                          <th className="text-center px-3 py-1 text-gray-700 font-medium">Activo</th>
                          <th className="text-center px-3 py-1 text-gray-700 font-medium">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {empresasPaginadas.map((empresa) => (
                          <tr key={empresa.id} className="">
                            <td className="px-3 py-1 text-center text-gray-700">
                              {empresa.id}
                            </td>
                            <td className="px-3 py-1 text-center text-gray-700">
                              {empresa.razon_social}
                            </td>
                            {/* <td className="px-3 py-1 text-center text-gray-700">
                      {empresa.nombre_comercial}
                    </td> */}
                            <td className="px-3 py-1 text-center text-gray-700">
                              {empresa.ruc}
                            </td>
                            <td className="px-3 py-1 text-center text-gray-700">
                              {empresa.direccion}
                            </td>
                            <td className="px-3 py-1 text-center text-gray-700">
                              {empresa.usuario_creacion}
                            </td>
                            <td className="px-3 py-1 text-center text-gray-700">
                              {new Date(empresa.created_at).toLocaleDateString('es-ES')}
                            </td>
                            <td className="px-3 py-1 text-center">
                              <div className="flex items-center justify-center">
                                <div className={`w-3 h-3 rounded-full ${empresa.activo ? 'bg-green-500' : 'bg-red-500'}`} 
                                     title={empresa.activo ? 'Activo' : 'Inactivo'}>
                                </div>
                              </div>
                            </td>
                            <td className="px-3 py-1 text-center">
                     
                                <div className="flex items-center justify-center gap-2">
                                  <Button
                                    variant="minimal"
                                    size="xs"
                                    onClick={() => handleEdit(empresa)}
                                    disabled={!empresa.activo}
                                    className="h-7 w-7 p-0"
                                  >
                                    <Edit2 className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="minimal"
                                    size="xs"
                                    onClick={() => openDeleteDialog(empresa.id, empresa.activo)}
                                    className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <Power className="h-3 w-3" />
                                  </Button>
                                </div>
                              
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                  </div>

                  {filteredEmpresas.length === 0 && !loading && (
                    <div className="text-center py-12">
                      <Building2 className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {searchTerm ? 'No se encontraron empresas' : 'No hay empresas registradas'}
                      </h3>
                      <p className="text-gray-500 mb-4">
                        {searchTerm
                          ? 'No hay empresas que coincidan con tu búsqueda.'
                          : 'Comienza agregando tu primera empresa al sistema.'
                        }
                      </p>
                      {!searchTerm && (
                        <Button onClick={() => setIsCreateModalOpen(true)}>
                          <Plus className="w-4 h-4 mr-2" />
                          Agregar Primera Empresa
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>

                {/* Paginación */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 px-4 sm:px-6 py-4 border-t border-gray-200 mb-4">
                  <Button
                    variant="minimal"
                    size="sm"
                    className="px-3 text-gray-700 min-w-[80px]"
                    disabled={paginaActual === 1}
                    onClick={() => setPaginaActual(paginaActual - 1)}
                  >
                    Anterior
                  </Button>

                  <span className="text-xs sm:text-sm text-gray-500 text-center">
                    Página {paginaActual} de {totalPaginas} - {filteredEmpresas.length} registros
                  </span>

                  <Button
                    variant="minimal"
                    size="sm"
                    className="px-3 text-gray-700 min-w-[80px]"
                    disabled={paginaActual === totalPaginas}
                    onClick={() => setPaginaActual(paginaActual + 1)}
                  >
                    Siguiente
                  </Button>
                </div>
              </Card>

              {/* Modal para crear/editar empresa */}
              {isCreateModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-bold">
                        {editingEmpresa ? 'Editar Empresa' : 'Nueva Empresa'}
                      </h2>
                      <Button
                        variant="minimal"
                        size="sm"
                        onClick={() => {
                          setIsCreateModalOpen(false);
                          resetForm();
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>

                    <p className="text-gray-600 mb-6">
                      {editingEmpresa
                        ? 'Modifica los datos de la empresa seleccionada.'
                        : 'Completa la información para registrar una nueva empresa.'
                      }
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="razon_social">Razón Social *</Label>
                          <Input
                            variant="minimal"
                            fieldSize="sm"
                            id="razon_social"
                            value={formData.razon_social}
                            onChange={(e) => setFormData({ ...formData, razon_social: e.target.value })}
                            placeholder="Ej: Empresa Ejemplo S.A."
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="nombre_comercial">Nombre Comercial *</Label>
                          <Input
                            variant="minimal"
                            fieldSize="sm"
                            id="nombre_comercial"
                            value={formData.nombre_comercial}
                            onChange={(e) => setFormData({ ...formData, nombre_comercial: e.target.value })}
                            placeholder="Ej: Ejemplo Corp"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="ruc">RUC *</Label>
                          <Input
                            variant="minimal"
                            fieldSize="sm"
                            id="ruc"
                            value={formData.ruc}
                            onChange={(e) => setFormData({ ...formData, ruc: e.target.value })}
                            placeholder="Ej: 80123456-7"
                            required
                          />
                        </div>

                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="direccion">Dirección *</Label>
                        <textarea
                          id="direccion"
                          value={formData.direccion}
                          onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                          placeholder="Ej: Avenida Aviadores del Chaco 2917, Asunción"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          rows={3}
                          required
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="correo_referencia">Correo de Referencia</Label>
                          <Input
                            variant="minimal"
                            fieldSize="sm"
                            id="correo_referencia"
                            type="email"
                            value={formData.correo_referencia}
                            onChange={(e) => setFormData({ ...formData, correo_referencia: e.target.value })}
                            placeholder="Ej: email@empresa.com"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="numero_referencia">Número de Referencia</Label>
                          <Input
                            variant="minimal"
                            fieldSize="sm"
                            id="numero_referencia"
                            value={formData.numero_referencia}
                            onChange={(e) => setFormData({ ...formData, numero_referencia: e.target.value })}
                            placeholder="Ej: (021) 123-4567"
                          />
                        </div>
                      </div>

                      {error && (
                        <div className="bg-red-50 border border-red-200 rounded-md p-3">
                          <div className="flex">
                            <AlertCircle className="h-5 w-5 text-red-400" />
                            <div className="ml-3">
                              <p className="text-sm text-red-700">{error}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex justify-end space-x-4 pt-4">
                        <Button
                          type="button"
                          variant="minimal"
                          size="sm"
                          onClick={() => {
                            setIsCreateModalOpen(false);
                            resetForm();
                          }}
                        >
                          Cancelar
                        </Button>
                        <Button type="submit" variant="minimal" size="sm" disabled={formLoading}>
                          {formLoading ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Guardando...
                            </>
                          ) : (
                            <>{editingEmpresa ? 'Actualizar' : 'Crear'} Empresa</>
                          )}
                        </Button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
      <Toaster />
      
      {/* AlertDialog para confirmar activación/inactivación */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {empresaToDelete?.activo ? 'Inactivar Empresa' : 'Activar Empresa'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {empresaToDelete?.activo 
                ? '¿Está seguro de inactivar esta empresa? La empresa no aparecerá en los listados activos.'
                : '¿Está seguro de activar esta empresa? La empresa volverá a estar disponible en el sistema.'
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setDeleteDialogOpen(false);
              setEmpresaToDelete(null);
            }}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (empresaToDelete) {
                  handleDelete(empresaToDelete.id, empresaToDelete.activo);
                }
              }}
              className={empresaToDelete?.activo ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}
            >
              {empresaToDelete?.activo ? 'Inactivar' : 'Activar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
    </>
  );
};

export default Empresas;
