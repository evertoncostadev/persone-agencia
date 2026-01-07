"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { 
  LayoutDashboard, Users, UserCheck, UserX, Search, Filter, 
  MapPin, Phone, MessageCircle, ChevronDown, Award, Calendar
} from 'lucide-react';

export default function AdminDashboard() {
  // --- ESTADOS ---
  const [candidatos, setCandidatos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [senha, setSenha] = useState('');
  const [logado, setLogado] = useState(false); // Mude para true para testar sem senha

  // Filtros
  const [busca, setBusca] = useState('');
  const [filtroCidade, setFiltroCidade] = useState('');
  const [filtroGenero, setFiltroGenero] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos');

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
      .order('created_at', { ascending: false }); // Mais recentes primeiro
    
    if (error) console.error('Erro ao buscar:', error);
    else setCandidatos(data || []);
    setLoading(false);
  };

  // --- 2. LÓGICA DE FILTROS (TEMPO REAL) ---
  const candidatosFiltrados = candidatos.filter((c) => {
    const matchNome = c.nome.toLowerCase().includes(busca.toLowerCase());
    const matchCidade = filtroCidade ? c.cidade === filtroCidade : true;
    const matchGenero = filtroGenero ? c.genero === filtroGenero : true;
    const matchStatus = filtroStatus === 'todos' ? true : c.status === filtroStatus;
    
    return matchNome && matchCidade && matchGenero && matchStatus;
  });

  // --- 3. DADOS PARA OS GRÁFICOS (ÍNDICES) ---
  const stats = {
    total: candidatos.length,
    pendentes: candidatos.filter(c => c.status === 'pendente').length,
    aprovados: candidatos.filter(c => c.status === 'aprovado').length,
    homens: candidatos.filter(c => c.genero?.includes('Homem')).length,
    mulheres: candidatos.filter(c => c.genero?.includes('Mulher')).length,
  };

  // --- 4. AÇÕES DE ADMIN ---
  const handleAprovar = async (id: number, nome: string, telefone: string) => {
    // 1. Atualiza no banco
    const { error } = await supabase.from('candidatos').update({ status: 'aprovado' }).eq('id', id);
    
    if (!error) {
      // 2. Atualiza a tela sem recarregar
      setCandidatos(prev => prev.map(c => c.id === id ? { ...c, status: 'aprovado' } : c));
      
      // 3. Gera link do Zap com convite
      const linkGrupo = "https://chat.whatsapp.com/SEU_LINK_DO_GRUPO_AQUI"; // Coloque seu link real aqui
      const mensagem = `Olá ${nome.split(' ')[0]}! Parabéns, seu perfil na Persone foi aprovado! 🤩 Aqui está o link para entrar no nosso grupo exclusivo de vagas: ${linkGrupo}`;
      const urlZap = `https://wa.me/55${telefone.replace(/\D/g, '')}?text=${encodeURIComponent(mensagem)}`;
      
      window.open(urlZap, '_blank');
    }
  };

  const handleArquivar = async (id: number) => {
    const { error } = await supabase.from('candidatos').update({ status: 'arquivado' }).eq('id', id);
    if (!error) {
      setCandidatos(prev => prev.map(c => c.id === id ? { ...c, status: 'arquivado' } : c));
    }
  };

  // --- TELA DE LOGIN SIMPLES ---
  if (!logado) {
    return (
      <div className="min-h-screen bg-[#7A1B8F] flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md text-center">
          <h1 className="text-2xl font-bold text-[#7A1B8F] mb-4">Área Restrita 🔒</h1>
          <input 
            type="password" 
            placeholder="Senha de Acesso" 
            className="w-full p-3 border-2 border-slate-200 rounded-xl mb-4 text-center text-slate-800 outline-none focus:border-[#FFD700]"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />
          <button 
            onClick={() => senha === "admin123" ? setLogado(true) : alert("Senha incorreta")} // SENHA TEMPORÁRIA
            className="w-full bg-[#FFD700] text-[#7A1B8F] font-black py-3 rounded-xl uppercase hover:scale-105 transition-transform"
          >
            Entrar
          </button>
        </div>
      </div>
    );
  }

  // --- DASHBOARD PRINCIPAL ---
  return (
    <div className="flex min-h-screen bg-slate-100 font-sans text-slate-800">
      
      {/* SIDEBAR (LATERAL ESQUERDA) */}
      <aside className="w-64 bg-[#2D0A35] text-white hidden md:flex flex-col fixed h-full z-10">
        <div className="p-6">
          <h1 className="text-2xl font-serif italic font-bold text-[#FFD700]">persone</h1>
          <p className="text-[10px] tracking-widest opacity-70 uppercase">Painel Admin</p>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4">
          <div className="flex items-center gap-3 p-3 bg-[#7A1B8F] rounded-xl text-[#FFD700] font-bold cursor-pointer shadow-lg">
            <Users size={20} /> Promotores
          </div>
          <div className="flex items-center gap-3 p-3 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl cursor-not-allowed transition-all">
            <LayoutDashboard size={20} /> Eventos (Breve)
          </div>
        </nav>

        <div className="p-6 text-xs text-center opacity-40">
          v1.0.0
        </div>
      </aside>

      {/* CONTEÚDO PRINCIPAL (DIREITA) */}
      <main className="flex-1 md:ml-64 p-4 md:p-8">
        
        {/* 1. CABEÇALHO E ÍNDICES (GRÁFICOS SIMPLIFICADOS) */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-700 mb-6">Visão Geral</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            
            {/* Card Total */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <div className="flex justify-between items-start mb-2">
                <span className="text-slate-500 text-xs font-bold uppercase">Total Base</span>
                <Users className="text-[#7A1B8F] opacity-20" />
              </div>
              <div className="text-4xl font-black text-slate-800">{stats.total}</div>
            </div>

            {/* Card Pendentes (Atenção) */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-yellow-400">
              <div className="flex justify-between items-start mb-2">
                <span className="text-yellow-600 text-xs font-bold uppercase">Para Analisar</span>
                <ClockIcon className="text-yellow-400" />
              </div>
              <div className="text-4xl font-black text-slate-800">{stats.pendentes}</div>
              <p className="text-xs text-slate-400 mt-1">Requerem atenção</p>
            </div>

            {/* Card Gênero (Barra Visual) */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 col-span-1 md:col-span-2">
              <span className="text-slate-500 text-xs font-bold uppercase mb-4 block">Distribuição</span>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1"><span>Mulheres</span> <span>{stats.mulheres}</span></div>
                  <div className="w-full bg-slate-100 rounded-full h-2"><div className="bg-pink-400 h-2 rounded-full" style={{ width: `${(stats.mulheres / stats.total) * 100}%` }}></div></div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1"><span>Homens</span> <span>{stats.homens}</span></div>
                  <div className="w-full bg-slate-100 rounded-full h-2"><div className="bg-blue-400 h-2 rounded-full" style={{ width: `${(stats.homens / stats.total) * 100}%` }}></div></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. BARRA DE FILTROS INTELIGENTE */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-6 sticky top-2 z-20">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            
            {/* Busca Nome */}
            <div className="flex items-center bg-slate-100 rounded-xl px-4 py-2 w-full md:w-1/3">
              <Search className="text-slate-400 mr-2" size={18} />
              <input 
                placeholder="Buscar por nome..." 
                className="bg-transparent outline-none text-sm w-full"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </div>

            {/* Filtros Dropdown */}
            <div className="flex gap-2 w-full md:w-auto overflow-x-auto">
              <select 
                className="bg-slate-50 border border-slate-200 text-slate-600 text-sm rounded-xl px-4 py-2 outline-none focus:border-[#7A1B8F]"
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value)}
              >
                <option value="todos">Status: Todos</option>
                <option value="pendente">🟡 Pendentes</option>
                <option value="aprovado">🟢 Aprovados</option>
                <option value="arquivado">⚫ Arquivados</option>
              </select>

              <select 
                className="bg-slate-50 border border-slate-200 text-slate-600 text-sm rounded-xl px-4 py-2 outline-none focus:border-[#7A1B8F]"
                value={filtroCidade}
                onChange={(e) => setFiltroCidade(e.target.value)}
              >
                <option value="">Cidade: Todas</option>
                {/* Aqui extraímos cidades únicas da lista */}
                {Array.from(new Set(candidatos.map(c => c.cidade))).map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              <select 
                className="bg-slate-50 border border-slate-200 text-slate-600 text-sm rounded-xl px-4 py-2 outline-none focus:border-[#7A1B8F]"
                value={filtroGenero}
                onChange={(e) => setFiltroGenero(e.target.value)}
              >
                <option value="">Gênero: Todos</option>
                <option value="Mulher Cisgênero">Mulheres Cis</option>
                <option value="Homem Cisgênero">Homens Cis</option>
                {/* Adicione outros se precisar */}
              </select>
            </div>
          </div>
        </div>

        {/* 3. LISTA DE CANDIDATOS (GRID) */}
        {loading ? (
           <div className="text-center py-20 text-slate-400"><Loader2 className="animate-spin mx-auto mb-2"/> Carregando talentos...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
            {candidatosFiltrados.map((cand) => (
              <div key={cand.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl transition-all group relative">
                
                {/* Badge de Status */}
                <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-[10px] font-bold uppercase z-10 
                  ${cand.status === 'aprovado' ? 'bg-green-100 text-green-700' : cand.status === 'arquivado' ? 'bg-gray-100 text-gray-500' : 'bg-yellow-100 text-yellow-700'}`}>
                  {cand.status}
                </div>

                {/* Foto */}
                <div className="aspect-[3/4] bg-slate-100 relative">
                  {cand.foto_perfil_url ? (
                    <img src={cand.foto_perfil_url} className="w-full h-full object-cover" alt={cand.nome} />
                  ) : (
                    <div className="flex items-center justify-center h-full text-slate-300"><UserX size={48}/></div>
                  )}
                  {/* Overlay com info rápida */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 text-white">
                    <h3 className="font-bold text-lg leading-tight">{cand.nome}</h3>
                    <div className="flex items-center gap-1 text-xs opacity-90 mt-1">
                      <MapPin size={12}/> {cand.cidade}
                    </div>
                  </div>
                </div>

                {/* Corpo do Card */}
                <div className="p-4 space-y-3">
                  <div className="flex justify-between text-xs text-slate-500 font-bold uppercase tracking-wider">
                    <span>{cand.altura}m</span>
                    <span>Man: {cand.manequim}</span>
                    <span>{new Date().getFullYear() - new Date(cand.nascimento).getFullYear()} anos</span>
                  </div>
                  
                  {/* Nota 10 (Habilidade) */}
                  <div className="bg-purple-50 p-2 rounded-lg text-xs text-[#7A1B8F]">
                    <span className="font-bold">Nota 10:</span> {cand.nota10?.substring(0, 50)}...
                  </div>

                  {/* Botões de Ação */}
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {cand.status === 'pendente' && (
                       <button 
                         onClick={() => handleAprovar(cand.id, cand.nome, cand.whatsapp)}
                         className="col-span-2 bg-green-500 hover:bg-green-600 text-white py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2"
                       >
                         <CheckCircle size={14}/> Aprovar & Chamar
                       </button>
                    )}
                    
                    {cand.status === 'aprovado' && (
                       <button 
                         onClick={() => window.open(`https://wa.me/55${cand.whatsapp.replace(/\D/g, '')}`, '_blank')}
                         className="col-span-2 bg-[#25D366] hover:bg-green-600 text-white py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2"
                       >
                         <MessageCircle size={14}/> WhatsApp
                       </button>
                    )}

                    {cand.status !== 'arquivado' && (
                      <button 
                        onClick={() => handleArquivar(cand.id)}
                        className="col-span-2 border border-slate-200 text-slate-400 hover:bg-slate-50 py-2 rounded-xl text-xs font-bold"
                      >
                        Arquivar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Carregar Mais (Placeholder visual, pois o scroll já carrega tudo nesse exemplo simples) */}
        {candidatosFiltrados.length > 20 && (
          <div className="flex justify-center mt-8">
             <ChevronDown className="animate-bounce text-slate-400"/>
          </div>
        )}
      </main>
    </div>
  );
}

// Ícones adicionais
function ClockIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
  )
}
function CheckCircle(props: any) {
    return (
      <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
    )
  }
function Loader2(props: any) {
    return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
    )
}