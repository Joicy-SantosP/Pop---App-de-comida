import React, { useState, useEffect } from 'react';
import imgFormigaFeliz from '../assets/formigafeliz.png';

function ModalAcompanharEntrega({ isOpen, onClose, pedidoAtivoId }) {
  const [indiceAtual, setIndiceAtual] = useState(0);
  const [mensagem, setMensagem] = useState('');
  const [entregue, setEntregue] = useState(false);

  const estagios = [
    { label: 'Preparando', icone: '🍽️' },
    { label: 'Saiu para entrega', icone: '🛵' },
    { label: 'Próximo', icone: '📍' },
    { label: 'Entregue', icone: '✅' }
  ];

  // Ao abrir o modal, inicia a simulação
  useEffect(() => {
    if (isOpen) {
      setIndiceAtual(0);
      setEntregue(false);
      avancarEstagio();
    }
  }, [isOpen]);

  const avancarEstagio = async () => {
    try {
      const response = await fetch(
        `http://127.0.0.1:5000/entrega/pedido/${pedidoAtivoId}/simular-entrega`,
        { method: 'POST' }
      );
      
      const dados = await response.json();
      
      if (response.ok) {
        setIndiceAtual(dados.indice);
        setMensagem(dados.mensagem);
        
        // Se não chegou ao fim, agenda próximo avanço
        if (dados.indice < dados.total - 1) {
          setTimeout(() => avancarEstagio(), 3000); // 3 segundos entre estágios
        } else {
          setEntregue(true);
        }
      }
    } catch (error) {
      console.error("Erro na simulação:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{ 
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex',
      justifyContent: 'center', alignItems: 'center', zIndex: 99999
    }}>
      <div style={{ 
        backgroundColor: '#fff', padding: '40px', borderRadius: '20px',
        textAlign: 'center', width: '500px', maxWidth: '90%',
        boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
      }}>
        
        {/* Título */}
        <h3 style={{ color: '#20b2aa', marginBottom: '30px', fontSize: '1.3rem' }}>
          📦 Acompanhando Entrega
        </h3>

        {/* Mensagem */}
        <p style={{ 
          color: '#666', fontSize: '1rem', marginBottom: '30px',
          minHeight: '24px'
        }}>
          {mensagem || 'Iniciando...'}
        </p>

        {/* Barra de Status */}
        <div style={{ 
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', marginBottom: '15px',
          position: 'relative', padding: '0 20px'
        }}>
          {/* Linha de fundo */}
          <div style={{
            position: 'absolute', top: '25px', left: '50px', right: '50px',
            height: '4px', backgroundColor: '#e0e0e0', zIndex: 0
          }} />
          
          {/* Linha preenchida */}
          <div style={{
            position: 'absolute', top: '25px', left: '50px',
            height: '4px', backgroundColor: '#20b2aa', zIndex: 1,
            width: `${(indiceAtual / (estagios.length - 1)) * 100}%`,
            transition: 'width 0.5s ease'
          }} />

          {/* Bolinhas */}
          {estagios.map((estagio, index) => (
            <div key={index} style={{ 
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', zIndex: 2,
              width: '70px'
            }}>
              <div style={{
                width: '50px', height: '50px', borderRadius: '50%',
                backgroundColor: index <= indiceAtual ? '#20b2aa' : '#e0e0e0',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.5rem', transition: 'all 0.5s ease',
                transform: index === indiceAtual ? 'scale(1.2)' : 'scale(1)',
                boxShadow: index <= indiceAtual ? '0 4px 15px rgba(32,178,170,0.4)' : 'none'
              }}>
                {index < indiceAtual ? '✓' : estagio.icone}
              </div>
              <span style={{ 
                fontSize: '0.7rem', marginTop: '8px',
                color: index <= indiceAtual ? '#20b2aa' : '#999',
                fontWeight: index === indiceAtual ? 'bold' : 'normal'
              }}>
                {estagio.label}
              </span>
            </div>
          ))}
        </div>

        {/* Tempo estimado */}
        {!entregue && (
          <p style={{ color: '#999', fontSize: '0.8rem', marginTop: '20px' }}>
            ⏱️ Atualizando automaticamente...
          </p>
        )}

        {/* Entregue - Formiguinha Feliz */}
        {entregue && (
          <div style={{ marginTop: '20px' }}>
            <img src={imgFormigaFeliz} alt="Entregue!" style={{ width: '150px' }} />
            <p style={{ color: '#20b2aa', fontWeight: 'bold', fontSize: '1.1rem' }}>
              🎉 Entrega concluída! Bom apetite!
            </p>
          </div>
        )}

        {/* Botão Fechar */}
        <button 
          onClick={onClose}
          style={{ 
            padding: '10px 30px', backgroundColor: '#20b2aa', color: '#fff',
            border: 'none', borderRadius: '20px', cursor: 'pointer',
            fontWeight: 'bold', marginTop: '25px', fontSize: '0.9rem'
          }}
        >
          {entregue ? 'Fechar' : 'Fechar (simulação continua)'}
        </button>
      </div>
    </div>
  );
}

export default ModalAcompanharEntrega;