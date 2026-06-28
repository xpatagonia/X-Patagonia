import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, Truck, PackageCheck, Box, Settings, Shield, Zap, ChevronRight, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { db, auth } from '../lib/firebase';
import { doc, getDoc, setDoc, collection } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import CheckoutModal from '../components/CheckoutModal';

const APPS = [
  {
    id: 'logistica',
    name: 'Logística Integral y Transporte',
    description: 'Integra proveedores de transporte y carga para obtener cotizaciones automáticas según peso, volumen y destino.',
    icon: Truck,
    category: 'Operaciones',
    status: 'available', // available, installed
    price: '$29.900/mes',
    features: [
      'Calculadora de fletes en tiempo real',
      'Integración con Cruz del Sur, Andreani B2B',
      'Seguimiento de flota en mapa',
      'Emisión de cartas de porte'
    ]
  },
  {
    id: 'warehousing',
    name: 'Warehousing & Almacenamiento',
    description: 'Gestión de inventario remoto, alquiler de pallets y metros cuadrados en parques industriales.',
    icon: PackageCheck,
    category: 'Infraestructura',
    status: 'available',
    price: '$45.000/mes',
    features: [
      'Visualización de stock remoto',
      'Alertas de inventario mínimo',
      'Gestión de turnos de carga/descarga',
      'Póliza de seguro integrada'
    ]
  },
  {
    id: 'ecommerce',
    name: 'Gestión de E-commerce B2B',
    description: 'Catálogo de productos fabricados, cumplimiento de normas y gestión de pedidos B2B.',
    icon: Shield,
    category: 'Ventas',
    status: 'installed',
    price: 'Gratis en plan actual',
    features: [
      'Catálogo de productos',
      'Cumplimiento de normativas',
      'Gestión de pedidos mayoristas'
    ]
  }
];

