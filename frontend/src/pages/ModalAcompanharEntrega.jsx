import React, { useState, useEffect, useRef } from 'react';
import imgFormigaFeliz from '../assets/formigafeliz.png';

function ModalAcompanharEntrega({ isOpen, onClose, pedidoAtivoId, infoEntregador }) {
  const [indiceAtual, setIndiceAtual] = useState(0);
  const [mensagem, setMensagem] = useState('');
  const [entregue, setEntregue] = useState(false);
  const [mostrarInputCodigo, setMostrarInputCodigo] = useState(false);
  const [codigoConfirmacao, setCodigoConfirmacao] = useState('');
  const [erroCodigo, setErroCodigo] = useState('');
  
  const simulacaoPausadaRef = useRef(false);
  const timerRef = useRef(null);

  const estagios = [
    { label: 'Preparando', icone: '🍽️' },
    { label: 'Pronto', icone: '🧁' },
    { label: 'Saiu para entrega', icone: '🛵' },
    { label: 'Próximo', icone: '📍' },
    { label: 'Entregue', icone: '✅' }
  ];

  const limparTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const avancarEstagio = async () => {
    if (simulacaoPausadaRef.current) {
      console.log("Simulação pausada, não avança");
      return;
    }
    
    console.log("🔄 Avançando estágio...");
    
    try {
      const response = await fetch(
        `http://127.0.0.1:5000/pedido/${pedidoAtivoId}/simular-entrega`,
        { method: 'POST' }
      );
      
      const dados = await response.json();
      console.log("📦 Resposta do backend:", dados);
      
      if (response.ok) {
        setIndiceAtual(dados.indice);
        setMensagem(dados.mensagem);
        
        if (dados.status === "Próximo" || dados.indice === estagios.length - 2) {
          console.log("📍 Chegou no Próximo - pausando para código");
          setMostrarInputCodigo(true);
          simulacaoPausadaRef.current = true;
          limparTimer();
          return;
        }
        
        if (dados.indice >= dados.total - 1 || dados.status === "Entregue") {
          console.log("✅ Entregue!");
          setEntregue(true);
          simulacaoPausadaRef.current = true;
          limparTimer();
          return;
        }
        
        if (!simulacaoPausadaRef.current) {
          console.log("⏱️ Agendando próximo avanço em 5 segundos...");
          limparTimer();
          timerRef.current = setTimeout(() => {
            avancarEstagio();
          }, 5000);
        }
      } else {
        console.error("Erro na resposta:", dados);
      }
    } catch (error) {
      console.error("Erro na simulação:", error);
    }
  };

  useEffect(() => {
    if (isOpen && pedidoAtivoId) {
      console.log("🚀 Modal aberto - iniciando simulação");
      setIndiceAtual(0);
      setEntregue(false);
      setMostrarInputCodigo(false);
      setCodigoConfirmacao('');
      setErroCodigo('');
      simulacaoPausadaRef.current = false;
      limparTimer();
      
      setTimeout(() => {
        avancarEstagio();
      }, 500);
    }

    return () => {
      console.log("Modal fechado - pausando simulação");
      simulacaoPausadaRef.current = true;
      limparTimer();
    };
  }, [isOpen, pedidoAtivoId]);

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
        setIndiceAtual(estagios.length - 1);
        setMensagem('Pedido entregue! Bom apetite! 🎉');
        setEntregue(true);
        setMostrarInputCodigo(false);
        setErroCodigo('');
        simulacaoPausadaRef.current = true;
        limparTimer();
      } else {
        setErroCodigo(dados.erro || 'Código inválido');
      }
    } catch (error) {
      console.error("Erro ao confirmar entrega:", error);
      setErroCodigo('Erro de conexão');
    }
  };

  if (!isOpen) return null;

  const progressoAtual = entregue 
    ? 100 
    : mostrarInputCodigo 
      ? ((estagios.length - 2) / (estagios.length - 1)) * 100 
      : (indiceAtual / (estagios.length - 1)) * 100;

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
        
        <h3 style={{ color: '#000000', marginBottom: '30px', fontSize: '1.3rem' }}>
          Acompanhando Entrega
        </h3>

        {infoEntregador && (
          <div style={{
            backgroundColor: '#fff',
            padding: '15px',
            borderRadius: '10px',
            marginBottom: '20px',
            border: '2px solid #e96671',
            textAlign: 'left'
          }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#e96671' }}>🛵 Seu Entregador</h4>
            <p style={{ margin: '5px 0' }}><strong>Nome:</strong> {infoEntregador.nome}</p>
            <p style={{ margin: '5px 0' }}><strong>Veículo:</strong> {infoEntregador.veiculo}</p>
            <p style={{ margin: '5px 0' }}><strong>Telefone:</strong> {infoEntregador.telefone}</p>
          </div>
        )}

        <p style={{ color: '#666', fontSize: '1rem', marginBottom: '30px', minHeight: '24px' }}>
          {mensagem || 'Iniciando simulação...'}
        </p>

      {/* Barra de Status com bolinhas */}
        <div style={{ 
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', marginBottom: '15px',
          position: 'relative', padding: '0 20px'
        }}>
          {/* Linha de fundo - ajustada para ir de bolinha a bolinha */}
          <div style={{
            position: 'absolute', 
            top: '25px', 
            left: '55px',   // 🔄 Ajustado (metade da bolinha + padding)
            right: '55px',  // 🔄 Ajustado (metade da bolinha + padding)
            height: '4px', 
            backgroundColor: '#e0e0e0', 
            zIndex: 0
          }} />
          
          {/* Linha preenchida - mesma largura */}
          <div style={{
            position: 'absolute', 
            top: '25px', 
            left: '55px',   // 🔄 Ajustado
            height: '4px', 
            backgroundColor: '#e96671', 
            zIndex: 1,
            width: `calc(${progressoAtual}% * (100% - 110px) / 100%)`, // 🔄 Corrigido
            maxWidth: 'calc(100% - 110px)', // 🔄 Não ultrapassa a última bolinha
            transition: 'width 0.5s ease'
          }} />

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
                boxShadow: index <= indiceAtual ? '0 4px 10px rgba(233, 102, 113, 0.5)' : 'none'
              }}>
                {index < indiceAtual ? '✓' : estagio.icone}
              </div>
              <span style={{ 
                fontSize: '0.7rem', marginTop: '15px',
                color: index <= indiceAtual ? '#000000' : '#999',
                fontWeight: index === indiceAtual ? 'bold' : 'normal',
                whiteSpace: 'nowrap'
              }}>
                {estagio.label}
              </span>
            </div>
          ))}
        </div>

        {/* Input de Código */}
        {mostrarInputCodigo && !entregue && (
          <div style={{ 
            backgroundColor: '#fff', 
            padding: '20px', 
            borderRadius: '10px',
            marginTop: '30px',
            border: '2px solid #e96671'
          }}>
            <p style={{ color: '#333', fontWeight: 'bold', marginBottom: '15px' }}>
              🔐 O entregador chegou! Digite o código:
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
                width: '100%', padding: '12px', borderRadius: '8px',
                border: `2px solid ${erroCodigo ? '#ff3b3b' : '#e0e0e0'}`,
                textAlign: 'center', fontSize: '1.2rem', fontWeight: 'bold',
                letterSpacing: '3px', outline: 'none', boxSizing: 'border-box'
              }}
            />
            {erroCodigo && (
              <p style={{ color: '#ff3b3b', fontSize: '0.85rem', marginTop: '8px' }}>
                ❌ {erroCodigo}
              </p>
            )}
            <button onClick={confirmarEntrega} style={{ 
              width: '100%', marginTop: '15px', padding: '12px',
              backgroundColor: '#27ae60', color: '#fff', border: 'none',
              borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold'
            }}>
              ✅ Confirmar Entrega
            </button>
          </div>
        )}

        {!entregue && !mostrarInputCodigo && (
          <p style={{ color: '#999', fontSize: '0.8rem', marginTop: '20px' }}>
            ⏱️ Avançando automaticamente...
          </p>
        )}

        {entregue && (
          <div style={{ marginTop: '20px' }}>
            <p style={{ color: '#ff3b3b', fontWeight: 'bold', fontSize: '1.1rem' }}>
              🎉 Entrega concluída! Bom apetite!
            </p>
          </div>
        )}

        <button onClick={onClose} style={{ 
          padding: '10px 30px', backgroundColor: '#ff3b3b', color: '#fff',
          border: 'none', borderRadius: '20px', cursor: 'pointer',
          fontWeight: 'bold', marginTop: '25px'
        }}>
          Fechar
        </button>
      </div>
    </div>
  );
}

export default ModalAcompanharEntrega;