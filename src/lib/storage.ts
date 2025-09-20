import { Cliente, Equipamento, Aluguel, Usuario, PrecoPeriodo, AluguelVencimento, HistoricoCliente } from './types';

const STORAGE_KEYS = {
  CLIENTES: 'equipamentos_clientes',
  EQUIPAMENTOS: 'equipamentos_equipamentos',
  ALUGUEIS: 'equipamentos_alugueis',
  USUARIOS: 'equipamentos_usuarios',
  USUARIO_LOGADO: 'equipamentos_usuario_logado',
} as const;

// Usuários e Autenticação
export const getUsuarios = (): Usuario[] => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEYS.USUARIOS);
  return data ? JSON.parse(data) : [];
};

export const saveUsuarios = (usuarios: Usuario[]): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.USUARIOS, JSON.stringify(usuarios));
};

export const login = (username: string, password: string): Usuario | null => {
  const usuarios = getUsuarios();
  const usuario = usuarios.find(u => u.username === username && u.password === password);
  
  if (usuario) {
    localStorage.setItem(STORAGE_KEYS.USUARIO_LOGADO, JSON.stringify(usuario));
    return usuario;
  }
  
  return null;
};

export const logout = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEYS.USUARIO_LOGADO);
};

export const getUsuarioLogado = (): Usuario | null => {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem(STORAGE_KEYS.USUARIO_LOGADO);
  return data ? JSON.parse(data) : null;
};

export const isLoggedIn = (): boolean => {
  return getUsuarioLogado() !== null;
};

// Função para calcular preço baseado no período
export const calcularPrecoAluguel = (equipamento: Equipamento, dias: number): number => {
  // Verifica se existe preço específico para o período
  const precoEspecifico = equipamento.precosPeriodo?.find(p => p.dias === dias);
  
  if (precoEspecifico) {
    return precoEspecifico.preco;
  }
  
  // Calcula desconto baseado no período
  let desconto = 0;
  if (dias >= 30) desconto = 0.25; // 25% desconto para 30+ dias
  else if (dias >= 15) desconto = 0.15; // 15% desconto para 15+ dias
  else if (dias >= 7) desconto = 0.10; // 10% desconto para 7+ dias
  else if (dias >= 3) desconto = 0.05; // 5% desconto para 3+ dias
  
  const precoBase = equipamento.valorDiario * dias;
  return precoBase * (1 - desconto);
};

// Função para obter equipamentos disponíveis (incluindo os que têm estoque mesmo estando alugados)
export const getEquipamentosDisponiveis = (): Equipamento[] => {
  const equipamentos = getEquipamentos();
  return equipamentos.filter(e => e.estoque.disponivel > 0);
};

// Função para obter quantidade disponível de um equipamento
export const getQuantidadeDisponivel = (equipamentoId: string): number => {
  const equipamentos = getEquipamentos();
  const equipamento = equipamentos.find(e => e.id === equipamentoId);
  return equipamento ? equipamento.estoque.disponivel : 0;
};

// Função para renovar aluguel
export const renovarAluguel = (aluguelId: string, diasAdicionais: number): boolean => {
  const alugueis = getAlugueis();
  const aluguel = alugueis.find(a => a.id === aluguelId);
  
  if (!aluguel || aluguel.status !== 'ativo') return false;
  
  const equipamentos = getEquipamentos();
  const equipamento = equipamentos.find(e => e.id === aluguel.equipamentoId);
  
  if (!equipamento) return false;
  
  const valorAdicional = calcularPrecoAluguel(equipamento, diasAdicionais);
  const novaDataFim = new Date(aluguel.dataFim);
  novaDataFim.setDate(novaDataFim.getDate() + diasAdicionais);
  
  const renovacao = {
    id: crypto.randomUUID(),
    dataRenovacao: new Date().toISOString(),
    novaDataFim: novaDataFim.toISOString(),
    diasAdicionais,
    valorAdicional
  };
  
  // Atualizar aluguel
  aluguel.dataFim = novaDataFim.toISOString();
  aluguel.diasAluguel += diasAdicionais;
  aluguel.valorTotal += valorAdicional;
  aluguel.renovacoes = aluguel.renovacoes || [];
  aluguel.renovacoes.push(renovacao);
  
  saveAlugueis(alugueis);
  
  // Atualizar data de devolução do equipamento
  if (equipamento) {
    equipamento.dataDevolucao = novaDataFim.toISOString();
    saveEquipamentos(equipamentos);
  }
  
  return true;
};

