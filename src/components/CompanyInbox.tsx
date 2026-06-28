import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Inbox, CheckCircle, Clock, ChevronRight, MessageSquare, AlertCircle, Send, Users, Plus, Mail, Phone, Building, Tag, Search, FileText, UserCircle, Globe, FileBadge, MessageCircle, Hash, MapPin } from 'lucide-react';
import { db, auth } from '../lib/firebase';
import { collection, onSnapshot, addDoc, serverTimestamp, doc, updateDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

export default function CompanyInbox() {
  const [activeSection, setActiveSection] = useState<'inbox' | 'crm' | 'templates'>('inbox');

  const [rfqs, setRfqs] = useState<any[]>([]);

  const [selectedRfq, setSelectedRfq] = useState<any>(null);

  const [contacts, setContacts] = useState<any[]>([]);
  const [contactSearch, setContactSearch] = useState('');
  const [showAddContact, setShowAddContact] = useState(false);
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [newContact, setNewContact] = useState({
    entityType: 'contact',
    name: '',
    company: '',
    role: '',
    email: '',
    phone: '',
    type: 'external',
    status: 'lead',
    website: '',
    cuitRut: '',
    socialMedia: '',
    industry: '',
    location: ''
  });

  const [replyText, setReplyText] = useState("");
  const [showTemplates, setShowTemplates] = useState(false);
  const [templates, setTemplates] = useState<any[]>([
    { id: '1', label: 'Envío de Cotización', content: 'Estimados,\n\nAdjuntamos nuestra cotización formal. Los productos se encuentran en stock con disponibilidad inmediata.\n\nQuedamos a su entera disposición.' },
    { id: '2', label: 'Solicitar Información', content: 'Estimados,\n\nPara poder avanzar con la cotización requerimos información técnica adicional o detalles de entrega.\n\nEsperamos sus comentarios.' },
    { id: '3', label: 'Aviso de Sin Stock', content: 'Estimados,\n\nLamentablemente en esta oportunidad no contamos con stock para cumplir con la solicitud en los plazos indicados.\n\nAgradecemos tenernos en cuenta.' },
    { id: '4', label: 'Mensaje de Bienvenida/Registro', content: 'Estimados,\n\nGracias por registrarse en nuestra plataforma. A partir de ahora recibirán nuestras notificaciones y cotizaciones de forma directa.\n\nSaludos.' },
    { id: '5', label: 'Firma Automática', content: '\n\n--\nDepartamento de Ventas\nventas@nuestraempresa.com.ar\n+54 9 11 1234-5678\nNuestra Empresa S.A.' }
  ]);
  const [showAddTemplate, setShowAddTemplate] = useState(false);
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [newTemplate, setNewTemplate] = useState({ label: '', content: '' });

  const [showCompose, setShowCompose] = useState(false);
  const [composeData, setComposeData] = useState({ to: '', subject: '', body: '' });
  const [composeShowTemplates, setComposeShowTemplates] = useState(false);

  // Extract unique companies from existing contacts
  const uniqueCompanies = Array.from(
    new Set(
      contacts.map(c => c.entityType === 'company' ? c.name : c.company).filter(Boolean)
    )
  ).sort();

  useEffect(() => {
    let unsubscribeContacts: () => void;
    let unsubscribeRfqs: () => void;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setContacts([]);
        setRfqs([]);
        return;
      }

      // Contacts listener
      unsubscribeContacts = onSnapshot(collection(db, 'crm_contacts'), (snapshot) => {
        if (snapshot.empty) {
          const initialContacts = [
            { name: 'Carlos Mendoza', company: 'PetroSur Energía S.A.', role: 'Jefe de Compras', email: 'cmendoza@petrosur.com.ar', phone: '+54 9 11 1234-5678', type: 'external', status: 'active', createdAt: serverTimestamp() },
            { name: 'Laura Gómez', company: 'Constructora Austral', role: 'Gerente de Proyectos', email: 'lgomez@caustral.com.ar', phone: '+54 9 299 456-7890', type: 'external', status: 'lead', createdAt: serverTimestamp() },
            { name: 'Martín Suárez', company: 'Nuestra Empresa', role: 'Ejecutivo de Cuentas B2B', email: 'msuarez@empresa.com', phone: '+54 9 11 9876-5432', type: 'internal', status: 'active', createdAt: serverTimestamp() },
          ];
          initialContacts.forEach(contact => {
            addDoc(collection(db, 'crm_contacts'), { ...contact, userId: user.uid });
          });
        } else {
          const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setContacts(data);
        }
      });

      // RFQs listener
      unsubscribeRfqs = onSnapshot(collection(db, 'crm_rfqs'), (snapshot) => {
        if (snapshot.empty) {
          // Seed RFQs
          const initialRfqs = [
            { rfqId: '10042', buyer: 'PetroSur Energía S.A.', title: 'Provisión Válvulas Esféricas Brida ANSI 150', status: 'new', dateString: 'Hace 2 horas', priority: 'high', unread: true, createdAt: serverTimestamp() },
            { rfqId: '10038', buyer: 'Constructora Austral', title: 'Equipamiento de Protección Personal (EPP)', status: 'replied', dateString: 'Ayer', priority: 'medium', unread: false, createdAt: serverTimestamp() },
            { rfqId: '10031', buyer: 'Hidrodinámica Global', title: 'Bombas multietapa y repuestos', status: 'awarded', dateString: '12 Jun 2026', priority: 'low', unread: false, createdAt: serverTimestamp() },
          ];
          initialRfqs.forEach(rfq => {
            addDoc(collection(db, 'crm_rfqs'), { ...rfq, userId: user.uid });
          });
        } else {
          const data = snapshot.docs.map(doc => ({ 
            id: doc.id, 
            idDisplay: doc.data().rfqId, 
            ...doc.data() 
          }));
          setRfqs(data);
        }
      });
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeContacts) unsubscribeContacts();
      if (unsubscribeRfqs) unsubscribeRfqs();
    };
  }, []);

  const [selectedContactIds, setSelectedContactIds] = useState<string[]>([]);
  const [editingContactId, setEditingContactId] = useState<string | null>(null);

  const toggleContactSelection = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedContactIds(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedContactIds(filteredContacts.map(c => c.id));
    } else {
      setSelectedContactIds([]);
    }
  };

  const handleBulkDelete = async () => {
    if (!selectedContactIds.length) return;
    if (window.confirm(`¿Estás seguro/a de eliminar ${selectedContactIds.length} registro(s)?`)) {
      setIsSaving(true);
      try {
        const batch = writeBatch(db);
        selectedContactIds.forEach(id => {
          batch.delete(doc(db, 'crm_contacts', id));
        });
        await batch.commit();
        setSelectedContactIds([]);
        if (selectedContactIds.includes(selectedContact?.id)) {
          setSelectedContact(null);
        }
      } catch (err) {
        console.error("Error bulk deleting contacts", err);
      }
      setIsSaving(false);
    }
  };

  const handleDeleteIndividual = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (window.confirm('¿Estás seguro de eliminar este registro?')) {
      try {
        await deleteDoc(doc(db, 'crm_contacts', id));
        if (selectedContact?.id === id) setSelectedContact(null);
        setSelectedContactIds(prev => prev.filter(c => c !== id));
      } catch (err) {
        console.error("Error deleting contact", err);
      }
    }
  };

  const handleSaveContact = async () => {
    if (!newContact.name || !auth.currentUser) return;
    if (newContact.entityType === 'contact' && !newContact.company) return;
    
    setIsSaving(true);
    try {
      if (editingContactId) {
        await updateDoc(doc(db, 'crm_contacts', editingContactId), {
           ...newContact
        });
      } else {
        await addDoc(collection(db, 'crm_contacts'), {
          ...newContact,
          userId: auth.currentUser.uid,
          createdAt: serverTimestamp()
        });
      }
      setShowAddContact(false);
      setEditingContactId(null);
      setNewContact({ entityType: 'contact', name: '', company: '', role: '', email: '', phone: '', type: 'external', status: 'lead', website: '', cuitRut: '', socialMedia: '', industry: '', location: '' });
    } catch (err) {
      console.error("Error saving contact", err);
    }
    setIsSaving(false);
  };

  const startEditContact = (c: any, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingContactId(c.id);
    setNewContact({
      entityType: c.entityType || 'contact',
      name: c.name || '',
      company: c.company || '',
      role: c.role || '',
      email: c.email || '',
      phone: c.phone || '',
      type: c.type || 'external',
      status: c.status || 'lead',
      website: c.website || '',
      cuitRut: c.cuitRut || '',
      socialMedia: c.socialMedia || '',
      industry: c.industry || '',
      location: c.location || ''
    });
    setShowAddContact(true);
  };

  const filteredContacts = contacts.filter(c =>  
    (c.name || '').toLowerCase().includes(contactSearch.toLowerCase()) || 
    (c.company || '').toLowerCase().includes(contactSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white dark:bg-[#1A1625] px-6 py-6 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-500" /> CRM
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Gestiona tus solicitudes de cotización comerciales y tu agenda de contactos.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <div className="flex gap-2 w-full sm:w-auto bg-slate-100 dark:bg-black/20 p-1.5 rounded-xl">
            <button
              onClick={() => setActiveSection('inbox')}
              className={`px-4 py-2 flex items-center gap-2 rounded-lg text-sm font-bold transition flex-1 sm:flex-none justify-center ${activeSection === 'inbox' ? 'bg-white dark:bg-[#1A1625] text-purple-600 dark:text-purple-400 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
            >
              <Inbox className="w-4 h-4" /> Oportunidades
            </button>
            <button
              onClick={() => setActiveSection('crm')}
              className={`px-4 py-2 flex items-center gap-2 rounded-lg text-sm font-bold transition flex-1 sm:flex-none justify-center ${activeSection === 'crm' ? 'bg-white dark:bg-[#1A1625] text-purple-600 dark:text-purple-400 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
            >
              <UserCircle className="w-4 h-4" /> Contactos
            </button>
            <button
              onClick={() => setActiveSection('templates')}
              className={`px-4 py-2 flex items-center gap-2 rounded-lg text-sm font-bold transition flex-1 sm:flex-none justify-center ${activeSection === 'templates' ? 'bg-white dark:bg-[#1A1625] text-purple-600 dark:text-purple-400 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
            >
              <FileText className="w-4 h-4" /> Plantillas
            </button>
          </div>
          <button 
            onClick={() => { setComposeData({ to: '', subject: '', body: templates.find(t => t.label === 'Firma Automática')?.content || '' }); setShowCompose(true); }}
            className="w-full sm:w-auto px-4 py-2.5 bg-purple-500 hover:bg-purple-600 text-white rounded-xl text-sm font-bold transition flex justify-center items-center gap-2 shadow-lg shadow-purple-500/20"
          >
            <MessageSquare className="w-4 h-4" /> Redactar
          </button>
        </div>
      </div>

      {activeSection === 'inbox' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Inbox List */}
          <div className="lg:col-span-1 bg-white dark:bg-[#110E17] border border-slate-200 dark:border-white/5 rounded-2xl overflow-hidden h-[600px] flex flex-col">
            <div className="p-4 border-b border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/5 flex justify-between items-center">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm uppercase tracking-wider">Solicitudes Recibidas</h3>
              <div className="bg-orange-100 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 font-bold px-2 py-1 rounded-md text-xs flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> 1 Nueva
              </div>
            </div>
            <div className="overflow-y-auto flex-1 select-none">
              {rfqs.map(rfq => (
                <div 
                  key={rfq.id}
                  onClick={() => {
                    setSelectedRfq(rfq);
                    setRfqs(rfqs.map(r => r.id === rfq.id ? { ...r, unread: false } : r));
                    setReplyText(templates.find(t => t.label === 'Firma Automática')?.content || '');
                  }}
                  className={`p-4 border-b border-slate-100 dark:border-white/5 cursor-pointer transition-colors ${selectedRfq?.id === rfq.id ? 'bg-purple-50 dark:bg-purple-500/10 border-l-4 border-l-purple-500' : 'hover:bg-slate-50 dark:hover:bg-white/[0.02] border-l-4 border-l-transparent'}`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-white/10 px-2 py-0.5 rounded">RFQ #{rfq.rfqId || rfq.idDisplay}</span>
                    <span className="text-[10px] text-slate-400 font-medium">{rfq.dateString || rfq.date}</span>
                  </div>
                  <h4 className={`text-sm mb-1 line-clamp-1 ${rfq.unread ? 'font-bold text-slate-900 dark:text-white' : 'font-medium text-slate-700 dark:text-slate-300'}`}>
                    {rfq.title}
                  </h4>
                  <p className="text-xs text-slate-500 truncate mb-2">{rfq.buyer}</p>
                  <div className="flex items-center gap-2">
                    {rfq.status === 'new' && <span className="text-[10px] uppercase tracking-wider font-bold text-orange-500 flex items-center gap-1"><Clock className="w-3 h-3" /> Pendiente</span>}
                    {rfq.status === 'replied' && <span className="text-[10px] uppercase tracking-wider font-bold text-purple-500 flex items-center gap-1"><MessageSquare className="w-3 h-3" /> Cotizado</span>}
                    {rfq.status === 'awarded' && <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-500 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Adjudicado</span>}
                    {rfq.priority === 'high' && <span className="ml-auto flex h-2 w-2 rounded-full bg-red-500"></span>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Message Thread */}
          <div className="lg:col-span-2 bg-white dark:bg-[#110E17] border border-slate-200 dark:border-white/5 rounded-2xl flex flex-col h-[600px] overflow-hidden">
            {selectedRfq ? (
              <>
                {/* Thread Header */}
                <div className="p-6 border-b border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-[#1A1625]">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{selectedRfq.title}</h3>
                      <p className="text-sm text-slate-500 font-medium">{selectedRfq.buyer}</p>
                    </div>
                    <span className="bg-white dark:bg-black/20 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10 px-3 py-1.5 rounded-lg text-xs font-bold font-mono">
                      RFQ #{selectedRfq.rfqId || selectedRfq.idDisplay || selectedRfq.id}
                    </span>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="flex flex-col bg-white dark:bg-[#110E17] border border-slate-200 dark:border-white/10 rounded-lg p-3 w-1/3">
                      <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1">Estado</span>
                      <span className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                        {selectedRfq.status === 'new' ? <span className="text-orange-500">Pendiente Cotización</span> : selectedRfq.status === 'replied' ? <span className="text-purple-500">Cotización Enviada</span> : <span className="text-emerald-500">Adjudicado</span>}
                      </span>
                    </div>
                    <div className="flex flex-col bg-white dark:bg-[#110E17] border border-slate-200 dark:border-white/10 rounded-lg p-3 w-1/3">
                      <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1">Prioridad</span>
                      <span className="text-sm font-semibold text-slate-900 dark:text-white capitalize">{selectedRfq.priority === 'high' ? 'Alta / Urgente' : selectedRfq.priority === 'medium' ? 'Media' : 'Baja'}</span>
                    </div>
                    <div className="flex flex-col bg-white dark:bg-[#110E17] border border-slate-200 dark:border-white/10 rounded-lg p-3 w-1/3 text-right items-end justify-center">
                      {selectedRfq.status === 'new' && (
                        <button className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold rounded shadow transition hover:opacity-90">
                          Marcar como Leído
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Thread Body */}
                <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-slate-50 dark:bg-[#110E17]">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-white/10 flex items-center justify-center shrink-0 font-bold text-slate-600 dark:text-slate-300">
                      {selectedRfq.buyer.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="bg-white dark:bg-[#1A1625] border border-slate-200 dark:border-white/5 rounded-2xl rounded-tl-sm p-4 shadow-sm">
                        <div className="flex justify-between items-end mb-2">
                          <span className="text-xs font-bold text-slate-900 dark:text-white">{selectedRfq.buyer}</span>
                          <span className="text-[10px] text-slate-400">{selectedRfq.dateString || selectedRfq.date}</span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                          Estimados,<br/><br/>
                          Por medio de la presente, solicitamos cotización para los ítems detallados: {selectedRfq.title}.<br/>
                          <strong>Requerimientos:</strong><br/>
                          - Entrega en Base Neuquén antes del día 25.<br/>
                          - Cotizar en Pesos Argentinos o USD Oficial.<br/>
                          - Incluir hoja técnica.<br/><br/>
                          Aguardamos sus comentarios.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {selectedRfq.status !== 'new' && (
                    <div className="flex gap-4 flex-row-reverse">
                      <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center shrink-0 font-bold text-purple-600 dark:text-purple-400">
                        TÚ
                      </div>
                      <div className="flex-1">
                        <div className="bg-purple-500 text-white rounded-2xl rounded-tr-sm p-4 shadow-sm">
                          <div className="flex justify-between items-end mb-2">
                            <span className="text-xs font-bold">Tu Empresa</span>
                            <span className="text-[10px] opacity-80">Hace 1 día</span>
                          </div>
                          <p className="text-sm leading-relaxed">
                            Buenas tardes,<br/><br/>
                            Adjuntamos nuestra propuesta formal nro #49122 con disponibilidad inmediata de los insumos en nuestras bodegas.<br/>
                            El valor total estimado asciende a $4.500.000 + IVA.<br/><br/>
                            Saludos cordiales.
                          </p>
                          <div className="mt-3 bg-black/10 rounded p-3 flex items-center gap-3">
                            <FileText className="w-4 h-4" />
                            <span className="text-xs font-bold">Cotizacion_49122.pdf</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Reply Box */}
                <div className="p-4 border-t border-slate-200 dark:border-white/5 bg-white dark:bg-[#1A1625] flex flex-col gap-3 relative">
                  <div className="flex gap-2 mb-1">
                    <button 
                      onClick={() => setShowTemplates(!showTemplates)}
                      className="text-xs font-bold px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 transition flex items-center gap-1.5"
                    >
                      <FileText className="w-3 h-3" /> Plantillas Rápidas
                    </button>
                  </div>
                  
                  {showTemplates && (
                    <div className="absolute bottom-[100%] left-4 mb-2 w-72 bg-white dark:bg-[#110E17] border border-slate-200 dark:border-white/10 rounded-xl shadow-xl overflow-hidden z-10">
                      <div className="p-2 border-b border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-[#1A1625] text-xs font-bold text-slate-500">Insertar Plantilla</div>
                      <div className="max-h-64 overflow-y-auto p-1">
                        {templates.map((tpl) => (
                          <button
                            key={tpl.id}
                            onClick={() => {
                              setReplyText(prev => prev + (prev ? '\n\n' : '') + tpl.content);
                              setShowTemplates(false);
                            }}
                            className="w-full text-left px-3 py-2 text-sm hover:bg-purple-50 dark:hover:bg-purple-500/10 hover:text-purple-600 dark:hover:text-purple-400 rounded-lg transition"
                          >
                            {tpl.label}
                          </button>
                        ))}
                        {templates.length === 0 && (
                          <div className="p-3 text-xs text-slate-500 text-center">
                            No hay plantillas guardadas.
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <textarea 
                      rows={3}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder={`Responder a ${selectedRfq.buyer}... (Añadir archivo, adjuntar PDF, etc.)`}
                      className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#110E17] text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none"
                    />
                    <button 
                      onClick={() => {
                        if (replyText.trim()) {
                          setReplyText("");
                          // Simulate send
                        }
                      }}
                      className="px-6 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg flex items-center justify-center transition"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                <div className="w-16 h-16 bg-slate-50 dark:bg-white/5 rounded-full flex items-center justify-center mb-4">
                  <MessageSquare className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Selecciona un RFQ</h3>
                <p className="text-sm text-slate-500">Haz clic en una solicitud del panel izquierdo para ver sus detalles y enviar tu cotización oficial.</p>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {activeSection === 'crm' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="bg-white dark:bg-[#1A1625] border border-slate-200 dark:border-white/5 rounded-2xl overflow-hidden shadow-sm">
             <div className="p-6 border-b border-slate-200 dark:border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex gap-2 relative w-full sm:w-auto">
                   <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                   <input 
                      type="text" 
                      placeholder="Buscar contacto..." 
                      value={contactSearch}
                      onChange={(e) => setContactSearch(e.target.value)}
                      className="pl-10 pr-4 py-2.5 w-full sm:w-64 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                   />
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                   {selectedContactIds.length > 0 && (
                     <button
                       onClick={handleBulkDelete}
                       disabled={isSaving}
                       className="flex items-center gap-2 px-4 py-2.5 bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-transparent rounded-xl text-sm font-bold transition w-full sm:w-auto justify-center"
                     >
                       Eliminar ({selectedContactIds.length})
                     </button>
                   )}
                   <button 
                      onClick={() => {
                        setEditingContactId(null);
                        setNewContact({ entityType: 'contact', name: '', company: '', role: '', email: '', phone: '', type: 'external', status: 'lead', website: '', cuitRut: '', socialMedia: '', industry: '', location: '' });
                        setShowAddContact(true);
                      }}
                      className="flex items-center gap-2 px-4 py-2.5 bg-purple-500 hover:bg-purple-600 border border-transparent rounded-xl text-sm font-bold text-white shadow-lg shadow-purple-500/20 transition w-full sm:w-auto justify-center">
                      <Plus className="w-4 h-4" /> Nuevo Registro
                   </button>
                </div>
             </div>

             <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-slate-200 dark:divide-white/5 relative">
                <div className="flex-1 overflow-x-auto min-h-[400px]">
                   <table className="w-full text-left">
                     <thead>
                       <tr className="bg-slate-50 dark:bg-[#110E17]/50">
                         <th className="px-6 py-4 w-12">
                           <input 
                             type="checkbox" 
                             checked={filteredContacts.length > 0 && selectedContactIds.length === filteredContacts.length}
                             onChange={handleSelectAll}
                             className="w-4 h-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500 bg-white"
                           />
                         </th>
                         <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Nombre y Rol</th>
                         <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Empresa</th>
                         <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Contacto</th>
                         <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Tipo Relación</th>
                         <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Estado</th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-sm">
                       {filteredContacts.map(contact => (
                         <tr 
                           key={contact.id} 
                           onClick={() => setSelectedContact(contact)}
                           className={`hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors cursor-pointer ${selectedContact?.id === contact.id ? 'bg-purple-50 dark:bg-purple-500/10' : ''}`}
                         >
                           <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                             <input 
                               type="checkbox" 
                               checked={selectedContactIds.includes(contact.id)}
                               onChange={(e) => toggleContactSelection(contact.id, e as any)}
                               className="w-4 h-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500 bg-white"
                             />
                           </td>
                           <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                 <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-xs shrink-0">
                                   {contact.name.charAt(0)}
                                 </div>
                                 <div>
                                   <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                     {contact.name}
                                     {contact.entityType === 'company' && <span className="px-1.5 py-0.5 bg-purple-500/10 text-purple-600 dark:text-purple-400 text-[10px] rounded uppercase font-bold tracking-wider">Empresa</span>}
                                   </div>
                                   {contact.role && <div className="text-xs text-slate-500">{contact.role}</div>}
                                 </div>
                              </div>
                           </td>
                           <td className="px-6 py-4">
                              {contact.company && (
                                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                                  <Building className="w-4 h-4 text-slate-400" /> {contact.company}
                                </div>
                              )}
                              {!contact.company && contact.entityType === 'company' && (
                                <span className="text-slate-400 text-xs italic">Sede Principal</span>
                              )}
                           </td>
                           <td className="px-6 py-4">
                              <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 text-xs">
                                  <Mail className="w-3.5 h-3.5" /> {contact.email}
                                </div>
                                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 text-xs">
                                  <Phone className="w-3.5 h-3.5" /> {contact.phone}
                                </div>
                              </div>
                           </td>
                           <td className="px-6 py-4">
                              {contact.type === 'internal' ? (
                                <span className="px-2 py-1 bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 text-xs rounded font-medium">
                                  Interno (Equipo)
                                </span>
                              ) : (
                                <span className="px-2 py-1 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs rounded font-medium">
                                  Externo (Cliente/Lead)
                                </span>
                              )}
                           </td>
                           <td className="px-6 py-4 text-right">
                              {contact.status === 'active' ? (
                                <span className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs rounded-full font-bold">Activo</span>
                              ) : (
                                <span className="px-2.5 py-1 bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 text-xs rounded-full font-bold">Prospecto</span>
                              )}
                           </td>
                         </tr>
                       ))}
                     </tbody>
                   </table>
                </div>

                <AnimatePresence>
                  {selectedContact && (
                    <motion.div initial={{ width: 0, opacity: 0 }} animate={{ width: 320, opacity: 1 }} exit={{ width: 0, opacity: 0 }} className="bg-slate-50 dark:bg-[#110E17] shrink-0 border-l border-slate-200 dark:border-white/5 hidden lg:block overflow-hidden relative">
                       <div className="p-6 w-[320px]">
                         <button onClick={() => setSelectedContact(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white">✕</button>
                         <div className="flex flex-col items-center text-center mt-4">
                            <div className="w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-xl mb-4 shrink-0">
                              {selectedContact.name.charAt(0)}
                            </div>
                            <h4 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 justify-center">
                              {selectedContact.name}
                            </h4>
                            {selectedContact.entityType === 'company' && <span className="mt-1 px-1.5 py-0.5 bg-purple-500/10 text-purple-600 dark:text-purple-400 text-[10px] rounded uppercase font-bold tracking-wider inline-block">Empresa</span>}
                            {selectedContact.role && <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{selectedContact.role}</p>}
                            {selectedContact.company && (
                              <div className="mt-2 px-3 py-1 bg-white dark:bg-black/20 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 inline-flex items-center gap-1.5 border border-slate-200 dark:border-white/5">
                                <Building className="w-3.5 h-3.5" />
                                {selectedContact.company}
                              </div>
                            )}
                         </div>
                         
                         <div className="mt-8 space-y-4 text-sm">
                            {(selectedContact.cuitRut || selectedContact.entityType === 'company') && (
                              <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                                 <FileBadge className="w-4 h-4 shrink-0" />
                                 <span className="truncate">{selectedContact.cuitRut || 'Sin CUIT/RUT registrado'}</span>
                              </div>
                            )}
                            {(selectedContact.industry) && (
                              <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                                 <Building className="w-4 h-4 shrink-0" />
                                 <span className="truncate">{selectedContact.industry}</span>
                              </div>
                            )}
                            {(selectedContact.location) && (
                              <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                                 <MapPin className="w-4 h-4 shrink-0" />
                                 <span className="truncate line-clamp-2" title={selectedContact.location}>{selectedContact.location}</span>
                              </div>
                            )}
                            {(selectedContact.website) && (
                              <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                                 <Globe className="w-4 h-4 shrink-0" />
                                 <a href={selectedContact.website.startsWith('http') ? selectedContact.website : `https://${selectedContact.website}`} target="_blank" rel="noreferrer" className="hover:underline hover:text-purple-500 truncate">{selectedContact.website}</a>
                              </div>
                            )}
                            {selectedContact.email && (
                              <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                                 <Mail className="w-4 h-4 shrink-0" /> 
                                 <a href={`mailto:${selectedContact.email}`} className="hover:underline hover:text-purple-500 break-all">{selectedContact.email}</a>
                              </div>
                            )}
                            {selectedContact.phone && (
                              <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                                 <Phone className="w-4 h-4 shrink-0" /> 
                                 <a href={`tel:${selectedContact.phone}`} className="hover:underline hover:text-purple-500 break-all">{selectedContact.phone}</a>
                              </div>
                            )}
                            {selectedContact.socialMedia && (
                              <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                                 <Hash className="w-4 h-4 shrink-0" /> 
                                 <span className="truncate">{selectedContact.socialMedia}</span>
                              </div>
                            )}
                         </div>
                         
                         <div className="mt-8 pt-6 border-t border-slate-200 dark:border-white/5 space-y-3 font-bold">
                            <button 
                               onClick={() => {
                                 setComposeData({ to: selectedContact.email || selectedContact.phone || '', subject: '', body: templates.find(t => t.label === 'Firma Automática')?.content || '' });
                                 setShowCompose(true);
                               }}
                               className="flex w-full items-center justify-center gap-2 px-4 py-2.5 bg-purple-500 hover:bg-purple-600 text-white rounded-xl shadow-lg shadow-purple-500/20 transition"
                            >
                               <MessageSquare className="w-4 h-4" /> Enviar Mensaje
                            </button>
                            <button className="flex w-full items-center justify-center gap-2 px-4 py-2.5 bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 text-slate-800 dark:text-white rounded-xl transition">
                               <FileText className="w-4 h-4" /> Crear Cotización
                            </button>
                         </div>
                         <div className="mt-4 pt-4 border-t border-slate-200 dark:border-white/5 flex gap-2">
                           <button 
                             onClick={() => startEditContact(selectedContact)}
                             className="flex-1 px-4 py-2 text-sm font-bold bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 rounded-lg transition"
                           >
                             Editar
                           </button>
                           <button 
                             onClick={() => handleDeleteIndividual(selectedContact.id)}
                             className="flex-1 px-4 py-2 text-sm font-bold bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 rounded-lg transition"
                           >
                             Eliminar
                           </button>
                         </div>
                       </div>
                    </motion.div>
                  )}
                </AnimatePresence>
             </div>
          </div>
        </motion.div>
      )}

      {activeSection === 'templates' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="bg-white dark:bg-[#1A1625] border border-slate-200 dark:border-white/5 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-200 dark:border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
               <div>
                 <h3 className="text-lg font-bold text-slate-900 dark:text-white">Plantillas Rápidas</h3>
                 <p className="text-sm text-slate-500">Administra las respuestas predefinidas para correos y notificaciones.</p>
               </div>
               <button 
                 onClick={() => {
                   setEditingTemplateId(null);
                   setNewTemplate({ label: '', content: '' });
                   setShowAddTemplate(true);
                 }}
                 className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white text-sm font-bold rounded-xl transition flex items-center gap-2"
               >
                 <Plus className="w-4 h-4" /> Crear Plantilla
               </button>
            </div>
            
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map(tpl => (
                <div key={tpl.id} className="p-4 border border-slate-200 dark:border-white/10 rounded-xl bg-slate-50 dark:bg-[#110E17] hover:border-purple-500/30 transition flex flex-col group">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                      <FileText className="w-4 h-4 text-purple-500" />
                      {tpl.label}
                    </h4>
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-line flex-1">
                    {tpl.content}
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-200 dark:border-white/5 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => {
                        setEditingTemplateId(tpl.id);
                        setNewTemplate({ label: tpl.label, content: tpl.content });
                        setShowAddTemplate(true);
                      }}
                      className="flex-1 py-1.5 text-xs font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-500/20 transition"
                    >
                      Editar
                    </button>
                    <button 
                      onClick={() => {
                        if (confirm('¿Eliminar esta plantilla?')) {
                          setTemplates(prev => prev.filter(t => t.id !== tpl.id));
                        }
                      }}
                      className="flex-1 py-1.5 text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 rounded-lg hover:bg-red-100 dark:hover:bg-red-500/20 transition"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
              {templates.length === 0 && (
                <div className="col-span-full py-12 text-center">
                  <div className="w-16 h-16 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">No hay plantillas</h3>
                  <p className="text-slate-500 max-w-md mx-auto mt-2">Crea plantillas para responder rápidamente a las solicitudes de cotización.</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Add Contact Modal */}
      <AnimatePresence>
        {showAddContact && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowAddContact(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white dark:bg-[#1A1625] rounded-3xl p-6 w-full max-w-lg shadow-xl border border-slate-200 dark:border-white/10 overflow-y-auto max-h-[90vh]">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
                {editingContactId ? 'Editar Registro B2B' : 'Nuevo Registro B2B'}
              </h3>
              
              <div className="flex gap-2 mb-6 p-1 bg-slate-100 dark:bg-black/20 rounded-xl">
                <button
                  type="button"
                  onClick={() => setNewContact({ ...newContact, entityType: 'contact' })}
                  className={`flex-1 py-2 rounded-lg text-sm font-bold transition flex items-center justify-center gap-2 ${newContact.entityType === 'contact' ? 'bg-white dark:bg-[#1A1625] text-purple-600 dark:text-purple-400 shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
                >
                  <UserCircle className="w-4 h-4" /> Contacto
                </button>
                <button
                  type="button"
                  onClick={() => setNewContact({ ...newContact, entityType: 'company', role: '', company: '' })}
                  className={`flex-1 py-2 rounded-lg text-sm font-bold transition flex items-center justify-center gap-2 ${newContact.entityType === 'company' ? 'bg-white dark:bg-[#1A1625] text-purple-600 dark:text-purple-400 shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
                >
                  <Building className="w-4 h-4" /> Empresa
                </button>
              </div>
              
              <div className="space-y-4">
                {newContact.entityType === 'contact' ? (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nombre Completo</label>
                      <input type="text" value={newContact.name} onChange={e => setNewContact({...newContact, name: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#110E17] border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="Ej. Juan Pérez" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Empresa</label>
                      <input type="text" list="companiesList" value={newContact.company} onChange={e => setNewContact({...newContact, company: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#110E17] border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="Nombre de la empresa" />
                      <datalist id="companiesList">
                        {uniqueCompanies.map(c => <option key={c} value={c} />)}
                      </datalist>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Rol / Cargo</label>
                        <input type="text" value={newContact.role} onChange={e => setNewContact({...newContact, role: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#110E17] border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="Ej. Comprador" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Tipo</label>
                        <select value={newContact.type} onChange={e => setNewContact({...newContact, type: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#110E17] border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white">
                          <option value="external">Externo (Cliente)</option>
                          <option value="internal">Interno (Equipo)</option>
                        </select>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nombre de la Empresa</label>
                      <input type="text" value={newContact.name} onChange={e => setNewContact({...newContact, name: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#110E17] border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="Ej. PetroSur Energía S.A." />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">CUIT / RUT / Registro Fiscal</label>
                        <input type="text" value={newContact.cuitRut} onChange={e => setNewContact({...newContact, cuitRut: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#110E17] border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="Ej. 30-12345678-9" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Industria / Rubro</label>
                        <input type="text" value={newContact.industry} onChange={e => setNewContact({...newContact, industry: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#110E17] border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="Ej. Petróleo y Gas" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Sitio Web</label>
                      <input type="url" value={newContact.website} onChange={e => setNewContact({...newContact, website: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#110E17] border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="https://www.empresa.com" />
                    </div>
                  </>
                )}

                <div className="grid grid-cols-2 gap-4">
                   <div>
                     <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Teléfono</label>
                     <input type="text" value={newContact.phone} onChange={e => setNewContact({...newContact, phone: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#110E17] border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="+54 9..." />
                   </div>
                   {newContact.entityType !== 'company' && (
                     <div>
                       <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Estado</label>
                       <select value={newContact.status} onChange={e => setNewContact({...newContact, status: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#110E17] border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white">
                         <option value="lead">Prospecto</option>
                         <option value="active">Activo</option>
                       </select>
                     </div>
                   )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email</label>
                    <input type="email" value={newContact.email} onChange={e => setNewContact({...newContact, email: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#110E17] border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="correo@empresa.com" />
                  </div>
                  {newContact.entityType === 'company' && (
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Redes Sociales (LinkedIn / IG)</label>
                      <input type="text" value={newContact.socialMedia} onChange={e => setNewContact({...newContact, socialMedia: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#110E17] border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="Ej. linkedin.com/company/..." />
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Locación / Dirección</label>
                  <input type="text" value={newContact.location} onChange={e => setNewContact({...newContact, location: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#110E17] border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="Ej. Calle 123, Ciudad, País" />
                </div>
                
                {newContact.entityType === 'company' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Estado</label>
                    <select value={newContact.status} onChange={e => setNewContact({...newContact, status: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#110E17] border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white mb-2">
                       <option value="lead">Prospecto</option>
                       <option value="active">Activo</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="flex gap-3 justify-end mt-8">
                <button onClick={() => setShowAddContact(false)} className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition">
                  Cancelar
                </button>
                <button 
                  onClick={handleSaveContact} 
                  disabled={!newContact.name || (newContact.entityType === 'contact' && !newContact.company) || isSaving}
                  className="px-5 py-2.5 bg-purple-500 hover:bg-purple-600 disabled:opacity-50 text-white rounded-xl text-sm font-bold shadow-lg shadow-purple-500/20 transition flex items-center gap-2">
                  {isSaving ? 'Guardando...' : 'Guardar Registro'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Template Modal */}
      <AnimatePresence>
        {showAddTemplate && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowAddTemplate(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white dark:bg-[#1A1625] rounded-3xl p-6 w-full max-w-lg shadow-xl border border-slate-200 dark:border-white/10 overflow-y-auto max-h-[90vh]">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
                {editingTemplateId ? 'Editar Plantilla' : 'Nueva Plantilla'}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Nombre / Etiqueta</label>
                  <input
                    type="text"
                    value={newTemplate.label}
                    onChange={(e) => setNewTemplate({ ...newTemplate, label: e.target.value })}
                    placeholder="Ej. Envío de Cotización"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#110E17] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Contenido</label>
                  <textarea
                    rows={6}
                    value={newTemplate.content}
                    onChange={(e) => setNewTemplate({ ...newTemplate, content: e.target.value })}
                    placeholder="Escribe el mensaje aquí..."
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#110E17] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none"
                  />
                </div>
              </div>
              <div className="flex gap-3 justify-end mt-8">
                <button onClick={() => setShowAddTemplate(false)} className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition">
                  Cancelar
                </button>
                <button 
                  onClick={() => {
                    if (newTemplate.label && newTemplate.content) {
                      if (editingTemplateId) {
                        setTemplates(prev => prev.map(t => t.id === editingTemplateId ? { ...t, ...newTemplate } : t));
                      } else {
                        setTemplates(prev => [...prev, { id: Math.random().toString(), ...newTemplate }]);
                      }
                      setShowAddTemplate(false);
                    }
                  }} 
                  disabled={!newTemplate.label || !newTemplate.content}
                  className="px-5 py-2.5 bg-purple-500 hover:bg-purple-600 disabled:opacity-50 text-white rounded-xl text-sm font-bold shadow-lg shadow-purple-500/20 transition flex items-center gap-2"
                >
                  Guardar Plantilla
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Compose Message Modal */}
      <AnimatePresence>
        {showCompose && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowCompose(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white dark:bg-[#1A1625] rounded-3xl p-6 w-full max-w-2xl shadow-xl border border-slate-200 dark:border-white/10 overflow-y-auto max-h-[90vh] flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-purple-500" /> Redactar Mensaje
                </h3>
                <button onClick={() => setShowCompose(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                  <Plus className="w-6 h-6 rotate-45" />
                </button>
              </div>

              <div className="space-y-4 flex-1 flex flex-col">
                <div>
                  <input
                    type="text"
                    value={composeData.to}
                    onChange={(e) => setComposeData({ ...composeData, to: e.target.value })}
                    placeholder="Para: (ej. correo@empresa.com o teléfono +549...)"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#110E17] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 font-medium"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    value={composeData.subject}
                    onChange={(e) => setComposeData({ ...composeData, subject: e.target.value })}
                    placeholder="Asunto"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#110E17] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 font-bold"
                  />
                </div>

                <div className="relative flex-1 flex flex-col min-h-[250px]">
                  <div className="flex gap-2 mb-2">
                    <button 
                      onClick={() => setComposeShowTemplates(!composeShowTemplates)}
                      className="text-xs font-bold px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 transition flex items-center gap-1.5"
                    >
                      <FileText className="w-3 h-3" /> Insertar Plantilla
                    </button>
                  </div>
                  
                  {composeShowTemplates && (
                    <div className="absolute top-10 left-0 mb-2 w-72 bg-white dark:bg-[#110E17] border border-slate-200 dark:border-white/10 rounded-xl shadow-xl overflow-hidden z-20">
                      <div className="p-2 border-b border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-[#1A1625] text-xs font-bold text-slate-500">Plantillas Rápidas</div>
                      <div className="max-h-64 overflow-y-auto p-1">
                        {templates.map(tpl => (
                          <button
                            key={tpl.id}
                            onClick={() => {
                              setComposeData(prev => ({ ...prev, body: prev.body + (prev.body ? '\n\n' : '') + tpl.content }));
                              setComposeShowTemplates(false);
                            }}
                            className="w-full text-left px-3 py-2 text-sm hover:bg-purple-50 dark:hover:bg-purple-500/10 hover:text-purple-600 dark:hover:text-purple-400 rounded-lg transition"
                          >
                            {tpl.label}
                          </button>
                        ))}
                        {templates.length === 0 && (
                          <div className="p-3 text-xs text-slate-500 text-center">No hay plantillas.</div>
                        )}
                      </div>
                    </div>
                  )}

                  <textarea
                    value={composeData.body}
                    onChange={(e) => setComposeData({ ...composeData, body: e.target.value })}
                    placeholder="Escribe el cuerpo del mensaje..."
                    className="flex-1 w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#110E17] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center mt-6 pt-6 border-t border-slate-200 dark:border-white/5">
                <div className="text-xs text-slate-500 flex items-center gap-1">
                  <Mail className="w-4 h-4" /> Enviar vía Email
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setShowCompose(false)} className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition">
                    Cancelar
                  </button>
                  <button 
                    onClick={() => {
                      if (composeData.to && composeData.body) {
                        setComposeData({ to: '', subject: '', body: '' });
                        setShowCompose(false);
                      }
                    }}
                    disabled={!composeData.to || !composeData.body}
                    className="px-6 py-2.5 bg-purple-500 hover:bg-purple-600 disabled:opacity-50 text-white rounded-xl text-sm font-bold shadow-lg shadow-purple-500/20 transition flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" /> Enviar
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
