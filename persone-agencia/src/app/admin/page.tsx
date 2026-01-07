"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { 
  LayoutDashboard, Users, Search, MapPin, Trash2, Edit, X, Save, 
  Eye, Mail, Instagram as InstaIcon, User, Calendar, 
  ChevronLeft, ChevronRight, Maximize2, Phone
} from 'lucide-react';

// Pequeno componente auxiliar para exibir itens de informação no modal
const InfoItem = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | number | undefined | null }) => (
  <div className="flex items-start gap-3 p-3 bg-white rounded-xl border border-slate-100">
    <div className="text-[#7A1B8F] mt-1">{icon}</div>
    <div>
      <p className="text-[10px] font-bold text-slate-400 uppercase">{label}</p>
      <p className="text-sm font-medium text-slate-800">{value || "Não informado"}</p>
    </div>
  </div>
);

export default function AdminDashboard() {
  // --- ESTADOS GERAIS ---
  const [view, setView] = useState<'dashboard' | 'promotores'>('dashboard');
  const [candidatos, setCandidatos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [logado, setLogado] = useState(false);
  const [senha, setSenha] = useState('');

  // --- ESTADOS DE EDIÇÃO/MODAL ---
  const [editingCandidato, setEditingCandidato] = useState<any | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);

  // --- ESTADOS DE FILTRO ---
  const [busca, setBusca] = useState('');
  const [filtroUf, setFiltroUf] = useState('');
  const [filtroCidade, setFiltroCidade] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos');

  const estadosBrasileiros = ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'];

  // --- CARREGAR DADOS ---
  useEffect(() => {
    if (!logado) return;
    fetchCandidatos();
  }, [logado]);

  const fetchCandidatos = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('candidatos').select('*').order('created_at', { ascending: false });
    if (!error) setCandidatos(data || []);
    setLoading(false);
  };

  // --- FILTROS ---
  const cidadesDisponiveis = Array.from(new Set(candidatos.filter(c => filtroUf ? c.estado === filtroUf : true).map(c => c.cidade))).sort();
  const candidatosFiltrados = candidatos.filter((c) => {
    const matchNome = c.nome.toLowerCase().includes(busca.toLowerCase());
    const matchUf = filtroUf ? c.estado === filtroUf : true;
    const matchCidade = filtroCidade ? c.cidade === filtroCidade : true;
    const matchStatus = filtroStatus === 'todos' ? true : c.status === filtroStatus;
    return matchNome && matchUf && matchCidade && matchStatus;
  });

  // --- AÇÕES ---
  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja EXCLUIR este candidato? Essa ação não pode ser desfeita.")) return;
    const { error } = await supabase.from('candidatos').delete().eq('id', id);
    if (!error) setCandidatos(prev => prev.filter(c => c.id !== id));
  };

  const handleSaveEdit = async () => {
    if (!editingCandidato) return;
    const { error } = await supabase.from('candidatos').update({ 
      nome: editingCandidato.nome, whatsapp: editingCandidato.whatsapp,
      status: editingCandidato.status, nota10: editingCandidato.nota10
    }).eq('id', editingCandidato.id);
    if (!error) {
      setCandidatos(prev => prev.map(c => c.id === editingCandidato.id ? editingCandidato : c));
      setModalOpen(false);
    }
  };

  const openEdit = (candidato: any) => {
    setEditingCandidato({ ...candidato });
    setCurrentPhotoIndex(0);
    setModalOpen(true);
  };

  // Lógica do Carrossel
  const allPhotos = editingCandidato ? [editingCandidato.foto_perfil_url, ...(editingCandidato.fotos_extras_urls || [])].filter(Boolean) : [];
  const nextPhoto = () => setCurrentPhotoIndex((prev) => (prev + 1) % allPhotos.length);
  const prevPhoto = () => setCurrentPhotoIndex((prev) => (prev - 1 + allPhotos.length) % allPhotos.length);

  const stats = {
    total: candidatos.length,
    pendentes: candidatos.filter(c => c.status === 'pendente').length,
    homens: candidatos.filter(c => c.genero?.includes('Homem')).length,
    mulheres: candidatos.filter(c => c.genero?.includes('Mulher')).length,
  };

  // --- TELA DE LOGIN ---
  if (!logado) {
    return (
      <div className="min-h-screen bg-[#2D0A35] flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-sm text-center">
          <h1 className="text-3xl font-serif font-bold text-[#7A1B8F] mb-6 italic">persone</h1>
          <input type="password" placeholder="Senha Admin" className="w-full p-3 border rounded-xl mb-4 text-center outline-none focus:border-[#7A1B8F]" value={senha} onChange={(e) => setSenha(e.target.value)}/>
          <button onClick={() => senha === "admin123" ? setLogado(true) : alert("Senha errada")} className="w-full bg-[#7A1B8F] text-white font-bold py-3 rounded-xl hover:bg-purple-900">ENTRAR</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-100 font-sans text-slate-800">
      {/* SIDEBAR */}
      <aside className="w-64 bg-[#2D0A35] text-white hidden md:flex flex-col fixed h-full z-10 shadow-xl">
        <div className="p-8"><h1 className="text-3xl font-serif italic font-bold text-[#FFD700]">persone</h1></div>
        <nav className="flex-1 px-4 space-y-2">
          <button onClick={() => setView('dashboard')} className={`w-full flex items-center gap-3 p-3 rounded-xl font-bold transition-all ${view === 'dashboard' ? 'bg-[#7A1B8F] text-[#FFD700]' : 'text-slate-400 hover:text-white'}`}><LayoutDashboard size={20} /> Visão Geral</button>
          <button onClick={() => setView('promotores')} className={`w-full flex items-center gap-3 p-3 rounded-xl font-bold transition-all ${view === 'promotores' ? 'bg-[#7A1B8F] text-[#FFD700]' : 'text-slate-400 hover:text-white'}`}><Users size={20} /> Promotores</button>
        </nav>
      </aside>

      {/* CONTEÚDO */}
      <main className="flex-1 md:ml-64 p-4 md:p-8">
        {/* VIEW: DASHBOARD */}
        {view === 'dashboard' && (
          <div className="animate-in fade-in duration-500">
            <h2 className="text-2xl font-bold text-[#2D0A35] mb-6">Dashboard</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-md border-l-8 border-[#7A1B8F]"><span className="text-xs font-bold text-slate-400 uppercase">Total Cadastrados</span><div className="text-5xl font-black text-[#2D0A35] mt-2">{stats.total}</div></div>
              <div className="bg-white p-6 rounded-2xl shadow-md border-l-8 border-[#FFD700]"><span className="text-xs font-bold text-slate-400 uppercase">Aguardando Análise</span><div className="text-5xl font-black text-[#2D0A35] mt-2">{stats.pendentes}</div></div>
              <div className="bg-white p-6 rounded-2xl shadow-md"><span className="text-xs font-bold text-slate-400 uppercase">Gênero</span><div className="mt-4 space-y-2"><div className="flex justify-between text-xs font-bold"><span>Mulheres</span> <span>{stats.mulheres}</span></div><div className="h-2 bg-slate-100 rounded-full"><div className="h-full bg-pink-500 rounded-full" style={{width: `${(stats.mulheres/stats.total)*100}%`}}></div></div><div className="flex justify-between text-xs font-bold"><span>Homens</span> <span>{stats.homens}</span></div><div className="h-2 bg-slate-100 rounded-full"><div className="h-full bg-blue-500 rounded-full" style={{width: `${(stats.homens/stats.total)*100}%`}}></div></div></div></div>
            </div>
          </div>
        )}

        {/* VIEW: PROMOTORES (LAYOUT HORIZONTAL - ROXO) */}
        {view === 'promotores' && (
          <div className="animate-in fade-in duration-500">
            <h2 className="text-2xl font-bold text-[#2D0A35] mb-6">Banco de Talentos</h2>
            
            {/* Filtros VISÍVEIS */}
            <div className="bg-white p-4 rounded-2xl shadow-sm mb-6 flex flex-wrap gap-3 items-center border border-slate-200 sticky top-0 z-20">
              <div className="flex items-center bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 flex-1 min-w-[200px] focus-within:border-[#7A1B8F] transition-colors">
                <Search size={16} className="text-[#7A1B8F] mr-2"/>
                <input placeholder="Buscar nome..." className="bg-transparent text-sm w-full outline-none font-medium text-slate-700" value={busca} onChange={e => setBusca(e.target.value)}/>
              </div>
              
              <select className="bg-slate-50 border border-slate-300 focus:border-[#7A1B8F] p-2.5 rounded-lg text-sm outline-none text-slate-700 font-bold cursor-pointer transition-colors" value={filtroUf} onChange={e => {setFiltroUf(e.target.value); setFiltroCidade('');}}>
                <option value="">📍 UF: Todos</option>
                {estadosBrasileiros.map(uf => <option key={uf} value={uf}>{uf}</option>)}
              </select>
              
              <select className="bg-slate-50 border border-slate-300 focus:border-[#7A1B8F] p-2.5 rounded-lg text-sm outline-none text-slate-700 font-bold cursor-pointer transition-colors disabled:opacity-50" value={filtroCidade} onChange={e => setFiltroCidade(e.target.value)} disabled={!filtroUf}>
                <option value="">🏙️ Cidade: Todas</option>
                {cidadesDisponiveis.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              
              <select className="bg-slate-50 border border-slate-300 focus:border-[#7A1B8F] p-2.5 rounded-lg text-sm outline-none text-slate-700 font-bold cursor-pointer transition-colors" value={filtroStatus} onChange={e => setFiltroStatus(e.target.value)}>
                <option value="todos">Status: Todos</option>
                <option value="pendente">🟡 Pendente</option>
                <option value="aprovado">🟢 Aprovado</option>
              </select>
            </div>

            {/* GRID DE CARDS HORIZONTAIS (ROXOS) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {candidatosFiltrados.map((cand) => {
                const idade = cand.nascimento ? new Date().getFullYear() - new Date(cand.nascimento).getFullYear() : '?';
                return (
                <div key={cand.id} className="bg-[#2D0A35] rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all flex border border-[#7A1B8F]/30 group relative h-40">
                  
                  {/* FOTO */}
                  <div className="w-40 h-40 relative shrink-0 border-r border-white/10">
                    <img src={cand.foto_perfil_url} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                    <div className={`absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase ${cand.status === 'aprovado' ? 'bg-green-500 text-white' : cand.status === 'arquivado' ? 'bg-gray-500 text-white' : 'bg-yellow-400 text-black'}`}>
                      {cand.status}
                    </div>
                  </div>

                  {/* INFO CARD */}
                  <div className="p-4 flex flex-col justify-between flex-1">
                    <div>
                      <div className="flex justify-between items-start">
                        {/* Nome Branco */}
                        <h3 className="font-bold text-lg text-white truncate pr-16">{cand.nome}</h3>
                        
                        {/* Botões de Ação */}
                        <div className="flex gap-1 absolute top-3 right-3 opacity-100 transition-opacity bg-white/10 backdrop-blur-sm p-1 rounded-lg border border-white/10">
                          <button onClick={() => openEdit(cand)} className="p-1.5 text-slate-300 hover:text-white hover:bg-white/20 rounded-md transition-colors" title="Ver Detalhes"><Eye size={16}/></button>
                          <button onClick={() => handleDelete(cand.id)} className="p-1.5 text-slate-300 hover:text-red-400 hover:bg-white/20 rounded-md transition-colors" title="Excluir"><Trash2 size={16}/></button>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1 text-xs text-white/70 mt-1">
                        <MapPin size={12}/> {cand.cidade}-{cand.estado}
                      </div>
                      
                      {/* Dados (Fundo Translúcido) */}
                      <div className="flex gap-3 text-xs text-white font-bold mt-3 bg-white/10 border border-white/10 p-2 rounded-lg inline-block">
                        <span>{idade} anos</span> • <span>{cand.altura}m</span> • <span>Man: {cand.manequim}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )})}
            </div>
          </div>
        )}
      </main>

      {/* === MODAL DE PERFIL COMPLETO (MANTIDO) === */}
      {modalOpen && editingCandidato && (
        <div className="fixed inset-0 bg-[#2D0A35]/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-100 rounded-3xl w-full max-w-3xl my-8 overflow-hidden animate-in zoom-in-95 duration-300 shadow-2xl">
            {/* Header Modal */}
            <div className="bg-[#7A1B8F] p-6 text-white flex justify-between items-start relative overflow-hidden">
              <div className="flex gap-4 items-center z-10">
                <img src={editingCandidato.foto_perfil_url} className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md" />
                <div className="flex-1 min-w-0">
                   <input className="bg-transparent text-2xl font-bold outline-none border-b border-white/30 focus:border-white mb-2 placeholder-white/50 w-full" 
                    value={editingCandidato.nome} 
                    onChange={e => editingCandidato && setEditingCandidato({...editingCandidato, nome: e.target.value})}
                  />
                  <div className="flex gap-3">
                    <select className="bg-white/20 border border-white/30 text-sm rounded-lg p-1 outline-none cursor-pointer hover:bg-white/30 transition-colors text-black" 
                      value={editingCandidato.status}
                      onChange={e => editingCandidato && setEditingCandidato({...editingCandidato, status: e.target.value})}
                    >
                      <option value="pendente">🟡 Pendente</option>
                      <option value="aprovado">🟢 Aprovado</option>
                      <option value="arquivado">⚫ Arquivado</option>
                    </select>
                  </div>
                </div>
              </div>
              <button onClick={() => setModalOpen(false)} className="bg-white/10 hover:bg-white/20 p-2 rounded-full text-white transition-colors z-10"><X size={20}/></button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Bio & Carrossel */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                <div className="md:col-span-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                  <h3 className="text-sm font-bold text-[#7A1B8F] uppercase mb-2 flex items-center gap-2"><Edit size={14}/> Bio / História</h3>
                  <p className="text-slate-600 text-sm leading-relaxed italic">"{editingCandidato.bio || "Nenhuma bio informada."}"</p>
                </div>
                <div className="md:col-span-2 h-48 bg-slate-200 rounded-2xl relative group overflow-hidden shadow-sm border border-slate-300">
                  {allPhotos.length > 0 ? (
                    <>
                      <img src={allPhotos[currentPhotoIndex]} className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity" onClick={() => setFullScreenImage(allPhotos[currentPhotoIndex])}/>
                      <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full pointer-events-none">{currentPhotoIndex + 1}/{allPhotos.length}</div>
                      {allPhotos.length > 1 && (
                        <>
                          <button onClick={(e) => {e.stopPropagation(); prevPhoto();}} className="absolute top-1/2 left-2 -translate-y-1/2 bg-white/80 p-1 rounded-full shadow hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity"><ChevronLeft size={20}/></button>
                          <button onClick={(e) => {e.stopPropagation(); nextPhoto();}} className="absolute top-1/2 right-2 -translate-y-1/2 bg-white/80 p-1 rounded-full shadow hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity"><ChevronRight size={20}/></button>
                        </>
                      )}
                    </>
                  ) : <div className="flex items-center justify-center h-full text-slate-400 text-xs">Sem fotos</div>}
                </div>
              </div>

               {/* Infos Pessoais */}
               <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <InfoItem icon={<Mail size={18}/>} label="E-mail" value={editingCandidato.email} />
                  <InfoItem icon={<InstaIcon size={18}/>} label="Instagram" value={editingCandidato.instagram} />
                  <InfoItem icon={<User size={18}/>} label="Gênero" value={editingCandidato.genero} />
                  <InfoItem icon={<Calendar size={18}/>} label="Nascimento" value={editingCandidato.nascimento ? new Date(editingCandidato.nascimento).toLocaleDateString('pt-BR') : '-'} />
                  <div className="col-span-2 md:col-span-4">
                    <InfoItem icon={<MapPin size={18}/>} label="Endereço" value={`${editingCandidato.endereco || ''}, ${editingCandidato.numero || ''} - ${editingCandidato.bairro || ''}`} />
                  </div>
               </div>

               {/* Editáveis */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-purple-50 p-4 rounded-2xl border border-purple-100">
                    <label className="block text-xs font-bold text-[#7A1B8F] uppercase mb-2">Nota 10 (Habilidade)</label>
                    <textarea className="w-full p-3 bg-white border border-purple-200 rounded-xl text-sm h-24 outline-none focus:border-[#7A1B8F]"
                      value={editingCandidato.nota10} onChange={e => editingCandidato && setEditingCandidato({...editingCandidato, nota10: e.target.value})} />
                  </div>
                  <div className="bg-green-50 p-4 rounded-2xl border border-green-100">
                    <label className="block text-xs font-bold text-green-700 uppercase mb-2 flex items-center gap-2"><Phone size={14}/> WhatsApp</label>
                    <input className="w-full p-3 bg-white border border-green-200 rounded-xl text-sm font-bold outline-none focus:border-green-500"
                      value={editingCandidato.whatsapp} onChange={e => editingCandidato && setEditingCandidato({...editingCandidato, whatsapp: e.target.value})} />
                    <a href={`https://wa.me/55${editingCandidato.whatsapp?.replace(/\D/g, '')}`} target="_blank" className="mt-2 flex items-center justify-center gap-1 text-xs text-green-600 font-bold hover:underline">Chamar no Zap <Edit size={10}/></a>
                  </div>
               </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t bg-white flex justify-end gap-3 sticky bottom-0">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-slate-500 font-bold text-sm hover:bg-slate-100 rounded-lg">Cancelar</button>
              <button onClick={handleSaveEdit} className="px-6 py-2 bg-[#7A1B8F] text-white font-bold text-sm rounded-lg flex items-center gap-2 hover:bg-purple-900 shadow-lg"><Save size={16}/> Salvar</button>
            </div>
          </div>
        </div>
      )}

      {/* Full Screen */}
      {fullScreenImage && (
        <div className="fixed inset-0 bg-black z-[60] flex items-center justify-center p-4 animate-in zoom-in-95" onClick={() => setFullScreenImage(null)}>
          <button className="absolute top-4 right-4 text-white bg-white/10 p-2 rounded-full hover:bg-white/30 transition-colors"><X size={24}/></button>
          <img src={fullScreenImage} className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" />
        </div>
      )}
    </div>
  );
}