export default function AppStore() {
  const [apps, setApps] = useState(APPS);
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const defaultLocalApps = () => {
      const saved = localStorage.getItem('installedModules');
      if (saved) {
        try {
          const installedIds = JSON.parse(saved);
          setApps(prev => prev.map(app => ({
            ...app,
            status: installedIds.includes(app.id) ? 'installed' : app.status
          })));
        } catch (e) {
          console.error(e);
        }
      }
    };

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const docRef = doc(db, 'users', currentUser.uid, 'settings', 'modules');
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            const installedIds = data.installed || [];
            // Override localStorage logic with backend logic
            setApps(APPS.map(app => ({
              ...app,
              status: installedIds.includes(app.id) ? 'installed' : app.status
            })));
            localStorage.setItem('installedModules', JSON.stringify(installedIds));
          } else {
             defaultLocalApps();
          }
        } catch (error) {
          console.error('Error fetching settings:', error);
          defaultLocalApps();
        }
      } else {
        defaultLocalApps();
      }
    });

    return () => unsubscribe();
  }, []);

  const initiateCheckout = () => {
    if (!user) {
      alert("Debes iniciar sesión para contratar módulos.");
      return;
    }
    setIsCheckoutOpen(true);
  };

  const handleConfirmPayment = async (paymentMethod: string) => {
    if (!user || !selectedApp) return;

    try {
      // Create request in module_requests
      const reqRef = doc(collection(db, 'module_requests'));
      await setDoc(reqRef, {
        userId: user.uid,
        moduleId: selectedApp.id,
        moduleName: selectedApp.name,
        status: 'pending',
        paymentMethod: paymentMethod,
        createdAt: new Date().toISOString()
      });

      alert(`Pago confirmado. Su solicitud de suscripción a ${selectedApp.name} está bajo revisión.`);
      setIsCheckoutOpen(false);
      setSelectedApp(null);
    } catch (error) {
       console.error('Error requesting module:', error);
       alert("Error al procesar la solicitud.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0A080C] pt-24 pb-12">
      <div className="max-w-6xl mx-auto px-6">
        <div className="mb-10">
          <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-2">Módulos y Mejoras</h1>
          <p className="text-slate-600 dark:text-slate-400">
            Escala las capacidades de tu cuenta instalando aplicaciones y servicios integrados a tu ecosistema B2B.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {apps.map((app) => (
            <motion.div 
              key={app.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-[#1A1625] rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-white/10 flex flex-col h-full"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center">
                  <app.icon className="w-6 h-6 text-orange-500" />
                </div>
                {app.status === 'installed' ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 rounded-md text-[10px] font-bold uppercase tracking-wider">
                    <CheckCircle className="w-3 h-3" /> Instalada
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-1 bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-400 rounded-md text-[10px] font-bold uppercase tracking-wider">
                    {app.category}
                  </span>
                )}
              </div>
              
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{app.name}</h3>
              <p className="text-sm text-slate-500 mb-6 flex-1">{app.description}</p>
              
              <div className="pt-6 border-t border-slate-100 dark:border-white/10 mt-auto">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Precio</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">{app.price}</span>
                </div>
                
                {app.status === 'installed' ? (
                  <button 
                    onClick={() => {
                      if (app.id === 'logistica') navigate('/logistica');
                      else if (app.id === 'warehousing') navigate('/warehousing');
                      else navigate('/dashboard');
                    }}
                    className="w-full py-3 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-900 dark:text-white rounded-xl text-sm font-bold transition flex items-center justify-center gap-2"
                  >
                    <Settings className="w-4 h-4" /> Configurar / Abrir
                  </button>
                ) : (
                  <button 
                    onClick={() => setSelectedApp(app)}
                    className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20"
                  >
                    Ver Detalles
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {selectedApp && (
          <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" 
              onClick={() => setSelectedApp(null)} 
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-2xl z-[9999] bg-white dark:bg-[#1A1625] rounded-3xl shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-orange-100 dark:bg-orange-500/10 flex items-center justify-center shrink-0">
                    <selectedApp.icon className="w-8 h-8 text-orange-500" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-orange-500 mb-1 block">{selectedApp.category}</span>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{selectedApp.name}</h2>
                    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{selectedApp.description}</p>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-black/20 rounded-2xl p-6 mb-6 border border-slate-200 dark:border-white/5">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 uppercase tracking-wider">Características Inclusas</h3>
                  <ul className="space-y-3">
                    {selectedApp.features.map((feature: string, i: number) => (
                      <li key={i} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-emerald-500 shrink-0" />
                        <span className="text-slate-700 dark:text-slate-300 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {(selectedApp.id === 'logistica' || selectedApp.id === 'warehousing') && (
                  <div className="mb-6">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 uppercase tracking-wider">Proveedores Integrados y Tarifas (Demo)</h3>
                    <div className="border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 dark:bg-[#110E17] border-b border-slate-200 dark:border-white/10 text-xs text-slate-500">
                          <tr>
                            <th className="px-4 py-3 font-semibold">Proveedor</th>
                            <th className="px-4 py-3 font-semibold">Servicio</th>
                            <th className="px-4 py-3 font-semibold text-right">Tarifa Base</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedApp.id === 'logistica' ? (
                            <>
                              <tr className="border-b border-slate-100 dark:border-white/5">
                                <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">Cruz del Sur</td>
                                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Carga General Patagonia</td>
                                <td className="px-4 py-3 text-right font-medium text-slate-900 dark:text-amber-500">$850 / kg</td>
                              </tr>
                              <tr className="border-b border-slate-100 dark:border-white/5">
                                <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">Andreani B2B</td>
                                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Paquetería Express</td>
                                <td className="px-4 py-3 text-right font-medium text-slate-900 dark:text-amber-500">$12.000 / bulto</td>
                              </tr>
                            </>
                          ) : (
                            <>
                              <tr className="border-b border-slate-100 dark:border-white/5">
                                <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">Parque Ind. Comodoro</td>
                                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Posición Pallet Mensual</td>
                                <td className="px-4 py-3 text-right font-medium text-slate-900 dark:text-amber-500">$18.500 / pos</td>
                              </tr>
                              <tr className="border-b border-slate-100 dark:border-white/5">
                                <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">Almacenes del Sur Neuquén</td>
                                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Bodega Techada 50m2</td>
                                <td className="px-4 py-3 text-right font-medium text-slate-900 dark:text-amber-500">$250.000 / mes</td>
                              </tr>
                            </>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 md:px-8 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#110E17] flex justify-between items-center gap-4">
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-1">Inversión Mensual</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{selectedApp.price}</p>
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={() => setSelectedApp(null)}
                    className="px-6 py-3 font-bold text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={initiateCheckout}
                    className="flex items-center px-6 py-3 bg-gradient-to-r from-orange-500 to-purple-600 hover:opacity-90 text-white font-bold text-sm rounded-xl transition"
                  >
                    Contratar e Instalar
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {selectedApp && (
        <CheckoutModal 
          isOpen={isCheckoutOpen} 
          onClose={() => setIsCheckoutOpen(false)} 
          onConfirm={handleConfirmPayment}
          moduleName={selectedApp.name}
          price={selectedApp.price}
        />
      )}
    </div>
  );
}
