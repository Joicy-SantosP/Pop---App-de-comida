import React, { useState, useEffect, useRef } from 'react';
import { ToastContainer, toast } from 'react-toastify';

import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import 'react-toastify/dist/ReactToastify.css';

let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

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

    
  console.log("O componente renderizou! A tela atual é:", telaAtual);
  /* ==================================================
   DADOS VARIADOS 
  ================================================== */
  const [produtos, setProdutos] = useState([]);
  const [restaurantes, setRestaurantes] = useState([]);
  const [abaPagamento, setAbaPagamento] = useState('site');
  const [modalPagamentoAberto, setModalPagamentoAberto] = useState(false);
  const [statusPagamento, setStatusPagamento] = useState('aguardando'); // Pode ser: 'aguardando', 'sucesso' ou 'erro'
  const [pedidoAtual, setPedidoAtual] = useState(null);
  const [pedidosAnteriores, setPedidosAnteriores] = useState([]);
  const [busca, setBusca] = useState('');
  const [sugestoes, setSugestoes] = useState([]);
  const [enderecoSelecionado, setEnderecoSelecionado] = useState(null);
  const [numero, setNumero] = useState('');
  const [semNumero, setSemNumero] = useState(false);
  const [complemento, setComplemento] = useState('');
  const [referencia, setReferencia] = useState('');
  const debounceTimer = useRef(null);
  const [carregandoMapa, setCarregandoMapa] = useState(false);
  const [pedidoAtivoId, setPedidoAtivoId] = useState(null);
  const [comentario, setComentario] = useState('');
  const [dadosEntrega, setDadosEntrega] = useState({
  taxaEntrega: 0,
  isFreteGratis: false,
  rua: '',
  cidadeEstado: '',
  tempoEstimado: ''
});
  const [emailUsuario, setEmailUsuario] = useState("usuario@exemplo.com");
  const imgPlaceholder = "https://via.placeholder.com/150";
  const produtosDaLoja = produtos.filter(p => Number(p.id_restaurante) === Number(lojaSelecionada?.id));
  const produtosEmDestaque = [...produtos].sort(() => Math.random() - 0.5).slice(0, 4);
  const [modalEnderecos, setModalEnderecos] = useState(false);
  const [listaEnderecos, setListaEnderecos] = useState([]);

  /* ==================================================
   PREÇOS
  ================================================== */

  const carregarProdutos = async () => {
    try {
      const resposta = await fetch('http://localhost:5000/produtos');
      if (!resposta.ok) {
        throw new Error(`Erro HTTP! status: ${resposta.status}`);
      }
      const dados = await resposta.json();
      console.log("PRODUTOS DO BANCO:", dados);
      setProdutos(dados);
    } catch (erro) {
      console.error("ERRO CRÍTICO AO BUSCAR PRODUTOS:", erro);
    }
  };

  /* ==================================================
   ENDEREÇOS
  ================================================== */
  const buscarEnderecos = async (texto) => {
    const valorLimpo = texto.replace(/\D/g, '');

    const onChangeBusca = (e) => {
      const valor = e.target.value;
      setBusca(valor);

      if (valor.length > 3) {
        buscarEnderecos(valor);
      } else {
        setSugestoes([]);
      }
    };

    if (valorLimpo.length === 8) {
      try {
        const res = await fetch(`http://127.0.0.1:5000/enderecos/cep/${valorLimpo}`);
        const dados = await res.json();
        
        if (!dados.erro) {
          const enderecoFormatado = {
            display_name: `${dados.logradouro}, ${dados.bairro} - ${dados.localidade}/${dados.uf}`,
            isCep: true,
            ...dados
          };
          setSugestoes([enderecoFormatado]);
          return;
        }
      } catch (err) {
        console.error("Erro na busca por CEP", err);
      }
    }

    if (texto.length > 3) {
      try {
        const response = await fetch(`http://127.0.0.1:5000/enderecos/buscar-sugestoes?q=${texto}`);
        const dados = await response.json();
        setSugestoes(dados);
      } catch (error) {
        console.error("Erro ao buscar sugestões", error);
      }
    }
  };

  const onChangeBusca = (e) => {
      const valor = e.target.value;
      setBusca(valor);
      if (debounceTimer.current) clearTimeout(debounceTimer.current);

      if (valor.length > 3) {
        debounceTimer.current = setTimeout(() => {
          buscarEnderecos(valor);
        }, 500); 
      } else {
        setSugestoes([]);
      }
  };
  
  function ChangeView({ center }) {
      const map = useMap();
      useEffect(() => {
        if (center[0] && center[1]) {
          console.log("Movendo mapa para:", center);
          map.setView(center, 18); // Zoom 18 é bem perto
        }
      }, [center]); // Importante: center deve ser a dependência
      return null;
    }

  const confirmarNumeroEAvancar = async () => {
    if (!semNumero && numero && enderecoSelecionado) {
      const logradouro = enderecoSelecionado.logradouro;
      const cidade = enderecoSelecionado.localidade || enderecoSelecionado.cidade;
      const queryComNumero = `${logradouro}, ${numero}, ${cidade}, Brasil`;
      
      try {
        let res = await fetch(`http://127.0.0.1:5000/enderecos/buscar-sugestoes?q=${encodeURIComponent(queryComNumero)}`);
        let dados = await res.json();

        if (dados && dados.length > 0) {
          setEnderecoSelecionado(prev => ({ ...prev, lat: parseFloat(dados[0].lat), lon: parseFloat(dados[0].lon) }));
        } else {
          console.log("Número não achado, tentando apenas a rua...");
          const queryApenasRua = `${logradouro}, ${cidade}, Brasil`;
          let resRua = await fetch(`http://127.0.0.1:5000/enderecos/buscar-sugestoes?q=${encodeURIComponent(queryApenasRua)}`);
          let dadosRua = await resRua.json();

          if (dadosRua && dadosRua.length > 0) {
            setEnderecoSelecionado(prev => ({
              ...prev,
              lat: parseFloat(dadosRua[0].lat),
              lon: parseFloat(dadosRua[0].lon)
            }));
          }
        }
      } catch (err) {
        console.error("Erro na busca:", err);
      }
    }
    setPassoEndereco(3);
  };

  const salvarEnderecoCompleto = async () => {
      const idLogado = localStorage.getItem('usuario_id');
      const payload = {
        usuario_id: 1,
        cep: enderecoSelecionado.cep || '00000-000',
        logradouro: enderecoSelecionado.logradouro,
        numero: semNumero ? 'S/N' : numero,
        bairro: enderecoSelecionado.bairro,
        cidade: enderecoSelecionado.localidade || enderecoSelecionado.cidade,
        estado: enderecoSelecionado.uf || enderecoSelecionado.estado,
        complemento: complemento,
        ponto_referencial: referencia,
        rotulo: tipoFavorito,
        latitude: enderecoSelecionado.lat,
        longitude: enderecoSelecionado.lon,
        principal: true
      };

      try {
          const response = await fetch('http://127.0.0.1:5000/enderecos/', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
          });

          const resultado = await response.json();

          if (response.ok) {
              setEnderecoSelecionado(resultado); 

              setDadosEntrega({
                rua: `${resultado.logradouro}, ${resultado.numero}`,
                cidadeEstado: `${resultado.cidade} - ${resultado.estado}`,
                tempoEstimado: "30-40 min",
                taxaEntrega: 0,
                isFreteGratis: false
            });
              await atualizarTaxaEntrega(resultado.id);
              alert("Endereço guardado com sucesso!");
              setModalEnderecoAberto(false);
          } else {
              alert("Erro ao guardar: " + resultado.erro);
          }
      } catch (error) {
          console.error("Erro:", error);
      }
  };

  const buscarEnderecosDoUsuario = async () => {
    const usuarioId = localStorage.getItem('usuario_id');
    try {
      const response = await fetch(`http://localhost:5000/enderecos/usuario/${usuarioId}`);
      const dados = await response.json();
      
      if (response.ok) {
        setListaEnderecos(dados);
        setModalEnderecos(true);
      } else {
        alert("Erro ao buscar endereços");
      }
    } catch (error) {
      console.error("Erro ao buscar endereços:", error);
      alert("Erro de conexão");
    }
  };

  const selecionarEndereco = async (endereco) => {
    // Atualiza o endereço selecionado
    setEnderecoSelecionado(endereco);
    
    // Atualiza os dados de entrega na tela
    setDadosEntrega({
      rua: `${endereco.logradouro}, ${endereco.numero || 'S/N'}`,
      cidadeEstado: `${endereco.cidade} - ${endereco.estado}`,
      taxaEntrega: 0,
      isFreteGratis: false,
      tempoEstimado: ''
    });
    
    // Fecha o modal
    setModalEnderecos(false);
    
    // Recalcula a taxa de entrega com o novo endereço
    if (pedidoAtivoId) {
      await atualizarTaxaEntrega(endereco.id, pedidoAtivoId);
    }
  };

