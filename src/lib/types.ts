export interface Cliente {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  // Novos campos obrigatórios
  documento: string; // CPF ou CNPJ
  tipoDocumento: 'cpf' | 'cnpj';
  observacoes?: string; // Campo opcional
  endereco: {
    rua: string;
    numero: string;
    bairro: string;
    cidade: string;
    cep: string;
    coordenadas?: {
      lat: number;
      lng: number;
    };
  };
  dataCadastro: string;
  // Novos campos para histórico e dívidas
  historicoAlugueis?: string[]; // IDs dos aluguéis
  totalFaturamento?: number;
  possuiDivida?: boolean;
  valorDivida?: number;
}

export interface PrecoPeriodo {
  dias: number;
  preco: number;
  desconto?: number;
}

export interface Equipamento {
  id: string;
  nome: string;
  categoria: string;
  descricao: string;
  valorDiario: number;
  precosPeriodo: PrecoPeriodo[];
  status: 'disponivel' | 'alugado' | 'manutencao';
  clienteId?: string;
  dataAluguel?: string;
  dataDevolucao?: string;
  localizacao?: {
    lat: number;
    lng: number;
    endereco: string;
  };
  estoque: {
    total: number;
    disponivel: number;
    alugado: number;
    manutencao: number;
  };
}

export interface Aluguel {
  id: string;
  clienteId: string;
  equipamentoId: string;
  dataInicio: string;
  dataFim: string;
  diasAluguel: number;
  valorDiario: number;
  valorTotal: number;
  status: 'ativo' | 'finalizado' | 'atrasado';
  // Novos campos para status de pagamento
  statusPagamento: 'pago' | 'pendente' | 'devendo';
  dataPagamento?: string;
  observacoes?: string;
  // Campos para renovação
  renovacoes?: {
    id: string;
    dataRenovacao: string;
    novaDataFim: string;
    diasAdicionais: number;
    valorAdicional: number;
  }[];
}

export interface Usuario {
  id: string;
  username: string;
  password: string;
  nome: string;
  email: string;
  role: 'admin' | 'operador';
  dataCriacao: string;
}

export interface AluguelVencimento {
  aluguel: Aluguel;
  cliente: Cliente;
  equipamento: Equipamento;
  diasParaVencimento: number;
  vencido: boolean;
}

export interface HistoricoCliente {
  cliente: Cliente;
  alugueis: Aluguel[];
  totalFaturamento: number;
  alugueisAtivos: number;
  alugueisFinalizados: number;
  possuiDivida: boolean;
  valorDivida: number;
}

export type TabType = 'dashboard' | 'clientes' | 'equipamentos' | 'alugueis' | 'mapa' | 'historico';