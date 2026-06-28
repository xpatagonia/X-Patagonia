import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Box, Search, PackageCheck, AlertTriangle, Building, Map as MapIcon, Layers, Package, ListFilter, ArrowDownToLine, Plus, MoreVertical, Database, Share2, Download } from 'lucide-react';
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { db } from '../lib/firebase';
import { collection, onSnapshot, doc, writeBatch, getDocs } from 'firebase/firestore';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  '';
const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY';

const WAREHOUSES = [
  { id: 'wh-1', name: 'Central CABA', location: 'Buenos Aires, CABA', lat: -34.6037, lng: -58.3816, capacity: '85%', pallets: 1240, status: 'high' },
  { id: 'wh-2', name: 'Parque Ind. Comodoro', location: 'Comodoro Rivadavia, Chubut', lat: -45.8641, lng: -67.4966, capacity: '45%', pallets: 350, status: 'optimal' },
  { id: 'wh-3', name: 'Almacenes del Sur Neuquén', location: 'Neuquén Capital, Neuquén', lat: -38.9516, lng: -68.0591, capacity: '92%', pallets: 850, status: 'warning' },
];

const DEFAULT_INVENTORY = [
  { sku: 'SKU-8921', name: 'Válvula Esférica 2"', category: 'Componentes', location: 'Central CABA', stock: 1450, minStock: 500, status: 'in-stock', updated: 'Hace 2 horas' },
  { sku: 'SKU-8922', name: 'Junta de Teflón', category: 'Insumos', location: 'Parque Ind. Comodoro', stock: 120, minStock: 200, status: 'low-stock', updated: 'Hace 5 horas' },
  { sku: 'SKU-8923', name: 'Bomba Centrífuga', category: 'Maquinaria', location: 'Almacenes del Sur Neuquén', stock: 15, minStock: 10, status: 'in-stock', updated: 'Hace 1 día' },
  { sku: 'SKU-8924', name: 'Filtro de Aceite', category: 'Insumos', location: 'Central CABA', stock: 0, minStock: 50, status: 'out-of-stock', updated: 'Hace 3 días' },
  { sku: 'SKU-8925', name: 'Motor Trifásico 5HP', category: 'Maquinaria', location: 'Parque Ind. Comodoro', stock: 45, minStock: 30, status: 'in-stock', updated: 'Hace 1 hora' },
];

