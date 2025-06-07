# 🚚 Sistema de Logística Distribuído

Sistema distribuído completo para gestão de frotas e roteirização de entregas, desenvolvido como trabalho acadêmico de Sistemas Distribuídos.

![Status](https://img.shields.io/badge/Status-Concluído-success)
![Tecnologia](https://img.shields.io/badge/Tech-Node.js%20|%20React%20|%20PostgreSQL-blue)
![Arquitetura](https://img.shields.io/badge/Arquitetura-Microserviços-orange)

## 📋 **Índice**

- [Visão Geral](#visão-geral)
- [Arquitetura](#arquitetura)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Funcionalidades](#funcionalidades)
- [Instalação e Configuração](#instalação-e-configuração)
- [Como Usar](#como-usar)
- [API Endpoints](#api-endpoints)
- [Demonstração](#demonstração)
- [Arquivos do Projeto](#arquivos-do-projeto)

---

## 🎯 **Visão Geral**

Este sistema implementa uma **arquitetura de microserviços** para gerenciamento de frotas de caminhões, permitindo:

- 👥 **Gestão de Motoristas** - CRUD completo com validações
- 🚛 **Roteirização Inteligente** - Criação e acompanhamento de rotas
- 📊 **Dashboard em Tempo Real** - Métricas e estatísticas
- 🔄 **Comunicação entre Serviços** - Via REST API
- 📢 **Sistema de Eventos** - Mensageria assíncrona

---

## 🏗️ **Arquitetura**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │  Cadastro       │    │ Roteirização    │
│   React         │◄──►│  Service        │◄──►│ Service         │
│   (Porta 3001)  │    │  (Porta 3000)   │    │ (Porta 4000)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌────────▼───────────────────────▼────┐
         │              │         PostgreSQL Database         │
         │              │            (Porta 5432)             │
         └──────────────┤               logistica             │
                        └─────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│                    Sistema de Eventos                          │
│              EventBus (Mensageria em Memória)                  │
│   motorista.created │ motorista.updated │ rota.created         │
└────────────────────────────────────────────────────────────────┘
```

### **Componentes Principais:**

1. **Frontend (React + TypeScript)**
   - Interface responsiva e interativa
   - Gerenciamento de estado local
   - Comunicação via Axios

2. **Serviço de Cadastro (Node.js + Express)**
   - Gerenciamento de motoristas
   - Validações de negócio
   - Sistema de eventos

3. **Serviço de Roteirização (Node.js + Express)**
   - Gestão de rotas e entregas
   - Comunicação com serviço de cadastro
   - Cálculo de distâncias

4. **Banco de Dados (PostgreSQL)**
   - Persistência compartilhada
   - Transações ACID
   - Relacionamentos entre entidades

---

## 🛠️ **Tecnologias Utilizadas**

### **Backend:**
- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **PostgreSQL** - Banco de dados relacional
- **Axios** - Cliente HTTP para comunicação entre serviços
- **CORS** - Middleware para Cross-Origin Resource Sharing

### **Frontend:**
- **React 18** - Biblioteca para interfaces
- **TypeScript** - JavaScript tipado
- **CSS3** - Estilização moderna
- **Axios** - Cliente HTTP

### **Ferramentas de Desenvolvimento:**
- **Nodemon** - Reinicialização automática
- **pgAdmin** - Interface gráfica para PostgreSQL
- **VS Code** - Editor de código
- **GitHub Desktop** - Controle de versão

### **Arquitetura:**
- **Microserviços** - Serviços independentes
- **REST API** - Comunicação padronizada
- **Event-Driven** - Sistema de eventos assíncronos

---

## ⚡ **Funcionalidades**

### **👥 Gestão de Motoristas**
- ✅ Cadastro com validações (CNH, email, idade)
- ✅ Edição de informações
- ✅ Ativação/desativação
- ✅ Filtros por status e categoria CNH
- ✅ Listagem paginada

### **🚛 Gestão de Rotas**
- ✅ Criação de rotas com seleção de motorista
- ✅ Cálculo automático de distância e tempo
- ✅ Controle de status (Pendente → Em Andamento → Concluída)
- ✅ Priorização de entregas
- ✅ Filtros avançados
- ✅ Histórico completo

### **📊 Dashboard Analítico**
- ✅ KPIs em tempo real
- ✅ Estatísticas de motoristas
- ✅ Métricas de performance
- ✅ Taxa de conclusão
- ✅ Atualização automática

### **🔧 Funcionalidades Técnicas**
- ✅ Comunicação entre microserviços
- ✅ Sistema de eventos assíncronos
- ✅ Validações robustas
- ✅ Tratamento de erros
- ✅ Interface responsiva
- ✅ Operações CRUD completas

---

## 🚀 **Instalação e Configuração**

### **Pré-requisitos:**
- Node.js 18+ ([Download](https://nodejs.org))
- PostgreSQL 15+ ([Download](https://postgresql.org))
- Git ([Download](https://git-scm.com))

### **1. Clonar o Repositório:**
```bash
git clone https://github.com/HenriquePlebani/sistema-logistica-distribuido.git
cd sistema-logistica-distribuido
```

### **2. Configurar Banco de Dados:**

**2.1 Criar banco no PostgreSQL:**
```sql
-- Via pgAdmin ou psql
CREATE DATABASE logistica;
```

**2.2 Configurar credenciais:**
- **Host:** localhost
- **Porta:** 5432
- **Banco:** logistica
- **Usuário:** postgres
- **Senha:** 123456 (ou sua senha)

### **3. Configurar Serviço de Cadastro:**
```bash
cd services/cadastro-service
npm install
npm run dev
```

**Deve aparecer:**
```
✅ Tabela motoristas criada/verificada
🚀 Serviço de Cadastro rodando na porta 3000
```

### **4. Configurar Serviço de Roteirização:**
```bash
# Em outro terminal
cd services/roteirizacao-service
npm install
npm run dev
```

**Deve aparecer:**
```
✅ Tabela rotas criada/verificada
🚛 Serviço de Roteirização rodando na porta 4000
```

### **5. Configurar Frontend:**
```bash
# Em outro terminal
cd frontend
npm install
npm start
```

**Deve aparecer:**
```
Local: http://localhost:3001
```

### **6. Verificar Instalação:**

**URLs para testar:**
- 🖥️ **Frontend:** http://localhost:3001
- 👥 **API Cadastro:** http://localhost:3000/health
- 🚛 **API Rotas:** http://localhost:4000/health

---

## 📱 **Como Usar**

### **1. Acessar o Sistema:**
1. Abra http://localhost:3001 no navegador
2. Você verá 3 abas: Dashboard, Motoristas, Rotas

### **2. Cadastrar Motoristas:**
1. **Clique** na aba "Motoristas"
2. **Clique** em "➕ Novo Motorista"
3. **Preencha** os dados obrigatórios:
   - Nome completo
   - CNH (11 dígitos)
4. **Preencha** dados opcionais:
   - Telefone, email, idade, placa, categoria CNH, endereço
5. **Clique** em "💾 Cadastrar"

### **3. Gerenciar Motoristas:**
- **✏️ Editar:** Clique no botão "Editar" em qualquer motorista
- **🗑️ Excluir:** Clique no botão "Excluir" (com confirmação)
- **🔍 Filtrar:** Use os filtros por status ou categoria CNH

### **4. Criar Rotas:**
1. **Clique** na aba "Rotas"
2. **Clique** em "➕ Nova Rota"
3. **Selecione** um motorista ativo
4. **Preencha** origem e destino
5. **Escolha** a prioridade
6. **Adicione** observações (opcional)
7. **Clique** em "🚛 Criar Rota"

### **5. Gerenciar Rotas:**
- **▶️ Iniciar:** Muda status de "Pendente" para "Em Andamento"
- **✅ Concluir:** Muda status de "Em Andamento" para "Concluída"
- **❌ Cancelar:** Cancela a rota
- **🗑️ Excluir:** Remove a rota permanentemente
- **🔍 Filtrar:** Por status, prioridade ou motorista

### **6. Monitorar via Dashboard:**
- **📊 KPIs:** Números totais e por status
- **📈 Performance:** Distância total, tempo médio, taxa de conclusão
- **🔄 Atualizar:** Dados em tempo real

---

## 🔗 **API Endpoints**

### **Serviço de Cadastro (Porta 3000):**

#### **Motoristas:**
```http
GET    /motoristas              # Listar todos
GET    /motoristas/:id          # Buscar por ID
POST   /motoristas              # Criar novo
PUT    /motoristas/:id          # Atualizar
DELETE /motoristas/:id          # Excluir

# Endpoints especiais
GET    /estatisticas/motoristas # Estatísticas
PUT    /motoristas/:id/localizacao # Atualizar GPS
GET    /health                  # Status do serviço
```

#### **Exemplo - Criar Motorista:**
```json
POST /motoristas
Content-Type: application/json

{
  "nome": "João Silva",
  "cnh": "12345678901",
  "telefone": "11999999999",
  "email": "joao@email.com",
  "categoria_cnh": "C",
  "idade": 35,
  "endereco": "Rua das Flores, 123, São Paulo, SP",
  "placa_caminhao": "ABC-1234"
}
```

### **Serviço de Roteirização (Porta 4000):**

#### **Rotas:**
```http
GET    /rotas                   # Listar todas
POST   /rota                    # Criar nova
PUT    /rotas/:id/status        # Atualizar status
DELETE /rotas/:id              # Excluir

# Endpoints especiais
GET    /estatisticas/rotas      # Estatísticas
GET    /health                  # Status do serviço
```

#### **Exemplo - Criar Rota:**
```json
POST /rota
Content-Type: application/json

{
  "id_motorista": 1,
  "local_origem": "Centro de Distribuição",
  "local_destino": "Av. Paulista, 1000, São Paulo, SP",
  "prioridade": "alta",
  "observacoes": "Entrega urgente até 18h"
}
```

#### **Exemplo - Atualizar Status:**
```json
PUT /rotas/1/status
Content-Type: application/json

{
  "status": "em_andamento"
}
```

### **Códigos de Status HTTP:**
- **200** - Sucesso
- **201** - Criado com sucesso
- **400** - Erro de validação
- **404** - Não encontrado
- **500** - Erro interno do servidor

---

## 🎬 **Demonstração**

### **Fluxo Completo de Uso:**

1. **📊 Dashboard Inicial**
   - Visualização de métricas zeradas
   - Interface limpa e profissional

2. **👤 Cadastro de Motorista**
   - Formulário com validações
   - Feedback visual de sucesso

3. **🚛 Criação de Rota**
   - Seleção de motorista cadastrado
   - Cálculo automático de distância

4. **🔄 Gestão de Status**
   - Iniciar rota (Pendente → Em Andamento)
   - Concluir entrega (Em Andamento → Concluída)

5. **📈 Atualização de Métricas**
   - Dashboard reflete mudanças em tempo real
   - Estatísticas de performance

### **Comunicação Entre Serviços:**

```
Frontend                Cadastro               Roteirização
   │                       │                        │
   ├─── POST /motoristas ──►                        │
   │◄─── Motorista criado ─┤                        │
   │                       │                        │
   ├─── POST /rota ────────────────────────────────►│
   │                       │◄─── GET motorista/1 ───┤
   │                       ├─── Dados motorista ───►│
   │◄─── Rota criada ───────────────────────────────┤
```

---

## 📁 **Estrutura do Projeto**

```
sistema-logistica-distribuido/
├── 📄 README.md                    # Este arquivo
├── 📁 services/
│   ├── 📁 cadastro-service/
│   │   ├── 📄 package.json
│   │   └── 📁 src/
│   │       └── 📄 app.js           # API de motoristas
│   └── 📁 roteirizacao-service/
│       ├── 📄 package.json
│       └── 📁 src/
│           └── 📄 app.js           # API de rotas
├── 📁 frontend/
│   ├── 📄 package.json
│   ├── 📁 src/
│   │   ├── 📄 App.tsx              # Componente principal
│   │   ├── 📄 index.css            # Estilos globais
│   │   ├── 📁 components/
│   │   │   ├── 📄 Dashboard.tsx    # Painel de métricas
│   │   │   ├── 📄 Motoristas.tsx   # Gestão de motoristas
│   │   │   └── 📄 Rotas.tsx        # Gestão de rotas
│   │   └── 📁 services/
│   │       └── 📄 api.ts           # Cliente HTTP
└── 📁 docs/
    └── 📄 arquitetura.md           # Documentação técnica
```

---

## 🗄️ **Estrutura do Banco de Dados**

### **Tabela: motoristas**
```sql
CREATE TABLE motoristas (
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
);
```

### **Tabela: rotas**
```sql
CREATE TABLE rotas (
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
);
```

### **Relacionamentos:**
- `rotas.id_motorista` → `motoristas.id` (Foreign Key)
- Um motorista pode ter várias rotas
- Uma rota pertence a um motorista

---

## 🎯 **Requisitos Atendidos**

### **Requisitos Mínimos:**
- ✅ **Dois serviços distribuídos** - Cadastro e Roteirização
- ✅ **Comunicação REST** - HTTP/JSON entre serviços
- ✅ **Serviço de cadastro** - CRUD completo de motoristas
- ✅ **Serviço de roteirização** - Gestão de rotas e entregas
- ✅ **Banco distribuído** - PostgreSQL compartilhado
- ✅ **Mensageria assíncrona** - Sistema de eventos EventBus
- ✅ **Interface funcional** - React completo e interativo

### **Funcionalidades Extras Implementadas:**
- ✅ **Interface responsiva** - Mobile e desktop
- ✅ **Validações robustas** - Frontend e backend
- ✅ **Sistema de eventos** - Logs de ações
- ✅ **Filtros avançados** - Busca por múltiplos critérios
- ✅ **Dashboard analítico** - KPIs e métricas
- ✅ **Tratamento de erros** - Feedback para usuário
- ✅ **Documentação completa** - Este README

---

## 🚀 **Tecnologias e Conceitos Aplicados**

### **Sistemas Distribuídos:**
- **Microserviços** independentes
- **Comunicação síncrona** via HTTP/REST
- **Comunicação assíncrona** via eventos
- **Persistência compartilhada** com PostgreSQL
- **Tolerância a falhas** com fallbacks

### **Desenvolvimento Web:**
- **SPA (Single Page Application)** com React
- **API RESTful** padronizada
- **Tipagem estática** com TypeScript
- **Responsividade** mobile-first
- **Componentização** reutilizável

### **Banco de Dados:**
- **Modelo relacional** normalizado
- **Transações ACID**
- **Índices** para performance
- **Constraints** para integridade
- **Timestamps** para auditoria

---

## 🐛 **Resolução de Problemas**

### **Erro: "Banco não conecta"**
```bash
# Verificar se PostgreSQL está rodando
# Windows: Serviços → postgresql-x64-17 → Iniciar
# Verificar credenciais no código
```

### **Erro: "Port already in use"**
```bash
# Verificar processos rodando nas portas
netstat -ano | findstr :3000
netstat -ano | findstr :4000
netstat -ano | findstr :3001

# Matar processo se necessário
taskkill /PID [número_do_processo] /F
```

### **Erro: "Cannot GET /motoristas"**
```bash
# Verificar se serviço está rodando
curl http://localhost:3000/health
curl http://localhost:4000/health

# Reiniciar serviços se necessário
```

### **Frontend não carrega dados:**
```bash
# Verificar console do navegador (F12)
# Verificar se APIs estão rodando
# Verificar CORS no backend
```

---

## 📈 **Melhorias Futuras**

### **Funcionalidades:**
- 🗺️ **Integração Google Maps** - Rotas reais
- 📱 **App Mobile** - React Native
- 🔐 **Autenticação JWT** - Login/logout
- 📊 **Relatórios Avançados** - PDF/Excel
- 🔔 **Notificações Push** - WebSockets
- 📍 **Rastreamento GPS** - Localização em tempo real

### **Arquitetura:**
- 🐳 **Containerização** - Docker/Kubernetes
- ☁️ **Deploy Cloud** - AWS/Azure/GCP
- 📈 **Monitoramento** - Prometheus/Grafana
- 🔄 **CI/CD** - GitHub Actions
- 🗄️ **Cache** - Redis
- 🔍 **Logs Centralizados** - ELK Stack

---

## 👥 **Contribuição**

Este é um projeto acadêmico, mas contribuições são bem-vindas:

1. **Fork** o projeto
2. **Crie** uma branch (`git checkout -b feature/nova-funcionalidade`)
3. **Commit** suas mudanças (`git commit -am 'Adiciona nova funcionalidade'`)
4. **Push** para a branch (`git push origin feature/nova-funcionalidade`)
5. **Abra** um Pull Request

---

## 👨‍💻 **Autor**

**Seu Nome**
- GitHub: [@HenriquePlebani](https://github.com/HenriquePlebani)
- Email: henrique.plebani@outlook.com
- LinkedIn: [Henrique Plebani](https://linkedin.com/in/henrique-plebani-4816b42ba/)

---

## 🙏 **Agradecimentos**

- Professor da disciplina de Sistemas Distribuídos
- Documentação do Node.js, React e PostgreSQL
- Comunidade open source

---

**⭐ Se este projeto te ajudou, considere dar uma estrela no GitHub!**

---

## 📞 **Suporte**

Para dúvidas ou problemas:

1. **Verifique** a seção [Resolução de Problemas](#-resolução-de-problemas)
2. **Consulte** a documentação das tecnologias utilizadas
3. **Abra** uma issue no GitHub
4. **Entre em contato** via email

**Sistema desenvolvido com 💙 para fins acadêmicos**