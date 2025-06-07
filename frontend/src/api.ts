import axios from 'axios';

// URLs dos serviços
const CADASTRO_API = 'http://localhost:3000';
const ROTEIRIZACAO_API = 'http://localhost:4000';

// Tipos TypeScript
export interface Motorista {
  id: number;
  nome: string;
  cnh: string;
  telefone?: string;
  email?: string;
  placa_caminhao?: string;
  idade?: number;
  status: 'ativo' | 'inativo';
  data_cadastro: string;
  endereco?: string;
  categoria_cnh?: string;
}

export interface Rota {
  id: number;
  id_motorista: number;
  nome_motorista: string;
  local_origem: string;
  local_destino: string;
  distancia_km: number;
  tempo_estimado_min: number;
  status: 'pendente' | 'em_andamento' | 'concluida' | 'cancelada';
  data_criacao: string;
  data_inicio?: string;
  data_conclusao?: string;
  observacoes?: string;
  prioridade: 'baixa' | 'normal' | 'alta' | 'urgente';
}

// API do Cadastro
export const cadastroAPI = {
  // Motoristas
  getMotoristas: () => axios.get(`${CADASTRO_API}/motoristas`),
  getMotorista: (id: number) => axios.get(`${CADASTRO_API}/motoristas/${id}`),
  createMotorista: (data: any) => axios.post(`${CADASTRO_API}/motoristas`, data),
  updateMotorista: (id: number, data: any) => axios.put(`${CADASTRO_API}/motoristas/${id}`, data), // NOVO
  deleteMotorista: (id: number) => axios.delete(`${CADASTRO_API}/motoristas/${id}`), // NOVO
  getEstatisticasMotoristas: () => axios.get(`${CADASTRO_API}/estatisticas/motoristas`),
  
  // Health check
  healthCheck: () => axios.get(`${CADASTRO_API}/health`)
};

// API da Roteirização  
export const roteirizacaoAPI = {
  // Rotas
  getRotas: (params?: any) => axios.get(`${ROTEIRIZACAO_API}/rotas`, { params }),
  createRota: (data: any) => axios.post(`${ROTEIRIZACAO_API}/rota`, data),
  updateStatusRota: (id: number, status: string) => 
    axios.put(`${ROTEIRIZACAO_API}/rotas/${id}/status`, { status }),
  deleteRota: (id: number) => axios.delete(`${ROTEIRIZACAO_API}/rotas/${id}`), // NOVO
  getEstatisticasRotas: () => axios.get(`${ROTEIRIZACAO_API}/estatisticas/rotas`),
  
  // Health check
  healthCheck: () => axios.get(`${ROTEIRIZACAO_API}/health`)
};