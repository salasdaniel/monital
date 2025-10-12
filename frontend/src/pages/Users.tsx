import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
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
import { Plus, Users as UsersIcon, AlertCircle, X, Edit2, Power, RefreshCw, Eye, EyeOff } from "lucide-react";
import { getUser } from "../utils/auth";
import { API_URLS, APP_KEY } from '../api/config';

//combo box
import { Check, ChevronsUpDown } from "lucide-react"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover"

// Interfaces basadas en la API de usuarios
interface Usuario {
  id: string;
  email: string;
  name: string;
  last_name: string;
  ruc: string;
  username: string;
  role: string;
  empresa_id?: number;
  empresa_nombre?: string;
  activo: boolean;
  created_at: string;
}

interface UsuarioFormData {
  email: string;
  name: string;
  last_name: string;
  ruc: string;
  username: string;
  password: string;
  role: string;
  empresa_id: string;
}

interface ApiResponse {
  message: string;
  count: number;
  usuarios: Usuario[];
}

interface Empresa {
  id: number;
  razon_social: string;
  nombre_comercial: string;
  ruc: string;
  activo: boolean;
}

interface EmpresasApiResponse {
  message: string;
  count: number;
  empresas: Empresa[];
}

interface UserData {
  username: string;
  role?: string;
}

