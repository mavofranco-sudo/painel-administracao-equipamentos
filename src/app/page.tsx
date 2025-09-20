'use client';

import { useState, useEffect } from 'react';
import { 
  Users, 
  Wrench, 
  Calendar, 
  MapPin, 
  BarChart3, 
  Plus, 
  Search, 
  Filter,
  Edit,
  Trash2,
  Eye,
  AlertTriangle,
  CheckCircle,
  Clock,
  Phone,
  Mail,
  MapPinIcon,
  DollarSign,
  LogOut,
  User,
  Lock,
  AlertCircle,
  MessageCircle,
  RefreshCw,
  History,
  CreditCard,
  ExternalLink
} from 'lucide-react';
import { Cliente, Equipamento, Aluguel, TabType, Usuario, AluguelVencimento, HistoricoCliente } from '@/lib/types';
import {
  getClientes,
  getEquipamentos,
  getAlugueis,
  addCliente,
  addEquipamento,
  addAluguel,
  updateCliente,
  updateEquipamento,
  finalizarAluguel,
  deleteCliente,
  deleteEquipamento,
  initializeData,
  login,
  logout,
  getUsuarioLogado,
  isLoggedIn,
  calcularPrecoAluguel,
  getAlugueisVencimento,
  renovarAluguel,
  atualizarStatusPagamento,
  getHistoricoCliente,
  getClientesComDivida,
  abrirWhatsApp,
  getEquipamentosDisponiveis,
  getQuantidadeDisponivel
} from '@/lib/storage';

