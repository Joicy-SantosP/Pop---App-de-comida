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
        
        // Verifica se o pedido do cliente está na lista
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
      backgroundColor: 'rgba(0, 0, 0, 0.8)', zIndex: 99999,
      display: 'flex', justifyContent: 'center', alignItems: 'center'
    }}>
      <div style={{
        backgroundColor: '#000',
        borderRadius: '20px',
        width: '90%',
        maxWidth: '700px',
        maxHeight: '80vh',
        overflow: 'auto',
        fontFamily: 'monospace',
        border: '3px solid #ff3b3b',
        boxShadow: '0 0 50px rgba(255, 59, 59, 0.3)'
      }}>
        {/* Cabeçalho do Painel */}
        <div style={{
          background: 'linear-gradient(135deg, #ff3b3b, #cc0000)',
          padding: '20px',
          textAlign: 'center',
          borderRadius: '20px 20px 0 0'
        }}>
          <h2 style={{ color: '#fff', margin: 0, fontSize: '1.8rem', letterSpacing: '3px' }}>
            🍬 POP DOCES - PAINEL DE SENHAS
          </h2>
          <p style={{ color: '#fff', margin: '5px 0 0 0', opacity: 0.8 }}>
            Senhas prontas para retirada
          </p>
        </div>

        {/* Alerta se o pedido do cliente está pronto */}
        {meuPedidoPronto && (
          <div style={{
            background: '#2ecc71',
            color: '#fff',
            padding: '20px',
            textAlign: 'center',
            animation: 'pulse 1s infinite'
          }}>
            <h3 style={{ margin: 0, fontSize: '1.5rem' }}>
              🎉 SEU PEDIDO ESTÁ PRONTO! 🎉
            </h3>
            <p style={{ margin: '5px 0 0 0', fontSize: '1.2rem' }}>
              Dirija-se ao balcão com sua senha
            </p>
          </div>
        )}

        {/* Grid de Senhas */}
        <div style={{ padding: '30px' }}>
          {pedidosProntos.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <p style={{ color: '#666', fontSize: '1.5rem', margin: 0 }}>
                Aguardando pedidos...
              </p>
              <p style={{ color: '#444', fontSize: '0.9rem', margin: '10px 0 0 0' }}>
                As senhas aparecerão aqui quando os pedidos estiverem prontos
              </p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
              gap: '20px'
            }}>
              {pedidosProntos.map((pedido, index) => (
                <div key={index} style={{
                  background: pedido.numero_senha === numeroSenha 
                    ? 'linear-gradient(135deg, #ff3b3b, #cc0000)' 
                    : '#1a1a1a',
                  color: '#fff',
                  padding: '25px 15px',
                  borderRadius: '15px',
                  textAlign: 'center',
                  border: pedido.numero_senha === numeroSenha 
                    ? '3px solid #fff' 
                    : '2px solid #333',
                  transform: pedido.numero_senha === numeroSenha ? 'scale(1.05)' : 'scale(1)',
                  transition: 'all 0.3s'
                }}>
                  <p style={{ 
                    fontSize: '3.5rem', 
                    fontWeight: 'bold', 
                    margin: '0',
                    letterSpacing: '5px',
                    fontFamily: 'monospace'
                  }}>
                    {pedido.numero_senha}
                  </p>
                  <p style={{ 
                    fontSize: '0.9rem',
                    margin: '10px 0 0 0',
                    opacity: 0.8,
                    color: '#fff'
                  }}>
                    {pedido.nome_cliente}
                  </p>
                  {pedido.numero_senha === numeroSenha && (
                    <p style={{
                      margin: '5px 0 0 0',
                      fontSize: '0.7rem',
                      color: '#fff',
                      fontWeight: 'bold'
                    }}>
                      SEU PEDIDO ✓
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Rodapé */}
        <div style={{
          borderTop: '1px solid #333',
          padding: '15px',
          textAlign: 'center'
        }}>
          <p style={{ color: '#666', margin: '0 0 10px 0', fontSize: '0.8rem' }}>
            Atualizando automaticamente a cada 5 segundos
          </p>
          <button 
            onClick={onClose}
            style={{
              padding: '10px 30px',
              backgroundColor: '#333',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '0.9rem'
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