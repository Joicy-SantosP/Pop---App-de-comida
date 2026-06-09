import React, { useState } from 'react';
import formigaAjuda from '../assets/formigaAjuda.png'; // Ajuste o caminho conforme necessário

const ModalAjuda = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const topicosAjuda = [
    {
      titulo: 'Como fazer um pedido?',
      descricao: 'Navegue pelo nosso catálogo, escolha seus produtos favoritos e clique em "Adicionar ao carrinho". Quando terminar, vá até o carrinho e finalize sua compra!'
    },
    {
      titulo: 'Como acompanhar meu pedido?',
      descricao: 'Acesse a seção "Meus Pedidos" no menu principal. Lá você encontra o status atualizado de todas as suas compras.'
    },
    {
      titulo: 'Como alterar meus dados?',
      descricao: 'Vá até "Meus Dados" e clique em "Editar Perfil". Não se esqueça de salvar as alterações depois!'
    },
    {
      titulo: 'Preciso de ajuda com pagamento',
      descricao: 'Aceitamos cartões de crédito, débito e PIX. Se tiver problemas, entre em contato com nosso suporte!'
    }
  ];

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#fdf2f5',
        borderRadius: '24px',
        padding: '32px',
        maxWidth: '500px',
        width: '100%',
        maxHeight: '80vh',
        overflowY: 'auto',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        position: 'relative',
        fontFamily: 'sans-serif'
      }}>
        
        {/* Botão Fechar */}
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            backgroundColor: '#fff',
            border: '2px solid #fce7f3',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontSize: '1.2rem',
            color: '#6b7280',
            transition: 'all 0.2s',
            padding: 0,
            lineHeight: 1
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#fce7f3';
            e.target.style.color = '#ff5d8f';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = '#fff';
            e.target.style.color = '#6b7280';
          }}
        >
          ✕
        </button>

        {/* Mascote e Título */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <img 
            src={formigaAjuda} 
            alt="Formiga Ajuda - Mascote" 
            style={{
              width: '100px',
              height: '100px',
              objectFit: 'contain',
              marginBottom: '12px',
            }}
          />
          <h2 style={{
            fontSize: '1.8rem',
            fontWeight: 'bold',
            color: '#1f2937',
            margin: '0 0 4px 0'
          }}>
            Precisa de <span style={{ color: '#ff5d8f' }}>ajuda?</span>
          </h2>
          <p style={{
            color: '#6b7280',
            margin: 0,
            fontSize: '0.95rem'
          }}>
            Aqui estão algumas dicas para ajudar!
          </p>
        </div>

        {/* Lista de Tópicos */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {topicosAjuda.map((topico, index) => (
            <div 
              key={index}
              style={{
                backgroundColor: '#fff',
                padding: '20px',
                borderRadius: '16px',
                border: '1px solid #fce7f3',
                transition: 'all 0.2s',
                cursor: 'default'
              }}
              onMouseEnter={(e) => {
                e.target.style.borderColor = '#ff5d8f';
                e.target.style.transform = 'translateX(4px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.borderColor = '#fce7f3';
                e.target.style.transform = 'translateX(0)';
              }}
            >
              <h3 style={{
                fontSize: '1.1rem',
                fontWeight: '600',
                color: '#1f2937',
                margin: '0 0 8px 0',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span style={{ color: '#ff5d8f' }}>🐜</span>
                {topico.titulo}
              </h3>
              <p style={{
                color: '#6b7280',
                margin: 0,
                fontSize: '0.9rem',
                lineHeight: '1.5'
              }}>
                {topico.descricao}
              </p>
            </div>
          ))}
        </div>

        {/* Rodapé */}
        <div style={{
          marginTop: '24px',
          textAlign: 'center',
          padding: '16px',
          backgroundColor: '#fff',
          borderRadius: '16px',
          border: '1px solid #fce7f3'
        }}>
          <p style={{
            color: '#6b7280',
            margin: '0 0 8px 0',
            fontSize: '0.875rem'
          }}>
            Ainda precisa de ajuda?
          </p>
          <button style={{
            backgroundColor: '#ff5d8f',
            color: '#fff',
            padding: '12px 32px',
            borderRadius: '12px',
            fontWeight: '600',
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.95rem',
            boxShadow: '0 2px 4px rgba(255,93,143,0.3)',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#ec4899';
            e.target.style.transform = 'scale(1.02)';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = '#ff5d8f';
            e.target.style.transform = 'scale(1)';
          }}
          >
            📧 Entrar em contato com suporte
          </button>
        </div>
      </div>

      {/* Animação de flutuação */}
      <style>{`
        @keyframes flutuar {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
};

export default ModalAjuda;