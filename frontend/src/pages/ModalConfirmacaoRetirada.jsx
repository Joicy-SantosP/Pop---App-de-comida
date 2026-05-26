import React from 'react';

const ModalConfirmacaoRetirada = ({ isOpen, onClose, pedidoConfirmado, onVerPainel }) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 99999,
      display: 'flex', justifyContent: 'center', alignItems: 'center'
    }}>
      <div style={{
        backgroundColor: '#fff', borderRadius: '20px', padding: '40px',
        width: '500px', maxWidth: '90%', textAlign: 'center',
        boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
      }}>
        <span 
          onClick={onClose}
          style={{ position: 'absolute', top: '15px', right: '20px', color: '#ff3b3b', fontSize: '1.5rem', cursor: 'pointer', fontWeight: 'bold' }}
        >
          ✕
        </span>

        <div style={{ fontSize: '4rem', marginBottom: '20px' }}>✅</div>
        <h2 style={{ color: '#ff3b3b', marginBottom: '10px' }}>Pedido Confirmado!</h2>
        <p style={{ color: '#666', marginBottom: '30px' }}>
          Seu pedido está sendo preparado. Fique de olho no painel da loja!
        </p>
        
        {/* Card estilo painel de fast-food */}
        <div style={{
          background: 'linear-gradient(135deg, #1a1a1a, #000)',
          color: '#ff3b3b',
          padding: '40px 20px',
          borderRadius: '20px',
          marginBottom: '30px',
          fontFamily: 'monospace',
          border: '2px solid #ff3b3b'
        }}>
          <p style={{ fontSize: '1.1rem', margin: '0 0 15px 0', color: '#fff', letterSpacing: '2px' }}>
            SUA SENHA
          </p>
          <h1 style={{ 
            fontSize: '6rem', 
            margin: '0',
            fontWeight: 'bold',
            letterSpacing: '15px',
            textShadow: '0 0 30px rgba(255,59,59,0.7)',
            animation: 'pulse 1.5s infinite'
          }}>
            {pedidoConfirmado?.numero_senha}
          </h1>
          <p style={{ color: '#fff', marginTop: '20px', fontSize: '0.9rem' }}>
            Pedido #{pedidoConfirmado?.pedido_id}
          </p>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', marginBottom: '30px' }}>
          <div className="etapa-retirada ativa">
            <span style={{ fontSize: '1.5rem' }}>📝</span>
            <p style={{ fontSize: '0.8rem', margin: '5px 0 0 0' }}>Confirmado</p>
          </div>
          <div className="etapa-retirada">
            <span style={{ fontSize: '1.5rem' }}>👨‍🍳</span>
            <p style={{ fontSize: '0.8rem', margin: '5px 0 0 0' }}>Preparando</p>
          </div>
          <div className="etapa-retirada">
            <span style={{ fontSize: '1.5rem' }}>📦</span>
            <p style={{ fontSize: '0.8rem', margin: '5px 0 0 0' }}>Pronto</p>
          </div>
        </div>
        
        <button 
          onClick={onVerPainel}
          style={{
            width: '100%',
            padding: '15px',
            backgroundColor: '#ff3b3b',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            fontSize: '1.1rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'all 0.3s'
          }}
          onMouseEnter={(e) => e.target.style.transform = 'scale(1.02)'}
          onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
        >
          📺 Ver Painel de Senhas
        </button>

        <button 
          onClick={onClose}
          style={{
            width: '100%',
            padding: '12px',
            marginTop: '15px',
            backgroundColor: '#f5f5f5',
            color: '#333',
            border: 'none',
            borderRadius: '10px',
            fontSize: '1rem',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Fechar
        </button>
      </div>
      
      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.8; }
          100% { transform: scale(1); opacity: 1; }
        }
        .etapa-retirada {
          text-align: center;
          opacity: 0.4;
          transition: all 0.3s;
        }
        .etapa-retirada.ativa {
          opacity: 1;
        }
      `}</style>
    </div>
  );
};

export default ModalConfirmacaoRetirada;