export default function WarehousingModule() {
  const [activeTab, setActiveTab] = useState<'mapa' | 'inventario' | 'turnos'>('mapa');
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'inventory_items'), (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setInventory(items);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSeedTestData = async () => {
    setSeeding(true);
    try {
      const batch = writeBatch(db);
      DEFAULT_INVENTORY.forEach(item => {
        const docRef = doc(collection(db, 'inventory_items'));
        batch.set(docRef, item);
      });
      await batch.commit();
    } catch (err) {
      console.error(err);
    }
    setSeeding(false);
  };

  const calculateChartsData = () => {
    const categoryMap: Record<string, number> = {};
    const warehouseMap: Record<string, any> = {};

    inventory.forEach(item => {
      // Category aggregation
      if (!categoryMap[item.category]) categoryMap[item.category] = 0;
      categoryMap[item.category] += Number(item.stock) || 0;

      // Warehouse aggregation
      const loc = item.location === 'Central CABA' ? 'Central CABA' :
                  item.location === 'Parque Ind. Comodoro' ? 'PQ Comodoro' : 'Sur Neuquén';
      
      if (!warehouseMap[loc]) warehouseMap[loc] = { name: loc, Componentes: 0, Insumos: 0, Maquinaria: 0 };
      if (['Componentes', 'Insumos', 'Maquinaria'].includes(item.category)) {
        warehouseMap[loc][item.category] += Number(item.stock) || 0;
      }
    });

    const categoryColors: Record<string, string> = {
      'Componentes': '#f97316',
      'Insumos': '#eab308',
      'Maquinaria': '#3b82f6'
    };

    const catData = Object.keys(categoryMap).map(key => ({
      name: key,
      value: categoryMap[key],
      color: categoryColors[key] || '#94a3b8'
    }));

    const whData = Object.values(warehouseMap);

    return { catData, whData };
  };

  const handleExportPDF = async () => {
    const input = document.getElementById('inventory-report');
    if (!input) return;
    setIsExporting(true);
    try {
      const canvas = await html2canvas(input, {
        scale: 2,
        useCORS: true,
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.setFontSize(16);
      pdf.text('Reporte de Inventario Consolidado', 15, 15);
      
      pdf.addImage(imgData, 'PNG', 0, 20, pdfWidth, pdfHeight);
      pdf.save('Reporte_Inventario_B2B.pdf');
    } catch (err) {
      console.error('Error generating PDF', err);
    }
    setIsExporting(false);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Reporte de Inventario B2B',
        text: 'Revisa el estado actual de nuestro inventario consolidado.',
        url: window.location.href,
      }).catch(console.error);
    } else {
      alert('La función de compartir no está disponible en este navegador. Copia la URL manualmente.');
    }
  };

  const { catData, whData } = calculateChartsData();
  
  const totalSkus = inventory.length;
  const lowStockCount = inventory.filter(i => i.status === 'low-stock').length;
  const outOfStockCount = inventory.filter(i => i.status === 'out-of-stock').length;

  if (!hasValidKey) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0A080C] pt-24 pb-12 flex items-center justify-center p-6">
        <div className="bg-white dark:bg-[#1A1625] rounded-3xl p-8 max-w-lg w-full text-center border border-slate-200 dark:border-white/10 shadow-xl">
          <MapIcon className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Se requiere API Key de Google Maps</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6 text-sm">
            Para visualizar tus almacenes distribuidos en el territorio, necesitas configurar tu clave de Google Maps Platform.
          </p>
          <div className="text-left text-sm bg-slate-50 dark:bg-black/20 p-4 rounded-xl border border-slate-200 dark:border-white/5 mb-6">
            <p className="mb-2 font-bold text-slate-700 dark:text-slate-300">Pasos para activar:</p>
            <ol className="list-decimal pl-5 space-y-2 text-slate-600 dark:text-slate-400">
              <li>Abre <strong>Settings</strong> (⚙️ esquina superior derecha)</li>
              <li>Selecciona <strong>Secrets</strong></li>
              <li>Agrega <code>GOOGLE_MAPS_PLATFORM_KEY</code> y pega tu clave.</li>
            </ol>
          </div>
          <a href="https://console.cloud.google.com/google/maps-apis/start" target="_blank" rel="noopener noreferrer" className="inline-block w-full py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold transition">
            Obtener API Key
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0A080C] pt-24 pb-12">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-500/10 flex items-center justify-center">
                <PackageCheck className="w-5 h-5 text-orange-600 dark:text-orange-500" />
              </div>
              <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white">Warehousing & Almacenamiento</h1>
            </div>
            <p className="text-slate-600 dark:text-slate-400">Gestiona tu red de almacenamiento y stock distribuido regionalmente.</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto mb-8 bg-white dark:bg-[#1A1625] p-2 rounded-2xl border border-slate-200 dark:border-white/5">
          <button
            onClick={() => setActiveTab('mapa')}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-colors whitespace-nowrap ${activeTab === 'mapa' ? 'bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            Mapa de Red
          </button>
          <button
            onClick={() => setActiveTab('inventario')}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-colors whitespace-nowrap ${activeTab === 'inventario' ? 'bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            Inventario Remoto
          </button>
          <button
            onClick={() => setActiveTab('turnos')}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-colors whitespace-nowrap ${activeTab === 'turnos' ? 'bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            Turnos de Carga
          </button>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'mapa' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              <div className="lg:col-span-4 space-y-4">
                 <div className="bg-white dark:bg-[#1A1625] rounded-3xl p-6 border border-slate-200 dark:border-white/5 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2"><Building className="w-5 h-5" /> Nodos Activos</h3>
                    <div className="space-y-4">
                      {WAREHOUSES.map(wh => (
                        <div key={wh.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-[#110E17] border border-slate-200 dark:border-white/5 hover:border-orange-500/50 transition cursor-pointer">
                           <div className="flex justify-between items-start mb-2">
                             <h4 className="font-bold text-sm text-slate-900 dark:text-white">{wh.name}</h4>
                             <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${
                               wh.status === 'optimal' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' :
                               wh.status === 'high' ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' :
                               'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'
                             }`}>
                               {wh.capacity} Ocupación
                             </span>
                           </div>
                           <p className="text-xs text-slate-500 flex items-center gap-1 mb-3"><MapPin className="w-3.5 h-3.5" /> {wh.location}</p>
                           <div className="flex items-center gap-4 text-xs font-medium text-slate-600 dark:text-slate-400">
                              <span className="flex items-center gap-1"><Layers className="w-3.5 h-3.5" /> {wh.pallets} Pallets</span>
                           </div>
                        </div>
                      ))}
                    </div>
                 </div>
                 <button className="w-full py-4 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-900 dark:text-white rounded-2xl font-bold transition flex items-center justify-center gap-2 border border-slate-200 dark:border-white/5 border-dashed">
                    Solicitar Nuevo Hub Regional
                 </button>
              </div>

              <div className="lg:col-span-8">
                <div className="bg-white dark:bg-[#1A1625] rounded-3xl overflow-hidden border border-slate-200 dark:border-white/5 h-[600px] shadow-sm relative">
                  <APIProvider apiKey={API_KEY} version="weekly">
                    <Map
                      defaultCenter={{lat: -40.5, lng: -65.0}} // Default around Patagonia
                      mapId="MAP_WAREHOUSE_ID"
                      defaultZoom={4}
                      internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                      style={{width: '100%', height: '100%'}}
                    >
                      {WAREHOUSES.map((wh) => (
                         <AdvancedMarker key={wh.id} position={{lat: wh.lat, lng: wh.lng}} title={wh.name}>
                           <Pin background={wh.status === 'warning' ? '#ef4444' : wh.status === 'high' ? '#f59e0b' : '#f97316'} glyphColor="#fff" borderColor="rgba(255,255,255,0.2)" />
                         </AdvancedMarker>
                      ))}
                    </Map>
                  </APIProvider>
                  
                  {/* Floating legend */}
                  <div className="absolute bottom-6 left-6 bg-white/90 dark:bg-black/80 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-slate-200 dark:border-white/10">
                     <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Estado de Capacidad</h4>
                     <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300">
                           <div className="w-3 h-3 rounded-full bg-orange-500"></div> Óptimo (&lt; 70%)
                        </div>
                        <div className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300">
                           <div className="w-3 h-3 rounded-full bg-amber-500"></div> Alta Ocupación (70-90%)
                        </div>
                        <div className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300">
                           <div className="w-3 h-3 rounded-full bg-red-500"></div> Crítico (&gt; 90%)
                        </div>
                     </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'inventario' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
               
               <div id="inventory-report" className="space-y-6 bg-slate-50 dark:bg-[#0A080C] p-4 -m-4 sm:p-0 sm:m-0 sm:bg-transparent">
               {/* Metrics & Alerts Row */}
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white dark:bg-[#1A1625] p-6 rounded-3xl border border-slate-200 dark:border-white/5 shadow-sm">
                     <div className="flex items-center gap-3 mb-2 text-slate-500">
                        <Box className="w-5 h-5" />
                        <h4 className="font-bold text-sm">Total SKUs</h4>
                     </div>
                     <p className="text-3xl font-bold text-slate-900 dark:text-white">{totalSkus}</p>
                  </div>
                  <div className="bg-white dark:bg-[#1A1625] p-6 rounded-3xl border border-slate-200 dark:border-white/5 shadow-sm">
                     <div className="flex items-center gap-3 mb-2 text-amber-500">
                        <AlertTriangle className="w-5 h-5" />
                        <h4 className="font-bold text-sm text-slate-500">Stock Bajo</h4>
                     </div>
                     <p className="text-3xl font-bold text-slate-900 dark:text-white">{lowStockCount}</p>
                  </div>
                  <div className="bg-white dark:bg-[#1A1625] p-6 rounded-3xl border border-slate-200 dark:border-white/5 shadow-sm">
                     <div className="flex items-center gap-3 mb-2 text-red-500">
                        <AlertTriangle className="w-5 h-5" />
                        <h4 className="font-bold text-sm text-slate-500">Sin Stock (Quiebre)</h4>
                     </div>
                     <p className="text-3xl font-bold text-slate-900 dark:text-white">{outOfStockCount}</p>
                  </div>
                  <div className="bg-white dark:bg-[#1A1625] p-6 rounded-3xl border border-slate-200 dark:border-white/5 shadow-sm">
                     <div className="flex items-center gap-3 mb-2 text-emerald-500">
                        <PackageCheck className="w-5 h-5" />
                        <h4 className="font-bold text-sm text-slate-500">Órdenes en Tránsito</h4>
                     </div>
                     <p className="text-3xl font-bold text-slate-900 dark:text-white">8</p>
                  </div>
               </div>

               {inventory.length === 0 && !loading && (
                 <div className="bg-slate-100 dark:bg-white/5 rounded-2xl p-6 text-center border border-slate-200 dark:border-white/5 space-y-4">
                   <Database className="w-12 h-12 text-slate-400 mx-auto" />
                   <h3 className="text-lg font-bold text-slate-900 dark:text-white">No hay datos en el inventario</h3>
                   <p className="text-slate-500 text-sm max-w-sm mx-auto">Para propósitos de prueba, puedes poblar la base de datos de Firestore con inventario de ejemplo.</p>
                   <button 
                     onClick={handleSeedTestData} 
                     disabled={seeding}
                     className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white rounded-xl text-sm font-bold shadow-lg shadow-orange-500/20 transition inline-flex items-center gap-2"
                   >
                     {seeding ? 'Cargando datos...' : 'Cargar datos de prueba'}
                   </button>
                 </div>
               )}

               {/* Charts Row */}
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white dark:bg-[#1A1625] p-6 rounded-3xl border border-slate-200 dark:border-white/5 shadow-sm flex flex-col">
                      <h4 className="font-bold text-slate-900 dark:text-white mb-6">Stock por Ubicación y Categoría</h4>
                      <div className="flex-1 min-h-[250px]">
                         <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={whData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} opacity={0.2} />
                              <XAxis dataKey="name" tick={{fill: '#888', fontSize: 12}} axisLine={false} tickLine={false} />
                              <YAxis tick={{fill: '#888', fontSize: 12}} axisLine={false} tickLine={false} />
                              <Tooltip cursor={{fill: 'transparent'}} contentStyle={{backgroundColor: '#1A1625', borderColor: '#333', color: '#fff', borderRadius: '8px'}} />
                              <Legend wrapperStyle={{fontSize: '12px'}} />
                              <Bar dataKey="Componentes" stackId="a" fill="#f97316" radius={[0, 0, 4, 4]} />
                              <Bar dataKey="Insumos" stackId="a" fill="#eab308" />
                              <Bar dataKey="Maquinaria" stackId="a" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                         </ResponsiveContainer>
                      </div>
                  </div>
                  <div className="bg-white dark:bg-[#1A1625] p-6 rounded-3xl border border-slate-200 dark:border-white/5 shadow-sm flex flex-col">
                      <h4 className="font-bold text-slate-900 dark:text-white mb-6">Distribución por Categoría</h4>
                      <div className="flex-1 min-h-[250px]">
                         <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie data={catData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                {catData.map((entry: any, index: number) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <Tooltip contentStyle={{backgroundColor: '#1A1625', borderColor: '#333', color: '#fff', borderRadius: '8px'}} />
                              <Legend wrapperStyle={{fontSize: '12px'}} />
                            </PieChart>
                         </ResponsiveContainer>
                      </div>
                  </div>
               </div>

               <div className="bg-white dark:bg-[#1A1625] border border-slate-200 dark:border-white/5 rounded-3xl overflow-hidden shadow-sm">
                  <div className="p-6 border-b border-slate-200 dark:border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                     <div className="flex gap-2 relative w-full sm:w-auto">
                        <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                        <input type="text" placeholder="Buscar SKU, producto o categoría..." className="w-full sm:w-80 pl-12 pr-4 py-2.5 bg-slate-50 dark:bg-[#110E17] border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 text-slate-900 dark:text-white" />
                     </div>
                     <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
                        <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition">
                           <ListFilter className="w-4 h-4" /> Filtros
                        </button>
                        <button 
                           onClick={handleExportPDF}
                           disabled={isExporting}
                           className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition disabled:opacity-50"
                        >
                           {isExporting ? <span className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></span> : <Download className="w-4 h-4 text-orange-500" />} 
                           {isExporting ? 'Exportando...' : 'Descargar PDF'}
                        </button>
                        <button 
                           onClick={handleShare}
                           className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition"
                        >
                           <Share2 className="w-4 h-4 text-purple-500" /> Compartir
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 border border-transparent rounded-xl text-sm font-bold text-white shadow-lg shadow-orange-500/20 transition">
                           <Plus className="w-4 h-4" /> Nuevo Ingreso
                        </button>
                     </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left whitespace-nowrap">
                       <thead className="bg-slate-50 dark:bg-[#110E17]">
                         <tr>
                           <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">SKU / Producto</th>
                           <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Categoría</th>
                           <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Ubicación</th>
                           <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Stock Actual</th>
                           <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Estado</th>
                           <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Última Act.</th>
                           <th className="px-6 py-4"></th>
                         </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-sm">
                         {inventory.map((item) => (
                           <tr key={item.id || item.sku} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                             <td className="px-6 py-4 text-slate-900 dark:text-white">
                               <div className="font-bold">{item.name}</div>
                               <div className="text-xs text-slate-500 font-mono mt-0.5">{item.sku}</div>
                             </td>
                             <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                               <span className="px-2.5 py-1 bg-slate-100 dark:bg-white/5 rounded-lg text-xs">{item.category}</span>
                             </td>
                             <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                               <div className="flex items-center gap-1.5 mt-1">
                                 <Building className="w-3.5 h-3.5 text-slate-400" /> {item.location}
                               </div>
                             </td>
                             <td className="px-6 py-4 text-right">
                               <div className="font-medium text-slate-900 dark:text-white flex items-baseline justify-end gap-1">
                                 {item.stock} <span className="text-xs font-normal text-slate-500">uds</span>
                               </div>
                               <div className="text-[10px] text-slate-500 mt-0.5">Mín: {item.minStock}</div>
                             </td>
                             <td className="px-6 py-4 text-center">
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                                  item.status === 'in-stock' 
                                    ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                    : item.status === 'low-stock'
                                    ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400'
                                    : 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400'
                                }`}>
                                  {item.status === 'in-stock' ? 'En Stock' : item.status === 'low-stock' ? 'Stock Bajo' : 'Sin Stock'}
                                </span>
                             </td>
                             <td className="px-6 py-4 text-slate-500 text-xs text-right">
                                {item.updated}
                             </td>
                             <td className="px-6 py-4 text-right">
                                <button className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                                   <MoreVertical className="w-4 h-4" />
                                </button>
                             </td>
                           </tr>
                         ))}
                       </tbody>
                    </table>
                  </div>

                  <div className="p-4 border-t border-slate-200 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between text-sm text-slate-500 bg-slate-50/50 dark:bg-[#110E17]/50 gap-4">
                     <span>Mostrando {inventory.length} resultados</span>
                     <div className="flex gap-2">
                        <button className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 disabled:opacity-50" disabled>Anterior</button>
                        <button className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5">Siguiente</button>
                     </div>
                  </div>
               </div>
               </div>
            </motion.div>
          )}

          {activeTab === 'turnos' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-white dark:bg-[#1A1625] rounded-3xl border border-slate-200 dark:border-white/5 p-8 text-center min-h-[400px] flex flex-col items-center justify-center">
               <AlertTriangle className="w-16 h-16 text-slate-300 dark:text-slate-600 mb-4" />
               <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Gestión de Muelles y Carga</h3>
               <p className="text-slate-500 max-w-md mx-auto">Requiere integración con sistemas WMS del proveedor logístico para mostrar ventanas horarias disponibles.</p>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