// Função para atualizar status de pagamento
export const atualizarStatusPagamento = (aluguelId: string, status: 'pago' | 'pendente' | 'devendo'): void => {
  const alugueis = getAlugueis();
  const aluguel = alugueis.find(a => a.id === aluguelId);
  
  if (aluguel) {
    aluguel.statusPagamento = status;
    if (status === 'pago') {
      aluguel.dataPagamento = new Date().toISOString();
    }
    saveAlugueis(alugueis);
    
    // Atualizar status de dívida do cliente
    atualizarDividaCliente(aluguel.clienteId);
  }
};

// Função para atualizar dívida do cliente
export const atualizarDividaCliente = (clienteId: string): void => {
  const alugueis = getAlugueis();
  const alugueisCliente = alugueis.filter(a => a.clienteId === clienteId);
  
  const valorDivida = alugueisCliente
    .filter(a => a.statusPagamento === 'devendo')
    .reduce((total, a) => total + a.valorTotal, 0);
  
  const clientes = getClientes();
  const cliente = clientes.find(c => c.id === clienteId);
  
  if (cliente) {
    cliente.possuiDivida = valorDivida > 0;
    cliente.valorDivida = valorDivida;
    cliente.totalFaturamento = alugueisCliente
      .filter(a => a.statusPagamento === 'pago')
      .reduce((total, a) => total + a.valorTotal, 0);
    cliente.historicoAlugueis = alugueisCliente.map(a => a.id);
    saveClientes(clientes);
  }
};

// Função para obter histórico de cliente
export const getHistoricoCliente = (clienteId: string): HistoricoCliente | null => {
  const clientes = getClientes();
  const cliente = clientes.find(c => c.id === clienteId);
  
  if (!cliente) return null;
  
  const alugueis = getAlugueis().filter(a => a.clienteId === clienteId);
  const totalFaturamento = alugueis
    .filter(a => a.statusPagamento === 'pago')
    .reduce((total, a) => total + a.valorTotal, 0);
  
  const valorDivida = alugueis
    .filter(a => a.statusPagamento === 'devendo')
    .reduce((total, a) => total + a.valorTotal, 0);
  
  return {
    cliente,
    alugueis,
    totalFaturamento,
    alugueisAtivos: alugueis.filter(a => a.status === 'ativo').length,
    alugueisFinalizados: alugueis.filter(a => a.status === 'finalizado').length,
    possuiDivida: valorDivida > 0,
    valorDivida
  };
};

// Função para obter clientes com dívida
export const getClientesComDivida = (): HistoricoCliente[] => {
  const clientes = getClientes();
  return clientes
    .filter(c => c.possuiDivida)
    .map(c => getHistoricoCliente(c.id))
    .filter(h => h !== null) as HistoricoCliente[];
};

// Função para obter aluguéis próximos ao vencimento
export const getAlugueisVencimento = (diasAntecedencia: number = 3): AluguelVencimento[] => {
  const alugueis = getAlugueis().filter(a => a.status === 'ativo');
  const clientes = getClientes();
  const equipamentos = getEquipamentos();
  const hoje = new Date();
  
  return alugueis.map(aluguel => {
    const dataFim = new Date(aluguel.dataFim);
    const diasParaVencimento = Math.ceil((dataFim.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
    const vencido = diasParaVencimento < 0;
    
    const cliente = clientes.find(c => c.id === aluguel.clienteId)!;
    const equipamento = equipamentos.find(e => e.id === aluguel.equipamentoId)!;
    
    return {
      aluguel,
      cliente,
      equipamento,
      diasParaVencimento,
      vencido
    };
  }).filter(item => item.vencido || item.diasParaVencimento <= diasAntecedencia);
};

// Função para abrir WhatsApp
export const abrirWhatsApp = (telefone: string, mensagem?: string): void => {
  const numeroLimpo = telefone.replace(/\D/g, '');
  const mensagemCodificada = mensagem ? encodeURIComponent(mensagem) : '';
  const url = `https://wa.me/55${numeroLimpo}${mensagemCodificada ? `?text=${mensagemCodificada}` : ''}`;
  window.open(url, '_blank');
};

// Clientes
export const getClientes = (): Cliente[] => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEYS.CLIENTES);
  return data ? JSON.parse(data) : [];
};

