"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { 
  LayoutDashboard, Users, UserX, Search, MapPin, 
  Phone, Trash2, Edit, X, Save, Filter, ChevronDown, CheckCircle 
} from 'lucide-react';

export default function AdminDashboard() {
  // --- ESTADOS GERAIS ---
  const [view, setView] = useState<'dashboard' | 'promotores'>('dashboard'); // Controla qual tela aparece
  const [candidatos, setCandidatos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [logado, setLogado] = useState(false);
  const [senha, setSenha] = useState('');

  // --- ESTADOS DE EDIÇÃO/MODAL ---
  const [editingCandidato, setEditingCandidato] = useState<any | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // --- ESTADOS DE FILTRO ---
  const [busca, setBusca] = useState('');
  const [filtroUf, setFiltroUf] = useState('');
  const [filtroCidade, setFiltroCidade] = useState('');
  const [filtroGenero, setFiltroGenero] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos');

  // Lista de estados para o filtro
  const estadosBrasileiros = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 
    'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ];

  // --- 1. CARREGAR DADOS ---
  useEffect(() => {
    if (!logado) return;
    fetchCandidatos();
  }, [logado]);

  const fetchCandidatos = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('candidatos')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) console.error('Erro:', error);
    else setCandidatos(data || []);
    setLoading(false);
  };

  // --- 2. LÓGICA DE FILTROS ---
  const cidadesDisponiveis = Array.from(new Set(
    candidatos
      .filter(c => filtroUf ? c.estado === filtroUf : true)
      .map(c => c.cidade)
  )).sort();

  const candidatosFiltrados = candidatos.filter((c) => {
    const matchNome = c.nome.toLowerCase().includes(busca.toLowerCase());
    const matchUf = filtroUf ? c.estado === filtroUf : true;
    const matchCidade = filtroCidade ? c.cidade === filtroCidade : true;
    const matchGenero = filtroGenero ? c.genero === filtroGenero : true;
    const matchStatus = filtroStatus === 'todos' ? true : c.status === filtroStatus;
    
    return matchNome && matchUf && matchCidade && matchGenero && matchStatus;
  });

  // --- 3. AÇÕES (CRUD) ---
  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja EXCLUIR este candidato? Essa ação não pode ser desfeita.")) return;
    
    const { error } = await supabase.from('candidatos').delete().eq('id', id);
    if (!error) {
      setCandidatos(prev => prev.filter(c => c.id !== id));
      alert("Candidato excluído com sucesso!");
    } else {
      alert("Erro ao excluir.");
    }
  };

  const handleSaveEdit = async () => {
    if (!editingCandidato) return;
    
    const { error } = await supabase
      .from('candidatos')
      .update({ 
        nome: editingCandidato.nome, 
        whatsapp: editingCandidato.whatsapp,
        status: editingCandidato.status,
        nota10: editingCandidato.nota10
      })
      .eq('id', editingCandidato.id);

    if (!error) {
      setCandidatos(prev => prev.map(c => c.id === editingCandidato.id ? editingCandidato : c));
      setModalOpen(false);
      setEditingCandidato(null);
    } else {
      alert("Erro ao atualizar.");
    }
  };

  const openEdit = (candidato: any) => {
    setEditingCandidato({ ...candidato });
    setModalOpen(true);
  };

  // --- 4. DADOS DASHBOARD ---
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
          <input 
            type="password" placeholder="Senha Admin" 
            className="w-full p-3 border rounded-xl mb-4 text-center outline-none focus:border-[#7A1B8F]"
            value={senha} onChange={(e) => setSenha(e.target.value)}
          />
          <button onClick={() => senha === "admin123" ? setLogado(true) : alert("Senha errada")} 
            className="w-full bg-[#7A1B8F] text-white font-bold py-3 rounded-xl hover:bg-purple-900">ENTRAR</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-100 font-sans text-slate-800">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-[#2D0A35] text-white hidden md:flex flex-col fixed h-full z-10 shadow-xl">
        <div className="p-8">
          <h1 className="text-3xl font-serif italic font-bold text-[#FFD700]">persone</h1>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          <button onClick={() => setView('dashboard')} className={`w-full flex items-center gap-3 p-3 rounded-xl font-bold transition-all ${view === 'dashboard' ? 'bg-[#7A1B8F] text-[#FFD700]' : 'text-slate-400 hover:text-white'}`}>
            <LayoutDashboard size={20} /> Visão Geral
          </button>
          <button onClick={() => setView('promotores')} className={`w-full flex items-center gap-3 p-3 rounded-xl font-bold transition-all ${view === 'promotores' ? 'bg-[#7A1B8F] text-[#FFD700]' : 'text-slate-400 hover:text-white'}`}>
            <Users size={20} /> Promotores
          </button>
        </nav>
      </aside>

      {/* CONTEÚDO */}
      <main className="flex-1 md:ml-64 p-4 md:p-8">
        
        {/* === VIEW: DASHBOARD (HOME) === */}
        {view === 'dashboard' && (
          <div className="animate-in fade-in duration-500">
            <h2 className="text-2xl font-bold text-[#2D0A35] mb-6">Dashboard</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-md border-l-8 border-[#7A1B8F]">
                <span className="text-xs font-bold text-slate-400 uppercase">Total Cadastrados</span>
                <div className="text-5xl font-black text-[#2D0A35] mt-2">{stats.total}</div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-md border-l-8 border-[#FFD700]">
                <span className="text-xs font-bold text-slate-400 uppercase">Aguardando Análise</span>
                <div className="text-5xl font-black text-[#2D0A35] mt-2">{stats.pendentes}</div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-md">
                <span className="text-xs font-bold text-slate-400 uppercase">Gênero</span>
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-xs font-bold"><span>Mulheres</span> <span>{stats.mulheres}</span></div>
                  <div className="h-2 bg-slate-100 rounded-full"><div className="h-full bg-pink-500 rounded-full" style={{width: `${(stats.mulheres/stats.total)*100}%`}}></div></div>
                  <div className="flex justify-between text-xs font-bold"><span>Homens</span> <span>{stats.homens}</span></div>
                  <div className="h-2 bg-slate-100 rounded-full"><div className="h-full bg-blue-500 rounded-full" style={{width: `${(stats.homens/stats.total)*100}%`}}></div></div>
                </div>
              </div>
            </div>
            
            <div className="mt-10 p-10 bg-white rounded-3xl border border-dashed border-slate-300 text-center">
              <p className="text-slate-400 font-bold">Mais métricas em breve...</p>
            </div>
          </div>
        )}

        {/* === VIEW: PROMOTORES (LISTA) === */}
        {view === 'promotores' && (
          <div className="animate-in fade-in duration-500">
            <h2 className="text-2xl font-bold text-[#2D0A35] mb-6">Banco de Talentos</h2>
            
            {/* Filtros */}
            <div className="bg-white p-4 rounded-2xl shadow-sm mb-6 flex flex-wrap gap-3 items-center border border-slate-200 sticky top-0 z-20">
              <div className="flex items-center bg-slate-100 rounded-lg px-3 py-2 flex-1 min-w-[200px]">
                <Search size={16} className="text-slate-400 mr-2"/>
                <input placeholder="Buscar nome..." className="bg-transparent text-sm w-full outline-none" value={busca} onChange={e => setBusca(e.target.value)}/>
              </div>
              
              <select className="bg-slate-50 border p-2 rounded-lg text-sm outline-none" value={filtroUf} onChange={e => {setFiltroUf(e.target.value); setFiltroCidade('');}}>
                <option value="">UF: Todos</option>
                {estadosBrasileiros.map(uf => <option key={uf} value={uf}>{uf}</option>)}
              </select>

              <select className="bg-slate-50 border p-2 rounded-lg text-sm outline-none" value={filtroCidade} onChange={e => setFiltroCidade(e.target.value)} disabled={!filtroUf}>
                <option value="">Cidade: Todas</option>
                {cidadesDisponiveis.map(c => <option key={c} value={c}>{c}</option>)}
              </select>

              <select className="bg-slate-50 border p-2 rounded-lg text-sm outline-none" value={filtroStatus} onChange={e => setFiltroStatus(e.target.value)}>
                <option value="todos">Status: Todos</option>
                <option value="pendente">Pendente</option>
                <option value="aprovado">Aprovado</option>
              </select>
            </div>

            {/* Grid de Cards ROXOS */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {candidatosFiltrados.map((cand) => (
                <div key={cand.id} className="bg-[#4a1057] rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all group relative border border-[#7A1B8F]">
                  
                  {/* Foto Menor */}
                  <div className="aspect-[3/4] bg-black/50 relative overflow-hidden">
                    <img src={cand.foto_perfil_url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100" />
                    
                    {/* Status Badge */}
                    <div className={`absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase ${cand.status === 'aprovado' ? 'bg-green-500 text-white' : 'bg-yellow-400 text-black'}`}>
                      {cand.status}
                    </div>
                  </div>

                  {/* Info Card */}
                  <div className="p-3 text-white">
                    <h3 className="font-bold text-sm truncate">{cand.nome}</h3>
                    <div className="flex items-center gap-1 text-[10px] text-white/70 mb-2">
                      <MapPin size={10}/> {cand.cidade}-{cand.estado}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 mt-3">
                      <button onClick={() => openEdit(cand)} className="bg-white/10 hover:bg-white/20 py-1.5 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition-colors">
                        <Edit size={12}/> Detalhes
                      </button>
                      <button onClick={() => handleDelete(cand.id)} className="bg-red-500/20 hover:bg-red-500 py-1.5 rounded-lg text-[10px] font-bold text-red-200 hover:text-white flex items-center justify-center gap-1 transition-colors">
                        <Trash2 size={12}/> Excluir
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* === MODAL DE EDIÇÃO / DETALHES === */}
      {modalOpen && editingCandidato && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300">
            {/* Header Modal */}
            <div className="bg-[#7A1B8F] p-4 flex justify-between items-center">
              <h3 className="text-white font-bold">Editar Candidato</h3>
              <button onClick={() => setModalOpen(false)} className="text-white/70 hover:text-white"><X size={20}/></button>
            </div>
            
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="flex gap-4">
                <img src={editingCandidato.foto_perfil_url} className="w-20 h-20 rounded-full object-cover border-2 border-[#7A1B8F]" />
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase">Nome</label>
                  <input className="w-full font-bold text-lg border-b border-slate-300 outline-none focus:border-[#7A1B8F]" 
                    value={editingCandidato.nome} 
                    onChange={e => setEditingCandidato({...editingCandidato, nome: e.target.value})}
                  />
                  <div className="mt-2 flex gap-2">
                    <a href={editingCandidato.foto_perfil_url} target="_blank" className="text-xs text-blue-500 hover:underline">Ver Foto 1</a>
                    {editingCandidato.fotos_extras_urls?.map((url:string, i:number) => (
                      <a key={i} href={url} target="_blank" className="text-xs text-blue-500 hover:underline">Foto {i+2}</a>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase">Status</label>
                  <select className="w-full p-2 bg-slate-100 rounded-lg text-sm" 
                    value={editingCandidato.status}
                    onChange={e => setEditingCandidato({...editingCandidato, status: e.target.value})}
                  >
                    <option value="pendente">🟡 Pendente</option>
                    <option value="aprovado">🟢 Aprovado</option>
                    <option value="arquivado">⚫ Arquivado</option>
                  </select>
                </div>
                <div>
                   <label className="block text-xs font-bold text-slate-500 uppercase">WhatsApp</label>
                   <input className="w-full p-2 bg-slate-100 rounded-lg text-sm"
                     value={editingCandidato.whatsapp}
                     onChange={e => setEditingCandidato({...editingCandidato, whatsapp: e.target.value})}
                   />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase">Nota 10 (Habilidade)</label>
                <textarea className="w-full p-3 bg-slate-50 border rounded-xl text-sm h-20"
                  value={editingCandidato.nota10}
                  onChange={e => setEditingCandidato({...editingCandidato, nota10: e.target.value})}
                />
              </div>

               {/* Dados Bancários (Apenas Leitura) */}
               <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-xs font-bold text-slate-500 uppercase block mb-1">Dados Bancários / Pix</span>
                <pre className="text-xs text-slate-600 whitespace-pre-wrap font-mono">
                  {JSON.stringify(editingCandidato.dados_bancarios, null, 2)}
                </pre>
              </div>
            </div>

            {/* Footer Modal */}
            <div className="p-4 border-t bg-slate-50 flex justify-end gap-2">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-slate-500 font-bold text-sm hover:bg-slate-200 rounded-lg">Cancelar</button>
              <button onClick={handleSaveEdit} className="px-6 py-2 bg-[#7A1B8F] text-white font-bold text-sm rounded-lg flex items-center gap-2 hover:bg-purple-900">
                <Save size={16}/> Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

