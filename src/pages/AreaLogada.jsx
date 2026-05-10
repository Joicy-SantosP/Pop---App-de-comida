import React, { useState } from 'react';

import imgLogo from '../assets/logo_grande.png';
import imgFormigaDormindo from '../assets/formigadormindo.png';
import cat1 from '../assets/image-removebg-preview (1).png';
import cat2 from '../assets/image-removebg-preview (2).png';
import cat3 from '../assets/image-removebg-preview (3).png';
import cat4 from '../assets/image-removebg-preview (4).png';
import cat5 from '../assets/image-removebg-preview (5).png';
import bannerDeitado1 from '../assets/Poster Deitado 1.png';
import bannerDeitado2 from '../assets/Poster Deitado 2.png';
import bannerDeitado3 from '../assets/Poster Deitado 3.png';
import bannerCumprido1 from '../assets/Poster Cumprido 1.png';
import bannerCumprido2 from '../assets/Poster Cumprido 2.png';
import bannerCumprido3 from '../assets/Poster Cumprido 3.png';
import bannerCumprido4 from '../assets/Poster Cumprido 4.png';
import formigaImg from '../assets/Formiguinha pagando.png';
import imgFormigaComendo from '../assets/formiguinha comendo .png';
import imgFormigaFeliz from '../assets/formigafeliz.png';
import imgFormigaPensativa from '../assets/formigapensativa.png';
import imgFormigaTriste from '../assets/formigatriste.png';


