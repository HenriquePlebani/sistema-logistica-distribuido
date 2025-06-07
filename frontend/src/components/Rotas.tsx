import React, { useState, useEffect } from 'react';
import { roteirizacaoAPI, cadastroAPI, Rota, Motorista } from '../services/api';

const Rotas: React.FC = () => {
  const [rotas, setRotas] = useState<Rota[]>([]);
  const [motoristas, setMotoristas] = useState<Motorista[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [filtros, setFiltros] = useState({
    status: '',
    prioridade: '',
    id_motorista: ''
  });
  const [form, setForm] = useState({
    id_motorista: '',
    local_origem: 'Depot Central',
    local_destino: '',
    prioridade: 'normal',
    observacoes: ''
  });

  const statusOptions = [
    { value: 'pendente', label: 'Pendente', color: '#f59e0b' },
    { value: 'em_andamento', label: 'Em Andamento', color: '#3b82f6' },
    { value: 'concluida', label: 'Concluída', color: '#10b981' },
    { value: 'cancelada', label: 'Cancelada', color: '#ef4444' }
  ];

  const prioridadeOptions = [
    { value: 'baixa', label: 'Baixa', color: '#10b981' },
    { value: 'normal', label: 'Normal', color: '#f59e0b' },
    { value: 'alta', label: 'Alta', color: '#ef4444' },
    { value: 'urgente', label: 'Urgente', color: '#dc2626' }
  ];

  useEffect(() => {
    fetchRotas();
    fetchMotoristas();
  }, [filtros]);

  const fetchRotas = async () => {
    setLoading(true);
    try {
      const response = await roteirizacaoAPI.getRotas(filtros);
      setRotas(response.data.rotas || response.data);
    } catch (error) {
      console.error('Erro ao carregar rotas:', error);
      alert('Erro ao carregar rotas');
    } finally {
      setLoading(false);
    }
  };

  const fetchMotoristas = async () => {
    try {
      const response = await cadastroAPI.getMotoristas();
      const motoristasAtivos = (response.data.motoristas || response.data).filter(
        (m: Motorista) => m.status === 'ativo'
      );
      setMotoristas(motoristasAtivos);
    } catch (error) {
      console.error('Erro ao carregar motoristas:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await roteirizacaoAPI.createRota(form);
      alert('Rota criada com sucesso!');
      
      // Resetar formulário
      setForm({
        id_motorista: '',
        local_origem: 'Depot Central',
        local_destino: '',
        prioridade: 'normal',
        observacoes: ''
      });
      
      setShowForm(false);
      fetchRotas();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Erro ao criar rota');
    }
  };

  const handleStatusChange = async (id: number, novoStatus: string) => {
    try {
      await roteirizacaoAPI.updateStatusRota(id, novoStatus);
      alert(`Status atualizado para: ${novoStatus.replace('_', ' ')}`);
      fetchRotas();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Erro ao atualizar status');
    }
  };

  const handleDelete = async (id: number, destino: string) => {
    if (window.confirm(`Tem certeza que deseja excluir a rota para "${destino}"?`)) {
      try {
        await roteirizacaoAPI.deleteRota(id);
        alert('Rota excluída com sucesso!');
        fetchRotas();
      } catch (error: any) {
        alert(error.response?.data?.error || 'Erro ao excluir rota');
      }
    }
  };

  const getStatusColor = (status: string) => {
    const statusObj = statusOptions.find(s => s.value === status);
    return statusObj?.color || '#6b7280';
  };

  const getPrioridadeColor = (prioridade: string) => {
    const prioridadeObj = prioridadeOptions.find(p => p.value === prioridade);
    return prioridadeObj?.color || '#6b7280';
  };

  const getStatusActions = (rota: Rota) => {
    const actions = [];
    
    if (rota.status === 'pendente') {
      actions.push(
        <button
          key="iniciar"
          onClick={() => handleStatusChange(rota.id, 'em_andamento')}
          className="btn btn-edit"
          style={{ background: '#3b82f6', fontSize: '0.8rem', padding: '0.5rem 1rem' }}
        >
          ▶️ Iniciar
        </button>
      );
    }
    
    if (rota.status === 'em_andamento') {
      actions.push(
        <button
          key="concluir"
          onClick={() => handleStatusChange(rota.id, 'concluida')}
          className="btn btn-edit"
          style={{ background: '#10b981', fontSize: '0.8rem', padding: '0.5rem 1rem' }}
        >
          ✅ Concluir
        </button>
      );
    }
    
    if (['pendente', 'em_andamento'].includes(rota.status)) {
      actions.push(
        <button
          key="cancelar"
          onClick={() => handleStatusChange(rota.id, 'cancelada')}
          className="btn btn-delete"
          style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}
        >
          ❌ Cancelar
        </button>
      );
    }
    
    return actions;
  };

  const cancelForm = () => {
    setShowForm(false);
    setForm({
      id_motorista: '',
      local_origem: 'Depot Central',
      local_destino: '',
      prioridade: 'normal',
      observacoes: ''
    });
  };

  return (
    <div className="dashboard">
      <div className="page-header">
        <h2>🚛 Gestão de Rotas</h2>
        <p>Crie e gerencie rotas de entrega para sua frota</p>
      </div>

      {/* Filtros */}
      <div className="detail-card" style={{ marginBottom: '2rem' }}>
        <h3>🔍 Filtros</h3>
        <div className="form-grid">
          <div className="form-group">
            <label>Status</label>
            <select
              value={filtros.status}
              onChange={(e) => setFiltros({...filtros, status: e.target.value})}
              className="form-input"
            >
              <option value="">Todos os Status</option>
              {statusOptions.map(status => (
                <option key={status.value} value={status.value}>{status.label}</option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label>Prioridade</label>
            <select
              value={filtros.prioridade}
              onChange={(e) => setFiltros({...filtros, prioridade: e.target.value})}
              className="form-input"
            >
              <option value="">Todas as Prioridades</option>
              {prioridadeOptions.map(prioridade => (
                <option key={prioridade.value} value={prioridade.value}>{prioridade.label}</option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label>Motorista</label>
            <select
              value={filtros.id_motorista}
              onChange={(e) => setFiltros({...filtros, id_motorista: e.target.value})}
              className="form-input"
            >
              <option value="">Todos os Motoristas</option>
              {motoristas.map(motorista => (
                <option key={motorista.id} value={motorista.id.toString()}>
                  {motorista.nome}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Botão Nova Rota */}
      <div style={{ marginBottom: '2rem' }}>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="btn"
          style={{ background: showForm ? '#dc2626' : '#059669' }}
        >
          {showForm ? '❌ Cancelar' : '➕ Nova Rota'}
        </button>
      </div>

      {/* Formulário */}
      {showForm && (
        <div className="detail-card" style={{ marginBottom: '2rem' }}>
          <h3>➕ Criar Nova Rota</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label>Motorista *</label>
                <select
                  value={form.id_motorista}
                  onChange={(e) => setForm({ ...form, id_motorista: e.target.value })}
                  required
                  className="form-input"
                >
                  <option value="">Selecione um motorista</option>
                  {motoristas.map(motorista => (
                    <option key={motorista.id} value={motorista.id.toString()}>
                      {motorista.nome} - CNH: {motorista.cnh}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label>Local de Origem</label>
                <input
                  type="text"
                  value={form.local_origem}
                  onChange={(e) => setForm({ ...form, local_origem: e.target.value })}
                  className="form-input"
                  placeholder="Ex: Centro de Distribuição"
                />
              </div>
              
              <div className="form-group">
                <label>Local de Destino *</label>
                <input
                  type="text"
                  value={form.local_destino}
                  onChange={(e) => setForm({ ...form, local_destino: e.target.value })}
                  required
                  className="form-input"
                  placeholder="Ex: Av. Paulista, 1000 - São Paulo/SP"
                />
              </div>
              
              <div className="form-group">
                <label>Prioridade</label>
                <select
                  value={form.prioridade}
                  onChange={(e) => setForm({ ...form, prioridade: e.target.value })}
                  className="form-input"
                >
                  {prioridadeOptions.map(prioridade => (
                    <option key={prioridade.value} value={prioridade.value}>
                      {prioridade.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="form-group">
              <label>Observações</label>
              <textarea
                value={form.observacoes}
                onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
                rows={3}
                className="form-input"
                placeholder="Instruções especiais, horário preferido, etc..."
              />
            </div>
            
            <div className="form-actions">
              <button type="submit" className="btn" style={{ background: '#059669' }}>
                🚛 Criar Rota
              </button>
              <button type="button" onClick={cancelForm} className="btn" style={{ background: '#6b7280' }}>
                ❌ Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de Rotas */}
      <div className="detail-card">
        <h3>📋 Lista de Rotas ({rotas.length})</h3>
        
        {loading ? (
          <div className="loading">Carregando...</div>
        ) : (
          <div className="motoristas-grid">
            {rotas.map((rota) => (
              <div key={rota.id} className="motorista-card">
                <div className="card-header">
                  <h4>Rota #{rota.id}</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(rota.status) }}
                    >
                      {rota.status.replace('_', ' ').toUpperCase()}
                    </span>
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getPrioridadeColor(rota.prioridade), fontSize: '0.7rem' }}
                    >
                      {rota.prioridade.toUpperCase()}
                    </span>
                  </div>
                </div>
                
                <div className="card-body">
                  <div className="info-item">
                    <strong>👤 Motorista:</strong> {rota.nome_motorista}
                  </div>
                  <div className="info-item">
                    <strong>📍 Origem:</strong> {rota.local_origem}
                  </div>
                  <div className="info-item">
                    <strong>🎯 Destino:</strong> {rota.local_destino}
                  </div>
                  <div className="info-item">
                    <strong>📏 Distância:</strong> {rota.distancia_km} km
                  </div>
                  <div className="info-item">
                    <strong>⏱️ Tempo Est.:</strong> {rota.tempo_estimado_min} min
                  </div>
                  {rota.observacoes && (
                    <div className="info-item">
                      <strong>📝 Observações:</strong> {rota.observacoes}
                    </div>
                  )}
                  <div className="info-item">
                    <strong>📅 Criada:</strong> {new Date(rota.data_criacao).toLocaleString('pt-BR')}
                  </div>
                  {rota.data_inicio && (
                    <div className="info-item">
                      <strong>🚀 Iniciada:</strong> {new Date(rota.data_inicio).toLocaleString('pt-BR')}
                    </div>
                  )}
                  {rota.data_conclusao && (
                    <div className="info-item">
                      <strong>✅ Concluída:</strong> {new Date(rota.data_conclusao).toLocaleString('pt-BR')}
                    </div>
                  )}
                </div>
                
                <div className="card-actions">
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {getStatusActions(rota)}
                  </div>
                  <button 
                    onClick={() => handleDelete(rota.id, rota.local_destino)}
                    className="btn btn-delete"
                    style={{ marginTop: '0.5rem' }}
                  >
                    🗑️ Excluir
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {!loading && rotas.length === 0 && (
          <div className="empty-state">
            <p>🤷‍♂️ Nenhuma rota encontrada</p>
            <button onClick={() => setShowForm(true)} className="btn">
              ➕ Criar Primeira Rota
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Rotas;