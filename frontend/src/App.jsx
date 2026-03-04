import './App.css';
import { useState } from 'react';
import imgLogo from './assets/logo_grande.png';
import imgBolo from './assets/fotobolo.png';
import imgBaloes from './assets/baloes.png';
import imgBandeirolas from './assets/banderolas.png';

function App() {
  const [telaAtual, setTelaAtual] = useState('home');
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [emailLogin, setEmailLogin] = useState('');
  const [tokenDigitado, setTokenDigitado] = useState(['', '', '', '', '', '']);

  const salvarUsuario = async () => {
    try {
      const response = await fetch('http://localhost:5000/usuarios/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          nome,
          cpf,
          email,
          telefone,
          data_nascimento: dataNascimento,
          endereco: ""
        })
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Erro ao cadastrar");
        return;
      }

      alert("Usuário cadastrado com sucesso!");
      setTelaAtual('login');

    } catch (error) {
      console.error(error);
      alert("Erro ao conectar com servidor");
    }
  };

  const solicitarToken = async () => {
    try {
      const response = await fetch('http://localhost:5000/usuarios/login/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: emailLogin })
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message);
        return;
      }

      alert("Token enviado para seu email!");
      setTokenDigitado(['', '', '', '', '', '']);
      setTelaAtual('token');

    } catch (error) {
      console.error(error);
      alert("Erro ao conectar com servidor");
    }
  };

  const verificarToken = async () => {

    if (tokenDigitado.join('').length !== 6) {
      alert("Digite o token completo de 6 dígitos");
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/usuarios/login/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: emailLogin,
          token: tokenDigitado.join('')
        })
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message);
        return;
      }

      localStorage.setItem('access_token', data.access_token);

      alert("Login realizado com sucesso!");
      setTelaAtual('dashboard');

    } catch (error) {
      console.error(error);
      alert("Erro ao conectar com servidor");
    }
  };

  const handleTokenChange = (value, index) => {
    if (!/^[0-9]?$/.test(value)) return; // só permite número

    const novoToken = [...tokenDigitado];
    novoToken[index] = value;
    setTokenDigitado(novoToken);

    if (value && index < 5) {
      document.getElementById(`token-${index + 1}`).focus();
    }
  };

  return (
    <div className={(telaAtual === 'dashboard' || telaAtual === 'pedidos') ? 'fundo-branco' : 'container-geral'}>
      
      {/* ========================================== */}
      {/* CABEÇALHO (Home, Cadastros, Login, Token) */}
      {/* ========================================== */}
      {(telaAtual !== 'dashboard' && telaAtual !== 'pedidos') && (
        <header className="cabecalho">
          <img src={imgLogo} alt="Logo POP!" className="logo-img" onClick={() => setTelaAtual('home')} style={{ cursor: 'pointer' }} />
          <nav className="menu">
            <a href="#">Doces</a>
            <a href="#">Sobremesa</a>
            <a href="#">Sorvetes</a>
          </nav>
          <div className="botoes-acesso">
            {/* PASSO 1: Botão vai direto para o cadastro de usuário */}
            <button className="btn-criar" onClick={() => setTelaAtual('cadastro-usuario')}>Criar conta</button>
            <button className="btn-entrar" onClick={() => setTelaAtual('login')}>ENTRAR</button>
          </div>
        </header>
      )}

      {/* ========================================== */}
      {/* HOME ORIGINAL */}
      {/* ========================================== */}
      {telaAtual === 'home' && (
        <>
          <main className="conteudo-principal">
            <h2 className="titulo-central">Todas suas sobremesas favoritas você encontra aqui</h2>
            <div className="area-cartoes">
              <div className="cartao cartao-lojas">
                <div className="conteudo-texto">
                  <h3>Lojas</h3>
                  <button className="btn-opcoes">Ver Opções &gt;</button>
                </div>
                <img src={imgBolo} alt="Bolo maravilhoso" className="img-bolo" />
              </div>
              <div className="cartao cartao-festa">
                <img src={imgBandeirolas} alt="Bandeirolas" className="img-bandeirolas" />
                <h3 className="texto-festa">Organizando uma festa ?</h3>
                <button className="btn-orcamento">Faça seu orçamento<br/>com lojas próximas aqui</button>
                <img src={imgBaloes} alt="Balões" className="img-baloes" />
              </div>
            </div>
          </main>
          <footer className="area-pesquisa">
            <div className="caixa-pesquisa">
              <input type="text" placeholder="Qual docinho você quer hoje ?" />
              <button className="btn-pesquisar">Pesquisar</button>
            </div>
          </footer>
        </>
      )}

      {/* ========================================== */}
      {/* CADASTRO DE USUÁRIO (Sem Senha) */}
      {/* ========================================== */}
      {telaAtual === 'cadastro-usuario' && (
        <main className="tela-cadastro">
          <img src={imgLogo} alt="Fundo" className="logo-fundo" />
          <div className="caixa-formulario">
            <h2 className="titulo-form">Usuário</h2>
            <form className="formulario">
              <div className="linha-form">
                <div className="grupo-input w-70"><label>Nome <span style={{ color: "red" }}>*</span></label><input type="text" value={nome} onChange={(e) => setNome(e.target.value)} required /></div>
                <div className="grupo-input w-30"><label>Telefone <span style={{ color: "red" }}>*</span></label><input type="text" value={telefone} onChange={(e) => setTelefone(e.target.value)} required /></div>
              </div>
              <div className="linha-form">
                <div className="grupo-input w-100"><label>Email <span style={{ color: "red" }}>*</span></label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
              </div>
              <div className="linha-form">
                <div className="grupo-input w-50"><label>CPF <span style={{ color: "red" }}>*</span></label><input type="text" value={cpf} onChange={(e) => setCpf(e.target.value)} required /></div>
                <div className="grupo-input w-50"><label>Data de nascimento <span style={{ color: "red" }}>*</span></label><input type="date" value={dataNascimento} onChange={(e) => setDataNascimento(e.target.value)} required/></div>
              </div>
              
              {/* PASSO 2: Linha de senhas foi removida daqui! */}
              
              <div className="botoes-form">
                {/* Agora o cancelar volta para a home, já que apagamos a tela intermediária */}
                <button type="button" className="btn-cancelar" onClick={() => setTelaAtual('home')}>CANCELAR</button>
                <button type="button" className="btn-salvar" onClick={salvarUsuario}>SALVAR</button>
              </div>
            </form>
          </div>
        </main>
      )}

      {/* ========================================== */}
      {/* TELA DE LOGIN (Sem senha) */}
      {/* ========================================== */}
      {telaAtual === 'login' && (
        <main className="tela-cadastro">
          <img src={imgLogo} alt="Fundo" className="logo-fundo" />
          <div className="caixa-formulario" style={{ minHeight: 'auto' }}>
            <form className="formulario">
              <div className="linha-form" style={{ alignItems: 'flex-end' }}>
                <div className="grupo-input w-70">
                  <label>Email</label>
                  <input type="text" value={emailLogin} onChange={(e) => setEmailLogin(e.target.value)}/>
                </div>
                <div style={{ flex: '30%', display: 'flex', justifyContent: 'flex-end' }}>
                  {/* Clicar em continuar leva para a tela de TOKEN */}
                  <button type="button" className="btn-salvar" style={{ padding: '12px 40px' }}   onClick={solicitarToken}>
                    Continuar
                  </button>
                </div>
              </div>
            </form>
          </div>
        </main>
      )}

      {/* ========================================== */}
      {/* PASSO 3: NOVA TELA DE TOKEN */}
      {/* ========================================== */}
      {telaAtual === 'token' && (
        <main className="tela-cadastro">
          <img src={imgLogo} alt="Fundo" className="logo-fundo" />
          <div className="caixa-formulario" style={{ minHeight: 'auto', padding: '50px' }}>
            
            <h2 className="titulo-form" style={{ textAlign: 'center', marginBottom: '30px', fontSize: '1.2rem' }}>
              Token de Autenticação
            </h2>
            
            <div className="linha-token">
              {tokenDigitado.map((digit, index) => (
                <input
                  key={index}
                  id={`token-${index}`}
                  type="text"
                  maxLength="1"
                  className="input-token"
                  value={digit}
                  onChange={(e) => handleTokenChange(e.target.value, index)}
                />
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '40px' }}>
              <button type="button" className="btn-salvar" style={{ padding: '12px 50px' }} onClick={verificarToken}>
                Finalizar
              </button>
            </div>

          </div>
        </main>
      )}

      {/* ========================================== */}
      {/* TELAS LOGADAS (Dashboard e Pedidos continuam iguais) */}
      {/* ========================================== */}
      {(telaAtual === 'dashboard' || telaAtual === 'pedidos') && (
        <div className="layout-dashboard">
          
          <aside className="menu-lateral">
            <img src={imgLogo} alt="Logo POP!" className="logo-lateral" onClick={() => setTelaAtual('home')} style={{ cursor: 'pointer' }}/>
            <nav className="nav-lateral">
              <button className={`item-menu ${telaAtual === 'dashboard' ? 'ativo' : ''}`} onClick={() => setTelaAtual('dashboard')}>🏠 Inicio</button>
              <button className={`item-menu ${telaAtual === 'pedidos' ? 'ativo' : ''}`} onClick={() => setTelaAtual('pedidos')}>🧾 Pedidos</button>
            </nav>
            <button className="item-menu menu-conta">👤 Minha conta</button>
          </aside>

          <main className="conteudo-dashboard">
            <header className="header-dashboard">
              <div className="caixa-categorias">
                <a href="#">Doces</a>
                <a href="#">Sobremesa</a>
                <a href="#">Sorvetes</a>
              </div>
              <div className="icone-carrinho" onClick={() => setTelaAtual('pedidos')} title="Ver Sacolinha">🛒</div>
            </header>

            {telaAtual === 'dashboard' && (
              <>
                <section className="secao-ofertas">
                  <h3 className="titulo-secao">Ofertas especiais no precinho 😋</h3>
                  <div className="caixa-carrossel">
                    <div className="area-cards-ofertas">
                      <div className="card-produto">
                        <img src={imgBolo} alt="Bolo" />
                        <p>Bolo de pote ninho com morango</p>
                        <span className="preco-antigo">R$19,90</span>
                        <span className="preco-novo">R$15,00</span>
                      </div>
                      <div className="card-produto">
                        <img src={imgBolo} alt="Bolo" />
                        <p>Bolo de pote ninho com morango</p>
                        <span className="preco-antigo">R$19,90</span>
                        <span className="preco-novo">R$15,00</span>
                      </div>
                      <div className="card-produto">
                        <img src={imgBolo} alt="Bolo" />
                        <p>Bolo de pote ninho com morango</p>
                        <span className="preco-antigo">R$19,90</span>
                        <span className="preco-novo">R$15,00</span>
                      </div>
                    </div>
                    <button className="btn-seta-carrossel">&gt;</button>
                  </div>
                </section>
                <section className="secao-lojas-dash">
                  <h3 className="titulo-secao" style={{ color: 'black', textAlign: 'left' }}>Lojas</h3>
                  <p>Aqui entrarão os cards redondos das lojas...</p>
                </section>
              </>
            )}

            {telaAtual === 'pedidos' && (
              <section className="secao-sacola">
                <h3 className="titulo-sacola">Sua Sacolinha 🛒</h3>
                <div className="lista-sacola">
                  <div className="card-sacola">
                    <img src={imgBolo} alt="Bolo de Pote" />
                    <p className="nome-produto-sacola">Bolo de pote ninho com nutella</p>
                    <div className="controles-qtd">
                      <button>-</button><span>1</span><button>+</button>
                    </div>
                    <div className="precos-sacola">
                      <span className="preco-antigo">R$19,90</span><span className="preco-novo">R$15,00</span>
                    </div>
                  </div>
                  <div className="card-sacola">
                    <img src={imgBolo} alt="Bolo de Pote" />
                    <p className="nome-produto-sacola">Bolo de pote ninho com morango</p>
                    <div className="controles-qtd">
                      <button>-</button><span>1</span><button>+</button>
                    </div>
                    <div className="precos-sacola">
                      <span className="preco-antigo">R$19,90</span><span className="preco-novo">R$15,00</span>
                    </div>
                  </div>
                </div>
              </section>
            )}

          </main>
        </div>
      )}

    </div>
  );
}

export default App;