export default function PainelAdministracao() {
  const [usuarioLogado, setUsuarioLogado] = useState<Usuario | null>(null);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');
  
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([]);
  const [alugueis, setAlugueis] = useState<Aluguel[]>([]);
  const [alugueisVencimento, setAlugueisVencimento] = useState<AluguelVencimento[]>([]);
  const [clientesComDivida, setClientesComDivida] = useState<HistoricoCliente[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'cliente' | 'equipamento' | 'aluguel' | 'renovacao' | 'historico'>('cliente');
  const [editingItem, setEditingItem] = useState<any>(null);
  const [selectedCliente, setSelectedCliente] = useState<string>('');
  const [alugueisTab, setAlugueisTab] = useState<'todos' | 'ativos' | 'finalizados'>('todos');

  // Estados para formulários
  const [clienteForm, setClienteForm] = useState({
    nome: '', email: '', telefone: '', documento: '', tipoDocumento: 'cpf' as 'cpf' | 'cnpj', observacoes: '',
    endereco: { rua: '', numero: '', bairro: '', cidade: '', cep: '' }
  });
  
  const [equipamentoForm, setEquipamentoForm] = useState({
    nome: '', categoria: '', descricao: '', valorDiario: 0,
    precosPeriodo: [
      { dias: 1, preco: 0 },
      { dias: 3, preco: 0 },
      { dias: 7, preco: 0 },
      { dias: 15, preco: 0 },
      { dias: 30, preco: 0 }
    ],
    estoque: { total: 0, disponivel: 0, alugado: 0, manutencao: 0 }
  });

  const [aluguelForm, setAluguelForm] = useState({
    clienteId: '', equipamentoId: '', dataInicio: '', dataFim: '', 
    diasAluguel: 1, observacoes: ''
  });

  const [renovacaoForm, setRenovacaoForm] = useState({
    aluguelId: '', diasAdicionais: 7
  });

  useEffect(() => {
    initializeData();
    const usuario = getUsuarioLogado();
    setUsuarioLogado(usuario);
    
    if (usuario) {
      loadData();
    }
  }, []);

  const loadData = () => {
    try {
      const clientesData = getClientes();
      const equipamentosData = getEquipamentos();
      const alugueisData = getAlugueis();
      const alugueisVencimentoData = getAlugueisVencimento();
      const clientesComDividaData = getClientesComDivida();

      setClientes(Array.isArray(clientesData) ? clientesData : []);
      setEquipamentos(Array.isArray(equipamentosData) ? equipamentosData : []);
      setAlugueis(Array.isArray(alugueisData) ? alugueisData : []);
      setAlugueisVencimento(Array.isArray(alugueisVencimentoData) ? alugueisVencimentoData : []);
      setClientesComDivida(Array.isArray(clientesComDividaData) ? clientesComDividaData : []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      // Inicializar com arrays vazios em caso de erro
      setClientes([]);
      setEquipamentos([]);
      setAlugueis([]);
      setAlugueisVencimento([]);
      setClientesComDivida([]);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    
    const usuario = login(loginForm.username, loginForm.password);
    if (usuario) {
      setUsuarioLogado(usuario);
      loadData();
      setLoginForm({ username: '', password: '' });
    } else {
      setLoginError('Usuário ou senha incorretos');
    }
  };

  const handleLogout = () => {
    logout();
    setUsuarioLogado(null);
    setActiveTab('dashboard');
  };

  // Tela de Login
  if (!usuarioLogado) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-700 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
          <div className="text-center mb-8">
            <div className="bg-slate-800 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Wrench className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Painel de Equipamentos</h1>
            <p className="text-gray-600 mt-2">Faça login para acessar o sistema</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="h-4 w-4 inline mr-2" />
                Usuário
              </label>
              <input
                type="text"
                required
                value={loginForm.username}
                onChange={(e) => setLoginForm({...loginForm, username: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                placeholder="Digite seu usuário"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Lock className="h-4 w-4 inline mr-2" />
                Senha
              </label>
              <input
                type="password"
                required
                value={loginForm.password}
                onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                placeholder="Digite sua senha"
              />
            </div>

            {loginError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center text-red-700">
                <AlertCircle className="h-4 w-4 mr-2" />
                {loginError}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-slate-800 text-white py-3 px-4 rounded-lg hover:bg-slate-700 transition-colors font-medium"
            >
              Entrar
            </button>
          </form>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 text-center">
              <strong>Dados de acesso padrão:</strong><br />
              Usuário: <code className="bg-gray-200 px-1 rounded">admin</code><br />
              Senha: <code className="bg-gray-200 px-1 rounded">admin123</code>
            </p>
          </div>
        </div>
      </div>
    );
  }

  const resetForms = () => {
    setClienteForm({
      nome: '', email: '', telefone: '', documento: '', tipoDocumento: 'cpf', observacoes: '',
      endereco: { rua: '', numero: '', bairro: '', cidade: '', cep: '' }
    });
    setEquipamentoForm({
      nome: '', categoria: '', descricao: '', valorDiario: 0,
      precosPeriodo: [
        { dias: 1, preco: 0 },
        { dias: 3, preco: 0 },
        { dias: 7, preco: 0 },
        { dias: 15, preco: 0 },
        { dias: 30, preco: 0 }
      ],
      estoque: { total: 0, disponivel: 0, alugado: 0, manutencao: 0 }
    });
    setAluguelForm({
      clienteId: '', equipamentoId: '', dataInicio: '', dataFim: '', 
      diasAluguel: 1, observacoes: ''
    });
    setRenovacaoForm({
      aluguelId: '', diasAdicionais: 7
    });
    setEditingItem(null);
    setSelectedCliente('');
  };

  const openModal = (type: 'cliente' | 'equipamento' | 'aluguel' | 'renovacao' | 'historico', item?: any) => {
    setModalType(type);
    setEditingItem(item);
    
    if (item) {
      if (type === 'cliente') setClienteForm(item);
      if (type === 'equipamento') setEquipamentoForm(item);
      if (type === 'aluguel') setAluguelForm(item);
      if (type === 'renovacao') setRenovacaoForm({ aluguelId: item.id, diasAdicionais: 7 });
      if (type === 'historico') setSelectedCliente(item.id);
    }
    
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForms();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (modalType === 'cliente') {
      if (editingItem) {
        updateCliente(editingItem.id, clienteForm);
      } else {
        addCliente(clienteForm);
      }
    } else if (modalType === 'equipamento') {
      if (editingItem) {
        updateEquipamento(editingItem.id, equipamentoForm);
      } else {
        const novoEquipamento = {
          ...equipamentoForm,
          status: 'disponivel' as const,
          estoque: {
            ...equipamentoForm.estoque,
            disponivel: equipamentoForm.estoque.total
          }
        };
        addEquipamento(novoEquipamento);
      }
    } else if (modalType === 'aluguel') {
      const equipamento = Array.isArray(equipamentos) ? equipamentos.find(e => e.id === aluguelForm.equipamentoId) : null;
      if (equipamento) {
        const valorTotal = calcularPrecoAluguel(equipamento, aluguelForm.diasAluguel);
        
        addAluguel({
          ...aluguelForm,
          valorDiario: equipamento.valorDiario,
          valorTotal,
          status: 'ativo'
        });
      }
    } else if (modalType === 'renovacao') {
      renovarAluguel(renovacaoForm.aluguelId, renovacaoForm.diasAdicionais);
    }
    
    loadData();
    closeModal();
  };

  const handleDelete = (type: 'cliente' | 'equipamento', id: string) => {
    if (confirm('Tem certeza que deseja excluir este item?')) {
      if (type === 'cliente') deleteCliente(id);
      if (type === 'equipamento') deleteEquipamento(id);
      loadData();
    }
  };

  const handleFinalizarAluguel = (id: string) => {
    finalizarAluguel(id);
    loadData();
  };

  const handleAtualizarStatusPagamento = (aluguelId: string, status: 'pago' | 'pendente' | 'devendo') => {
    atualizarStatusPagamento(aluguelId, status);
    loadData();
  };

  const handleAbrirWhatsApp = (cliente: Cliente, aluguel?: Aluguel) => {
    let mensagem = `Olá ${cliente.nome}! `;
    
    if (aluguel) {
      const equipamento = Array.isArray(equipamentos) ? equipamentos.find(e => e.id === aluguel.equipamentoId) : null;
      const dataVencimento = new Date(aluguel.dataFim).toLocaleDateString();
      
      mensagem += `Seu aluguel do equipamento "${equipamento?.nome || 'equipamento'}" vence em ${dataVencimento}. `;
      
      if (aluguel.statusPagamento === 'devendo') {
        mensagem += `Valor pendente: R$ ${aluguel.valorTotal.toFixed(2)}. `;
      }
      
      mensagem += 'Entre em contato para mais informações.';
    } else {
      mensagem += 'Entramos em contato sobre seus aluguéis. Como podemos ajudar?';
    }
    
    abrirWhatsApp(cliente.telefone, mensagem);
  };

  const getClienteNome = (clienteId: string) => {
    if (!Array.isArray(clientes)) return 'Cliente não encontrado';
    const cliente = clientes.find(c => c.id === clienteId);
    return cliente?.nome || 'Cliente não encontrado';
  };

  const getEquipamentoNome = (equipamentoId: string) => {
    if (!Array.isArray(equipamentos)) return 'Equipamento não encontrado';
    const equipamento = equipamentos.find(e => e.id === equipamentoId);
    return equipamento?.nome || 'Equipamento não encontrado';
  };

  // Verificações de segurança para filtros
  const filteredClientes = Array.isArray(clientes) ? clientes.filter(cliente =>
    cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.email.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  const filteredEquipamentos = Array.isArray(equipamentos) ? equipamentos.filter(equipamento =>
    equipamento.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    equipamento.categoria.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  const filteredAlugueis = Array.isArray(alugueis) ? alugueis.filter(aluguel => {
    const cliente = getClienteNome(aluguel.clienteId);
    const equipamento = getEquipamentoNome(aluguel.equipamentoId);
    const matchesSearch = cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
           equipamento.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filtrar por aba
    if (alugueisTab === 'ativos') return matchesSearch && aluguel.status === 'ativo';
    if (alugueisTab === 'finalizados') return matchesSearch && aluguel.status === 'finalizado';
    return matchesSearch;
  }) : [];

  // Estatísticas do Dashboard com verificações de segurança
  const stats = {
    totalClientes: Array.isArray(clientes) ? clientes.length : 0,
    totalEquipamentos: Array.isArray(equipamentos) ? equipamentos.length : 0,
    equipamentosAlugados: Array.isArray(equipamentos) ? equipamentos.filter(e => e.status === 'alugado').length : 0,
    alugueisAtivos: Array.isArray(alugueis) ? alugueis.filter(a => a.status === 'ativo').length : 0,
    receitaMensal: Array.isArray(alugueis) ? alugueis.reduce((total, aluguel) => total + aluguel.valorTotal, 0) : 0,
    clientesComDivida: Array.isArray(clientesComDivida) ? clientesComDivida.length : 0,
    valorTotalDividas: Array.isArray(clientesComDivida) ? clientesComDivida.reduce((total, c) => total + c.valorDivida, 0) : 0
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'clientes', label: 'Clientes', icon: Users },
    { id: 'equipamentos', label: 'Equipamentos', icon: Wrench },
    { id: 'alugueis', label: 'Aluguéis', icon: Calendar },
    { id: 'historico', label: 'Histórico', icon: History },
    { id: 'mapa', label: 'Localização', icon: MapPin },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-slate-800 p-2 rounded-lg">
                <Wrench className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">Painel de Equipamentos</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <User className="h-4 w-4" />
                <span>{usuarioLogado?.nome || 'Usuário'}</span>
              </div>
              
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100"
              >
                <LogOut className="h-4 w-4" />
                <span>Sair</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-1 bg-white p-1 rounded-lg shadow-sm">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-slate-800 text-white'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Clientes</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalClientes}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Equipamentos Alugados</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.equipamentosAlugados}</p>
                  </div>
                  <Calendar className="h-8 w-8 text-orange-600" />
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Clientes com Dívida</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.clientesComDivida}</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Receita Total</p>
                    <p className="text-2xl font-bold text-gray-900">R$ {stats.receitaMensal.toFixed(2)}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-emerald-600" />
                </div>
              </div>
            </div>

            {/* Alertas de Vencimento */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Clock className="h-5 w-5 text-red-500 mr-2" />
                  Alertas de Vencimento
                  {Array.isArray(alugueisVencimento) && alugueisVencimento.length > 0 && (
                    <span className="ml-2 bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      {alugueisVencimento.length}
                    </span>
                  )}
                </h3>
              </div>
              <div className="p-6">
                {!Array.isArray(alugueisVencimento) || alugueisVencimento.length === 0 ? (
                  <p className="text-gray-500">Nenhum aluguel próximo ao vencimento.</p>
                ) : (
                  <div className="space-y-3">
                    {alugueisVencimento.map(item => (
                      <div key={item.aluguel.id} className={`flex items-center justify-between p-4 rounded-lg ${
                        item.vencido ? 'bg-red-50 border border-red-200' : 'bg-yellow-50 border border-yellow-200'
                      }`}>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium text-gray-900">{item.cliente.nome}</h4>
                            <span className="text-gray-500">•</span>
                            <span className="text-gray-700">{item.equipamento.nome}</span>
                          </div>
                          <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                            <span>Vencimento: {new Date(item.aluguel.dataFim).toLocaleDateString()}</span>
                            <span>Valor: R$ {item.aluguel.valorTotal.toFixed(2)}</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              item.aluguel.statusPagamento === 'pago' ? 'bg-green-100 text-green-800' :
                              item.aluguel.statusPagamento === 'pendente' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {item.aluguel.statusPagamento === 'pago' ? 'Pago' :
                               item.aluguel.statusPagamento === 'pendente' ? 'Pendente' : 'Devendo'}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {item.vencido ? (
                            <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                              Vencido há {Math.abs(item.diasParaVencimento)} dia(s)
                            </span>
                          ) : (
                            <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                              Vence em {item.diasParaVencimento} dia(s)
                            </span>
                          )}
                          <button
                            onClick={() => handleAbrirWhatsApp(item.cliente, item.aluguel)}
                            className="text-green-600 hover:text-green-900"
                            title="Abrir WhatsApp"
                          >
                            <MessageCircle className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => openModal('renovacao', item.aluguel)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Renovar Aluguel"
                          >
                            <RefreshCw className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleFinalizarAluguel(item.aluguel.id)}
                            className="text-green-600 hover:text-green-900"
                            title="Finalizar Aluguel"
                          >
                            <CheckCircle className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Alertas de Clientes com Dívida */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                  Clientes com Dívida
                  {Array.isArray(clientesComDivida) && clientesComDivida.length > 0 && (
                    <span className="ml-2 bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      {clientesComDivida.length}
                    </span>
                  )}
                </h3>
              </div>
              <div className="p-6">
                {!Array.isArray(clientesComDivida) || clientesComDivida.length === 0 ? (
                  <p className="text-gray-500">Nenhum cliente com dívida no momento.</p>
                ) : (
                  <div className="space-y-3">
                    {clientesComDivida.map(historico => (
                      <div key={historico.cliente.id} className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium text-gray-900">{historico.cliente.nome}</h4>
                            <span className="text-gray-500">•</span>
                            <span className="text-gray-700">{historico.cliente.telefone}</span>
                          </div>
                          <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                            <span>Valor em dívida: R$ {historico.valorDivida.toFixed(2)}</span>
                            <span>Aluguéis ativos: {historico.alugueisAtivos}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleAbrirWhatsApp(historico.cliente)}
                            className="text-green-600 hover:text-green-900"
                            title="Abrir WhatsApp"
                          >
                            <MessageCircle className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => openModal('historico', historico.cliente)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Ver Histórico"
                          >
                            <Eye className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Alertas de Estoque */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
                  Alertas de Estoque
                </h3>
              </div>
              <div className="p-6">
                {!Array.isArray(equipamentos) || equipamentos.filter(e => e.estoque.disponivel <= 1).length === 0 ? (
                  <p className="text-gray-500">Nenhum alerta de estoque no momento.</p>
                ) : (
                  <div className="space-y-3">
                    {equipamentos
                      .filter(e => e.estoque.disponivel <= 1)
                      .map(equipamento => (
                        <div key={equipamento.id} className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900">{equipamento.nome}</p>
                            <p className="text-sm text-gray-600">
                              Apenas {equipamento.estoque.disponivel} unidade(s) disponível(is)
                            </p>
                          </div>
                          <AlertTriangle className="h-5 w-5 text-amber-500" />
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Clientes */}
        {activeTab === 'clientes' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Gerenciar Clientes</h2>
              <button
                onClick={() => openModal('cliente')}
                className="bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-700 flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Novo Cliente</span>
              </button>
            </div>

            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cliente
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contato
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Documento
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Endereço
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredClientes.map((cliente) => (
                      <tr key={cliente.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{cliente.nome}</div>
                            <div className="text-sm text-gray-500">ID: {cliente.id}</div>
                            {cliente.observacoes && (
                              <div className="text-xs text-gray-400 mt-1">{cliente.observacoes}</div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="space-y-1">
                            <div className="flex items-center text-sm text-gray-900">
                              <Mail className="h-4 w-4 mr-2 text-gray-400" />
                              {cliente.email}
                            </div>
                            <div className="flex items-center text-sm text-gray-900">
                              <Phone className="h-4 w-4 mr-2 text-gray-400" />
                              {cliente.telefone}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            <span className="text-xs bg-gray-100 px-2 py-1 rounded uppercase">
                              {cliente.tipoDocumento}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            {cliente.documento}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {cliente.endereco.rua}, {cliente.endereco.numero}
                          </div>
                          <div className="text-sm text-gray-500">
                            {cliente.endereco.bairro}, {cliente.endereco.cidade}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="space-y-1">
                            {cliente.possuiDivida ? (
                              <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                                Dívida: R$ {cliente.valorDivida?.toFixed(2) || '0.00'}
                              </span>
                            ) : (
                              <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                                Em dia
                              </span>
                            )}
                            <div className="text-xs text-gray-500">
                              Faturamento: R$ {cliente.totalFaturamento?.toFixed(2) || '0.00'}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleAbrirWhatsApp(cliente)}
                              className="text-green-600 hover:text-green-900"
                              title="WhatsApp"
                            >
                              <MessageCircle className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => openModal('historico', cliente)}
                              className="text-blue-600 hover:text-blue-900"
                              title="Histórico"
                            >
                              <History className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => openModal('cliente', cliente)}
                              className="text-indigo-600 hover:text-indigo-900"
                              title="Editar"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete('cliente', cliente.id)}
                              className="text-red-600 hover:text-red-900"
                              title="Excluir"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Equipamentos */}
        {activeTab === 'equipamentos' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Gerenciar Equipamentos</h2>
              <button
                onClick={() => openModal('equipamento')}
                className="bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-700 flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Novo Equipamento</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEquipamentos.map((equipamento) => (
                <div key={equipamento.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{equipamento.nome}</h3>
                        <p className="text-sm text-gray-600">{equipamento.categoria}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        equipamento.status === 'disponivel' 
                          ? 'bg-green-100 text-green-800'
                          : equipamento.status === 'alugado'
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {equipamento.status === 'disponivel' ? 'Disponível' : 
                         equipamento.status === 'alugado' ? 'Alugado' : 'Manutenção'}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-4">{equipamento.descricao}</p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Valor/dia:</span>
                        <span className="font-medium">R$ {equipamento.valorDiario.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Disponível:</span>
                        <span className="font-medium">{equipamento.estoque.disponivel}/{equipamento.estoque.total}</span>
                      </div>
                    </div>

                    {/* Preços por Período */}
                    {equipamento.precosPeriodo && Array.isArray(equipamento.precosPeriodo) && equipamento.precosPeriodo.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Preços por Período:</h4>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          {equipamento.precosPeriodo.map(preco => (
                            <div key={preco.dias} className="flex justify-between bg-gray-50 px-2 py-1 rounded">
                              <span>{preco.dias}d:</span>
                              <span className="font-medium">R$ {preco.preco.toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openModal('equipamento', equipamento)}
                        className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-md hover:bg-gray-200 flex items-center justify-center space-x-1"
                      >
                        <Edit className="h-4 w-4" />
                        <span>Editar</span>
                      </button>
                      <button
                        onClick={() => handleDelete('equipamento', equipamento.id)}
                        className="bg-red-100 text-red-700 px-3 py-2 rounded-md hover:bg-red-200"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Aluguéis */}
        {activeTab === 'alugueis' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Gerenciar Aluguéis</h2>
              <button
                onClick={() => openModal('aluguel')}
                className="bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-700 flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Novo Aluguel</span>
              </button>
            </div>

            {/* Abas de Filtro */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6">
                  <button
                    onClick={() => setAlugueisTab('todos')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      alugueisTab === 'todos'
                        ? 'border-slate-500 text-slate-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Todos ({Array.isArray(alugueis) ? alugueis.length : 0})
                  </button>
                  <button
                    onClick={() => setAlugueisTab('ativos')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      alugueisTab === 'ativos'
                        ? 'border-slate-500 text-slate-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Ativos ({Array.isArray(alugueis) ? alugueis.filter(a => a.status === 'ativo').length : 0})
                  </button>
                  <button
                    onClick={() => setAlugueisTab('finalizados')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      alugueisTab === 'finalizados'
                        ? 'border-slate-500 text-slate-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Finalizados ({Array.isArray(alugueis) ? alugueis.filter(a => a.status === 'finalizado').length : 0})
                  </button>
                </nav>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cliente
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Equipamento
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Período
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Valor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Pagamento
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredAlugueis.map((aluguel) => (
                      <tr key={aluguel.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {getClienteNome(aluguel.clienteId)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {getEquipamentoNome(aluguel.equipamentoId)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {new Date(aluguel.dataInicio).toLocaleDateString()} - {new Date(aluguel.dataFim).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-500">
                            {aluguel.diasAluguel} dia(s)
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            R$ {aluguel.valorTotal.toFixed(2)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            aluguel.status === 'ativo' 
                              ? 'bg-green-100 text-green-800'
                              : aluguel.status === 'finalizado'
                              ? 'bg-gray-100 text-gray-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {aluguel.status === 'ativo' ? 'Ativo' : 
                             aluguel.status === 'finalizado' ? 'Finalizado' : 'Atrasado'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={aluguel.statusPagamento}
                            onChange={(e) => handleAtualizarStatusPagamento(aluguel.id, e.target.value as 'pago' | 'pendente' | 'devendo')}
                            className={`text-xs font-medium px-2 py-1 rounded-full border-0 ${
                              aluguel.statusPagamento === 'pago' ? 'bg-green-100 text-green-800' :
                              aluguel.statusPagamento === 'pendente' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}
                          >
                            <option value="pago">Pago</option>
                            <option value="pendente">Pendente</option>
                            <option value="devendo">Devendo</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            {aluguel.status === 'ativo' && (
                              <>
                                <button
                                  onClick={() => openModal('renovacao', aluguel)}
                                  className="text-blue-600 hover:text-blue-900"
                                  title="Renovar"
                                >
                                  <RefreshCw className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleFinalizarAluguel(aluguel.id)}
                                  className="text-green-600 hover:text-green-900"
                                  title="Finalizar"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Histórico */}
        {activeTab === 'historico' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Histórico de Clientes</h2>
              <select
                value={selectedCliente}
                onChange={(e) => setSelectedCliente(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              >
                <option value="">Selecione um cliente</option>
                {Array.isArray(clientes) && clientes.map(cliente => (
                  <option key={cliente.id} value={cliente.id}>{cliente.nome}</option>
                ))}
              </select>
            </div>

            {selectedCliente && (() => {
              const historico = getHistoricoCliente(selectedCliente);
              if (!historico) return <p className="text-gray-500">Cliente não encontrado.</p>;

              return (
                <div className="space-y-6">
                  {/* Resumo do Cliente */}
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">{historico.cliente.nome}</h3>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleAbrirWhatsApp(historico.cliente)}
                          className="text-green-600 hover:text-green-900"
                        >
                          <MessageCircle className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-sm text-blue-600 font-medium">Total Faturamento</p>
                        <p className="text-2xl font-bold text-blue-900">R$ {historico.totalFaturamento.toFixed(2)}</p>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <p className="text-sm text-green-600 font-medium">Aluguéis Ativos</p>
                        <p className="text-2xl font-bold text-green-900">{historico.alugueisAtivos}</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600 font-medium">Aluguéis Finalizados</p>
                        <p className="text-2xl font-bold text-gray-900">{historico.alugueisFinalizados}</p>
                      </div>
                      <div className={`p-4 rounded-lg ${historico.possuiDivida ? 'bg-red-50' : 'bg-green-50'}`}>
                        <p className={`text-sm font-medium ${historico.possuiDivida ? 'text-red-600' : 'text-green-600'}`}>
                          {historico.possuiDivida ? 'Valor em Dívida' : 'Situação'}
                        </p>
                        <p className={`text-2xl font-bold ${historico.possuiDivida ? 'text-red-900' : 'text-green-900'}`}>
                          {historico.possuiDivida ? `R$ ${historico.valorDivida.toFixed(2)}` : 'Em dia'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Lista de Aluguéis */}
                  <div className="bg-white rounded-lg shadow-sm">
                    <div className="p-6 border-b">
                      <h4 className="text-lg font-semibold text-gray-900">Histórico de Aluguéis</h4>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Equipamento
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Período
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Valor
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Pagamento
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {historico.alugueis.map((aluguel) => (
                            <tr key={aluguel.id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {getEquipamentoNome(aluguel.equipamentoId)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {new Date(aluguel.dataInicio).toLocaleDateString()} - {new Date(aluguel.dataFim).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                R$ {aluguel.valorTotal.toFixed(2)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                  aluguel.status === 'ativo' ? 'bg-green-100 text-green-800' :
                                  aluguel.status === 'finalizado' ? 'bg-gray-100 text-gray-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {aluguel.status === 'ativo' ? 'Ativo' : 
                                   aluguel.status === 'finalizado' ? 'Finalizado' : 'Atrasado'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                  aluguel.statusPagamento === 'pago' ? 'bg-green-100 text-green-800' :
                                  aluguel.statusPagamento === 'pendente' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {aluguel.statusPagamento === 'pago' ? 'Pago' :
                                   aluguel.statusPagamento === 'pendente' ? 'Pendente' : 'Devendo'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* Mapa */}
        {activeTab === 'mapa' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Localização dos Equipamentos</h2>
            
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Equipamentos Alugados</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.isArray(equipamentos) && equipamentos
                    .filter(e => e.status === 'alugado' && e.localizacao)
                    .map(equipamento => {
                      const cliente = Array.isArray(clientes) ? clientes.find(c => c.id === equipamento.clienteId) : null;
                      return (
                        <div key={equipamento.id} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium text-gray-900">{equipamento.nome}</h4>
                            <MapPinIcon className="h-5 w-5 text-red-500" />
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            Cliente: {cliente?.nome || 'N/A'}
                          </p>
                          <p className="text-sm text-gray-600 mb-2">
                            {equipamento.localizacao?.endereco}
                          </p>
                          <div className="text-xs text-gray-500">
                            Lat: {equipamento.localizacao?.lat}, Lng: {equipamento.localizacao?.lng}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
              
              <div className="bg-gray-100 rounded-lg p-8 text-center">
                <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Mapa Interativo</h3>
                <p className="text-gray-600">
                  Integração com Google Maps ou OpenStreetMap seria implementada aqui para visualizar a localização exata dos equipamentos alugados.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">
                  {modalType === 'renovacao' ? 'Renovar Aluguel' :
                   modalType === 'historico' ? 'Histórico do Cliente' :
                   editingItem ? 'Editar' : 'Novo'} {
                    modalType === 'cliente' ? 'Cliente' :
                    modalType === 'equipamento' ? 'Equipamento' : 
                    modalType === 'aluguel' ? 'Aluguel' : ''
                  }
                </h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              {modalType === 'renovacao' && editingItem && (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Detalhes do Aluguel</h4>
                    <p className="text-sm text-gray-600">Cliente: {getClienteNome(editingItem.clienteId)}</p>
                    <p className="text-sm text-gray-600">Equipamento: {getEquipamentoNome(editingItem.equipamentoId)}</p>
                    <p className="text-sm text-gray-600">Vencimento atual: {new Date(editingItem.dataFim).toLocaleDateString()}</p>
                    <p className="text-sm text-gray-600">Valor atual: R$ {editingItem.valorTotal.toFixed(2)}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Período de Renovação</label>
                    <select
                      required
                      value={renovacaoForm.diasAdicionais}
                      onChange={(e) => setRenovacaoForm({...renovacaoForm, diasAdicionais: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                    >
                      <option value={1}>1 dia</option>
                      <option value={3}>3 dias</option>
                      <option value={7}>7 dias (1 semana)</option>
                      <option value={15}>15 dias</option>
                      <option value={30}>30 dias (1 mês)</option>
                    </select>
                  </div>

                  {/* Cálculo do valor adicional */}
                  {(() => {
                    const equipamento = Array.isArray(equipamentos) ? equipamentos.find(e => e.id === editingItem.equipamentoId) : null;
                    if (equipamento) {
                      const valorAdicional = calcularPrecoAluguel(equipamento, renovacaoForm.diasAdicionais);
                      const novaDataFim = new Date(editingItem.dataFim);
                      novaDataFim.setDate(novaDataFim.getDate() + renovacaoForm.diasAdicionais);
                      
                      return (
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Resumo da Renovação:</h4>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span>Dias adicionais:</span>
                              <span>{renovacaoForm.diasAdicionais} dia(s)</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Nova data de vencimento:</span>
                              <span>{novaDataFim.toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Valor adicional:</span>
                              <span>R$ {valorAdicional.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between font-medium text-lg border-t pt-1">
                              <span>Novo valor total:</span>
                              <span>R$ {(editingItem.valorTotal + valorAdicional).toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })()}

                  <div className="flex space-x-3 pt-4">
                    <button
                      type="submit"
                      className="flex-1 bg-slate-800 text-white py-2 px-4 rounded-md hover:bg-slate-700"
                    >
                      Renovar Aluguel
                    </button>
                    <button
                      type="button"
                      onClick={closeModal}
                      className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              )}

              {modalType === 'historico' && selectedCliente && (() => {
                const historico = getHistoricoCliente(selectedCliente);
                if (!historico) return <p className="text-gray-500">Cliente não encontrado.</p>;

                return (
                  <div className="space-y-6">
                    {/* Resumo do Cliente */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-semibold text-gray-900">{historico.cliente.nome}</h4>
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{historico.cliente.telefone}</span>
                          <button
                            onClick={() => handleAbrirWhatsApp(historico.cliente)}
                            className="text-green-600 hover:text-green-900 ml-2"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                        <div>
                          <p className="text-2xl font-bold text-blue-600">R$ {historico.totalFaturamento.toFixed(2)}</p>
                          <p className="text-sm text-gray-600">Total Faturamento</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-green-600">{historico.alugueisAtivos}</p>
                          <p className="text-sm text-gray-600">Aluguéis Ativos</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-gray-600">{historico.alugueisFinalizados}</p>
                          <p className="text-sm text-gray-600">Finalizados</p>
                        </div>
                        <div>
                          <p className={`text-2xl font-bold ${historico.possuiDivida ? 'text-red-600' : 'text-green-600'}`}>
                            {historico.possuiDivida ? `R$ ${historico.valorDivida.toFixed(2)}` : 'R$ 0,00'}
                          </p>
                          <p className="text-sm text-gray-600">Dívida</p>
                        </div>
                      </div>
                    </div>

                    {/* Lista de Aluguéis */}
                    <div className="max-h-96 overflow-y-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50 sticky top-0">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Equipamento</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Período</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valor</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pagamento</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {historico.alugueis.map((aluguel) => (
                            <tr key={aluguel.id}>
                              <td className="px-4 py-3 text-sm text-gray-900">{getEquipamentoNome(aluguel.equipamentoId)}</td>
                              <td className="px-4 py-3 text-sm text-gray-900">
                                {new Date(aluguel.dataInicio).toLocaleDateString()} - {new Date(aluguel.dataFim).toLocaleDateString()}
                              </td>
                              <td className="px-4 py-3 text-sm font-medium text-gray-900">R$ {aluguel.valorTotal.toFixed(2)}</td>
                              <td className="px-4 py-3">
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                  aluguel.status === 'ativo' ? 'bg-green-100 text-green-800' :
                                  aluguel.status === 'finalizado' ? 'bg-gray-100 text-gray-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {aluguel.status === 'ativo' ? 'Ativo' : 
                                   aluguel.status === 'finalizado' ? 'Finalizado' : 'Atrasado'}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                  aluguel.statusPagamento === 'pago' ? 'bg-green-100 text-green-800' :
                                  aluguel.statusPagamento === 'pendente' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {aluguel.statusPagamento === 'pago' ? 'Pago' :
                                   aluguel.statusPagamento === 'pendente' ? 'Pendente' : 'Devendo'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })()}

              {(modalType === 'cliente' || modalType === 'equipamento' || modalType === 'aluguel') && (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {modalType === 'cliente' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
                        <input
                          type="text"
                          required
                          value={clienteForm.nome}
                          onChange={(e) => setClienteForm({...clienteForm, nome: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Documento *</label>
                          <select
                            required
                            value={clienteForm.tipoDocumento}
                            onChange={(e) => setClienteForm({...clienteForm, tipoDocumento: e.target.value as 'cpf' | 'cnpj'})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                          >
                            <option value="cpf">CPF</option>
                            <option value="cnpj">CNPJ</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {clienteForm.tipoDocumento === 'cpf' ? 'CPF' : 'CNPJ'} *
                          </label>
                          <input
                            type="text"
                            required
                            value={clienteForm.documento}
                            onChange={(e) => setClienteForm({...clienteForm, documento: e.target.value})}
                            placeholder={clienteForm.tipoDocumento === 'cpf' ? '000.000.000-00' : '00.000.000/0000-00'}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                        <input
                          type="email"
                          required
                          value={clienteForm.email}
                          onChange={(e) => setClienteForm({...clienteForm, email: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Telefone *</label>
                        <input
                          type="tel"
                          required
                          value={clienteForm.telefone}
                          onChange={(e) => setClienteForm({...clienteForm, telefone: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
                        <textarea
                          value={clienteForm.observacoes}
                          onChange={(e) => setClienteForm({...clienteForm, observacoes: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                          rows={3}
                          placeholder="Informações adicionais sobre o cliente..."
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Rua *</label>
                          <input
                            type="text"
                            required
                            value={clienteForm.endereco.rua}
                            onChange={(e) => setClienteForm({
                              ...clienteForm, 
                              endereco: {...clienteForm.endereco, rua: e.target.value}
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Número *</label>
                          <input
                            type="text"
                            required
                            value={clienteForm.endereco.numero}
                            onChange={(e) => setClienteForm({
                              ...clienteForm, 
                              endereco: {...clienteForm.endereco, numero: e.target.value}
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Bairro *</label>
                        <input
                          type="text"
                          required
                          value={clienteForm.endereco.bairro}
                          onChange={(e) => setClienteForm({
                            ...clienteForm, 
                            endereco: {...clienteForm.endereco, bairro: e.target.value}
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Cidade *</label>
                          <input
                            type="text"
                            required
                            value={clienteForm.endereco.cidade}
                            onChange={(e) => setClienteForm({
                              ...clienteForm, 
                              endereco: {...clienteForm.endereco, cidade: e.target.value}
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">CEP *</label>
                          <input
                            type="text"
                            required
                            value={clienteForm.endereco.cep}
                            onChange={(e) => setClienteForm({
                              ...clienteForm, 
                              endereco: {...clienteForm.endereco, cep: e.target.value}
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {modalType === 'equipamento' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                        <input
                          type="text"
                          required
                          value={equipamentoForm.nome}
                          onChange={(e) => setEquipamentoForm({...equipamentoForm, nome: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                        <input
                          type="text"
                          required
                          value={equipamentoForm.categoria}
                          onChange={(e) => setEquipamentoForm({...equipamentoForm, categoria: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                        <textarea
                          required
                          value={equipamentoForm.descricao}
                          onChange={(e) => setEquipamentoForm({...equipamentoForm, descricao: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                          rows={3}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Valor/Dia (R$)</label>
                          <input
                            type="number"
                            step="0.01"
                            required
                            value={equipamentoForm.valorDiario}
                            onChange={(e) => {
                              const valor = parseFloat(e.target.value);
                              setEquipamentoForm({
                                ...equipamentoForm, 
                                valorDiario: valor,
                                precosPeriodo: [
                                  { dias: 1, preco: valor },
                                  { dias: 3, preco: valor * 3 * 0.95 },
                                  { dias: 7, preco: valor * 7 * 0.90 },
                                  { dias: 15, preco: valor * 15 * 0.85 },
                                  { dias: 30, preco: valor * 30 * 0.75 }
                                ]
                              });
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Quantidade Total</label>
                          <input
                            type="number"
                            required
                            value={equipamentoForm.estoque.total}
                            onChange={(e) => setEquipamentoForm({
                              ...equipamentoForm, 
                              estoque: {...equipamentoForm.estoque, total: parseInt(e.target.value)}
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                          />
                        </div>
                      </div>

                      {/* Preços por Período */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Preços por Período</label>
                        <div className="grid grid-cols-2 gap-3">
                          {Array.isArray(equipamentoForm.precosPeriodo) && equipamentoForm.precosPeriodo.map((preco, index) => (
                            <div key={preco.dias} className="flex items-center space-x-2">
                              <span className="text-sm text-gray-600 w-12">{preco.dias}d:</span>
                              <input
                                type="number"
                                step="0.01"
                                value={preco.preco}
                                onChange={(e) => {
                                  const novosPrecosPerido = [...equipamentoForm.precosPeriodo];
                                  novosPrecosPerido[index].preco = parseFloat(e.target.value);
                                  setEquipamentoForm({...equipamentoForm, precosPeriodo: novosPrecosPerido});
                                }}
                                className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-slate-500 focus:border-transparent"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {modalType === 'aluguel' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
                        <select
                          required
                          value={aluguelForm.clienteId}
                          onChange={(e) => setAluguelForm({...aluguelForm, clienteId: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                        >
                          <option value="">Selecione um cliente</option>
                          {Array.isArray(clientes) && clientes.map(cliente => (
                            <option key={cliente.id} value={cliente.id}>{cliente.nome}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Equipamento</label>
                        <select
                          required
                          value={aluguelForm.equipamentoId}
                          onChange={(e) => setAluguelForm({...aluguelForm, equipamentoId: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                        >
                          <option value="">Selecione um equipamento</option>
                          {Array.isArray(equipamentos) && getEquipamentosDisponiveis().map(equipamento => (
                            <option key={equipamento.id} value={equipamento.id}>
                              {equipamento.nome} - R$ {equipamento.valorDiario.toFixed(2)}/dia (Disponível: {getQuantidadeDisponivel(equipamento.id)})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Período do Aluguel</label>
                        <select
                          required
                          value={aluguelForm.diasAluguel}
                          onChange={(e) => {
                            const dias = parseInt(e.target.value);
                            const dataInicio = new Date();
                            const dataFim = new Date(dataInicio.getTime() + dias * 24 * 60 * 60 * 1000);
                            
                            setAluguelForm({
                              ...aluguelForm, 
                              diasAluguel: dias,
                              dataInicio: dataInicio.toISOString().split('T')[0],
                              dataFim: dataFim.toISOString().split('T')[0]
                            });
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                        >
                          <option value={1}>1 dia</option>
                          <option value={3}>3 dias</option>
                          <option value={7}>7 dias (1 semana)</option>
                          <option value={15}>15 dias</option>
                          <option value={30}>30 dias (1 mês)</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Data Início</label>
                          <input
                            type="date"
                            required
                            value={aluguelForm.dataInicio}
                            onChange={(e) => setAluguelForm({...aluguelForm, dataInicio: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Data Fim</label>
                          <input
                            type="date"
                            required
                            value={aluguelForm.dataFim}
                            onChange={(e) => setAluguelForm({...aluguelForm, dataFim: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                          />
                        </div>
                      </div>

                      {/* Cálculo do Valor */}
                      {aluguelForm.equipamentoId && aluguelForm.diasAluguel && (() => {
                        const equipamento = Array.isArray(equipamentos) ? equipamentos.find(e => e.id === aluguelForm.equipamentoId) : null;
                        if (equipamento) {
                          const valorTotal = calcularPrecoAluguel(equipamento, aluguelForm.diasAluguel);
                          const valorDiario = equipamento.valorDiario;
                          const desconto = ((valorDiario * aluguelForm.diasAluguel) - valorTotal) / (valorDiario * aluguelForm.diasAluguel) * 100;
                          
                          return (
                            <div className="bg-gray-50 p-4 rounded-lg">
                              <h4 className="text-sm font-medium text-gray-700 mb-2">Cálculo do Valor:</h4>
                              <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                  <span>Valor diário:</span>
                                  <span>R$ {valorDiario.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Período:</span>
                                  <span>{aluguelForm.diasAluguel} dia(s)</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Quantidade disponível:</span>
                                  <span>{getQuantidadeDisponivel(equipamento.id)} unidade(s)</span>
                                </div>
                                {desconto > 0 && (
                                  <div className="flex justify-between text-green-600">
                                    <span>Desconto:</span>
                                    <span>-{desconto.toFixed(1)}%</span>
                                  </div>
                                )}
                                <div className="flex justify-between font-medium text-lg border-t pt-1">
                                  <span>Total:</span>
                                  <span>R$ {valorTotal.toFixed(2)}</span>
                                </div>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      })()}

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
                        <textarea
                          value={aluguelForm.observacoes}
                          onChange={(e) => setAluguelForm({...aluguelForm, observacoes: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                          rows={3}
                        />
                      </div>
                    </>
                  )}

                  {modalType !== 'historico' && (
                    <div className="flex space-x-3 pt-4">
                      <button
                        type="submit"
                        className="flex-1 bg-slate-800 text-white py-2 px-4 rounded-md hover:bg-slate-700"
                      >
                        {editingItem ? 'Atualizar' : 'Salvar'}
                      </button>
                      <button
                        type="button"
                        onClick={closeModal}
                        className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
                      >
                        Cancelar
                      </button>
                    </div>
                  )}
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}