const atualizarTaxaEntrega = async (enderecoId, pedidoIdOuRestauranteId) => {
  console.log("🔍 CALCULANDO TAXA COM:", { enderecoId, pedidoIdOuRestauranteId });

  try {
    const response = await fetch(
      'http://localhost:5000/pagamentos/calcular-taxa',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endereco_id: enderecoId,
          // Envia pedido_id SE existir, senão envia restaurante_id
          ...(pedidoIdOuRestauranteId && pedidoIdOuRestauranteId > 0 
            ? { pedido_id: pedidoIdOuRestauranteId }
            : { restaurante_id: itensCarrinho[0]?.restaurante_id }
          )
        })
      }
    );

    const data = await response.json();
    console.log("✅ RESPOSTA API TAXA:", data);

    if (data.taxaEntrega !== undefined) {
      setDadosEntrega(prev => ({
        ...prev,
        taxaEntrega: data.taxaEntrega,
        isFreteGratis: data.isFreteGratis || false,
        tempoEstimado: data.tempoEstimado || ''
      }));
    }
  } catch (error) {
    console.error("❌ Erro ao calcular taxa:", error);
  }
};

  /* ==================================================
   CARRINHO
  ================================================== */

  const recuperarCarrinho = async (id) => {
    const res = await fetch(`http://127.0.0.1:5000/pedidos/${id}/status`);
    const dados = await res.json();
    if (res.ok) {
      setItensCarrinho(dados.itens);
    }
  };

  const adicionarAoBanco = async () => {
    try {
      let pedidoId = pedidoAtivoId;

      if (!pedidoId) {
        const res = await fetch("http://127.0.0.1:5000/pedidos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            restaurante_id: lojaSelecionada.id,
            usuario_id: usuarioLogado.id 
          })
        });
        const novoPedido = await res.json();
        pedidoId = novoPedido.id;
        setPedidoAtivoId(pedidoId);
      }

      const resItem = await fetch(`http://127.0.0.1:5000/pedidos/${pedidoId}/itens`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doce_id: produtoSelecionado.id,
          quantidade: quantidadeProduto
        })
      });

      if (resItem.ok) {
        const pedidoAtualizado = await resItem.json();
        setItensCarrinho(pedidoAtualizado.itens); 
        alert("Item adicionado ao carrinho!");
        setProdutoSelecionado(null);
      }
    } catch (error) {
      console.error("Erro ao salvar pedido:", error);
    }
  };

  const handleAdicionarAoCarrinho = async () => {
    try {
      let idCarrinho = pedidoAtivoId;

      if (!idCarrinho) {
        const resCarrinho = await fetch("http://127.0.0.1:5000/pedidos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            restaurante_id: lojaSelecionada.id,
            usuario_id: 1, 
          }),
        });
        const dadosCarrinho = await resCarrinho.json();
        
        if (!resCarrinho.ok) throw new Error(dadosCarrinho.erro);
        
        idCarrinho = dadosCarrinho.id;
        setPedidoAtivoId(idCarrinho);
      }

      const resItem = await fetch(`http://127.0.0.1:5000/pedidos/${idCarrinho}/itens`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doce_id: produtoSelecionado.id,
          quantidade: quantidadeProduto,
          observacao: comentario,
        }),
      });

      const dadosPedido = await resItem.json();

      if (resItem.ok) {
        setItensCarrinho(dadosPedido.itens); 
        alert("Item adicionado ao carrinho!");
        setProdutoSelecionado(null);
        setQuantidadeProduto(1);
        setComentario('');
      } else {
        alert("Erro: " + dadosPedido.erro);
      }
    } catch (error) {
      console.error("Erro na integração:", error);
      alert("Falha ao conectar com o servidor.");
    }
  };

  const removerItemDoBanco = async (idItem) => {
    const idReal = typeof idItem === 'object' ? idItem.id : idItem;

    try {
      console.log("Tentando remover o item ID:", idReal);
      
      const res = await fetch(`http://127.0.0.1:5000/pedidos/itens/${idReal}`, {
        method: "DELETE"
      });

      if (res.ok) {
        const dadosAtualizados = await res.json();
        setItensCarrinho(dadosAtualizados.itens);
        alert("Item removido!");
      } else {
        console.error("Erro ao remover do banco");
      }
    } catch (error) {
      console.error("Erro na conexão:", error);
    }
  };

  /* ==================================================
   PAGAMENTO
  ================================================== */
  const handleFazerPedido = async () => {
      console.log("DEBUG CHECKOUT - Endereço Atual:", enderecoSelecionado, "ID Pedido:", pedidoAtivoId);
      if (!enderecoSelecionado || !enderecoSelecionado.id) {
          alert("O endereço selecionado ainda não foi salvo. Por favor, confirme o endereço no mapa antes de prosseguir.");
          setModalPagamentoAberto(false);
          return;
      }

      setModalPagamentoAberto(true);
      setStatusPagamento('aguardando');

      try {
          const dadosCheckout = {
              pedido_id: pedidoAtivoId,
              metodo_id: abaPagamento === 'site' ? 1 : 3,
              tipo_envio: 'entrega',
              subtotal: Number(itensCarrinho.reduce((acc, i) => acc + (i.preco_unitario * i.quantidade), 0)),
              endereco_id: enderecoSelecionado.id, 
              email_cliente:"cliente@venda.com"
          };
          console.log("DADOS QUE VÃO PARA O BACKEND:", JSON.stringify(dadosCheckout, null, 2));

          const response = await fetch("http://127.0.0.1:5000/pagamentos/checkout", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(dadosCheckout),
          });

          const dadosDoretorno = await response.json();

          if (response.ok) {
              if (abaPagamento === 'site' && dadosDoretorno.checkout_url) {
                  setTimeout(() => {
                      window.location.href = dadosDoretorno.checkout_url;
                  }, 1500);
              } else {
                  setStatusPagamento('sucesso');
                  setItensCarrinho([]);
                  setPedidoAtivoId(null);
              }
          } else {
              console.error("Detalhes do erro:", dadosDoretorno.erro);
              alert("Erro no checkout: " + dadosDoretorno.erro);
              setStatusPagamento('erro');
          }
      } catch (erro) {
          console.error("Erro na integração:", erro);
          setStatusPagamento('erro');
      }
  };

  /* ==================================================
   ENTREGA
  ================================================== */
  const handleDespacharPedido = async () => {
      if (!pedidoAtual || !enderecoSelecionado) {
          alert("Selecione um endereço antes!");
          return;
      }

      try {
          const response = await fetch(`http://127.0.0.1:5000/pedido/${pedidoAtual.id}/despachar`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  endereco_id: enderecoSelecionado.id,
                  entregador_codigo: 99,
                  taxa: 5.0
              })
          });

          const dados = await response.json();

          if (response.ok) {
              alert("Pedido despachado!");
              await carregarHistoricoPedidos(); 
          } else {
              alert(dados.erro);
              await carregarHistoricoPedidos();
          }
      } catch (error) {
          console.error("Erro no despacho:", error);
      }
  };

  const confirmarEntregaFinal = async () => {
      const codigo = prompt("Digite o código de confirmação:");
      if (!codigo) return;

      try {
          const response = await fetch(`http://127.0.0.1:5000/pedido/${pedidoAtual.id}/confirmar-entrega`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ codigo_verificacao: codigo })
          });

          const res = await response.json();
          if (response.ok) {
              toast.success('✅ Pedido entregue com sucesso!');
              localStorage.removeItem('pop_pedido_id');

              setPedidoAtual(null);
              setItensCarrinho([]);
              setPedidoAtivoId(null);

              await carregarHistoricoPedidos();
          } else {
              alert(res.erro);
          }
      } catch (e) {
          console.error(e);
      }
  };

  /* ==================================================
   STATUS PEDIDOS
  ================================================== */
  const carregarHistoricoPedidos = async () => {
    const usuarioId = localStorage.getItem('usuario_id');
    if (!usuarioId) return;

    try {
      const response = await fetch(`http://localhost:5000/usuarios/${usuarioId}/pedidos`);
      const dados = await response.json();

      if (response.ok) {
        const atual = dados.find(p => !['Entregue', 'CANCELADO'].includes(p.status));
        const anteriores = dados.filter(p => ['Entregue', 'CANCELADO'].includes(p.status));

        setPedidoAtual(atual || null);
        setPedidosAnteriores(anteriores);
      }
    } catch (error) {
      console.error("Erro ao buscar histórico:", error);
    }
  };

  const atualizarPedido = async () => {
    if (!pedidoAtual) return;
    try {
      const res = await fetch(`http://localhost:5000/pedidos/${pedidoAtual.id}/status`);
      const dados = await res.json();
      if (res.ok) {
        setPedidoAtual(dados);
        if (dados.status === 'Entregue') carregarHistoricoPedidos();
      }
    } catch (err) {
      console.error("Erro ao atualizar status:", err);
    }
  };

  const atualizarStatusPedido = async () => {

    if (!pedidoAtual) return;
    try {
      const statusAnterior = pedidoAtual.status;

      const res = await fetch(`http://localhost:5000/pedidos/${pedidoAtual.id}/status`);

      const dados = await res.json();

      if (res.ok) {
        setPedidoAtual(dados);
        if (dados.status !== statusAnterior) {
          if (dados.status === 'Em Preparação') {
            toast.info('🍰 Seu pedido está em preparação!');
          }
          if (dados.status === 'Pronto') {
            toast.success('🧁 Seu pedido está pronto!');
          }
          if (dados.status === 'Em Trânsito') {
            toast('🛵 Seu pedido saiu para entrega!');
          }
          if (dados.status === 'Entregue') {
            toast.success('✅ Pedido entregue!');
            carregarHistoricoPedidos();
          }
        }
      }
    } catch (err) {
      console.error("Erro ao atualizar status:", err);
    }
  };

  const calcularTotalComTaxa = (pedido) => {
    const subtotal = pedido.total || 0;
    const taxa = pedido.taxa_entrega || pedido.pagamento?.taxa_entrega || 0;
    return subtotal + taxa;
  };

  /*==================================================
  CANCELAR PEDIDO
  =====================================================*/
    const cancelarPedido = async () => {
    if (!pedidoAtivoId) {
      alert("Nenhum pedido ativo para cancelar.");
      return;
    }

    const confirmar = window.confirm("Tem certeza que deseja cancelar este pedido?");
    if (!confirmar) return;

    try {
      const response = await fetch(`http://127.0.0.1:5000/pedidos/${pedidoAtivoId}/cancelar`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" }
      });

      const dados = await response.json();

      if (response.ok) {
        // Limpa o carrinho
        setItensCarrinho([]);
        
        // Limpa o pedido ativo
        setPedidoAtivoId(null);
        
        // Remove do localStorage
        localStorage.removeItem('pop_pedido_id');
        
        // Reseta os dados de entrega
        setDadosEntrega({
          taxaEntrega: 0,
          isFreteGratis: false,
          rua: '',
          cidadeEstado: '',
          tempoEstimado: ''
        });
        
        alert("Pedido cancelado com sucesso!");
        
        // Redireciona para o dashboard
        setTelaAtual('dashboard');
      } else {
        alert("Erro ao cancelar: " + dados.erro);
      }
    } catch (error) {
      console.error("Erro ao cancelar pedido:", error);
      alert("Erro de conexão ao cancelar pedido.");
    }
  };

  /* ==================================================
   USeEFFECTS
  ================================================== */
  useEffect(() => {
      carregarProdutos();
      fetch("http://localhost:5000/restaurantes")
        .then(res => res.json())
        .then(data => {
          console.log("Lojas carregadas:", data);
          setRestaurantes(data);
        })
        .catch(err => console.error("Erro ao buscar lojas:", err));
    }, []);

  useEffect(() => {
      const idSalvo = localStorage.getItem('pop_pedido_id');
      if (idSalvo) {
        const idNum = parseInt(idSalvo);
        setPedidoAtivoId(idNum);
        recuperarCarrinho(idNum);
      }
    }, []);

  useEffect(() => {
      if (pedidoAtivoId) {
        localStorage.setItem('pop_pedido_id', pedidoAtivoId);
      } else {
        localStorage.removeItem('pop_pedido_id');
      }
  }, [pedidoAtivoId]);

  useEffect(() => {
    const verificarPagamento = async () => {

      if (!pedidoAtivoId) return;
      try {
        const response = await fetch(
          `http://127.0.0.1:5000/pagamentos/pedido/${pedidoAtivoId}`
        );

        const dados = await response.json();

        console.log("STATUS DO PAGAMENTO:", dados);

        if (
          dados.status === "Pagamento Confirmado"
        ) {

          setItensCarrinho([]);
          setPedidoAtivoId(null);
          localStorage.removeItem("pop_pedido_id");
          carregarHistoricoPedidos();
          console.log("Carrinho limpo!");
        }

      } catch (error) {
        console.error("Erro verificando pagamento:", error);
      }
    };
    verificarPagamento();

    const interval = setInterval(verificarPagamento, 5000);

    return () => clearInterval(interval);
  }, [pedidoAtivoId]);

  useEffect(() => {
  if (telaAtual === 'pedidos') {
    carregarHistoricoPedidos();
  }
  }, [telaAtual]);

  useEffect(() => {

    if (!pedidoAtual) return;

    const intervalo = setInterval(() => {
      atualizarStatusPedido();
    }, 10000); // 10 segundos

    return () => clearInterval(intervalo);

  }, [pedidoAtual]);

  useEffect(() => {
    console.log("🔄 VERIFICANDO SE DEVO CALCULAR TAXA:", {
      temEndereco: !!enderecoSelecionado?.id,
      temPedidoAtivoId: !!pedidoAtivoId,
      temItens: itensCarrinho.length > 0,
    });

    if (enderecoSelecionado?.id && pedidoAtivoId) {
      console.log("🚀 CHAMANDO atualizarTaxaEntrega com:", {
        enderecoId: enderecoSelecionado.id,
        pedidoId: pedidoAtivoId
      });
      atualizarTaxaEntrega(enderecoSelecionado.id, pedidoAtivoId);
    } else {
      console.warn("⚠️ Não foi possível calcular taxa - faltam dados");
    }
  }, [enderecoSelecionado, pedidoAtivoId, itensCarrinho]);

  useEffect(() => {
    const carregarDados = async () => {
      const usuarioId = localStorage.getItem('usuario_id');

      if (usuarioId) {
        try {
          const response = await fetch(`http://localhost:5000/enderecos/usuario/${usuarioId}`);
          const enderecos = await response.json();

          if (response.ok && enderecos.length > 0) {
            const principal = enderecos[0];
            setEnderecoSelecionado(principal);
            setDadosEntrega({
              rua: `${principal.logradouro}, ${principal.numero}`,
              cidadeEstado: `${principal.cidade} - ${principal.estado}`,
              taxaEntrega: principal.taxa_entrega_pre_calculada || 0.0, 
              isFreteGratis: false
            });
          }
        } catch (error) {
          console.error("Erro ao buscar endereço:", error);
        }
      }
    };

    carregarDados();
  }, []);

  console.log("Estado atual do enderecoSelecionado:", enderecoSelecionado);

  return (
    <>
      {/* TELAS LOGADAS (Dashboard, Pedidos, Tela do Restaurante) */}

{/*=================================NAVBAR===========================================================================*/}
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
              
              {/* === BOTÃO DE ENDEREÇOS === */}
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

{/*==============================CARRINHO========================================================================== */}
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
                                {item.quantidade} x {item.nome_doce}
                              </span>
                              <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                                R$ {item.subtotal.toFixed(2).replace('.', ',')}
                              </span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                              <span style={{ color: '#5dade2' }}>Item promocional</span>
                              <div style={{ display: 'flex', gap: '15px' }}>
                                <span style={{ color: '#ff3b3b', fontWeight: 'bold', cursor: 'pointer' }}>Editar</span>
                                <span 
                                  onClick={() => removerItemDoBanco(item.id)} 
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
                            R$ {itensCarrinho.reduce((acc, i) => acc + (i.preco_unitario * i.quantidade), 0).toFixed(2).replace('.', ',')}
                          </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#999', fontWeight: 'bold' }}>
                          <span>Taxa de entrega</span>
                          <span style={{ color: '#00b894' }}> {dadosEntrega.isFreteGratis
      ? "Grátis"
      : `R$ ${Number(dadosEntrega.taxaEntrega || 0)
          .toFixed(2)
          .replace('.', ',')}`
    }</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#000', fontWeight: 'bold', fontSize: '1.3rem', marginTop: '10px' }}>
                          <span>Total</span>
                          <span>
                            R$ {(
                                itensCarrinho.reduce((acc, i) => acc + (i.preco_unitario * i.quantidade), 0) + 
                                (dadosEntrega.isFreteGratis ? 0 : Number(dadosEntrega.taxaEntrega))
                            ).toFixed(2).replace('.', ',')}
                          </span>
                        </div>
                      </div>
                      
                      {/* Botões Finais */}
                        <button 
                        className="btn-pagamento"
                        onClick={() => {
                          if (itensCarrinho.length > 0) {
                            setTelaAtual('pagamento');
                          } else {
                            alert("Seu carrinho está vazio!");
                          }
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

{/*================================================ PAGAMENTO================================================== */}
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
                        <span onClick={buscarEnderecosDoUsuario} style={{ color: '#ff3b3b', cursor: 'pointer', fontWeight: 'bold' }}>Trocar</span>
                    </div>

                    {/* Box de Tempo de Entrega */}
                        <h4 style={{ marginTop: '20px' }}>{dadosEntrega.tempoEstimado}</h4>
                        <div style={{ display: 'flex', gap: '15px' }}>
                            <div className="box-tempo ativo">
                                <p className="tempo-titulo">Taxa de Entrega</p>
                                <p className="tempo-preco">
                                    {/* Lógica: Se o frete não for grátis, mostra o valor. Se for, mostra "Grátis" */}
                                    {Number(dadosEntrega.taxaEntrega || 0)
                                    .toFixed(2)
                                    .replace('.', ',')}
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
                              <h3 style={{ margin: '0 0 10px 0' }}>Pague com o Mercado Pago!</h3>
                              <p style={{ color: '#666', fontSize: '0.9rem' }}>É seguro pratico e você não perde nenhum minuto</p>
                              <button className="btn-outline-vermelho" onClick={handleFazerPedido}>Pagar com o Mercado Pago</button>
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

                  </div> )}
                  {/* CPF / CNPJ */}
                  <div style={{ marginTop: '20px' }}>
                      <label style={{ color: '#ff3b3b', fontWeight: 'bold' }}>CPF/CNPJ na nota</label>
                      <input type="text" className="input-cpf" />
                  </div>

                  {/* Botão Final */}
                  <button className="btn-fazer-pedido" onClick={handleFazerPedido}>Fazer Pedido</button>

                  <button 
                      onClick={cancelarPedido}
                      style={{
                        width: '100%',
                        padding: '12px',
                        marginTop: '15px',
                        backgroundColor: '#fff',
                        color: '#ff3b3b',
                        border: '2px solid #ff3b3b',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        fontSize: '1rem',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#fff5f5';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#fff';
                      }}
                    >
                      Cancelar Pedido
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
                                    <span>{item.quantidade} x {item.nome_doce}</span>
                                    <span style={{ color: '#333' }}>R$ {item.preco_unitario.toFixed(2).replace('.', ',')}</span>
                                </div>
                                
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
                    R$ {itensCarrinho.reduce((acc, i) => acc + (i.preco_unitario * i.quantidade), 0).toFixed(2).replace('.', ',')}
                </span>
            </div>
            
            <div className="linha-resumo" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', color: '#666' }}>
                <span className="texto-cinza">Taxa de entrega</span>
                <span style={{ color: '#2ecc71', fontWeight: 'bold' }}>
                    {dadosEntrega.isFreteGratis
                      ? "Grátis"
                      : `R$ ${Number(dadosEntrega.taxaEntrega || 0)
                          .toFixed(2)
                          .replace('.', ',')}`
                    }
                </span>
            </div>
            
            <div className="linha-resumo" style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.2rem', marginTop: '20px', color: '#000' }}>
                <span>Total</span>
                <span>
                    R$ {(
                        itensCarrinho.reduce(
                          (acc, i) => acc + (Number(i.preco_unitario) * Number(i.quantidade)),
                          0
                        ) + 
                        (dadosEntrega.isFreteGratis
                          ? 0
                          : Number(dadosEntrega.taxaEntrega || 0))
                    ).toFixed(2).replace('.', ',')}
                </span>
            </div>
        </div>
    </div>
</div>
                </div>
                )}