function AreaLogada({ 
  telaAtual, setTelaAtual, 
  menuUsuarioAberto, setMenuUsuarioAberto, 
  carrinhoAberto, setCarrinhoAberto, 
  itensCarrinho, setItensCarrinho, modalEnderecoAberto,
  setModalEnderecoAberto, setPassoEndereco, 
  lojaSelecionada, setLojaSelecionada, lojas,
  produtoSelecionado, setProdutoSelecionado, quantidadeProduto, 
  setQuantidadeProduto,passoEndereco,tipoFavorito,
  setTipoFavorito,
}) {

    // Dentro do componente, antes do return principal:
console.log("O componente renderizou! A tela atual é:", telaAtual);

// Simulando a resposta que virá do Banco de Dados/Back-end
const [dadosEntrega, setDadosEntrega] = useState({
    rua: "Rua Bastilha 152",
    cidadeEstado: "Santo Andre - SP",
    tempoEstimado: "Hoje 33 - 55 min",
    taxaEntrega: 10.00,
    isFreteGratis: false // Se mudar para true, a tela deve se adaptar
});

// Controla qual aba de pagamento está ativa ('site' ou 'entrega')
const [abaPagamento, setAbaPagamento] = useState('site');

// Controles do Modal de Pagamento
const [modalPagamentoAberto, setModalPagamentoAberto] = useState(false);
const [statusPagamento, setStatusPagamento] = useState('aguardando'); // Pode ser: 'aguardando', 'sucesso' ou 'erro'

// Função que será chamada ao clicar em "Fazer Pedido"
const handleFazerPedido = () => {
    // 1. Abre o modal e define a formiga pensativa (aguardando)
    setModalPagamentoAberto(true);
    setStatusPagamento('aguardando');

    // =======================================================
    //  BACK-END INTEGRAÇÃO MERCADO PAGO AQUIIII
    // =======================================================
    // Meninas, aqui vocês vão inserir a chamada da API do Mercado Pago.
    // Assim que a API retornar o status do pagamento, basta atualizar o estado:
    // 
    // try {
    //     const resposta = await api.post('/pagamento-mercado-pago', { carrinho: itensCarrinho });
    //     if (resposta.aprovado) {
    //         setStatusPagamento('sucesso');
    //     } else {
    //         setStatusPagamento('erro');
    //     }
    // } catch (erro) {
    //     setStatusPagamento('erro');
    // }
    // =======================================================

    // 👇 SIMULAÇÃO TEMPORÁRIA DO FRONT-END (Pode apagar quando o back estiver pronto):
    setTimeout(() => {
        // Após 3 segundos, ele muda para sucesso. 
        // Dica: Troque a palavra 'sucesso' por 'erro' aqui para ver a formiga triste!
        setStatusPagamento('sucesso'); 
    }, 3000);
};

// Guarda as informações do pedido que está em andamento
const [pedidoAtual, setPedidoAtual] = useState(null);
// Guarda a lista de pedidos que já foram concluídos
const [pedidosAnteriores, setPedidosAnteriores] = useState([]);

// Função para testar a conclusão do pedido
const simularEntrega = () => {
    if (pedidoAtual) {
        // Cria uma cópia do pedido atual, mas com o status 'Entregue'
        const pedidoConcluido = { 
            ...pedidoAtual, 
            status: 'Entregue 😋',
            data: new Date().toLocaleDateString('pt-BR') 
        };
        
        // Adiciona esse pedido no topo da lista de pedidos anteriores
        setPedidosAnteriores([pedidoConcluido, ...pedidosAnteriores]);
        
        // Esvazia o "Pedido Atual"
        setPedidoAtual(null);
    }
};

  return (
    <>
    

      {/* ========================================== */}
      {/* TELAS LOGADAS (Dashboard, Pedidos, Tela do Restaurante) */}
      {/* ========================================== */}
      {(telaAtual === 'dashboard' || telaAtual === 'pedidos' || telaAtual === 'tela-restaurante' || telaAtual === 'pagamento') && (
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
              
              {/* === BOTÃO DE ENDEREÇOS ATUALIZADO AQUI === */}
              <span 
                onClick={() => {
                  setModalEnderecoAberto(true);
                  setPassoEndereco(1);
                }} 
                style={{ cursor: 'pointer', color: '#ff3b3b', fontWeight: '600', fontSize: '1.1rem' }}
              >
                Endereços
              </span>

            {/* === CONTAINER DO POP-UP DO USUÁRIO === */}
            <div style={{ position: 'relative' }}>
              <span
                style={{ color: '#ff3b3b', fontSize: '1.8rem', cursor: 'pointer' }}
                onClick={() => setMenuUsuarioAberto(!menuUsuarioAberto)}
              >
                👤
              </span>

              {/* MENU POP-UP USUÁRIO */}
              {menuUsuarioAberto && (
                <div className="popup-usuario">
                  <div className="popup-header">
                    <button className="btn-fechar" onClick={() => setMenuUsuarioAberto(false)}>X</button>
                  </div>
                  <h3 className="popup-saudacao">Olá Usuario do POP!</h3>
                  <hr className="popup-linha" />
                  <div className="popup-opcoes">
                    <button className="btn-opcao" onClick={() => { setTelaAtual('pedidos'); setMenuUsuarioAberto(false); }}>
                    <span className="icone">🧾</span> Pedidos
                  </button>
                    <button className="btn-opcao"><span className="icone">👤</span> Meus dados</button>
                    <button className="btn-opcao" onClick={() => { setTelaAtual('cadastro'); setMenuUsuarioAberto(false); }}>
                      <span className="icone">📝</span> Cadastrar
                    </button>
                    <button className="btn-opcao"><span className="icone">❓</span> Ajuda</button>
                    <button className="btn-opcao" onClick={() => { setTelaAtual('home'); setMenuUsuarioAberto(false); }}>
                      <span className="icone">⬅️</span> Sair
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* === NOVO CONTAINER DO POP-UP DO CARRINHO === */}
            <div style={{ position: 'relative' }}>
              <span 
                onClick={() => setCarrinhoAberto(!carrinhoAberto)} 
                style={{ cursor: 'pointer', fontSize: '1.5rem', color: '#ff3b3b' }} 
                title="Ver carrinho de pedidos"
              >
                🛒
              </span>

              {/* MENU POP-UP CARRINHO */}
              {carrinhoAberto && (
                <div className="popup-carrinho" style={{ 
                  position: 'absolute', top: '50px', right: '0', width: '380px', backgroundColor: '#fff', 
                  borderRadius: '10px', padding: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.15)', zIndex: 999 
                }}>
                  
                  {/* Botão X para fechar o carrinho */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <span onClick={() => setCarrinhoAberto(false)} style={{ color: '#ff3b3b', fontSize: '1.5rem', fontWeight: 'bold', cursor: 'pointer' }}>X</span>
                  </div>

                  {itensCarrinho.length === 0 ? (
                    /* --- ESTADO VAZIO COM A FORMIGUINHA --- */
                    <div className="carrinho-vazio" style={{ textAlign: 'center', padding: '10px 0 30px 0' }}>
                      <img 
                        src={imgFormigaDormindo} 
                        alt="Formiguinha fofa" 
                        style={{ width: '180px', height: 'auto', marginBottom: '20px' }} 
                      />
                      <h3 style={{ color: '#555', fontWeight: 'bold', margin: '0 0 10px 0', fontSize: '1.2rem' }}>
                        Sua sacola está vazia
                      </h3>
                      <p style={{ color: '#999', margin: 0, fontSize: '0.9rem' }}>
                        adicione um docinho aqui
                      </p>
                    </div>
                  ) : (
                    /* --- ESTADO COM ITENS (DINÂMICO) --- */
                    <div className="carrinho-cheio">
                      <div className="carrinho-restaurante" style={{ marginBottom: '15px' }}>
                        <p style={{ color: '#999', fontSize: '0.9rem', margin: '0 0 5px 0' }}>
                          Seu pedido em <span style={{ color: '#ff3b3b', float: 'right', cursor: 'pointer' }}>Ver o cardápio</span>
                        </p>
                        <h4 style={{ color: '#8a1c1c', fontSize: '1.2rem', margin: 0 }}>{itensCarrinho[0]?.lojaNome}</h4>
                      </div>
                      
                      <hr style={{ border: 'none', borderTop: '1px solid #eaeaea', marginBottom: '15px' }} />
                      
                      {/* Lista de Itens Adicionados */}
                      <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
                        {itensCarrinho.map((item, index) => (
                          <div key={index} style={{ marginBottom: '20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                              <span style={{ color: '#8a1c1c', fontWeight: 'bold', fontSize: '1.1rem' }}>
                                {item.quantidade} x {item.nome}
                              </span>
                              <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                                R$ {(item.preco * item.quantidade).toFixed(2).replace('.', ',')}
                              </span>
                            </div>
                            <p style={{ color: '#999', fontSize: '0.9rem', margin: '0 0 10px 0' }}>{item.descricao}</p>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                              <span style={{ color: '#5dade2' }}>Item promocional</span>
                              <div style={{ display: 'flex', gap: '15px' }}>
                                <span style={{ color: '#ff3b3b', fontWeight: 'bold', cursor: 'pointer' }}>Editar</span>
                                <span 
                                  onClick={() => {
                                    // Remove o item se clicar em Remover
                                    const novoCarrinho = [...itensCarrinho];
                                    novoCarrinho.splice(index, 1);
                                    setItensCarrinho(novoCarrinho);
                                  }} 
                                  style={{ color: '#000', fontWeight: 'bold', cursor: 'pointer' }}
                                >
                                  Remover
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <hr style={{ border: 'none', borderTop: '1px solid #eaeaea', margin: '15px 0' }} />
                      
                      {/* Resumo de Valores */}
                      <div className="carrinho-resumo" style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#999', fontWeight: 'bold' }}>
                          <span>SubTotal</span>
                          <span style={{ color: '#000' }}>
                            R$ {itensCarrinho.reduce((acc, i) => acc + (i.preco * i.quantidade), 0).toFixed(2).replace('.', ',')}
                          </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#999', fontWeight: 'bold' }}>
                          <span>Taxa de entrega</span>
                          <span style={{ color: '#00b894' }}>Gratis</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#000', fontWeight: 'bold', fontSize: '1.3rem', marginTop: '10px' }}>
                          <span>Total</span>
                          <span>
                            R$ {itensCarrinho.reduce((acc, i) => acc + (i.preco * i.quantidade), 0).toFixed(2).replace('.', ',')}
                          </span>
                        </div>
                      </div>
                      
                      {/* Botões Finais */}
                        <button 
                        className="btn-pagamento"
                        onClick={() => {
                            setTelaAtual('pagamento'); // Muda para a tela nova
                            setCarrinhoAberto(false);  // Esconde o pop-up lateral
                        }}
                        >
                        Escolher forma de pagamento
                        </button>
                      <button 
                        onClick={() => setItensCarrinho([])} 
                        style={{ width: '100%', backgroundColor: '#f5f5f5', color: '#000', border: '1px dashed #ccc', padding: '10px', borderRadius: '8px', cursor: 'pointer' }}
                      >
                        Esvaziar
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          </header>

          <main className="conteudo-dashboard" style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto' }}>
              {/* --- TELA DE PAGAMENTO --- */}
                {telaAtual === 'pagamento' && (
                <div className="container-pagamento">
                    
                    {/* COLUNA ESQUERDA: Informações do usuário e pagamento */}
                    <div className="pagamento-coluna-esq">
                    <h2 style={{ color: '#ff3b3b', marginBottom: '20px' }}>Finalize seu pedido</h2>
                    
                    {/* Abas Entrega / Retirada */}
                    <div className="abas-simples">
                        <span className="aba-ativa">Entrega</span>
                        <span className="aba-inativa">Retirada</span>
                    </div>

                    {/* Box de Endereço */}
                    <div className="box-endereco">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div className="icone-mapa-placeholder">🗺️</div>
                        <div>
                            {/* Antes era "Rua Bastilha 152" */}
                            <p style={{ fontWeight: 'bold', margin: 0 }}>{dadosEntrega.rua}</p>
                            {/* Antes era "Santo Andre - SP" */}
                            <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>{dadosEntrega.cidadeEstado}</p>
                        </div>
                        </div>
                        <span style={{ color: '#ff3b3b', cursor: 'pointer', fontWeight: 'bold' }}>Trocar</span>
                    </div>

                    {/* Box de Tempo de Entrega */}
                        <h4 style={{ marginTop: '20px' }}>{dadosEntrega.tempoEstimado}</h4>
                        <div style={{ display: 'flex', gap: '15px' }}>
                            <div className="box-tempo ativo">
                                <p className="tempo-titulo">{dadosEntrega.tempoEstimado}</p>
                                <p className="tempo-preco">
                                    {/* Lógica: Se o frete não for grátis, mostra o valor. Se for, mostra "Grátis" */}
                                    {dadosEntrega.isFreteGratis 
                                        ? "Grátis" 
                                        : `R$ ${dadosEntrega.taxaEntrega.toFixed(2).replace('.', ',')}`}
                                </p>
                            </div>
                            {/* ... (o outro box de retirada pode seguir a mesma lógica) ... */}
                        </div>

                    <hr className="linha-divisoria" />

                    {/* Abas de Pagamento */}
<div className="abas-simples" style={{ marginTop: '20px' }}>
    <span 
        className={abaPagamento === 'site' ? "aba-ativa" : "aba-inativa"} 
        onClick={() => setAbaPagamento('site')}
        style={{ cursor: 'pointer' }}
    >
        Pague pelo Site
    </span>
    <span 
        className={abaPagamento === 'entrega' ? "aba-ativa" : "aba-inativa"} 
        onClick={() => setAbaPagamento('entrega')}
        style={{ cursor: 'pointer' }}
    >
        Pague na Entrega
    </span>
</div>

{/* === CONTEÚDO DINÂMICO DAS ABAS === */}
{abaPagamento === 'site' ? (
    
    // --- CONTEÚDO DA ABA: PAGUE PELO SITE ---
    <>
        {/* Box do PIX */}
        <div className="box-metodo-pagamento">
            <span style={{ fontSize: '2rem', color: '#20b2aa' }}>❖</span>
            <div>
                <p style={{ fontWeight: 'bold', margin: 0 }}>Pague com o pix</p>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>Use o QR code ou codigo copia e cola</p>
            </div>
        </div>

        {/* Box de Adicionar Cartão */}
        <div className="box-adicionar-cartao">
            <div>
                <h3 style={{ margin: '0 0 10px 0' }}>Adicione um cartão no POP!</h3>
                <p style={{ color: '#666', fontSize: '0.9rem' }}>É seguro pratico e você não perde nenhum minuto</p>
                <button className="btn-outline-vermelho">Adicione um cartão</button>
            </div>
            {/* Formiguinha adicionada aqui na aba do site! */}
            <img src={formigaImg} alt="Formiga pagando" style={{ width: '120px' }} />
        </div>
    </>

) : (

    // --- CONTEÚDO DA ABA: PAGUE NA ENTREGA ---
    <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
        
        {/* Coluna 1: Dinheiro, Crédito, Débito */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', flex: 1 }}>
            <button className="btn-opcao-entrega">💵 Dinheiro</button>
            <button className="btn-opcao-entrega">💳 Credito</button>
            <button className="btn-opcao-entrega">💳 Debito</button>
        </div>
        
        {/* Coluna 2: Vale Alimentação e Formiguinha */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', flex: 1, alignItems: 'center' }}>
            <button className="btn-opcao-entrega" style={{ width: '100%' }}>💳 Vale Alimentação</button>
            {/* Formiguinha mantida aqui na aba de entrega! */}
            <img src={formigaImg} alt="Formiga pagando na maquininha" style={{ width: '140px', marginTop: '10px' }} />
        </div>

    </div>
)}
                    {/* CPF / CNPJ */}
                    <div style={{ marginTop: '20px' }}>
                        <label style={{ color: '#ff3b3b', fontWeight: 'bold' }}>CPF/CNPJ na nota</label>
                        <input type="text" className="input-cpf" />
                    </div>

                    {/* Botão Final */}
                    <button className="btn-fazer-pedido" onClick={handleFazerPedido}>
                        Fazer Pedido
                    </button>
                    </div>

                    {/* COLUNA DIREITA: Resumo do Pedido (Mesmo visual do carrinho) */}
<div className="pagamento-coluna-dir" style={{ minWidth: '380px', width: '35%' }}>
    <div className="resumo-pedido-fixo">
        <p className="texto-cinza" style={{ color: '#999', fontSize: '0.9rem', marginBottom: '5px' }}>
            Seu pedido em <span 
                style={{ color: '#ff3b3b', float: 'right', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 'bold' }}
                onClick={() => setTelaAtual('tela-restaurante')}
            >
                Ver o cardápio
            </span>
        </p>
        
        {/* Puxa o nome do restaurante do primeiro item do carrinho, se houver */}
        <h4 className="nome-restaurante" style={{ color: '#a82424', marginBottom: '20px', fontSize: '1.2rem', margin: '0 0 15px 0' }}>
            {itensCarrinho.length > 0 ? itensCarrinho[0].lojaNome : "Restaurante POP!"}
        </h4>
        
        <hr className="linha-divisoria" style={{ border: 'none', borderTop: '1px solid #eaeaea', marginBottom: '15px' }} />
        
        {/* LISTA DINÂMICA DE ITENS */}
        <div style={{ maxHeight: '350px', overflowY: 'auto', paddingRight: '5px' }}>
            {itensCarrinho.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#999', padding: '20px 0' }}>Sua sacola está vazia.</p>
            ) : (
                itensCarrinho.map((item, index) => (
                    <div className="item-pedido" key={index} style={{ marginBottom: '15px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', color: '#a82424' }}>
                            <span>{item.quantidade} x {item.nome}</span>
                            <span style={{ color: '#333' }}>R$ {(item.preco * item.quantidade).toFixed(2).replace('.', ',')}</span>
                        </div>
                        <p style={{ color: '#888', fontSize: '0.9rem', margin: '5px 0' }}>{item.descricao}</p>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginTop: '10px' }}>
                            <span style={{ color: '#3498db' }}>Item promocional</span>
                            <div style={{ display: 'flex', gap: '10px', color: '#ff3b3b', fontWeight: 'bold' }}>
                                <span style={{ cursor: 'pointer' }}>Editar</span>
                                <span 
                                    style={{ cursor: 'pointer', color: '#333' }}
                                    onClick={() => {
                                        // Lógica para remover o item direto da tela de pagamento
                                        const novoCarrinho = [...itensCarrinho];
                                        novoCarrinho.splice(index, 1);
                                        setItensCarrinho(novoCarrinho);
                                    }}
                                >
                                    Remover
                                </span>
                            </div>
                        </div>
                        <hr className="linha-divisoria" style={{ border: 'none', borderTop: '1px solid #eaeaea', margin: '15px 0 0 0' }} />
                    </div>
                ))
            )}
        </div>
        
        {/* RESUMO DE VALORES (CÁLCULO AUTOMÁTICO) */}
        <div style={{ marginTop: '15px' }}>
            <div className="linha-resumo" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', color: '#666' }}>
                <span className="texto-cinza">SubTotal</span>
                <span style={{ fontWeight: 'bold', color: '#333' }}>
                    R$ {itensCarrinho.reduce((acc, i) => acc + (i.preco * i.quantidade), 0).toFixed(2).replace('.', ',')}
                </span>
            </div>
            
            <div className="linha-resumo" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', color: '#666' }}>
                <span className="texto-cinza">Taxa de entrega</span>
                <span style={{ color: '#2ecc71', fontWeight: 'bold' }}>
                    {dadosEntrega.isFreteGratis ? "Grátis" : `R$ ${dadosEntrega.taxaEntrega.toFixed(2).replace('.', ',')}`}
                </span>
            </div>
            
            <div className="linha-resumo" style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.2rem', marginTop: '20px', color: '#000' }}>
                <span>Total</span>
                <span>
                    R$ {(
                        itensCarrinho.reduce((acc, i) => acc + (i.preco * i.quantidade), 0) + 
                        (dadosEntrega.isFreteGratis ? 0 : dadosEntrega.taxaEntrega)
                    ).toFixed(2).replace('.', ',')}
                </span>
            </div>
        </div>
    </div>
</div>
                </div>
                )}
            {/* --- DASHBOARD --- */}
            {telaAtual === 'dashboard' && (
              <div style={{ width: '100%', fontFamily: 'sans-serif' }}>
                
                {/* ========================================== */}
                {/* SEÇÃO 1: CATEGORIAS                        */}
                {/* ========================================== */}
                <section style={{ marginBottom: '50px' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '15px', color: '#000' }}>
                    Pedir seu docinho no POP! é rápido, fácil e gostoso. Conheça algumas categorias
                  </h3>
                  
                  {/* Faixa Rosa com as categorias */}
                  <div style={{ 
                    backgroundColor: '#ffe6e8', 
                    borderRadius: '15px', 
                    padding: '20px 30px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    position: 'relative' 
                  }}>
                    <div style={{ display: 'flex', gap: '20px', flex: 1, justifyContent: 'space-between', paddingRight: '50px', overflowX: 'auto' }}>
                      {[
                        { img: cat1, nome: 'Bolos' },
                        { img: cat2, nome: 'Tortas' },
                        { img: cat3, nome: 'Promoção' },
                        { img: cat4, nome: 'Docinhos' },
                        { img: cat5, nome: 'Salgados' },
                        { img: cat1, nome: 'BomBons' } // Usando cat1 como placeholder para o sexto item
                      ].map((categoria, index) => (
                        <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', minWidth: '90px' }}>
                          <div style={{ width: '100px', height: '100px', backgroundColor: '#fff', borderRadius: '15px', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                            <img src={categoria.img} alt={categoria.nome} style={{ width: '70px', objectFit: 'contain' }} />
                          </div>
                          <span style={{ fontSize: '13px', color: '#999', fontWeight: '500' }}>{categoria.nome}</span>
                        </div>
                      ))}
                    </div>
                    
                    {/* Botão circular de seta */}
                    <div style={{ 
                      width: '40px', height: '40px', border: '2px solid #fff', borderRadius: '50%', 
                      display: 'flex', justifyContent: 'center', alignItems: 'center', 
                      position: 'absolute', right: '20px', cursor: 'pointer', color: '#fff', fontSize: '1.2rem'
                    }}>
                      &gt;
                    </div>
                  </div>
                </section>

                {/* ========================================== */}
                {/* SEÇÃO 2: BANNERS DEITADOS                  */}
                {/* ========================================== */}
                <section style={{ display: 'flex', justifyContent: 'space-between', gap: '20px', marginBottom: '60px' }}>
                  <img src={bannerDeitado1} alt="Bora de Pão de Mel" style={{ width: '32%', borderRadius: '15px', cursor: 'pointer', objectFit: 'cover' }} />
                  <img src={bannerDeitado2} alt="Maçã do Amor" style={{ width: '32%', borderRadius: '15px', cursor: 'pointer', objectFit: 'cover' }} />
                  <img src={bannerDeitado3} alt="Para refrescar seu dia" style={{ width: '32%', borderRadius: '15px', cursor: 'pointer', objectFit: 'cover' }} />
                </section>

                {/* ========================================== */}
                {/* SEÇÃO 3: OFERTAS ESPECIAIS                 */}
                {/* ========================================== */}
                <section style={{ marginBottom: '60px' }}>
                  <h3 style={{ textAlign: 'center', fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '20px', color: '#000' }}>
                    Ofertas especiais no precinho 😉
                  </h3>
                  
                  {/* Faixa Rosa com as ofertas */}
                  <div style={{ 
                    backgroundColor: '#ffe6e8', 
                    borderRadius: '15px', 
                    padding: '30px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    position: 'relative' 
                  }}>
                    <div style={{ display: 'flex', gap: '20px', justifyContent: 'space-between', flex: 1, paddingRight: '50px' }}>
                      {[1, 2, 3, 4].map((item) => (
                        <div key={item} style={{ flex: 1, backgroundColor: '#fff', borderRadius: '10px', padding: '15px', cursor: 'pointer' }}>
                          <div style={{ width: '100%', height: '140px', backgroundColor: '#e0e0e0', borderRadius: '8px', marginBottom: '15px' }}>
                             {/* Coloque a tag <img src={...} /> aqui quando tiver a imagem da oferta */}
                          </div>
                          <h4 style={{ fontSize: '12px', fontWeight: 'bold', margin: '0 0 5px 0', color: '#000' }}>Bolo de pote ninho com morango</h4>
                          <p style={{ fontSize: '11px', textDecoration: 'line-through', color: '#ccc', margin: '0' }}>R$19,90</p>
                          <p style={{ fontSize: '16px', fontWeight: 'bold', color: '#00b894', margin: '0' }}>R$15,00</p>
                        </div>
                      ))}
                    </div>

                    {/* Botão circular de seta */}
                    <div style={{ 
                      width: '40px', height: '40px', border: '2px solid #fff', borderRadius: '50%', 
                      display: 'flex', justifyContent: 'center', alignItems: 'center', 
                      position: 'absolute', right: '20px', cursor: 'pointer', color: '#fff', fontSize: '1.2rem'
                    }}>
                      &gt;
                    </div>
                  </div>
                </section>

                {/* ========================================== */}
                {/* SEÇÃO 4: BANNERS COMPRIDOS (VERTICAIS)     */}
                {/* ========================================== */}
                <section style={{ display: 'flex', justifyContent: 'space-between', gap: '20px', marginBottom: '60px' }}>
                  <img src={bannerCumprido1} alt="Fatia de Bolo" style={{ width: '23%', borderRadius: '15px', cursor: 'pointer', objectFit: 'cover' }} />
                  <img src={bannerCumprido2} alt="Salgados" style={{ width: '23%', borderRadius: '15px', cursor: 'pointer', objectFit: 'cover' }} />
                  <img src={bannerCumprido3} alt="Brigadeiros" style={{ width: '23%', borderRadius: '15px', cursor: 'pointer', objectFit: 'cover' }} />
                  <img src={bannerCumprido4} alt="Torta Limão" style={{ width: '23%', borderRadius: '15px', cursor: 'pointer', objectFit: 'cover' }} />
                </section>

                {/* ========================================== */}
                {/* SEÇÃO 5: LOJAS                             */}
                {/* ========================================== */}
                <section className="secao-lojas-dash" style={{ marginBottom: '50px' }}>
                  <h3 className="titulo-secao" style={{ color: 'black', textAlign: 'left', marginBottom: '30px', fontSize: '1.2rem', fontWeight: 'bold' }}>Lojas</h3>
                  
                  {lojas.length === 0 ? (
                    <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#fff', borderRadius: '12px', border: '2px dashed #eaeaea' }}>
                      <p style={{ color: '#999', fontSize: '1.1rem', marginBottom: '20px' }}>Você ainda não possui nenhum restaurante cadastrado.</p>
                      <button onClick={() => setTelaAtual('cadastro-restaurante')} style={{ padding: '12px 25px', backgroundColor: '#ff3b3b', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem' }}>
                        + Cadastrar Restaurante
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '40px 20px' }}>
                      {lojas.map((loja) => (
                      <div 
                        key={loja.id} 
                        onClick={() => {
                          setLojaSelecionada(loja);
                          setTelaAtual('tela-restaurante');
                        }}
                        style={{ 
                          display: 'flex', alignItems: 'center', gap: '15px', 
                          cursor: 'pointer', transition: 'transform 0.2s'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.03)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                      >
                        <div style={{ width: '70px', height: '70px', backgroundColor: '#fff', borderRadius: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
                          <img src={loja.logo} alt={loja.nome} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#333' }}>{loja.nome}</span>
                      </div>
                    ))}
                    </div>
                  )}

                  {/* Botão Ver Mais */}
                  {lojas.length > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}>
                      <button style={{ padding: '10px 60px', backgroundColor: '#fff', color: '#ff4d6d', border: '1px solid #ff4d6d', borderRadius: '25px', fontSize: '1rem', cursor: 'pointer', fontWeight: 'bold' }}>
                        Ver mais
                      </button>
                    </div>
                  )}
                </section>

              </div>
            )}
            
            {telaAtual === 'pedidos' && (
                <div style={{ padding: '40px', maxWidth: '900px', margin: '0 auto' }}>
                    <h2 style={{ color: '#ff3b3b', marginBottom: '20px', fontSize: '1.8rem' }}>Meus Pedidos</h2>
                    
                    {/* Container Principal (Fundo rosinha claro) */}
                    <div style={{ backgroundColor: '#fff5f6', borderRadius: '15px', padding: '40px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
                        
                        {/* ========================================== */}
                        {/* 1. SESSÃO DO PEDIDO ATUAL                  */}
                        {/* ========================================== */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <h3 style={{ color: '#a82424', margin: 0, fontSize: '1.4rem' }}>Pedido atual</h3>
                            <img src={imgFormigaComendo} alt="Formiga comendo" style={{ width: '90px', marginTop: '-30px' }} />
                        </div>

                        {pedidoAtual ? (
                            <div style={{ backgroundColor: '#fbeceb', padding: '25px', borderRadius: '15px', marginTop: '10px' }}>
                                <div style={{ display: 'flex', gap: '25px' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '120px' }}>
                                        <div style={{ width: '120px', height: '120px', backgroundColor: '#bdc3c7', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                                            <span style={{ fontSize: '3rem' }}>🏞️</span>
                                        </div>
                                        <span style={{ marginTop: '10px', fontWeight: 'bold', color: '#333' }}>
                                            R$ {pedidoAtual.total?.toFixed(2).replace('.', ',') || "0,00"}
                                        </span>
                                    </div>

                                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span style={{ fontWeight: 'bold', color: '#a82424', fontSize: '1.1rem' }}>
                                                *{pedidoAtual.itens[0]?.lojaNome || "Tudo de bom doces"}*
                                            </span>
                                        </div>
                                        
                                        {pedidoAtual.itens.map((item, index) => (
                                            <div key={index} style={{ marginBottom: '10px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <span style={{ fontWeight: 'bold', color: '#a82424' }}>{item.nome}</span>
                                                    <span style={{ fontWeight: 'bold', color: '#555', fontSize: '0.9rem' }}>Qtd: {item.quantidade}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <hr style={{ border: 'none', borderTop: '2px solid #fff', margin: '20px 0' }} />

                                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', color: '#000', fontSize: '0.95rem' }}>
                                    <span>Status: <span style={{ color: '#e67e22' }}>{pedidoAtual.status}</span></span>
                                    <span>Data: {pedidoAtual.data}</span>
                                </div>

                                <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
                                    <button style={{ flex: 1, backgroundColor: '#ff3b3b', color: '#fff', border: 'none', padding: '12px', borderRadius: '30px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer' }}>
                                        Acompanhar entrega
                                    </button>
                                    
                                    {/* 👇 BOTÃO DE TESTE PARA SIMULAR A ENTREGA */}
                                    <button 
                                        onClick={simularEntrega}
                                        style={{ flex: 1, backgroundColor: '#27ae60', color: '#fff', border: 'none', padding: '12px', borderRadius: '30px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer' }}
                                    >
                                        ✅ TESTE: Concluir Pedido
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div style={{ padding: '30px', textAlign: 'center', backgroundColor: '#fbeceb', borderRadius: '15px', marginTop: '10px' }}>
                                <p style={{ color: '#888', fontWeight: 'bold', fontSize: '1.1rem' }}>Você não tem nenhum pedido em andamento no momento.</p>
                            </div>
                        )}

                        {/* ========================================== */}
                        {/* 2. SESSÃO DE PEDIDOS ANTERIORES            */}
                        {/* ========================================== */}
                        <div style={{ marginTop: '40px' }}>
                            <h3 style={{ color: '#a82424', margin: '0 0 20px 0', fontSize: '1.4rem' }}>Pedidos anteriores</h3>

                            {pedidosAnteriores.length > 0 ? (
                                pedidosAnteriores.map((pedidoAntigo, index) => (
                                    <div key={index} style={{ backgroundColor: '#fbeceb', padding: '25px', borderRadius: '15px', marginBottom: '15px' }}>
                                        <div style={{ display: 'flex', gap: '25px' }}>
                                            
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '120px' }}>
                                                <div style={{ width: '120px', height: '120px', backgroundColor: '#bdc3c7', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                                                    <span style={{ fontSize: '3rem' }}>✅</span>
                                                </div>
                                                <span style={{ marginTop: '10px', fontWeight: 'bold', color: '#333' }}>
                                                    R$ {pedidoAntigo.total?.toFixed(2).replace('.', ',')}
                                                </span>
                                            </div>

                                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                                <span style={{ fontWeight: 'bold', color: '#a82424', fontSize: '1.1rem' }}>
                                                    *{pedidoAntigo.itens[0]?.lojaNome || "Tudo de bom doces"}*
                                                </span>
                                                
                                                {pedidoAntigo.itens.map((item, idx) => (
                                                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                        <span style={{ fontWeight: 'bold', color: '#a82424' }}>{item.nome}</span>
                                                        <span style={{ fontWeight: 'bold', color: '#555', fontSize: '0.9rem' }}>Qtd: {item.quantidade}</span>
                                                    </div>
                                                ))}

                                                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', color: '#000', fontSize: '0.95rem', marginTop: 'auto' }}>
                                                    <span>Status: <span style={{ color: '#27ae60' }}>{pedidoAntigo.status}</span></span>
                                                    <span>Data: {pedidoAntigo.data}</span>
                                                </div>
                                            </div>

                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div style={{ padding: '20px', textAlign: 'center', color: '#888', fontWeight: 'bold' }}>
                                    Nenhum pedido anterior encontrado.
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            )}

            {/* --- NOVA TELA: DETALHES DO RESTAURANTE --- */}
            {telaAtual === 'tela-restaurante' && lojaSelecionada && (
              <div style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
                
                {/* Cabeçalho do Restaurante */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '30px' }}>
                  <div style={{ 
                    width: '100px', height: '100px', backgroundColor: '#999', borderRadius: '50%', 
                    display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden'
                  }}>
                    <img src={lojaSelecionada.logo} alt={lojaSelecionada.nome} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#000', margin: 0 }}>{lojaSelecionada.nome}</h2>
                    <p style={{ color: '#777', margin: '5px 0 0 0' }}>{lojaSelecionada.especialidade}</p>
                  </div>
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
                    {lojaSelecionada.produtos.map((produto) => (
                      <div 
                        key={produto.id} 
                        onClick={() => {
                          setProdutoSelecionado(produto); 
                          setQuantidadeProduto(1); 
                        }}
                        style={{ backgroundColor: '#ffe6e8', padding: '20px', borderRadius: '10px', display: 'flex', gap: '20px', alignItems: 'center', cursor: 'pointer' }}
                      >
                        <div style={{ width: '90px', height: '90px', backgroundColor: '#aaa', borderRadius: '5px', overflow: 'hidden' }}>
                          <img src={produto.imagem} alt={produto.nome} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontWeight: 'bold', margin: '0 0 8px 0', fontSize: '1.1rem' }}>{produto.nome}</p>
                          <p style={{ margin: '0 0 8px 0', fontSize: '0.9rem', color: '#333', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{produto.descricao}</p>
                          <p style={{ fontWeight: 'bold', margin: 0, color: '#00b894' }}>R$ {produto.preco.toFixed(2).replace('.', ',')}</p>
                        </div>
                        {/* Botão de + no cartão */}
                        <button style={{ backgroundColor: '#ff3b3b', color: '#fff', border: 'none', borderRadius: '50%', width: '40px', height: '40px', fontSize: '1.5rem', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer' }}>
                          +
                        </button>
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
      {/* MODAL DE PRODUTO (POP-UP)                    */}
      {/* ========================================== */}
      {produtoSelecionado && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.4)', zIndex: 99999, // Um zIndex bem alto garante que fique por cima de tudo
          display: 'flex', justifyContent: 'center', alignItems: 'center'
        }}>
          
          <div style={{
            backgroundColor: '#fff', borderRadius: '15px', padding: '40px',
            width: '750px', maxWidth: '90%', display: 'flex', gap: '30px', position: 'relative',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
          }}>
            
            {/* Botão Fechar (X vermelho) */}
            <span 
              onClick={() => setProdutoSelecionado(null)}
              style={{
                position: 'absolute', top: '15px', right: '20px', color: '#ff3b3b', 
                fontSize: '1.5rem', fontWeight: 'bold', cursor: 'pointer'
              }}
            >
              X
            </span>

            {/* Esquerda: Imagem do Produto */}
            <div style={{ width: '320px', height: '320px', backgroundColor: '#aaa', borderRadius: '15px', overflow: 'hidden' }}>
              <img src={produtoSelecionado.imagem} alt={produtoSelecionado.nome} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>

            {/* Direita: Detalhes do Produto */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              
              <h2 style={{ fontSize: '1.4rem', margin: '0 0 10px 0', textAlign: 'center', color: '#000', fontWeight: 'bold' }}>
                *{produtoSelecionado.nome}*
              </h2>
              <p style={{ color: '#555', fontSize: '1.1rem', margin: '0 0 10px 0', fontWeight: '500' }}>
                Descrição do produto
              </p>
              <h3 style={{ fontSize: '1.4rem', color: '#555', margin: '0 0 20px 0' }}>
                R${produtoSelecionado.preco.toFixed(2).replace('.', ',')}
              </h3>

              {/* Caixa de Informações da Loja */}
              <div style={{ border: '2px solid #aaa', borderRadius: '8px', padding: '10px 15px', marginBottom: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #ccc', paddingBottom: '8px', marginBottom: '8px' }}>
                  <span style={{ fontWeight: 'bold', color: '#555' }}>Nome da loja</span>
                  <span style={{ color: '#555', fontSize: '0.9rem', fontWeight: 'bold' }}>*Avaliação*</span>
                </div>
                <div style={{ color: '#555', fontSize: '0.9rem', fontWeight: 'bold' }}>
                  *Distancia*
                </div>
              </div>

              {/* Campo de Comentários */}
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#555', fontSize: '1rem' }}>
                  Algum Comentario?
                </label>
                <textarea 
                  placeholder="EX: Tirar o coco ralado, paçoca, amendoim"
                  style={{
                    width: '100%', padding: '10px', borderRadius: '8px', border: '2px solid #aaa',
                    resize: 'none', height: '60px', fontFamily: 'inherit', boxSizing: 'border-box',
                    fontSize: '0.95rem', fontWeight: 'bold', color: '#555'
                  }}
                />
              </div>
              
              <p style={{ color: '#ff3b3b', fontSize: '0.9rem', textAlign: 'right', margin: '0 0 15px 0', cursor: 'pointer', fontWeight: 'bold' }}>
                Denunciar item
              </p>

              {/* Controles de Quantidade e Botão Adicionar */}
              <div style={{ display: 'flex', gap: '15px', marginTop: 'auto' }}>
                
                {/* Botões + e - */}
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  border: '2px solid #ff3b3b', borderRadius: '8px', padding: '10px 15px', width: '130px'
                }}>
                  {/* Sinal de MAIS (Aumenta a quantidade) */}
                  <span 
                    onClick={() => setQuantidadeProduto(q => q + 1)} 
                    style={{ color: '#ff3b3b', fontSize: '1.6rem', fontWeight: 'bold', cursor: 'pointer', userSelect: 'none' }}
                  >+</span>
                  
                  <span style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#ff3b3b', userSelect: 'none' }}>
                    {quantidadeProduto}
                  </span>
                  
                  {/* Sinal de MENOS (Diminui a quantidade, mas não deixa passar de 1) */}
                  <span 
                    onClick={() => setQuantidadeProduto(q => Math.max(1, q - 1))} 
                    style={{ color: '#ff3b3b', fontSize: '1.6rem', fontWeight: 'bold', cursor: 'pointer', userSelect: 'none' }}
                  >-</span>
                </div>

                {/* Botão Adicionar ao Carrinho */}
                <button 
                  onClick={() => {
                    // Adiciona o produto atual na lista do carrinho e guarda a loja junto
                    setItensCarrinho([...itensCarrinho, { 
                      ...produtoSelecionado, 
                      quantidade: quantidadeProduto,
                      lojaNome: lojaSelecionada.nome 
                    }]);
                    setProdutoSelecionado(null); // Fecha o pop-up
                  }}
                  style={{
                    flex: 1, backgroundColor: '#ff3b3b', color: '#fff', border: 'none', borderRadius: '8px',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 20px',
                    fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer'
                  }}
                >
                  <span>Adicionar</span>
                  <span>R$ {(produtoSelecionado.preco * quantidadeProduto).toFixed(2).replace('.', ',')}</span>
                </button>

              </div>

            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* MODAL DE CADASTRO DE ENDEREÇO (4 PASSOS)     */}
      {/* ========================================== */}
      {modalEnderecoAberto && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.4)', zIndex: 99999,
          display: 'flex', justifyContent: 'center', alignItems: 'center'
        }}>
          <div style={{
            backgroundColor: '#fff', borderRadius: '15px', padding: '40px',
            width: '500px', maxWidth: '90%', display: 'flex', flexDirection: 'column', position: 'relative',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
          }}>
            
            {/* Botão Fechar */}
            <span 
              onClick={() => setModalEnderecoAberto(false)}
              style={{ position: 'absolute', top: '15px', right: '20px', color: '#ff3b3b', fontSize: '1.5rem', fontWeight: 'bold', cursor: 'pointer' }}
            >
              X
            </span>

            {/* Mascote no Topo */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
              <img src={imgFormigaDormindo} alt="Mascote Localização" style={{ height: '80px' }} />
            </div>

            {/* --- PASSO 1: BUSCAR ENDEREÇO --- */}
            {passoEndereco === 1 && (
              <div style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
                <h3 style={{ textAlign: 'center', marginBottom: '30px', fontSize: '1.2rem' }}>Onde você quer receber seu pedido ?</h3>
                
                <div style={{ backgroundColor: '#f0f0f0', borderRadius: '8px', padding: '12px 15px', display: 'flex', alignItems: 'center', marginBottom: '30px' }}>
                  <span style={{ color: '#ff4d6d', marginRight: '10px', fontSize: '1.2rem', fontWeight: 'bold' }}>🔍</span>
                  <input type="text" placeholder="Buscar endereço e numero" style={{ border: 'none', backgroundColor: 'transparent', outline: 'none', width: '100%', color: '#ff4d6d', fontWeight: 'bold', fontSize: '1rem' }} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {[1, 2, 3].map((item, index) => (
                    <div 
                      key={item} 
                      onClick={() => setPassoEndereco(2)} // Vai pro passo 2 ao clicar
                      style={{ border: '1px solid #e0e0e0', borderRadius: '8px', padding: '15px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '15px', transition: 'border 0.2s' }}
                      onMouseEnter={(e) => e.currentTarget.style.borderColor = '#ff4d6d'}
                      onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e0e0e0'}
                    >
                      <span style={{ fontSize: '1.2rem' }}>{index === 0 ? '🏠' : '📄'}</span> 
                      <span style={{ color: '#ff4d6d', fontWeight: 'bold', fontSize: '1rem' }}>Endereço salvo</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* --- PASSO 2: INFORMAR NÚMERO --- */}
            {passoEndereco === 2 && (
              <div style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
                <h3 style={{ textAlign: 'center', marginBottom: '20px', fontSize: '1.2rem' }}>Informe seu numero do endereço</h3>
                <p style={{ textAlign: 'center', fontWeight: 'bold', marginBottom: '20px', fontSize: '1rem' }}>Endereço informado anterior mente</p>
                
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '30px' }}>
                  <input 
                    type="text" 
                    placeholder="informe o numero" 
                    style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '15px', width: '250px', textAlign: 'center', fontSize: '1.1rem', marginBottom: '15px' }} 
                  />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <label style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Não possuí numero</label>
                    <input type="checkbox" style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
                  </div>
                </div>

                <button onClick={() => setPassoEndereco(3)} style={{ width: '100%', backgroundColor: '#ff4d6d', color: '#fff', border: 'none', borderRadius: '8px', padding: '15px', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer' }}>
                  Buscar com numero
                </button>
              </div>
            )}

            {/* --- PASSO 3: CONFIRMAR NO MAPA (PREPARADO PARA API) --- */}
            {passoEndereco === 3 && (
              <div style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
                <h3 style={{ textAlign: 'center', marginBottom: '20px', fontSize: '1.4rem', fontWeight: 'bold' }}>Endereço</h3>
                
                {/* 📍 CONTAINER DO MAPA (A API vai entrar exatamente nesta div) */}
                <div style={{ 
                  width: '100%', 
                  height: '250px', 
                  backgroundColor: '#aaa', // Cor cinza do mockup
                  borderRadius: '15px', 
                  marginBottom: '30px', 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center', 
                  overflow: 'hidden' 
                }}>
                  
                  {/* Ícone de Imagem (Placeholder temporário) */}
                  <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                    <polyline points="21 15 16 10 5 21"></polyline>
                  </svg>

                  {/* FUTURA INTEGRAÇÃO: 
                      É aqui dentro que você vai colocar o componente do mapa real depois.
                      Exemplo: <GoogleMap center={localizacao} zoom={15} /> 
                  */}

                </div>

                <button 
                  onClick={() => setPassoEndereco(4)} 
                  style={{ 
                    width: '100%', backgroundColor: '#ff4d6d', color: '#fff', 
                    border: 'none', borderRadius: '10px', padding: '15px', 
                    fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer',
                    boxShadow: '0 4px 10px rgba(255, 77, 109, 0.2)'
                  }}>
                  Confirmar localização
                </button>
              </div>
            )}

            {/* --- PASSO 4: COMPLEMENTO E FAVORITAR --- */}
            {passoEndereco === 4 && (
              <div style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
                <h3 style={{ textAlign: 'center', marginBottom: '5px', fontSize: '1.4rem', fontWeight: 'bold' }}>Endereço</h3>
                <p style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '0.95rem', marginBottom: '30px', color: '#000' }}>
                  Endereço cadastrado | Bairro | Estado
                </p>
                
                <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ color: '#999', fontWeight: 'bold', display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Numero</label>
                    <input type="text" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ color: '#999', fontWeight: 'bold', display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Complemento</label>
                    <input type="text" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
                  </div>
                </div>

                <div style={{ marginBottom: '30px' }}>
                  <label style={{ color: '#999', fontWeight: 'bold', display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Ponto de referencia</label>
                  <input type="text" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
                </div>

                <label style={{ color: '#999', fontWeight: 'bold', display: 'block', marginBottom: '10px', fontSize: '0.9rem' }}>Favoritar como</label>
                
                {/* BOTÕES DE FAVORITAR COM SELEÇÃO */}
                <div style={{ display: 'flex', gap: '15px', marginBottom: '40px' }}>
                  <button 
                    onClick={() => setTipoFavorito('casa')}
                    style={{ 
                      flex: 1, padding: '12px', borderRadius: '8px', 
                      border: tipoFavorito === 'casa' ? '2px solid #ff4d6d' : '1px solid #ccc', 
                      backgroundColor: tipoFavorito === 'casa' ? '#fff0f3' : '#fff', 
                      color: tipoFavorito === 'casa' ? '#ff4d6d' : '#777', 
                      fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    🏠 Casa
                  </button>
                  <button 
                    onClick={() => setTipoFavorito('trabalho')}
                    style={{ 
                      flex: 1, padding: '12px', borderRadius: '8px', 
                      border: tipoFavorito === 'trabalho' ? '2px solid #ff4d6d' : '1px solid #ccc', 
                      backgroundColor: tipoFavorito === 'trabalho' ? '#fff0f3' : '#fff', 
                      color: tipoFavorito === 'trabalho' ? '#ff4d6d' : '#777', 
                      fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    📄 Trabalho
                  </button>
                </div>

                <button 
                  onClick={() => {
                    setModalEnderecoAberto(false);
                    // No futuro, ao clicar aqui, você também vai disparar a função de salvar no backend!
                  }} 
                  style={{ 
                    width: '100%', backgroundColor: '#ff4d6d', color: '#fff', 
                    border: 'none', borderRadius: '10px', padding: '15px', 
                    fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer',
                    boxShadow: '0 4px 10px rgba(255, 77, 109, 0.2)'
                  }}
                >
                  Confirmar localização
                </button>
              </div>
            )}
          </div>
          
        </div>
      )}
                {/* MODAL DE STATUS DO PAGAMENTO */}
{modalPagamentoAberto && (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
        <div style={{ backgroundColor: '#fff', padding: '40px', borderRadius: '20px', textAlign: 'center', width: '400px', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
            
            <h3 style={{ color: '#ff3b3b', margin: '0 0 30px 0', fontSize: '1.5rem', letterSpacing: '1px' }}>PAGAMENTO</h3>
            
            {/* ESTADO 1: AGUARDANDO */}
            {statusPagamento === 'aguardando' && (
                <div>
                    <img src={imgFormigaPensativa} alt="Aguardando" style={{ width: '220px', marginBottom: '20px' }} />
                    <h4 style={{ color: '#ff3b3b', fontSize: '1.2rem', margin: 0 }}>Aguardando o pagamento</h4>
                    <h4 style={{ color: '#ff3b3b', fontSize: '1.2rem', margin: 0 }}>do pedido</h4>
                </div>
            )}

            {/* ESTADO 2: SUCESSO */}
            {statusPagamento === 'sucesso' && (
                <div>
                    <img src={imgFormigaFeliz} alt="Sucesso" style={{ width: '220px', marginBottom: '20px' }} />
                    <h4 style={{ color: '#ff3b3b', fontSize: '1.2rem', margin: '0 0 10px 0' }}>Pagamento realizado com sucesso</h4>
                    <p style={{ color: '#ff3b3b', fontSize: '1.1rem', fontWeight: 'bold', margin: 0 }}>Aproveite seu pedido 🐜</p>
                    
                    <button 
                    style={{ marginTop: '30px', padding: '12px 30px', backgroundColor: '#ff3b3b', color: '#fff', border: 'none', borderRadius: '25px', fontWeight: 'bold', cursor: 'pointer', width: '100%' }}
                    onClick={() => {
                        // 1. Salva o carrinho atual no "Pedido Atual" antes de apagar
                        if (itensCarrinho.length > 0) {
                            setPedidoAtual({
                                itens: [...itensCarrinho],
                                data: new Date().toLocaleDateString('pt-BR'), // Pega a data de hoje automaticamente
                                status: 'Preparando pedido', // Status inicial
                                // Calcula o total do pedido
                                total: itensCarrinho.reduce((acc, i) => acc + (i.preco * i.quantidade), 0) + (dadosEntrega.isFreteGratis ? 0 : dadosEntrega.taxaEntrega)
                            });
                        }
                        
                        // 2. Fecha o modal, muda de tela e limpa o carrinho
                        setModalPagamentoAberto(false);
                        setTelaAtual('pedidos');
                        setItensCarrinho([]);
                    }}
                >
                    Ver meus pedidos
                </button>
                </div>
            )}

            {/* ESTADO 3: ERRO */}
            {statusPagamento === 'erro' && (
                <div>
                    <img src={imgFormigaTriste} alt="Erro" style={{ width: '220px', marginBottom: '20px' }} />
                    <h4 style={{ color: '#ff3b3b', fontSize: '1.2rem', margin: '0 0 10px 0' }}>OPS! Algo deu errado</h4>
                    <p style={{ color: '#ff3b3b', fontSize: '1.1rem', fontWeight: 'bold', margin: 0 }}>Pagamento não foi realizado</p>
                    <p style={{ color: '#ff3b3b', fontSize: '1.1rem', fontWeight: 'bold', margin: 0 }}>com sucesso</p>
                    
                    <button 
                        style={{ marginTop: '30px', padding: '12px 30px', backgroundColor: '#ff3b3b', color: '#fff', border: 'none', borderRadius: '25px', fontWeight: 'bold', cursor: 'pointer', width: '100%' }}
                        onClick={() => setModalPagamentoAberto(false)}
                    >
                        Tentar novamente
                    </button>
                </div>
            )}

        </div>
    </div>
)} 
      </>
  );
}

export default AreaLogada;