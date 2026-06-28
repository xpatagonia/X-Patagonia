import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Truck, MapPin, Package, Search, ArrowRight, ShieldCheck, FileText, CheckCircle2, ChevronDown, ListFilter, Play, Plus, Route, Navigation2 } from 'lucide-react';
import { collection, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

const CARRIERS = [
  { id: 'cruz-sur', name: 'Cruz del Sur', logo: 'CS', type: 'Carga General y Peligrosa', status: 'active', rate: 'Desde $850/kg' },
  { id: 'andreani', name: 'Andreani B2B', logo: 'AN', type: 'Paquetería Express B2B', status: 'active', rate: 'Desde $12.000/bulto' },
  { id: 'oro-negro', name: 'Oro Negro', logo: 'ON', type: 'Servicio Petrolero/Minero', status: 'pending', rate: 'Cotización Especial' },
];

const SHIPMENTS = [
  { id: 'ENV-100234', from: 'Buenos Aires', to: 'Neuquén', carrier: 'Cruz del Sur', date: '22 Oct, 2026', status: 'En Tránsito', weight: '450 kg' },
  { id: 'ENV-100235', from: 'Córdoba', to: 'Comodoro Rivadavia', carrier: 'Andreani B2B', date: '21 Oct, 2026', status: 'Entregado', weight: '25 kg' },
];

export default function LogisticsModule() {
  const [activeTab, setActiveTab] = useState<'cotizador' | 'transportistas' | 'envios' | 'flotas' | 'guias' | 'rutas'>('cotizador');
  const [quoteOrigin, setQuoteOrigin] = useState('');
  const [quoteDest, setQuoteDest] = useState('');
  const [quoteWeight, setQuoteWeight] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [locations, setLocations] = useState<string[]>([]);
  const [userCategory, setUserCategory] = useState<string>('');

  useEffect(() => {
    const unsubContacts = onSnapshot(collection(db, 'crm_contacts'), (snapshot) => {
      const allLocations = new Set<string>();
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.location) {
          allLocations.add(data.location);
        }
      });
      setLocations(Array.from(allLocations));
    });

    const fetchUser = async () => {
      if (auth.currentUser) {
        const docSnap = await getDoc(doc(db, 'users', auth.currentUser.uid));
        if (docSnap.exists()) {
          setUserCategory(docSnap.data().category || '');
        }
      }
    };
    fetchUser();

    return () => unsubContacts();
  }, []);

  const isLogisticsProvider = userCategory === 'LOGISTICA';

  const handleQuote = (e: React.FormEvent) => {
    e.preventDefault();
    setShowResults(true);
  };


  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0A080C] pt-24 pb-12">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-500/10 flex items-center justify-center">
                <Truck className="w-5 h-5 text-orange-600 dark:text-orange-500" />
              </div>
              <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white">Logística & Transporte</h1>
            </div>
            <p className="text-slate-600 dark:text-slate-400">Opera toda tu distribución B2B desde un solo panel integrado.</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto mb-8 bg-white dark:bg-[#1A1625] p-2 rounded-2xl border border-slate-200 dark:border-white/5">
          <button
            onClick={() => {setActiveTab('cotizador'); setShowResults(false);}}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-colors whitespace-nowrap ${activeTab === 'cotizador' ? 'bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            Cotizador Rápido
          </button>
          <button
            onClick={() => setActiveTab('transportistas')}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-colors whitespace-nowrap ${activeTab === 'transportistas' ? 'bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            Proveedores y Tarifas
          </button>
          <button
            onClick={() => setActiveTab('envios')}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-colors whitespace-nowrap ${activeTab === 'envios' ? 'bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            Mis Envíos
          </button>
          {isLogisticsProvider && (
            <>
              <button
                onClick={() => setActiveTab('flotas')}
                className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-colors whitespace-nowrap ${activeTab === 'flotas' ? 'bg-orange-500 text-white shadow-md' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
              >
                Flota y Vehículos
              </button>
              <button
                onClick={() => setActiveTab('rutas')}
                className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-colors whitespace-nowrap ${activeTab === 'rutas' ? 'bg-orange-500 text-white shadow-md' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
              >
                Rutas y Distancias
              </button>
              <button
                onClick={() => setActiveTab('guias')}
                className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-colors whitespace-nowrap ${activeTab === 'guias' ? 'bg-orange-500 text-white shadow-md' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
              >
                Guías de Remisión
              </button>
            </>
          )}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'cotizador' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              <div className="lg:col-span-5">
                <div className="bg-white dark:bg-[#1A1625] border border-slate-200 dark:border-white/5 rounded-3xl p-6 md:p-8">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Cotizar Nuevo Envío</h2>
                  
                  <form onSubmit={handleQuote} className="space-y-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Origen</label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input type="text" list="locations-list" placeholder="Ej: Buenos Aires (CABA)" required value={quoteOrigin} onChange={e => setQuoteOrigin(e.target.value)} className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#110E17] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50" />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Destino</label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input type="text" list="locations-list" placeholder="Ej: Añelo, Vaca Muerta o selecciona un cliente" required value={quoteDest} onChange={e => setQuoteDest(e.target.value)} className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#110E17] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50" />
                      </div>
                    </div>

                    <datalist id="locations-list">
                      {locations.map((loc, i) => (
                        <option key={i} value={loc} />
                      ))}
                    </datalist>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Peso Estimado</label>
                        <div className="relative">
                          <Package className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                          <input type="number" placeholder="Kg" required value={quoteWeight} onChange={e => setQuoteWeight(e.target.value)} className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#110E17] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Valor Declarado</label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                          <input type="number" placeholder="ARS" className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#110E17] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50" />
                        </div>
                      </div>
                    </div>

                    <button type="submit" className="w-full py-4 mt-2 bg-gradient-to-r from-orange-500 to-amber-600 hover:opacity-90 text-white font-bold text-sm rounded-xl transition shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2">
                       Generar Cotizaciones <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              </div>

              <div className="lg:col-span-7">
                {showResults ? (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
                     <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Opciones Disponibles</h3>
                     
                     {/* Opción 1 */}
                     <div className="bg-white dark:bg-[#1A1625] border-2 border-orange-500 rounded-2xl p-6 relative shadow-lg shadow-orange-500/5">
                        <div className="absolute top-0 right-8 -translate-y-1/2 bg-orange-500 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm">
                          Mejor Opción
                        </div>
                        <div className="flex flex-col sm:flex-row gap-6 justify-between items-start sm:items-center">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-[#110E17] flex items-center justify-center border border-slate-200 dark:border-white/5 font-bold text-xl text-slate-900 dark:text-white">
                              CS
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-900 dark:text-white text-lg">Cruz del Sur</h4>
                              <p className="text-slate-500 text-sm">Carga General y Peligrosa</p>
                              <div className="flex items-center gap-4 mt-2">
                                <span className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> Entrega: 48-72hs</span>
                                <span className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Seguro Incluido</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-left sm:text-right">
                             <div className="text-xs font-bold text-slate-400 uppercase mb-1">Costo Total Estimado</div>
                             <div className="text-2xl font-bold text-slate-900 dark:text-white">${(parseInt(quoteWeight || '0') * 850).toLocaleString('es-AR')}</div>
                             <button className="mt-3 w-full sm:w-auto px-6 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-sm rounded-lg hover:opacity-90 transition">
                               Generar Etiqueta
                             </button>
                          </div>
                        </div>
                     </div>

                     {/* Opción 2 */}
                     <div className="bg-white dark:bg-[#1A1625] border border-slate-200 dark:border-white/10 rounded-2xl p-6">
                        <div className="flex flex-col sm:flex-row gap-6 justify-between items-start sm:items-center">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-[#110E17] flex items-center justify-center border border-slate-200 dark:border-white/5 font-bold text-xl text-slate-900 dark:text-white">
                              AN
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-900 dark:text-white text-lg">Andreani B2B</h4>
                              <p className="text-slate-500 text-sm">Servicio Express Pyme</p>
                              <div className="flex items-center gap-4 mt-2">
                                <span className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> Entrega: 24-48hs</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-left sm:text-right">
                             <div className="text-xs font-bold text-slate-400 uppercase mb-1">Costo Total Estimado</div>
                             <div className="text-2xl font-bold text-slate-900 dark:text-white">${(parseInt(quoteWeight || '0') * 1200).toLocaleString('es-AR')}</div>
                             <button className="mt-3 w-full sm:w-auto px-6 py-2 bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-white/10 font-bold text-sm rounded-lg transition">
                               Generar Etiqueta
                             </button>
                          </div>
                        </div>
                     </div>

                  </motion.div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-white/50 dark:bg-[#1A1625]/50 border border-slate-200/50 dark:border-white/5 rounded-3xl border-dashed">
                    <div className="w-16 h-16 bg-slate-100 dark:bg-white/5 rounded-2xl flex items-center justify-center mb-4">
                       <MapPin className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Cotización al Instante</h3>
                    <p className="text-slate-500 text-sm max-w-sm mx-auto">Ingresa el origen, destino y peso de tu carga para obtener las tarifas de nuestros transportistas integrados.</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'transportistas' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {CARRIERS.map(carrier => (
                <div key={carrier.id} className="bg-white dark:bg-[#1A1625] border border-slate-200 dark:border-white/5 rounded-3xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-black/20 flex items-center justify-center border border-slate-200 dark:border-white/5 font-bold text-lg text-slate-900 dark:text-white">
                      {carrier.logo}
                    </div>
                    {carrier.status === 'active' ? (
                      <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full text-[10px] font-bold uppercase tracking-wider">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Vinculado
                      </span>
                    ) : (
                      <button className="px-3 py-1 bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-full text-[10px] font-bold uppercase tracking-wider transition">
                        Vincular Cuenta
                      </button>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{carrier.name}</h3>
                  <p className="text-slate-500 text-sm mb-6">{carrier.type}</p>
                  
                  <div className="pt-6 border-t border-slate-100 dark:border-white/10">
                    <div className="text-xs font-bold text-slate-400 uppercase mb-1">Tarifa Promedio</div>
                    <div className="font-medium text-slate-700 dark:text-slate-300">{carrier.rate}</div>
                  </div>
                  
                  <button className="w-full mt-6 py-2.5 bg-slate-50 dark:bg-[#110E17] hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-bold transition flex items-center justify-center gap-2">
                    <FileText className="w-4 h-4" /> Ver Tarifario Completo
                  </button>
                </div>
              ))}
              
              {/* Add New Carrier Card */}
               <div className="bg-slate-50 dark:bg-[#110E17] border border-slate-200 dark:border-white/10 border-dashed rounded-3xl p-6 flex flex-col items-center justify-center text-center opacity-70 hover:opacity-100 transition cursor-pointer group">
                  <div className="w-12 h-12 rounded-full bg-white dark:bg-[#1A1625] flex items-center justify-center border border-slate-200 dark:border-white/5 mb-4 group-hover:scale-110 transition-transform">
                     <Plus className="w-6 h-6 text-slate-400" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">Integrar Otro Transportista</h3>
                  <p className="text-slate-500 text-xs">Conecta tu cuenta de OCA, Vía Cargo, OCASA, etc.</p>
               </div>
            </motion.div>
          )}

          {activeTab === 'envios' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
               <div className="bg-white dark:bg-[#1A1625] border border-slate-200 dark:border-white/5 rounded-3xl overflow-hidden">
                  <div className="p-6 border-b border-slate-200 dark:border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                     <div className="flex gap-2 relative w-full sm:w-auto">
                        <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                        <input type="text" placeholder="Buscar por Tracking ID..." className="w-full sm:w-64 pl-12 pr-4 py-2.5 bg-slate-50 dark:bg-[#110E17] border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 text-slate-900 dark:text-white" />
                     </div>
                     <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition">
                        <ListFilter className="w-4 h-4" /> Filtrar
                     </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                       <thead className="bg-slate-50 dark:bg-[#110E17]">
                         <tr>
                           <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Tracking ID</th>
                           <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Transportista</th>
                           <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Ruta</th>
                           <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Detalles</th>
                           <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Estado</th>
                           <th className="px-6 py-4"></th>
                         </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-sm">
                         {SHIPMENTS.map((shipment) => (
                           <tr key={shipment.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                             <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{shipment.id}</td>
                             <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{shipment.carrier}</td>
                             <td className="px-6 py-4">
                                <div className="text-slate-900 dark:text-white font-medium">{shipment.from}</div>
                                <div className="text-slate-500 text-xs w-full flex items-center"><ChevronDown className="w-3 h-3 text-slate-400 ml-2" /></div>
                                <div className="text-slate-900 dark:text-white font-medium">{shipment.to}</div>
                             </td>
                             <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                                <div>{shipment.weight}</div>
                                <div className="text-xs text-slate-500">{shipment.date}</div>
                             </td>
                             <td className="px-6 py-4">
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                                  shipment.status === 'Entregado' 
                                    ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                    : 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400'
                                }`}>
                                  {shipment.status}
                                </span>
                             </td>
                             <td className="px-6 py-4 text-right">
                                <button className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                                   <ArrowRight className="w-5 h-5" />
                                </button>
                             </td>
                           </tr>
                         ))}
                       </tbody>
                    </table>
                  </div>
               </div>
            </motion.div>
          )}

          {activeTab === 'flotas' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Gestión de Flota</h2>
                <button className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-bold shadow-md shadow-orange-500/20 transition-all">
                  <Plus className="w-4 h-4" /> Nuevo Vehículo
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Vehiculo 1 */}
                <div className="bg-white dark:bg-[#1A1625] rounded-3xl p-6 border border-slate-200 dark:border-white/5 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-500/10 flex items-center justify-center">
                      <Truck className="w-6 h-6 text-orange-600 dark:text-orange-500" />
                    </div>
                    <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider text-[10px] rounded-md">
                      Operativo
                    </span>
                  </div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1">Tractor Iveco Stralis</h3>
                  <p className="text-slate-500 text-sm mb-4">Dominio: AF-123-BC</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-slate-500">Chofer:</span> <span className="font-medium text-slate-900 dark:text-white">Marcos Ruiz</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Capacidad:</span> <span className="font-medium text-slate-900 dark:text-white">28 Toneladas</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">VTV Venc.:</span> <span className="font-medium text-slate-900 dark:text-white">12/2026</span></div>
                  </div>
                </div>
                {/* Vehiculo 2 */}
                <div className="bg-white dark:bg-[#1A1625] rounded-3xl p-6 border border-slate-200 dark:border-white/5 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-500/10 flex items-center justify-center">
                      <Truck className="w-6 h-6 text-orange-600 dark:text-orange-500" />
                    </div>
                    <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider text-[10px] rounded-md">
                      Operativo
                    </span>
                  </div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1">Camión Scania G410</h3>
                  <p className="text-slate-500 text-sm mb-4">Dominio: AE-456-XY</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-slate-500">Chofer:</span> <span className="font-medium text-slate-900 dark:text-white">Juan Pérez</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Capacidad:</span> <span className="font-medium text-slate-900 dark:text-white">30 Toneladas</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">VTV Venc.:</span> <span className="font-medium text-slate-900 dark:text-white">08/2026</span></div>
                  </div>
                </div>
                {/* Vehiculo 3 */}
                <div className="bg-white dark:bg-[#1A1625] rounded-3xl p-6 border border-slate-200 dark:border-white/5 shadow-sm">
                   <div className="flex items-center justify-between mb-4">
                     <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                       <Truck className="w-6 h-6 text-slate-400" />
                     </div>
                     <span className="px-2 py-1 bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider text-[10px] rounded-md">
                       Taller
                     </span>
                   </div>
                   <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1">Furgón VW Delivery</h3>
                   <p className="text-slate-500 text-sm mb-4">Dominio: AD-789-ZW</p>
                   <div className="space-y-2 text-sm">
                     <div className="flex justify-between"><span className="text-slate-500">Chofer:</span> <span className="font-medium text-slate-900 dark:text-white">Sin asignar</span></div>
                     <div className="flex justify-between"><span className="text-slate-500">Capacidad:</span> <span className="font-medium text-slate-900 dark:text-white">9 Toneladas</span></div>
                     <div className="flex justify-between"><span className="text-slate-500">Razón:</span> <span className="font-medium text-slate-900 dark:text-white">Mantenimiento preventivo</span></div>
                   </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'rutas' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
               <h2 className="text-xl font-bold text-slate-900 dark:text-white">Calculador de Rutas y Distancias</h2>
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 <div className="bg-white dark:bg-[#1A1625] border border-slate-200 dark:border-white/5 rounded-3xl p-6">
                    <form className="space-y-5">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Punto de Partida</label>
                        <div className="relative">
                          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                          <input type="text" placeholder="Base Operativa Neuquén" className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#110E17] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Destino Final</label>
                        <div className="relative">
                          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                          <input type="text" placeholder="Ej. Yacimiento Loma Campana" className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#110E17] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Consumo Promedio (L/100km)</label>
                        <input type="number" defaultValue={32} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#110E17] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50" />
                      </div>
                      <button type="button" className="w-full py-4 bg-orange-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/20">
                         <Route className="w-5 h-5" /> Calcular Ruta
                      </button>
                    </form>
                 </div>
                 <div className="bg-slate-100 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-3xl p-6 flex flex-col justify-center items-center text-center">
                    <Navigation2 className="w-16 h-16 text-slate-300 dark:text-slate-700 mb-4" />
                    <h3 className="text-lg font-bold text-slate-500 dark:text-slate-400 mb-2">Sin ruta calculada</h3>
                    <p className="text-sm text-slate-400 dark:text-slate-500 max-w-sm">Ingresa los puntos de partida y destino para obtener distancias, tiempos estimados y costos logísticos aproximados de combustible.</p>
                 </div>
               </div>
            </motion.div>
          )}

          {activeTab === 'guias' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Guías de Remisión Electrónicas</h2>
                <button className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-bold shadow-md shadow-orange-500/20 transition-all">
                  <Plus className="w-4 h-4" /> Nueva Guía
                </button>
              </div>
              
              <div className="bg-white dark:bg-[#1A1625] rounded-3xl p-6 border border-slate-200 dark:border-white/5 shadow-sm overflow-x-auto">
                 <table className="w-full text-left">
                    <thead className="bg-slate-50 dark:bg-[#110E17]">
                      <tr>
                        <th className="px-4 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Nº Documento</th>
                        <th className="px-4 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Fecha</th>
                        <th className="px-4 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Cliente remitente</th>
                        <th className="px-4 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Chofer Asignado</th>
                        <th className="px-4 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-sm">
                      <tr className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                        <td className="px-4 py-4 font-bold text-slate-900 dark:text-white">GR-002341</td>
                        <td className="px-4 py-4 text-slate-500">22 Oct, 2026</td>
                        <td className="px-4 py-4 font-medium text-slate-900 dark:text-white">PetroSur Energía</td>
                        <td className="px-4 py-4 text-slate-600 dark:text-slate-400">Marcos Ruiz</td>
                        <td className="px-4 py-4">
                           <span className="px-2 py-1 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-bold uppercase tracking-wider rounded-md">En curso</span>
                        </td>
                      </tr>
                      <tr className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                        <td className="px-4 py-4 font-bold text-slate-900 dark:text-white">GR-002340</td>
                        <td className="px-4 py-4 text-slate-500">21 Oct, 2026</td>
                        <td className="px-4 py-4 font-medium text-slate-900 dark:text-white">Constructora Andina</td>
                        <td className="px-4 py-4 text-slate-600 dark:text-slate-400">Juan Pérez</td>
                        <td className="px-4 py-4">
                           <span className="px-2 py-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-wider rounded-md">Finalizada</span>
                        </td>
                      </tr>
                    </tbody>
                 </table>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
