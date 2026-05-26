import React, { useState, useEffect } from 'react';
import imgFormigaFeliz from '../assets/formigafeliz.png';

function ModalAcompanharEntrega({ isOpen, onClose, pedidoAtivoId }) {
  const [indiceAtual, setIndiceAtual] = useState(0);
  const [mensagem, setMensagem] = useState('');
  const [entregue, setEntregue] = useState(false);
  const [mostrarInputCodigo, setMostrarInputCodigo] = useState(false);
  const [codigoConfirmacao, setCodigoConfirmacao] = useState('');
  const [erroCodigo, setErroCodigo] = useState('');

  const estagios = [
    { label: 'Preparando', icone: '🍽️' },
    { label: 'Pronto', icone: '🧁' },
    { label: 'Saiu para entrega', icone: '🛵' },
    { label: 'Próximo', icone: '📍' },
    { label: 'Entregue', icone: '✅' }
  ];

  useEffect(() => {
    if (isOpen) {
      setIndiceAtual(0);
      setEntregue(false);
      setMostrarInputCodigo(false);
      setCodigoConfirmacao('');
      setErroCodigo('');
      avancarEstagio();
    }
  }, [isOpen]);

  const avancarEstagio = async () => {
    try {
      const response = await fetch(
        `http://127.0.0.1:5000/pedido/${pedidoAtivoId}/simular-entrega`,
        { method: 'POST' }
      );
      
      const dados = await response.json();
      
      if (response.ok) {
        setIndiceAtual(dados.indice);
        setMensagem(dados.mensagem);
        
        // Se chegou no penúltimo estágio (Próximo), mostra o input de código
        if (dados.indice === dados.total - 2) {
          setMostrarInputCodigo(true);
          return; // Para e espera o código
        }
        
        // Se não chegou ao fim, agenda próximo avanço
        if (dados.indice < dados.total - 1) {
          setTimeout(() => avancarEstagio(), 10000); // 3 segundos entre estágios
        } else {
          setEntregue(true);
        }
      }
    } catch (error) {
      console.error("Erro na simulação:", error);
    }
  };

  const confirmarEntrega = async () => {
    if (!codigoConfirmacao.trim()) {
      setErroCodigo('Digite o código de confirmação');
      return;
    }

    try {
      const response = await fetch(
        `http://127.0.0.1:5000/pedido/${pedidoAtivoId}/confirmar-entrega`,
        { 
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ codigo_verificacao: codigoConfirmacao })
        }
      );

      const dados = await response.json();

      if (response.ok) {
        // Avança para o último estágio (Entregue)
        setIndiceAtual(estagios.length - 1);
        setMensagem('Pedido entregue! Bom apetite! 🎉');
        setEntregue(true);
        setMostrarInputCodigo(false);
        setErroCodigo('');
      } else {
        setErroCodigo(dados.erro || 'Código inválido');
      }
    } catch (error) {
      console.error("Erro ao confirmar entrega:", error);
      setErroCodigo('Erro de conexão');
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
        backgroundColor: '#ffe6e8', padding: '40px', borderRadius: '20px',
        textAlign: 'center', width: '500px', maxWidth: '90%',
        boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
      }}>
        
        {/* Título */}
        <h3 style={{ color: '#000000', marginBottom: '30px', fontSize: '1.3rem' }}>
          Acompanhando Entrega
        </h3>

        {/* Mensagem */}
        <p style={{ 
          color: '#666', fontSize: '1rem', marginBottom: '30px',
          minHeight: '24px'
        }}>
          {mensagem || 'Iniciando...'}
        </p>

        {/* Input de Código de Confirmação */}
        {mostrarInputCodigo && (
          <div style={{ 
            backgroundColor: '#fff', 
            padding: '20px', 
            borderRadius: '10px',
            marginBottom: '20px',
            border: '2px solid #e96671'
          }}>
            <p style={{ 
              color: '#333', 
              fontWeight: 'bold', 
              marginBottom: '15px',
              fontSize: '0.95rem'
            }}>
              🔐 O entregador chegou! Digite o código de confirmação:
            </p>
            <input 
              type="text"
              value={codigoConfirmacao}
              onChange={(e) => {
                setCodigoConfirmacao(e.target.value);
                setErroCodigo('');
              }}
              placeholder="Digite o código"
              maxLength={6}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: `2px solid ${erroCodigo ? '#ff3b3b' : '#e0e0e0'}`,
                textAlign: 'center',
                fontSize: '1.2rem',
                fontWeight: 'bold',
                letterSpacing: '3px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
            {erroCodigo && (
              <p style={{ 
                color: '#ff3b3b', 
                fontSize: '0.85rem', 
                marginTop: '8px',
                fontWeight: 'bold'
              }}>
                ❌ {erroCodigo}
              </p>
            )}
            <button 
              onClick={confirmarEntrega}
              style={{ 
                width: '100%',
                marginTop: '15px',
                padding: '12px',
                backgroundColor: '#27ae60',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '1rem'
              }}
            >
              ✅ Confirmar Entrega
            </button>
          </div>
        )}

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
            height: '4px', backgroundColor: '#e96671', zIndex: 1,
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
                backgroundColor: index <= indiceAtual ? '#f3afb5' : '#e0e0e0',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.5rem', transition: 'all 0.5s ease',
                transform: index === indiceAtual ? 'scale(1.2)' : 'scale(1)',
                boxShadow: index <= indiceAtual ? '0 4px 10px #e96671' : 'none'
              }}>
                {index < indiceAtual ? '✓' : estagio.icone}
              </div>
              <span style={{ 
                fontSize: '0.7rem', marginTop: '15px',
                color: index <= indiceAtual ? '#000000' : '#999',
                fontWeight: index === indiceAtual ? 'bold' : 'normal'
              }}>
                {estagio.label}
              </span>
            </div>
          ))}
        </div>

        {/* Aguardando código */}
        {mostrarInputCodigo && !entregue && (
          <p style={{ color: '#e96671', fontSize: '0.85rem', marginTop: '10px', fontWeight: 'bold' }}>
            ⚠️ Aguardando confirmação do código...
          </p>
        )}

        {/* Tempo estimado */}
        {!entregue && !mostrarInputCodigo && (
          <p style={{ color: '#999', fontSize: '0.8rem', marginTop: '20px' }}>
            ⏱️ Atualizando automaticamente...
          </p>
        )}

        {/* Entregue - Formiguinha Feliz */}
        {entregue && (
          <div style={{ marginTop: '20px' }}>
            <img src={imgFormigaFeliz} alt="Entregue!" style={{ width: '150px' }} />
            <p style={{ color: '#ff3b3b', fontWeight: 'bold', fontSize: '1.1rem' }}>
              🎉 Entrega concluída! Bom apetite!
            </p>
          </div>
        )}

        {/* Botão Fechar */}
        <button 
          onClick={onClose}
          style={{ 
            padding: '10px 30px', backgroundColor: '#ff3b3b', color: '#fff',
            border: 'none', borderRadius: '20px', cursor: 'pointer',
            fontWeight: 'bold', marginTop: '25px', fontSize: '0.9rem'
          }}
        >
          {entregue ? 'Fechar' : 'Fechar'}
        </button>
      </div>
    </div>
  );
}

export default ModalAcompanharEntrega;