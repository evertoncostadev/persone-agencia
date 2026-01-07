"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { 
  LayoutDashboard, Users, Search, MapPin, Trash2, Edit, X, Save, 
  Eye, Mail, Instagram as InstaIcon, User, Calendar, 
  ChevronLeft, ChevronRight, Phone, CreditCard, DollarSign, FileText
} from 'lucide-react';

// Componente InfoItem Compacto e Bonito
const InfoItem = ({ icon, label, value, className = "" }: { icon: React.ReactNode, label: string, value: string | number | undefined | null, className?: string }) => (
  <div className={`flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200 shadow-sm hover:border-[#7A1B8F]/30 transition-all ${className}`}>
    <div className="text-[#7A1B8F] shrink-0 bg-purple-50 p-2 rounded-lg">{icon}</div>
    <div className="min-w-0 flex-1">
      <p className="text-[9px] font-black text-slate-400 uppercase tracking-wide">{label}</p>
      <p className="text-xs font-bold text-slate-800 break-words leading-tight">{value || "-"}</p>
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
          {/* MODAL MAIS LARGO (max-w-5xl) E COM LAYOUT GRID OTIMIZADO */}
          <div className="bg-slate-50 rounded-3xl w-full max-w-5xl my-4 overflow-hidden animate-in zoom-in-95 duration-300 shadow-2xl border border-slate-200">
            
            {/* Header */}
            <div className="bg-[#2D0A35] p-5 text-white relative">
               <div className="flex flex-col md:flex-row gap-4 items-center relative z-10">
                 <img src={editingCandidato.foto_perfil_url} className="w-20 h-20 rounded-full object-cover border-4 border-[#FFD700] shadow-lg" />
                 <div className="flex-1 text-center md:text-left min-w-0">
                    <input className="bg-transparent text-2xl font-black outline-none border-b-2 border-transparent focus:border-[#FFD700] mb-1 w-full text-center md:text-left text-white placeholder-white/50" 
                      value={editingCandidato.nome} 
                      onChange={e => editingCandidato && setEditingCandidato({...editingCandidato, nome: e.target.value})}
                    />
                    <select className="bg-white/10 border border-white/20 text-xs font-bold rounded-lg px-3 py-1 outline-none cursor-pointer hover:bg-white/20 transition-colors text-white" 
                      value={editingCandidato.status}
                      onChange={e => editingCandidato && setEditingCandidato({...editingCandidato, status: e.target.value})}
                    >
                      <option className="text-black" value="pendente">🟡 Status: Pendente</option>
                      <option className="text-black" value="aprovado">🟢 Status: Aprovado</option>
                      <option className="text-black" value="arquivado">⚫ Status: Arquivado</option>
                    </select>
                 </div>
                 <button onClick={() => setModalOpen(false)} className="bg-white/10 hover:bg-white/20 p-2 rounded-full text-white transition-colors"><X size={20}/></button>
               </div>
            </div>
            
            <div className="p-5 bg-slate-100">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                
                {/* COLUNA ESQUERDA: FOTO + BIO (FIXA) */}
                <div className="lg:col-span-4 flex flex-col gap-4">
                   <div className="aspect-square bg-black rounded-2xl relative group overflow-hidden shadow-md border-2 border-white">
                      {allPhotos.length > 0 ? (
                        <>
                          <img src={allPhotos[currentPhotoIndex]} className="w-full h-full object-cover cursor-pointer" onClick={() => setFullScreenImage(allPhotos[currentPhotoIndex])}/>
                          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full font-bold backdrop-blur-sm pointer-events-none">{currentPhotoIndex + 1}/{allPhotos.length}</div>
                          {allPhotos.length > 1 && (
                            <>
                              <button onClick={(e) => {e.stopPropagation(); prevPhoto();}} className="absolute top-1/2 left-2 -translate-y-1/2 bg-white/80 p-1.5 rounded-full shadow hover:bg-white text-[#7A1B8F]"><ChevronLeft size={20}/></button>
                              <button onClick={(e) => {e.stopPropagation(); nextPhoto();}} className="absolute top-1/2 right-2 -translate-y-1/2 bg-white/80 p-1.5 rounded-full shadow hover:bg-white text-[#7A1B8F]"><ChevronRight size={20}/></button>
                            </>
                          )}
                        </>
                      ) : <div className="flex items-center justify-center h-full text-slate-400">Sem fotos</div>}
                   </div>

                   <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex-1">
                      <div className="text-[#7A1B8F] text-[10px] font-black uppercase mb-2 flex items-center gap-1"><FileText size={12}/> Bio / História</div>
                      <p className="text-slate-600 text-xs italic leading-relaxed">"{editingCandidato.bio || "Nenhuma bio informada."}"</p>
                   </div>
                </div>

                {/* COLUNA DIREITA: DADOS ORGANIZADOS */}
                <div className="lg:col-span-8 flex flex-col gap-4">
                  
                  {/* LINHA 1: DADOS PESSOAIS COMPACTOS */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                     <InfoItem className="col-span-2 md:col-span-1" icon={<Mail size={16}/>} label="E-mail" value={editingCandidato.email} />
                     <InfoItem icon={<InstaIcon size={16}/>} label="Instagram" value={editingCandidato.instagram} />
                     <InfoItem icon={<User size={16}/>} label="Gênero" value={editingCandidato.genero} />
                     <InfoItem icon={<Calendar size={16}/>} label="Nascimento" value={editingCandidato.nascimento ? new Date(editingCandidato.nascimento).toLocaleDateString('pt-BR') : '-'} />
                     <InfoItem icon={<CreditCard size={16}/>} label="CPF/Doc" value={editingCandidato.dados_bancarios?.chave_pix || '-'} />
                     <InfoItem icon={<MapPin size={16}/>} label="Cidade" value={`${editingCandidato.cidade}-${editingCandidato.estado}`} />
                  </div>

                  {/* LINHA 2: FINANCEIRO E ENDEREÇO */}
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="text-xs font-black text-slate-700 uppercase mb-3 flex items-center gap-2"><DollarSign size={14}/> Financeiro & Endereço</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                          <span className="text-[9px] text-slate-400 font-bold uppercase block mb-1">Pagamento ({editingCandidato.tipo_pagamento})</span>
                          <span className="text-xs font-bold text-slate-800 block break-all">
                             {editingCandidato.tipo_pagamento === 'pix' ? `Chave: ${editingCandidato.dados_bancarios?.chave_pix}` : `Bco: ${editingCandidato.dados_bancarios?.banco} | Ag: ${editingCandidato.dados_bancarios?.agencia} | CC: ${editingCandidato.dados_bancarios?.conta}`}
                          </span>
                          {editingCandidato.mei && <span className="inline-block mt-1 bg-green-100 text-green-700 text-[9px] px-1.5 py-0.5 rounded font-bold">MEI Ativo</span>}
                       </div>
                       <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                          <span className="text-[9px] text-slate-400 font-bold uppercase block mb-1">Endereço Completo</span>
                          <span className="text-xs font-bold text-slate-800 leading-tight block">
                             {`${editingCandidato.endereco || ''}, ${editingCandidato.numero || ''} - ${editingCandidato.bairro || ''}, CEP: ${editingCandidato.cep || '-'}`}
                          </span>
                       </div>
                    </div>
                  </div>

                  {/* LINHA 3: CAMPOS EDITÁVEIS (LADO A LADO) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-auto">
                    <div className="bg-purple-50 p-3 rounded-2xl border border-purple-100">
                      <label className="block text-[10px] font-black text-[#7A1B8F] uppercase mb-1">Nota 10 (Habilidade) ✏️</label>
                      <textarea className="w-full p-2 bg-white border border-purple-200 rounded-lg text-xs h-16 outline-none focus:border-[#7A1B8F]"
                        value={editingCandidato.nota10} onChange={e => editingCandidato && setEditingCandidato({...editingCandidato, nota10: e.target.value})} />
                    </div>
                    <div className="bg-green-50 p-3 rounded-2xl border border-green-100 flex flex-col justify-between">
                      <label className="block text-[10px] font-black text-green-700 uppercase mb-1">WhatsApp (Contato) ✏️</label>
                      <div className="flex gap-2">
                        <input className="flex-1 p-2 bg-white border border-green-200 rounded-lg text-xs font-bold outline-none focus:border-green-500"
                          value={editingCandidato.whatsapp} onChange={e => editingCandidato && setEditingCandidato({...editingCandidato, whatsapp: e.target.value})} />
                        <a href={`https://wa.me/55${editingCandidato.whatsapp?.replace(/\D/g, '')}`} target="_blank" className="bg-green-500 hover:bg-green-600 text-white px-3 rounded-lg flex items-center justify-center transition-colors font-bold text-xs">Abrir</a>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-3 border-t bg-white flex justify-end gap-3">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-slate-500 font-bold text-xs hover:bg-slate-100 rounded-lg">Cancelar</button>
              <button onClick={handleSaveEdit} className="px-5 py-2 bg-[#7A1B8F] text-white font-bold text-xs rounded-lg flex items-center gap-2 hover:bg-purple-900 shadow-md"><Save size={14}/> Salvar</button>
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