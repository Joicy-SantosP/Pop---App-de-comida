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
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex',
      justifyContent: 'center', alignItems: 'center', zIndex: 99999
    }}>
      <div style={{ 
        backgroundColor: '#ffe6e8', 
        padding: '40px', 
        borderRadius: '20px',
        textAlign: 'center', 
        width: '600px', 
        maxWidth: '90%',
        maxHeight: '85vh',
        overflow: 'auto',
        boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
      }}>
        
        {/* Título */}
        <h3 style={{ color: '#000', marginBottom: '10px', fontSize: '1.4rem' }}>
          🍬 Painel de Retirada - Pop Doces
        </h3>
        <p style={{ color: '#999', margin: '0 0 25px 0', fontSize: '0.9rem' }}>
          Acompanhe sua senha e retire seu pedido no balcão
        </p>

        {/* 🔑 Card da Senha do Cliente */}
        <div style={{
          backgroundColor: '#fff',
          border: `3px solid ${meuPedidoPronto ? '#27ae60' : '#e96671'}`,
          borderRadius: '15px',
          padding: '20px',
          marginBottom: '25px',
          transition: 'all 0.3s ease'
        }}>
          <p style={{ color: '#666', margin: '0 0 5px 0', fontSize: '0.9rem', fontWeight: 'bold' }}>
            🎫 SUA SENHA DE RETIRADA
          </p>
          <h1 style={{
            color: meuPedidoPronto ? '#27ae60' : '#e96671',
            fontSize: '4.5rem',
            margin: '5px 0',
            fontFamily: 'monospace',
            letterSpacing: '12px',
            fontWeight: 'bold'
          }}>
            {numeroSenha}
          </h1>
          <p style={{ color: '#999', margin: '5px 0 0 0', fontSize: '0.85rem' }}>
            Pedido #{pedidoId}
          </p>
          {meuPedidoPronto ? (
            <p style={{ color: '#27ae60', margin: '10px 0 0 0', fontSize: '0.9rem', fontWeight: 'bold', animation: 'pulse 1.5s infinite' }}>
              ✅ Seu pedido está pronto! Vá até o balcão!
            </p>
          ) : (
            <p style={{ color: '#f39c12', margin: '10px 0 0 0', fontSize: '0.85rem' }}>
              ⏳ Aguardando pedido ficar pronto...
            </p>
          )}
        </div>

        {/* 📋 Grid de Senhas Prontas */}
        <div style={{
          backgroundColor: '#fff',
          borderRadius: '15px',
          padding: '20px',
          border: '2px solid #f3afb5'
        }}>
          <h4 style={{ color: '#e96671', margin: '0 0 15px 0', fontSize: '1rem' }}>
            📋 Senhas Prontas para Retirada
          </h4>
          
          {pedidosProntos.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 0' }}>
              <p style={{ color: '#999', fontSize: '1rem', margin: 0 }}>
                Nenhum pedido pronto no momento
              </p>
              <p style={{ color: '#bbb', fontSize: '0.8rem', margin: '5px 0 0 0' }}>
                As senhas aparecerão aqui automaticamente
              </p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
              gap: '15px'
            }}>
              {pedidosProntos.map((pedido, index) => (
                <div key={index} style={{
                  backgroundColor: pedido.numero_senha === numeroSenha ? '#ffe6e8' : '#fafafa',
                  border: pedido.numero_senha === numeroSenha ? '3px solid #e96671' : '2px solid #e0e0e0',
                  borderRadius: '12px',
                  padding: '15px 10px',
                  textAlign: 'center',
                  transform: pedido.numero_senha === numeroSenha ? 'scale(1.05)' : 'scale(1)',
                  transition: 'all 0.3s ease',
                  boxShadow: pedido.numero_senha === numeroSenha ? '0 4px 15px rgba(233, 102, 113, 0.3)' : 'none'
                }}>
                  <p style={{ 
                    fontSize: '2.5rem', 
                    fontWeight: 'bold', 
                    margin: '0',
                    color: pedido.numero_senha === numeroSenha ? '#e96671' : '#333',
                    fontFamily: 'monospace',
                    letterSpacing: '3px'
                  }}>
                    {pedido.numero_senha}
                  </p>
                  <p style={{ 
                    fontSize: '0.8rem',
                    margin: '8px 0 0 0',
                    color: '#666'
                  }}>
                    {pedido.nome_cliente}
                  </p>
                  {pedido.numero_senha === numeroSenha && (
                    <p style={{
                      margin: '5px 0 0 0',
                      fontSize: '0.7rem',
                      color: '#e96671',
                      fontWeight: 'bold'
                    }}>
                      ⭐ SEU PEDIDO
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Rodapé */}
        <p style={{ color: '#999', margin: '20px 0 15px 0', fontSize: '0.75rem' }}>
          ⏱️ Atualizando automaticamente a cada 5 segundos
        </p>

        {/* Botão Fechar */}
        <button 
          onClick={onClose}
          style={{ 
            padding: '10px 30px', 
            backgroundColor: '#e96671', 
            color: '#fff',
            border: 'none', 
            borderRadius: '20px', 
            cursor: 'pointer',
            fontWeight: 'bold', 
            fontSize: '0.9rem',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#d4555f'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#e96671'}
        >
          Fechar Painel
        </button>
      </div>
    </div>
  );
};

export default ModalPainelSenhas;