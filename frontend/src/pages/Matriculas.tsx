import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent } from "../components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "../components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "../components/ui/command";
import { useToast } from "../components/ui/use-toast";
import { Toaster } from "../components/ui/toaster";
import Sidebar from '../components/ui/sidebar';
import Header from '../components/ui/header';
import { Plus, Car, AlertCircle, X, Edit2, Check, ChevronsUpDown } from "lucide-react";
import { getUser } from "../utils/auth";
import { API_URLS, APP_KEY } from '../api/config';
import { cn } from "../lib/utils";

// Interfaces basadas en la API
interface Matricula {
  id: number;
  nro_matricula: string;
  tracker_id?: string;
  empresa_id?: number;
  empresa_nombre?: string;
  created_at: string;
  updated_at: string;
  usuario_creacion?: string;
}

interface MatriculaFormData {
  nro_matricula: string;
  tracker_id: string;
  empresa_id: string;
}

interface ApiResponse {
  message: string;
  count: number;
  matriculas: Matricula[];
}

interface Empresa {
  id: number;
  nombre_comercial: string;
  ruc: string;
}

interface UserData {
  username: string;
  role?: string;
  empresa_id?: number;
}

const Matriculas: React.FC = () => {
  const location = useLocation();
  const { toast } = useToast();
  const [user, setUser] = useState<UserData | null>(null);
  const [matriculas, setMatriculas] = useState<Matricula[]>([]);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingMatricula, setEditingMatricula] = useState<Matricula | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // Estados para filtros y paginación
  const [ordenarPor, setOrdenarPor] = useState<string>('fecha');
  const [ordenDireccion, setOrdenDireccion] = useState<'asc' | 'desc'>('desc');
  const [itemsPorPagina, setItemsPorPagina] = useState<number>(10);
  const [paginaActual, setPaginaActual] = useState<number>(1);
  const [empresaId, setEmpresaId] = useState<number | null>(null);
  const [openCombobox, setOpenCombobox] = useState(false);
  const [openModalCombobox, setOpenModalCombobox] = useState(false);

  const [formData, setFormData] = useState<MatriculaFormData>({
    nro_matricula: '',
    tracker_id: '',
    empresa_id: '',
  });

  useEffect(() => {
    // Obtener datos del usuario desde localStorage
    const userData = getUser();
    setUser(userData);
    
    // Si el usuario es 'user', se asigna su empresa_id automáticamente
    // Si es admin u otro rol, se inicializa en 0 (todas las matrículas)
    if (userData.role === 'user') {
      setEmpresaId(userData.empresa_id);
    } else {
      setEmpresaId(0); // Admin ve todas las matrículas por defecto
    }
  }, []);

  useEffect(() => {
    // Solo ejecutar fetchMatriculas si empresaId ya está inicializado
    if (empresaId !== null) {
      fetchMatriculas();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [empresaId]);

  // Cargar empresas para el combobox (solo si el rol NO es 'user')
  useEffect(() => {
    // Si el rol es 'user', no necesitamos cargar la lista de empresas
    if (user?.role === 'user') {
      return;
    }

    fetchEmpresas();
  }, [user]);

  // Resetear a página 1 cuando cambian los filtros
  useEffect(() => {
    setPaginaActual(1);
  }, [searchTerm, ordenarPor, ordenDireccion, itemsPorPagina, empresaId]);

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

      const data = await response.json();
      setEmpresas(data.empresas || []);
    } catch (err) {
      console.error('Error al obtener empresas:', err);
    }
  };

  const fetchMatriculas = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      const role = user?.role;
      
      // Construir URL: si es 'user' siempre envía su empresa_id
      // Si es admin y seleccionó una empresa (empresaId > 0), envía ese filtro
      // Si es admin y NO seleccionó empresa (empresaId === 0), no envía filtro (trae todas)
      let url = API_URLS.MATRICULAS;
      if (role === 'user') {
        url = `${API_URLS.MATRICULAS}?empresa_id=${empresaId}`;
      } else if (empresaId && empresaId > 0) {
        url = `${API_URLS.MATRICULAS}?empresa_id=${empresaId}`;
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
      setMatriculas(data.matriculas || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar las matrículas');
    } finally {
      setLoading(false);
    }
  };

  // Función para crear una nueva matrícula
  const createMatricula = async () => {
    try {
      setFormLoading(true);
      const token = localStorage.getItem('access_token');

      // Construir payload solo con campos que tienen valor
      const payload: any = {
        nro_matricula: formData.nro_matricula,
      };
      
      if (formData.tracker_id) {
        payload.tracker_id = formData.tracker_id;
      }
      
      if (formData.empresa_id && formData.empresa_id !== 'sin_empresa') {
        payload.empresa_id = parseInt(formData.empresa_id);
      }

      const response = await fetch(API_URLS.ADD_MATRICULAS, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'X-App-Key': APP_KEY
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error ${response.status}`);
      }

      // Actualizar la lista de matrículas
      await fetchMatriculas();

      // Mostrar toast de éxito
      toast({
        title: "¡Matrícula creada exitosamente!",
        description: `${formData.nro_matricula} ha sido agregada al sistema.`,
        variant: "success",
      });

      // Limpiar formulario y cerrar modal
      resetForm();
      setIsCreateModalOpen(false);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear la matrícula');
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'Error al crear la matrícula',
        variant: "destructive",
      });
    } finally {
      setFormLoading(false);
    }
  };

  // Función para actualizar una matrícula (solo tracker_id)
  const updateMatricula = async (id: number) => {
    try {
      setFormLoading(true);
      const token = localStorage.getItem('access_token');

      const payload = {
        tracker_id: formData.tracker_id || null,
      };

      const response = await fetch(API_URLS.UPDATE_MATRICULAS(id), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'X-App-Key': APP_KEY
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error ${response.status}`);
      }

      // Actualizar la lista de matrículas
      await fetchMatriculas();

      // Mostrar toast de éxito
      toast({
        title: "¡Matrícula actualizada exitosamente!",
        description: `El tracker_id de ${formData.nro_matricula} ha sido actualizado.`,
        variant: "success",
      });

      // Limpiar formulario y cerrar modal
      resetForm();
      setIsCreateModalOpen(false);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar la matrícula');
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'Error al actualizar la matrícula',
        variant: "destructive",
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingMatricula) {
      await updateMatricula(editingMatricula.id);
    } else {
      await createMatricula();
    }
  };

  const resetForm = () => {
    setFormData({
      nro_matricula: '',
      tracker_id: '',
      empresa_id: '',
    });
    setEditingMatricula(null);
    setError(null);
    setOpenModalCombobox(false);
  };

  // Función para manejar la edición (solo tracker_id)
  const handleEdit = (matricula: Matricula) => {
    setEditingMatricula(matricula);
    setFormData({
      nro_matricula: matricula.nro_matricula,
      tracker_id: matricula.tracker_id || '',
      empresa_id: matricula.empresa_id?.toString() || '',
    });
    setIsCreateModalOpen(true);
  };

  // Lógica de filtrado, ordenamiento y paginación
  const filteredMatriculas = matriculas
    .filter(matricula => {
      // Filtro por búsqueda (el filtro por empresa se aplica en la API)
      const matchesSearch =
        matricula.nro_matricula.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (matricula.tracker_id && matricula.tracker_id.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (matricula.empresa_nombre && matricula.empresa_nombre.toLowerCase().includes(searchTerm.toLowerCase()));

      return matchesSearch;
    })
    .sort((a, b) => {
      // Ordenamiento
      let comparison = 0;

      switch (ordenarPor) {
        case 'fecha':
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
        case 'matricula':
          comparison = a.nro_matricula.localeCompare(b.nro_matricula);
          break;
        case 'empresa':
          comparison = (a.empresa_nombre || '').localeCompare(b.empresa_nombre || '');
          break;
        default:
          comparison = 0;
      }

      return ordenDireccion === 'asc' ? comparison : -comparison;
    });

  // Paginación
  const totalPaginas = Math.ceil(filteredMatriculas.length / itemsPorPagina);
  const matriculasPaginadas = filteredMatriculas.slice(
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
            <p className="mt-4 text-lg text-gray-600">Cargando matrículas...</p>
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
          <Header title="Matrículas" subtitle="Gestión de matrículas de vehículos" />

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
              <Card className="border border-gray-200">
                {/* Filtros en fila horizontal */}
                <div className="p-4 m-4">
                  <div className="flex flex-wrap items-end gap-4">
                    <div className="flex flex-col">
                      <Label className="text-sm font-medium text-gray-700 mb-1">Buscar</Label>
                      <Input
                        placeholder="Matrícula, tracker, empresa..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        variant="minimal"
                        fieldSize="sm"
                        className="w-[250px]"
                      />
                    </div>
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
                                ? "Todas las matrículas"
                                : empresas.find((empresa) => empresa.id === empresaId)?.nombre_comercial || "Seleccionar empresa..."}
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
                                    Todas las matrículas
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
                      <Label className="text-sm font-medium text-gray-700 mb-1">Ordenar por</Label>
                      <Select value={ordenarPor} onValueChange={setOrdenarPor}>
                        <SelectTrigger variant="minimal" size="sm" className="w-[150px]">
                          <SelectValue placeholder="Ordenar por" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fecha">Fecha Creación</SelectItem>
                          <SelectItem value="matricula">Matrícula</SelectItem>
                          <SelectItem value="empresa">Empresa</SelectItem>
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

                    {user?.role === 'admin' && (
                      <Button
                        onClick={() => setIsCreateModalOpen(true)}
                        variant="minimal"
                        size="sm"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Nueva Matrícula
                      </Button>
                    )}
                  </div>
                </div>

                <CardContent className="p-0">
                  <div className="overflow-x-auto mx-4">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-center px-3 py-1 text-gray-700 font-medium">ID</th>
                          <th className="text-center px-3 py-1 text-gray-700 font-medium">Matrícula</th>
                          <th className="text-center px-3 py-1 text-gray-700 font-medium">Tracker ID</th>
                          <th className="text-center px-3 py-1 text-gray-700 font-medium">Empresa</th>
                          <th className="text-center px-3 py-1 text-gray-700 font-medium">Usuario Creación</th>
                          <th className="text-center px-3 py-1 text-gray-700 font-medium">Fecha Creación</th>
                          {user?.role === 'admin' && (
                            <th className="text-center px-3 py-1 text-gray-700 font-medium">Acciones</th>
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {matriculasPaginadas.map((matricula) => (
                          <tr key={matricula.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="px-3 py-1 text-center text-gray-700">
                              {matricula.id}
                            </td>
                            <td className="px-3 py-1 text-center text-gray-700">
                              <span className="font-medium">{matricula.nro_matricula}</span>
                            </td>
                            <td className="px-3 py-1 text-center text-gray-700">
                              {matricula.tracker_id || '-'}
                            </td>
                            <td className="px-3 py-1 text-center text-gray-700">
                              {matricula.empresa_nombre || '-'}
                            </td>
                            <td className="px-3 py-1 text-center text-gray-700">
                              {matricula.usuario_creacion || '-'}
                            </td>
                            <td className="px-3 py-1 text-center text-gray-700">
                              {new Date(matricula.created_at).toLocaleDateString('es-ES')}
                            </td>
                            {user?.role === 'admin' && (
                              <td className="px-3 py-1 text-center">
                                <div className="flex items-center justify-center gap-2">
                                  <Button
                                    variant="minimal"
                                    size="xs"
                                    onClick={() => handleEdit(matricula)}
                                    className="h-7 w-7 p-0"
                                    title="Editar Tracker ID"
                                  >
                                    <Edit2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {filteredMatriculas.length === 0 && !loading && (
                    <div className="text-center py-12">
                      <Car className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {searchTerm ? 'No se encontraron matrículas' : 'No hay matrículas registradas'}
                      </h3>
                      <p className="text-gray-500 mb-4">
                        {searchTerm
                          ? 'No hay matrículas que coincidan con tu búsqueda.'
                          : 'Comienza agregando tu primera matrícula al sistema.'
                        }
                      </p>
                      {!searchTerm && (
                        <Button onClick={() => setIsCreateModalOpen(true)}>
                          <Plus className="w-4 h-4 mr-2" />
                          Agregar Primera Matrícula
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>

                {/* Paginación */}
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
                    Página {paginaActual} de {totalPaginas || 1} - {filteredMatriculas.length} registros
                  </span>

                  <Button
                    variant="minimal"
                    size="sm"
                    className="px-3 text-gray-700"
                    disabled={paginaActual === totalPaginas || totalPaginas === 0}
                    onClick={() => setPaginaActual(paginaActual + 1)}
                  >
                    Siguiente
                  </Button>
                </div>
              </Card>

              {/* Modal para crear/editar matrícula */}
              {isCreateModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-bold">
                        {editingMatricula ? 'Editar Matrícula' : 'Nueva Matrícula'}
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
                      {editingMatricula
                        ? 'Solo puedes modificar el Tracker ID de la matrícula.'
                        : 'Completa la información para registrar una nueva matrícula.'
                      }
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="nro_matricula">Número de Matrícula *</Label>
                        <Input
                          variant="minimal"
                          fieldSize="sm"
                          id="nro_matricula"
                          value={formData.nro_matricula}
                          onChange={(e) => setFormData({ ...formData, nro_matricula: e.target.value })}
                          placeholder="Ej: ABC-1234"
                          required
                          disabled={!!editingMatricula}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="tracker_id">Tracker ID</Label>
                        <Input
                          variant="minimal"
                          fieldSize="sm"
                          id="tracker_id"
                          value={formData.tracker_id}
                          onChange={(e) => setFormData({ ...formData, tracker_id: e.target.value })}
                          placeholder="Ej: TRACK-001"
                        />
                      </div>

                      {!editingMatricula && (
                        <div className="space-y-2">
                          <Label htmlFor="empresa_id">Empresa</Label>
                          <Popover open={openModalCombobox} onOpenChange={setOpenModalCombobox}>
                            <PopoverTrigger asChild>
                              <Button
                                variant="minimal"
                                role="combobox"
                                aria-expanded={openModalCombobox}
                                className="w-full justify-between h-9"
                              >
                                {!formData.empresa_id || formData.empresa_id === 'sin_empresa'
                                  ? "Sin empresa"
                                  : empresas.find((empresa) => empresa.id.toString() === formData.empresa_id)?.nombre_comercial || "Seleccionar empresa..."}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-full p-0">
                              <Command>
                                <CommandInput placeholder="Buscar empresa..." />
                                <CommandList>
                                  <CommandEmpty>No se encontraron empresas.</CommandEmpty>
                                  <CommandGroup>
                                    <CommandItem
                                      value="sin_empresa"
                                      onSelect={() => {
                                        setFormData({ ...formData, empresa_id: 'sin_empresa' });
                                        setOpenModalCombobox(false);
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          (!formData.empresa_id || formData.empresa_id === 'sin_empresa') ? "opacity-100" : "opacity-0"
                                        )}
                                      />
                                      Sin empresa
                                    </CommandItem>
                                    {empresas.map((empresa) => (
                                      <CommandItem
                                        key={empresa.id}
                                        value={`${empresa.nombre_comercial} ${empresa.ruc}`}
                                        onSelect={() => {
                                          setFormData({ ...formData, empresa_id: empresa.id.toString() });
                                          setOpenModalCombobox(false);
                                        }}
                                      >
                                        <Check
                                          className={cn(
                                            "mr-2 h-4 w-4",
                                            formData.empresa_id === empresa.id.toString() ? "opacity-100" : "opacity-0"
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
                            <>{editingMatricula ? 'Actualizar' : 'Crear'} Matrícula</>
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
    </>
  );
};

export default Matriculas;
