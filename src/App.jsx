import './App.css';
import { useState } from 'react';

// --- SUAS IMAGENS ---
import imgLogo from './assets/logo_grande.png';
import imgBolo from './assets/fotobolo.png';
import imgBaloes from './assets/baloes.png';
import imgBandeirolas from './assets/banderolas.png';

import imgBolinhoPequeno from './assets/bolinhopequeno-removebg-preview.png';
import imgLogo1 from './assets/Logo_1.png';
import imgRedesSociais from './assets/RedesSociais-removebg-preview.png';
import imgSorvete from './assets/Sorvete-removebg-preview.png';
import imgAvatar75 from './assets/width_75-removebg-preview.png';
import imgAvatar150 from './assets/width_150-removebg-preview.png';
import imgAvatar151 from './assets/width_151-removebg-preview.png';

// --- SUAS NOVAS IMAGENS ---
import imgBoloChocolate from './assets/bolodechocolate.png';
import imgMenina1 from './assets/iconeMenina1.jpg';
import imgMenina2 from './assets/iconeMenina2.jpg';
import imgMenina3 from './assets/iconeMenina3.jpg';
import imgMenina4 from './assets/iconeMenina4.jpg';

function App() {
  const [telaAtual, setTelaAtual] = useState('home');

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
            <button className="btn-criar" onClick={() => setTelaAtual('cadastro-usuario')}>Criar conta</button>
            <button className="btn-entrar" onClick={() => setTelaAtual('login')}>ENTRAR</button>
          </div>
        </header>
      )}

