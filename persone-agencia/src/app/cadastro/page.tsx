"use client";

import React, { useState, useEffect } from 'react';
import { User, Calendar, MapPin, CreditCard, Sparkles, Camera, AlertCircle, Loader2, Plus, X, Banknote, QrCode, AlertTriangle, Image as ImageIcon, UploadCloud, Trash2, CheckCircle } from 'lucide-react';

export default function CadastroPersone() {
  const [step, setStep] = useState(1);
  const totalSteps = 5;
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loadingCep, setLoadingCep] = useState(false);
  
  const [maxDate, setMaxDate] = useState('');

  useEffect(() => {
    const today = new Date();
    const minAgeDate = new Date(today.getFullYear() - 16, today.getMonth(), today.getDate());
    setMaxDate(minAgeDate.toISOString().split('T')[0]);
  }, []);

  const [cidadesPrincipal, setCidadesPrincipal] = useState<string[]>([]);
  const [cidadesExtra, setCidadesExtra] = useState<string[]>([]);
  const [extraUf, setExtraUf] = useState('');
  const [extraCidade, setExtraCidade] = useState('');
  const [listaHospedagem, setListaHospedagem] = useState<string[]>([]);

  // --- ESTADOS PARA FOTOS ---
  const [fotoPerfil, setFotoPerfil] = useState<File | null>(null);
  const [previewPerfil, setPreviewPerfil] = useState<string | null>(null);
  
  const [fotosExtras, setFotosExtras] = useState<File[]>([]);
  const [previewsExtras, setPreviewsExtras] = useState<string[]>([]);

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const MAX_PHOTOS_COUNT = 5;

  const [formData, setFormData] = useState({
    nome: '', email: '', instagram: '', whatsapp: '', grupo: '', 
    genero: '', generoOutro: '', 
    nascimento: '', altura: '', manequim: '', sapato: '', idiomas: '',
    endereco: '', numero: '', bairro: '', cidade: '', estado: '', cep: '', hospedagem: '',
    mei: '', 
    tipoPagamento: '',
    tipoChavePix: '', 
    chavePix: '',
    banco: '', 
    bancoOutro: '',
    agencia: '', 
    contaBancaria: '', 
    titularConta: '',
    nota10: '', bio: ''
  });

  const listaIdiomas = ["Inglês", "Espanhol", "Libras", "Francês", "Italiano", "Alemão", "Outros"];
  
  const listaGeneros = [
    "Mulher Cisgênero", "Mulher Transgênero", "Homem Cisgênero", "Homem Transgênero", "Não-binário", "Agênero", "Gênero Fluido", "Travesti", "Prefiro não informar", "Outro"
  ];

  const listaBancos = [
    "Banco do Brasil", "Bradesco", "Caixa Econômica", "Itaú", "Santander", "Nubank", "Banco Inter", "C6 Bank", "Banco Original", "Neon", "Banco Pan", "Sicoob", "Sicredi", "Mercado Pago", "PagBank", "Outro"
  ];

  const estadosBrasileiros = [
    { sigla: 'AC', nome: 'Acre' }, { sigla: 'AL', nome: 'Alagoas' }, { sigla: 'AP', nome: 'Amapá' },
    { sigla: 'AM', nome: 'Amazonas' }, { sigla: 'BA', nome: 'Bahia' }, { sigla: 'CE', nome: 'Ceará' },
    { sigla: 'DF', nome: 'Distrito Federal' }, { sigla: 'ES', nome: 'Espírito Santo' }, { sigla: 'GO', nome: 'Goiás' },
    { sigla: 'MA', nome: 'Maranhão' }, { sigla: 'MT', nome: 'Mato Grosso' }, { sigla: 'MS', nome: 'Mato Grosso do Sul' },
    { sigla: 'MG', nome: 'Minas Gerais' }, { sigla: 'PA', nome: 'Pará' }, { sigla: 'PB', nome: 'Paraíba' },
    { sigla: 'PR', nome: 'Paraná' }, { sigla: 'PE', nome: 'Pernambuco' }, { sigla: 'PI', nome: 'Piauí' },
    { sigla: 'RJ', nome: 'Rio de Janeiro' }, { sigla: 'RN', nome: 'Rio Grande do Norte' }, { sigla: 'RS', nome: 'Rio Grande do Sul' },
    { sigla: 'RO', nome: 'Rondônia' }, { sigla: 'RR', nome: 'Roraima' }, { sigla: 'SC', nome: 'Santa Catarina' },
    { sigla: 'SP', nome: 'São Paulo' }, { sigla: 'SE', nome: 'Sergipe' }, { sigla: 'TO', nome: 'Tocantins' }
  ];

  // --- MÁSCARAS E VALIDAÇÕES ---
  const formatNameOnlyLetters = (value: string) => value.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ\s]/g, "");
  const formatWhatsApp = (value: string) => { const nums = value.replace(/\D/g, "").slice(0, 11); if (nums.length <= 2) return nums; if (nums.length <= 7) return `(${nums.slice(0, 2)}) ${nums.slice(2)}`; return `(${nums.slice(0, 2)}) ${nums.slice(2, 7)}-${nums.slice(7, 11)}`; };
  const formatCPF = (value: string) => value.replace(/\D/g, '').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})/, '$1-$2').replace(/(-\d{2})\d+?$/, '$1');
  const formatCEP = (value: string) => { const nums = value.replace(/\D/g, "").slice(0, 8); if (nums.length <= 5) return nums; return `${nums.slice(0, 5)}-${nums.slice(5)}`; };
  const formatAltura = (value: string) => { const nums = value.replace(/\D/g, "").slice(0, 3); if (nums.length >= 2) return `${nums.slice(0, 1)},${nums.slice(1)}`; return nums; };
  const formatNumberOnly = (value: string, limit: number) => value.replace(/\D/g, "").slice(0, limit);
  const formatContaBancaria = (value: string) => value.replace(/[^0-9-]/g, "").slice(0, 12);

  // --- API ---
  const buscarCidadesPorEstado = async (uf: string, setListaDestino: React.Dispatch<React.SetStateAction<string[]>>) => { if (!uf) return; try { const response = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios`); const data = await response.json(); const nomesCidades = data.map((c: any) => c.nome).sort(); setListaDestino(nomesCidades); } catch (error) { console.error("Erro ao buscar cidades", error); } };
  const buscarCep = async (cep: string) => { const cepLimpo = cep.replace(/\D/g, ''); if (cepLimpo.length !== 8) return; setLoadingCep(true); try { const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`); const data = await response.json(); if (!data.erro) { setFormData(prev => ({ ...prev, endereco: data.logradouro, bairro: data.bairro, estado: data.uf, cidade: data.localidade })); await buscarCidadesPorEstado(data.uf, setCidadesPrincipal); setErrors(prev => ({ ...prev, cep: '', endereco: '', bairro: '', cidade: '', estado: '' })); } else { setErrors(prev => ({ ...prev, cep: 'CEP não encontrado.' })); } } catch { setErrors(prev => ({ ...prev, cep: 'Erro ao buscar CEP.' })); } finally { setLoadingCep(false); } };

  // --- HANDLERS DE FORMULÁRIO GERAL ---
  const handleAddCidadeExtra = () => { if (extraUf && extraCidade && !listaHospedagem.includes(`${extraCidade} - ${extraUf}`)) { const novaLista = [...listaHospedagem, `${extraCidade} - ${extraUf}`]; setListaHospedagem(novaLista); setFormData(prev => ({ ...prev, hospedagem: novaLista.join(', ') })); setExtraCidade(''); } };
  const handleRemoveCidadeExtra = (item: string) => { const novaLista = listaHospedagem.filter(i => i !== item); setListaHospedagem(novaLista); setFormData(prev => ({ ...prev, hospedagem: novaLista.join(', ') })); };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    if (name === "nome" || name === "titularConta") setFormData(prev => ({ ...prev, [name]: formatNameOnlyLetters(value) }));
    else if (name === "whatsapp" || (name === "chavePix" && formData.tipoChavePix === 'telefone')) setFormData(prev => ({ ...prev, [name]: formatWhatsApp(value) }));
    else if (name === "cep") { const novoCep = formatCEP(value); setFormData(prev => ({ ...prev, [name]: novoCep })); if (novoCep.length === 9) buscarCep(novoCep); }
    else if (name === "altura") setFormData(prev => ({ ...prev, [name]: formatAltura(value) }));
    else if (name === "manequim" || name === "sapato") setFormData(prev => ({ ...prev, [name]: formatNumberOnly(value, 2) }));
    else if (name === "estado") { setFormData(prev => ({ ...prev, estado: value, cidade: '' })); buscarCidadesPorEstado(value, setCidadesPrincipal); }
    else if (name === "chavePix" && formData.tipoChavePix === 'cpf') setFormData(prev => ({ ...prev, chavePix: formatCPF(value) }));
    else if (name === "agencia") setFormData(prev => ({ ...prev, [name]: formatNumberOnly(value, 4) }));
    else if (name === "contaBancaria") setFormData(prev => ({ ...prev, [name]: formatContaBancaria(value) }));
    else setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePaymentTypeChange = (tipo: string) => { setFormData(prev => ({ ...prev, tipoPagamento: tipo, tipoChavePix: '', chavePix: '', banco: '', bancoOutro: '', agencia: '', contaBancaria: '', titularConta: '' })); setErrors(prev => ({ ...prev, tipoPagamento: '', chavePix: '', banco: '', titularConta: '' })); };
  const toggleIdioma = (idioma: string) => { const atuais = formData.idiomas ? formData.idiomas.split(',').filter(i => i) : []; if (atuais.includes(idioma)) setFormData(prev => ({ ...prev, idiomas: atuais.filter(i => i !== idioma).join(',') })); else setFormData(prev => ({ ...prev, idiomas: [...atuais, idioma].join(',') })); };

  // --- HANDLERS DE FOTOS ---
  const handleProfileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setErrors(prev => ({ ...prev, fotoPerfil: 'O arquivo deve ser uma imagem.' })); return; }
    if (file.size > MAX_FILE_SIZE) { setErrors(prev => ({ ...prev, fotoPerfil: 'A imagem deve ter no máximo 5MB.' })); return; }
    setFotoPerfil(file); setPreviewPerfil(URL.createObjectURL(file)); setErrors(prev => ({ ...prev, fotoPerfil: '' }));
  };

  const handleExtrasUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    if (fotosExtras.length + files.length > MAX_PHOTOS_COUNT) { setErrors(prev => ({ ...prev, fotosExtras: `Você só pode enviar no máximo ${MAX_PHOTOS_COUNT} fotos no total.` })); return; }
    const validFiles: File[] = [];
    let hasError = false;
    files.forEach(file => {
      if (!file.type.startsWith('image/')) { setErrors(prev => ({ ...prev, fotosExtras: 'Apenas arquivos de imagem são permitidos.' })); hasError = true; }
      else if (file.size > MAX_FILE_SIZE) { setErrors(prev => ({ ...prev, fotosExtras: `A imagem ${file.name} excede 5MB.` })); hasError = true; }
      else { validFiles.push(file); }
    });
    if (!hasError) {
      const newPreviews = validFiles.map(file => URL.createObjectURL(file));
      setFotosExtras(prev => [...prev, ...validFiles]);
      setPreviewsExtras(prev => [...prev, ...newPreviews]);
      setErrors(prev => ({ ...prev, fotosExtras: '' }));
    }
  };

  const removeExtraPhoto = (index: number) => {
    const newFiles = fotosExtras.filter((_, i) => i !== index);
    const newPreviews = previewsExtras.filter((_, i) => i !== index);
    URL.revokeObjectURL(previewsExtras[index]);
    setFotosExtras(newFiles); setPreviewsExtras(newPreviews);
  };

  const removeProfilePhoto = () => { if (previewPerfil) URL.revokeObjectURL(previewPerfil); setFotoPerfil(null); setPreviewPerfil(null); };

  // --- VALIDAÇÃO ---
  const isEmailValid = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isPhoneComplete = (phone: string) => phone.replace(/\D/g, '').length === 11;
  const isCpfValid = (cpf: string) => cpf.replace(/\D/g, '').length === 11;
  const isRandomKeyValid = (key: string) => /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(key);

  const validateCurrentStep = () => {
    const newErrors: Record<string, string> = {};
    if (step === 1) {
        if (formData.nome.length < 3) newErrors.nome = "Nome inválido";
        if (!formData.email.includes('@')) newErrors.email = "Email inválido";
        if (!formData.instagram) newErrors.instagram = "Obrigatório";
        if (!formData.genero) newErrors.genero = "Obrigatório";
        if (formData.genero === "Outro" && !formData.generoOutro) newErrors.genero = "Especifique";
        if (!isPhoneComplete(formData.whatsapp)) newErrors.whatsapp = "Incompleto";
        if (!formData.grupo) newErrors.grupo = "Obrigatório";
    }
    if (step === 2) {
        if (!formData.nascimento) newErrors.nascimento = "Obrigatório";
        if (formData.altura.length < 3) newErrors.altura = "Obrigatório";
        if (!formData.manequim) newErrors.manequim = "Obrigatório";
        if (!formData.sapato) newErrors.sapato = "Obrigatório";
    }
    if (step === 3) {
        if (formData.cep.length < 9) newErrors.cep = "Incompleto";
        if (!formData.endereco) newErrors.endereco = "Obrigatório";
        if (!formData.numero) newErrors.numero = "Obrigatório";
        if (!formData.estado) newErrors.estado = "Obrigatório";
        if (!formData.cidade) newErrors.cidade = "Obrigatório";
    }
    if (step === 4) {
        if (!formData.mei) newErrors.mei = "Obrigatório";
        if (!formData.tipoPagamento) newErrors.tipoPagamento = "Selecione";
        if (formData.tipoPagamento === 'pix') {
            if (!formData.tipoChavePix) newErrors.tipoChavePix = "Selecione";
            else if (!formData.chavePix) newErrors.chavePix = "Digite a chave";
            else {
                if (formData.tipoChavePix === 'email' && !isEmailValid(formData.chavePix)) newErrors.chavePix = "Inválido";
                if (formData.tipoChavePix === 'cpf' && !isCpfValid(formData.chavePix)) newErrors.chavePix = "Inválido";
                if (formData.tipoChavePix === 'telefone' && !isPhoneComplete(formData.chavePix)) newErrors.chavePix = "Inválido";
                if (formData.tipoChavePix === 'aleatoria' && !isRandomKeyValid(formData.chavePix)) newErrors.chavePix = "Inválido";
            }
            if (!formData.titularConta) newErrors.titularConta = "Obrigatório";
        }
        if (formData.tipoPagamento === 'conta') {
            if (!formData.banco) newErrors.banco = "Selecione";
            if (formData.banco === 'Outro' && !formData.bancoOutro) newErrors.banco = "Digite";
            if (!formData.titularConta) newErrors.titularConta = "Obrigatório";
            if (formData.agencia.length < 3) newErrors.agencia = "Inválido";
            if (formData.contaBancaria.length < 4) newErrors.contaBancaria = "Inválido";
        }
    }
    if (step === 5) {
      if (!fotoPerfil) newErrors.fotoPerfil = "A foto de perfil é obrigatória.";
      if (fotosExtras.length < 2) newErrors.fotosExtras = "Envie pelo menos 2 fotos de corpo.";
      if (formData.nota10.length < 3) newErrors.nota10 = "Conta pra gente no que você é bom!";
    }
    return newErrors;
  };

  const handleNext = () => {
    const currentErrors = validateCurrentStep();
    if (Object.keys(currentErrors).length > 0) { setErrors(currentErrors); return; }
    if (step === totalSteps) { 
      setIsSuccess(true); 
    } else { 
      setStep(step + 1); window.scrollTo(0, 0); 
    }
  };

  const ErrorMsg = ({ field }: { field: string }) => (errors[field] ? <div className="flex items-center gap-1 text-red-500 text-xs font-bold mt-1 animate-pulse"><AlertCircle size={12} /> {errors[field]}</div> : null);
  const Label = ({ text }: { text: string }) => (<label className="block text-xs font-bold text-slate-600 mb-1 uppercase tracking-wide ml-1">{text}</label>);

  return (
    <div className="min-h-screen bg-slate-200 py-10 px-4 flex items-center justify-center font-sans">
      <div className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden text-slate-900">
        
        {/* Header - Oculta se for sucesso */}
        {!isSuccess && (
          <div className="p-8 bg-[#7A1B8F] text-white text-center">
            <h1 className="text-5xl font-serif font-bold text-[#FFD700] italic mb-2">persone</h1>
            <p className="text-[10px] tracking-[0.3em] uppercase opacity-90 font-bold">Cadastro de Elenco & Eventos</p>
            <div className="flex items-center gap-2 mt-8">{[1, 2, 3, 4, 5].map((num) => (<div key={num} className={`flex-1 h-2 rounded-full transition-all duration-500 ${step >= num ? 'bg-[#FFD700]' : 'bg-white/20'}`} />))}</div>
          </div>
        )}

        {/* TELA DE SUCESSO (RETORNO VISUAL) - AGORA ROXA */}
        {isSuccess ? (
          <div className="p-10 flex flex-col items-center justify-center text-center space-y-6 animate-in zoom-in-95 duration-500 bg-[#7A1B8F]">
            
            {/* Ícone com borda amarela */}
            <div className="w-24 h-24 bg-transparent border-4 border-[#FFD700] rounded-full flex items-center justify-center mb-2 shadow-lg shadow-purple-900/50">
              <CheckCircle className="text-[#FFD700]" size={64} />
            </div>
            
            {/* Título Amarelo */}
            <h2 className="text-3xl font-serif font-bold text-[#FFD700] italic">Cadastro Recebido!</h2>
            
            {/* Texto Branco com Nome Amarelo */}
            <div className="space-y-2 text-white">
              <p>Obrigado, <span className="font-bold text-[#FFD700]">{formData.nome.split(' ')[0]}</span>!</p>
              <p className="opacity-90">Seus dados foram enviados com sucesso para nossa equipe.</p>
            </div>

            {/* Box de Informação Translúcido com Borda Amarela */}
            <div className="bg-white/10 border-2 border-[#FFD700] p-6 rounded-2xl w-full max-w-sm backdrop-blur-sm">
              <div className="flex flex-col gap-2">
                <span className="text-xs font-bold text-[#FFD700]/80 uppercase tracking-widest">Prazo de Retorno</span>
                <span className="text-4xl font-black text-[#FFD700]">72 Horas</span>
                <p className="text-xs text-white mt-1 opacity-90">Fique atento ao seu e-mail: <br/><strong className="text-[#FFD700]">{formData.email}</strong></p>
              </div>
            </div>

            {/* Botão Voltar Branco/Amarelo */}
            <button 
              onClick={() => window.location.reload()} 
              className="mt-8 text-white text-xs font-bold uppercase hover:text-[#FFD700] transition-colors tracking-widest"
            >
              Voltar ao início
            </button>
          </div>
        ) : (
          /* FORMULÁRIO NORMAL */
          <div className="p-8">
            <div className="space-y-6">
              
              {/* ETAPA 1 */}
              {step === 1 && (
                 <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-4">
                 <div className="flex items-center gap-2 text-[#7A1B8F] font-bold uppercase text-xs tracking-widest mb-4"><User size={18}/> Identificação e Contato</div>
                 <div><Label text="Nome Completo (Sem números) *" /><input name="nome" placeholder="Ex: Maria da Silva" onChange={handleChange} value={formData.nome} className={`w-full p-3 border-2 rounded-xl outline-none focus:border-[#7A1B8F] text-slate-800 ${errors.nome ? 'border-red-500' : 'border-slate-300'}`} /><ErrorMsg field="nome" /></div>
                 <div><Label text="Identidade de Gênero *" /><select name="genero" value={formData.genero} onChange={handleChange} className={`w-full p-3 border-2 rounded-xl text-slate-800 bg-white outline-none ${errors.genero ? 'border-red-500' : 'border-slate-300'}`}><option value="">Selecione como se identifica...</option>{listaGeneros.map((gen) => (<option key={gen} value={gen}>{gen}</option>))}</select><ErrorMsg field="genero" /></div>
                 {formData.genero === "Outro" && (<div className="animate-in fade-in slide-in-from-top-1"><Label text="Como prefere ser identificado? *" /><input name="generoOutro" placeholder="Digite sua identidade de gênero" value={formData.generoOutro} onChange={handleChange} className={`w-full p-3 border-2 rounded-xl text-slate-800 outline-none bg-purple-50 focus:bg-white ${errors.genero ? 'border-red-500' : 'border-slate-300'}`} /></div>)}
                 <div><Label text="E-mail *" /><input name="email" placeholder="Ex: maria@gmail.com" type="email" onChange={handleChange} value={formData.email} className={`w-full p-3 border-2 rounded-xl outline-none text-slate-800 ${errors.email ? 'border-red-500' : 'border-slate-300'}`} /><ErrorMsg field="email" /></div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div><Label text="Instagram *" /><input name="instagram" placeholder="Ex: @mariasilva" onChange={handleChange} value={formData.instagram} className={`w-full p-3 border-2 rounded-xl outline-none text-slate-800 ${errors.instagram ? 'border-red-500' : 'border-slate-300'}`} /><ErrorMsg field="instagram" /></div><div><Label text="WhatsApp *" /><input name="whatsapp" placeholder="Ex: (83) 99999-9999" onChange={handleChange} value={formData.whatsapp} className={`w-full p-3 border-2 rounded-xl outline-none text-slate-800 ${errors.whatsapp ? 'border-red-500' : 'border-slate-300'}`} /><ErrorMsg field="whatsapp" /></div></div>
                 <div><Label text="Deseja entrar no Grupo de Vagas? *" /><div className={`p-4 bg-purple-50 rounded-xl border-2 flex justify-between items-center ${errors.grupo ? 'border-red-500' : 'border-purple-100'}`}><span className="text-xs font-bold text-[#7A1B8F]">Selecione:</span><div className="flex gap-4"><label className="flex items-center gap-1 text-sm font-bold cursor-pointer"><input type="radio" name="grupo" value="sim" onChange={handleChange} checked={formData.grupo === 'sim'} className="accent-[#7A1B8F]" /> Sim</label><label className="flex items-center gap-1 text-sm font-bold cursor-pointer"><input type="radio" name="grupo" value="nao" onChange={handleChange} checked={formData.grupo === 'nao'} className="accent-[#7A1B8F]" /> Não</label></div></div><ErrorMsg field="grupo" /></div>
               </div>
              )}
              
              {/* ETAPA 2 */}
              {step === 2 && (
                 <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-4">
                 <div className="flex items-center gap-2 text-[#7A1B8F] font-bold uppercase text-xs tracking-widest mb-4"><Calendar size={18}/> Perfil e Medidas</div>
                 <div className="grid grid-cols-2 gap-4"><div className="col-span-2 md:col-span-1"><Label text="Data de Nascimento (Mín. 16 anos) *" /><input name="nascimento" type="date" max={maxDate} onChange={handleChange} value={formData.nascimento} className={`w-full p-3 border-2 rounded-xl text-slate-800 outline-none focus:border-[#7A1B8F] ${errors.nascimento ? 'border-red-500' : 'border-slate-300'}`} /><ErrorMsg field="nascimento" /></div><div className="col-span-2 md:col-span-1"><Label text="Altura *" /><input name="altura" inputMode="numeric" placeholder="Ex: 1,75" onChange={handleChange} value={formData.altura} className={`w-full p-3 border-2 rounded-xl text-slate-800 outline-none ${errors.altura ? 'border-red-500' : 'border-slate-300'}`} /><ErrorMsg field="altura" /></div><div><Label text="Manequim *" /><input name="manequim" inputMode="numeric" placeholder="Ex: 38" onChange={handleChange} value={formData.manequim} className={`w-full p-3 border-2 rounded-xl text-slate-800 outline-none ${errors.manequim ? 'border-red-500' : 'border-slate-300'}`} /><ErrorMsg field="manequim" /></div><div><Label text="Sapato *" /><input name="sapato" inputMode="numeric" placeholder="Ex: 37" onChange={handleChange} value={formData.sapato} className={`w-full p-3 border-2 rounded-xl text-slate-800 outline-none ${errors.sapato ? 'border-red-500' : 'border-slate-300'}`} /><ErrorMsg field="sapato" /></div></div>
                 <div><Label text="Idiomas (Opcional)" /><div className="p-4 border-2 border-slate-300 rounded-xl bg-slate-50 flex flex-wrap gap-2">{listaIdiomas.map((idioma) => <button key={idioma} onClick={() => toggleIdioma(idioma)} className={`px-4 py-2 rounded-full text-xs font-bold transition-all border-2 ${formData.idiomas.includes(idioma) ? 'bg-[#7A1B8F] text-[#FFD700] border-[#7A1B8F]' : 'bg-white text-slate-500 border-slate-200 hover:border-[#7A1B8F]'}`}>{idioma}</button>)}</div></div>
               </div>
              )}
              
              {/* ETAPA 3 */}
              {step === 3 && (
                 <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-4">
                 <div className="flex items-center gap-2 text-[#7A1B8F] font-bold uppercase text-xs tracking-widest mb-4"><MapPin size={18}/> Endereço</div>
                 <div><div className="flex justify-between items-center"><Label text="CEP *" />{loadingCep && <span className="text-xs text-[#7A1B8F] flex items-center gap-1"><Loader2 className="animate-spin" size={12}/> Buscando...</span>}</div><input name="cep" placeholder="Ex: 58400-000" onChange={handleChange} value={formData.cep} onBlur={(e) => buscarCep(e.target.value)} className={`w-full p-3 border-2 rounded-xl text-slate-800 outline-none ${errors.cep ? 'border-red-500' : 'border-slate-300'}`} /><ErrorMsg field="cep" /></div>
                 <div className="grid grid-cols-4 gap-4"><div className="col-span-3"><Label text="Endereço *" /><input name="endereco" placeholder="Ex: Rua das Acácias, 123" onChange={handleChange} value={formData.endereco} className={`w-full p-3 border-2 rounded-xl text-slate-800 outline-none ${errors.endereco ? 'border-red-500' : 'border-slate-300'}`} /><ErrorMsg field="endereco" /></div><div className="col-span-1"><Label text="Nº *" /><input name="numero" placeholder="Ex: 123" onChange={handleChange} value={formData.numero} className={`w-full p-3 border-2 rounded-xl text-slate-800 outline-none ${errors.numero ? 'border-red-500' : 'border-slate-300'}`} /><ErrorMsg field="numero" /></div></div>
                 <div><Label text="Bairro" /><input name="bairro" placeholder="Ex: Centro" onChange={handleChange} value={formData.bairro} className="w-full p-3 border-2 border-slate-300 rounded-xl text-slate-800 outline-none" /></div>
                 <div className="grid grid-cols-2 gap-4"><div><Label text="Estado *" /><select name="estado" onChange={handleChange} value={formData.estado} className={`w-full p-3 border-2 rounded-xl text-slate-800 bg-white ${errors.estado ? 'border-red-500' : 'border-slate-300'}`}><option value="">Selecione...</option>{estadosBrasileiros.map((uf) => (<option key={uf.sigla} value={uf.sigla}>{uf.sigla}</option>))}</select><ErrorMsg field="estado" /></div><div><Label text="Cidade *" /><select name="cidade" onChange={handleChange} value={formData.cidade} disabled={!formData.estado} className={`w-full p-3 border-2 rounded-xl text-slate-800 bg-white ${errors.cidade ? 'border-red-500' : 'border-slate-300'} disabled:bg-slate-100`}><option value="">{formData.estado ? "Selecione..." : "..."}</option>{cidadesPrincipal.map((cidade) => (<option key={cidade} value={cidade}>{cidade}</option>))}</select><ErrorMsg field="cidade" /></div></div>
                 <div className="mt-6 pt-6 border-t-2 border-slate-100"><div className="flex items-center justify-between mb-2"><Label text="Possui Hospedagem em Outras Cidades?" /><span className="text-[10px] text-slate-400 font-bold uppercase bg-slate-100 px-2 py-1 rounded">Opcional</span></div><div className="p-4 bg-purple-50 rounded-2xl border-2 border-purple-100 space-y-3"><div className="grid grid-cols-5 gap-2"><div className="col-span-2"><select value={extraUf} onChange={(e) => {setExtraUf(e.target.value); setExtraCidade(''); buscarCidadesPorEstado(e.target.value, setCidadesExtra);}} className="w-full p-2 border-2 border-slate-300 rounded-xl text-sm text-slate-800 outline-none bg-white"><option value="">UF</option>{estadosBrasileiros.map((uf) => (<option key={uf.sigla} value={uf.sigla}>{uf.sigla}</option>))}</select></div><div className="col-span-3 flex gap-2"><select value={extraCidade} onChange={(e) => setExtraCidade(e.target.value)} disabled={!extraUf} className="w-full p-2 border-2 border-slate-300 rounded-xl text-sm text-slate-800 outline-none bg-white disabled:bg-slate-200"><option value="">{extraUf ? "Selecione a cidade..." : "Selecione UF..."}</option>{cidadesExtra.map((c) => (<option key={c} value={c}>{c}</option>))}</select><button onClick={handleAddCidadeExtra} disabled={!extraCidade} className="bg-[#7A1B8F] text-white p-2 rounded-xl disabled:opacity-50 hover:bg-purple-800 transition-colors"><Plus size={20} /></button></div></div>{listaHospedagem.length > 0 && (<div className="flex flex-wrap gap-2 mt-2">{listaHospedagem.map((item) => (<span key={item} className="flex items-center gap-1 bg-white border border-purple-200 text-[#7A1B8F] px-3 py-1 rounded-full text-xs font-bold shadow-sm">{item}<button onClick={() => handleRemoveCidadeExtra(item)} className="text-slate-400 hover:text-red-500"><X size={14} /></button></span>))}</div>)}</div></div>
               </div>
              )}

              {step === 4 && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-4">
                  <div className="flex items-center gap-2 text-[#7A1B8F] font-bold uppercase text-xs tracking-widest mb-4"><CreditCard size={18}/> Financeiro</div>
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3"><AlertTriangle className="text-amber-500 shrink-0" size={24} /><div><h3 className="text-sm font-bold text-amber-700 uppercase mb-1">Atenção aos Dados Bancários</h3><p className="text-xs text-amber-800 leading-relaxed text-justify">Certifique-se de que os dados informados estão <strong>exatamente iguais</strong> aos do seu banco. Inconsistências podem resultar em <strong>atrasos</strong> nos pagamentos.</p></div></div>
                  <div><Label text="Possui MEI Ativo? *" /><div className={`p-4 bg-purple-50 rounded-xl border-2 flex flex-col gap-3 ${errors.mei ? 'border-red-500' : 'border-purple-100'}`}><div className="flex gap-6"><label className="flex items-center gap-2 font-bold cursor-pointer"><input type="radio" name="mei" value="sim" onChange={handleChange} checked={formData.mei === 'sim'} className="accent-[#7A1B8F]" /> Sim</label><label className="flex items-center gap-2 font-bold cursor-pointer"><input type="radio" name="mei" value="nao" onChange={handleChange} checked={formData.mei === 'nao'} className="accent-[#7A1B8F]" /> Não</label></div></div><ErrorMsg field="mei" /></div>
                  <div><Label text="Como deseja receber o cachê? *" /><div className="grid grid-cols-2 gap-4"><button onClick={() => handlePaymentTypeChange('pix')} className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${formData.tipoPagamento === 'pix' ? 'border-[#7A1B8F] bg-[#7A1B8F] text-white' : 'border-slate-300 text-slate-500 hover:border-[#7A1B8F] hover:text-[#7A1B8F]'}`}><QrCode size={24} /><span className="text-sm font-bold">PIX</span></button><button onClick={() => handlePaymentTypeChange('conta')} className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${formData.tipoPagamento === 'conta' ? 'border-[#7A1B8F] bg-[#7A1B8F] text-white' : 'border-slate-300 text-slate-500 hover:border-[#7A1B8F] hover:text-[#7A1B8F]'}`}><Banknote size={24} /><span className="text-sm font-bold">Conta Bancária</span></button></div><ErrorMsg field="tipoPagamento" /></div>
                  
                  {formData.tipoPagamento === 'pix' && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-300 space-y-4 p-4 bg-slate-50 rounded-xl border-2 border-slate-200">
                      <div><Label text="Tipo de Chave PIX *" /><select name="tipoChavePix" value={formData.tipoChavePix} onChange={(e) => setFormData(prev => ({ ...prev, tipoChavePix: e.target.value, chavePix: '' }))} className={`w-full p-3 border-2 rounded-xl text-slate-800 bg-white outline-none ${errors.tipoChavePix ? 'border-red-500' : 'border-slate-300'}`}><option value="">Selecione o tipo...</option><option value="cpf">CPF</option><option value="email">E-mail</option><option value="telefone">Celular / Telefone</option><option value="aleatoria">Chave Aleatória</option></select><ErrorMsg field="tipoChavePix" /></div>
                      
                      {formData.tipoChavePix && (
                        <div>
                          <Label text={`Digite sua chave (${formData.tipoChavePix.toUpperCase()}) *`} />
                          <input 
                            name="chavePix" 
                            placeholder={
                              formData.tipoChavePix === 'aleatoria' ? 'Cole a chave aleatória (UUID)' : 
                              formData.tipoChavePix === 'email' ? 'exemplo@email.com' : 
                              formData.tipoChavePix === 'telefone' ? 'Ex: (83) 99999-9999' : 
                              'Ex: 000.000.000-00'
                            } 
                            value={formData.chavePix} 
                            onChange={handleChange} 
                            className={`w-full p-3 border-2 rounded-xl text-slate-800 outline-none ${errors.chavePix ? 'border-red-500' : 'border-slate-300'}`} 
                          />
                          <ErrorMsg field="chavePix" />
                        </div>
                      )}
                      <div><Label text="Nome Completo do Titular (Sem números) *" /><input name="titularConta" placeholder="Ex: Maria da Silva" value={formData.titularConta} onChange={handleChange} className={`w-full p-3 border-2 rounded-xl text-slate-800 outline-none ${errors.titularConta ? 'border-red-500' : 'border-slate-300'}`} /><ErrorMsg field="titularConta" /></div>
                    </div>
                  )}
                  {formData.tipoPagamento === 'conta' && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-300 space-y-4 p-4 bg-slate-50 rounded-xl border-2 border-slate-200">
                       <div><Label text="Selecione seu Banco *" /><select name="banco" value={formData.banco} onChange={handleChange} className={`w-full p-3 border-2 rounded-xl text-slate-800 bg-white outline-none ${errors.banco ? 'border-red-500' : 'border-slate-300'}`}><option value="">Selecione...</option>{listaBancos.map(banco => (<option key={banco} value={banco}>{banco}</option>))}</select><ErrorMsg field="banco" /></div>
                       {formData.banco === 'Outro' && (<div className="animate-in fade-in slide-in-from-top-1"><Label text="Qual o nome do banco? *" /><input name="bancoOutro" placeholder="Digite o nome do banco" value={formData.bancoOutro} onChange={handleChange} className={`w-full p-3 border-2 rounded-xl text-slate-800 outline-none bg-yellow-50 focus:bg-white ${errors.banco ? 'border-red-500' : 'border-slate-300'}`} /></div>)}
                       <div><Label text="Nome Completo do Titular (Sem números) *" /><input name="titularConta" placeholder="Ex: Maria da Silva" value={formData.titularConta} onChange={handleChange} className={`w-full p-3 border-2 rounded-xl text-slate-800 outline-none ${errors.titularConta ? 'border-red-500' : 'border-slate-300'}`} /><ErrorMsg field="titularConta" /></div>
                       <div className="grid grid-cols-2 gap-4"><div><Label text="Agência (sem dígito) *" /><input name="agencia" placeholder="Ex: 0001" value={formData.agencia} onChange={handleChange} className={`w-full p-3 border-2 rounded-xl text-slate-800 outline-none ${errors.agencia ? 'border-red-500' : 'border-slate-300'}`} /><ErrorMsg field="agencia" /></div><div><Label text="Conta (com dígito) *" /><input name="contaBancaria" placeholder="Ex: 12345-6" value={formData.contaBancaria} onChange={handleChange} className={`w-full p-3 border-2 rounded-xl text-slate-800 outline-none ${errors.contaBancaria ? 'border-red-500' : 'border-slate-300'}`} /><ErrorMsg field="contaBancaria" /></div></div>
                    </div>
                  )}
                </div>
              )}

              {/* ETAPA 5 */}
              {step === 5 && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-6">
                  <div className="flex items-center gap-2 text-[#7A1B8F] font-bold uppercase text-xs tracking-widest mb-4"><Sparkles size={18}/> Finalização e Fotos</div>
                  <div className="bg-purple-50 p-6 rounded-2xl border-2 border-purple-100 text-center relative"><Label text="1. Foto de Perfil (Rosto) *" /><p className="text-[10px] text-slate-500 mb-4">Máx 5MB. Apenas imagens.</p><div className="relative group cursor-pointer w-32 h-32 mx-auto">{!previewPerfil && (<><input type="file" accept="image/*" onChange={handleProfileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"/><div className="w-full h-full rounded-full border-4 border-dashed border-purple-300 bg-white flex items-center justify-center group-hover:border-[#7A1B8F] transition-all"><User className="text-purple-300 group-hover:text-[#7A1B8F]" size={48} /></div></>)}{previewPerfil && (<div className="relative w-full h-full"><img src={previewPerfil} alt="Perfil" className="w-full h-full rounded-full object-cover border-4 border-[#7A1B8F]" /><button onClick={removeProfilePhoto} className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors shadow-lg z-30"><X size={14} /></button></div>)}</div>{!previewPerfil && <span className="text-xs font-bold text-[#7A1B8F] mt-2 block">Toque para selecionar</span>}<ErrorMsg field="fotoPerfil" /></div>
                  <div className="border-2 border-dashed border-slate-300 rounded-3xl p-6 bg-slate-50 relative group"><Label text={`2. Fotos de Corpo Inteiro (${fotosExtras.length}/${MAX_PHOTOS_COUNT}) *`} /><p className="text-[10px] text-slate-400 mb-4">Acumulativo. Máx 5 fotos.</p>{fotosExtras.length < MAX_PHOTOS_COUNT && (<div className="relative h-24 bg-white border-2 border-slate-200 rounded-xl flex flex-col items-center justify-center mb-4 cursor-pointer hover:border-[#7A1B8F] transition-colors"><input type="file" multiple accept="image/*" onChange={handleExtrasUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" /><UploadCloud className="text-slate-400 mb-1" size={24} /><span className="text-xs font-bold text-slate-500">Adicionar Fotos +</span></div>)}{previewsExtras.length > 0 && (<div className="grid grid-cols-3 gap-2">{previewsExtras.map((src, index) => (<div key={index} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 group/item"><img src={src} alt={`Extra ${index}`} className="w-full h-full object-cover" /><button onClick={() => removeExtraPhoto(index)} className="absolute top-1 right-1 bg-red-500/80 text-white p-1 rounded-full hover:bg-red-600 transition-colors"><Trash2 size={12} /></button></div>))}</div>)}<ErrorMsg field="fotosExtras" /></div>
                  <div><Label text="No que você é Nota 10? ✨ *" /><textarea name="nota10" placeholder="Cite sua maior habilidade (profissional ou pessoal). Ex: Organização, Empatia, Criatividade." onChange={handleChange} value={formData.nota10} className={`w-full p-3 border-2 rounded-xl text-slate-800 outline-none h-24 ${errors.nota10 ? 'border-red-500' : 'border-slate-300'}`} /><ErrorMsg field="nota10" /></div>
                  <div><Label text="Bio (Sua História)" /><textarea name="bio" placeholder="Espaço livre! Conte um pouco sobre suas experiências, objetivos ou o que te motiva." onChange={handleChange} value={formData.bio} className="w-full p-3 border-2 border-slate-300 rounded-xl text-slate-800 outline-none h-24" /></div>
                </div>
              )}

              <div className="pt-6 space-y-4">
                <button onClick={handleNext} className={`w-full p-4 rounded-xl font-black text-lg uppercase tracking-widest transition-all bg-[#FFD700] text-[#7A1B8F] shadow-xl hover:scale-[1.01]`}>{step === totalSteps ? "Enviar Cadastro" : "Próximo Passo"}</button>
                {step > 1 && (<button onClick={() => setStep(step - 1)} className="w-full text-slate-400 font-bold text-xs uppercase text-center hover:text-slate-600">Voltar</button>)}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}