const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

// Sistema de eventos em memória (igual ao primeiro serviço)
const eventBus = {
  subscribers: {},
  
  publish(channel, data) {
    const event = {
      ...data,
      timestamp: new Date().toISOString(),
      service: 'roteirizacao-service'
    };
    
    console.log(`📢 Evento publicado: ${channel}`, event);
    
    if (this.subscribers[channel]) {
      this.subscribers[channel].forEach(callback => callback(event));
    }
  },
  
  subscribe(channel, callback) {
    if (!this.subscribers[channel]) {
      this.subscribers[channel] = [];
    }
    this.subscribers[channel].push(callback);
  }
};

// Configuração do banco PostgreSQL (mesmo banco, tabela diferente)
const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'logistica',
  user: 'postgres',
  password: '123456' // Mesma senha do primeiro serviço
});

// URL do serviço de cadastro
const CADASTRO_SERVICE_URL = 'http://localhost:3000';

// Função para criar tabela de rotas
async function initDatabase() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS rotas (
        id SERIAL PRIMARY KEY,
        id_motorista INTEGER NOT NULL,
        nome_motorista VARCHAR(255) NOT NULL,
        local_origem VARCHAR(255) DEFAULT 'Depot Central',
        local_destino VARCHAR(255) NOT NULL,
        distancia_km DECIMAL(8,2),
        tempo_estimado_min INTEGER,
        status VARCHAR(20) DEFAULT 'pendente',
        data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        data_inicio TIMESTAMP,
        data_conclusao TIMESTAMP,
        observacoes TEXT,
        prioridade VARCHAR(20) DEFAULT 'normal'
      )
    `);
    console.log('✅ Tabela rotas criada/verificada');
  } catch (error) {
    console.error('❌ Erro ao criar tabela:', error.message);
  }
}

// Função para calcular distância e tempo (simulado)
function calcularDistanciaETempo(origem, destino) {
  const distancia = Math.random() * 50 + 5; // 5-55 km
  const tempo = Math.round(distancia * 2 + Math.random() * 30); // estimativa em minutos
  return { 
    distancia: Math.round(distancia * 10) / 10, 
    tempo 
  };
}

// ROTAS

// Listar todas as rotas
app.get('/rotas', async (req, res) => {
  try {
    const { status, prioridade, id_motorista } = req.query;
    
    let query = 'SELECT * FROM rotas WHERE 1=1';
    let params = [];
    let paramCount = 0;
    
    if (status) {
      query += ` AND status = $${++paramCount}`;
      params.push(status);
    }
    
    if (prioridade) {
      query += ` AND prioridade = $${++paramCount}`;
      params.push(prioridade);
    }
    
    if (id_motorista) {
      query += ` AND id_motorista = $${++paramCount}`;
      params.push(id_motorista);
    }
    
    query += ' ORDER BY data_criacao DESC';
    
    const result = await pool.query(query, params);
    
    res.json({
      rotas: result.rows,
      total: result.rows.length
    });
  } catch (error) {
    console.error('❌ Erro ao listar rotas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Criar nova rota
app.post('/rota', async (req, res) => {
  try {
    const { 
      id_motorista, 
      local_destino, 
      local_origem = 'Depot Central', 
      prioridade = 'normal',
      observacoes 
    } = req.body;
    
    if (!id_motorista || !local_destino) {
      return res.status(400).json({ error: 'id_motorista e local_destino são obrigatórios' });
    }

    // 🔗 COMUNICAÇÃO ENTRE SERVIÇOS: Verificar se motorista existe
    try {
      console.log(`🔍 Consultando motorista ${id_motorista} no serviço de cadastro...`);
      const response = await axios.get(`${CADASTRO_SERVICE_URL}/motoristas/${id_motorista}`);
      const motorista = response.data;
      
      if (motorista.status !== 'ativo') {
        return res.status(400).json({ error: 'Motorista não está ativo' });
      }

      // Calcular distância e tempo
      const { distancia, tempo } = calcularDistanciaETempo(local_origem, local_destino);

      // Criar rota
      const result = await pool.query(`
        INSERT INTO rotas (id_motorista, nome_motorista, local_origem, local_destino, 
                          distancia_km, tempo_estimado_min, prioridade, observacoes) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `, [motorista.id, motorista.nome, local_origem, local_destino, distancia, tempo, prioridade, observacoes]);

      const novaRota = result.rows[0];

      // Publicar evento
      eventBus.publish('rota.created', {
        id: novaRota.id,
        motoristaId: motorista.id,
        motoristaNome: motorista.nome,
        destino: local_destino,
        status: 'pendente'
      });

      res.status(201).json({
        mensagem: `Rota criada para ${local_destino} com motorista ${motorista.nome}`,
        rota: novaRota
      });
      
    } catch (error) {
      if (error.response?.status === 404) {
        res.status(404).json({ error: 'Motorista não encontrado' });
      } else {
        console.error('❌ Erro ao comunicar com serviço de cadastro:', error.message);
        res.status(500).json({ error: 'Erro ao comunicar com serviço de cadastro' });
      }
    }
  } catch (error) {
    console.error('❌ Erro ao criar rota:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atualizar status da rota
app.put('/rotas/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!['pendente', 'em_andamento', 'concluida', 'cancelada'].includes(status)) {
      return res.status(400).json({ error: 'Status inválido' });
    }
    
    let updateFields = 'status = $1';
    let params = [status];
    
    if (status === 'em_andamento') {
      updateFields += ', data_inicio = CURRENT_TIMESTAMP';
    } else if (status === 'concluida') {
      updateFields += ', data_conclusao = CURRENT_TIMESTAMP';
    }
    
    const query = `UPDATE rotas SET ${updateFields} WHERE id = $2 RETURNING *`;
    params.push(id);
    
    const result = await pool.query(query, params);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Rota não encontrada' });
    }
    
    const rota = result.rows[0];
    
    // Publicar evento de mudança de status
    eventBus.publish('rota.status_changed', {
      id: rota.id,
      motoristaId: rota.id_motorista,
      novoStatus: status,
      timestamp: new Date().toISOString()
    });
    
    res.json(rota);
  } catch (error) {
    console.error('❌ Erro ao atualizar status:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Estatísticas de rotas
app.get('/estatisticas/rotas', async (req, res) => {
  try {
    const totalResult = await pool.query('SELECT COUNT(*) FROM rotas');
    const pendentesResult = await pool.query("SELECT COUNT(*) FROM rotas WHERE status = 'pendente'");
    const andamentoResult = await pool.query("SELECT COUNT(*) FROM rotas WHERE status = 'em_andamento'");
    const concluidasResult = await pool.query("SELECT COUNT(*) FROM rotas WHERE status = 'concluida'");
    const distanciaResult = await pool.query("SELECT SUM(distancia_km) FROM rotas WHERE status = 'concluida'");
    const tempoResult = await pool.query("SELECT AVG(tempo_estimado_min) FROM rotas");
    
    res.json({
      total: parseInt(totalResult.rows[0].count),
      pendentes: parseInt(pendentesResult.rows[0].count),
      em_andamento: parseInt(andamentoResult.rows[0].count),
      concluidas: parseInt(concluidasResult.rows[0].count),
      distancia_total: parseFloat(distanciaResult.rows[0].sum || 0),
      tempo_medio: Math.round(parseFloat(tempoResult.rows[0].avg || 0))
    });
  } catch (error) {
    console.error('❌ Erro ao buscar estatísticas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Deletar rota
app.delete('/rotas/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query('DELETE FROM rotas WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Rota não encontrada' });
    }
    
    const rotaExcluida = result.rows[0];
    
    // Publicar evento
    eventBus.publish('rota.deleted', {
      id: rotaExcluida.id,
      motoristaId: rotaExcluida.id_motorista,
      destino: rotaExcluida.local_destino
    });
    
    res.json({ 
      mensagem: 'Rota removida com sucesso',
      rota: rotaExcluida 
    });
  } catch (error) {
    console.error('❌ Erro ao excluir rota:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'roteirizacao-service',
    timestamp: new Date().toISOString(),
    dependencies: {
      database: 'connected',
      cadastro_service: CADASTRO_SERVICE_URL
    }
  });
});

// Inicializar servidor
const PORT = 4000;

async function startServer() {
  try {
    await initDatabase();
    
    app.listen(PORT, () => {
      console.log(`🚛 Serviço de Roteirização rodando na porta ${PORT}`);
      console.log(`🏥 Health check: http://localhost:${PORT}/health`);
      console.log(`📍 Rotas: http://localhost:${PORT}/rotas`);
      console.log(`🔗 Conectado ao Cadastro: ${CADASTRO_SERVICE_URL}`);
    });
  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
  }
}

startServer();

module.exports = { eventBus };