export const saveClientes = (clientes: Cliente[]): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.CLIENTES, JSON.stringify(clientes));
};

export const addCliente = (cliente: Omit<Cliente, 'id' | 'dataCadastro'>): Cliente => {
  const novoCliente: Cliente = {
    ...cliente,
    id: crypto.randomUUID(),
    dataCadastro: new Date().toISOString(),
    historicoAlugueis: [],
    totalFaturamento: 0,
    possuiDivida: false,
    valorDivida: 0
  };
  
  const clientes = getClientes();
  clientes.push(novoCliente);
  saveClientes(clientes);
  
  return novoCliente;
};

export const updateCliente = (id: string, dadosAtualizados: Partial<Cliente>): void => {
  const clientes = getClientes();
  const index = clientes.findIndex(c => c.id === id);
  if (index !== -1) {
    clientes[index] = { ...clientes[index], ...dadosAtualizados };
    saveClientes(clientes);
  }
};

export const deleteCliente = (id: string): void => {
  const clientes = getClientes();
  const clientesFiltrados = clientes.filter(c => c.id !== id);
  saveClientes(clientesFiltrados);
};

// Equipamentos
export const getEquipamentos = (): Equipamento[] => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEYS.EQUIPAMENTOS);
  return data ? JSON.parse(data) : [];
};

export const saveEquipamentos = (equipamentos: Equipamento[]): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.EQUIPAMENTOS, JSON.stringify(equipamentos));
};

export const addEquipamento = (equipamento: Omit<Equipamento, 'id'>): Equipamento => {
  const novoEquipamento: Equipamento = {
    ...equipamento,
    id: crypto.randomUUID(),
  };
  
  const equipamentos = getEquipamentos();
  equipamentos.push(novoEquipamento);
  saveEquipamentos(equipamentos);
  
  return novoEquipamento;
};

export const updateEquipamento = (id: string, dadosAtualizados: Partial<Equipamento>): void => {
  const equipamentos = getEquipamentos();
  const index = equipamentos.findIndex(e => e.id === id);
  if (index !== -1) {
    equipamentos[index] = { ...equipamentos[index], ...dadosAtualizados };
    saveEquipamentos(equipamentos);
  }
};

export const deleteEquipamento = (id: string): void => {
  const equipamentos = getEquipamentos();
  const equipamentosFiltrados = equipamentos.filter(e => e.id !== id);
  saveEquipamentos(equipamentosFiltrados);
};

// Aluguéis
export const getAlugueis = (): Aluguel[] => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEYS.ALUGUEIS);
  return data ? JSON.parse(data) : [];
};

export const saveAlugueis = (alugueis: Aluguel[]): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.ALUGUEIS, JSON.stringify(alugueis));
};

