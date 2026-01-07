"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { 
  LayoutDashboard, Users, Search, MapPin, Trash2, Edit, X, Save, 
  Eye, Mail, Instagram as InstaIcon, User, Calendar, 
  ChevronLeft, ChevronRight, Maximize2, Phone, CreditCard, DollarSign
} from 'lucide-react';

// Componente InfoItem Melhorado (Texto quebra linha e tem borda forte)
const InfoItem = ({ icon, label, value, className = "" }: { icon: React.ReactNode, label: string, value: string | number | undefined | null, className?: string }) => (
  <div className={`flex items-start gap-3 p-4 bg-white rounded-xl border-2 border-slate-100 shadow-sm hover:border-[#7A1B8F]/30 transition-all ${className}`}>
    <div className="text-[#7A1B8F] mt-1 shrink-0 bg-purple-50 p-2 rounded-lg">{icon}</div>
    <div className="min-w-0 flex-1">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-0.5">{label}</p>
      <p className="text-sm font-bold text-slate-800 break-words leading-snug">{value || "Não informado"}</p>
    </div>
  </div>
);

export default function AdminDashboard() {
  const [view, setView] = useState<'dashboard' | 'promotores'>('dashboard');
  const [candidatos, setCandidatos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [logado, setLogado] = useState(false);
  const [senha, setSenha] = useState('');

  // Estados Edição
  const [editingCandidato, setEditingCandidato] = useState<any | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);

  // Filtros
  const [busca, setBusca] = useState('');
  const [filtroUf, setFiltroUf] = useState('');
  const [filtroCidade, setFiltroCidade] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos');

  const estadosBrasileiros = ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'];

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

  const cidadesDisponiveis = Array.from(new Set(candidatos.filter(c => filtroUf ? c.estado === filtroUf : true).map(c => c.cidade))).sort();
  const candidatosFiltrados = candidatos.filter((c) => {
    const matchNome = c.nome.toLowerCase().includes(busca.toLowerCase());
    const matchUf = filtroUf ? c.estado === filtroUf : true;
    const matchCidade = filtroCidade ? c.cidade === filtroCidade : true;
    const matchStatus = filtroStatus === 'todos' ? true : c.status === filtroStatus;
    return matchNome && matchUf && matchCidade && matchStatus;
  });

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja EXCLUIR este candidato?")) return;
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

  const allPhotos = editingCandidato ? [editingCandidato.foto_perfil_url, ...(editingCandidato.fotos_extras_urls || [])].filter(Boolean) : [];
  const nextPhoto = () => setCurrentPhotoIndex((prev) => (prev + 1) % allPhotos.length);
  const prevPhoto = () => setCurrentPhotoIndex((prev) => (prev - 1 + allPhotos.length) % allPhotos.length);

  const stats = {
    total: candidatos.length,
    pendentes: candidatos.filter(c => c.status === 'pendente').length,
    homens: candidatos.filter(c => c.genero?.includes('Homem')).length,
    mulheres: candidatos.filter(c => c.genero?.includes('Mulher')).length,
  };

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
      <aside className="w-64 bg-[#2D0A35] text-white hidden md:flex flex-col fixed h-full z-10 shadow-xl">
        <div className="p-8"><h1 className="text-3xl font-serif italic font-bold text-[#FFD700]">persone</h1></div>
        <nav className="flex-1 px-4 space-y-2">
          <button onClick={() => setView('dashboard')} className={`w-full flex items-center gap-3 p-3 rounded-xl font-bold transition-all ${view === 'dashboard' ? 'bg-[#7A1B8F] text-[#FFD700]' : 'text-slate-400 hover:text-white'}`}><LayoutDashboard size={20} /> Visão Geral</button>
          <button onClick={() => setView('promotores')} className={`w-full flex items-center gap-3 p-3 rounded-xl font-bold transition-all ${view === 'promotores' ? 'bg-[#7A1B8F] text-[#FFD700]' : 'text-slate-400 hover:text-white'}`}><Users size={20} /> Promotores</button>
        </nav>
      </aside>

      <main className="flex-1 md:ml-64 p-4 md:p-8">
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

        {view === 'promotores' && (
          <div className="animate-in fade-in duration-500">
            <h2 className="text-2xl font-bold text-[#2D0A35] mb-6">Banco de Talentos</h2>
            <div className="bg-white p-4 rounded-2xl shadow-sm mb-6 flex flex-wrap gap-3 items-center border border-slate-200 sticky top-0 z-20">
              <div className="flex items-center bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 flex-1 min-w-[200px] focus-within:border-[#7A1B8F] transition-colors">
                <Search size={16} className="text-[#7A1B8F] mr-2"/>
                <input placeholder="Buscar nome..." className="bg-transparent text-sm w-full outline-none font-medium text-slate-700" value={busca} onChange={e => setBusca(e.target.value)}/>
              </div>
              <select className="bg-slate-50 border border-slate-300 focus:border-[#7A1B8F] p-2.5 rounded-lg text-sm outline-none text-slate-700 font-bold" value={filtroUf} onChange={e => {setFiltroUf(e.target.value); setFiltroCidade('');}}><option value="">📍 UF</option>{estadosBrasileiros.map(uf => <option key={uf} value={uf}>{uf}</option>)}</select>
              <select className="bg-slate-50 border border-slate-300 focus:border-[#7A1B8F] p-2.5 rounded-lg text-sm outline-none text-slate-700 font-bold disabled:opacity-50" value={filtroCidade} onChange={e => setFiltroCidade(e.target.value)} disabled={!filtroUf}><option value="">🏙️ Cidade</option>{cidadesDisponiveis.map(c => <option key={c} value={c}>{c}</option>)}</select>
              <select className="bg-slate-50 border border-slate-300 focus:border-[#7A1B8F] p-2.5 rounded-lg text-sm outline-none text-slate-700 font-bold" value={filtroStatus} onChange={e => setFiltroStatus(e.target.value)}><option value="todos">Status</option><option value="pendente">🟡 Pendente</option><option value="aprovado">🟢 Aprovado</option></select>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {candidatosFiltrados.map((cand) => (
                <div key={cand.id} className="bg-[#2D0A35] rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all flex border border-[#7A1B8F]/30 group relative h-40">
                  <div className="w-40 h-40 relative shrink-0 border-r border-white/10">
                    <img src={cand.foto_perfil_url} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                    <div className={`absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase ${cand.status === 'aprovado' ? 'bg-green-500 text-white' : cand.status === 'arquivado' ? 'bg-gray-500 text-white' : 'bg-yellow-400 text-black'}`}>{cand.status}</div>
                  </div>
                  <div className="p-4 flex flex-col justify-between flex-1">
                    <div>
                      <div className="flex justify-between items-start">
                        <h3 className="font-bold text-lg text-white truncate pr-16">{cand.nome}</h3>
                        <div className="flex gap-1 absolute top-3 right-3 opacity-100 bg-white/10 backdrop-blur-sm p-1 rounded-lg border border-white/10">
                          <button onClick={() => openEdit(cand)} className="p-1.5 text-slate-300 hover:text-white hover:bg-white/20 rounded-md" title="Detalhes"><Eye size={16}/></button>
                          <button onClick={() => handleDelete(cand.id)} className="p-1.5 text-slate-300 hover:text-red-400 hover:bg-white/20 rounded-md" title="Excluir"><Trash2 size={16}/></button>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-white/70 mt-1"><MapPin size={12}/> {cand.cidade}-{cand.estado}</div>
                      <div className="flex gap-3 text-xs text-white font-bold mt-3 bg-white/10 border border-white/10 p-2 rounded-lg inline-block">
                        <span>{new Date().getFullYear() - new Date(cand.nascimento).getFullYear()} anos</span> • <span>{cand.altura}m</span> • <span>Man: {cand.manequim}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {modalOpen && editingCandidato && (
        <div className="fixed inset-0 bg-[#2D0A35]/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-50 rounded-3xl w-full max-w-4xl my-8 overflow-hidden animate-in zoom-in-95 duration-300 shadow-2xl border border-slate-200">
            {/* Header com Foto de Fundo */}
            <div className="bg-[#2D0A35] p-6 text-white relative overflow-hidden">
               <div className="absolute top-0 right-0 p-10 opacity-10"><CreditCard size={120}/></div>
               <div className="flex flex-col md:flex-row gap-6 items-center z-10 relative">
                <img src={editingCandidato.foto_perfil_url} className="w-28 h-28 rounded-full object-cover border-4 border-[#FFD700] shadow-lg" />
                <div className="flex-1 text-center md:text-left">
                   <input className="bg-transparent text-2xl md:text-3xl font-black outline-none border-b-2 border-transparent focus:border-[#FFD700] mb-2 w-full text-center md:text-left text-white placeholder-white/50" 
                    value={editingCandidato.nome} 
                    onChange={e => editingCandidato && setEditingCandidato({...editingCandidato, nome: e.target.value})}
                  />
                  <div className="flex flex-wrap justify-center md:justify-start gap-3">
                    <select className="bg-white/10 border border-white/20 text-sm font-bold rounded-lg px-3 py-1 outline-none cursor-pointer hover:bg-white/20 transition-colors text-white" 
                      value={editingCandidato.status}
                      onChange={e => editingCandidato && setEditingCandidato({...editingCandidato, status: e.target.value})}
                    >
                      <option className="text-black" value="pendente">🟡 Pendente</option>
                      <option className="text-black" value="aprovado">🟢 Aprovado</option>
                      <option className="text-black" value="arquivado">⚫ Arquivado</option>
                    </select>
                  </div>
                </div>
                <button onClick={() => setModalOpen(false)} className="bg-white/10 hover:bg-white/20 p-2 rounded-full text-white transition-colors absolute top-4 right-4"><X size={24}/></button>
              </div>
            </div>
            
            <div className="p-6 md:p-8 space-y-8 bg-slate-50">
              
              {/* GRID PRINCIPAL */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                
                {/* COLUNA ESQUERDA (FOTOS & BIO) - SPAN 5 */}
                <div className="md:col-span-5 space-y-6">
                   {/* Carrossel */}
                   <div className="aspect-[3/4] bg-slate-200 rounded-2xl relative group overflow-hidden shadow-md border-2 border-white">
                      {allPhotos.length > 0 ? (
                        <>
                          <img src={allPhotos[currentPhotoIndex]} className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity" onClick={() => setFullScreenImage(allPhotos[currentPhotoIndex])}/>
                          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-3 py-1 rounded-full pointer-events-none font-bold backdrop-blur-sm">{currentPhotoIndex + 1} de {allPhotos.length}</div>
                          {allPhotos.length > 1 && (
                            <>
                              <button onClick={(e) => {e.stopPropagation(); prevPhoto();}} className="absolute top-1/2 left-2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow hover:bg-white text-[#7A1B8F]"><ChevronLeft size={24}/></button>
                              <button onClick={(e) => {e.stopPropagation(); nextPhoto();}} className="absolute top-1/2 right-2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow hover:bg-white text-[#7A1B8F]"><ChevronRight size={24}/></button>
                            </>
                          )}
                        </>
                      ) : <div className="flex items-center justify-center h-full text-slate-400">Sem fotos</div>}
                   </div>

                   {/* Bio */}
                   <div className="bg-white p-5 rounded-2xl border-2 border-slate-100 shadow-sm relative">
                      <div className="absolute -top-3 left-4 bg-[#7A1B8F] text-white px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">Bio / História</div>
                      <p className="text-slate-600 text-sm italic leading-relaxed pt-2">"{editingCandidato.bio || "Nenhuma bio informada."}"</p>
                   </div>
                </div>

                {/* COLUNA DIREITA (DADOS) - SPAN 7 */}
                <div className="md:col-span-7 space-y-6">
                  
                  {/* Informações Pessoais (COM EMAIL EXPANDIDO) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <InfoItem className="col-span-2" icon={<Mail size={18}/>} label="E-mail" value={editingCandidato.email} />
                     <InfoItem icon={<InstaIcon size={18}/>} label="Instagram" value={editingCandidato.instagram} />
                     <InfoItem icon={<User size={18}/>} label="Gênero" value={editingCandidato.genero} />
                     <InfoItem icon={<Calendar size={18}/>} label="Nascimento" value={editingCandidato.nascimento ? new Date(editingCandidato.nascimento).toLocaleDateString('pt-BR') : '-'} />
                     <InfoItem icon={<CreditCard size={18}/>} label="CPF/Documento" value={editingCandidato.dados_bancarios?.chave_pix || 'Ver Financeiro'} />
                     <div className="col-span-2">
                        <InfoItem icon={<MapPin size={18}/>} label="Endereço Completo" value={`${editingCandidato.endereco || ''}, ${editingCandidato.numero || ''} - ${editingCandidato.bairro || ''} (${editingCandidato.cidade}-${editingCandidato.estado})`} />
                     </div>
                  </div>

                  {/* Financeiro (NOVO CARD) */}
                  <div className="bg-blue-50/50 p-5 rounded-2xl border-2 border-blue-100">
                    <h3 className="text-xs font-black text-blue-800 uppercase mb-3 flex items-center gap-2"><DollarSign size={14}/> Dados Financeiros & Pagamento</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-white p-3 rounded-xl border border-blue-100">
                           <span className="text-[10px] text-slate-400 font-bold uppercase block">Método</span>
                           <span className="text-sm font-bold text-slate-800 capitalize flex items-center gap-2">
                             {editingCandidato.tipo_pagamento === 'pix' ? '💠 PIX' : '🏦 Transferência'}
                             {editingCandidato.mei ? <span className="bg-green-100 text-green-700 text-[10px] px-1.5 py-0.5 rounded">MEI Ativo</span> : <span className="bg-slate-100 text-slate-500 text-[10px] px-1.5 py-0.5 rounded">Pessoa Física</span>}
                           </span>
                        </div>
                        <div className="bg-white p-3 rounded-xl border border-blue-100">
                           <span className="text-[10px] text-slate-400 font-bold uppercase block">{editingCandidato.tipo_pagamento === 'pix' ? 'Chave PIX' : 'Banco'}</span>
                           <span className="text-sm font-bold text-slate-800 break-all">
                             {editingCandidato.tipo_pagamento === 'pix' ? (editingCandidato.dados_bancarios?.chave_pix || '-') : (editingCandidato.dados_bancarios?.banco || '-')}
                           </span>
                        </div>
                        {editingCandidato.tipo_pagamento === 'conta' && (
                           <div className="col-span-2 bg-white p-3 rounded-xl border border-blue-100">
                              <span className="text-[10px] text-slate-400 font-bold uppercase block">Dados da Conta</span>
                              <span className="text-sm font-bold text-slate-800">Ag: {editingCandidato.dados_bancarios?.agencia} | CC: {editingCandidato.dados_bancarios?.conta} | Titular: {editingCandidato.dados_bancarios?.titular}</span>
                           </div>
                        )}
                    </div>
                  </div>

                  {/* Editáveis */}
                  <div className="grid grid-cols-1 gap-4">
                    <div className="bg-purple-50 p-4 rounded-2xl border-2 border-purple-100">
                      <label className="block text-xs font-black text-[#7A1B8F] uppercase mb-2">Nota 10 (Habilidade) ✏️</label>
                      <textarea className="w-full p-3 bg-white border border-purple-200 rounded-xl text-sm h-20 outline-none focus:border-[#7A1B8F]"
                        value={editingCandidato.nota10} onChange={e => editingCandidato && setEditingCandidato({...editingCandidato, nota10: e.target.value})} />
                    </div>
                    <div className="bg-green-50 p-4 rounded-2xl border-2 border-green-100">
                      <label className="block text-xs font-black text-green-700 uppercase mb-2 flex items-center gap-2"><Phone size={14}/> WhatsApp (Contato) ✏️</label>
                      <div className="flex gap-2">
                        <input className="flex-1 p-3 bg-white border border-green-200 rounded-xl text-sm font-bold outline-none focus:border-green-500"
                          value={editingCandidato.whatsapp} onChange={e => editingCandidato && setEditingCandidato({...editingCandidato, whatsapp: e.target.value})} />
                        <a href={`https://wa.me/55${editingCandidato.whatsapp?.replace(/\D/g, '')}`} target="_blank" className="bg-green-500 hover:bg-green-600 text-white px-4 rounded-xl flex items-center justify-center transition-colors font-bold text-sm">Abrir <Edit size={14} className="ml-1"/></a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t bg-white flex justify-end gap-3 sticky bottom-0 z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
              <button onClick={() => setModalOpen(false)} className="px-6 py-3 text-slate-500 font-bold text-sm hover:bg-slate-100 rounded-xl transition-colors">Cancelar</button>
              <button onClick={handleSaveEdit} className="px-8 py-3 bg-[#7A1B8F] text-white font-bold text-sm rounded-xl flex items-center gap-2 hover:bg-purple-900 shadow-lg transform active:scale-95 transition-all"><Save size={18}/> Salvar Alterações</button>
            </div>
          </div>
        </div>
      )}

      {fullScreenImage && (
        <div className="fixed inset-0 bg-black/95 z-[60] flex items-center justify-center p-4 animate-in zoom-in-95" onClick={() => setFullScreenImage(null)}>
          <button className="absolute top-6 right-6 text-white bg-white/10 p-3 rounded-full hover:bg-white/30 transition-colors"><X size={32}/></button>
          <img src={fullScreenImage} className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" />
        </div>
      )}
    </div>
  );
}
