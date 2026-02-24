import './App.css';
import { useState } from 'react';
import imgLogo from './assets/logo_grande.png';
import imgBolo from './assets/fotobolo.png';
import imgBaloes from './assets/baloes.png';
import imgBandeirolas from './assets/banderolas.png';

function App() {
  const [telaAtual, setTelaAtual] = useState('home');

  return (
    <div className={(telaAtual === 'dashboard' || telaAtual === 'pedidos') ? 'fundo-branco' : 'container-geral'}>
      
      {/* ========================================== */}
      {/* CABEÇALHO ANTIGO (Home e Cadastros) */}
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
            <button className="btn-criar" onClick={() => setTelaAtual('cadastro')}>Criar conta</button>
            <button className="btn-entrar" onClick={() => setTelaAtual('login')}>ENTRAR</button>
          </div>
        </header>
      )}

      {/* ========================================== */}
      {/* TELAS DESLOGADAS */}
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

      {telaAtual === 'cadastro' && (
        <main className="tela-cadastro">
           <img src={imgLogo} alt="Fundo" className="logo-fundo" />
           <div className="caixa-escolha">
             <h2>voce deseja ser?</h2>
             <div className="botoes-escolha">
               <button className="btn-vermelho" onClick={() => setTelaAtual('cadastro-vendedor')}>VENDEDOR</button>
               <button className="btn-vermelho" onClick={() => setTelaAtual('cadastro-usuario')}>USUARIO</button>
             </div>
           </div>
        </main>
      )}

      {telaAtual === 'cadastro-usuario' && (
        <main className="tela-cadastro">
          <img src={imgLogo} alt="Fundo" className="logo-fundo" />
          <div className="caixa-formulario">
            <h2 className="titulo-form">Usuário</h2>
            <form className="formulario">
              <div className="linha-form">
                <div className="grupo-input w-70"><label>Nome</label><input type="text" /></div>
                <div className="grupo-input w-30"><label>Telefone</label><input type="text" /></div>
              </div>
              <div className="linha-form">
                <div className="grupo-input w-100"><label>Email</label><input type="email" /></div>
              </div>
              <div className="linha-form">
                <div className="grupo-input w-50"><label>CPF</label><input type="text" /></div>
                <div className="grupo-input w-50"><label>Data de nascimento</label><input type="date" /></div>
              </div>
              <div className="linha-form">
                <div className="grupo-input w-50"><label>Senha</label><input type="password" /></div>
                <div className="grupo-input w-50"><label>Confirmar Senha</label><input type="password" /></div>
              </div>
              <div className="botoes-form">
                <button type="button" className="btn-cancelar" onClick={() => setTelaAtual('cadastro')}>CANCELAR</button>
                <button type="button" className="btn-salvar">SALVAR</button>
              </div>
            </form>
          </div>
        </main>
      )}

      {telaAtual === 'cadastro-vendedor' && (
        <main className="tela-cadastro">
          <img src={imgLogo} alt="Fundo" className="logo-fundo" />
          <div className="caixa-formulario">
            <h2 className="titulo-form">Vendedor</h2>
            <form className="formulario">
              <div className="linha-form">
                <div className="grupo-input w-70"><label>Nome da empresa</label><input type="text" /></div>
                <div className="grupo-input w-30"><label>Telefone</label><input type="text" /></div>
              </div>
              <div className="linha-form">
                <div className="grupo-input w-50"><label>Email</label><input type="email" /></div>
                <div className="grupo-input w-50"><label>Nome Responsável</label><input type="text" /></div>
              </div>
              <div className="linha-form">
                <div className="grupo-input w-50"><label>CNPJ</label><input type="text" /></div>
                <div className="grupo-input w-50"><label>CPF do responsável</label><input type="text" /></div>
              </div>
              <div className="linha-form">
                <div className="grupo-input w-50"><label>Senha</label><input type="password" /></div>
                <div className="grupo-input w-50"><label>Confirmar Senha</label><input type="password" /></div>
              </div>
              <div className="botoes-form">
                <button type="button" className="btn-cancelar" onClick={() => setTelaAtual('cadastro')}>CANCELAR</button>
                <button type="button" className="btn-salvar">SALVAR</button>
              </div>
            </form>
          </div>
        </main>
      )}

      {telaAtual === 'login' && (
        <main className="tela-cadastro">
          <img src={imgLogo} alt="Fundo" className="logo-fundo" />
          <div className="caixa-formulario" style={{ minHeight: 'auto' }}>
            <form className="formulario">
              <div className="linha-form">
                <div className="grupo-input w-70"><label>CPF/CNPJ</label><input type="text" /></div>
              </div>
              <div className="linha-form" style={{ alignItems: 'flex-end' }}>
                <div className="grupo-input w-70"><label>Senha</label><input type="password" /></div>
                <div style={{ flex: '30%', display: 'flex', justifyContent: 'flex-end' }}>
                  <button type="button" className="btn-salvar" style={{ padding: '12px 50px' }} onClick={() => setTelaAtual('dashboard')}>login</button>
                </div>
              </div>
            </form>
          </div>
        </main>
      )}

      {/* ========================================== */}
      {/* TELAS LOGADAS (Dashboard e Pedidos) */}
      {/* ========================================== */}
      {(telaAtual === 'dashboard' || telaAtual === 'pedidos') && (
        <div className="layout-dashboard">
          
          {/* Menu Lateral Esquerdo */}
          <aside className="menu-lateral">
            <img src={imgLogo} alt="Logo POP!" className="logo-lateral" onClick={() => setTelaAtual('home')} style={{ cursor: 'pointer' }}/>
            <nav className="nav-lateral">
              {/* Note que os botões mudam de tela quando clicados */}
              <button className={`item-menu ${telaAtual === 'dashboard' ? 'ativo' : ''}`} onClick={() => setTelaAtual('dashboard')}>🏠 Inicio</button>
              <button className={`item-menu ${telaAtual === 'pedidos' ? 'ativo' : ''}`} onClick={() => setTelaAtual('pedidos')}>🧾 Pedidos</button>
            </nav>
            <button className="item-menu menu-conta">👤 Minha conta</button>
          </aside>

          {/* Área Central */}
          <main className="conteudo-dashboard">
            <header className="header-dashboard">
              <div className="caixa-categorias">
                <a href="#">Doces</a>
                <a href="#">Sobremesa</a>
                <a href="#">Sorvetes</a>
              </div>
              {/* O carrinho agora leva para a tela de pedidos! */}
              <div className="icone-carrinho" onClick={() => setTelaAtual('pedidos')} title="Ver Sacolinha">🛒</div>
            </header>

            {/* --- CONTEÚDO DA DASHBOARD (INÍCIO) --- */}
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

            {/* --- CONTEÚDO DA TELA DE PEDIDOS (SACOLINHA) --- */}
            {telaAtual === 'pedidos' && (
              <section className="secao-sacola">
                <h3 className="titulo-sacola">Sua Sacolinha 🛒</h3>
                
                <div className="lista-sacola">
                  
                  {/* Item 1 da Sacola */}
                  <div className="card-sacola">
                    <img src={imgBolo} alt="Bolo de Pote" />
                    <p className="nome-produto-sacola">Bolo de pote ninho com nutella</p>
                    
                    <div className="controles-qtd">
                      <button>-</button>
                      <span>1</span>
                      <button>+</button>
                    </div>
                    
                    <div className="precos-sacola">
                      <span className="preco-antigo">R$19,90</span>
                      <span className="preco-novo">R$15,00</span>
                    </div>
                  </div>

                  {/* Item 2 da Sacola */}
                  <div className="card-sacola">
                    <img src={imgBolo} alt="Bolo de Pote" />
                    <p className="nome-produto-sacola">Bolo de pote ninho com morango</p>
                    
                    <div className="controles-qtd">
                      <button>-</button>
                      <span>1</span>
                      <button>+</button>
                    </div>
                    
                    <div className="precos-sacola">
                      <span className="preco-antigo">R$19,90</span>
                      <span className="preco-novo">R$15,00</span>
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