export const addAluguel = (aluguel: Omit<Aluguel, 'id'>): Aluguel => {
  const novoAluguel: Aluguel = {
    ...aluguel,
    id: crypto.randomUUID(),
    statusPagamento: 'pendente', // Status padrão
    renovacoes: []
  };
  
  const alugueis = getAlugueis();
  alugueis.push(novoAluguel);
  saveAlugueis(alugueis);
  
  // Atualizar status do equipamento
  const equipamentos = getEquipamentos();
  const equipamento = equipamentos.find(e => e.id === aluguel.equipamentoId);
  if (equipamento) {
    // Só alterar status para alugado se não tiver mais disponível
    if (equipamento.estoque.disponivel === 1) {
      equipamento.status = 'alugado';
    }
    equipamento.clienteId = aluguel.clienteId;
    equipamento.dataAluguel = aluguel.dataInicio;
    equipamento.dataDevolucao = aluguel.dataFim;
    equipamento.estoque.disponivel -= 1;
    equipamento.estoque.alugado += 1;
    saveEquipamentos(equipamentos);
  }
  
  // Atualizar histórico do cliente
  atualizarDividaCliente(aluguel.clienteId);
  
  return novoAluguel;
};

export const finalizarAluguel = (id: string): void => {
  const alugueis = getAlugueis();
  const aluguel = alugueis.find(a => a.id === id);
  
  if (aluguel) {
    aluguel.status = 'finalizado';
    // Se não foi marcado como pago, marcar como pago ao finalizar
    if (aluguel.statusPagamento === 'pendente') {
      aluguel.statusPagamento = 'pago';
      aluguel.dataPagamento = new Date().toISOString();
    }
    saveAlugueis(alugueis);
    
    // Atualizar status do equipamento
    const equipamentos = getEquipamentos();
    const equipamento = equipamentos.find(e => e.id === aluguel.equipamentoId);
    if (equipamento) {
      // Só alterar status para disponível se não tiver mais alugados
      if (equipamento.estoque.alugado === 1) {
        equipamento.status = 'disponivel';
      }
      equipamento.clienteId = undefined;
      equipamento.dataAluguel = undefined;
      equipamento.dataDevolucao = undefined;
      equipamento.estoque.disponivel += 1;
      equipamento.estoque.alugado -= 1;
      saveEquipamentos(equipamentos);
    }
    
    // Atualizar histórico do cliente
    atualizarDividaCliente(aluguel.clienteId);
  }
};

