import React, { useState } from 'react';

// 👇 1. Adicionei a prop { setTelaAtual } aqui para podermos voltar de tela
const Relatorio = ({ setTelaAtual }) => {
  // Estados para os filtros (preparando para a integração com sua API Flask)
  const [mes, setMes] = useState('Maio');
  const [ano, setAno] = useState('2024');

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto font-sans" style={{ backgroundColor: '#fdf2f5', minHeight: '100vh' }}>
      
      {/* CABEÇALHO */}
      <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Relatórios <span style={{ color: '#ff5d8f' }}>POP!</span>
          </h1>
          <p className="text-gray-500">Inteligência de dados e performance operacional</p>
        </div>
        
        <div className="flex flex-wrap gap-3 bg-white p-2 rounded-2xl shadow-sm border border-pink-100 items-center">
          
          {/* 👇 2. Adicionei o botão de VOLTAR aqui! */}
          <button 
            onClick={() => setTelaAtual('dashboard')}
            className="text-gray-500 hover:text-pink-500 px-4 py-2 font-semibold transition-all border-r border-gray-200"
          >
            ← Voltar
          </button>

          <select 
            className="bg-transparent border-none outline-none px-4 py-2 font-medium text-gray-700 cursor-pointer"
            value={mes}
            onChange={(e) => setMes(e.target.value)}
          >
            <option>Maio</option>
            <option>Abril</option>
            <option>Março</option>
          </select>
          <select 
            className="bg-transparent border-none outline-none px-4 py-2 font-medium text-gray-700 cursor-pointer"
            value={ano}
            onChange={(e) => setAno(e.target.value)}
          >
            <option>2024</option>
            <option>2023</option>
          </select>
          <button 
            className="text-white px-6 py-2 rounded-xl font-semibold transition-all shadow-md hover:opacity-90"
            style={{ backgroundColor: '#ff5d8f' }}
          >
            Filtrar
          </button>
        </div>
      </header>

      {/* CARDS DE RESUMO (KPIs) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        
        <div className="bg-white p-6 rounded-3xl shadow-sm flex items-center gap-4 border border-pink-50">
          <div className="w-14 h-14 bg-pink-100 rounded-2xl flex items-center justify-center text-2xl" style={{ color: '#ff5d8f' }}>
            💰
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Faturamento Total</p>
            <h3 className="text-2xl font-bold text-gray-800">R$ 84.250,00</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm flex items-center gap-4 border border-pink-50">
          <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center text-2xl">
            📦
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Pedidos</p>
            <h3 className="text-2xl font-bold text-gray-800">1.284</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm flex items-center gap-4 border border-pink-50">
          <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center text-2xl">
            🛵
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Entregas Feitas</p>
            <h3 className="text-2xl font-bold text-gray-800">1.150</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm flex items-center gap-4 border border-pink-50">
          <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center text-2xl">
            📈
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Ticket Médio</p>
            <h3 className="text-2xl font-bold text-gray-800">R$ 65,61</h3>
          </div>
        </div>

      </div>

      {/* SEÇÃO PRINCIPAL (TABELAS E LISTAS) */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        
        {/* TABELA DE RESTAURANTES */}
        <section className="bg-white rounded-3xl shadow-sm overflow-hidden border border-pink-50">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">Performance de Restaurantes</h2>
            <span className="text-xs bg-pink-100 px-3 py-1 rounded-full font-bold" style={{ color: '#ff5d8f' }}>TOP 3</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-400 text-xs uppercase">
                <tr>
                  <th className="px-6 py-4">Restaurante</th>
                  <th className="px-6 py-4">Faturamento</th>
                  <th className="px-6 py-4">Pedidos</th>
                  <th className="px-6 py-4">Destaque</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                <tr className="hover:bg-pink-50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-gray-700">Doces da Vovó</td>
                  <td className="px-6 py-4 font-bold text-gray-800">R$ 22.450,00</td>
                  <td className="px-6 py-4 text-gray-600">342</td>
                  <td className="px-6 py-4 text-gray-500 italic">São Paulo</td>
                </tr>
                <tr className="hover:bg-pink-50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-gray-700">POP! Cakes</td>
                  <td className="px-6 py-4 font-bold text-gray-800">R$ 18.900,00</td>
                  <td className="px-6 py-4 text-gray-600">287</td>
                  <td className="px-6 py-4 text-gray-500 italic">Campinas</td>
                </tr>
                <tr className="hover:bg-pink-50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-gray-700">Gelateria Real</td>
                  <td className="px-6 py-4 font-bold text-gray-800">R$ 15.200,00</td>
                  <td className="px-6 py-4 text-gray-600">215</td>
                  <td className="px-6 py-4 text-gray-500 italic">São Paulo</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* LISTA DE PRODUTOS */}
        <section className="bg-white rounded-3xl shadow-sm p-6 border border-pink-50">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Produtos Mais Vendidos</h2>
          <div className="space-y-4">
            
            <div className="bg-white p-4 rounded-2xl border border-gray-100 flex justify-between items-center transition-all hover:border-pink-300">
              <div className="flex gap-4 items-center">
                <div className="w-12 h-12 bg-pink-50 rounded-xl flex items-center justify-center font-bold" style={{ color: '#ff5d8f' }}>1º</div>
                <div>
                  <h4 className="font-bold text-gray-800">Brigadeiro Gourmet</h4>
                  <p className="text-sm text-gray-500">Doces da Vovó</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold" style={{ color: '#ff5d8f' }}>R$ 4.520,00</p>
                <p className="text-xs text-gray-400">450 un.</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-gray-100 flex justify-between items-center transition-all hover:border-pink-300">
              <div className="flex gap-4 items-center">
                <div className="w-12 h-12 bg-pink-50 rounded-xl flex items-center justify-center font-bold" style={{ color: '#ff5d8f' }}>2º</div>
                <div>
                  <h4 className="font-bold text-gray-800">Bolo de Morango</h4>
                  <p className="text-sm text-gray-500">POP! Cakes</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold" style={{ color: '#ff5d8f' }}>R$ 3.840,00</p>
                <p className="text-xs text-gray-400">120 un.</p>
              </div>
            </div>

          </div>
        </section>

        {/* ENTREGADORES DESTAQUE */}
        <section className="bg-white rounded-3xl shadow-sm p-6 border border-pink-50 xl:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">Entregadores Destaque</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="bg-gray-50 p-5 rounded-3xl border border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-xl shadow-sm">
                  🏍️
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 text-lg">Marcos Oliveira</h4>
                  <p className="text-xs text-gray-500 uppercase tracking-widest">Campinas</p>
                </div>
              </div>
              <div className="text-right">
                 <p className="text-2xl font-bold text-gray-700">156</p>
                 <p className="text-[10px] text-gray-400 font-bold uppercase">Entregas</p>
              </div>
            </div>

            <div className="bg-gray-50 p-5 rounded-3xl border border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-xl shadow-sm">
                  🚲
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 text-lg">Júlia Santos</h4>
                  <p className="text-xs text-gray-500 uppercase tracking-widest">São Paulo</p>
                </div>
              </div>
              <div className="text-right">
                 <p className="text-2xl font-bold text-gray-700">92</p>
                 <p className="text-[10px] text-gray-400 font-bold uppercase">Entregas</p>
              </div>
            </div>

          </div>
        </section>

      </div>
    </div>
  );
};

export default Relatorio;