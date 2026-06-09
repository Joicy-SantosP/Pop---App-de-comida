import React, { useState, useEffect } from 'react';
import formigaLocalizacao from '../assets/furmigalocalização.png'; // Ajuste o caminho

const ModalEnderecos = ({ isOpen, onClose }) => {
  const [enderecos, setEnderecos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensagem, setMensagem] = useState({ tipo: '', texto: '' });
  const [modoEdicao, setModoEdicao] = useState(null); // null = lista, número = id sendo editado
  const [enderecoEditando, setEnderecoEditando] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const [mostrarConfirmacao, setMostrarConfirmacao] = useState(null); // id para excluir
  const [excluindo, setExcluindo] = useState(false);
  const [buscandoCep, setBuscandoCep] = useState(false);

  const [formData, setFormData] = useState({
    cep: '',
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
    ponto_referencial: '',
    rotulo: '',
    principal: false
  });

  // Carregar endereços
  const carregarEnderecos = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const usuarioId = localStorage.getItem('usuario_id');
      
      const response = await fetch(`http://localhost:5000/enderecos/usuario/${usuarioId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const dados = await response.json();
        setEnderecos(dados);
      }
    } catch (error) {
      console.error('Erro ao carregar endereços:', error);
      setMensagem({ tipo: 'erro', texto: 'Erro ao carregar seus endereços' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      carregarEnderecos();
    }
  }, [isOpen]);

  // Buscar CEP
  const buscarCep = async (cep) => {
    const cepLimpo = cep.replace(/\D/g, '');
    if (cepLimpo.length !== 8) return;

    setBuscandoCep(true);
    try {
      const response = await fetch(`http://localhost:5000/enderecos/cep/${cepLimpo}`);
      if (response.ok) {
        const dados = await response.json();
        setFormData(prev => ({
          ...prev,
          logradouro: dados.logradouro || '',
          bairro: dados.bairro || '',
          cidade: dados.localidade || '',
          estado: dados.uf || ''
        }));
        setMensagem({ tipo: 'sucesso', texto: 'CEP encontrado!' });
        setTimeout(() => setMensagem({ tipo: '', texto: '' }), 3000);
      } else {
        setMensagem({ tipo: 'erro', texto: 'CEP não encontrado' });
      }
    } catch (error) {
      setMensagem({ tipo: 'erro', texto: 'Erro ao buscar CEP' });
    } finally {
      setBuscandoCep(false);
    }
  };

  // Buscar detalhes do endereço para edição
  const buscarDetalhesEndereco = async (id) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://localhost:5000/enderecos/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const dados = await response.json();
        setEnderecoEditando(dados);
        setFormData({
          cep: dados.cep || '',
          logradouro: dados.logradouro || '',
          numero: dados.numero || '',
          complemento: dados.complemento || '',
          bairro: dados.bairro || '',
          cidade: dados.cidade || '',
          estado: dados.estado || '',
          ponto_referencial: dados.ponto_referencial || '',
          rotulo: dados.rotulo || '',
          principal: dados.principal || false
        });
        setModoEdicao(id);
      }
    } catch (error) {
      setMensagem({ tipo: 'erro', texto: 'Erro ao carregar detalhes do endereço' });
    }
  };

  // Salvar (criar ou editar)
  const handleSalvar = async (e) => {
    e.preventDefault();
    setSalvando(true);
    setMensagem({ tipo: '', texto: '' });

    try {
      const token = localStorage.getItem('access_token');
      const usuarioId = localStorage.getItem('usuario_id');

      const dadosParaEnviar = {
        ...formData,
        usuario_id: parseInt(usuarioId),
        numero: formData.numero || 'S/N'
      };

      let response;
      if (modoEdicao) {
        // Editar endereço existente
        response = await fetch(`http://localhost:5000/enderecos/${modoEdicao}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(dadosParaEnviar)
        });
      } else {
        // Criar novo endereço
        response = await fetch('http://localhost:5000/enderecos/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(dadosParaEnviar)
        });
      }

      if (response.ok) {
        setMensagem({ tipo: 'sucesso', texto: modoEdicao ? 'Endereço atualizado com sucesso!' : 'Endereço cadastrado com sucesso!' });
        resetarFormulario();
        carregarEnderecos();
        setTimeout(() => setMensagem({ tipo: '', texto: '' }), 3000);
      } else {
        const erro = await response.json();
        setMensagem({ tipo: 'erro', texto: erro.erro || 'Erro ao salvar endereço' });
      }
    } catch (error) {
      setMensagem({ tipo: 'erro', texto: 'Erro ao salvar. Tente novamente.' });
    } finally {
      setSalvando(false);
    }
  };

  // Excluir endereço
  const handleExcluir = async (id) => {
    setExcluindo(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://localhost:5000/enderecos/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setMensagem({ tipo: 'sucesso', texto: 'Endereço removido com sucesso!' });
        carregarEnderecos();
        setTimeout(() => setMensagem({ tipo: '', texto: '' }), 3000);
      } else {
        setMensagem({ tipo: 'erro', texto: 'Erro ao excluir endereço' });
      }
    } catch (error) {
      setMensagem({ tipo: 'erro', texto: 'Erro ao excluir. Tente novamente.' });
    } finally {
      setExcluindo(false);
      setMostrarConfirmacao(null);
    }
  };

  const resetarFormulario = () => {
    setFormData({
      cep: '',
      logradouro: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      estado: '',
      ponto_referencial: '',
      rotulo: '',
      principal: false
    });
    setModoEdicao(null);
    setEnderecoEditando(null);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Buscar CEP automaticamente quando completar 8 dígitos
    if (name === 'cep') {
      const cepLimpo = value.replace(/\D/g, '');
      if (cepLimpo.length === 8) {
        buscarCep(cepLimpo);
      }
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
        maxWidth: '600px',
        width: '100%',
        maxHeight: '85vh',
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
            lineHeight: 1,
            zIndex: 10
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
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <img 
            src={formigaLocalizacao} 
            alt="Formiga Localização - Mascote" 
            style={{
              width: '80px',
              height: '80px',
              objectFit: 'contain',
              marginBottom: '8px',
            }}
          />
          <h2 style={{
            fontSize: '1.6rem',
            fontWeight: 'bold',
            color: '#1f2937',
            margin: '0 0 4px 0'
          }}>
            Meus <span style={{ color: '#ff5d8f' }}>Endereços</span>
          </h2>
          <p style={{
            color: '#6b7280',
            margin: 0,
            fontSize: '0.9rem'
          }}>
            🐜 Gerencie seus endereços de entrega
          </p>
        </div>

        {/* Mensagem de feedback */}
        {mensagem.texto && (
          <div style={{
            backgroundColor: mensagem.tipo === 'sucesso' ? '#d1fae5' : 
                            mensagem.tipo === 'erro' ? '#fee2e2' : '#dbeafe',
            color: mensagem.tipo === 'sucesso' ? '#065f46' : 
                   mensagem.tipo === 'erro' ? '#991b1b' : '#1e40af',
            padding: '12px 16px',
            borderRadius: '12px',
            marginBottom: '20px',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.9rem'
          }}>
            <span>
              {mensagem.tipo === 'sucesso' ? '✅' : 
               mensagem.tipo === 'erro' ? '❌' : 'ℹ️'}
            </span>
            {mensagem.texto}
          </div>
        )}

        {/* LISTA DE ENDEREÇOS */}
        {!modoEdicao && (
          <>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: '#ff5d8f' }}>
                <div style={{ fontSize: '2rem', marginBottom: '12px' }}>🐜</div>
                Carregando endereços...
              </div>
            ) : (
              <>
                {enderecos.length === 0 ? (
                  <div style={{
                    textAlign: 'center',
                    padding: '40px 20px',
                    backgroundColor: '#fff',
                    borderRadius: '20px',
                    border: '1px solid #fce7f3'
                  }}>
                    <div style={{ fontSize: '3rem', marginBottom: '12px' }}>📍</div>
                    <p style={{ color: '#6b7280', margin: '0 0 16px 0' }}>
                      Você ainda não tem endereços cadastrados
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                    {enderecos.map(endereco => (
                      <div
                        key={endereco.id}
                        style={{
                          backgroundColor: '#fff',
                          padding: '20px',
                          borderRadius: '16px',
                          border: endereco.principal ? '2px solid #ff5d8f' : '1px solid #fce7f3',
                          boxShadow: endereco.principal ? '0 2px 8px rgba(255,93,143,0.2)' : 'none',
                          transition: 'all 0.2s',
                          position: 'relative'
                        }}
                      >
                        {endereco.principal && (
                          <span style={{
                            position: 'absolute',
                            top: '-10px',
                            right: '16px',
                            backgroundColor: '#ff5d8f',
                            color: '#fff',
                            padding: '4px 12px',
                            borderRadius: '20px',
                            fontSize: '0.75rem',
                            fontWeight: '600'
                          }}>
                            ⭐ Principal
                          </span>
                        )}
                        
                        <div style={{ marginBottom: '12px' }}>
                          {endereco.rotulo && (
                            <h3 style={{
                              fontSize: '1.1rem',
                              fontWeight: '600',
                              color: '#1f2937',
                              margin: '0 0 4px 0'
                            }}>
                              📝 {endereco.rotulo}
                            </h3>
                          )}
                          <p style={{
                            color: '#4b5563',
                            margin: 0,
                            fontSize: '0.9rem',
                            lineHeight: '1.5'
                          }}>
                            {endereco.logradouro}, {endereco.numero}
                            <br />
                            {endereco.cidade}
                          </p>
                        </div>

                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => buscarDetalhesEndereco(endereco.id)}
                            style={{
                              flex: 1,
                              backgroundColor: '#fce7f3',
                              color: '#ff5d8f',
                              padding: '8px 16px',
                              borderRadius: '10px',
                              fontWeight: '600',
                              border: 'none',
                              cursor: 'pointer',
                              fontSize: '0.85rem',
                              transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => e.target.style.backgroundColor = '#ff5d8f'}
                            onMouseLeave={(e) => {
                              e.target.style.backgroundColor = '#fce7f3';
                              e.target.style.color = '#ff5d8f';
                            }}
                          >
                            ✏️ Editar
                          </button>
                          <button
                            onClick={() => setMostrarConfirmacao(endereco.id)}
                            disabled={endereco.principal}
                            style={{
                              flex: 1,
                              backgroundColor: endereco.principal ? '#f3f4f6' : '#fee2e2',
                              color: endereco.principal ? '#9ca3af' : '#dc2626',
                              padding: '8px 16px',
                              borderRadius: '10px',
                              fontWeight: '600',
                              border: 'none',
                              cursor: endereco.principal ? 'not-allowed' : 'pointer',
                              fontSize: '0.85rem',
                              transition: 'all 0.2s',
                              opacity: endereco.principal ? 0.6 : 1
                            }}
                            title={endereco.principal ? 'Não é possível excluir o endereço principal' : 'Excluir endereço'}
                          >
                            🗑️ Excluir
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                
              </>
            )}
          </>
        )}

        {/* FORMULÁRIO DE EDIÇÃO/CRIAÇÃO */}
        {modoEdicao && (
          <form onSubmit={handleSalvar} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{
              fontSize: '1.2rem',
              fontWeight: '600',
              color: '#1f2937',
              margin: '0 0 8px 0'
            }}>
              {modoEdicao === 'novo' ? '🆕 Novo Endereço' : '✏️ Editar Endereço'}
            </h3>

            {/* CEP */}
            <div>
              <label style={labelStyle}>CEP *</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  name="cep"
                  value={formData.cep}
                  onChange={handleInputChange}
                  placeholder="00000-000"
                  maxLength="9"
                  required
                  style={inputStyle}
                />
                {buscandoCep && <span style={{ alignSelf: 'center' }}>🔍</span>}
              </div>
            </div>

            {/* Logradouro e Número */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
              <div>
                <label style={labelStyle}>Logradouro *</label>
                <input
                  type="text"
                  name="logradouro"
                  value={formData.logradouro}
                  onChange={handleInputChange}
                  placeholder="Rua, Avenida..."
                  required
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Número</label>
                <input
                  type="text"
                  name="numero"
                  value={formData.numero}
                  onChange={handleInputChange}
                  placeholder="S/N"
                  style={inputStyle}
                />
              </div>
            </div>

            {/* Complemento e Bairro */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={labelStyle}>Complemento</label>
                <input
                  type="text"
                  name="complemento"
                  value={formData.complemento}
                  onChange={handleInputChange}
                  placeholder="Apto, Bloco..."
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Bairro *</label>
                <input
                  type="text"
                  name="bairro"
                  value={formData.bairro}
                  onChange={handleInputChange}
                  required
                  style={inputStyle}
                />
              </div>
            </div>

            {/* Cidade e Estado */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
              <div>
                <label style={labelStyle}>Cidade *</label>
                <input
                  type="text"
                  name="cidade"
                  value={formData.cidade}
                  onChange={handleInputChange}
                  required
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Estado *</label>
                <input
                  type="text"
                  name="estado"
                  value={formData.estado}
                  onChange={handleInputChange}
                  required
                  maxLength="2"
                  placeholder="UF"
                  style={inputStyle}
                />
              </div>
            </div>

            {/* Ponto de Referência */}
            <div>
              <label style={labelStyle}>Ponto de Referência</label>
              <input
                type="text"
                name="ponto_referencial"
                value={formData.ponto_referencial}
                onChange={handleInputChange}
                placeholder="Próximo a..."
                style={inputStyle}
              />
            </div>

            {/* Rótulo */}
            <div>
              <label style={labelStyle}>Rótulo (ex: Casa, Trabalho)</label>
              <input
                type="text"
                name="rotulo"
                value={formData.rotulo}
                onChange={handleInputChange}
                placeholder="Casa, Trabalho, Apartamento..."
                style={inputStyle}
              />
            </div>

            {/* Endereço Principal */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <input
                type="checkbox"
                name="principal"
                checked={formData.principal}
                onChange={handleInputChange}
                style={{ width: '20px', height: '20px', accentColor: '#ff5d8f' }}
              />
              <label style={{ color: '#374151', fontWeight: '500', fontSize: '0.95rem' }}>
                ⭐ Definir como endereço principal
              </label>
            </div>

            {/* Botões de Ação */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
              <button
                type="button"
                onClick={resetarFormulario}
                style={{
                  flex: 1,
                  backgroundColor: '#f3f4f6',
                  color: '#374151',
                  padding: '12px 24px',
                  borderRadius: '12px',
                  fontWeight: '600',
                  border: '1px solid #e5e7eb',
                  cursor: 'pointer',
                  fontSize: '0.95rem',
                  transition: 'all 0.2s'
                }}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={salvando}
                style={{
                  flex: 1,
                  backgroundColor: salvando ? '#f9a8d4' : '#ff5d8f',
                  color: '#fff',
                  padding: '12px 24px',
                  borderRadius: '12px',
                  fontWeight: '600',
                  border: 'none',
                  cursor: salvando ? 'not-allowed' : 'pointer',
                  fontSize: '0.95rem',
                  boxShadow: '0 4px 6px rgba(255,93,143,0.3)',
                  transition: 'all 0.2s'
                }}
              >
                {salvando ? '⏳ Salvando...' : '💾 Salvar Endereço'}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO */}
      {mostrarConfirmacao && (
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
          zIndex: 1100,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '20px',
            padding: '28px',
            maxWidth: '400px',
            width: '100%',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🗑️</div>
            <h3 style={{ color: '#1f2937', margin: '0 0 8px 0' }}>
              Excluir endereço?
            </h3>
            <p style={{ color: '#6b7280', margin: '0 0 20px 0', fontSize: '0.9rem' }}>
              Tem certeza que deseja remover este endereço da sua lista?
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setMostrarConfirmacao(null)}
                disabled={excluindo}
                style={{
                  flex: 1,
                  backgroundColor: '#f3f4f6',
                  color: '#374151',
                  padding: '10px 20px',
                  borderRadius: '10px',
                  fontWeight: '600',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Cancelar
              </button>
              <button
                onClick={() => handleExcluir(mostrarConfirmacao)}
                disabled={excluindo}
                style={{
                  flex: 1,
                  backgroundColor: excluindo ? '#fca5a5' : '#dc2626',
                  color: '#fff',
                  padding: '10px 20px',
                  borderRadius: '10px',
                  fontWeight: '600',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                {excluindo ? 'Excluindo...' : 'Sim, excluir'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Animações */}
      <style>{`
        @keyframes flutuar {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
};

// Estilos reutilizáveis
const labelStyle = {
  fontSize: '0.85rem',
  color: '#6b7280',
  fontWeight: '500',
  display: 'block',
  marginBottom: '6px'
};

const inputStyle = {
  width: '100%',
  padding: '10px 14px',
  border: '2px solid #fce7f3',
  borderRadius: '12px',
  fontSize: '0.9rem',
  outline: 'none',
  transition: 'border-color 0.2s',
  color: '#1f2937',
  boxSizing: 'border-box'
};

export default ModalEnderecos;