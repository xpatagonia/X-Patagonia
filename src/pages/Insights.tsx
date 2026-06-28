import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Newspaper, TrendingUp, Calendar, Share2, PlayCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { db } from '../lib/firebase';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { getApiUrl } from '../lib/apiConfig';

export default function Insights() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [selectedPost, setSelectedPost] = useState<any | null>(null);

  const categories = ['Todos', 'Actualidad', 'Empresarial', 'Negocios', 'Startups', 'Innovación'];

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch(`${getApiUrl()}/api/insights`);
        if (!response.ok) throw new Error('Error fetching insights');
        const data = await response.json();
        setPosts(data);
      } catch (err) {
        console.error("Error fetching insights:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const filteredPosts = selectedCategory === 'Todos' 
    ? posts 
    : posts.filter(p => p.category === selectedCategory);

  const handleShare = (post: any) => {
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: `Lee este artículo en Hub de Servicios Inteligentes: ${post.title}`,
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Enlace copiado al portapapeles');
    }
  };

  return (
    <div className="pt-24 pb-16 px-6 md:px-12 max-w-7xl mx-auto min-h-screen">
      <div className="mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-100 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-bold uppercase tracking-wider mb-4 border border-purple-200 dark:border-purple-500/20">
          <Newspaper className="w-3.5 h-3.5" />
          Sección Informativa
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-4">
          Actualidad Empresarial <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-purple-600">& Negocios</span>
        </h1>
        <p className="text-slate-600 dark:text-slate-400 max-w-2xl text-lg">
          Mantente al día con las últimas noticias del ecosistema corporativo, startups e innovación en las 5 provincias patagónicas.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Content */}
        <div className="flex-1">
          {/* Categorías */}
          <div className="flex overflow-x-auto pb-4 mb-6 scrollbar-hide gap-2">
            {categories.map(cat => (
              <button 
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm font-bold transition-all ${selectedCategory === cat ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md' : 'bg-slate-100 dark:bg-[#1A1625] text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/5 border border-transparent dark:border-white/5'}`}
              >
                {cat}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="w-10 h-10 border-4 border-slate-200 dark:border-white/10 border-t-purple-500 rounded-full animate-spin"></div>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="bg-white dark:bg-[#1A1625] rounded-3xl p-12 text-center border border-slate-200 dark:border-white/5">
               <Newspaper className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
               <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No hay artículos publicados</h3>
               <p className="text-slate-500">Pronto el equipo editorial publicará nuevos contenidos en esta categoría.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredPosts.map((post, index) => (
                <motion.article 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  key={post.id} 
                  className={`bg-white dark:bg-[#1A1625] border border-slate-200 dark:border-white/5 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col cursor-pointer ${index === 0 && selectedCategory === 'Todos' ? 'md:col-span-2 md:flex-row' : ''}`}
                  onClick={() => setSelectedPost(post)}
                >
                  {(post.image || post.videoUrl) && (
                    <div className={`relative bg-slate-100 dark:bg-black/50 overflow-hidden shrink-0 ${index === 0 && selectedCategory === 'Todos' ? 'md:w-1/2 h-64 md:h-auto' : 'h-48'}`}>
                      {post.image ? (
                        <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-purple-50 dark:bg-purple-500/10">
                          <PlayCircle className="w-12 h-12 text-purple-500 opacity-50" />
                        </div>
                      )}
                      {post.videoUrl && (
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center group-hover:bg-black/40 transition-colors">
                          <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center backdrop-blur-sm">
                             <PlayCircle className="w-6 h-6 text-slate-900" />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="p-6 md:p-8 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-500/10 px-2.5 py-1 rounded-md">
                          {post.category}
                        </span>
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {post.createdAt ? format(new Date(post.createdAt), "d 'de' MMMM, yyyy", { locale: es }) : 'Reciente'}
                        </span>
                      </div>
                      
                      <h2 className={`font-bold text-slate-900 dark:text-white mb-3 ${index === 0 && selectedCategory === 'Todos' ? 'text-2xl md:text-3xl line-clamp-3' : 'text-xl line-clamp-2'}`}>
                        {post.title}
                      </h2>
                      
                      <p className={`text-slate-600 dark:text-slate-400 mb-6 ${index === 0 && selectedCategory === 'Todos' ? 'line-clamp-4 text-base' : 'line-clamp-3 text-sm'}`}>
                        {post.content.replace(/[#*`_~]/g, '').substring(0, 200)}...
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100 dark:border-white/5">
                      <div className="flex items-center gap-2">
                         <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-orange-400 to-purple-500 flex items-center justify-center text-[10px] font-bold text-white uppercase">
                            {post.author ? post.author.substring(0, 2) : 'B2B'}
                         </div>
                         <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{post.author || 'Redacción Hub'}</span>
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleShare(post); }}
                        className="p-2 text-slate-400 hover:text-purple-500 bg-slate-50 hover:bg-purple-50 dark:bg-white/5 dark:hover:bg-purple-500/10 rounded-full transition-colors"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-80 space-y-6">
          <div className="bg-gradient-to-br from-[#1A1625] to-[#2D1B4E] rounded-3xl p-8 border border-white/10 text-white relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/30 blur-[40px] rounded-full translate-x-1/2 -translate-y-1/2" />
            <Sparkles className="w-8 h-8 text-orange-400 mb-4" />
            <h3 className="text-xl font-bold mb-2">Insights AI</h3>
            <p className="text-sm text-purple-100/70 mb-6">
              Análisis impulsados por Inteligencia Artificial sobre las tendencias económicas en la Patagonia.
            </p>
            <div className="flex flex-wrap gap-2">
               <span className="text-xs bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-md border border-white/5 font-medium">#VacaMuerta</span>
               <span className="text-xs bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-md border border-white/5 font-medium">#EnergíaRenovable</span>
               <span className="text-xs bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-md border border-white/5 font-medium">#AgroIndustria</span>
            </div>
          </div>
          
          <div className="bg-white dark:bg-[#1A1625] rounded-3xl p-6 border border-slate-200 dark:border-white/5">
             <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4 flex items-center gap-2">
               <TrendingUp className="w-4 h-4" /> Más Leídos
             </h3>
             <div className="space-y-4">
               {posts.slice(0, 4).map((post, i) => (
                 <div key={post.id} onClick={() => setSelectedPost(post)} className="group cursor-pointer flex gap-3">
                    <span className="text-2xl font-black text-slate-200 dark:text-white/5 group-hover:text-orange-500 transition-colors mt-[-4px]">
                      0{i + 1}
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 group-hover:text-purple-500 transition-colors line-clamp-2 mb-1">{post.title}</h4>
                      <p className="text-[10px] text-slate-500">{post.category}</p>
                    </div>
                 </div>
               ))}
             </div>
          </div>
        </div>
      </div>

      {/* Reader Modal */}
      <AnimatePresence>
        {selectedPost && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={() => setSelectedPost(null)} />
            
            <motion.div initial={{ opacity: 0, y: 50, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.95 }} className="relative w-full max-w-4xl max-h-[90vh] bg-white dark:bg-[#0A080C] rounded-3xl shadow-2xl overflow-hidden flex flex-col">
              <div className="flex-1 overflow-y-auto">
                {selectedPost.videoUrl ? (
                  <div className="w-full aspect-video bg-black">
                     <iframe 
                       src={selectedPost.videoUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')} 
                       className="w-full h-full" 
                       allowFullScreen 
                       allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                     ></iframe>
                  </div>
                ) : selectedPost.image ? (
                  <div className="w-full h-64 md:h-96 relative">
                    <img src={selectedPost.image} alt={selectedPost.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                  </div>
                ) : null}
                
                <div className={`p-6 md:p-12 ${(!selectedPost.image && !selectedPost.videoUrl) ? 'pt-12' : 'md:-mt-20 relative z-10'}`}>
                  <div className="bg-white dark:bg-[#1A1625] p-6 md:p-8 rounded-3xl shadow-xl border border-slate-100 dark:border-white/5 mb-8">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-500/10 px-2.5 py-1 rounded-md">
                        {selectedPost.category}
                      </span>
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {selectedPost.createdAt ? format(new Date(selectedPost.createdAt), "d 'de' MMMM, yyyy", { locale: es }) : 'Reciente'}
                      </span>
                    </div>
                    
                    <h1 className="text-2xl md:text-4xl font-black text-slate-900 dark:text-white mb-6 leading-tight">
                      {selectedPost.title}
                    </h1>
                    
                    <div className="flex items-center justify-between border-t border-slate-100 dark:border-white/5 pt-4">
                       <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-orange-400 to-purple-500 flex items-center justify-center text-sm font-bold text-white uppercase">
                            {selectedPost.author ? selectedPost.author.substring(0, 2) : 'B2B'}
                         </div>
                         <div>
                           <p className="text-sm font-bold text-slate-900 dark:text-white">{selectedPost.author || 'Redacción Hub'}</p>
                           <p className="text-[10px] text-slate-500 uppercase tracking-wider">Autor verificado</p>
                         </div>
                       </div>
                       
                       <button onClick={() => handleShare(selectedPost)} className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-white rounded-xl text-xs font-bold transition-colors">
                         <Share2 className="w-4 h-4" /> Compartir
                       </button>
                    </div>
                  </div>
                  
                  <div className="prose prose-lg prose-slate dark:prose-invert prose-headings:font-bold prose-h2:text-2xl prose-a:text-purple-500 max-w-none">
                    <ReactMarkdown>{selectedPost.content}</ReactMarkdown>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-slate-50 dark:bg-[#110E17] border-t border-slate-200 dark:border-white/5 flex justify-end">
                 <button onClick={() => setSelectedPost(null)} className="px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold text-sm hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors">
                   Cerrar Artículo
                 </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
