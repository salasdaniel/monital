import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../components/ui/select";
import Sidebar from '../components/ui/sidebar';
import Header from '../components/ui/header';
import { Plus, Building2, AlertCircle, X } from "lucide-react";
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
  const location = useLocation();
  const [user, setUser] = useState<UserData | null>(null);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingEmpresa, setEditingEmpresa] = useState<Empresa | null>(null);
  const [formLoading, setFormLoading] = useState(false);
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

  const fetchEmpresas = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      console.log(token)
      if (!token) {
        setError('No hay token de autenticación');
        return;
      }

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
      console.log(data)
    } catch (err) {
      console.error('Error al obtener empresas:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar las empresas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmpresas();
  }, []);

  // Función para crear una nueva empresa
  const createEmpresa = async () => {
    try {
      setFormLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No hay token de autenticación');
        return;
      }

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

      const response = await fetch('http://localhost:8000/api/empresas/add/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'X-App-Key': 'com.monital.app'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Error ${response.status}: ${errorData}`);
      }

      const result = await response.json();
      console.log('Empresa creada:', result);
      
      // Actualizar la lista de empresas
      await fetchEmpresas();
      
      // Limpiar formulario y cerrar modal
      resetForm();
      setIsCreateModalOpen(false);
      setError(null);
    } catch (err) {
      console.error('Error al crear empresa:', err);
      setError(err instanceof Error ? err.message : 'Error al crear la empresa');
    } finally {
      setFormLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingEmpresa) {
      // TODO: Implementar actualización
      console.log('Actualizando empresa:', editingEmpresa.id);
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

  const filteredEmpresas = empresas.filter(empresa =>
    empresa.razon_social.toLowerCase().includes(searchTerm.toLowerCase()) ||
    empresa.nombre_comercial.toLowerCase().includes(searchTerm.toLowerCase()) ||
    empresa.ruc.includes(searchTerm)
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
              <Select defaultValue="todos">
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
              <Select defaultValue="fecha">
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
            >
              Descendente
            </Button>
            <div className="flex flex-col">
              <Label className="text-sm font-medium text-gray-700 mb-1">Items por página</Label>
              <Select defaultValue="10">
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
              variant="minimal"
              size="sm"
              className="px-3"
            >
              Limpiar filtros
            </Button>
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
                </tr>
              </thead>
              <tbody>
                {filteredEmpresas.slice(0, 10).map((empresa) => (
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
                    <td className="px-3 py-1 text-center text-gray-700">
                      {empresa.activo ? 'SI' : 'NO'}
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

        {/* Paginación - Exactamente como en la imagen */}
        <div className="flex justify-between items-center px-6 py-4 border-t border-gray-200 mb-4">
          <Button
            variant="minimal"
            size="sm"
            className="px-3 text-gray-700"
            disabled={true}
          >
            Anterior
          </Button>

          <span className="text-sm text-gray-500">
            Página 1 de 1 - {filteredEmpresas.length} registros
         
          </span>

          <Button
            variant="minimal"
            size="sm"
            className="px-3 text-gray-700"
            disabled={true}
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
                <div className="space-y-2 flex items-center space-x-2 pt-6">
                  <input
                    type="checkbox"
                    id="activo"
                    checked={formData.activo}
                    onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="activo">Estado Activo</Label>
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
  );
};

export default Empresas;
