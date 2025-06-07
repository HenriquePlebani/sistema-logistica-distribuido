const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

// Sistema de eventos em memória (substitui Redis)
const eventBus = {
  subscribers: {},
  
  // Publicar evento
  publish(channel, data) {
    const event = {
      ...data,
      timestamp: new Date().toISOString(),
      service: 'cadastro-service'
    };
    
    console.log(`📢 Evento publicado: ${channel}`, event);
    
    // Simular notificação para outros serviços
    if (this.subscribers[channel]) {
      this.subscribers[channel].forEach(callback => callback(event));
    }
  },
  
  // Subscrever a eventos
  subscribe(channel, callback) {
    if (!this.subscribers[channel]) {
      this.subscribers[channel] = [];
    }
    this.subscribers[channel].push(callback);
  }
};

// Configuração do banco PostgreSQL
const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'logistica',
  user: 'postgres',
  password: '123456' // Troque pela sua senha do PostgreSQL
});

// Função para criar tabela
async function initDatabase() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS motoristas (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        cnh VARCHAR(11) UNIQUE NOT NULL,
        telefone VARCHAR(20),
        email VARCHAR(255),
        placa_caminhao VARCHAR(10),
        idade INTEGER,
        status VARCHAR(20) DEFAULT 'ativo',
        data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        endereco TEXT,
        categoria_cnh VARCHAR(5),
        latitude DECIMAL(10, 8),
        longitude DECIMAL(11, 8),
        ultima_localizacao TIMESTAMP
      )
    `);
    console.log('✅ Tabela motoristas criada/verificada');
  } catch (error) {
    console.error('❌ Erro ao criar tabela:', error.message);
  }
}

// ROTAS

// Listar motoristas
app.get('/motoristas', async (req, res) => {
  try {
    const { status, categoria_cnh, page = 1, limit = 10 } = req.query;
    
    let query = 'SELECT * FROM motoristas WHERE 1=1';
    let params = [];
    let paramCount = 0;
    
    if (status) {
      query += ` AND status = $${++paramCount}`;
      params.push(status);
    }
    
    if (categoria_cnh) {
      query += ` AND categoria_cnh = $${++paramCount}`;
      params.push(categoria_cnh);
    }
    
    query += ' ORDER BY data_cadastro DESC';
    
    const result = await pool.query(query, params);
    
    res.json({ 
      motoristas: result.rows,
      total: result.rows.length 
    });
  } catch (error) {
    console.error('❌ Erro ao listar motoristas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Buscar motorista por ID
app.get('/motoristas/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM motoristas WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Motorista não encontrado' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('❌ Erro ao buscar motorista:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Criar motorista
app.post('/motoristas', async (req, res) => {
  try {
    const { nome, cnh, telefone, email, placa_caminhao, idade, endereco, categoria_cnh } = req.body;
    
    // Validações
    if (!nome || !cnh) {
      return res.status(400).json({ error: 'Nome e CNH são obrigatórios' });
    }
    
    const result = await pool.query(`
      INSERT INTO motoristas (nome, cnh, telefone, email, placa_caminhao, idade, endereco, categoria_cnh)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [nome, cnh, telefone, email, placa_caminhao, idade, endereco, categoria_cnh]);
    
    const novoMotorista = result.rows[0];
    
    // Publicar evento
    eventBus.publish('motorista.created', {
      id: novoMotorista.id,
      nome: novoMotorista.nome,
      status: novoMotorista.status
    });
    
    res.status(201).json(novoMotorista);
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ error: 'CNH já cadastrada' });
    }
    console.error('❌ Erro ao criar motorista:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atualizar localização do motorista
app.put('/motoristas/:id/localizacao', async (req, res) => {
  try {
    const { id } = req.params;
    const { latitude, longitude } = req.body;
    
    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Latitude e longitude são obrigatórias' });
    }
    
    const result = await pool.query(`
      UPDATE motoristas 
      SET latitude = $1, longitude = $2, ultima_localizacao = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *
    `, [latitude, longitude, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Motorista não encontrado' });
    }
    
    const motorista = result.rows[0];
    
    // Publicar evento de localização
    eventBus.publish('motorista.location', {
      motoristaId: id,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      timestamp: new Date().toISOString()
    });
    
    res.json(motorista);
  } catch (error) {
    console.error('❌ Erro ao atualizar localização:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Estatísticas
app.get('/estatisticas/motoristas', async (req, res) => {
  try {
    const totalResult = await pool.query('SELECT COUNT(*) FROM motoristas');
    const ativosResult = await pool.query("SELECT COUNT(*) FROM motoristas WHERE status = 'ativo'");
    const inativosResult = await pool.query("SELECT COUNT(*) FROM motoristas WHERE status = 'inativo'");
    const categoriaResult = await pool.query('SELECT categoria_cnh, COUNT(*) FROM motoristas GROUP BY categoria_cnh');
    
    res.json({
      total: parseInt(totalResult.rows[0].count),
      ativos: parseInt(ativosResult.rows[0].count),
      inativos: parseInt(inativosResult.rows[0].count),
      por_categoria: categoriaResult.rows.map(row => ({
        categoria_cnh: row.categoria_cnh,
        count: parseInt(row.count)
      }))
    });
  } catch (error) {
    console.error('❌ Erro ao buscar estatísticas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atualizar motorista
app.put('/motoristas/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, telefone, email, placa_caminhao, idade, endereco, categoria_cnh, status } = req.body;
    
    // Validações
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Email inválido' });
    }
    
    if (idade && (idade < 18 || idade > 80)) {
      return res.status(400).json({ error: 'Idade deve estar entre 18 e 80 anos' });
    }
    
    const result = await pool.query(`
      UPDATE motoristas 
      SET nome = $1, telefone = $2, email = $3, placa_caminhao = $4, 
          idade = $5, endereco = $6, categoria_cnh = $7, status = $8
      WHERE id = $9
      RETURNING *
    `, [nome, telefone, email, placa_caminhao, idade, endereco, categoria_cnh, status, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Motorista não encontrado' });
    }
    
    const motoristaAtualizado = result.rows[0];
    
    // Publicar evento
    eventBus.publish('motorista.updated', {
      id: motoristaAtualizado.id,
      nome: motoristaAtualizado.nome,
      status: motoristaAtualizado.status
    });
    
    res.json(motoristaAtualizado);
  } catch (error) {
    console.error('❌ Erro ao atualizar motorista:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Deletar motorista
app.delete('/motoristas/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query('DELETE FROM motoristas WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Motorista não encontrado' });
    }
    
    const motoristaExcluido = result.rows[0];
    
    // Publicar evento
    eventBus.publish('motorista.deleted', {
      id: motoristaExcluido.id,
      nome: motoristaExcluido.nome
    });
    
    res.json({ 
      mensagem: 'Motorista removido com sucesso',
      motorista: motoristaExcluido 
    });
  } catch (error) {
    console.error('❌ Erro ao excluir motorista:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'cadastro-service',
    timestamp: new Date().toISOString() 
  });
});

// Inicializar servidor
const PORT = 3000;

async function startServer() {
  try {
    await initDatabase();
    
    app.listen(PORT, () => {
      console.log(`🚀 Serviço de Cadastro rodando na porta ${PORT}`);
      console.log(`🏥 Health check: http://localhost:${PORT}/health`);
      console.log(`👥 Motoristas: http://localhost:${PORT}/motoristas`);
    });
  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
  }
}

startServer();

// Exportar eventBus para outros serviços usarem
module.exports = { eventBus };