import React, { useState, useEffect } from 'react';

const Relatorio = ({ onClose, setTelaAtual }) => {
  const [mes, setMes] = useState(new Date().getMonth() + 1); // Mês atual (1-12)
  const [ano, setAno] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [dados, setDados] = useState({
    resumo: {
      faturamento_total: 0,
      total_pedidos: 0,
      total_entregas: 0,
      ticket_medio: 0,
      restaurantes_ativos: 0,
      cidade_destaque: ''
    },
    restaurantes: [],
    produtos: [],
    entregadores: []
  });

  // Lista de meses para o select
  const meses = [
    { valor: 1, nome: 'Janeiro' },
    { valor: 2, nome: 'Fevereiro' },
    { valor: 3, nome: 'Março' },
    { valor: 4, nome: 'Abril' },
    { valor: 5, nome: 'Maio' },
    { valor: 6, nome: 'Junho' },
    { valor: 7, nome: 'Julho' },
    { valor: 8, nome: 'Agosto' },
    { valor: 9, nome: 'Setembro' },
    { valor: 10, nome: 'Outubro' },
    { valor: 11, nome: 'Novembro' },
    { valor: 12, nome: 'Dezembro' }
  ];

  // Anos disponíveis
  const anos = [];
  for (let i = 2024; i <= new Date().getFullYear(); i++) {
    anos.push(i);
  }

  const carregarDados = async () => {
    setLoading(true);
    try {
      // Carrega resumo (KPIs)
      const resResumo = await fetch(
        `http://localhost:5000/api/relatorio/dashboard/resumo?mes=${mes}&ano=${ano}`
      );
      const dadosResumo = await resResumo.json();

      // Carrega dashboard completo
      const resCompleto = await fetch(
        `http://localhost:5000/api/relatorio/dashboard?mes=${mes}&ano=${ano}`
      );
      const dadosCompleto = await resCompleto.json();

      if (dadosResumo.success && dadosCompleto.success) {
        setDados({
          resumo: dadosResumo.data,
          restaurantes: dadosCompleto.data.restaurantes.slice(0, 3), // Top 3
          produtos: dadosCompleto.data.produtos_mais_vendidos.slice(0, 2), // Top 2
          entregadores: dadosCompleto.data.entregadores.slice(0, 2) // Top 2
        });
      }
    } catch (error) {
      console.error('Erro ao carregar relatórios:', error);
    } finally {
      setLoading(false);
    }
  };

  // Carrega dados ao montar o componente
  useEffect(() => {
    carregarDados();
  }, []);

  const handleFiltrar = () => {
    carregarDados();
  };

  const formatarDinheiro = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor || 0);
  };

  const nomeMes = meses.find(m => m.valor === mes)?.nome || '';

  return (
    <div style={{
      backgroundColor: '#fdf2f5',
      fontFamily: 'sans-serif',
      padding: '24px'
    }}>
      
      {/* CABEÇALHO */}
      <header style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '32px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            color: '#1f2937',
            margin: 0
          }}>
            Relatórios <span style={{ color: '#ff5d8f' }}>POP!</span>
          </h1>
          <p style={{ color: '#6b7280', margin: '4px 0 0 0', fontSize: '0.95rem' }}>
            Inteligência de dados e performance operacional
          </p>
        </div>
        
        <div style={{
          display: 'flex',
          gap: '12px',
          backgroundColor: '#fff',
          padding: '8px',
          borderRadius: '16px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #fbcfe8',
          alignItems: 'center',
          flexWrap: 'wrap'
        }}>
          <select 
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              outline: 'none',
              padding: '8px 16px',
              fontWeight: '500',
              color: '#374151',
              cursor: 'pointer',
              fontSize: '0.95rem'
            }}
            value={mes}
            onChange={(e) => setMes(Number(e.target.value))}
          >
            {meses.map(m => (
              <option key={m.valor} value={m.valor}>{m.nome}</option>
            ))}
          </select>
          
          <select 
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              outline: 'none',
              padding: '8px 16px',
              fontWeight: '500',
              color: '#374151',
              cursor: 'pointer',
              fontSize: '0.95rem'
            }}
            value={ano}
            onChange={(e) => setAno(Number(e.target.value))}
          >
            {anos.map(a => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
          
          <button 
            onClick={handleFiltrar}
            disabled={loading}
            style={{
              backgroundColor: loading ? '#f9a8d4' : '#ff5d8f',
              color: '#fff',
              padding: '8px 24px',
              borderRadius: '12px',
              fontWeight: '600',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              fontSize: '0.95rem',
              boxShadow: '0 2px 4px rgba(255,93,143,0.3)'
            }}
          >
            {loading ? '⏳ Carregando...' : '🔍 Filtrar'}
          </button>
        </div>
      </header>

      {loading && (
        <div style={{ 
          textAlign: 'center', 
          padding: '60px 20px',
          color: '#ff5d8f',
          fontSize: '1.2rem'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🐜</div>
          Carregando relatórios...
        </div>
      )}

      {!loading && (
        <>
          {/* CARDS DE RESUMO (KPIs) */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '24px',
            marginBottom: '32px'
          }}>
            
            <div style={{
              backgroundColor: '#fff',
              padding: '24px',
              borderRadius: '24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              border: '1px solid #fce7f3'
            }}>
              <div style={{
                width: '56px',
                height: '56px',
                backgroundColor: '#fce7f3',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                color: '#ff5d8f'
              }}>
                💰
              </div>
              <div>
                <p style={{ fontSize: '0.875rem', color: '#6b7280', fontWeight: '500', margin: 0 }}>
                  Faturamento Total
                </p>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937', margin: '4px 0 0 0' }}>
                  {formatarDinheiro(dados.resumo.faturamento_total)}
                </h3>
              </div>
            </div>

            <div style={{
              backgroundColor: '#fff',
              padding: '24px',
              borderRadius: '24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              border: '1px solid #fce7f3'
            }}>
              <div style={{
                width: '56px',
                height: '56px',
                backgroundColor: '#ffedd5',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem'
              }}>
                📦
              </div>
              <div>
                <p style={{ fontSize: '0.875rem', color: '#6b7280', fontWeight: '500', margin: 0 }}>
                  Total Pedidos
                </p>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937', margin: '4px 0 0 0' }}>
                  {dados.resumo.total_pedidos}
                </h3>
              </div>
            </div>

            <div style={{
              backgroundColor: '#fff',
              padding: '24px',
              borderRadius: '24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              border: '1px solid #fce7f3'
            }}>
              <div style={{
                width: '56px',
                height: '56px',
                backgroundColor: '#dbeafe',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem'
              }}>
                🛵
              </div>
              <div>
                <p style={{ fontSize: '0.875rem', color: '#6b7280', fontWeight: '500', margin: 0 }}>
                  Entregas Feitas
                </p>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937', margin: '4px 0 0 0' }}>
                  {dados.resumo.total_entregas}
                </h3>
              </div>
            </div>

            <div style={{
              backgroundColor: '#fff',
              padding: '24px',
              borderRadius: '24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              border: '1px solid #fce7f3'
            }}>
              <div style={{
                width: '56px',
                height: '56px',
                backgroundColor: '#d1fae5',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem'
              }}>
                📈
              </div>
              <div>
                <p style={{ fontSize: '0.875rem', color: '#6b7280', fontWeight: '500', margin: 0 }}>
                  Ticket Médio
                </p>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937', margin: '4px 0 0 0' }}>
                  {formatarDinheiro(dados.resumo.ticket_medio)}
                </h3>
              </div>
            </div>

          </div>

          {/* Período e Cidade Destaque */}
          <div style={{
            backgroundColor: '#fff',
            padding: '16px 24px',
            borderRadius: '16px',
            marginBottom: '32px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            border: '1px solid #fce7f3',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <p style={{ margin: 0, color: '#6b7280', fontWeight: '500' }}>
              📅 Período: <strong>{nomeMes}/{ano}</strong>
            </p>
            <p style={{ margin: 0, color: '#6b7280', fontWeight: '500' }}>
              🏙️ Cidade Destaque: <strong>{dados.resumo.cidade_destaque}</strong>
            </p>
          </div>

          {/* SEÇÃO PRINCIPAL (TABELAS E LISTAS) */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))',
            gap: '32px'
          }}>
            
            {/* TABELA DE RESTAURANTES */}
            <section style={{
              backgroundColor: '#fff',
              borderRadius: '24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              overflow: 'hidden',
              border: '1px solid #fce7f3'
            }}>
              <div style={{
                padding: '24px',
                borderBottom: '1px solid #f3f4f6',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
                  Performance de Restaurantes
                </h2>
                <span style={{
                  fontSize: '0.75rem',
                  backgroundColor: '#fce7f3',
                  padding: '4px 12px',
                  borderRadius: '9999px',
                  fontWeight: 'bold',
                  color: '#ff5d8f'
                }}>
                  TOP 3
                </span>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f9fafb', color: '#9ca3af', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                      <th style={{ padding: '16px 24px', textAlign: 'left' }}>Restaurante</th>
                      <th style={{ padding: '16px 24px', textAlign: 'left' }}>Faturamento</th>
                      <th style={{ padding: '16px 24px', textAlign: 'left' }}>Pedidos</th>
                      <th style={{ padding: '16px 24px', textAlign: 'left' }}>Destaque</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dados.restaurantes.length > 0 ? (
                      dados.restaurantes.map((rest, index) => (
                        <tr key={index} style={{ borderBottom: '1px solid #f9fafb', transition: 'background-color 0.2s' }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fdf2f8'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          <td style={{ padding: '16px 24px', fontWeight: '600', color: '#374151' }}>
                            {rest.nome}
                          </td>
                          <td style={{ padding: '16px 24px', fontWeight: 'bold', color: '#1f2937' }}>
                            {formatarDinheiro(rest.faturamento_mes)}
                          </td>
                          <td style={{ padding: '16px 24px', color: '#4b5563' }}>
                            {rest.qtd_pedidos_mes}
                          </td>
                          <td style={{ padding: '16px 24px', color: '#6b7280', fontStyle: 'italic' }}>
                            {rest.maior_cidade}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" style={{ padding: '32px', textAlign: 'center', color: '#9ca3af' }}>
                          Nenhum dado encontrado para o período
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            {/* LISTA DE PRODUTOS */}
            <section style={{
              backgroundColor: '#fff',
              borderRadius: '24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              padding: '24px',
              border: '1px solid #fce7f3'
            }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '24px' }}>
                Produtos Mais Vendidos
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                {dados.produtos.length > 0 ? (
                  dados.produtos.map((prod, index) => (
                    <div key={index} style={{
                      backgroundColor: '#fff',
                      padding: '16px',
                      borderRadius: '16px',
                      border: '1px solid #f3f4f6',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      transition: 'all 0.2s'
                    }}
                      onMouseEnter={(e) => e.currentTarget.style.borderColor = '#f9a8d4'}
                      onMouseLeave={(e) => e.currentTarget.style.borderColor = '#f3f4f6'}
                    >
                      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                        <div style={{
                          width: '48px',
                          height: '48px',
                          backgroundColor: '#fce7f3',
                          borderRadius: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 'bold',
                          color: '#ff5d8f',
                          fontSize: '1.25rem'
                        }}>
                          {index + 1}º
                        </div>
                        <div>
                          <h4 style={{ fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
                            {prod.produto_mais_vendido}
                          </h4>
                          <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '4px 0 0 0' }}>
                            {prod.restaurante}
                          </p>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontWeight: 'bold', color: '#ff5d8f', margin: 0 }}>
                          {formatarDinheiro(prod.faturamento_produto)}
                        </p>
                        <p style={{ fontSize: '0.75rem', color: '#9ca3af', margin: '2px 0 0 0' }}>
                          {prod.quantidade_pedidos} un.
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p style={{ textAlign: 'center', color: '#9ca3af', padding: '32px 0' }}>
                    Nenhum produto encontrado
                  </p>
                )}

              </div>
            </section>

            {/* ENTREGADORES DESTAQUE */}
            <section style={{
              backgroundColor: '#fff',
              borderRadius: '24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              padding: '24px',
              border: '1px solid #fce7f3',
              gridColumn: '1 / -1'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
                  Entregadores Destaque
                </h2>
              </div>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '24px'
              }}>
                
                {dados.entregadores.length > 0 ? (
                  dados.entregadores.map((ent, index) => (
                    <div key={index} style={{
                      backgroundColor: '#f9fafb',
                      padding: '20px',
                      borderRadius: '24px',
                      border: '1px solid #f3f4f6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{
                          width: '48px',
                          height: '48px',
                          backgroundColor: '#fff',
                          borderRadius: '16px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.5rem',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                        }}>
                          {ent.veiculo === 'moto' ? '🏍️' : ent.veiculo === 'bicicleta' ? '🚲' : '🛵'}
                        </div>
                        <div>
                          <h4 style={{ fontWeight: 'bold', color: '#1f2937', fontSize: '1.125rem', margin: 0 }}>
                            {ent.nome}
                          </h4>
                          <p style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '2px 0 0 0' }}>
                            {ent.maior_cidade}
                          </p>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#374151', margin: 0 }}>
                          {ent.qtd_entregas_mes}
                        </p>
                        <p style={{ fontSize: '0.625rem', color: '#9ca3af', fontWeight: 'bold', textTransform: 'uppercase', margin: 0 }}>
                          Entregas
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p style={{ textAlign: 'center', color: '#9ca3af', padding: '32px 0', gridColumn: '1 / -1' }}>
                    Nenhum entregador encontrado
                  </p>
                )}

              </div>
            </section>

          </div>
        </>
      )}
    </div>
  );
};

export default Relatorio;