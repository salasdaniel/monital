import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import Sidebar from '../components/ui/sidebar';
import Header from '../components/ui/header';
import { Search, Plus, Edit2, Trash2, Building2, Phone, Mail, MapPin, AlertCircle, X } from "lucide-react";
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

  const handleDelete = (id: number) => {
    // TODO: Implementar eliminación
    console.log('Eliminando empresa con ID:', id);
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
          <div className="space-y-6">
            {/* Botón para nueva empresa */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Lista de Empresas</h2>
                <p className="text-gray-600">
                  Gestiona todas las empresas registradas en el sistema
                </p>
              </div>
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Nueva Empresa
              </Button>
            </div>

      {/* Barra de búsqueda y estadísticas */}
      <div className="flex items-center justify-between">
        <div className="relative w-96">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Buscar por razón social, nombre comercial o RUC..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-4">
          <Card className="w-48">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium">Total Empresas</p>
                  <p className="text-2xl font-bold">{empresas.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="w-48">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Building2 className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium">Activas</p>
                  <p className="text-2xl font-bold">
                    {empresas.filter(e => e.activo).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

     

      {/* Tabla de empresas */}
      <Card>
      
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 font-medium text-gray-900">Empresa</th>
                  <th className="text-left p-4 font-medium text-gray-900">RUC</th>
                  <th className="text-left p-4 font-medium text-gray-900">Dirección</th>
                  <th className="text-left p-4 font-medium text-gray-900">Contacto</th>
                  <th className="text-left p-4 font-medium text-gray-900">Estado</th>
                  <th className="text-left p-4 font-medium text-gray-900">Fecha Creación</th>
                  <th className="text-right p-4 font-medium text-gray-900">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmpresas.map((empresa) => (
                  <tr key={empresa.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      <div>
                        <div className="font-medium">{empresa.nombre_comercial}</div>
                        <div className="text-sm text-gray-500">{empresa.razon_social}</div>
                      </div>
                    </td>
                    <td className="p-4 font-mono text-sm">{empresa.ruc}</td>
                    <td className="p-4 max-w-xs">
                      <div className="flex items-start">
                        <MapPin className="w-3 h-3 mr-1 mt-1 flex-shrink-0 text-gray-400" />
                        <span className="truncate text-sm">{empresa.direccion}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        {empresa.correo_referencia && (
                          <div className="flex items-center text-sm">
                            <Mail className="w-3 h-3 mr-1 text-gray-400" />
                            <span className="truncate">{empresa.correo_referencia}</span>
                          </div>
                        )}
                        {empresa.numero_referencia && (
                          <div className="flex items-center text-sm">
                            <Phone className="w-3 h-3 mr-1 text-gray-400" />
                            {empresa.numero_referencia}
                          </div>
                        )}
                        {!empresa.correo_referencia && !empresa.numero_referencia && (
                          <span className="text-sm text-gray-400">Sin contacto</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        empresa.activo 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {empresa.activo ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="text-sm">
                        {new Date(empresa.created_at).toLocaleDateString('es-ES')}
                      </div>
                      {empresa.usuario_creacion && (
                        <div className="text-xs text-gray-500">
                          por {empresa.usuario_creacion}
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(empresa)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(empresa.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
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
          </div>
        </CardContent>
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
                variant="outline"
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
                  variant="outline" 
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    resetForm();
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={formLoading}>
                  {formLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Guardando...
                    </>
                  ) : (
                    editingEmpresa ? 'Actualizar' : 'Crear'
                  )} Empresa
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