{/*===================================DASHBOARD============================================================ */}
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
                      {produtosEmDestaque.map((produto) => (
                        <div key={produto.id} style={{ flex: 1, backgroundColor: '#fff', borderRadius: '10px', padding: '15px', cursor: 'pointer' }}>
                          <div style={{ width: '100%', height: '140px', backgroundColor: '#e0e0e0', borderRadius: '8px', marginBottom: '15px' }}>
                             <img src={produto.imagem} alt={produto.nome} style={{width: '100%',height: '100%',objectFit: 'cover'}}/>
                          </div>
                          <h4 style={{ fontSize: '12px', fontWeight: 'bold', margin: '0 0 5px 0', color: '#000' }}>{produto.nome}</h4>
                          <p style={{ fontSize: '11px', textDecoration: 'line-through', color: '#ccc', margin: '0' }}>R${(produto.preco * 1.3).toFixed(2)}</p>
                          <p style={{ fontSize: '16px', fontWeight: 'bold', color: '#00b894', margin: '0' }}>R${Number(produto.preco).toFixed(2)}</p>
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
                            console.log("Loja clicada:", loja);
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
                          <div style={{ width: '70px', height: '70px', backgroundColor: '#fff', borderRadius: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', border: '1px solid #eee' }}>
                            {/* AJUSTE AQUI: campo 'imagem' em vez de 'logo' */}
                            <img 
                              src={loja.imagem || 'URL_DE_UMA_IMAGEM_PADRAO'} 
                              alt={loja.nome} 
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                            />
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

{/*===============================PEDIDOS======================================================*/} 
            {telaAtual === 'pedidos' && (
                <div style={{ padding: '40px', maxWidth: '900px', margin: '0 auto' }}>
                                  <button 
                  onClick={() => setTelaAtual('dashboard')}
                  style={{ 
                    marginBottom: '20px', padding: '8px 15px', borderRadius: '20px', 
                    border: '1px solid #ccc', background: 'white', cursor: 'pointer',
                    fontWeight: 'bold', color: '#666' 
                  }}> ← Voltar para o início</button>
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
                                            <img 
                                                src={pedidoAtual.itens[0]?.imagem || imgPlaceholder} 
                                                alt="Foto do pedido" 
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                            />
                                        </div>
                                        <span style={{ marginTop: '10px', fontWeight: 'bold', color: '#333' }}>
                                            R$ {calcularTotalComTaxa(pedidoAtual).toFixed(2).replace('.', ',')}
                                        </span>
                                    </div>

                                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span style={{ fontWeight: 'bold', color: '#a82424', fontSize: '1.1rem' }}>
                                                {pedidoAtual?.restaurante_nome || "Tortarugas"}
                                            </span>
                                        </div>
                                        
                                        {pedidoAtual.itens?.map((item, index) => (
                                            <div key={index} style={{ marginBottom: '10px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <span style={{ fontWeight: 'bold', color: '#a82424' }}>{item.nome_doce}</span>
                                                    <span style={{ fontWeight: 'bold', color: '#555', fontSize: '0.9rem' }}>Qtd: {item.quantidade}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <hr style={{ border: 'none', borderTop: '2px solid #fff', margin: '20px 0' }} />

                                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', color: '#000', fontSize: '0.95rem' }}>
                                    <span>Status: <span style={{ color: '#e67e22' }}>{pedidoAtual.status}</span></span>
                                    <span>Data: {pedidoAtual?.data}</span>
                                </div>

                                <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
                                    <button onClick={handleDespacharPedido} style={{ flex: 1, backgroundColor: '#ff3b3b', color: '#fff', border: 'none', padding: '12px', borderRadius: '30px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer' }}>
                                        Acompanhar entrega
                                    </button>
                                    
                                    {/* 👇 BOTÃO DE TESTE PARA SIMULAR A ENTREGA */}
                                    <button 
                                        onClick={confirmarEntregaFinal}
                                        style={{ flex: 1, backgroundColor: '#27ae60', color: '#fff', border: 'none', padding: '12px', borderRadius: '30px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer' }}
                                    >
                                        Concluir Pedido
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
                                                    <img 
                                                      src={pedidoAntigo.itens[0]?.imagem || imgPlaceholder}
                                                      alt="Pedido"
                                                      style={{
                                                          width: '100%',
                                                          height: '100%',
                                                          objectFit: 'cover',
                                                          borderRadius: '10px'
                                                      }}
                                                  />
                                                </div>
                                                <span style={{ marginTop: '10px', fontWeight: 'bold', color: '#333' }}>
                                                    R$ {calcularTotalComTaxa(pedidoAntigo).toFixed(2).replace('.', ',')}
                                                </span>
                                            </div>

                                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                                <span style={{ fontWeight: 'bold', color: '#a82424', fontSize: '1.1rem' }}>
                                                    {pedidoAntigo.restaurante_nome}
                                                </span>
                                                
                                                {pedidoAntigo.itens.map((item, idx) => (
                                                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                        <span style={{ fontWeight: 'bold', color: '#a82424' }}>{item.nome_doce}</span>
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

{/*=====================================PERFIL RESTAURANTES========================================*/}
            {/* --- NOVA TELA: DETALHES DO RESTAURANTE --- */}
            {telaAtual === 'tela-restaurante' && lojaSelecionada && (
              <div style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
                <button 
                  onClick={() => setTelaAtual('dashboard')}
                  style={{ 
                    marginBottom: '20px', padding: '8px 15px', borderRadius: '20px', 
                    border: '1px solid #ccc', background: 'white', cursor: 'pointer',
                    fontWeight: 'bold', color: '#666' 
                  }}
                >
                  ← Voltar para o início
                </button>
                
                {/* Cabeçalho do Restaurante */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '30px' }}>
                  <div style={{ 
                    width: '100px', height: '100px', backgroundColor: '#999', borderRadius: '50%', 
                    display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden'
                  }}>
                    <img src={lojaSelecionada.imagem} alt={lojaSelecionada.nome} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
                      {produtos
                        .filter(p => String(p.id_restaurante) === String(lojaSelecionada?.id))
                        .sort(() => 0.5 - Math.random()) // Embaralha a lista
                        .slice(0, 4) // Pega os 4 primeiros após embaralhar
                        .map((item) => (
                        <div key={item.id} style={{ backgroundColor: '#fff', padding: '15px', borderRadius: '8px', minWidth: '150px' }}>
                          <div style={{ width: '100%', height: '120px', backgroundColor: '#aaa', borderRadius: '5px', marginBottom: '10px' }}><img src={item.imagem} alt={item.nome} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div>
                          <p style={{ fontSize: '0.8rem', fontWeight: 'bold', margin: '0 0 5px 0' }}>{item.nome}</p>
                          <p style={{ fontSize: '0.7rem', color: '#999', textDecoration: 'line-through', margin: '0 0 2px 0' }}>R$ {(item.preco * 1.2).toFixed(2)}</p> {/* Preço fake maior */}
                          <p style={{ fontSize: '0.9rem', color: '#00b894', fontWeight: 'bold', margin: 0 }}>R$ {item.preco.toFixed(2)}</p>
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
                    {produtos.filter(p => Number(p.id_restaurante) === Number(lojaSelecionada?.id)).map((produto) => (
                      <div 
                        key={produto.id || produto.nome} 
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


{/*==============================PRODUTO SELECIONADO============================================================ */}
      {/* MODAL DE PRODUTO (POP-UP)*/}
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
                  value={comentario}
                  onChange={(e) => setComentario(e.target.value)}
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
                  onClick={handleAdicionarAoCarrinho}
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

{/*================================CADASTRO DE ENDEREÇO====================================================== */}
      {/* MODAL DE CADASTRO DE ENDEREÇO*/}
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
                  <input type="text" value={busca} onChange={(e) => {setBusca(e.target.value); buscarEnderecos(e.target.value);} }placeholder="Buscar endereço e numero" style={{ border: 'none', backgroundColor: 'transparent', outline: 'none', width: '100%', color: '#ff4d6d', fontWeight: 'bold', fontSize: '1rem' }} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {sugestoes.length > 0 && (
                    <div style={{ 
                      backgroundColor: '#fff', 
                      borderRadius: '8px', 
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      marginTop: '-25px', // Para colar no input
                      marginBottom: '20px',
                      maxHeight: '200px',
                      overflowY: 'auto'
                    }}>
                      {sugestoes.map((item, index) => (
                        <div 
                          key={index} 
                          onClick={async () => {
                            console.log("Item clicado:", item);

                            try {
                              if (item.isCep) {
                                try {
                                  // Tentativa 1: Rua + Bairro + Cidade (Geralmente a mais precisa para Leaflet)
                                  const queryRua = `${item.logradouro}, ${item.bairro}, ${item.localidade}, SP, Brasil`;
                                  const res = await fetch(`http://127.0.0.1:5000/enderecos/buscar-sugestoes?q=${encodeURIComponent(queryRua)}`);
                                  const dados = await res.json();

                                  if (dados && dados.length > 0) {
                                    setEnderecoSelecionado({
                                      ...item,
                                      lat: parseFloat(dados[0].lat),
                                      lon: parseFloat(dados[0].lon),
                                    });
                                  } else {
                                    // Fallback: Apenas CEP como você já tinha, mas com zoom menor se falhar
                                    const queryCep = `${item.cep}, Brasil`;
                                    const resCep = await fetch(`http://127.0.0.1:5000/enderecos/buscar-sugestoes?q=${encodeURIComponent(queryCep)}`);
                                    const dadosCep = await resCep.json();
                                    
                                    setEnderecoSelecionado({
                                      ...item,
                                      lat: dadosCep[0]?.lat || -23.7174, 
                                      lon: dadosCep[0]?.lon || -46.8497
                                    });
                                  }
                                } catch (e) {
                                  console.error("Erro na busca de coordenadas:", e);
                                }
                              } else {
                                setEnderecoSelecionado(item);
                              }
                              setPassoEndereco(2);
                            } catch (error) {
                              console.error("Erro ao processar clique:", error);
                              setPassoEndereco(2);
                            }}}
                          style={{ 
                            padding: '12px', 
                            borderBottom: '1px solid #eee', 
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            color: '#333'
                          }}>
                          📍 {item.display_name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* --- PASSO 2: INFORMAR NÚMERO --- */}
            {passoEndereco === 2 && (
              <div style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
                <h3 style={{ textAlign: 'center', marginBottom: '20px', fontSize: '1.2rem' }}>Informe seu numero do endereço</h3>
                <p style={{ textAlign: 'center', fontWeight: 'bold', marginBottom: '20px', fontSize: '1rem' }}>{enderecoSelecionado?.display_name.split(',').slice(0, 2).join(',')}</p>
                
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '30px' }}>
                  <input 
                    type="text" 
                    placeholder="informe o numero" 
                    value={semNumero ? 'S/N' : numero}
                    disabled={semNumero}
                    onChange={(e) => setNumero(e.target.value)}
                    style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '15px', width: '250px', textAlign: 'center', fontSize: '1.1rem', marginBottom: '15px' }} 
                  />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <label style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Não possuí numero</label>
                    <input id="checkSemNumero" type="checkbox" checked={semNumero} onChange={(e) => setSemNumero(e.target.checked)} style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
                  </div>
                </div>

                <button onClick={confirmarNumeroEAvancar} disabled={!numero && !semNumero} style={{ width: '100%', backgroundColor: '#ff4d6d', color: '#fff', border: 'none', borderRadius: '8px', padding: '15px', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer' }}>Buscar com numero</button>
              </div>
            )}

            {/* --- PASSO 3: CONFIRMAR NO MAPA */}
            {passoEndereco === 3 && enderecoSelecionado?.lat && (
              <div style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
                <h3 style={{ textAlign: 'center', marginBottom: '20px', fontSize: '1.4rem', fontWeight: 'bold' }}>Confirme a localização do endereço</h3>
                
                {/* 📍 CONTAINER DO MAPA (A API vai entrar exatamente nesta div) */}
                {enderecoSelecionado?.lat && enderecoSelecionado?.lon ? (
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
                  
                <MapContainer center={[enderecoSelecionado.lat, enderecoSelecionado.lon]} zoom={18} style={{ height: '300px', width: '100%' }}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Marker position={[enderecoSelecionado.lat, enderecoSelecionado.lon]} draggable={true}
                    eventHandlers={{
                      dragend: (e) => {
                        const marker = e.target;
                        const position = marker.getLatLng();
                        setEnderecoSelecionado(prev => ({
                          ...prev,
                          lat: position.lat,
                          lon: position.lng
                        }));
                      },
                    }}
                  />
                  <ChangeView center={[parseFloat(enderecoSelecionado.lat), parseFloat(enderecoSelecionado.lon)]}/>
                </MapContainer>

                </div>) : (
                      <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0f0f0', borderRadius: '15px', marginBottom: '20px' }}>
                        <p>Carregando mapa...</p>
                      </div>
                    ) }
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
                    }}>🏠 Casa</button>

                  <button 
                    onClick={() => setTipoFavorito('trabalho')}
                    style={{ 
                      flex: 1, padding: '12px', borderRadius: '8px', 
                      border: tipoFavorito === 'trabalho' ? '2px solid #ff4d6d' : '1px solid #ccc', 
                      backgroundColor: tipoFavorito === 'trabalho' ? '#fff0f3' : '#fff', 
                      color: tipoFavorito === 'trabalho' ? '#ff4d6d' : '#777', 
                      fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}>📄 Trabalho</button>
                </div>

                <button 
                    onClick={salvarEnderecoCompleto}
                  style={{ 
                    width: '100%', backgroundColor: '#ff4d6d', color: '#fff', 
                    border: 'none', borderRadius: '10px', padding: '15px', 
                    fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer',
                    boxShadow: '0 4px 10px rgba(255, 77, 109, 0.2)'
                  }}>Confirmar localização</button>
              </div>
            )}
          </div>
          
        </div>
      )}
      {/* ========== MODAL DE TROCA DE ENDEREÇO ========== */}
          {modalEnderecos && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: 'rgba(0,0,0,0.5)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 9999
            }}>
              <div style={{
                backgroundColor: '#fff',
                borderRadius: '15px',
                padding: '30px',
                width: '90%',
                maxWidth: '500px',
                maxHeight: '80vh',
                overflowY: 'auto',
                boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
              }}>
                
                {/* Cabeçalho do Modal */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginBottom: '25px'
                }}>
                  <h3 style={{ margin: 0, color: '#ff3b3b', fontSize: '1.3rem' }}>
                    📍 Selecione o endereço de entrega
                  </h3>
                  <span 
                    onClick={() => setModalEnderecos(false)}
                    style={{ 
                      fontSize: '1.5rem', 
                      cursor: 'pointer', 
                      color: '#999',
                      fontWeight: 'bold'
                    }}
                  >
                    ✕
                  </span>
                </div>

                {/* Lista de Endereços */}
                {listaEnderecos.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '30px' }}>
                    <p style={{ color: '#999', fontSize: '1.1rem' }}>Nenhum endereço cadastrado</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {listaEnderecos.map(endereco => (
                      <div
                        key={endereco.id}
                        onClick={() => selecionarEndereco(endereco)}
                        style={{
                          padding: '15px',
                          border: `2px solid ${endereco.id === enderecoSelecionado?.id ? '#ff3b3b' : '#eaeaea'}`,
                          borderRadius: '10px',
                          cursor: 'pointer',
                          backgroundColor: endereco.id === enderecoSelecionado?.id ? '#fff5f5' : '#fff',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = '#ff3b3b';
                          e.currentTarget.style.backgroundColor = '#fff5f5';
                        }}
                        onMouseLeave={(e) => {
                          if (endereco.id !== enderecoSelecionado?.id) {
                            e.currentTarget.style.borderColor = '#eaeaea';
                            e.currentTarget.style.backgroundColor = '#fff';
                          }
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
                          <span style={{ fontSize: '1.5rem' }}>📍</span>
                          <div>
                            <p style={{ fontWeight: 'bold', margin: 0, fontSize: '1rem' }}>
                              {endereco.logradouro}, {endereco.numero || 'S/N'}
                            </p>
                            <p style={{ margin: '3px 0 0 0', color: '#666', fontSize: '0.9rem' }}>
                              {endereco.bairro} - {endereco.cidade}/{endereco.estado}
                            </p>
                          </div>
                        </div>
                        
                        {endereco.complemento && (
                          <p style={{ 
                            margin: '5px 0 0 35px', 
                            fontSize: '0.8rem', 
                            color: '#999',
                            fontStyle: 'italic'
                          }}>
                            "{endereco.complemento}"
                          </p>
                        )}
                        
                        {endereco.id === enderecoSelecionado?.id && (
                          <p style={{ 
                            margin: '10px 0 0 35px', 
                            fontSize: '0.8rem', 
                            color: '#ff3b3b',
                            fontWeight: 'bold'
                          }}>
                            ✅ Endereço atual
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Botão Cancelar */}
                <button
                  onClick={() => setModalEnderecos(false)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    marginTop: '20px',
                    backgroundColor: '#f5f5f5',
                    color: '#333',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '1rem'
                  }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

{/*=========================================STATUS PAGAMENTO========================================================*/}
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
                                    total: (
                                        itensCarrinho.reduce(
                                            (acc, i) =>
                                                acc + (Number(i.preco_unitario) * Number(i.quantidade)),
                                            0
                                        ) +
                                        (dadosEntrega.isFreteGratis
                                            ? 0
                                            : Number(dadosEntrega.taxaEntrega || 0))
                                    ).toFixed(2).replace('.', ',')
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
    <ToastContainer />
          </>
      );
    }

export default AreaLogada;