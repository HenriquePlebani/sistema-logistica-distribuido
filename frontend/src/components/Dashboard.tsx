import React, { useState, useEffect } from 'react';
import { cadastroAPI, roteirizacaoAPI } from '../services/api';

interface Stats {
  motoristas: {
    total: number;
    ativos: number;
    inativos: number;
  };
  rotas: {
    total: number;
    pendentes: number;
    em_andamento: number;
    concluidas: number;
    distancia_total: number;
    tempo_medio: number;
  };
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [motoristasRes, rotasRes] = await Promise.all([
        cadastroAPI.getEstatisticasMotoristas(),
        roteirizacaoAPI.getEstatisticasRotas()
      ]);

      setStats({
        motoristas: motoristasRes.data,
        rotas: rotasRes.data
      });
    } catch (err: any) {
      setError('Erro ao carregar estatísticas. Verifique se os serviços estão rodando.');
      console.error('Erro:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">📊 Carregando dashboard...</div>;
  }

  if (error) {
    return (
      <div className="dashboard">
        <div className="error">{error}</div>
        <button onClick={fetchStats} className="btn">
          🔄 Tentar Novamente
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <h2>📊 Dashboard - Sistema de Logística</h2>
      
      {/* Cards de Estatísticas */}
      <div className="stats-grid">
        <div className="stat-card blue">
          <div className="icon blue">👥</div>
          <div className="stat-info">
            <h3>Total Motoristas</h3>
            <p className="stat-number">{stats?.motoristas.total || 0}</p>
          </div>
        </div>

        <div className="stat-card green">
          <div className="icon green">✅</div>
          <div className="stat-info">
            <h3>Motoristas Ativos</h3>
            <p className="stat-number">{stats?.motoristas.ativos || 0}</p>
          </div>
        </div>

        <div className="stat-card purple">
          <div className="icon purple">🚛</div>
          <div className="stat-info">
            <h3>Total Rotas</h3>
            <p className="stat-number">{stats?.rotas.total || 0}</p>
          </div>
        </div>

        <div className="stat-card orange">
          <div className="icon orange">🏃</div>
          <div className="stat-info">
            <h3>Em Andamento</h3>
            <p className="stat-number">{stats?.rotas.em_andamento || 0}</p>
          </div>
        </div>
      </div>

      {/* Detalhes */}
      <div className="details-grid">
        <div className="detail-card">
          <h3>📈 Status das Rotas</h3>
          <div className="detail-item">
            <span className="detail-label">⏳ Pendentes:</span>
            <span className="detail-value">{stats?.rotas.pendentes || 0}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">🚛 Em Andamento:</span>
            <span className="detail-value">{stats?.rotas.em_andamento || 0}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">✅ Concluídas:</span>
            <span className="detail-value">{stats?.rotas.concluidas || 0}</span>
          </div>
        </div>

        <div className="detail-card">
          <h3>📊 Performance</h3>
          <div className="detail-item">
            <span className="detail-label">📏 Distância Total:</span>
            <span className="detail-value">{Math.round(stats?.rotas.distancia_total || 0)} km</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">⏱️ Tempo Médio:</span>
            <span className="detail-value">{stats?.rotas.tempo_medio || 0} min</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">📊 Taxa de Conclusão:</span>
            <span className="detail-value">
              {stats?.rotas.total ? Math.round((stats.rotas.concluidas / stats.rotas.total) * 100) : 0}%
            </span>
          </div>
        </div>
      </div>

      <button onClick={fetchStats} className="btn">
        🔄 Atualizar Dados
      </button>
    </div>
  );
};

export default Dashboard;