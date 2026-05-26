import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

import imgFormigaTriste from '../assets/formigatriste.png';
import imgFormigaFeliz from '../assets/formigafeliz.png';
import imgFormigaPensativa from '../assets/formigapensativa.png';

function ModalPix({ 
  isOpen, 
  onClose, 
  pedidoAtivoId, 
  itensCarrinho, 
  dadosEntrega, 
  enderecoSelecionado,
  onPagamentoConfirmado 
}) {
  const [statusPagamento, setStatusPagamento] = useState('aguardando');
  const [qrcodeUrl, setQrcodeUrl] = useState(null);
  const [pixCode, setPixCode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pagamentoConfirmado, setPagamentoConfirmado] = useState(false);

  const gerarPix = async () => {
    if (!pedidoAtivoId) {
      alert("Nenhum pedido ativo encontrado!");
      return;
    }

    if (!enderecoSelecionado?.id) {
      alert("Endereço de entrega não selecionado!");
      return;
    }

    setLoading(true);
    setStatusPagamento('aguardando');

    try {
      const subtotal = itensCarrinho.reduce(
        (acc, i) => acc + (Number(i.preco_unitario) * Number(i.quantidade)), 
        0
      );
      
      const payload = {
        pedido_id: pedidoAtivoId,
        endereco_id: enderecoSelecionado.id,
        subtotal: subtotal,
        taxa_entrega: Number(dadosEntrega.taxaEntrega || 0),
        tipo_envio: 'retirada' || 'entrega',
        metodo_id: 1,
      };

      console.log("📤 Enviando para /pagamentos/pix:", payload);

      const response = await fetch("http://127.0.0.1:5000/pagamentos/pix", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(payload),
      });

      const dados = await response.json();
      console.log("📥 Resposta do PIX:", dados);

      if (response.ok) {
        setPixCode(dados.qr_code);
        setStatusPagamento('sucesso');
      } else {
        throw new Error(dados.erro || 'Erro ao gerar PIX');
      }
    } catch (error) {
      console.error("❌ Erro ao gerar PIX:", error);
      setStatusPagamento('erro');
      alert("Erro ao gerar QR Code PIX: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const copiarCodigoPix = () => {
    if (pixCode) {
      navigator.clipboard.writeText(pixCode);
      alert("✅ Código PIX copiado com sucesso!");
    }
  };

  const verificarPagamento = async () => {
    try {
      const responseSimulacao = await fetch(
        `http://127.0.0.1:5000/pagamentos/simular-aprovacao/${pedidoAtivoId}`,
        { method: 'POST' }
      );
      
      const dadosSimulacao = await responseSimulacao.json();
      
      if (responseSimulacao.ok) {
        setPagamentoConfirmado(true); // ← Ativa a tela de sucesso
        
        // Espera 3 segundos e depois redireciona
        setTimeout(() => {
          onPagamentoConfirmado();
          onClose();
        }, 3000); // 3000ms = 3 segundos
        
      } else {
        const response = await fetch(
          `http://127.0.0.1:5000/pagamentos/pedido/${pedidoAtivoId}`
        );
        const dados = await response.json();
        
        if (dados.status === "Pagamento Confirmado") {
          setPagamentoConfirmado(true);
          setTimeout(() => {
            onPagamentoConfirmado();
            onClose();
          }, 3000);
        } else {
          alert("⏳ Pagamento ainda não confirmado. Tente novamente.");
        }
      }
    } catch (error) {
      console.error("Erro:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      right: 0, 
      bottom: 0, 
      backgroundColor: 'rgba(0,0,0,0.6)', 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      zIndex: 99999 
    }}>
      <div style={{ 
        backgroundColor: '#fff0f5', 
        padding: '40px', 
        borderRadius: '20px', 
        textAlign: 'center', 
        width: '450px', 
        maxWidth: '90%',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
        position: 'relative'
      }}>
        
        {/* Botão Fechar */}
        <span 
          onClick={onClose}
          style={{ 
            position: 'absolute', 
            top: '15px', 
            right: '20px', 
            color: '#ff3b3b', 
            fontSize: '1.5rem', 
            fontWeight: 'bold', 
            cursor: 'pointer',
            zIndex: 1
          }}
        >
          ✕
        </span>

        <h3 style={{ 
          color: '#ff3333', 
          margin: '0 0 30px 0', 
          fontSize: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px'
        }}>
          <span>❖</span> Pagamento PIX
        </h3>
        
        {/* ESTADO: CARREGANDO */}
        {loading && (
          <div>
            <img src={imgFormigaPensativa} alt="Aguardando" style={{ width: '220px', marginBottom: '20px' }} />
            <p style={{ color: '#666' }}>Gerando QR Code PIX...</p>
          </div>
        )}

        {/* ESTADO: AGUARDANDO PARA GERAR */}
        {!loading && statusPagamento === 'aguardando' && (
          <div>
            <div style={{ 
              width: '200px', 
              height: '200px', 
              margin: '0 auto 20px auto',
              backgroundColor: '#ffeef5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '10px',
              border: '2px dashed #ccc'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '3rem' }}>📱</div>
                <p style={{ color: '#999', fontSize: '0.9rem' }}>QR Code PIX</p>
              </div>
            </div>

            <p style={{ marginBottom: '20px', color: '#666' }}>
              Clique no botão abaixo para gerar o QR Code do PIX
            </p>

            <button 
              onClick={gerarPix}
              style={{ 
                padding: '15px 30px', 
                backgroundColor: '#ff3333', 
                color: '#fff', 
                border: 'none', 
                borderRadius: '10px', 
                fontWeight: 'bold', 
                cursor: 'pointer', 
                width: '100%',
                fontSize: '1.1rem',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#d11616'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#aa1f1f'}
            >
              Gerar QR Code PIX
            </button>
          </div>
        )}

        {/* ESTADO: QR CODE GERADO */}
        {!loading && statusPagamento === 'sucesso' && (
          <div>
            <p style={{ 
              marginBottom: '15px', 
              fontWeight: 'bold', 
              color: '#333',
              fontSize: '1.1rem'
            }}>
              Escaneie o QR Code abaixo
            </p>
            
            {/* QR Code */}
            <div style={{ 
                width: '250px', 
                height: '250px', 
                margin: '0 auto 20px auto',
                backgroundColor: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '10px',
                border: '2px solid #ff3333',
                overflow: 'hidden',
                padding: '10px'
                }}>
                {pixCode ? (
                    <QRCodeSVG 
                    value={pixCode} 
                    size={230}
                    level="M"
                    />
                ) : (
                    <div style={{ fontSize: '5rem' }}>📱</div>
                )}
                </div>

            {/* Código Copia e Cola */}
            {pixCode && (
              <div style={{ marginTop: '20px', textAlign: 'left' }}>
                <p style={{ 
                  fontWeight: 'bold', 
                  marginBottom: '10px',
                  color: '#333'
                }}>
                  Ou copie o código PIX:
                </p>
                <div style={{ 
                  backgroundColor: '#f5f5f5', 
                  padding: '15px', 
                  borderRadius: '8px',
                  wordBreak: 'break-all',
                  fontSize: '0.8rem',
                  marginBottom: '15px',
                  border: '1px solid #e0e0e0',
                  fontFamily: 'monospace'
                }}>
                  {pixCode}
                </div>
                <button 
                  onClick={copiarCodigoPix}
                  style={{ 
                    backgroundColor: '#ff3333', 
                    color: '#fff', 
                    border: 'none', 
                    padding: '10px 20px', 
                    borderRadius: '8px', 
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    width: '100%'
                  }}
                >
                  Copiar Código PIX
                </button>
              </div>
            )}

            <div style={{ 
              marginTop: '20px', 
              padding: '15px', 
              backgroundColor: '#f0fdf9', 
              borderRadius: '8px',
              border: '1px solid #20b2aa33'
            }}>
              <p style={{ 
                color: '#666', 
                fontSize: '0.9rem', 
                marginBottom: '15px' 
              }}>
                Após o pagamento, clique no botão abaixo para verificar
              </p>

              <button 
                onClick={verificarPagamento}
                style={{ 
                  padding: '12px 30px', 
                  backgroundColor: '#d11616', 
                  color: '#fff', 
                  border: 'none', 
                  borderRadius: '8px', 
                  fontWeight: 'bold', 
                  cursor: 'pointer', 
                  width: '100%',
                  fontSize: '1rem'
                }}
              >
                Já paguei, verificar
              </button>
            </div>
          </div>
        )}

        {/* ESTADO: ERRO */}
        {!loading && statusPagamento === 'erro' && (
          <div>
            <img src={imgFormigaTriste} alt="Erro" style={{ width: '220px', marginBottom: '20px' }} />
            <p style={{ 
              color: '#ff3b3b', 
              fontWeight: 'bold', 
              marginBottom: '20px',
              fontSize: '1.1rem'
            }}>
              OPS! Algo deu errado ao gerar o QR Code
            </p>
            <button 
              onClick={gerarPix}
              style={{ 
                padding: '12px 30px', 
                backgroundColor: '#ff3b3b', 
                color: '#fff', 
                border: 'none', 
                borderRadius: '8px', 
                fontWeight: 'bold', 
                cursor: 'pointer', 
                width: '100%',
                marginBottom: '10px'
              }}
            >
              Tentar novamente
            </button>
          </div>
        )}

        {/* Botão Cancelar */}
        <button 
          onClick={onClose}
          style={{ 
            padding: '10px', 
            backgroundColor: '#f5f5f5', 
            color: '#666', 
            border: 'none', 
            borderRadius: '8px', 
            cursor: 'pointer', 
            width: '100%',
            marginTop: '15px',
            fontWeight: 'bold'
          }}
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}

export default ModalPix;