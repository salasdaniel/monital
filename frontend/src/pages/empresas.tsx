import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import Sidebar from '../components/ui/sidebar';
import { 
  Plus, 
  Search, 
  Pencil, 
  Trash2, 
  Building2,
  Phone,
  Mail,
  MapPin,
  Users,
  Filter
} from 'lucide-react';

// Interfaces
interface Empresa {
  id: number;
  nombre: string;
  razonSocial: string;
  cuit: string;
  telefono: string;
  email: string;
  direccion: string;
  ciudad: string;
  provincia: string;
  codigoPostal: string;
  sitioWeb?: string;
  fechaCreacion: string;
  estado: 'activo' | 'inactivo';
  empleados?: number;
  sector: string;
}

interface EmpresaFormData {
  nombre: string;
  razonSocial: string;
  cuit: string;
  telefono: string;
  email: string;
  direccion: string;
  ciudad: string;
  provincia: string;
  codigoPostal: string;
  sitioWeb: string;
  estado: 'activo' | 'inactivo';
  empleados: number;
  sector: string;
}

// Datos de ejemplo (fuera del componente para evitar recreaciones)
const empresasEjemplo: Empresa[] = [
  {
    id: 1,
    nombre: 'TechCorp S.A.',
    razonSocial: 'Tecnología Corporativa Sociedad Anónima',
    cuit: '30-12345678-9',
    telefono: '+54 11 4567-8900',
    email: 'contacto@techcorp.com.ar',
    direccion: 'Av. Corrientes 1234',
    ciudad: 'Buenos Aires',
    provincia: 'CABA',
    codigoPostal: '1043',
    sitioWeb: 'https://www.techcorp.com.ar',
    fechaCreacion: '2023-01-15',
    estado: 'activo',
    empleados: 150,
    sector: 'Tecnología'
  },
  {
    id: 2,
    nombre: 'Industrias del Sur',
    razonSocial: 'Industrias del Sur Limitada',
    cuit: '30-98765432-1',
    telefono: '+54 11 9876-5432',
    email: 'info@industriasdelsur.com',
    direccion: 'Calle Industrial 567',
    ciudad: 'Córdoba',
    provincia: 'Córdoba',
    codigoPostal: '5000',
    sitioWeb: 'https://www.industriasdelsur.com',
    fechaCreacion: '2022-06-20',
    estado: 'activo',
    empleados: 85,
    sector: 'Manufactura'
  },
  {
    id: 3,
    nombre: 'Comercial Norte',
    razonSocial: 'Comercial Norte S.R.L.',
    cuit: '30-55667788-3',
    telefono: '+54 341 444-5555',
    email: 'ventas@comercialnorte.com',
    direccion: 'Bv. Oroño 890',
    ciudad: 'Rosario',
    provincia: 'Santa Fe',
    codigoPostal: '2000',
    fechaCreacion: '2023-03-10',
    estado: 'inactivo',
    empleados: 25,
    sector: 'Comercio'
  }
];

const sectores = ['Tecnología', 'Manufactura', 'Comercio', 'Servicios', 'Educación', 'Salud', 'Construcción'];

