import React, { useState, useEffect } from 'react';

const PerfilUsuario = ({ onClose, setTelaAtual }) => {
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [mensagem, setMensagem] = useState({ tipo: '', texto: '' });
  const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  
  const [dadosUsuario, setDadosUsuario] = useState({
    nome: '',
    cpf: '',
    email: '',
    telefone: '',
    data_nascimento: ''
  });

  const [dadosOriginais, setDadosOriginais] = useState(null);

  // Buscar dados do usuário
  const carregarDados = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const usuarioId = localStorage.getItem('usuario_id');
      
      const response = await fetch(`http://localhost:5000/usuarios/${usuarioId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const dados = await response.json();
        setDadosUsuario({
          nome: dados.nome || '',
          cpf: dados.cpf || '',
          email: dados.email || '',
          telefone: dados.telefone || '',
          data_nascimento: dados.data_nascimento || ''
        });
        setDadosOriginais(dados);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setMensagem({ tipo: 'erro', texto: 'Erro ao carregar dados do perfil' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  // Formatar data para o input
  const formatarDataInput = (data) => {
    if (!data) return '';
    return data.split('T')[0];
  };

  // Formatar CPF
  const formatarCPF = (cpf) => {
    if (!cpf) return '';
    const numeros = cpf.replace(/\D/g, '');
    return numeros.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  // Formatar telefone
  const formatarTelefone = (telefone) => {
    if (!telefone) return '';
    const numeros = telefone.replace(/\D/g, '');
    if (numeros.length === 11) {
      return numeros.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    return numeros.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  };

  // Formatar data para exibição
  const formatarDataExibicao = (data) => {
    if (!data) return 'Não informada';
    const dataObj = new Date(data + 'T00:00:00');
    return dataObj.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDadosUsuario(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSalvar = async () => {
    setSalvando(true);
    setMensagem({ tipo: '', texto: '' });

    try {
      const token = localStorage.getItem('access_token');
      const usuarioId = localStorage.getItem('usuario_id');

      const dadosParaAtualizar = {};
      
      if (dadosUsuario.nome !== dadosOriginais.nome) {
        dadosParaAtualizar.nome = dadosUsuario.nome;
      }
      if (dadosUsuario.cpf !== dadosOriginais.cpf) {
        dadosParaAtualizar.cpf = dadosUsuario.cpf;
      }
      if (dadosUsuario.telefone !== dadosOriginais.telefone) {
        dadosParaAtualizar.telefone = dadosUsuario.telefone;
      }
      if (dadosUsuario.data_nascimento !== dadosOriginais.data_nascimento) {
        dadosParaAtualizar.data_nascimento = dadosUsuario.data_nascimento;
      }

      if (Object.keys(dadosParaAtualizar).length === 0) {
        setMensagem({ tipo: 'info', texto: 'Nenhuma alteração foi feita' });
        setModoEdicao(false);
        setSalvando(false);
        return;
      }

      const response = await fetch(`http://localhost:5000/usuarios/${usuarioId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(dadosParaAtualizar)
      });

      if (response.ok) {
        const dadosAtualizados = await response.json();
        setDadosUsuario({
          nome: dadosAtualizados.nome || '',
          cpf: dadosAtualizados.cpf || '',
          email: dadosAtualizados.email || '',
          telefone: dadosAtualizados.telefone || '',
          data_nascimento: dadosAtualizados.data_nascimento || ''
        });
        setDadosOriginais(dadosAtualizados);
        setMensagem({ tipo: 'sucesso', texto: 'Perfil atualizado com sucesso!' });
        setModoEdicao(false);
        
        if (dadosAtualizados.nome) {
          const usuarioStorage = JSON.parse(localStorage.getItem('usuario') || '{}');
          usuarioStorage.nome = dadosAtualizados.nome;
          localStorage.setItem('usuario', JSON.stringify(usuarioStorage));
        }
      } else {
        const erro = await response.json();
        setMensagem({ tipo: 'erro', texto: erro.error || 'Erro ao atualizar perfil' });
      }
    } catch (error) {
      console.error('Erro ao salvar:', error);
      setMensagem({ tipo: 'erro', texto: 'Erro ao salvar alterações' });
    } finally {
      setSalvando(false);
    }
  };

  const handleExcluirConta = async () => {
    setExcluindo(true);
    try {
      const token = localStorage.getItem('access_token');
      const usuarioId = localStorage.getItem('usuario_id');

      const response = await fetch(`http://localhost:5000/usuarios/${usuarioId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        // Limpa dados do localStorage
        localStorage.removeItem('access_token');
        localStorage.removeItem('usuario_id');
        localStorage.removeItem('usuario');
        
        // Redireciona para a tela de login
        if (setTelaAtual) {
          setTelaAtual('login');
        }
        if (onClose) {
          onClose();
        }
      } else {
        const erro = await response.json();
        setMensagem({ tipo: 'erro', texto: erro.error || 'Erro ao excluir conta' });
        setMostrarConfirmacao(false);
      }
    } catch (error) {
      console.error('Erro ao excluir:', error);
      setMensagem({ tipo: 'erro', texto: 'Erro ao excluir conta. Tente novamente.' });
      setMostrarConfirmacao(false);
    } finally {
      setExcluindo(false);
    }
  };

  const handleCancelar = () => {
    setDadosUsuario({
      nome: dadosOriginais.nome || '',
      cpf: dadosOriginais.cpf || '',
      email: dadosOriginais.email || '',
      telefone: dadosOriginais.telefone || '',
      data_nascimento: dadosOriginais.data_nascimento || ''
    });
    setModoEdicao(false);
    setMensagem({ tipo: '', texto: '' });
  };

  return (
    <>
      <div style={{
        backgroundColor: '#fdf2f5',
        fontFamily: 'sans-serif',
        padding: '24px',
        maxWidth: '600px',
        margin: '0 auto',
        position: 'relative'
      }}>
        
        {/* CABEÇALHO */}
        <header style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '32px',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div>
            <h1 style={{
              fontSize: '2rem',
              fontWeight: 'bold',
              color: '#1f2937',
              margin: 0
            }}>
              Meu Perfil <span style={{ color: '#ff5d8f' }}>POP!</span>
            </h1>
            <p style={{ color: '#6b7280', margin: '4px 0 0 0', fontSize: '0.95rem' }}>
              {modoEdicao ? 'Edite suas informações pessoais' : 'Visualize seus dados cadastrais'}
            </p>
          </div>
          
          {/* BOTÕES DE AÇÃO */}
          <div style={{ display: 'flex', gap: '8px' }}>
            {!modoEdicao ? (
              <button
                onClick={() => setModoEdicao(true)}
                style={{
                  backgroundColor: '#ff5d8f',
                  color: '#fff',
                  padding: '10px 24px',
                  borderRadius: '12px',
                  fontWeight: '600',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.95rem',
                  boxShadow: '0 2px 4px rgba(255,93,143,0.3)',
                  transition: 'all 0.2s'
                }}
              >
                ✏️ Editar Perfil
              </button>
            ) : (
              <>
                <button
                  onClick={handleCancelar}
                  style={{
                    backgroundColor: '#f3f4f6',
                    color: '#374151',
                    padding: '10px 24px',
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
                  onClick={handleSalvar}
                  disabled={salvando}
                  style={{
                    backgroundColor: salvando ? '#f9a8d4' : '#ff5d8f',
                    color: '#fff',
                    padding: '10px 24px',
                    borderRadius: '12px',
                    fontWeight: '600',
                    border: 'none',
                    cursor: salvando ? 'not-allowed' : 'pointer',
                    fontSize: '0.95rem',
                    boxShadow: '0 2px 4px rgba(255,93,143,0.3)',
                    transition: 'all 0.2s'
                  }}
                >
                  {salvando ? '⏳ Salvando...' : '💾 Salvar'}
                </button>
              </>
            )}
          </div>
        </header>

        {/* MENSAGEM DE FEEDBACK */}
        {mensagem.texto && (
          <div style={{
            backgroundColor: mensagem.tipo === 'sucesso' ? '#d1fae5' : 
                            mensagem.tipo === 'erro' ? '#fee2e2' : '#dbeafe',
            color: mensagem.tipo === 'sucesso' ? '#065f46' : 
                   mensagem.tipo === 'erro' ? '#991b1b' : '#1e40af',
            padding: '16px',
            borderRadius: '12px',
            marginBottom: '24px',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span>
              {mensagem.tipo === 'sucesso' ? '✅' : 
               mensagem.tipo === 'erro' ? '❌' : 'ℹ️'}
            </span>
            {mensagem.texto}
          </div>
        )}

        {loading ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '60px 20px',
            color: '#ff5d8f',
            fontSize: '1.2rem'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🐜</div>
            Carregando perfil...
          </div>
        ) : (
          <>
            {/* CARDS DE INFORMAÇÕES */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '20px'
            }}>
              
              {/* NOME */}
              <div style={{
                backgroundColor: '#fff',
                padding: '24px',
                borderRadius: '24px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                border: '1px solid #fce7f3',
                display: 'flex',
                gap: '16px',
                alignItems: 'flex-start'
              }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  backgroundColor: '#fce7f3',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  flexShrink: 0
                }}>
                  👤
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ 
                    fontSize: '0.875rem', 
                    color: '#6b7280', 
                    fontWeight: '500',
                    display: 'block',
                    marginBottom: '8px'
                  }}>
                    Nome completo
                  </label>
                  {modoEdicao ? (
                    <input
                      type="text"
                      name="nome"
                      value={dadosUsuario.nome}
                      onChange={handleInputChange}
                      placeholder="Seu nome completo"
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '2px solid #fce7f3',
                        borderRadius: '12px',
                        fontSize: '1rem',
                        outline: 'none',
                        transition: 'border-color 0.2s',
                        color: '#1f2937'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#ff5d8f'}
                      onBlur={(e) => e.target.style.borderColor = '#fce7f3'}
                    />
                  ) : (
                    <p style={{ 
                      fontSize: '1.125rem', 
                      fontWeight: '600',
                      color: dadosUsuario.nome ? '#1f2937' : '#9ca3af',
                      margin: 0
                    }}>
                      {dadosUsuario.nome || 'Não informado'}
                    </p>
                  )}
                </div>
              </div>

              {/* EMAIL */}
              <div style={{
                backgroundColor: '#fff',
                padding: '24px',
                borderRadius: '24px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                border: '1px solid #fce7f3',
                display: 'flex',
                gap: '16px',
                alignItems: 'flex-start'
              }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  backgroundColor: '#dbeafe',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  flexShrink: 0
                }}>
                  📧
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ 
                    fontSize: '0.875rem', 
                    color: '#6b7280', 
                    fontWeight: '500',
                    display: 'block',
                    marginBottom: '8px'
                  }}>
                    E-mail
                  </label>
                  <p style={{ 
                    fontSize: '1.125rem', 
                    fontWeight: '600',
                    color: '#1f2937',
                    margin: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    flexWrap: 'wrap'
                  }}>
                    {dadosUsuario.email}
                    <span style={{
                      fontSize: '0.75rem',
                      backgroundColor: '#d1fae5',
                      color: '#065f46',
                      padding: '2px 8px',
                      borderRadius: '9999px',
                      fontWeight: 'bold'
                    }}>
                      ✓ Verificado
                    </span>
                  </p>
                  <p style={{ fontSize: '0.75rem', color: '#9ca3af', margin: '4px 0 0 0' }}>
                    O e-mail não pode ser alterado
                  </p>
                </div>
              </div>

              {/* CPF */}
              <div style={{
                backgroundColor: '#fff',
                padding: '24px',
                borderRadius: '24px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                border: '1px solid #fce7f3',
                display: 'flex',
                gap: '16px',
                alignItems: 'flex-start'
              }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  backgroundColor: '#ffedd5',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  flexShrink: 0
                }}>
                  🪪
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ 
                    fontSize: '0.875rem', 
                    color: '#6b7280', 
                    fontWeight: '500',
                    display: 'block',
                    marginBottom: '8px'
                  }}>
                    CPF
                  </label>
                  {modoEdicao ? (
                    <input
                      type="text"
                      name="cpf"
                      value={dadosUsuario.cpf}
                      onChange={handleInputChange}
                      placeholder="000.000.000-00"
                      maxLength="14"
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '2px solid #fce7f3',
                        borderRadius: '12px',
                        fontSize: '1rem',
                        outline: 'none',
                        transition: 'border-color 0.2s',
                        color: '#1f2937'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#ff5d8f'}
                      onBlur={(e) => e.target.style.borderColor = '#fce7f3'}
                    />
                  ) : (
                    <p style={{ 
                      fontSize: '1.125rem', 
                      fontWeight: '600',
                      color: dadosUsuario.cpf ? '#1f2937' : '#9ca3af',
                      margin: 0
                    }}>
                      {dadosUsuario.cpf ? formatarCPF(dadosUsuario.cpf) : 'Não informado'}
                    </p>
                  )}
                </div>
              </div>

              {/* TELEFONE */}
              <div style={{
                backgroundColor: '#fff',
                padding: '24px',
                borderRadius: '24px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                border: '1px solid #fce7f3',
                display: 'flex',
                gap: '16px',
                alignItems: 'flex-start'
              }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  backgroundColor: '#d1fae5',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  flexShrink: 0
                }}>
                  📱
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ 
                    fontSize: '0.875rem', 
                    color: '#6b7280', 
                    fontWeight: '500',
                    display: 'block',
                    marginBottom: '8px'
                  }}>
                    Telefone
                  </label>
                  {modoEdicao ? (
                    <input
                      type="text"
                      name="telefone"
                      value={dadosUsuario.telefone}
                      onChange={handleInputChange}
                      placeholder="(00) 00000-0000"
                      maxLength="15"
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '2px solid #fce7f3',
                        borderRadius: '12px',
                        fontSize: '1rem',
                        outline: 'none',
                        transition: 'border-color 0.2s',
                        color: '#1f2937'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#ff5d8f'}
                      onBlur={(e) => e.target.style.borderColor = '#fce7f3'}
                    />
                  ) : (
                    <p style={{ 
                      fontSize: '1.125rem', 
                      fontWeight: '600',
                      color: dadosUsuario.telefone ? '#1f2937' : '#9ca3af',
                      margin: 0
                    }}>
                      {dadosUsuario.telefone ? formatarTelefone(dadosUsuario.telefone) : 'Não informado'}
                    </p>
                  )}
                </div>
              </div>

              {/* DATA DE NASCIMENTO */}
              <div style={{
                backgroundColor: '#fff',
                padding: '24px',
                borderRadius: '24px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                border: '1px solid #fce7f3',
                display: 'flex',
                gap: '16px',
                alignItems: 'flex-start'
              }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  backgroundColor: '#f3e8ff',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  flexShrink: 0
                }}>
                  🎂
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ 
                    fontSize: '0.875rem', 
                    color: '#6b7280', 
                    fontWeight: '500',
                    display: 'block',
                    marginBottom: '8px'
                  }}>
                    Data de nascimento
                  </label>
                  {modoEdicao ? (
                    <input
                      type="date"
                      name="data_nascimento"
                      value={formatarDataInput(dadosUsuario.data_nascimento)}
                      onChange={handleInputChange}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '2px solid #fce7f3',
                        borderRadius: '12px',
                        fontSize: '1rem',
                        outline: 'none',
                        transition: 'border-color 0.2s',
                        color: '#1f2937',
                        cursor: 'pointer'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#ff5d8f'}
                      onBlur={(e) => e.target.style.borderColor = '#fce7f3'}
                    />
                  ) : (
                    <p style={{ 
                      fontSize: '1.125rem', 
                      fontWeight: '600',
                      color: dadosUsuario.data_nascimento ? '#1f2937' : '#9ca3af',
                      margin: 0
                    }}>
                      {formatarDataExibicao(dadosUsuario.data_nascimento)}
                    </p>
                  )}
                </div>
              </div>

            </div>

            {/* BOTÕES DE AÇÃO INFERIORES */}
            <div style={{
              display: 'flex',
              gap: '12px',
              marginTop: '32px',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap'
            }}>
              {/* BOTÃO EXCLUIR CONTA */}
              {!modoEdicao && (
                <button
                  onClick={() => setMostrarConfirmacao(true)}
                  style={{
                    backgroundColor: '#fff',
                    color: '#dc2626',
                    padding: '12px 24px',
                    borderRadius: '16px',
                    fontWeight: '600',
                    border: '2px solid #fecaca',
                    cursor: 'pointer',
                    fontSize: '0.95rem',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#fef2f2';
                    e.target.style.borderColor = '#dc2626';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#fff';
                    e.target.style.borderColor = '#fecaca';
                  }}
                >
                  🗑️ Excluir minha conta
                </button>
              )}

              {/* BOTÕES DE EDIÇÃO */}
              {modoEdicao && (
                <div style={{ display: 'flex', gap: '12px', marginLeft: 'auto' }}>
                  <button
                    onClick={handleCancelar}
                    style={{
                      backgroundColor: '#f3f4f6',
                      color: '#374151',
                      padding: '12px 32px',
                      borderRadius: '16px',
                      fontWeight: '600',
                      border: '1px solid #e5e7eb',
                      cursor: 'pointer',
                      fontSize: '1rem',
                      transition: 'all 0.2s'
                    }}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSalvar}
                    disabled={salvando}
                    style={{
                      backgroundColor: salvando ? '#f9a8d4' : '#ff5d8f',
                      color: '#fff',
                      padding: '12px 32px',
                      borderRadius: '16px',
                      fontWeight: '600',
                      border: 'none',
                      cursor: salvando ? 'not-allowed' : 'pointer',
                      fontSize: '1rem',
                      boxShadow: '0 4px 6px rgba(255,93,143,0.3)',
                      transition: 'all 0.2s'
                    }}
                  >
                    {salvando ? '⏳ Salvando alterações...' : '💾 Salvar alterações'}
                  </button>
                </div>
              )}
            </div>
          </>
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
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '24px',
            padding: '32px',
            maxWidth: '500px',
            width: '100%',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            animation: 'slideDown 0.3s ease-out'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{
                width: '80px',
                height: '80px',
                backgroundColor: '#fee2e2',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto',
                fontSize: '2.5rem'
              }}>
                ⚠️
              </div>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: '#1f2937',
                margin: '0 0 8px 0'
              }}>
                Excluir sua conta?
              </h2>
              <p style={{
                color: '#6b7280',
                margin: 0,
                lineHeight: '1.6',
                fontSize: '0.95rem'
              }}>
                Esta ação é <strong style={{ color: '#dc2626' }}>irreversível</strong>! 
                Todos os seus dados serão permanentemente removidos, incluindo:
              </p>
              <ul style={{
                textAlign: 'left',
                color: '#6b7280',
                margin: '16px 0 0 0',
                paddingLeft: '24px',
                fontSize: '0.9rem'
              }}>
                <li>Dados do perfil</li>
                <li>Histórico de pedidos</li>
                <li>Endereços salvos</li>
                <li>Preferências e configurações</li>
              </ul>
            </div>

            <div style={{
              backgroundColor: '#fff7ed',
              border: '1px solid #fed7aa',
              borderRadius: '12px',
              padding: '12px 16px',
              marginBottom: '24px',
              display: 'flex',
              gap: '12px',
              alignItems: 'flex-start'
            }}>
              <span style={{ fontSize: '1.25rem' }}>💡</span>
              <p style={{
                margin: 0,
                fontSize: '0.875rem',
                color: '#9a3412',
                lineHeight: '1.5'
              }}>
                Você pode simplesmente parar de usar sua conta sem excluí-la. 
                Seus dados ficarão seguros para quando quiser voltar.
              </p>
            </div>

            <div style={{
              display: 'flex',
              gap: '12px'
            }}>
              <button
                onClick={() => setMostrarConfirmacao(false)}
                disabled={excluindo}
                style={{
                  flex: 1,
                  backgroundColor: '#f3f4f6',
                  color: '#374151',
                  padding: '14px 24px',
                  borderRadius: '12px',
                  fontWeight: '600',
                  border: '1px solid #e5e7eb',
                  cursor: excluindo ? 'not-allowed' : 'pointer',
                  fontSize: '1rem',
                  transition: 'all 0.2s'
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleExcluirConta}
                disabled={excluindo}
                style={{
                  flex: 1,
                  backgroundColor: excluindo ? '#fca5a5' : '#dc2626',
                  color: '#fff',
                  padding: '14px 24px',
                  borderRadius: '12px',
                  fontWeight: '600',
                  border: 'none',
                  cursor: excluindo ? 'not-allowed' : 'pointer',
                  fontSize: '1rem',
                  transition: 'all 0.2s',
                  boxShadow: '0 4px 6px rgba(220, 38, 38, 0.2)'
                }}
              >
                {excluindo ? '⏳ Excluindo...' : '🗑️ Sim, excluir minha conta'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Estilo para animação */}
      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
};

export default PerfilUsuario;