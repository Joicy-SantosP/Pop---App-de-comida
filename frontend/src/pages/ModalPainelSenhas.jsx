import React, { useState, useEffect } from 'react';

const ModalPainelSenhas = ({ isOpen, onClose, pedidoId, numeroSenha }) => {
  const [pedidosProntos, setPedidosProntos] = useState([]);
  const [meuPedidoPronto, setMeuPedidoPronto] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const buscarPedidosProntos = async () => {
      try {
        const response = await fetch('http://localhost:5000/painel/pedidos-prontos');
        const data = await response.json();
        setPedidosProntos(data);
        
        const encontrado = data.find(p => p.numero_senha === numeroSenha);
        setMeuPedidoPronto(!!encontrado);
      } catch (error) {
        console.error('Erro ao buscar painel:', error);
      }
    };

    buscarPedidosProntos();
    const interval = setInterval(buscarPedidosProntos, 5000);

    return () => clearInterval(interval);
  }, [isOpen, numeroSenha]);

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      backgroundColor: 'rgba(0, 0, 0, 0.6)', zIndex: 99999,
      display: 'flex', justifyContent: 'center', alignItems: 'center'
    }}>
      <div style={{
        backgroundColor: '#fff',
        borderRadius: '15px',
        width: '90%',
        maxWidth: '600px',
        maxHeight: '90vh',
        overflow: 'hidden',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        border: '2px solid #ff69b4',
        boxShadow: '0 10px 40px rgba(255, 105, 180, 0.2)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Cabeçalho do Painel - REDUZIDO */}
        <div style={{
          background: 'linear-gradient(135deg, #ff69b4, #f383bf)',
          padding: '12px 20px',
          textAlign: 'center'
        }}>
          <h2 style={{ color: '#fff', margin: 0, fontSize: '1.3rem', fontWeight: 'bold' }}>
            POP DOCES - PAINEL DE SENHAS
          </h2>
          <p style={{ color: '#fff', margin: '3px 0 0 0', opacity: 0.9, fontSize: '0.8rem' }}>
            Senhas prontas para retirada
          </p>
        </div>

        {/* Área Scrollável - APENAS SE NECESSÁRIO */}
        <div style={{ overflow: 'auto', flex: 1, padding: '15px' }}>
          {/* Card da Senha do Cliente - REDUZIDO */}
          <div style={{
            background: 'linear-gradient(135deg, #fff5f9, #ffe4f0)',
            border: '1.5px solid #ff69b4',
            borderRadius: '12px',
            padding: '15px',
            marginBottom: '15px',
            textAlign: 'center'
          }}>
            <p style={{ color: '#666', margin: '0 0 5px 0', fontSize: '0.75rem', fontWeight: 'bold' }}>
              SUA SENHA DE RETIRADA
            </p>
            <h1 style={{
              color: '#ff1493',
              fontSize: '3.5rem',
              margin: '5px 0',
              fontFamily: 'monospace',
              fontWeight: 'bold',
              letterSpacing: '8px',
              textShadow: '1px 1px 3px rgba(255,20,147,0.2)',
              animation: 'pulse 1.5s infinite'
            }}>
              {numeroSenha}
            </h1>
            <p style={{ color: '#888', margin: '5px 0 0 0', fontSize: '0.75rem' }}>
              Apresente esta senha no balcão para retirar seu pedido
            </p>
            {!meuPedidoPronto && (
              <p style={{ color: '#ff8c00', margin: '8px 0 0 0', fontSize: '0.75rem', fontWeight: 'bold' }}>
                ⏳ Aguardando pedido ficar pronto...
              </p>
            )}
          </div>

          {/* Alerta se o pedido do cliente está pronto - REDUZIDO */}
          {meuPedidoPronto && (
            <div style={{
              background: 'linear-gradient(135deg, #4CAF50, #45a049)',
              color: '#fff',
              padding: '12px',
              marginBottom: '15px',
              borderRadius: '8px',
              textAlign: 'center',
              animation: 'pulse 1s infinite'
            }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem' }}>
                🎉 SEU PEDIDO ESTÁ PRONTO! 🎉
              </h3>
              <p style={{ margin: '3px 0 0 0', fontSize: '0.85rem' }}>
                Dirija-se ao balcão com sua senha
              </p>
            </div>
          )}

          {/* Grid de Senhas - REDUZIDO */}
          {pedidosProntos.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <p style={{ color: '#999', fontSize: '1rem', margin: 0 }}>
                Aguardando pedidos...
              </p>
              <p style={{ color: '#aaa', fontSize: '0.75rem', margin: '8px 0 0 0' }}>
                As senhas aparecerão aqui quando os pedidos estiverem prontos
              </p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
              gap: '10px',
              paddingBottom: '5px'
            }}>
              {pedidosProntos.map((pedido, index) => (
                <div key={index} style={{
                  background: pedido.numero_senha === numeroSenha 
                    ? 'linear-gradient(135deg, #ff69b4, #ff69b4)' 
                    : 'linear-gradient(135deg, #f8f9fa, #e9ecef)',
                  color: pedido.numero_senha === numeroSenha ? '#fff' : '#333',
                  padding: '15px 10px',
                  borderRadius: '10px',
                  textAlign: 'center',
                  border: pedido.numero_senha === numeroSenha 
                    ? '2px solid #ff1493' 
                    : '1.5px solid #dee2e6',
                  transform: pedido.numero_senha === numeroSenha ? 'scale(1.03)' : 'scale(1)',
                  transition: 'all 0.3s ease',
                  boxShadow: pedido.numero_senha === numeroSenha 
                    ? '0 3px 10px rgba(255,20,147,0.3)' 
                    : '0 1px 3px rgba(0,0,0,0.05)'
                }}>
                  <p style={{ 
                    fontSize: '2.2rem', 
                    fontWeight: 'bold', 
                    margin: '0',
                    letterSpacing: '3px',
                    fontFamily: 'monospace'
                  }}>
                    {pedido.numero_senha}
                  </p>
                  <p style={{ 
                    fontSize: '0.75rem',
                    margin: '5px 0 0 0',
                    opacity: 0.9,
                    fontWeight: pedido.numero_senha === numeroSenha ? 'bold' : 'normal'
                  }}>
                    {pedido.nome_cliente}
                  </p>
                  {pedido.numero_senha === numeroSenha && (
                    <p style={{
                      margin: '5px 0 0 0',
                      fontSize: '0.65rem',
                      fontWeight: 'bold',
                      background: 'rgba(255,255,255,0.2)',
                      padding: '2px 6px',
                      borderRadius: '8px',
                      display: 'inline-block'
                    }}>
                      SEU PEDIDO ✓
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Rodapé - REDUZIDO */}
        <div style={{
          borderTop: '1px solid #eee',
          padding: '12px 20px',
          textAlign: 'center',
          background: '#fafafa'
        }}>
          <p style={{ color: '#999', margin: '0 0 10px 0', fontSize: '0.7rem' }}>
             Atualizando automaticamente a cada 5 segundos
          </p>
          <button 
            onClick={onClose}
            style={{
              padding: '8px 25px',
              backgroundColor: '#ff3b3b',
              color: '#fff',
              border: 'none',
              borderRadius: '20px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '0.85rem',
              transition: 'all 0.3s ease',
              boxShadow: '0 2px 8px rgba(255,105,180,0.3)'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#cc1010';
              e.target.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#ff3b3b';
              e.target.style.transform = 'scale(1)';
            }}
          >
            Fechar Painel
          </button>
        </div>
      </div>
      
      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.03); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default ModalPainelSenhas;