// Dados iniciais para demonstração
export const initializeData = (): void => {
  if (typeof window === 'undefined') return;
  
  // Inicializar usuário admin padrão
  if (getUsuarios().length === 0) {
    const usuarioAdmin: Usuario = {
      id: '1',
      username: 'admin',
      password: 'admin123',
      nome: 'Administrador',
      email: 'admin@sistema.com',
      role: 'admin',
      dataCriacao: new Date().toISOString()
    };
    saveUsuarios([usuarioAdmin]);
  }
  
  // Verificar se já existem dados
  if (getClientes().length > 0) return;
  
  // Clientes de exemplo
  const clientesExemplo: Cliente[] = [
    {
      id: '1',
      nome: 'João Silva',
      email: 'joao@email.com',
      telefone: '(11) 99999-9999',
      documento: '123.456.789-00',
      tipoDocumento: 'cpf',
      observacoes: 'Cliente preferencial, sempre pontual nos pagamentos',
      endereco: {
        rua: 'Rua das Flores',
        numero: '123',
        bairro: 'Centro',
        cidade: 'São Paulo',
        cep: '01234-567',
        coordenadas: { lat: -23.5505, lng: -46.6333 }
      },
      dataCadastro: new Date().toISOString(),
      historicoAlugueis: ['1', '3'],
      totalFaturamento: 574.00,
      possuiDivida: false,
      valorDivida: 0
    },
    {
      id: '2',
      nome: 'Maria Santos',
      email: 'maria@email.com',
      telefone: '(11) 88888-8888',
      documento: '12.345.678/0001-90',
      tipoDocumento: 'cnpj',
      observacoes: 'Empresa de construção civil',
      endereco: {
        rua: 'Av. Paulista',
        numero: '456',
        bairro: 'Bela Vista',
        cidade: 'São Paulo',
        cep: '01310-100',
        coordenadas: { lat: -23.5618, lng: -46.6565 }
      },
      dataCadastro: new Date().toISOString(),
      historicoAlugueis: ['2'],
      totalFaturamento: 0,
      possuiDivida: true,
      valorDivida: 70.00
    }
  ];
  
  // Equipamentos de exemplo com preços por período
  const equipamentosExemplo: Equipamento[] = [
    {
      id: '1',
      nome: 'Furadeira Elétrica',
      categoria: 'Ferramentas Elétricas',
      descricao: 'Furadeira de impacto 500W',
      valorDiario: 25.00,
      precosPeriodo: [
        { dias: 1, preco: 25.00 },
        { dias: 3, preco: 70.00, desconto: 0.07 },
        { dias: 7, preco: 157.50, desconto: 0.10 },
        { dias: 15, preco: 318.75, desconto: 0.15 },
        { dias: 30, preco: 562.50, desconto: 0.25 }
      ],
      status: 'disponivel',
      estoque: { total: 5, disponivel: 4, alugado: 1, manutencao: 0 }
    },
    {
      id: '2',
      nome: 'Betoneira 150L',
      categoria: 'Construção',
      descricao: 'Betoneira elétrica 150 litros',
      valorDiario: 80.00,
      precosPeriodo: [
        { dias: 1, preco: 80.00 },
        { dias: 3, preco: 228.00, desconto: 0.05 },
        { dias: 7, preco: 504.00, desconto: 0.10 },
        { dias: 15, preco: 1020.00, desconto: 0.15 },
        { dias: 30, preco: 1800.00, desconto: 0.25 }
      ],
      status: 'alugado',
      clienteId: '1',
      dataAluguel: new Date().toISOString(),
      dataDevolucao: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // Vence em 2 dias
      localizacao: {
        lat: -23.5505,
        lng: -46.6333,
        endereco: 'Rua das Flores, 123 - Centro, São Paulo'
      },
      estoque: { total: 3, disponivel: 1, alugado: 2, manutencao: 0 }
    },
    {
      id: '3',
      nome: 'Martelo Demolidor',
      categoria: 'Ferramentas Pesadas',
      descricao: 'Martelo demolidor pneumático',
      valorDiario: 120.00,
      precosPeriodo: [
        { dias: 1, preco: 120.00 },
        { dias: 3, preco: 342.00, desconto: 0.05 },
        { dias: 7, preco: 756.00, desconto: 0.10 },
        { dias: 15, preco: 1530.00, desconto: 0.15 },
        { dias: 30, preco: 2700.00, desconto: 0.25 }
      ],
      status: 'disponivel',
      estoque: { total: 2, disponivel: 2, alugado: 0, manutencao: 0 }
    }
  ];
  
  // Aluguéis de exemplo (alguns próximos ao vencimento)
  const alugueisExemplo: Aluguel[] = [
    {
      id: '1',
      clienteId: '1',
      equipamentoId: '2',
      dataInicio: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // Iniciou há 5 dias
      dataFim: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // Vence em 2 dias
      diasAluguel: 7,
      valorDiario: 80.00,
      valorTotal: 504.00,
      status: 'ativo',
      statusPagamento: 'pago',
      dataPagamento: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      observacoes: 'Cliente responsável pela retirada',
      renovacoes: []
    },
    {
      id: '2',
      clienteId: '2',
      equipamentoId: '1',
      dataInicio: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // Iniciou há 2 dias
      dataFim: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(), // Vence amanhã
      diasAluguel: 3,
      valorDiario: 25.00,
      valorTotal: 70.00,
      status: 'ativo',
      statusPagamento: 'devendo',
      observacoes: 'Aluguel de curta duração',
      renovacoes: []
    },
    {
      id: '3',
      clienteId: '1',
      equipamentoId: '3',
      dataInicio: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      dataFim: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      diasAluguel: 7,
      valorDiario: 120.00,
      valorTotal: 756.00,
      status: 'finalizado',
      statusPagamento: 'pago',
      dataPagamento: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      observacoes: 'Aluguel finalizado com sucesso',
      renovacoes: []
    }
  ];
  
  saveClientes(clientesExemplo);
  saveEquipamentos(equipamentosExemplo);
  saveAlugueis(alugueisExemplo);
};