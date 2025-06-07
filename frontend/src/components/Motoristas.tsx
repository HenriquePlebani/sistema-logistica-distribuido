import React, { useState, useEffect } from 'react';
import { cadastroAPI, Motorista } from '../services/api';

const Motoristas: React.FC = () => {
  const [motoristas, setMotoristas] = useState<Motorista[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [filtros, setFiltros] = useState({
    status: '',
    categoria_cnh: ''
  });
  const [form, setForm] = useState({
    nome: '',
    cnh: '',
    telefone: '',
    email: '',
    idade: '',
    endereco: '',
    placa_caminhao: '',
    categoria_cnh: '',
    status: 'ativo'
  });

  const categoriasCNH = ['A', 'B', 'C', 'D', 'E', 'AB', 'AC', 'AD', 'AE'];

  useEffect(() => {
    fetchMotoristas();
  }, [filtros]);

  const fetchMotoristas = async () => {
    setLoading(true);
    try {
      const response = await cadastroAPI.getMotoristas();
      setMotoristas(response.data.motoristas || response.data);
    } catch (error) {
      console.error('Erro ao carregar motoristas:', error);
      alert('Erro ao carregar motoristas');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Preparar dados convertendo tipos corretamente
      const motoristaData: any = {
        nome: form.nome,
        cnh: form.cnh,
        telefone: form.telefone || undefined,
        email: form.email || undefined,
        idade: form.idade ? parseInt(form.idade) : undefined,
        endereco: form.endereco || undefined,
        placa_caminhao: form.placa_caminhao || undefined,
        categoria_cnh: form.categoria_cnh || undefined,
        status: form.status
      };

      if (editingId) {
        await cadastroAPI.updateMotorista(editingId, motoristaData);
        alert('Motorista atualizado com sucesso!');
      } else {
        await cadastroAPI.createMotorista(motoristaData);
        alert('Motorista cadastrado com sucesso!');
      }
      
      // Resetar formulário
      setForm({
        nome: '',
        cnh: '',
        telefone: '',
        email: '',
        idade: '',
        endereco: '',
        placa_caminhao: '',
        categoria_cnh: '',
        status: 'ativo'
      });
      
      setShowForm(false);
      setEditingId(null);
      fetchMotoristas();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Erro ao salvar motorista');
    }
  };

  const handleEdit = (motorista: Motorista) => {
    setForm({
      nome: motorista.nome,
      cnh: motorista.cnh,
      telefone: motorista.telefone || '',
      email: motorista.email || '',
      idade: motorista.idade?.toString() || '',
      endereco: motorista.endereco || '',
      placa_caminhao: motorista.placa_caminhao || '',
      categoria_cnh: motorista.categoria_cnh || '',
      status: motorista.status
    });
    setEditingId(motorista.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number, nome: string) => {
    if (window.confirm(`Tem certeza que deseja excluir o motorista "${nome}"?`)) {
      try {
        await cadastroAPI.deleteMotorista(id);
        alert('Motorista excluído com sucesso!');
        fetchMotoristas();
      } catch (error: any) {
        alert(error.response?.data?.error || 'Erro ao excluir motorista');
      }
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setShowForm(false);
    setForm({
      nome: '',
      cnh: '',
      telefone: '',
      email: '',
      idade: '',
      endereco: '',
      placa_caminhao: '',
      categoria_cnh: '',
      status: 'ativo'
    });
  };

  return (
    <div className="dashboard">
      <div className="page-header">
        <h2>👤 Gestão de Motoristas</h2>
        <p>Cadastre e gerencie os motoristas da sua frota</p>
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
              <option value="ativo">Ativos</option>
              <option value="inativo">Inativos</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>Categoria CNH</label>
            <select
              value={filtros.categoria_cnh}
              onChange={(e) => setFiltros({...filtros, categoria_cnh: e.target.value})}
              className="form-input"
            >
              <option value="">Todas as Categorias</option>
              {categoriasCNH.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Botão Novo Motorista */}
      <div style={{ marginBottom: '2rem' }}>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="btn"
          style={{ background: showForm ? '#dc2626' : '#059669' }}
        >
          {showForm ? '❌ Cancelar' : '➕ Novo Motorista'}
        </button>
      </div>

      {/* Formulário */}
      {showForm && (
        <div className="detail-card" style={{ marginBottom: '2rem' }}>
          <h3>{editingId ? '✏️ Editar Motorista' : '➕ Cadastrar Novo Motorista'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label>Nome completo *</label>
                <input
                  type="text"
                  value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                  required
                  className="form-input"
                  placeholder="Digite o nome completo"
                />
              </div>
              
              <div className="form-group">
                <label>CNH (11 dígitos) *</label>
                <input
                  type="text"
                  value={form.cnh}
                  onChange={(e) => setForm({ ...form, cnh: e.target.value.replace(/\D/g, '') })}
                  maxLength={11}
                  required
                  className="form-input"
                  placeholder="12345678901"
                />
              </div>
              
              <div className="form-group">
                <label>Telefone</label>
                <input
                  type="tel"
                  value={form.telefone}
                  onChange={(e) => setForm({ ...form, telefone: e.target.value })}
                  className="form-input"
                  placeholder="(11) 99999-9999"
                />
              </div>
              
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="form-input"
                  placeholder="motorista@email.com"
                />
              </div>
              
              <div className="form-group">
                <label>Idade</label>
                <input
                  type="number"
                  value={form.idade}
                  onChange={(e) => setForm({ ...form, idade: e.target.value })}
                  min="18"
                  max="80"
                  className="form-input"
                  placeholder="Ex: 35"
                />
              </div>
              
              <div className="form-group">
                <label>Placa do Caminhão</label>
                <input
                  type="text"
                  value={form.placa_caminhao}
                  onChange={(e) => setForm({ ...form, placa_caminhao: e.target.value.toUpperCase() })}
                  className="form-input"
                  placeholder="ABC-1234"
                />
              </div>
              
              <div className="form-group">
                <label>Categoria CNH</label>
                <select
                  value={form.categoria_cnh}
                  onChange={(e) => setForm({ ...form, categoria_cnh: e.target.value })}
                  className="form-input"
                >
                  <option value="">Selecione a categoria</option>
                  {categoriasCNH.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label>Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="form-input"
                >
                  <option value="ativo">Ativo</option>
                  <option value="inativo">Inativo</option>
                </select>
              </div>
            </div>
            
            <div className="form-group">
              <label>Endereço completo</label>
              <textarea
                value={form.endereco}
                onChange={(e) => setForm({ ...form, endereco: e.target.value })}
                rows={3}
                className="form-input"
                placeholder="Rua, número, bairro, cidade, estado..."
              />
            </div>
            
            <div className="form-actions">
              <button type="submit" className="btn" style={{ background: '#059669' }}>
                {editingId ? '✏️ Atualizar' : '💾 Cadastrar'}
              </button>
              <button type="button" onClick={cancelEdit} className="btn" style={{ background: '#6b7280' }}>
                ❌ Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de Motoristas */}
      <div className="detail-card">
        <h3>📋 Lista de Motoristas ({motoristas.length})</h3>
        
        {loading ? (
          <div className="loading">Carregando...</div>
        ) : (
          <div className="motoristas-grid">
            {motoristas.map((motorista) => (
              <div key={motorista.id} className={`motorista-card ${motorista.status}`}>
                <div className="card-header">
                  <h4>{motorista.nome}</h4>
                  <span className={`status-badge ${motorista.status}`}>
                    {motorista.status.toUpperCase()}
                  </span>
                </div>
                
                <div className="card-body">
                  <div className="info-item">
                    <strong>🆔 ID:</strong> {motorista.id}
                  </div>
                  <div className="info-item">
                    <strong>🪪 CNH:</strong> {motorista.cnh}
                  </div>
                  {motorista.categoria_cnh && (
                    <div className="info-item">
                      <strong>📋 Categoria:</strong> {motorista.categoria_cnh}
                    </div>
                  )}
                  {motorista.telefone && (
                    <div className="info-item">
                      <strong>📞 Telefone:</strong> {motorista.telefone}
                    </div>
                  )}
                  {motorista.email && (
                    <div className="info-item">
                      <strong>📧 Email:</strong> {motorista.email}
                    </div>
                  )}
                  {motorista.idade && (
                    <div className="info-item">
                      <strong>🎂 Idade:</strong> {motorista.idade} anos
                    </div>
                  )}
                  {motorista.placa_caminhao && (
                    <div className="info-item">
                      <strong>🚛 Placa:</strong> {motorista.placa_caminhao}
                    </div>
                  )}
                  {motorista.endereco && (
                    <div className="info-item">
                      <strong>📍 Endereço:</strong> {motorista.endereco}
                    </div>
                  )}
                  <div className="info-item">
                    <strong>📅 Cadastrado:</strong> {new Date(motorista.data_cadastro).toLocaleDateString('pt-BR')}
                  </div>
                </div>
                
                <div className="card-actions">
                  <button 
                    onClick={() => handleEdit(motorista)}
                    className="btn btn-edit"
                  >
                    ✏️ Editar
                  </button>
                  <button 
                    onClick={() => handleDelete(motorista.id, motorista.nome)}
                    className="btn btn-delete"
                  >
                    🗑️ Excluir
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {!loading && motoristas.length === 0 && (
          <div className="empty-state">
            <p>🤷‍♂️ Nenhum motorista encontrado</p>
            <button onClick={() => setShowForm(true)} className="btn">
              ➕ Cadastrar Primeiro Motorista
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Motoristas;