const Empresas: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Estados
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [filteredEmpresas, setFilteredEmpresas] = useState<Empresa[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState<'todos' | 'activo' | 'inactivo'>('todos');
  const [filterSector, setFilterSector] = useState('todos');
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingEmpresa, setEditingEmpresa] = useState<Empresa | null>(null);
  const [deletingEmpresa, setDeletingEmpresa] = useState<Empresa | null>(null);
  const [formData, setFormData] = useState<EmpresaFormData>({
    nombre: '',
    razonSocial: '',
    cuit: '',
    telefono: '',
    email: '',
    direccion: '',
    ciudad: '',
    provincia: '',
    codigoPostal: '',
    sitioWeb: '',
    estado: 'activo',
    empleados: 0,
    sector: ''
  });

  // Cargar datos de ejemplo al montar el componente
  useEffect(() => {
    setEmpresas(empresasEjemplo);
    setFilteredEmpresas(empresasEjemplo);
  }, []);

  // Funciones de navegación y usuario
  const handleMenuClick = (menuId: string) => {
    switch (menuId) {
      case 'dashboard':
        navigate('/dashboard');
        break;
      case 'empresas':
        navigate('/empresas');
        break;
      default:
        console.log(`Funcionalidad ${menuId} en desarrollo`);
    }
  };

  const getUserRole = (): string => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user?.role || 'user';
  };

  // Filtrar empresas
  useEffect(() => {
    let filtered = empresas.filter(empresa => {
      const matchesSearch = empresa.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           empresa.razonSocial.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           empresa.cuit.includes(searchTerm) ||
                           empresa.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesEstado = filterEstado === 'todos' || empresa.estado === filterEstado;
      const matchesSector = filterSector === 'todos' || empresa.sector === filterSector;
      
      return matchesSearch && matchesEstado && matchesSector;
    });
    
    setFilteredEmpresas(filtered);
  }, [searchTerm, filterEstado, filterSector, empresas]);

  // Funciones del formulario
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'empleados' ? parseInt(value) || 0 : value
    }));
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      razonSocial: '',
      cuit: '',
      telefono: '',
      email: '',
      direccion: '',
      ciudad: '',
      provincia: '',
      codigoPostal: '',
      sitioWeb: '',
      estado: 'activo',
      empleados: 0,
      sector: ''
    });
  };

  const handleOpenModal = (empresa?: Empresa) => {
    if (empresa) {
      setEditingEmpresa(empresa);
      setFormData({
        nombre: empresa.nombre,
        razonSocial: empresa.razonSocial,
        cuit: empresa.cuit,
        telefono: empresa.telefono,
        email: empresa.email,
        direccion: empresa.direccion,
        ciudad: empresa.ciudad,
        provincia: empresa.provincia,
        codigoPostal: empresa.codigoPostal,
        sitioWeb: empresa.sitioWeb || '',
        estado: empresa.estado,
        empleados: empresa.empleados || 0,
        sector: empresa.sector
      });
    } else {
      setEditingEmpresa(null);
      resetForm();
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingEmpresa(null);
    resetForm();
  };

  const handleSave = () => {
    if (editingEmpresa) {
      // Actualizar empresa existente
      const updatedEmpresa: Empresa = {
        ...editingEmpresa,
        ...formData,
        fechaCreacion: editingEmpresa.fechaCreacion
      };
      
      setEmpresas(prev => prev.map(emp => 
        emp.id === editingEmpresa.id ? updatedEmpresa : emp
      ));
    } else {
      // Crear nueva empresa
      const newEmpresa: Empresa = {
        id: Math.max(...empresas.map(e => e.id)) + 1,
        ...formData,
        fechaCreacion: new Date().toISOString().split('T')[0]
      };
      
      setEmpresas(prev => [...prev, newEmpresa]);
    }
    
    handleCloseModal();
  };

  const handleDelete = (empresa: Empresa) => {
    setDeletingEmpresa(empresa);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (deletingEmpresa) {
      setEmpresas(prev => prev.filter(emp => emp.id !== deletingEmpresa.id));
      setShowDeleteModal(false);
      setDeletingEmpresa(null);
    }
  };

  const getEstadoBadge = (estado: string) => {
    return estado === 'activo' 
      ? 'bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium'
      : 'bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <Sidebar 
        userRole={getUserRole()}
        currentPath={location.pathname}
        onMenuClick={handleMenuClick}
      />
      
      {/* Main Content */}
      <div className="flex-1">
        <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Building2 className="h-8 w-8 text-blue-600" />
            Gestión de Empresas
          </h1>
          <p className="text-gray-600 mt-2">
            Administra todas las empresas del sistema
          </p>
        </div>
        
        <Button 
          onClick={() => handleOpenModal()}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nueva Empresa
        </Button>
      </div>

      {/* Filtros y Búsqueda */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros y Búsqueda
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Búsqueda */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar empresas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Filtro por Estado */}
            <select
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value as 'todos' | 'activo' | 'inactivo')}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="todos">Todos los estados</option>
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
            </select>
            
            {/* Filtro por Sector */}
            <select
              value={filterSector}
              onChange={(e) => setFilterSector(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="todos">Todos los sectores</option>
              {sectores.map(sector => (
                <option key={sector} value={sector}>{sector}</option>
              ))}
            </select>
            
            {/* Contador */}
            <div className="flex items-center text-sm text-gray-600">
              <Users className="h-4 w-4 mr-1" />
              {filteredEmpresas.length} empresa{filteredEmpresas.length !== 1 ? 's' : ''}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de Empresas */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Empresas</CardTitle>
          <CardDescription>
            Administra la información de todas las empresas registradas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 font-medium text-gray-900">Empresa</th>
                  <th className="text-left p-4 font-medium text-gray-900">CUIT</th>
                  <th className="text-left p-4 font-medium text-gray-900">Contacto</th>
                  <th className="text-left p-4 font-medium text-gray-900">Ubicación</th>
                  <th className="text-left p-4 font-medium text-gray-900">Sector</th>
                  <th className="text-left p-4 font-medium text-gray-900">Estado</th>
                  <th className="text-left p-4 font-medium text-gray-900">Empleados</th>
                  <th className="text-left p-4 font-medium text-gray-900">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmpresas.map((empresa) => (
                  <tr key={empresa.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      <div>
                        <div className="font-medium text-gray-900">{empresa.nombre}</div>
                        <div className="text-sm text-gray-500">{empresa.razonSocial}</div>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-900">{empresa.cuit}</td>
                    <td className="p-4">
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-gray-900">
                          <Phone className="h-3 w-3 mr-1" />
                          {empresa.telefono}
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <Mail className="h-3 w-3 mr-1" />
                          {empresa.email}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center text-sm text-gray-900">
                        <MapPin className="h-3 w-3 mr-1" />
                        {empresa.ciudad}, {empresa.provincia}
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-900">{empresa.sector}</td>
                    <td className="p-4">
                      <span className={getEstadoBadge(empresa.estado)}>
                        {empresa.estado.charAt(0).toUpperCase() + empresa.estado.slice(1)}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-900">{empresa.empleados || 'N/A'}</td>
                    <td className="p-4">
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenModal(empresa)}
                          className="hover:bg-blue-50"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(empresa)}
                          className="hover:bg-red-50 text-red-600 border-red-200"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredEmpresas.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Building2 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No se encontraron empresas que coincidan con los filtros seleccionados.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modal de Formulario */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">
                {editingEmpresa ? 'Editar Empresa' : 'Nueva Empresa'}
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCloseModal}
              >
                ✕
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 space-y-4 md:space-y-0">
              {/* Información Básica */}
              <div className="md:col-span-2">
                <h3 className="text-lg font-medium mb-4">Información Básica</h3>
              </div>
              
              <div>
                <Label htmlFor="nombre">Nombre Comercial *</Label>
                <Input
                  id="nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  placeholder="Ej: TechCorp S.A."
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="razonSocial">Razón Social *</Label>
                <Input
                  id="razonSocial"
                  name="razonSocial"
                  value={formData.razonSocial}
                  onChange={handleInputChange}
                  placeholder="Ej: Tecnología Corporativa S.A."
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="cuit">CUIT *</Label>
                <Input
                  id="cuit"
                  name="cuit"
                  value={formData.cuit}
                  onChange={handleInputChange}
                  placeholder="Ej: 30-12345678-9"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="sector">Sector *</Label>
                <select
                  id="sector"
                  name="sector"
                  value={formData.sector}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Seleccionar sector</option>
                  {sectores.map(sector => (
                    <option key={sector} value={sector}>{sector}</option>
                  ))}
                </select>
              </div>
              
              {/* Información de Contacto */}
              <div className="md:col-span-2">
                <h3 className="text-lg font-medium mb-4 mt-6">Información de Contacto</h3>
              </div>
              
              <div>
                <Label htmlFor="telefono">Teléfono *</Label>
                <Input
                  id="telefono"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleInputChange}
                  placeholder="Ej: +54 11 4567-8900"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Ej: contacto@empresa.com"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="sitioWeb">Sitio Web</Label>
                <Input
                  id="sitioWeb"
                  name="sitioWeb"
                  value={formData.sitioWeb}
                  onChange={handleInputChange}
                  placeholder="Ej: https://www.empresa.com"
                />
              </div>
              
              <div>
                <Label htmlFor="empleados">Número de Empleados</Label>
                <Input
                  id="empleados"
                  name="empleados"
                  type="number"
                  value={formData.empleados}
                  onChange={handleInputChange}
                  placeholder="Ej: 150"
                  min="0"
                />
              </div>
              
              {/* Dirección */}
              <div className="md:col-span-2">
                <h3 className="text-lg font-medium mb-4 mt-6">Dirección</h3>
              </div>
              
              <div className="md:col-span-2">
                <Label htmlFor="direccion">Dirección *</Label>
                <Input
                  id="direccion"
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleInputChange}
                  placeholder="Ej: Av. Corrientes 1234"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="ciudad">Ciudad *</Label>
                <Input
                  id="ciudad"
                  name="ciudad"
                  value={formData.ciudad}
                  onChange={handleInputChange}
                  placeholder="Ej: Buenos Aires"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="provincia">Provincia *</Label>
                <Input
                  id="provincia"
                  name="provincia"
                  value={formData.provincia}
                  onChange={handleInputChange}
                  placeholder="Ej: CABA"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="codigoPostal">Código Postal *</Label>
                <Input
                  id="codigoPostal"
                  name="codigoPostal"
                  value={formData.codigoPostal}
                  onChange={handleInputChange}
                  placeholder="Ej: 1043"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="estado">Estado *</Label>
                <select
                  id="estado"
                  name="estado"
                  value={formData.estado}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                </select>
              </div>
            </div>
            
            {/* Botones del formulario */}
            <div className="flex justify-end space-x-4 mt-8">
              <Button
                variant="outline"
                onClick={handleCloseModal}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {editingEmpresa ? 'Actualizar' : 'Guardar'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmación de Eliminación */}
      {showDeleteModal && deletingEmpresa && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center mb-4">
              <div className="bg-red-100 rounded-full p-3 mr-4">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Eliminar Empresa</h3>
                <p className="text-sm text-gray-500">Esta acción no se puede deshacer</p>
              </div>
            </div>
            
            <p className="text-gray-700 mb-6">
              ¿Estás seguro que deseas eliminar la empresa <strong>{deletingEmpresa.nombre}</strong>?
            </p>
            
            <div className="flex justify-end space-x-4">
              <Button
                variant="outline"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancelar
              </Button>
              <Button
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-700"
              >
                Eliminar
              </Button>
            </div>
          </div>
        </div>
      )}
        </div>
      </div>
    </div>
  );
};

export default Empresas;
