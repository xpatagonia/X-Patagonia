import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Building2, MapPin, Briefcase, Users, Plus, Check, Save, UserPlus, X, Tag } from 'lucide-react';
import { MAIN_CATEGORIES, INDUSTRIAL_CATEGORIES } from '../lib/categories';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

export default function CompanyProfile() {
  const [formData, setFormData] = useState({
    companyName: '',
    description: '',
    address: '',
    province: 'Chubut',
    city: 'Comodoro Rivadavia'
  });

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSubcategories, setSelectedSubcategories] = useState<Record<string, string[]>>({});
  const [showCategorySelect, setShowCategorySelect] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [users, setUsers] = useState([
    { id: 1, email: 'admin@empresa.com', role: 'Administrador' }
  ]);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState('Gestión');

  useEffect(() => {
    const fetchUser = async () => {
      // Small timeout to allow auth to initialize if we just arrived
      const unsubscribe = auth.onAuthStateChanged(async (user) => {
        if (user) {
          const docRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setFormData(prev => ({
              companyName: data.companyName || '',
              description: data.description || '',
              address: data.address || '',
              province: data.province || 'Chubut',
              city: data.city || 'Comodoro Rivadavia'
            }));
            
            if (data.categories) {
              setSelectedCategories(data.categories);
            } else if (data.category) {
               setSelectedCategories([data.category]);
            }
            if (data.subcategories) {
              setSelectedSubcategories(data.subcategories);
            }
          }
        }
      });
      return () => unsubscribe();
    };
    fetchUser();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => {
      if (prev.includes(category)) {
        const next = prev.filter(c => c !== category);
        const { [category]: removed, ...rest } = selectedSubcategories;
        setSelectedSubcategories(rest);
        return next;
      } else {
        return [...prev, category];
      }
    });
  };

  const toggleSubcategory = (category: string, sub: string) => {
    setSelectedSubcategories(prev => {
      const current = prev[category] || [];
      if (current.includes(sub)) {
        return { ...prev, [category]: current.filter(s => s !== sub) };
      } else {
        return { ...prev, [category]: [...current, sub] };
      }
    });
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (newUserEmail) {
      setUsers([...users, { id: Date.now(), email: newUserEmail, role: newUserRole }]);
      setNewUserEmail('');
      setNewUserRole('Gestión');
    }
  };

  const handleRemoveUser = (id: number) => {
    setUsers(users.filter(u => u.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) {
      alert('Debes iniciar sesión para guardar.');
      return;
    }
    
    setIsSaving(true);
    try {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userRef, {
        companyName: formData.companyName,
        description: formData.description,
        address: formData.address,
        province: formData.province,
        city: formData.city,
        categories: selectedCategories,
        subcategories: selectedSubcategories,
        category: selectedCategories.length > 0 ? selectedCategories[0] : ''
      });
      alert('Perfil de empresa actualizado exitosamente.');
    } catch (error) {
      console.error(error);
      alert('Error al guardar el perfil.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0A080C] pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-2">Perfil de Empresa</h1>
          <p className="text-slate-600 dark:text-slate-400">
            Completa la información de tu organización para mejorar la visibilidad en la Patagonia y añadir a tu equipo.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Información Principal */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-[#1A1625] rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200 dark:border-white/10"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-500/10 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-orange-600 dark:text-orange-500" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Datos de la Empresa</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
                    Razón Social / Nombre Comercial
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-orange-500/50 outline-none transition-all text-slate-900 dark:text-white"
                    placeholder="Ej. Patagonia Energética S.A."
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
                    Descripción
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-orange-500/50 outline-none transition-all text-slate-900 dark:text-white resize-none"
                    placeholder="Breve descripción de los servicios y especialidades de la empresa..."
                  />
                </div>
              </div>
            </motion.div>

            {/* Rubricación Múltiple */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-[#1A1625] rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200 dark:border-white/10"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-500/10 flex items-center justify-center">
                    <Briefcase className="w-5 h-5 text-purple-600 dark:text-purple-500" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">Rubricación Múltiple</h2>
                </div>
                <button 
                  onClick={() => setShowCategorySelect(!showCategorySelect)}
                  className="text-sm font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1 hover:underline"
                >
                  <Plus className="w-4 h-4" /> Agregar
                </button>
              </div>

              {showCategorySelect && (
                <div className="mb-6 p-4 bg-slate-50 dark:bg-black/20 rounded-xl border border-slate-200 dark:border-white/10">
                  <p className="text-xs font-medium text-slate-500 mb-3">Selecciona los sectores donde tu empresa opera:</p>
                  <div className="flex flex-wrap gap-2">
                    {MAIN_CATEGORIES.map(cat => {
                      const isSelected = selectedCategories.includes(cat);
                      return (
                        <button
                          key={cat}
                          onClick={() => toggleCategory(cat)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            isSelected 
                              ? 'bg-purple-500 text-white shadow-md' 
                              : 'bg-white dark:bg-[#1A1625] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/10 hover:border-purple-500'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 inline-block mr-1" />}
                          {cat}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {selectedCategories.length > 0 ? (
                <div className="flex flex-col gap-4 mt-4">
                  {selectedCategories.map(cat => (
                    <div key={cat} className="p-4 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl">
                      <div className="flex items-center justify-between mb-3">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 rounded-lg text-sm font-bold tracking-tight">
                          {cat}
                        </span>
                        <button onClick={() => toggleCategory(cat)} className="text-slate-400 hover:text-red-500 transition-colors">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      
                      {/* Subcategories */}
                      <p className="text-xs font-medium text-slate-500 mb-2">Selecciona las subcategorías / servicios específicos:</p>
                      <div className="flex flex-wrap gap-2">
                        {(INDUSTRIAL_CATEGORIES[cat as keyof typeof INDUSTRIAL_CATEGORIES] || []).map(sub => {
                          const isSubSelected = (selectedSubcategories[cat] || []).includes(sub);
                          return (
                            <button
                              key={sub}
                              onClick={() => toggleSubcategory(cat, sub)}
                              className={`flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-md transition-colors ${isSubSelected ? 'bg-orange-500 text-white' : 'bg-white dark:bg-white/5 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/10 hover:border-orange-500/30'}`}
                            >
                              <Tag className="w-3 h-3" /> {sub}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">No has seleccionado ningún rubro. Las empresas con al menos un rubro reciben más oportunidades.</p>
              )}
            </motion.div>

            {/* Geolocalización */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-[#1A1625] rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200 dark:border-white/10"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-emerald-600 dark:text-emerald-500" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Geolocalización</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
                    Provincia
                  </label>
                  <select
                    name="province"
                    value={formData.province}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all text-slate-900 dark:text-white appearance-none"
                  >
                    <option>Chubut</option>
                    <option>Santa Cruz</option>
                    <option>Río Negro</option>
                    <option>Neuquén</option>
                    <option>Tierra del Fuego</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
                    Ciudad / Localidad
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all text-slate-900 dark:text-white"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
                    Dirección (Operaciones o Base)
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all text-slate-900 dark:text-white"
                    placeholder="Parque Industrial, Ruta 3 Km..."
                  />
                </div>
              </div>
              
              <div className="mt-6 aspect-video max-h-[200px] bg-slate-100 dark:bg-black/40 rounded-xl border border-slate-200 dark:border-white/5 flex items-center justify-center relative overflow-hidden">
                {/* Simulated Map View */}
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cartographer.png')] opacity-30 mix-blend-overlay"></div>
                <div className="text-center">
                  <MapPin className="w-8 h-8 text-emerald-500 mx-auto mb-2 drop-shadow-md" />
                  <p className="text-xs font-medium text-slate-500">Punto de ubicación simulado</p>
                </div>
              </div>
            </motion.div>

            <button 
              onClick={handleSubmit}
              disabled={isSaving}
              className="w-full py-4 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white rounded-xl font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20"
            >
              <Save className={`w-5 h-5 ${isSaving ? 'animate-pulse' : ''}`} /> 
              {isSaving ? 'Guardando...' : 'Guardar Perfil de Empresa'}
            </button>
          </div>

          {/* Dependientes / Usuarios */}
          <div className="space-y-8">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-[#1A1625] rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200 dark:border-white/10 sticky top-24"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600 dark:text-blue-500" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Usuarios del Panel</h2>
              </div>
              <p className="text-sm text-slate-500 mb-6">
                Agrega a miembros de tu equipo (vendedores, operarios) para que puedan responder solicitudes RFQ.
              </p>

              <div className="space-y-4 mb-6">
                {users.map(user => (
                  <div key={user.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-[#110E17] rounded-xl border border-slate-200 dark:border-white/5">
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white mb-0.5">{user.email}</p>
                      <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">{user.role}</p>
                    </div>
                    {user.role !== 'Administrador' && (
                      <button onClick={() => handleRemoveUser(user.id)} className="text-slate-400 hover:text-red-500 transition-colors p-1 rounded-md hover:bg-red-50 dark:hover:bg-red-500/10">
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
                  Invitar Nuevo Miembro
                </label>
                <form onSubmit={handleAddUser} className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="email"
                      required
                      value={newUserEmail}
                      onChange={(e) => setNewUserEmail(e.target.value)}
                      placeholder="email@empresa.com"
                      className="flex-1 px-3 py-2 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500/50 outline-none text-sm text-slate-900 dark:text-white"
                    />
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={newUserRole}
                      onChange={(e) => setNewUserRole(e.target.value)}
                      className="flex-1 px-3 py-2 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500/50 outline-none text-sm text-slate-900 dark:text-white appearance-none"
                    >
                      <option value="Administrador">Administrador</option>
                      <option value="Gestión">Gestión</option>
                      <option value="E-commerce">E-commerce</option>
                    </select>
                    <button type="submit" disabled={!newUserEmail} className="px-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm font-bold">
                      <UserPlus className="w-4 h-4" /> Agregar
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
