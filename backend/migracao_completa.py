"""
Script de migração para adicionar todas as novas colunas necessárias
COMPATÍVEL COM SQLITE
Executar: python migracao_completa.py
"""
from app import app, db
from sqlalchemy import text, inspect

def verificar_coluna_sqlite(tabela, coluna):
    """Verifica se uma coluna existe na tabela (SQLite)"""
    with app.app_context():
        try:
            resultado = db.session.execute(text(f"PRAGMA table_info({tabela})")).fetchall()
            # PRAGMA retorna: (cid, name, type, notnull, dflt_value, pk)
            colunas = [row[1] for row in resultado]
            return coluna in colunas
        except Exception as e:
            print(f"Erro ao verificar coluna {coluna}: {e}")
            return False

def adicionar_coluna_sqlite(tabela, coluna, tipo, default=None):
    """Adiciona uma coluna se ela não existir (SQLite)"""
    if verificar_coluna_sqlite(tabela, coluna):
        print(f"ℹ️  Coluna '{coluna}' já existe em '{tabela}'")
        return False
    
    try:
        sql = f"ALTER TABLE {tabela} ADD COLUMN {coluna} {tipo}"
        if default is not None:
            if isinstance(default, str) and default.startswith("'"):
                sql += f" DEFAULT {default}"
            elif isinstance(default, str):
                sql += f" DEFAULT '{default}'"
            else:
                sql += f" DEFAULT {default}"
        
        db.session.execute(text(sql))
        db.session.commit()
        print(f"✅ Coluna '{coluna}' adicionada em '{tabela}'")
        return True
    except Exception as e:
        print(f"❌ Erro ao adicionar '{coluna}': {e}")
        db.session.rollback()
        return False

def verificar_foreign_key(tabela, coluna):
    """Verifica se uma FK existe (SQLite)"""
    with app.app_context():
        try:
            resultado = db.session.execute(text(f"PRAGMA foreign_key_list({tabela})")).fetchall()
            # PRAGMA retorna: (id, seq, table, from, to, on_update, on_delete, match)
            for row in resultado:
                if row[3] == coluna:  # row[3] é o 'from' (coluna local)
                    return True
            return False
        except:
            return False

def migrar():
    with app.app_context():
        print("=" * 60)
        print("🚀 INICIANDO MIGRAÇÃO DO BANCO DE DADOS (SQLite)")
        print("=" * 60)
        
        # 1. Migrações da tabela 'pedidos'
        print("\n📦 Migrando tabela 'pedidos'...")
        adicionar_coluna_sqlite('pedidos', 'tipo_retirada', "VARCHAR(20)", "'entrega'")
        adicionar_coluna_sqlite('pedidos', 'status_preparo', "VARCHAR(30)", "'confirmado'")
        adicionar_coluna_sqlite('pedidos', 'numero_senha', "VARCHAR(6)")
        
        # 2. Migrações da tabela 'entregas'
        print("\n🛵 Migrando tabela 'entregas'...")
        
        # Verifica se a coluna antiga 'entregador_codigo' existe
        if verificar_coluna_sqlite('entregas', 'entregador_codigo'):
            print("⚠️  Coluna antiga 'entregador_codigo' encontrada.")
            print("ℹ️  Mantendo coluna antiga e adicionando nova 'entregador_id'...")
        
        # Adiciona a nova coluna
        adicionar_coluna_sqlite('entregas', 'entregador_id', "INTEGER")
        
        # 3. Migrações da tabela 'entregadores'
        print("\n👤 Migrando tabela 'entregadores'...")
        adicionar_coluna_sqlite('entregadores', 'disponivel', "BOOLEAN", "1")  # SQLite usa 0/1 para boolean
        adicionar_coluna_sqlite('entregadores', 'login_token', "VARCHAR(6)")
        adicionar_coluna_sqlite('entregadores', 'login_token_expiration', "DATETIME")
        
        print("\n" + "=" * 60)
        print("🎉 MIGRAÇÃO CONCLUÍDA COM SUCESSO!")
        print("=" * 60)
        
        # 4. Mostrar resumo das tabelas
        print("\n📊 RESUMO DAS TABELAS:")
        tabelas = ['pedidos', 'entregas', 'entregadores']
        for tabela in tabelas:
            try:
                colunas = db.session.execute(text(f"PRAGMA table_info({tabela})")).fetchall()
                print(f"\n📋 {tabela.upper()}:")
                for col in colunas:
                    # (cid, name, type, notnull, dflt_value, pk)
                    print(f"   - {col[1]}: {col[2]}", end="")
                    if col[4] is not None:
                        print(f" (default: {col[4]})", end="")
                    if col[5] == 1:
                        print(" [PK]", end="")
                    print()
            except Exception as e:
                print(f"\n❌ Erro ao ler tabela '{tabela}': {e}")
        
        # 5. Verificar dados existentes
        print("\n📊 DADOS EXISTENTES:")
        try:
            from pedidos.pedido_model import Pedido
            from entregadores.entregadores_model import Entregador
            
            total_pedidos = Pedido.query.count()
            total_entregadores = Entregador.query.count()
            print(f"   - Total de pedidos: {total_pedidos}")
            print(f"   - Total de entregadores: {total_entregadores}")
            
            if total_pedidos > 0:
                print("\n⚠️  ATUALIZANDO PEDIDOS EXISTENTES...")
                # Atualiza pedidos existentes com valores padrão
                db.session.execute(text(
                    "UPDATE pedidos SET tipo_retirada='entrega' WHERE tipo_retirada IS NULL"
                ))
                db.session.execute(text(
                    "UPDATE pedidos SET status_preparo='confirmado' WHERE status_preparo IS NULL"
                ))
                db.session.commit()
                print("✅ Pedidos atualizados com valores padrão!")
                
        except Exception as e:
            print(f"ℹ️  Não foi possível verificar dados: {e}")

if __name__ == '__main__':
    migrar()