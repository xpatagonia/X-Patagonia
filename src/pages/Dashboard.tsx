import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { db, auth } from '../lib/firebase';
import { collection, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { Plus, FileText, Clock, CheckCircle, ChevronRight, LayoutDashboard, Send, Activity, Tag, Users, Package, Inbox, Box, AlertTriangle, PackageCheck, Truck, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import CompanyProducts from '../components/CompanyProducts';
import CompanyInbox from '../components/CompanyInbox';
import { getApiUrl } from '../lib/apiConfig';

interface RFQ {
  id: number;
  title: string;
  category: string;
  priority: string;
  description: string;
  status: string;
  createdAt: string;
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<'rfqs'|'products'|'received_rfqs'>('rfqs');
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [installedModules, setInstalledModules] = useState<string[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Servicios Industriales');
  const [priority, setPriority] = useState('medium');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  useEffect(() => {
    const fetchRfqs = async () => {
      const user = auth.currentUser;
      if (!user) {
        navigate('/');
        return;
      }
      try {
        const token = await user.getIdToken();
        const res = await fetch(`${getApiUrl()}/api/rfqs`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setRfqs(data);
        }
      } catch (error) {
        console.error("Error fetching RFQs:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchModules = async (user: any) => {
      try {
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);
        let userCategory = '';
        if (userDocSnap.exists()) {
          userCategory = userDocSnap.data().category || '';
        }

        const docRef = doc(db, 'users', user.uid, 'settings', 'modules');
        const docSnap = await getDoc(docRef);
        let ids: string[] = [];
        if (docSnap.exists()) {
          const data = docSnap.data();
          ids = data.installed || [];
        } else {
          const saved = localStorage.getItem('installedModules');
          if (saved) {
            ids = JSON.parse(saved);
          }
        }
        
        // Auto-enable logistics module for logistics companies
        if (userCategory === 'LOGISTICA' && !ids.includes('logistics')) {
          ids.push('logistics');
        }
        setInstalledModules(ids);
      } catch (e) {
        console.error(e);
      }
    };

    // Wait slightly to let auth initialize
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchRfqs();
        fetchModules(user);
      } else {
        navigate('/');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (installedModules.includes('warehousing')) {
      const unsubscribe = onSnapshot(collection(db, 'inventory_items'), (snapshot) => {
        const items = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setInventory(items);
      });
      return () => unsubscribe();
    }
  }, [installedModules]);

  const handleCreateRfq = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const user = auth.currentUser;
    if (!user) return;

    try {
      const token = await user.getIdToken();
      const res = await fetch(`${getApiUrl()}/api/rfqs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title, category, priority, description
        })
      });

      if (res.ok) {
        const newRfq = await res.json();
        setRfqs([newRfq, ...rfqs]);
        setIsNewModalOpen(false);
        setShowSuccessToast(true);
        setTimeout(() => setShowSuccessToast(false), 5000);
        // Reset form
        setTitle('');
        setCategory('Servicios Industriales');
        setPriority('medium');
        setDescription('');
      }
    } catch (error) {
      console.error("Error creating RFQ:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateWarehouseData = () => {
    const warehouseMap: Record<string, any> = {};
    inventory.forEach(item => {
      const loc = item.location === 'Central CABA' ? 'Central CABA' :
                  item.location === 'Parque Ind. Comodoro' ? 'PQ Comodoro' : 'Sur Neuquén';
      
      if (!warehouseMap[loc]) warehouseMap[loc] = { name: loc, Componentes: 0, Insumos: 0, Maquinaria: 0 };
      if (['Componentes', 'Insumos', 'Maquinaria'].includes(item.category)) {
        warehouseMap[loc][item.category] += Number(item.stock) || 0;
      }
    });
    return Object.values(warehouseMap);
  };

  const modalContent = (
    <AnimatePresence>
      {isNewModalOpen && (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4">
          <motion.div 
            initial={{ bg: 'transparent' }} 
            animate={{ backgroundColor: 'rgba(0,0,0,0.5)' }} 
            exit={{ backgroundColor: 'transparent' }} 
            className="absolute inset-0 backdrop-blur-sm" 
            onClick={() => setIsNewModalOpen(false)} 
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative w-full max-w-xl z-[9999] bg-white dark:bg-[#1A1625] rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden"
          >
            <div className="p-6 md:p-8">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Solicitar Cotización (Match Directo)</h2>
                <p className="text-sm text-slate-500 mb-6">Su solicitud se enviará en tiempo real y de forma directa a todos los proveedores validados en nuestro directorio que coincidan con la categoría.</p>
              </div>
              
              <form onSubmit={handleCreateRfq} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Título Breve</label>
                  <input 
                    required
                    type="text" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ej: Provisión de ropa de trabajo ignífuga"
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Categoría</label>
                    <select 
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 appearance-none"
                    >
                      <option>Alimentación</option>
                      <option>Sector Productivo (Ovina, Bovina, Cerdos)</option>
                      <option>Pesca y Acuicultura (Flotas, Procesadoras)</option>
                      <option>Sector Metalúrgico y Metalmecánico</option>
                      <option>Puertos y Logística Terrestre / Almacenamiento</option>
                      <option>Hidrocarburos</option>
                      <option>Energías Renovables (Eólica, Solar)</option>
                      <option>Construcción Civil e Infraestructura</option>
                      <option>Tecnología e Innovación</option>
                      <option>Seguridad e Higiene Integral</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Prioridad</label>
                    <select 
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 appearance-none"
                    >
                      <option value="low">Baja (Normal)</option>
                      <option value="medium">Media</option>
                      <option value="high">Alta / Urgente</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Descripción Detallada</label>
                  <textarea 
                    required
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Especificaciones técnicas, cantidades, plazos de entrega..."
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 resize-none"
                  />
                </div>

                <div className="pt-4 flex justify-end gap-3">
                  <button 
                    type="button" 
                    onClick={() => setIsNewModalOpen(false)}
                    className="px-6 py-3 font-bold text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="flex items-center px-6 py-3 bg-gradient-to-r from-orange-500 to-purple-600 hover:opacity-90 text-white font-bold text-sm rounded-lg transition disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Enviar a Proveedores
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0A080C] px-6 py-12 md:px-12">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-8 border-b border-slate-200 dark:border-white/10 pb-6 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <LayoutDashboard className="w-5 h-5 text-orange-500" />
              <span className="text-sm font-bold uppercase tracking-widest text-slate-500">Panel del Usuario</span>
            </div>
            <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-4">
              Gestión B2B
            </h1>
            <div className="flex flex-wrap items-center gap-2 sm:gap-6">
              <button 
                onClick={() => setActiveTab('rfqs')}
                className={`text-sm font-bold uppercase tracking-wider pb-2 border-b-2 transition-[color,border-color] ${activeTab === 'rfqs' ? 'border-orange-500 text-orange-500' : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
              >
                Mis Cotizaciones
              </button>
              <button 
                onClick={() => setActiveTab('received_rfqs')}
                className={`text-sm font-bold uppercase tracking-wider pb-2 border-b-2 transition-[color,border-color] flex items-center gap-1 ${activeTab === 'received_rfqs' ? 'border-purple-500 text-purple-500 bg-purple-50/50 dark:bg-purple-500/10 rounded-t-lg px-2 -mx-2' : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
              >
                <Inbox className="w-4 h-4" /> CRM
              </button>
              <button 
                onClick={() => setActiveTab('products')}
                className={`text-sm font-bold uppercase tracking-wider pb-2 border-b-2 transition-[color,border-color] flex items-center gap-1 ${activeTab === 'products' ? 'border-orange-500 text-orange-500 bg-orange-50/50 dark:bg-orange-500/10 rounded-t-lg px-2 -mx-2' : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
              >
                <Package className="w-4 h-4" /> Mis Productos
              </button>
            </div>
          </div>
          
          {activeTab === 'rfqs' && (
            <button 
              onClick={() => setIsNewModalOpen(true)}
              className="px-6 py-3 whitespace-nowrap bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs uppercase tracking-widest font-bold rounded-lg hover:bg-slate-800 dark:hover:bg-slate-200 transition flex items-center shadow-lg shadow-purple-500/10"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nueva Solicitud
            </button>
          )}
        </div>

        {activeTab === 'rfqs' ? (
          <>
            {/* Dashboard Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white dark:bg-[#1A1625] p-6 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-500/10 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-orange-500" />
                  </div>
                  <span className="inline-flex items-center text-emerald-500 text-xs font-bold bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-md">
                    +12% este mes
                  </span>
                </div>
                <h3 className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-wider mb-1">Cotizaciones Activas</h3>
                <p className="text-3xl font-display font-bold text-slate-900 dark:text-white">
                  {rfqs.length}
                </p>
              </div>
              
              <div className="bg-white dark:bg-[#1A1625] p-6 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-500/10 flex items-center justify-center">
                    <Users className="w-5 h-5 text-purple-500" />
                  </div>
                </div>
                <h3 className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-wider mb-1">Proveedores en Red</h3>
                <p className="text-3xl font-display font-bold text-slate-900 dark:text-white">
                  2,450
                </p>
              </div>
              
              <div className="bg-white dark:bg-[#1A1625] p-6 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center">
                    <Activity className="w-5 h-5 text-emerald-500" />
                  </div>
                </div>
                <h3 className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-wider mb-1">Ahorro Estimado</h3>
                <p className="text-3xl font-display font-bold text-slate-900 dark:text-white">
                   18.5%
                </p>
              </div>
            </div>

            {/* Módulos Activos (Integración) */}
            {installedModules.length > 0 && (
              <div className="mb-12">
                 <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Módulos Activos</h2>
                 <div className="grid grid-cols-1 lg:grid-cols-2 lg:grid-cols-3 gap-6">
                    {installedModules.includes('warehousing') && (
                       <div className="bg-white dark:bg-[#1A1625] p-6 rounded-3xl border border-slate-200 dark:border-white/5 shadow-sm flex flex-col">
                           <div className="flex justify-between items-center mb-6">
                              <div className="flex items-center gap-3 text-slate-900 dark:text-white">
                                <PackageCheck className="w-5 h-5 text-orange-500" />
                                <h4 className="font-bold">Inventario</h4>
                              </div>
                              <button 
                                onClick={() => navigate('/warehousing')}
                                className="text-xs font-bold uppercase text-orange-500 hover:underline"
                              >
                                Abrir Módulo
                              </button>
                           </div>
                           
                           <div className="flex gap-4 mb-6">
                              <div className="flex-1 bg-slate-50 dark:bg-black/20 p-4 rounded-xl">
                                 <h5 className="text-xs font-bold text-slate-500 mb-1">Total SKUs</h5>
                                 <p className="text-2xl font-bold text-slate-900 dark:text-white">{inventory.length > 0 ? inventory.length : 14}</p>
                              </div>
                              <div className="flex-1 bg-slate-50 dark:bg-black/20 p-4 rounded-xl">
                                 <h5 className="text-xs font-bold text-slate-500 mb-1">Alertas</h5>
                                 <p className="text-2xl font-bold text-red-500">{inventory.length > 0 ? inventory.filter(i => i.status === 'low-stock' || i.status === 'out-of-stock').length : 2}</p>
                              </div>
                           </div>

                           <div className="flex-1 min-h-[150px]">
                              {inventory.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                   <BarChart data={calculateWarehouseData()} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                     <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} opacity={0.2} />
                                     <XAxis dataKey="name" tick={{fill: '#888', fontSize: 10}} axisLine={false} tickLine={false} />
                                     <YAxis tick={{fill: '#888', fontSize: 10}} axisLine={false} tickLine={false} />
                                     <RechartsTooltip cursor={{fill: 'transparent'}} contentStyle={{backgroundColor: '#1A1625', borderColor: '#333', color: '#fff', borderRadius: '8px'}} />
                                     <Bar dataKey="Componentes" stackId="a" fill="#f97316" radius={[0, 0, 4, 4]} />
                                     <Bar dataKey="Insumos" stackId="a" fill="#eab308" />
                                     <Bar dataKey="Maquinaria" stackId="a" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                   </BarChart>
                                </ResponsiveContainer>
                              ) : (
                                <div className="flex items-center justify-center h-full text-sm text-slate-500 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/5">Cargar datos para visualizar</div>
                              )}
                           </div>
                       </div>
                    )}

                    {installedModules.includes('logistica') && (
                       <div className="bg-white dark:bg-[#1A1625] p-6 rounded-3xl border border-slate-200 dark:border-white/5 shadow-sm flex flex-col">
                           <div className="flex justify-between items-center mb-6">
                              <div className="flex items-center gap-3 text-slate-900 dark:text-white">
                                <Truck className="w-5 h-5 text-blue-500" />
                                <h4 className="font-bold">Logística y Cargas</h4>
                              </div>
                              <button 
                                onClick={() => navigate('/logistica')}
                                className="text-xs font-bold uppercase text-blue-500 hover:underline"
                              >
                                Abrir Módulo
                              </button>
                           </div>
                           
                           <div className="flex gap-4 mb-6">
                              <div className="flex-1 bg-slate-50 dark:bg-black/20 p-4 rounded-xl">
                                 <h5 className="text-xs font-bold text-slate-500 mb-1">En Tránsito</h5>
                                 <p className="text-2xl font-bold text-slate-900 dark:text-white">12</p>
                              </div>
                              <div className="flex-1 bg-slate-50 dark:bg-black/20 p-4 rounded-xl">
                                 <h5 className="text-xs font-bold text-slate-500 mb-1">Entregados hoy</h5>
                                 <p className="text-2xl font-bold text-emerald-500">4</p>
                              </div>
                           </div>

                           <div className="flex-1 flex flex-col gap-3 justify-center">
                              <div className="bg-slate-50 dark:bg-white/5 p-3 rounded-xl border border-slate-200 dark:border-white/5 text-sm flex justify-between items-center">
                                <span className="text-slate-600 dark:text-slate-400">Guía #89221-A</span>
                                <span className="text-blue-500 font-bold text-xs uppercase bg-blue-50 dark:bg-blue-500/10 px-2 py-1 rounded">En Ruta</span>
                              </div>
                              <div className="bg-slate-50 dark:bg-white/5 p-3 rounded-xl border border-slate-200 dark:border-white/5 text-sm flex justify-between items-center">
                                <span className="text-slate-600 dark:text-slate-400">Guía #89222-A</span>
                                <span className="text-emerald-500 font-bold text-xs uppercase bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded">Descargando</span>
                              </div>
                               <div className="bg-slate-50 dark:bg-white/5 p-3 rounded-xl border border-slate-200 dark:border-white/5 text-sm flex justify-between items-center">
                                <span className="text-slate-600 dark:text-slate-400">Guía #89223-B</span>
                                <span className="text-amber-500 font-bold text-xs uppercase bg-amber-50 dark:bg-amber-500/10 px-2 py-1 rounded">Programado</span>
                              </div>
                           </div>
                       </div>
                    )}

                    {(installedModules.includes('ecommerce') || installedModules.includes('certifications')) && (
                       <div className="bg-white dark:bg-[#1A1625] p-6 rounded-3xl border border-slate-200 dark:border-white/5 shadow-sm flex flex-col">
                           <div className="flex justify-between items-center mb-6">
                              <div className="flex items-center gap-3 text-slate-900 dark:text-white">
                                <Box className="w-5 h-5 text-purple-500" />
                                <h4 className="font-bold">E-commerce B2B</h4>
                              </div>
                              <button 
                                onClick={() => navigate('/ecommerce')}
                                className="text-xs font-bold uppercase text-purple-500 hover:underline"
                              >
                                Abrir Catálogo
                              </button>
                           </div>
                           
                           <div className="flex gap-4 mb-6">
                              <div className="flex-1 bg-slate-50 dark:bg-black/20 p-4 rounded-xl">
                                 <h5 className="text-xs font-bold text-slate-500 mb-1">Productos</h5>
                                 <p className="text-2xl font-bold text-slate-900 dark:text-white">24</p>
                              </div>
                              <div className="flex-1 bg-slate-50 dark:bg-black/20 p-4 rounded-xl">
                                 <h5 className="text-xs font-bold text-slate-500 mb-1">Pedidos Activos</h5>
                                 <p className="text-2xl font-bold text-emerald-500">3</p>
                              </div>
                           </div>

                           <div className="flex-1 flex flex-col justify-center">
                              <h5 className="text-xs font-bold text-slate-500 mb-3">Normas Cumplidas Destacadas</h5>
                              <div className="flex flex-col gap-2 border-t border-slate-100 dark:border-white/5 pt-3">
                                 <div className="flex items-center gap-3 text-sm">
                                   <CheckCircle className="w-4 h-4 text-emerald-500" />
                                   <span className="text-slate-600 dark:text-slate-400 font-medium">Bomba Centrífuga 200HP</span>
                                   <span className="text-xs px-2 py-0.5 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-md">ISO 9001</span>
                                 </div>
                                 <div className="flex items-center gap-3 text-sm">
                                   <CheckCircle className="w-4 h-4 text-emerald-500" />
                                   <span className="text-slate-600 dark:text-slate-400 font-medium">Motor Trifásico Industrial</span>
                                   <span className="text-xs px-2 py-0.5 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-md">ISO 14001</span>
                                 </div>
                              </div>
                           </div>
                       </div>
                    )}
                 </div>
              </div>
            )}

            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="w-8 h-8 border-t-2 border-r-2 border-orange-500 rounded-full animate-spin"></div>
              </div>
            ) : rfqs.length === 0 ? (
              <div className="bg-white dark:bg-[#110E17] border border-slate-200 dark:border-white/5 rounded-2xl p-12 text-center shadow-sm">
                <div className="w-16 h-16 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FileText className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No tienes cotizaciones activas</h3>
                <p className="text-slate-500 mb-6 max-w-md mx-auto">
                  Comienza a optimizar tus compras enviando tu primer Requerimiento de Cotización (RFQ). El sistema notificará automáticamente a los proveedores verificados que coincidan con tus necesidades.
                </p>
                <button 
                  onClick={() => setIsNewModalOpen(true)}
                  className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white text-xs uppercase tracking-widest font-bold rounded-lg transition"
                >
                  Crear mi primer RFQ
                </button>
              </div>
            ) : (
              <div className="bg-white dark:bg-[#110E17] border border-slate-200 dark:border-white/5 shadow-sm rounded-2xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-white/5 text-xs uppercase tracking-wider text-slate-500 border-b border-slate-200 dark:border-white/10">
                      <th className="px-6 py-4 font-semibold">Requerimiento</th>
                      <th className="px-6 py-4 font-semibold">Categoría</th>
                      <th className="px-6 py-4 font-semibold">Estado</th>
                      <th className="px-6 py-4 font-semibold text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rfqs.map((rfq) => (
                      <tr key={rfq.id} className="border-b border-slate-100 dark:border-white/5 last:border-0 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors group">
                        <td className="px-6 py-5">
                          <p className="font-bold text-slate-900 dark:text-white text-sm mb-1">{rfq.title}</p>
                          <p className="text-xs text-slate-500">#{rfq.id.toString().padStart(5, '0')} • {new Date(rfq.createdAt).toLocaleDateString()}</p>
                        </td>
                        <td className="px-6 py-5">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300">
                            {rfq.category}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          {rfq.status === 'pending' && (
                            <span className="inline-flex items-center text-orange-500 text-xs font-semibold">
                              <Clock className="w-3.5 h-3.5 mr-1" /> Notificando Proveedores
                            </span>
                          )}
                          {rfq.status === 'quoted' && (
                            <span className="inline-flex items-center text-purple-500 text-xs font-semibold">
                              <FileText className="w-3.5 h-3.5 mr-1" /> Cotizaciones Recibidas
                            </span>
                          )}
                          {rfq.status === 'awarded' && (
                            <span className="inline-flex items-center text-emerald-500 text-xs font-semibold">
                              <CheckCircle className="w-3.5 h-3.5 mr-1" /> Adjudicado
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-5 text-right">
                          <button className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                            <ChevronRight className="w-5 h-5 ml-auto" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Suggested Services */}
            <div className="mt-12">
              <div className="flex justify-between items-end mb-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Servicios Recomendados</h2>
                <button 
                  onClick={() => navigate('/servicios')}
                  className="text-xs font-bold uppercase tracking-wider text-orange-500 hover:text-orange-600 transition flex items-center"
                >
                  Ver Directorio <ChevronRight className="w-3 h-3 ml-1" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { title: 'Inspección No Destructiva NDT', cat: 'Servicios Industriales' },
                  { title: 'Instalaciones Electromecánicas', cat: 'Mantenimiento' },
                  { title: 'Logística de Cargas Especiales', cat: 'Transporte' },
                  { title: 'Provisión de EPP Ignífugo', cat: 'Seguridad' },
                ].map((svc, i) => (
                  <div key={i} onClick={() => navigate('/servicios')} className="bg-white dark:bg-[#1A1625] p-5 rounded-xl border border-slate-200 dark:border-white/5 shadow-sm hover:border-orange-500/30 transition cursor-pointer flex items-center gap-4 group">
                    <div className="w-12 h-12 bg-slate-100 dark:bg-white/5 rounded-lg flex items-center justify-center shrink-0">
                      <Tag className="w-5 h-5 text-slate-400 group-hover:text-orange-500 transition-colors" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm group-hover:text-orange-500 transition-colors">{svc.title}</h4>
                      <p className="text-xs text-slate-500">{svc.cat}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : activeTab === 'received_rfqs' ? (
          <CompanyInbox />
        ) : (
          <CompanyProducts />
        )}

      </div>

      {mounted && createPortal(modalContent, document.body)}

      <AnimatePresence>
        {showSuccessToast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 right-6 z-[9999] bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 border border-slate-700 dark:border-white/20"
          >
            <CheckCircle className="w-5 h-5 text-emerald-500" />
            <div>
              <p className="font-bold text-sm">Match Directo Exitoso</p>
              <p className="text-xs opacity-80">Notificando a proveedores verificados...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

