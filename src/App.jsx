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

  const [tipoProduto, setTipoProduto] = useState('preparado');

  const [lojas, setLojas] = useState([]);

  return (
    <div className={(telaAtual === 'dashboard' || telaAtual === 'pedidos') ? 'fundo-branco' : 'container-geral'}>
      
      {/* ========================================== */}
      {/* CABEÇALHO (Home, Login, Token, Cadastro Usuario) */}
      {/* ========================================== */}
      {telaAtual === 'home' && (
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
      {/* HOME */}
      {/* ========================================== */}
      {telaAtual === 'home' && (
        <div className="home-com-scroll">
          
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

            <section className="secao-nova secao-formiguinha">
              <div className="texto-formiguinha">
                <h2>Você é<br/>uma<br/>formiguinha<br/>também?</h2>
                <p>Clique no link abaixo<br/>e descubra mais como é trabalhar com a gente</p>
                <button className="btn-vermelho btn-saiba-mais">SAIBA MAIS</button>
              </div>
              <div className="grid-formiguinha">
                <div className="quadrado-grid" style={{ overflow: 'hidden', border: '6px solid #ffcafa', borderRadius: '16px' }}>
                  <img src={imgMenina1} alt="Menina 1" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div className="quadrado-grid" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <img src={imgSorvete} alt="Sorvete" style={{ width: '70%', height: '70%', objectFit: 'contain' }} />
                </div>
                <div className="quadrado-grid" style={{ overflow: 'hidden', border: '6px solid #ffcafa', borderRadius: '16px' }}>
                  <img src={imgMenina2} alt="Menina 2" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div className="quadrado-grid" style={{ overflow: 'hidden', border: '6px solid #ffcafa', borderRadius: '16px' }}>
                  <img src={imgMenina3} alt="Menina 3" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div className="quadrado-grid" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <img src={imgBolinhoPequeno} alt="Cupcake" style={{ width: '70%', height: '70%', objectFit: 'contain' }} />
                </div>
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
      {/* TELAS LOGADAS (Dashboard, Pedidos, Tela do Restaurante) */}
      {/* ========================================== */}
      {(telaAtual === 'dashboard' || telaAtual === 'pedidos' || telaAtual === 'tela-restaurante') && (
        <div style={{ width: '100%', minHeight: '100vh', backgroundColor: '#fff' }}>
          
          {/* CABEÇALHO COMPARTILHADO */}
          <header style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            padding: '15px 40px', 
            backgroundColor: '#ffe6e8'
          }}>
            <img 
              src={imgLogo} 
              alt="Logo POP!" 
              onClick={() => setTelaAtual('dashboard')}
              style={{ cursor: 'pointer', height: '50px' }} 
            />
            
            <nav style={{ display: 'flex', gap: '30px', fontWeight: 'bold', fontSize: '1.1rem' }}>
              <a href="#" style={{ textDecoration: 'none', color: '#ff3b3b' }}>Doces</a>
              <a href="#" style={{ textDecoration: 'none', color: '#ff3b3b' }}>Sobremesa</a>
              <a href="#" style={{ textDecoration: 'none', color: '#ff3b3b' }}>Sorvetes</a>
            </nav>

            <div style={{ 
              display: 'flex', alignItems: 'center', backgroundColor: 'white', 
              padding: '10px 20px', borderRadius: '30px', width: '350px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
            }}>
              <span style={{ color: '#ff3b3b', marginRight: '10px' }}>🔍</span>
              <input 
                type="text" 
                placeholder="Qual docinho você quer hoje ?" 
                style={{ border: 'none', outline: 'none', width: '100%', fontSize: '1rem', color: '#555' }} 
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '25px' }}>
              <span onClick={() => setTelaAtual('cadastro')} style={{ cursor: 'pointer', color: '#ff3b3b', fontWeight: '600', fontSize: '1.1rem' }}>
                Cadastros
              </span>
              <span style={{ color: '#ff3b3b', fontSize: '1.8rem', cursor: 'pointer' }} onClick={() => setTelaAtual('menu-usuario')}>👤</span>
              <span onClick={() => setTelaAtual('pedidos')} style={{ cursor: 'pointer', fontSize: '1.5rem', color: '#ff3b3b' }} title="Ver carrinho de pedidos">
                🛒
              </span>
            </div>
          </header>

          <main className="conteudo-dashboard" style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto' }}>

            {/* --- DASHBOARD --- */}
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
                
                <section className="secao-lojas-dash" style={{ marginTop: '40px' }}>
                  <h3 className="titulo-secao" style={{ color: 'black', textAlign: 'left', marginBottom: '30px' }}>Lojas</h3>
                  
                  {lojas.length === 0 ? (
                    <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#fff', borderRadius: '12px', border: '2px dashed #eaeaea' }}>
                      <p style={{ color: '#999', fontSize: '1.1rem', marginBottom: '20px' }}>Você ainda não possui nenhum restaurante cadastrado.</p>
                      <button onClick={() => setTelaAtual('cadastro-restaurante')} style={{ padding: '12px 25px', backgroundColor: '#ff3b3b', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem' }}>
                        + Cadastrar Restaurante
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
                      {lojas.map((loja) => (
                        <div 
                          key={loja.id} 
                          onClick={() => setTelaAtual('tela-restaurante')} // <--- AQUI FIZEMOS ELE SER CLICÁVEL!
                          style={{ 
                            display: 'flex', alignItems: 'center', gap: '15px', 
                            cursor: 'pointer', transition: 'transform 0.2s' 
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        >
                          <div style={{ width: '70px', height: '70px', backgroundColor: '#666', borderRadius: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="none"></rect><polyline points="21 15 16 10 5 21"></polyline></svg>
                          </div>
                          <span style={{ fontSize: '1.3rem', fontWeight: '500', color: '#000' }}>{loja.nome}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              </>
            )}

            {/* --- PEDIDOS --- */}
            {telaAtual === 'pedidos' && (
              <section className="secao-sacola">
                <div style={{ marginBottom: '20px' }}>
                  <span onClick={() => setTelaAtual('dashboard')} style={{ cursor: 'pointer', color: '#ff3b3b', fontWeight: 'bold', fontSize: '1.1rem', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    ⬅️ Voltar
                  </span>
                </div>
                <h3 className="titulo-sacola">Sua Sacolinha 🛒</h3>
                {/* ... conteúdo da sacola que já estava aqui ... */}
              </section>
            )}

            {/* --- NOVA TELA: DETALHES DO RESTAURANTE --- */}
            {telaAtual === 'tela-restaurante' && (
              <div style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
                
                {/* Cabeçalho do Restaurante */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '30px' }}>
                  <div style={{ 
                    width: '100px', height: '100px', backgroundColor: '#999', borderRadius: '50%', 
                    display: 'flex', justifyContent: 'center', alignItems: 'center' 
                  }}>
                    <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="none"></rect><polyline points="21 15 16 10 5 21"></polyline></svg>
                  </div>
                  <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#000' }}>Nome do restaurante</h2>
                </div>

                <hr style={{ border: 'none', borderTop: '2px solid #eaeaea', marginBottom: '40px' }} />

                {/* Destaque para você */}
                <div style={{ marginBottom: '50px' }}>
                  <h3 style={{ fontSize: '1.2rem', marginBottom: '20px', textAlign: 'center' }}>Destaque para você</h3>
                  <div style={{ 
                    backgroundColor: '#ffe6e8', padding: '30px', borderRadius: '10px', 
                    display: 'flex', alignItems: 'center', position: 'relative' 
                  }}>
                    
                    <div style={{ display: 'flex', gap: '20px', overflowX: 'auto', flex: 1 }}>
                      {[1, 2, 3, 4].map((item) => (
                        <div key={item} style={{ backgroundColor: '#fff', padding: '15px', borderRadius: '8px', minWidth: '150px' }}>
                          <div style={{ width: '100%', height: '120px', backgroundColor: '#aaa', borderRadius: '5px', marginBottom: '10px' }}></div>
                          <p style={{ fontSize: '0.8rem', fontWeight: 'bold', margin: '0 0 5px 0' }}>Bolo de pote ninho com morango</p>
                          <p style={{ fontSize: '0.7rem', color: '#999', textDecoration: 'line-through', margin: '0 0 2px 0' }}>R$19,90</p>
                          <p style={{ fontSize: '0.9rem', color: '#00b894', fontWeight: 'bold', margin: 0 }}>R$15,00</p>
                        </div>
                      ))}
                    </div>
                    
                    {/* Botão circular de seta */}
                    <div style={{ 
                      width: '40px', height: '40px', border: '2px solid #fff', borderRadius: '50%', 
                      display: 'flex', justifyContent: 'center', alignItems: 'center', 
                      position: 'absolute', right: '15px', cursor: 'pointer', color: '#fff' 
                    }}>
                      &gt;
                    </div>
                  </div>
                </div>

                <hr style={{ border: 'none', borderTop: '2px solid #eaeaea', marginBottom: '40px' }} />

                {/* Produtos da Loja */}
                <div>
                  <h3 style={{ fontSize: '1.2rem', marginBottom: '30px' }}>Produtos da Loja</h3>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '40px' }}>
                    {[1, 2, 3, 4].map((item) => (
                      <div key={item} style={{ backgroundColor: '#ffe6e8', padding: '20px', borderRadius: '10px', display: 'flex', gap: '20px', alignItems: 'center' }}>
                        <div style={{ width: '90px', height: '90px', backgroundColor: '#aaa', borderRadius: '5px' }}></div>
                        <div>
                          <p style={{ fontWeight: 'bold', margin: '0 0 8px 0', fontSize: '1.1rem' }}>Nome do produto</p>
                          <p style={{ margin: '0 0 8px 0', fontSize: '0.9rem', color: '#333' }}>Descrição</p>
                          <p style={{ fontWeight: 'bold', margin: 0 }}>Preço</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Botão flutuante de + */}
                  <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                    <button 
                      onClick={() => setTelaAtual('cadastro-produto')}
                      style={{ 
                        width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#999', 
                        color: '#fff', fontSize: '2.5rem', border: 'none', cursor: 'pointer', 
                        display: 'flex', justifyContent: 'center', alignItems: 'center',
                        transition: 'transform 0.2s', boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                      title="Adicionar novo produto"
                    >
                      +
                    </button>
                  </div>
                </div>

              </div>
            )}
            
          </main>
        </div>
      )}

      {/* ========================================== */}
      {/* TELA DE CADASTRO */}
      {/* ========================================== */}
      {telaAtual === 'cadastro' && (
        
        <div style={{ width: '100%', minHeight: '100vh', backgroundColor: '#fdf2f6', display: 'flex', flexDirection: 'column', position: 'relative' }}>
          
          <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px 40px', backgroundColor: '#fff' }}>
            
            <img 
              src={imgLogo} 
              alt="Logo POP!" 
              onClick={() => setTelaAtual('home')} 
              style={{ cursor: 'pointer', height: '50px' }} 
            />
            
            <nav style={{ backgroundColor: '#fdf2f6', padding: '15px 50px', display: 'flex', gap: '40px', borderRadius: '5px' }}>
              <span style={{ color: '#ff3b3b', fontWeight: '600', cursor: 'pointer', fontSize: '1.1rem' }} onClick={() => setTelaAtual('dashboard')}>Inicio</span>
              <span style={{ color: '#ff3b3b', fontWeight: '600', cursor: 'pointer', fontSize: '1.1rem' }} onClick={() => setTelaAtual('pedidos')}>Pedidos</span>
              <span style={{ color: '#ff3b3b', fontWeight: '600', cursor: 'pointer', fontSize: '1.1rem' }}>Cadastros</span>
            </nav>

            <div>
              <span style={{ color: '#ff3b3b', fontSize: '1.8rem', cursor: 'pointer' }} onClick={() => setTelaAtual('menu-usuario')}>👤</span>
            </div>
          </header>

          <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div style={{ 
              backgroundColor: '#fff', 
              padding: '60px 80px', 
              borderRadius: '10px', 
              boxShadow: '0 8px 25px rgba(0,0,0,0.05)', 
              textAlign: 'center', 
              maxWidth: '700px', 
              width: '100%' 
            }}>
              <h2 style={{ fontSize: '1.8rem', marginBottom: '10px', color: '#000', fontWeight: 'bold' }}>O que você deseja cadastrar?</h2>
              <p style={{ color: '#999', marginBottom: '50px', fontSize: '1.1rem', fontWeight: '500' }}>Escolha uma das opções abaixo</p>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '30px' }}>
                
                {/* --- MUDANÇA AQUI: Adicionado o onClick no botão Restaurante --- */}
                <button 
                  onClick={() => setTelaAtual('cadastro-restaurante')}
                  style={{ 
                  flex: 1,
                  backgroundColor: '#fff', 
                  border: 'none', 
                  padding: '25px 40px', 
                  borderRadius: '8px', 
                  boxShadow: '0 4px 15px rgba(0,0,0,0.08)', 
                  color: '#ff3b3b', 
                  fontWeight: 'bold', 
                  fontSize: '1.2rem', 
                  cursor: 'pointer' 
                }}>
                  Restaurante
                </button>

                <button 
                  onClick={() => setTelaAtual('cadastro-produto')}
                  style={{ 
                  flex: 1,
                  backgroundColor: '#fff', 
                  border: 'none', 
                  padding: '25px 40px', 
                  borderRadius: '8px', 
                  boxShadow: '0 4px 15px rgba(0,0,0,0.08)', 
                  color: '#ff3b3b', 
                  fontWeight: 'bold', 
                  fontSize: '1.2rem', 
                  cursor: 'pointer' 
                }}>
                  Produtos
                </button>
              </div>
            </div>
          </main>

          <div 
            onClick={() => setTelaAtual('dashboard')} 
            style={{ position: 'absolute', bottom: '40px', right: '40px', cursor: 'pointer' }}
            title="Voltar"
          >
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ff3b3b" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 14L4 9l5-5"/>
              <path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5v0a5.5 5.5 0 0 1-5.5 5.5H11"/>
            </svg>
          </div>
          
        </div>
      )}

      {/* ========================================== */}
      {/* TELA DE CADASTRO DE RESTAURANTE */}
      {/* ========================================== */}
      {telaAtual === 'cadastro-restaurante' && (
        <div style={{ width: '100%', minHeight: '100vh', backgroundColor: '#fdf2f6', display: 'flex', flexDirection: 'column' }}>
          
        {/* CABEÇALHO BRANCO */}
          <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px 40px', backgroundColor: '#fff' }}>
            
            {/* 1. Mudei aqui na Logo para ir para o dashboard */}
            <img src={imgLogo} alt="Logo POP!" onClick={() => setTelaAtual('dashboard')} style={{ cursor: 'pointer', height: '50px' }} />
            
            <nav style={{ backgroundColor: '#fdf2f6', padding: '15px 50px', display: 'flex', gap: '40px', borderRadius: '5px' }}>
              
              {/* 2. Mudei aqui no texto 'Inicio' para ir para o dashboard */}
              <span style={{ color: '#ff3b3b', fontWeight: '600', cursor: 'pointer', fontSize: '1.1rem' }} onClick={() => setTelaAtual('dashboard')}>Inicio</span>
              
              <span style={{ color: '#ff3b3b', fontWeight: '600', cursor: 'pointer', fontSize: '1.1rem' }} onClick={() => setTelaAtual('pedidos')}>Pedidos</span>
              <span style={{ color: '#ff3b3b', fontWeight: '600', cursor: 'pointer', fontSize: '1.1rem' }} onClick={() => setTelaAtual('cadastro')}>Cadastros</span>
            </nav>
            <div>
              <span style={{ color: '#ff3b3b', fontSize: '1.8rem', cursor: 'pointer' }} onClick={() => setTelaAtual('menu-usuario')}>👤</span>
            </div>
          </header>

          {/* CONTEÚDO PRINCIPAL (FORMULÁRIO) */}
          <main style={{ flex: 1, padding: '40px 20px', display: 'flex', justifyContent: 'center' }}>
            <div style={{ 
              backgroundColor: '#fff', 
              padding: '40px 60px', 
              borderRadius: '12px', 
              boxShadow: '0 10px 30px rgba(0,0,0,0.08)', 
              maxWidth: '850px', 
              width: '100%',
              position: 'relative',
              overflow: 'hidden'
            }}>
              
              {/* Marca d'água da Logo no fundo */}
              <img src={imgLogo} alt="" style={{ position: 'absolute', top: '15%', left: '10%', width: '80%', opacity: '0.04', pointerEvents: 'none' }} />

              <h2 style={{ color: '#ff7eb3', textAlign: 'center', fontSize: '1.6rem', marginBottom: '15px' }}>Cadastro de Restaurante</h2>
              <hr style={{ border: 'none', borderTop: '2px solid #eaeaea', marginBottom: '30px' }} />

              <div style={{ position: 'relative', zIndex: 1 }}>
                {/* SEÇÃO 1: Endereço */}
                <p style={{ color: '#999', fontSize: '0.9rem', margin: '0 0 5px 0' }}>Informações da loja</p>
                <h3 style={{ color: '#ff3b3b', fontSize: '1.4rem', margin: '0 0 5px 0' }}>Onde fica sua loja ?</h3>
                <p style={{ fontSize: '0.95rem', fontWeight: '500', marginBottom: '20px' }}>Digite o CEP e complete as informações</p>

                <div style={{ display: 'flex', gap: '20px', marginBottom: '15px' }}>
                  <div style={{ flex: '1' }}>
                    <label style={{ color: '#ff3b3b', display: 'block', marginBottom: '5px' }}>CEP*</label>
                    <input type="text" placeholder="00000-000" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1.5px solid #000', fontSize: '1rem' }} />
                  </div>
                  <div style={{ flex: '2' }}>
                    <label style={{ color: '#ff3b3b', display: 'block', marginBottom: '5px' }}>Bairro *</label>
                    <input type="text" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1.5px solid #000', fontSize: '1rem' }} />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '20px', marginBottom: '15px' }}>
                  <div style={{ flex: '2' }}>
                    <label style={{ color: '#ff3b3b', display: 'block', marginBottom: '5px' }}>Endereço</label>
                    <input type="text" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1.5px solid #000', fontSize: '1rem' }} />
                  </div>
                  <div style={{ flex: '1' }}>
                    <label style={{ color: '#ff3b3b', display: 'block', marginBottom: '5px' }}>Numero</label>
                    <input type="text" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1.5px solid #000', fontSize: '1rem' }} />
                  </div>
                  <div style={{ flex: '1' }}>
                    <label style={{ color: '#ff3b3b', display: 'block', marginBottom: '5px' }}>Complemento</label>
                    <input type="text" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1.5px solid #000', fontSize: '1rem' }} />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
                  <div style={{ flex: '1' }}>
                    <label style={{ color: '#ff3b3b', display: 'block', marginBottom: '5px' }}>Estado</label>
                    <input type="text" disabled style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1.5px solid #000', backgroundColor: '#e0e0e0', fontSize: '1rem' }} />
                  </div>
                  <div style={{ flex: '1' }}>
                    <label style={{ color: '#ff3b3b', display: 'block', marginBottom: '5px' }}>Cidade</label>
                    <input type="text" disabled style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1.5px solid #000', backgroundColor: '#e0e0e0', fontSize: '1rem' }} />
                  </div>
                </div>

                <hr style={{ border: 'none', borderTop: '2px solid #eaeaea', marginBottom: '30px' }} />

                {/* SEÇÃO 2: Negócio e Responsável */}
                <p style={{ color: '#999', fontSize: '0.9rem', margin: '0 0 15px 0' }}>Negócio e Responsável</p>
                
                <div style={{ display: 'flex', gap: '40px' }}>
                  {/* Coluna Esquerda: Dados da Loja */}
                  <div style={{ flex: '1' }}>
                    <h3 style={{ color: '#ff3b3b', fontSize: '1.3rem', marginBottom: '20px' }}>Dados da sua loja</h3>
                    
                    <div style={{ marginBottom: '15px' }}>
                      <label style={{ color: '#ff3b3b', display: 'block', marginBottom: '5px' }}>CNPJ *</label>
                      <input type="text" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1.5px solid #000' }} />
                    </div>
                    
                    <div style={{ marginBottom: '15px' }}>
                      <label style={{ color: '#ff3b3b', display: 'block', marginBottom: '5px' }}>Especialidade</label>
                      <input type="text" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1.5px solid #000' }} />
                    </div>
                    
                    <div style={{ marginBottom: '15px' }}>
                      <label style={{ color: '#ff3b3b', display: 'block', marginBottom: '5px' }}>E-mail</label>
                      <input type="email" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1.5px solid #000' }} />
                    </div>

                    {/* AGRUPAMENTO: Possui Salão + Logo do Restaurante */}
                    <div style={{ marginTop: '20px', display: 'flex', gap: '15px', alignItems: 'flex-end' }}>
                      
                      <div style={{ flex: '1' }}>
                        <label style={{ color: '#ff3b3b', display: 'block', marginBottom: '10px' }}>Possui salão ?</label>
                        <div style={{ display: 'flex', gap: '20px', color: '#ff3b3b', fontWeight: '500', height: '42px', alignItems: 'center' }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <input type="radio" name="salao" value="sim" style={{ accentColor: '#ff3b3b' }} defaultChecked /> Sim
                          </label>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <input type="radio" name="salao" value="nao" style={{ accentColor: '#ff3b3b' }} /> Não
                          </label>
                        </div>
                      </div>

                      <div style={{ flex: '1' }}>
                        <label style={{ color: '#ff3b3b', display: 'block', marginBottom: '5px' }}>Logo do restaurante</label>
                        <input type="file" id="upload-logo" accept="image/*" style={{ display: 'none' }} />
                        <label htmlFor="upload-logo" style={{ 
                          width: '100%', padding: '10px', borderRadius: '8px', border: '1.5px solid #000', 
                          backgroundColor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer',
                          boxSizing: 'border-box'
                        }}>
                          📷 Adicionar imagem
                        </label>
                      </div>

                    </div>
                  </div>

                  {/* Coluna Direita: Dados do Representante */}
                  <div style={{ flex: '1' }}>
                    <h3 style={{ color: '#ff3b3b', fontSize: '1.3rem', marginBottom: '20px' }}>Dados do Representante</h3>
                    
                    <div style={{ marginBottom: '15px' }}>
                      <label style={{ color: '#ff3b3b', display: 'block', marginBottom: '5px' }}>CPF *</label>
                      <input type="text" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1.5px solid #000' }} />
                    </div>
                    
                    <div style={{ marginBottom: '15px' }}>
                      <label style={{ color: '#ff3b3b', display: 'block', marginBottom: '5px' }}>Nome completo</label>
                      <input type="text" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1.5px solid #000' }} />
                    </div>
                    
                    <div style={{ marginBottom: '15px' }}>
                      <label style={{ color: '#ff3b3b', display: 'block', marginBottom: '5px' }}>Celular</label>
                      <input type="text" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1.5px solid #000' }} />
                    </div>

                    {/* Botão Salvar sozinho na direita */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '45px' }}>
                      <div style={{ flex: '1' }}> {/* Mantive com flex: 1 para ficar do mesmo tamanho de antes */}
                        <button style={{ 
                          width: '100%', padding: '12px', borderRadius: '8px', border: 'none', 
                          backgroundColor: '#ff3b3b', color: '#fff', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer',
                          boxShadow: '0 4px 10px rgba(255, 59, 59, 0.3)'
                        }}>
                          Feito!
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </main>

          {/* RODAPÉ BRANCO INFERIOR */}
          <footer style={{ backgroundColor: '#fff', padding: '40px', borderTop: '2px solid #eaeaea' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h4 style={{ fontSize: '1.2rem', marginBottom: '20px' }}>POP!</h4>
                <div style={{ display: 'flex', gap: '40px', color: '#777', fontSize: '0.9rem', lineHeight: '2' }}>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    <li><a href="#" style={{ textDecoration: 'none', color: 'inherit' }}>Fale Conosco</a></li>
                    <li><a href="#" style={{ textDecoration: 'none', color: 'inherit' }}>Conta e Segurança</a></li>
                  </ul>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    <li><a href="#" style={{ textDecoration: 'none', color: 'inherit' }}>Nosso Blog</a></li>
                    <li><a href="#" style={{ textDecoration: 'none', color: 'inherit' }}>Carreiras</a></li>
                  </ul>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    <li><a href="#" style={{ textDecoration: 'none', color: 'inherit' }}>Privacidade</a></li>
                    <li><a href="#" style={{ textDecoration: 'none', color: 'inherit' }}>Termos e condições de Uso</a></li>
                  </ul>
                </div>
              </div>
              <div>
                <h4 style={{ fontSize: '1.1rem', marginBottom: '15px' }}>Redes sociais</h4>
                {/* --- AQUI ESTÁ A SUA IMAGEM DE REDES SOCIAIS --- */}
                <img src={imgRedesSociais} alt="Redes Sociais" style={{ height: '35px' }} />
              </div>
            </div>
            
            <hr style={{ border: 'none', borderTop: '2px solid #eaeaea', margin: '30px auto', maxWidth: '1200px' }} />
            
            <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '20px', color: '#999', fontSize: '0.85rem' }}>
              <img src={imgLogo} alt="POP!" style={{ height: '30px', opacity: 0.6 }} />
              <p>© Copyright 2026 - POP!- Todos os direitos reservados POP! com Agência de Restaurantes Online S.A.<br/>
              CNPJ 48.713.462/0001-82 / Rua Cubatão, 726 - Vila Mariana, São Paulo - SP, 04013-002</p>
            </div>
          </footer>

        </div>
      )}
      {/* ========================================== */}
      {/* TELA DE CADASTRO DE PRODUTO */}
      {/* ========================================== */}
      {telaAtual === 'cadastro-produto' && (
        <div style={{ width: '100%', minHeight: '100vh', backgroundColor: '#fdf2f6', display: 'flex', flexDirection: 'column' }}>
          
          {/* CABEÇALHO BRANCO */}
          <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px 40px', backgroundColor: '#fff' }}>
            
            {/* 1. Mudei aqui na Logo para ir para o dashboard */}
            <img src={imgLogo} alt="Logo POP!" onClick={() => setTelaAtual('dashboard')} style={{ cursor: 'pointer', height: '50px' }} />
            
            <nav style={{ backgroundColor: '#fdf2f6', padding: '15px 50px', display: 'flex', gap: '40px', borderRadius: '5px' }}>
              
              {/* 2. Mudei aqui no texto 'Inicio' para ir para o dashboard */}
              <span style={{ color: '#ff3b3b', fontWeight: '600', cursor: 'pointer', fontSize: '1.1rem' }} onClick={() => setTelaAtual('dashboard')}>Inicio</span>
              
              <span style={{ color: '#ff3b3b', fontWeight: '600', cursor: 'pointer', fontSize: '1.1rem' }} onClick={() => setTelaAtual('pedidos')}>Pedidos</span>
              <span style={{ color: '#ff3b3b', fontWeight: '600', cursor: 'pointer', fontSize: '1.1rem' }} onClick={() => setTelaAtual('cadastro')}>Cadastros</span>
            </nav>
            <div>
              <span style={{ color: '#ff3b3b', fontSize: '1.8rem', cursor: 'pointer' }} onClick={() => setTelaAtual('menu-usuario')}>👤</span>
            </div>
          </header>

          {/* CONTEÚDO PRINCIPAL (FORMULÁRIO) */}
          <main style={{ flex: 1, padding: '40px 20px', display: 'flex', justifyContent: 'center' }}>
            <div style={{ 
              backgroundColor: '#fff', 
              padding: '40px 60px', 
              borderRadius: '12px', 
              boxShadow: '0 10px 30px rgba(0,0,0,0.08)', 
              maxWidth: '850px', 
              width: '100%',
              position: 'relative',
              overflow: 'hidden'
            }}>
              
              {/* Marca d'água */}
              <img src={imgLogo} alt="" style={{ position: 'absolute', top: '15%', left: '10%', width: '80%', opacity: '0.04', pointerEvents: 'none' }} />

              <h2 style={{ color: '#ff7eb3', textAlign: 'center', fontSize: '1.8rem', marginBottom: '15px' }}>Produto</h2>
              <hr style={{ border: 'none', borderTop: '2px solid #eaeaea', marginBottom: '30px' }} />

              <div style={{ position: 'relative', zIndex: 1 }}>
                
                {/* SEÇÃO 1: Tipo de Produto */}
                <h3 style={{ color: '#ff3b3b', fontSize: '1.6rem', margin: '0 0 5px 0' }}>Criar Produto</h3>
                <p style={{ fontSize: '1rem', fontWeight: '500', marginBottom: '25px', color: '#000' }}>escolha o tipo de produto</p>
                
                <p style={{ color: '#ff3b3b', fontSize: '1.1rem', marginBottom: '15px' }}>Escolha um tipo de produto</p>

                {/* Opções de Tipo */}
                <div style={{ display: 'flex', gap: '20px', marginBottom: '40px' }}>
                  
                  {/* Opção 1: Preparado */}
                  <div 
                    onClick={() => setTipoProduto('preparado')}
                    style={{ 
                      flex: 1, 
                      border: tipoProduto === 'preparado' ? '2px solid #ff3b3b' : '1.5px solid #000', 
                      borderRadius: '10px', padding: '20px 15px', position: 'relative', cursor: 'pointer', backgroundColor: '#fff',
                      transition: 'all 0.2s ease-in-out'
                    }}>
                    <input type="radio" checked={tipoProduto === 'preparado'} readOnly style={{ position: 'absolute', top: '15px', right: '15px', accentColor: '#ff3b3b', width: '18px', height: '18px', cursor: 'pointer' }} />
                    <h4 style={{ margin: '0 0 15px 0', fontSize: '1.1rem', color: '#000' }}>Preparado ☕</h4>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#999' }}>Produto produzido na sua loja</p>
                  </div>

                  {/* Opção 2: Industrializado */}
                  <div 
                    onClick={() => setTipoProduto('industrializado')}
                    style={{ 
                      flex: 1, 
                      border: tipoProduto === 'industrializado' ? '2px solid #ff3b3b' : '1.5px solid #000', 
                      borderRadius: '10px', padding: '20px 15px', position: 'relative', cursor: 'pointer', backgroundColor: '#fff',
                      transition: 'all 0.2s ease-in-out'
                    }}>
                    <input type="radio" checked={tipoProduto === 'industrializado'} readOnly style={{ position: 'absolute', top: '15px', right: '15px', accentColor: '#ff3b3b', width: '18px', height: '18px', cursor: 'pointer' }} />
                    <h4 style={{ margin: '0 0 15px 0', fontSize: '1.1rem', color: '#000' }}>Industrializado 🏭</h4>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#999' }}>Produtos que sua loja não produz</p>
                  </div>

                  {/* Opção 3: Combo */}
                  <div 
                    onClick={() => setTipoProduto('combo')}
                    style={{ 
                      flex: 1, 
                      border: tipoProduto === 'combo' ? '2px solid #ff3b3b' : '1.5px solid #000', 
                      borderRadius: '10px', padding: '20px 15px', position: 'relative', cursor: 'pointer', backgroundColor: '#fff',
                      transition: 'all 0.2s ease-in-out'
                    }}>
                    <input type="radio" checked={tipoProduto === 'combo'} readOnly style={{ position: 'absolute', top: '15px', right: '15px', accentColor: '#ff3b3b', width: '18px', height: '18px', cursor: 'pointer' }} />
                    <h4 style={{ margin: '0 0 15px 0', fontSize: '1.1rem', color: '#000' }}>Combo 🍱</h4>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#999' }}>Grupos de produtos</p>
                  </div>
                </div>

                <hr style={{ border: 'none', borderTop: '2px solid #eaeaea', marginBottom: '30px' }} />

                {/* SEÇÃO 2: Formulário do Produto */}
                <h3 style={{ color: '#ff3b3b', fontSize: '1.6rem', marginBottom: '25px' }}>Cadastre seu produto</h3>

                {/* Linha 1 */}
                <div style={{ display: 'flex', gap: '30px', marginBottom: '20px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ color: '#999', display: 'block', marginBottom: '8px', fontWeight: '500' }}>Nome do produto</label>
                    <input type="text" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1.5px solid #000', fontSize: '1rem', boxSizing: 'border-box' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ color: '#999', display: 'block', marginBottom: '8px', fontWeight: '500' }}>Preço</label>
                    <input type="text" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1.5px solid #000', fontSize: '1rem', boxSizing: 'border-box' }} />
                  </div>
                </div>

                {/* Linha 2 */}
                <div style={{ display: 'flex', gap: '30px', marginBottom: '20px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ color: '#999', display: 'block', marginBottom: '8px', fontWeight: '500' }}>Descrição</label>
                    <input type="text" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1.5px solid #000', fontSize: '1rem', boxSizing: 'border-box' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ color: '#999', display: 'block', marginBottom: '8px', fontWeight: '500' }}>Restaurante</label>
                    <select style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1.5px solid #000', fontSize: '1rem', backgroundColor: '#fff', boxSizing: 'border-box', cursor: 'pointer' }}>
                      <option value=""></option>
                      <option value="restaurante1">Restaurante 1</option>
                    </select>
                  </div>
                </div>

                {/* Linha 3 */}
                <div style={{ display: 'flex', gap: '30px', marginBottom: '30px', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ color: '#999', display: 'block', marginBottom: '8px', fontWeight: '500' }}>Imagem do Produto</label>
                    <input type="file" id="upload-produto" accept="image/*" style={{ display: 'none' }} />
                    <label htmlFor="upload-produto" style={{ 
                      width: '100%', padding: '12px', borderRadius: '8px', border: '1.5px solid #000', 
                      backgroundColor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer',
                      boxSizing: 'border-box', fontWeight: 'bold'
                    }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                      Adicionar imagem
                    </label>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ color: '#999', display: 'block', marginBottom: '8px', fontWeight: '500' }}>Status Produto</label>
                    <select style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1.5px solid #000', fontSize: '1rem', backgroundColor: '#fff', boxSizing: 'border-box', cursor: 'pointer' }}>
                      <option value=""></option>
                      <option value="ativo">Ativo</option>
                      <option value="inativo">Inativo</option>
                    </select>
                  </div>
                </div>

                {/* Botão Salvar */}
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button style={{ 
                    padding: '12px 50px', borderRadius: '8px', border: 'none', 
                    backgroundColor: '#ff3b3b', color: '#fff', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer',
                    boxShadow: '0 4px 10px rgba(255, 59, 59, 0.3)'
                  }}>
                    Feito
                  </button>
                </div>

              </div>
            </div>
          </main>

          {/* RODAPÉ BRANCO INFERIOR */}
          <footer style={{ backgroundColor: '#fff', padding: '40px', borderTop: '2px solid #eaeaea' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h4 style={{ fontSize: '1.2rem', marginBottom: '20px' }}>POP!</h4>
                <div style={{ display: 'flex', gap: '40px', color: '#777', fontSize: '0.9rem', lineHeight: '2' }}>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    <li><a href="#" style={{ textDecoration: 'none', color: 'inherit' }}>Fale Conosco</a></li>
                    <li><a href="#" style={{ textDecoration: 'none', color: 'inherit' }}>Conta e Segurança</a></li>
                  </ul>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    <li><a href="#" style={{ textDecoration: 'none', color: 'inherit' }}>Nosso Blog</a></li>
                    <li><a href="#" style={{ textDecoration: 'none', color: 'inherit' }}>Carreiras</a></li>
                  </ul>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    <li><a href="#" style={{ textDecoration: 'none', color: 'inherit' }}>Privacidade</a></li>
                    <li><a href="#" style={{ textDecoration: 'none', color: 'inherit' }}>Termos e condições de Uso</a></li>
                  </ul>
                </div>
              </div>
              <div>
                <h4 style={{ fontSize: '1.1rem', marginBottom: '15px' }}>Redes sociais</h4>
                <img src={imgRedesSociais} alt="Redes Sociais" style={{ height: '35px' }} />
              </div>
            </div>
            
            <hr style={{ border: 'none', borderTop: '2px solid #eaeaea', margin: '30px auto', maxWidth: '1200px' }} />
            
            <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '20px', color: '#999', fontSize: '0.85rem' }}>
              <img src={imgLogo} alt="POP!" style={{ height: '30px', opacity: 0.6 }} />
              <p>© Copyright 2026 - POP!- Todos os direitos reservados POP! com Agência de Restaurantes Online S.A.<br/>
              CNPJ 48.713.462/0001-82 / Rua Cubatão, 726 - Vila Mariana, São Paulo - SP, 04013-002</p>
            </div>
          </footer>

        </div>
      )}
      {/* ========================================== */}
      {/* TELA DE MENU DO USUÁRIO */}
      {/* ========================================== */}
      {telaAtual === 'menu-usuario' && (
        <div style={{ width: '100%', minHeight: '100vh', backgroundColor: '#fdf2f6', display: 'flex', flexDirection: 'column' }}>
          
          {/* CABEÇALHO BRANCO */}
          <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px 40px', backgroundColor: '#fff' }}>
            
            {/* 1. Mudei aqui na Logo para ir para o dashboard */}
            <img src={imgLogo} alt="Logo POP!" onClick={() => setTelaAtual('dashboard')} style={{ cursor: 'pointer', height: '50px' }} />
            
            <nav style={{ backgroundColor: '#fdf2f6', padding: '15px 50px', display: 'flex', gap: '40px', borderRadius: '5px' }}>
              
              {/* 2. Mudei aqui no texto 'Inicio' para ir para o dashboard */}
              <span style={{ color: '#ff3b3b', fontWeight: '600', cursor: 'pointer', fontSize: '1.1rem' }} onClick={() => setTelaAtual('dashboard')}>Inicio</span>
              
              <span style={{ color: '#ff3b3b', fontWeight: '600', cursor: 'pointer', fontSize: '1.1rem' }} onClick={() => setTelaAtual('pedidos')}>Pedidos</span>
              <span style={{ color: '#ff3b3b', fontWeight: '600', cursor: 'pointer', fontSize: '1.1rem' }} onClick={() => setTelaAtual('cadastro')}>Cadastros</span>
            </nav>
            <div>
              <span style={{ color: '#ff3b3b', fontSize: '1.8rem', cursor: 'pointer' }} onClick={() => setTelaAtual('menu-usuario')}>👤</span>
            </div>
          </header>

          {/* CONTEÚDO PRINCIPAL (MENU) */}
          <main style={{ flex: 1, padding: '40px 20px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ 
              backgroundColor: '#fff', 
              padding: '40px 60px', 
              borderRadius: '12px', 
              boxShadow: '0 10px 30px rgba(0,0,0,0.08)', 
              maxWidth: '500px', 
              width: '100%',
              position: 'relative',
              overflow: 'hidden'
            }}>
              
              {/* Marca d'água */}
              <img src={imgLogo} alt="" style={{ position: 'absolute', top: '15%', left: '10%', width: '80%', opacity: '0.04', pointerEvents: 'none' }} />

              <div style={{ position: 'relative', zIndex: 1 }}>
                <h2 style={{ color: '#ff7eb3', fontSize: '1.6rem', margin: '0 0 15px 0' }}>Olá Usuario do POP!</h2>
                <hr style={{ border: 'none', borderTop: '2px solid #eaeaea', marginBottom: '40px' }} />

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  
                  {/* Botão Pedidos */}
                  <button onClick={() => setTelaAtual('pedidos')} style={{ 
                    width: '100%', padding: '15px 25px', borderRadius: '10px', border: '2.5px solid #ff3b3b', 
                    backgroundColor: '#fff', color: '#000', fontSize: '1.4rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '15px', cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}>
                    📝 Pedidos
                  </button>

                  {/* Botão Meus Dados */}
                  <button style={{ 
                    width: '100%', padding: '15px 25px', borderRadius: '10px', border: '2.5px solid #ff3b3b', 
                    backgroundColor: '#fff', color: '#000', fontSize: '1.4rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '15px', cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}>
                    👤 Meus dados
                  </button>

                  {/* Botão Ajuda */}
                  <button style={{ 
                    width: '100%', padding: '15px 25px', borderRadius: '10px', border: '2.5px solid #ff3b3b', 
                    backgroundColor: '#fff', color: '#000', fontSize: '1.4rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '15px', cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}>
                    ❓ Ajuda
                  </button>

                  {/* Botão Sair */}
                  <button onClick={() => setTelaAtual('home')} style={{ 
                    width: '100%', padding: '15px 25px', borderRadius: '10px', border: '2.5px solid #ff3b3b', 
                    backgroundColor: '#fff', color: '#000', fontSize: '1.4rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '15px', cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}>
                    ⬅️ Sair
                  </button>

                </div>
              </div>
            </div>
          </main>

          {/* RODAPÉ BRANCO INFERIOR */}
          <footer style={{ backgroundColor: '#fff', padding: '40px', borderTop: '2px solid #eaeaea' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h4 style={{ fontSize: '1.2rem', marginBottom: '20px' }}>POP!</h4>
                <div style={{ display: 'flex', gap: '40px', color: '#777', fontSize: '0.9rem', lineHeight: '2' }}>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    <li><a href="#" style={{ textDecoration: 'none', color: 'inherit' }}>Fale Conosco</a></li>
                    <li><a href="#" style={{ textDecoration: 'none', color: 'inherit' }}>Conta e Segurança</a></li>
                  </ul>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    <li><a href="#" style={{ textDecoration: 'none', color: 'inherit' }}>Nosso Blog</a></li>
                    <li><a href="#" style={{ textDecoration: 'none', color: 'inherit' }}>Carreiras</a></li>
                  </ul>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    <li><a href="#" style={{ textDecoration: 'none', color: 'inherit' }}>Privacidade</a></li>
                    <li><a href="#" style={{ textDecoration: 'none', color: 'inherit' }}>Termos e condições de Uso</a></li>
                  </ul>
                </div>
              </div>
              <div>
                <h4 style={{ fontSize: '1.1rem', marginBottom: '15px' }}>Redes sociais</h4>
                <img src={imgRedesSociais} alt="Redes Sociais" style={{ height: '35px' }} />
              </div>
            </div>
            
            <hr style={{ border: 'none', borderTop: '2px solid #eaeaea', margin: '30px auto', maxWidth: '1200px' }} />
            
            <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '20px', color: '#999', fontSize: '0.85rem' }}>
              <img src={imgLogo} alt="POP!" style={{ height: '30px', opacity: 0.6 }} />
              <p>© Copyright 2026 - POP!- Todos os direitos reservados POP! com Agência de Restaurantes Online S.A.<br/>
              CNPJ 48.713.462/0001-82 / Rua Cubatão, 726 - Vila Mariana, São Paulo - SP, 04013-002</p>
            </div>
          </footer>

        </div>
      )}
    </div>
  );
}

export default App;