const Users: React.FC = () => {
  const location = useLocation();
  const { toast } = useToast();
  const [user, setUser] = useState<UserData | null>(null);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingUsuario, setEditingUsuario] = useState<Usuario | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // Estados para filtros y paginación
  const [estadoFiltro, setEstadoFiltro] = useState<string>('todos');
  const [ordenarPor, setOrdenarPor] = useState<string>('fecha');
  const [ordenDireccion, setOrdenDireccion] = useState<'asc' | 'desc'>('desc');
  const [itemsPorPagina, setItemsPorPagina] = useState<number>(10);
  const [paginaActual, setPaginaActual] = useState<number>(1);

  // Estados para el AlertDialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [usuarioToDelete, setUsuarioToDelete] = useState<{ id: string; activo: boolean } | null>(null);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [openEmpresaCombobox, setOpenEmpresaCombobox] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState<UsuarioFormData>({
    email: '',
    name: '',
    last_name: '',
    ruc: '',
    username: '',
    password: '',
    role: 'user',
    empresa_id: '',
  });

  useEffect(() => {
    // Obtener datos del usuario desde localStorage
    const user = getUser();
    setUser(user);

  }, []);

  useEffect(() => {
    fetchUsuarios();
  }, []);

  useEffect(() => {
    fetchEmpresas();
  }, []);

  // Resetear a página 1 cuando cambian los filtros
  useEffect(() => {
    setPaginaActual(1);
  }, [searchTerm, estadoFiltro, ordenarPor, ordenDireccion, itemsPorPagina]);

  // Asignar automáticamente empresa ID 1 cuando el rol es admin
  useEffect(() => {
    if (formData.role === 'admin') {
      setFormData(prev => ({ ...prev, empresa_id: '1' }));
    }
  }, [formData.role]);

  // Función para generar contraseña aleatoria
  const generatePassword = (length: number = 8): string => {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*';
    let password = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      password += charset[randomIndex];
    }
    return password;
  };


  const fetchUsuarios = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      const response = await fetch(API_URLS.USERS, {
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
      setUsuarios(data.usuarios || []);
      setError(null);
      // console.log(data)
    } catch (err) {
      // console.error('Error al obtener usuarios:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar los usuarios');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmpresas = async () => {
    try {
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
        throw new Error(`Error ${response.status}`);
      }

      const data: EmpresasApiResponse = await response.json();
      // Filtrar solo empresas activas
      const empresasActivas = data.empresas?.filter(e => e.activo) || [];
      setEmpresas(empresasActivas);
    } catch (err) {
      console.error('Error al obtener empresas:', err);
      // No mostramos toast de error porque no es crítico
    }
  };


  // Función para crear un nuevo usuario
  const createUsuario = async () => {
    // Validar longitud de contraseña
    if (formData.password.length < 6) {
      toast({
        title: "Error de validación",
        description: "La contraseña debe tener al menos 6 caracteres",
        variant: "destructive",
      });
      return;
    }

    try {
      setFormLoading(true);
      const token = localStorage.getItem('access_token');

      // Construir el payload con los campos requeridos
      const payload = {
        email: formData.email,
        name: formData.name,
        last_name: formData.last_name,
        ruc: formData.ruc,
        username: formData.username,
        password: formData.password,
        role: formData.role,
        empresa_id: formData.empresa_id ? parseInt(formData.empresa_id) : null,
      };

      const response = await fetch(API_URLS.ADD_USERS, {
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
      // console.log('Usuario creado:', result);

      // Actualizar la lista de usuarios
      await fetchUsuarios();

      // Mostrar toast de éxito
      toast({
        title: "¡Usuario creado exitosamente!",
        description: `${formData.name} ${formData.last_name} ha sido agregado al sistema.`,
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

  const updateUsuario = async (id: string) => {
    // Validar longitud de contraseña si se está cambiando
    if (formData.password && formData.password.length < 6) {
      toast({
        title: "Error de validación",
        description: "La contraseña debe tener al menos 6 caracteres",
        variant: "destructive",
      });
      return;
    }

    try {

      setFormLoading(true);
      const token = localStorage.getItem('access_token');

      // Construir el payload - password es opcional en update
      const payload: any = {
        email: formData.email,
        name: formData.name,
        last_name: formData.last_name,
        ruc: formData.ruc,
        username: formData.username,
        role: formData.role,
        empresa_id: formData.empresa_id ? parseInt(formData.empresa_id) : null,
      };

      // Solo agregar password si se proporcionó uno nuevo
      if (formData.password) {
        payload.password = formData.password;
      }

      const response = await fetch(API_URLS.UPDATE_USERS(id), {
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

      console.log(response)

      // const result = await response.json();
      // console.log('Usuario actualizado:', result);

      // Actualizar la lista de usuarios
      await fetchUsuarios();

      // Mostrar toast de éxito
      toast({
        title: "¡Usuario actualizado exitosamente!",
        description: `${formData.name} ${formData.last_name} ha sido actualizado`,
        variant: "success",
      });

      // Limpiar formulario y cerrar modal
      resetForm();
      setIsCreateModalOpen(false);
      setError(null);
    } catch (err) {
      // console.error('Error al actualizar usuario:', err);
      setError(err instanceof Error ? err.message : 'Error al actualizar el usuario');
    }
  };

  // Función para abrir el dialog de confirmación
  const openDeleteDialog = (id: string, activo: boolean) => {
    setUsuarioToDelete({ id, activo });
    setDeleteDialogOpen(true);
  };

  //funcion para desactivar un usuario (ejecuta después de confirmar)
  const handleDelete = async (id: string, activo: boolean) => {
    try {

      const token = localStorage.getItem('access_token');
      const response = await fetch(API_URLS.DEACTIVATE_USERS(id), {
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
      // console.log('Estado de usuario cambiado:', result);

      toast({
        title: activo ? "¡Usuario desactivado exitosamente!" : "¡Usuario activado exitosamente!",
        variant: "success",
      });

      setError(null);
      await fetchUsuarios();

    } catch (err) {

      // console.error('Error al cambiar estado de usuario:', err);
      setError(err instanceof Error ? err.message : 'Error al cambiar el estado del usuario');

    } finally {
      setDeleteDialogOpen(false);
      setUsuarioToDelete(null);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUsuario) {
      await updateUsuario(editingUsuario.id)
      // console.log('Actualizando usuario:', editingUsuario.id);
    } else {
      await createUsuario();
    }
  };



  const resetForm = () => {
    setFormData({
      email: '',
      name: '',
      last_name: '',
      ruc: '',
      username: '',
      password: generatePassword(8), // Generar contraseña automática
      role: 'user',
      empresa_id: '',
    });
    setEditingUsuario(null);
    setError(null);
    setShowPassword(false); // Resetear visibilidad de contraseña
  };

  // Función para manejar la edición
  const handleEdit = (usuario: Usuario) => {
    setEditingUsuario(usuario);
    setFormData({
      email: usuario.email,
      name: usuario.name,
      last_name: usuario.last_name,
      ruc: usuario.ruc,
      username: usuario.username,
      password: '', // Dejar vacío para no cambiar la contraseña
      role: usuario.role,
      empresa_id: usuario.empresa_id?.toString() || '',
    });
    setIsCreateModalOpen(true);
  };

  // Lógica de filtrado, ordenamiento y paginación
  const filteredUsuarios = usuarios
    .filter(usuario => {
      // Filtro por búsqueda
      const matchesSearch =
        usuario.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        usuario.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        usuario.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        usuario.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        usuario.ruc.includes(searchTerm);

      // Filtro por estado
      const matchesEstado =
        estadoFiltro === 'todos' ? true :
          estadoFiltro === 'activo' ? usuario.activo :
            !usuario.activo;

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
          comparison = `${a.name} ${a.last_name}`.localeCompare(`${b.name} ${b.last_name}`);
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
  const totalPaginas = Math.ceil(filteredUsuarios.length / itemsPorPagina);
  const usuariosPaginados = filteredUsuarios.slice(
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
            <p className="mt-4 text-lg text-gray-600">Cargando empresas...</p>
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
          <main className="flex-1 p-6">
            <div className="flex flex-col gap-6">
              {/* Tarjetas de métricas - Exactamente como en la imagen */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border border-gray-200">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Total Usuarios</CardTitle>
                    <UsersIcon className="h-4 w-4 text-gray-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {usuarios.length}
                    </div>
                    <p className="text-xs text-gray-500">Total registrados</p>
                  </CardContent>
                </Card>

                <Card className="border border-gray-200">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Usuarios Activos</CardTitle>
                    <UsersIcon className="h-4 w-4 text-gray-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-500">
                      {usuarios.filter(u => u.activo).length}
                    </div>
                    <p className="text-xs text-gray-500">Usuarios activos</p>
                  </CardContent>
                </Card>

                <Card className="border border-gray-200">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Usuarios Inactivos</CardTitle>
                    <UsersIcon className="h-4 w-4 text-gray-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-purple-600">
                      {usuarios.filter(u => !u.activo).length}
                    </div>
                    <p className="text-xs text-gray-500">Usuarios inactivos</p>
                  </CardContent>
                </Card>

                <Card className="border border-gray-200">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Nuevos este Mes</CardTitle>
                    <UsersIcon className="h-4 w-4 text-gray-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-orange-500">
                      {usuarios.filter(u => {
                        const createdDate = new Date(u.created_at);
                        const currentDate = new Date();
                        return createdDate.getMonth() === currentDate.getMonth() &&
                          createdDate.getFullYear() === currentDate.getFullYear();
                      }).length}
                    </div>
                    <p className="text-xs text-gray-500">Usuarios nuevos</p>
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
                        placeholder="Nombre, usuario, email, RUC..."
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
                      Nuevo Usuario
                    </Button>
                  </div>
                </div>



                <CardContent className="p-0">
                  <div className="overflow-x-auto mx-4">
                    <table className="w-full text-sm ">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-center px-3 py-1 text-gray-700 font-medium">Nombre Completo</th>
                          <th className="text-center px-3 py-1 text-gray-700 font-medium">Usuario</th>
                          <th className="text-center px-3 py-1 text-gray-700 font-medium">Email</th>
                          <th className="text-center px-3 py-1 text-gray-700 font-medium">RUC</th>
                          <th className="text-center px-3 py-1 text-gray-700 font-medium">Rol</th>
                          <th className="text-center px-3 py-1 text-gray-700 font-medium">Empresa</th>
                          <th className="text-center px-3 py-1 text-gray-700 font-medium">Fecha</th>
                          <th className="text-center px-3 py-1 text-gray-700 font-medium">Activo</th>
                          <th className="text-center px-3 py-1 text-gray-700 font-medium">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {usuariosPaginados.map((usuario) => (
                          <tr key={usuario.id} className="">
                            <td className="px-3 py-1 text-center text-gray-700">
                              {usuario.name} {usuario.last_name}
                            </td>
                            <td className="px-3 py-1 text-center text-gray-700">
                              {usuario.username}
                            </td>
                            <td className="px-3 py-1 text-center text-gray-700">
                              {usuario.email}
                            </td>
                            <td className="px-3 py-1 text-center text-gray-700">
                              {usuario.ruc}
                            </td>
                            <td className="px-3 py-1 text-center text-gray-700">
                              <span className={`px-2 py-1 text-xs rounded ${usuario.role === 'admin' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                                {usuario.role === 'admin' ? 'Administrador' : 'Usuario'}
                              </span>
                            </td>
                            <td className="px-3 py-1 text-center text-gray-700">
                              {usuario.empresa_nombre || 'Sin empresa'}
                            </td>
                            <td className="px-3 py-1 text-center text-gray-700">
                              {new Date(usuario.created_at).toLocaleDateString('es-ES')}
                            </td>
                            <td className="px-3 py-1 text-center">
                              <div className="flex items-center justify-center">
                                <div className={`w-3 h-3 rounded-full ${usuario.activo ? 'bg-green-500' : 'bg-red-500'}`}
                                  title={usuario.activo ? 'Activo' : 'Inactivo'}>
                                </div>
                              </div>
                            </td>
                            <td className="px-3 py-1 text-center">

                              <div className="flex items-center justify-center gap-2">
                                <Button
                                  variant="minimal"
                                  size="xs"
                                  onClick={() => handleEdit(usuario)}
                                  disabled={!usuario.activo}
                                  className="h-7 w-7 p-0"
                                >
                                  <Edit2 className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="minimal"
                                  size="xs"
                                  onClick={() => openDeleteDialog(usuario.id, usuario.activo)}
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

                  {filteredUsuarios.length === 0 && !loading && (
                    <div className="text-center py-12">
                      <UsersIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {searchTerm ? 'No se encontraron usuarios' : 'No hay usuarios registrados'}
                      </h3>
                      <p className="text-gray-500 mb-4">
                        {searchTerm
                          ? 'No hay usuarios que coincidan con tu búsqueda.'
                          : 'Comienza agregando el primer usuario al sistema.'
                        }
                      </p>
                      {!searchTerm && (
                        <Button onClick={() => setIsCreateModalOpen(true)}>
                          <Plus className="w-4 h-4 mr-2" />
                          Agregar Primer Usuario
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>

                {/* Paginación - Exactamente como en la imagen */}
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
                    Página {paginaActual} de {totalPaginas} - {filteredUsuarios.length} registros

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

              {/* Modal para crear/editar usuario */}
              {isCreateModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-bold">
                        {editingUsuario ? 'Editar Usuario' : 'Nuevo Usuario'}
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
                      {editingUsuario
                        ? 'Modifica los datos del usuario seleccionado.'
                        : 'Completa la información para registrar un nuevo usuario.'
                      }
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Nombre *</Label>
                          <Input
                            variant="minimal"
                            fieldSize="sm"
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Ej: Juan"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="last_name">Apellido *</Label>
                          <Input
                            variant="minimal"
                            fieldSize="sm"
                            id="last_name"
                            value={formData.last_name}
                            onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                            placeholder="Ej: Pérez"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="username">Usuario *</Label>
                          <Input
                            variant="minimal"
                            fieldSize="sm"
                            id="username"
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            placeholder="Ej: jperez"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email *</Label>
                          <Input
                            variant="minimal"
                            fieldSize="sm"
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="Ej: juan@ejemplo.com"
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
                            placeholder="Ej: 12345678-9"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <Label htmlFor="password">
                              {editingUsuario ? 'Contraseña (dejar vacío para no cambiar)' : 'Contraseña *'}
                            </Label>
                            {!editingUsuario && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => setFormData({ ...formData, password: generatePassword(8) })}
                                className="h-auto py-1 px-2 text-xs"
                              >
                                <RefreshCw className="h-3 w-3 mr-1" />
                                Generar
                              </Button>
                            )}
                          </div>
                          <div className="relative">
                            <Input
                              variant="minimal"
                              fieldSize="sm"
                              id="password"
                              type={showPassword ? "text" : "password"}
                              value={formData.password}
                              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                              placeholder="••••••••"
                              required={!editingUsuario}
                              className="pr-10"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4 text-gray-500" />
                              ) : (
                                <Eye className="h-4 w-4 text-gray-500" />
                              )}
                            </Button>
                          </div>
                          <p className="text-xs text-gray-500">
                            Mínimo 6 caracteres
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="role">Rol *</Label>
                          <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                            <SelectTrigger variant="minimal" size="sm">
                              <SelectValue placeholder="Selecciona un rol" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">Administrador</SelectItem>
                              <SelectItem value="user">Usuario</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="empresa">Empresa</Label>
                          <Popover 
                            open={openEmpresaCombobox && formData.role !== 'admin'} 
                            onOpenChange={(open) => {
                              if (formData.role !== 'admin') {
                                setOpenEmpresaCombobox(open);
                              }
                            }}
                          >
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={openEmpresaCombobox}
                                className="w-full justify-between"
                                disabled={formData.role === 'admin'}
                              >
                                {formData.empresa_id
                                  ? empresas.find((empresa) => empresa.id.toString() === formData.empresa_id)?.nombre_comercial || "Selecciona una empresa"
                                  : "Selecciona una empresa"}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-full p-0">
                              <Command>
                                <CommandInput placeholder="Buscar empresa..." className="h-9" />
                                <CommandList>
                                  <CommandEmpty>No se encontró ninguna empresa.</CommandEmpty>
                                  <CommandGroup>
                                    <CommandItem
                                      value="sin-empresa"
                                      onSelect={() => {
                                        setFormData({ ...formData, empresa_id: '' });
                                        setOpenEmpresaCombobox(false);
                                      }}
                                    >
                                      <Check
                                        className={`mr-2 h-4 w-4 ${formData.empresa_id === '' ? 'opacity-100' : 'opacity-0'}`}
                                      />
                                      Sin empresa
                                    </CommandItem>
                                    {empresas.map((empresa) => (
                                      <CommandItem
                                        key={empresa.id}
                                        value={empresa.id.toString()}
                                        onSelect={() => {
                                          setFormData({ ...formData, empresa_id: empresa.id.toString() });
                                          setOpenEmpresaCombobox(false);
                                        }}
                                      >
                                        <Check
                                          className={`mr-2 h-4 w-4 ${formData.empresa_id === empresa.id.toString() ? 'opacity-100' : 'opacity-0'}`}
                                        />
                                        {empresa.nombre_comercial} - {empresa.ruc}
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                          {formData.role === 'admin' && (
                            <p className="text-xs text-gray-500 mt-1">
                              Los administradores se asignan automáticamente a la empresa principal
                            </p>
                          )}
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
                            <>{editingUsuario ? 'Actualizar' : 'Crear'} Usuario</>
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

      {/* AlertDialog para confirmar activación/desactivación */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {usuarioToDelete?.activo ? 'Desactivar Usuario' : 'Activar Usuario'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {usuarioToDelete?.activo
                ? '¿Está seguro de desactivar este usuario? El usuario no podrá acceder al sistema.'
                : '¿Está seguro de activar este usuario? El usuario podrá volver a acceder al sistema.'
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setDeleteDialogOpen(false);
              setUsuarioToDelete(null);
            }}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (usuarioToDelete) {
                  handleDelete(usuarioToDelete.id, usuarioToDelete.activo);
                }
              }}
              className={usuarioToDelete?.activo ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}
            >
              {usuarioToDelete?.activo ? 'Desactivar' : 'Activar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default Users;
