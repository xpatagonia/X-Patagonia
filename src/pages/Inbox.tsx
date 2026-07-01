import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Mail, Send, Reply, RefreshCw, AlertCircle, Inbox as InboxIcon, MessageCircle } from 'lucide-react';
import { auth } from '../lib/firebase';
import { getApiUrl } from '../lib/apiConfig';

interface Email {
  id: string;
  uid: number;
  subject: string;
  from: string;
  date: string;
  snippet: string;
  text?: string;
  html?: string;
}

export default function Inbox() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  
  const [showCompose, setShowCompose] = useState(false);
  const [composeTo, setComposeTo] = useState('');
  const [composeSubject, setComposeSubject] = useState('');
  const [composeBody, setComposeBody] = useState('');
  const [sending, setSending] = useState(false);

  const fetchEmails = async (userObj?: any) => {
    setLoading(true);
    setError('');
    try {
      // If userObj is an event or not a firebase user, fallback to auth.currentUser
      const user = (userObj && typeof userObj.getIdToken === 'function') ? userObj : auth.currentUser;
      if (!user) {
        setError('Debes iniciar sesión para ver los correos.');
        return;
      }
      const token = await user.getIdToken();
      const response = await fetch(`${getApiUrl()}/api/emails`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch emails');
      }
      setEmails(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error al conectar con el servidor de correo corporativo (IMAP). Verifica las variables de entorno.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchEmails(user);
      } else {
        setLoading(false);
        setError('Debes iniciar sesión para ver los correos.');
      }
    });
    return () => unsubscribe();
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      const user = auth.currentUser;
      const token = await user?.getIdToken();
      const response = await fetch(`${getApiUrl()}/api/emails/send`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          to: composeTo,
          subject: composeSubject,
          text: composeBody
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Error enviando el correo');
      
      if (data.mocked) {
        const missingText = data.missing ? `\nFaltan: ${data.missing.join(', ')}` : '';
        alert(`AVISO: El servidor no tiene configuradas las credenciales SMTP. El envío fue simulado y NO se envió realmente.${missingText}\nConfigure los Secrets en AI Studio.`);
      } else {
        alert('Correo enviado exitosamente.');
      }
      
      setShowCompose(false);
      setComposeTo('');
      setComposeSubject('');
      setComposeBody('');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSending(false);
    }
  };

  const handleReply = () => {
    if (!selectedEmail) return;
    setComposeTo(selectedEmail.from);
    setComposeSubject(`Re: ${selectedEmail.subject}`);
    setComposeBody(`\n\n--- En respuesta a ---\n${selectedEmail.text || selectedEmail.snippet}`);
    setShowCompose(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0A080C] pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-6 h-[calc(100vh-8rem)] flex flex-col gap-4">

        <div className="flex flex-col h-full bg-white dark:bg-[#1A1625] rounded-2xl shadow-sm border border-slate-200 dark:border-white/10 overflow-hidden">
          
            <>
              {/* Toolbar */}
              <div className="p-4 border-b border-slate-200 dark:border-white/10 flex items-center justify-between bg-slate-50 dark:bg-[#110E17]">
                <div className="flex items-center gap-3">
                  <InboxIcon className="w-6 h-6 text-purple-500" />
                  <h1 className="text-xl font-display font-bold text-slate-900 dark:text-white">Bandeja de Entrada</h1>
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={() => fetchEmails()}
                    className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10 rounded-lg transition-colors flex items-center gap-2"
                    title="Actualizar"
                  >
                    <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                  </button>
                  <button 
                    onClick={() => {
                      setComposeTo('');
                      setComposeSubject('');
                      setComposeBody('');
                      setShowCompose(true);
                    }}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-colors flex items-center gap-2 text-sm"
                  >
                    <Send className="w-4 h-4" /> Nuevo Correo
                  </button>
                </div>
              </div>

              <div className="flex flex-1 overflow-hidden">
                {/* Mail List */}
                <div className="w-1/3 border-r border-slate-200 dark:border-white/10 overflow-y-auto flex flex-col">
                  {loading && emails.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">Cargando correos...</div>
                  ) : error ? (
                    <div className="p-4 m-4 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-lg flex items-start gap-3 text-sm">
                      <AlertCircle className="w-5 h-5 shrink-0" />
                      <p>{error}</p>
                    </div>
                  ) : emails.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">No hay correos en la bandeja de entrada.</div>
                  ) : (
                    emails.map(email => (
                      <button 
                        key={email.id}
                        onClick={() => {
                          setSelectedEmail(email);
                          setShowCompose(false);
                        }}
                        className={`p-4 text-left border-b border-slate-100 dark:border-white/5 transition-colors hover:bg-slate-50 dark:hover:bg-white/5 ${selectedEmail?.id === email.id ? 'bg-purple-50 dark:bg-purple-500/10 border-l-4 border-l-purple-500' : 'border-l-4 border-l-transparent'}`}
                      >
                        <div className="flex justify-between items-baseline mb-1">
                          <span className="font-bold text-slate-900 dark:text-white truncate pr-4">{email.from}</span>
                          <span className="text-xs text-slate-500 shrink-0">{new Date(email.date).toLocaleDateString()}</span>
                        </div>
                        <div className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate mb-1">{email.subject}</div>
                        <div className="text-xs text-slate-500 truncate">{email.snippet}</div>
                      </button>
                    ))
                  )}
                </div>

                {/* Main Content Area */}
                <div className="flex-1 overflow-y-auto bg-white dark:bg-[#1A1625]">
                  {showCompose ? (
                    <div className="p-6 h-full flex flex-col">
                      <h2 className="text-xl font-bold mb-6 text-slate-900 dark:text-white">Redactar Mensaje</h2>
                      <form onSubmit={handleSend} className="flex-1 flex flex-col gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Para:</label>
                          <input 
                            type="text" 
                            required
                            value={composeTo}
                            onChange={e => setComposeTo(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-[#110E17] border border-slate-200 dark:border-white/10 rounded-lg px-4 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="correo@ejemplo.com"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Asunto:</label>
                          <input 
                            type="text" 
                            required
                            value={composeSubject}
                            onChange={e => setComposeSubject(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-[#110E17] border border-slate-200 dark:border-white/10 rounded-lg px-4 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                        </div>
                        <div className="flex-1 flex flex-col">
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Mensaje:</label>
                          <textarea 
                            required
                            value={composeBody}
                            onChange={e => setComposeBody(e.target.value)}
                            className="flex-1 w-full bg-slate-50 dark:bg-[#110E17] border border-slate-200 dark:border-white/10 rounded-lg px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none font-sans"
                          />
                        </div>
                        <div className="flex justify-end gap-3 pt-4">
                          <button 
                            type="button"
                            onClick={() => setShowCompose(false)}
                            className="px-6 py-2 text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-colors"
                          >
                            Cancelar
                          </button>
                          <button 
                            type="submit"
                            disabled={sending}
                            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                          >
                            {sending ? 'Enviando...' : (
                              <>
                                <Send className="w-4 h-4" /> Enviar Mensaje
                              </>
                            )}
                          </button>
                        </div>
                      </form>
                    </div>
                  ) : selectedEmail ? (
                    <div className="p-8 h-full flex flex-col">
                      <div className="mb-8 border-b border-slate-200 dark:border-white/10 pb-6">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">{selectedEmail.subject}</h2>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-lg">
                              {selectedEmail.from.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 dark:text-white">{selectedEmail.from}</p>
                              <p className="text-xs text-slate-500">{new Date(selectedEmail.date).toLocaleString()}</p>
                            </div>
                          </div>
                          <button 
                            onClick={handleReply}
                            className="px-4 py-2 bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 font-bold rounded-lg transition-colors flex items-center gap-2 text-sm"
                          >
                            <Reply className="w-4 h-4" /> Responder
                          </button>
                        </div>
                      </div>
                      <div className="flex-1 overflow-y-auto">
                        {selectedEmail.html ? (
                          <div 
                            className="prose dark:prose-invert max-w-none text-slate-800 dark:text-slate-200"
                            dangerouslySetInnerHTML={{ __html: selectedEmail.html }}
                          />
                        ) : (
                          <pre className="whitespace-pre-wrap font-sans text-slate-800 dark:text-slate-200">
                            {selectedEmail.text || selectedEmail.snippet}
                          </pre>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-500 p-8 text-center">
                      <Mail className="w-16 h-16 mb-4 opacity-20" />
                      <p className="text-lg font-medium text-slate-600 dark:text-slate-400">Selecciona un correo para leerlo</p>
                      <p className="text-sm mt-2 max-w-md">Los correos se obtienen directamente de tu servidor IMAP corporativo configurado en las variables de entorno.</p>
                    </div>
                  )}
                </div>
              </div>
            </>
        </div>
      </div>
    </div>
  );
}