{/* ========================================== */}
      {/* HOME (AGORA COM SCROLL E NOVAS SEÇÕES E IMAGENS) */}
      {/* ========================================== */}
      {telaAtual === 'home' && (
        <div className="home-com-scroll">
          
          {/* --- PARTE SUPERIOR (FUNDO ROSA) --- */}
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
          
          <div className="area-pesquisa">
            <div className="caixa-pesquisa">
              <input type="text" placeholder="Qual docinho você quer hoje ?" />
              <button className="btn-pesquisar">Pesquisar</button>
            </div>
          </div>

          {/* ========================================== */}
          {/* PARTE INFERIOR (FUNDO BRANCO) */}
          {/* ========================================== */}
          <div className="fundo-inferior-branco">
            
            <section className="secao-nova secao-docerias">
              <h3 className="titulo-esquerda">As Melhores Docerias</h3>
              <div className="lista-docerias">
                <div className="card-doceria">
                  <img src={imgAvatar75} alt="Tudo de bom doces" className="foto-doceria circular" />
                  <div className="info-doceria">
                    <h4>Tudo de bom doces</h4>
                    <p>Doces de Festa</p>
                  </div>
                  <span className="icone-check">✔️</span>
                </div>
                <div className="card-doceria">
                  <img src={imgAvatar150} alt="Lupa Confeitaria" className="foto-doceria circular" />
                  <div className="info-doceria">
                    <h4>Lupa Confeitaria</h4>
                    <p>Bolos e Tortas</p>
                  </div>
                  <span className="icone-check">✔️</span>
                </div>
                <div className="card-doceria">
                  <img src={imgAvatar151} alt="Doce Encanto" className="foto-doceria circular" />
                  <div className="info-doceria">
                    <h4>Doce Encanto</h4>
                    <p>Doces de Festa</p>
                  </div>
                  <span className="icone-check">✔️</span>
                </div>
                <div className="card-doceria">
                  <img src={imgLogo1} alt="Cia & Recheios" className="foto-doceria circular" />
                  <div className="info-doceria">
                    <h4>Cia & Recheios</h4>
                    <p>Bolos e Tortas</p>
                  </div>
                  <span className="icone-check">✔️</span>
                </div>
              </div>
            </section>

            <section className="secao-nova secao-banners">
              <div className="banner banner-rosa-claro">
                <div className="texto-banner">
                  <h2>DOCES</h2>
                  <p>a partir de</p>
                  <h3>R$10,00</h3>
                </div>
                <img src={imgBolo} alt="Bolo" className="img-banner-direita" />
              </div>
              <div className="banner banner-rosa-escuro">
                <div className="texto-banner centralizado">
                  <h2>CUPONS</h2>
                  <p>de até</p>
                  <h3 className="texto-gigante">30%</h3>
                </div>
              </div>
              <div className="banner banner-rosa-claro horizontal">
                <img src={imgBoloChocolate} alt="Bolo de Chocolate" className="img-banner-esquerda" />
                <div className="texto-banner text-right">
                  <p>super ⭐⭐⭐⭐⭐</p>
                  <h3 style={{color: '#d94141'}}>Restaurantes</h3>
                </div>
              </div>
            </section>

            <hr className="linha-divisoria" />

            {/* AQUI ESTÁ A SEÇÃO DAS FORMIGUINHAS COM AS BORDAS ADICIONADAS */}
            <section className="secao-nova secao-formiguinha">
              <div className="texto-formiguinha">
                <h2>Você é<br/>uma<br/>formiguinha<br/>também?</h2>
                <p>Clique no link abaixo<br/>e descubra mais como é trabalhar com a gente</p>
                <button className="btn-vermelho btn-saiba-mais">SAIBA MAIS</button>
              </div>
              <div className="grid-formiguinha">
                
                {/* Menina 1 - Com borda GROSSA na cor do bolinho */}
                <div className="quadrado-grid" style={{ overflow: 'hidden', border: '6px solid #ffcafa', borderRadius: '16px' }}>
                  <img src={imgMenina1} alt="Menina 1" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                
                {/* Sorvete - Mantemos o original */}
                <div className="quadrado-grid" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <img src={imgSorvete} alt="Sorvete" style={{ width: '70%', height: '70%', objectFit: 'contain' }} />
                </div>
                
                {/* Menina 2 - Com borda GROSSA na cor do bolinho */}
                <div className="quadrado-grid" style={{ overflow: 'hidden', border: '6px solid #ffcafa', borderRadius: '16px' }}>
                  <img src={imgMenina2} alt="Menina 2" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                
                {/* Menina 3 - Com borda GROSSA na cor do bolinho */}
                <div className="quadrado-grid" style={{ overflow: 'hidden', border: '6px solid #ffcafa', borderRadius: '16px' }}>
                  <img src={imgMenina3} alt="Menina 3" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                
                {/* Cupcake - Mantemos o original */}
                <div className="quadrado-grid" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <img src={imgBolinhoPequeno} alt="Cupcake" style={{ width: '70%', height: '70%', objectFit: 'contain' }} />
                </div>
                
                {/* Menina 4 - Com borda GROSSA na cor do bolinho */}
                <div className="quadrado-grid" style={{ overflow: 'hidden', border: '6px solid #ffcafa', borderRadius: '16px' }}>
                  <img src={imgMenina4} alt="Menina 4" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>

              </div>
            </section>

            <hr className="linha-divisoria" />

            <footer className="rodape-site">
              <div className="rodape-superior">
                <div className="links-rodape">
                  <h4 style={{fontSize: '1.5rem', marginBottom: '15px'}}>POP!</h4>
                  <div className="colunas-links">
                    <ul>
                      <li><a href="#">Fale Conosco</a></li>
                      <li><a href="#">Conta e Segurança</a></li>
                    </ul>
                    <ul>
                      <li><a href="#">Nosso Blog</a></li>
                      <li><a href="#">Carreiras</a></li>
                    </ul>
                    <ul>
                      <li><a href="#">Privacidade</a></li>
                      <li><a href="#">Termos e condições de Uso</a></li>
                    </ul>
                  </div>
                </div>
                <div className="redes-sociais">
                  <h4>Redes sociais</h4>
                  <img src={imgRedesSociais} alt="Redes Sociais" style={{ height: '35px', marginTop: '10px' }} />
                </div>
              </div>
              <div className="rodape-inferior">
                <img src={imgLogo} alt="Logo POP!" className="logo-rodape" />
                <p>© Copyright 2026 - POP!- Todos os direitos reservados POP! com Agência de Restaurantes Online S.A.<br/>CNPJ 48.713.462/0001-82 / Rua Cubatão, 726 - Vila Mariana, São Paulo - SP, 04013-002</p>
              </div>
            </footer>

          </div> 
          {/* === FIM DO FUNDO BRANCO === */}

        </div>
      )}
      {/* ========================================== */}
      {/* CADASTRO DE USUÁRIO */}
      {/* ========================================== */}
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
              <div className="botoes-form">
                <button type="button" className="btn-cancelar" onClick={() => setTelaAtual('home')}>CANCELAR</button>
                <button type="button" className="btn-salvar">SALVAR</button>
              </div>
            </form>
          </div>
        </main>
      )}

      {/* ========================================== */}
      {/* TELA DE LOGIN */}
      {/* ========================================== */}
      {telaAtual === 'login' && (
        <main className="tela-cadastro">
          <img src={imgLogo} alt="Fundo" className="logo-fundo" />
          <div className="caixa-formulario" style={{ minHeight: 'auto' }}>
            <form className="formulario">
              <div className="linha-form" style={{ alignItems: 'flex-end' }}>
                <div className="grupo-input w-70">
                  <label>Email</label>
                  <input type="text" />
                </div>
                <div style={{ flex: '30%', display: 'flex', justifyContent: 'flex-end' }}>
                  <button type="button" className="btn-salvar" style={{ padding: '12px 40px' }} onClick={() => setTelaAtual('token')}>
                    Continuar
                  </button>
                </div>
              </div>
            </form>
          </div>
        </main>
      )}

      {/* ========================================== */}
      {/* TELA DE TOKEN */}
      {/* ========================================== */}
      {telaAtual === 'token' && (
        <main className="tela-cadastro">
          <img src={imgLogo} alt="Fundo" className="logo-fundo" />
          <div className="caixa-formulario" style={{ minHeight: 'auto', padding: '50px' }}>
            <h2 className="titulo-form" style={{ textAlign: 'center', marginBottom: '30px', fontSize: '1.2rem' }}>
              Token de Autenticação
            </h2>
            <div className="linha-token">
              <input type="text" maxLength="1" className="input-token" />
              <input type="text" maxLength="1" className="input-token" />
              <input type="text" maxLength="1" className="input-token" />
              <input type="text" maxLength="1" className="input-token" />
              <input type="text" maxLength="1" className="input-token" />
              <input type="text" maxLength="1" className="input-token" />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '40px' }}>
              <button type="button" className="btn-salvar" style={{ padding: '12px 50px' }} onClick={() => setTelaAtual('dashboard')}>
                Finalizar
              </button>
            </div>
          </div>
        </main>
      )}

      {/* ========================================== */}
      {/* TELAS LOGADAS (Dashboard e Pedidos) */}
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