from flask import Blueprint, request, jsonify
from config import db
from datetime import datetime
from sqlalchemy import func, extract
from restaurantes.restaurante_model import Restaurantes
from pedidos.pedido_model import Pedido, ItemPedido
from entregadores.entregadores_model import Entregador
from entrega.entrega_model import Entrega
from usuarios.usuario_model import Usuario
from endereco.endereco_model import Endereco

relatorio_bp = Blueprint('relatorio', __name__, url_prefix='/api/relatorio')


@relatorio_bp.route('/dashboard', methods=['GET'])
def relatorio_completo():
    """Relatório completo com dados de restaurantes, produtos e entregadores"""
    try:
        mes = request.args.get('mes', datetime.now().month, type=int)
        ano = request.args.get('ano', datetime.now().year, type=int)
        
        # ==================== 1. RELATÓRIO DE RESTAURANTES ====================
        restaurantes = Restaurantes.query.all()
        dados_restaurantes = []
        
        for rest in restaurantes:
            # Busca pedidos ENTREGUES do restaurante no período (não cancelados)
            pedidos_mes = Pedido.query.filter(
                Pedido.restaurante_id == rest.id,
                extract('month', Pedido.data_preparo_inicio) == mes,
                extract('year', Pedido.data_preparo_inicio) == ano,
                Pedido.status == 'Entregue'  # ← ALTERADO para 'Entregue'
            ).all()
            
            # Faturamento total
            faturamento = sum(p.total for p in pedidos_mes)
            
            # Maior cidade de entrega
            maior_cidade = db.session.query(
                Endereco.cidade,
                func.count(Pedido.id).label('total_pedidos')
            ).join(Usuario, Pedido.usuario_id == Usuario.id)\
             .join(Endereco, Usuario.id == Endereco.usuario_id)\
             .filter(
                 Pedido.restaurante_id == rest.id,
                 extract('month', Pedido.data_preparo_inicio) == mes,
                 extract('year', Pedido.data_preparo_inicio) == ano,
                 Pedido.status == 'Entregue',  # ← ALTERADO
                 Endereco.principal == True
             )\
             .group_by(Endereco.cidade)\
             .order_by(func.count(Pedido.id).desc())\
             .first()
            
            # Maior bairro de entrega
            maior_bairro = db.session.query(
                Endereco.bairro,
                func.count(Pedido.id).label('total_pedidos')
            ).join(Usuario, Pedido.usuario_id == Usuario.id)\
             .join(Endereco, Usuario.id == Endereco.usuario_id)\
             .filter(
                 Pedido.restaurante_id == rest.id,
                 extract('month', Pedido.data_preparo_inicio) == mes,
                 extract('year', Pedido.data_preparo_inicio) == ano,
                 Pedido.status == 'Entregue',  # ← ALTERADO
                 Endereco.principal == True
             )\
             .group_by(Endereco.bairro)\
             .order_by(func.count(Pedido.id).desc())\
             .first()
            
            dados_restaurantes.append({
                'nome': rest.nome,
                'qtd_pedidos_mes': len(pedidos_mes),
                'maior_cidade': maior_cidade[0] if maior_cidade else 'Não identificado',
                'maior_bairro': maior_bairro[0] if maior_bairro else 'Não identificado',
                'faturamento_mes': round(faturamento, 2),
                'imagem': rest.imagem,
                'especialidade': rest.especialidade
            })
        
        # ==================== 2. PRODUTOS MAIS VENDIDOS ====================
        produtos_mais_vendidos = db.session.query(
            Restaurantes.nome.label('restaurante'),
            ItemPedido.nome_doce.label('produto'),
            func.sum(ItemPedido.quantidade).label('quantidade_total'),
            func.sum(ItemPedido.quantidade * ItemPedido.preco_unitario).label('faturamento_total')
        ).join(Pedido, ItemPedido.pedido_id == Pedido.id)\
         .join(Restaurantes, Pedido.restaurante_id == Restaurantes.id)\
         .filter(
             extract('month', Pedido.data_preparo_inicio) == mes,
             extract('year', Pedido.data_preparo_inicio) == ano,
             Pedido.status == 'Entregue'  # ← ALTERADO
         )\
         .group_by(Restaurantes.id, ItemPedido.nome_doce)\
         .order_by(Restaurantes.id, func.sum(ItemPedido.quantidade).desc())\
         .all()
        
        # Pega top 1 produto por restaurante
        top_produtos_por_restaurante = []
        restaurantes_vistos = set()
        
        for item in produtos_mais_vendidos:
            if item.restaurante not in restaurantes_vistos:
                restaurantes_vistos.add(item.restaurante)
                top_produtos_por_restaurante.append({
                    'restaurante': item.restaurante,
                    'produto_mais_vendido': item.produto,
                    'quantidade_pedidos': int(item.quantidade_total),
                    'faturamento_produto': round(item.faturamento_total, 2)
                })
        
        # ==================== 3. RELATÓRIO DE ENTREGADORES ====================
        entregadores = Entregador.query.all()
        dados_entregadores = []
        
        for entregador in entregadores:
            # Busca entregas concluídas no período (baseado nas entregas com data_conclusao)
            entregas_mes = Entrega.query.filter(
                Entrega.entregador_id == entregador.id,
                extract('month', Entrega.data_conclusao) == mes,
                extract('year', Entrega.data_conclusao) == ano,
                Entrega.data_conclusao.isnot(None)
            ).all()
            
            # Maior cidade de entrega
            maior_cidade_entrega = db.session.query(
                Endereco.cidade,
                func.count(Entrega.id).label('total_entregas')
            ).join(Pedido, Entrega.pedido_id == Pedido.id)\
             .join(Usuario, Pedido.usuario_id == Usuario.id)\
             .join(Endereco, Usuario.id == Endereco.usuario_id)\
             .filter(
                 Entrega.entregador_id == entregador.id,
                 extract('month', Entrega.data_conclusao) == mes,
                 extract('year', Entrega.data_conclusao) == ano,
                 Entrega.data_conclusao.isnot(None),
                 Endereco.principal == True
             )\
             .group_by(Endereco.cidade)\
             .order_by(func.count(Entrega.id).desc())\
             .first()
            
            dados_entregadores.append({
                'nome': entregador.nome,
                'qtd_entregas_mes': len(entregas_mes),
                'maior_cidade': maior_cidade_entrega[0] if maior_cidade_entrega else 'Não identificado',
                'veiculo': entregador.veiculo,
                'status': entregador.status,
                'disponivel': entregador.disponivel
            })
        
        return jsonify({
            'success': True,
            'data': {
                'restaurantes': dados_restaurantes,
                'produtos_mais_vendidos': top_produtos_por_restaurante,
                'entregadores': dados_entregadores
            },
            'filtros': {
                'mes': mes,
                'ano': ano
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@relatorio_bp.route('/restaurantes', methods=['GET'])
def relatorio_restaurantes():
    """Relatório específico de restaurantes"""
    try:
        mes = request.args.get('mes', datetime.now().month, type=int)
        ano = request.args.get('ano', datetime.now().year, type=int)
        
        restaurantes = Restaurantes.query.all()
        dados = []
        
        for rest in restaurantes:
            # Pedidos ENTREGUES no período (não cancelados)
            pedidos_mes = Pedido.query.filter(
                Pedido.restaurante_id == rest.id,
                extract('month', Pedido.data_preparo_inicio) == mes,
                extract('year', Pedido.data_preparo_inicio) == ano,
                Pedido.status == 'Entregue'  # ← ALTERADO
            ).all()
            
            faturamento = sum(p.total for p in pedidos_mes)
            
            # Distribuição por cidade (apenas entregues)
            cidades = db.session.query(
                Endereco.cidade,
                func.count(Pedido.id).label('total')
            ).join(Usuario, Pedido.usuario_id == Usuario.id)\
             .join(Endereco, Usuario.id == Endereco.usuario_id)\
             .filter(
                 Pedido.restaurante_id == rest.id,
                 extract('month', Pedido.data_preparo_inicio) == mes,
                 extract('year', Pedido.data_preparo_inicio) == ano,
                 Pedido.status == 'Entregue',  # ← ALTERADO
                 Endereco.principal == True
             )\
             .group_by(Endereco.cidade)\
             .order_by(func.count(Pedido.id).desc())\
             .all()
            
            dados.append({
                'nome': rest.nome,
                'qtd_pedidos_mes': len(pedidos_mes),
                'faturamento_mes': round(faturamento, 2),
                'distribuicao_cidades': [
                    {'cidade': cidade[0], 'total': cidade[1]} 
                    for cidade in cidades
                ],
                'cidade_principal': cidades[0][0] if cidades else 'N/A',
                'especialidade': rest.especialidade,
                'bairro_restaurante': rest.bairro
            })
        
        return jsonify({
            'success': True,
            'data': dados,
            'filtros': {'mes': mes, 'ano': ano}
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@relatorio_bp.route('/entregadores', methods=['GET'])
def relatorio_entregadores():
    """Relatório específico de entregadores"""
    try:
        mes = request.args.get('mes', datetime.now().month, type=int)
        ano = request.args.get('ano', datetime.now().year, type=int)
        
        entregadores = Entregador.query.all()
        dados = []
        
        for entregador in entregadores:
            entregas_mes = Entrega.query.filter(
                Entrega.entregador_id == entregador.id,
                extract('month', Entrega.data_conclusao) == mes,
                extract('year', Entrega.data_conclusao) == ano,
                Entrega.data_conclusao.isnot(None)
            ).all()
            
            # Distribuição por cidade
            cidades = db.session.query(
                Endereco.cidade,
                func.count(Entrega.id).label('total')
            ).join(Pedido, Entrega.pedido_id == Pedido.id)\
             .join(Usuario, Pedido.usuario_id == Usuario.id)\
             .join(Endereco, Usuario.id == Endereco.usuario_id)\
             .filter(
                 Entrega.entregador_id == entregador.id,
                 extract('month', Entrega.data_conclusao) == mes,
                 extract('year', Entrega.data_conclusao) == ano,
                 Entrega.data_conclusao.isnot(None),
                 Endereco.principal == True
             )\
             .group_by(Endereco.cidade)\
             .order_by(func.count(Entrega.id).desc())\
             .all()
            
            dados.append({
                'nome': entregador.nome,
                'qtd_entregas_mes': len(entregas_mes),
                'maior_cidade': cidades[0][0] if cidades else 'Não identificado',
                'distribuicao_cidades': [
                    {'cidade': cidade[0], 'total': cidade[1]} 
                    for cidade in cidades
                ],
                'veiculo': entregador.veiculo,
                'status': entregador.status
            })
        
        return jsonify({
            'success': True,
            'data': dados,
            'filtros': {'mes': mes, 'ano': ano}
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@relatorio_bp.route('/dashboard/resumo', methods=['GET'])
def relatorio_resumido():
    """Versão resumida do dashboard para cards/KPIs"""
    try:
        mes = request.args.get('mes', datetime.now().month, type=int)
        ano = request.args.get('ano', datetime.now().year, type=int)
        
        # Total de pedidos ENTREGUES no período
        total_pedidos = Pedido.query.filter(
            extract('month', Pedido.data_preparo_inicio) == mes,
            extract('year', Pedido.data_preparo_inicio) == ano,
            Pedido.status == 'Entregue'  # ← ALTERADO
        ).count()
        
        # Faturamento total (apenas entregues)
        faturamento_total = db.session.query(
            func.sum(Pedido.total)
        ).filter(
            extract('month', Pedido.data_preparo_inicio) == mes,
            extract('year', Pedido.data_preparo_inicio) == ano,
            Pedido.status == 'Entregue'  # ← ALTERADO
        ).scalar() or 0
        
        # Total de entregas
        total_entregas = Entrega.query.filter(
            extract('month', Entrega.data_conclusao) == mes,
            extract('year', Entrega.data_conclusao) == ano,
            Entrega.data_conclusao.isnot(None)
        ).count()
        
        # Restaurantes ativos
        restaurantes_ativos = Restaurantes.query.filter_by(aberto=True).count()
        
        # Ticket médio
        ticket_medio = faturamento_total / total_pedidos if total_pedidos > 0 else 0
        
        # Cidade com mais pedidos
        cidade_top = db.session.query(
            Endereco.cidade,
            func.count(Pedido.id).label('total')
        ).join(Usuario, Pedido.usuario_id == Usuario.id)\
         .join(Endereco, Usuario.id == Endereco.usuario_id)\
         .filter(
             extract('month', Pedido.data_preparo_inicio) == mes,
             extract('year', Pedido.data_preparo_inicio) == ano,
             Pedido.status == 'Entregue',  # ← ALTERADO
             Endereco.principal == True
         )\
         .group_by(Endereco.cidade)\
         .order_by(func.count(Pedido.id).desc())\
         .first()
        
        return jsonify({
            'success': True,
            'data': {
                'total_pedidos': total_pedidos,
                'faturamento_total': round(faturamento_total, 2),
                'total_entregas': total_entregas,
                'restaurantes_ativos': restaurantes_ativos,
                'ticket_medio': round(ticket_medio, 2),
                'cidade_destaque': cidade_top[0] if cidade_top else 'N/A',
                'periodo': f'{mes}/{ano}'
            }
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500