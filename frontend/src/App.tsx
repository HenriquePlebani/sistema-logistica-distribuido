import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import Motoristas from './components/Motoristas';
import Rotas from './components/Rotas';


function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const tabs = [
    { id: 'dashboard', name: 'Dashboard' },
    { id: 'motoristas', name: 'Motoristas' },
    { id: 'rotas', name: 'Rotas' }
  ];

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Header */}
      <header className="header">
        <div>
          <h1>🚚 Sistema de Logística Distribuído</h1>
        </div>
        <div className="nav-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
            >
              {tab.name}
            </button>
          ))}
        </div>
      </header>

      {/* Main Content */}
      <main className="container">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'motoristas' && <Motoristas />}
        {activeTab === 'rotas' && <Rotas />} {/* ESTA LINHA DEVE ESTAR AQUI */}
      </main>
    </div>
  );
}

export default App;