import os
import sqlite3
from datetime import datetime

import psycopg2
import psycopg2.extras


SQLITE_PATH = os.environ.get('SQLITE_PATH', 'db_prodcumaru.db')
PG_URL = os.environ.get('DATABASE_URL')


def to_date(val):
    if val is None:
        return None
    s = str(val).strip()
    if not s:
        return None
    # tenta YYYY-MM-DD
    for fmt in ('%Y-%m-%d', '%d/%m/%Y', '%Y/%m/%d'):
        try:
            return datetime.strptime(s, fmt).date()
        except Exception:
            pass
    return None


def to_float(val):
    if val is None:
        return None
    try:
        return float(val)
    except Exception:
        return None


def to_int(val):
    if val is None:
        return None
    try:
        return int(str(val).strip())
    except Exception:
        return None


CONVERSIONS = {
    'tb_clientes_fisico': {
        'data_nasc': to_date,
        'data_cad': to_date,
    },
    'tb_clientes_juridicos': {
        'data_cad': to_date,
    },
    'tb_conteudo': {
        'data_inclusao': to_date,
        'data_exclusao': to_date,
    },
    'tb_contratos': {},
    'tb_financas': {
        'data_emissao': to_date,
        'data_vencimento': to_date,
        'valor_total': to_float,
    },
    'tb_funcionarios': {
        'data_admis': to_date,
    },
    'tb_reg_agendamentos': {
        'data_agend': to_date,
        'valor_total': to_float,
    },
    'tb_forma_pag': {},
    'tb_servicos': {
        'preco': to_float,
        'duracao_minutos': to_int,
    },
    'tb_itens_pedido': {
        'preco_unitario': to_float,
        'subtotal': to_float,
    },
    'tb_pedido': {
        'data_pedido': to_date,
        'subtotal': to_float,
        'frete': to_float,
        'valor_total': to_float,
    },
    'tb_produto': {
        'estoque': to_int,
        'preco': to_float,
        'data_cad': to_date,
    },
}


ID_COLUMNS = {
    'tb_clientes_fisico': 'id_clientes_fisico',
    'tb_clientes_juridicos': 'id_clientes_juridicos',
    'tb_conteudo': 'id_conteudo',
    'tb_contratos': 'id_contratos',
    'tb_financas': 'id_financas',
    'tb_funcionarios': 'id_funcionarios',
    'tb_reg_agendamentos': 'id_reg_agendamentos',
    'tb_forma_pag': 'id_forma_pag',
    'tb_servicos': 'id_servicos',
    'tb_itens_pedido': 'id_itens_pedido',
    'tb_pedido': 'id_pedido',
    'tb_produto': 'id_produto',
}


TABLE_ORDER = [
    'tb_clientes_fisico',
    'tb_clientes_juridicos',
    'tb_funcionarios',
    'tb_servicos',
    'tb_produto',
    'tb_pedido',
    'tb_itens_pedido',
    'tb_contratos',
    'tb_financas',
    'tb_reg_agendamentos',
    'tb_forma_pag',
    'tb_conteudo',
]


def fetch_all_sqlite(conn, table):
    cur = conn.cursor()
    rows = cur.execute(f'SELECT * FROM {table}').fetchall()
    return rows


def convert_row(table, row_dict):
    conv = CONVERSIONS.get(table, {})
    out = {}
    for k, v in row_dict.items():
        f = conv.get(k)
        out[k] = f(v) if f else v
    return out


def build_insert_sql(table, cols):
    placeholders = ','.join(['%s'] * len(cols))
    col_list = ','.join(cols)
    return f'INSERT INTO {table} ({col_list}) VALUES ({placeholders})'


def fix_sequence(pgcur, table, id_col):
    pgcur.execute(
        "SELECT setval(pg_get_serial_sequence(%s,%s), COALESCE((SELECT MAX(" + id_col + ") FROM " + table + "), 1), TRUE)",
        (table, id_col)
    )


def main():
    if not PG_URL:
        raise RuntimeError('Defina DATABASE_URL no ambiente para conectar ao Postgres.')

    print(f"Conectando SQLite: {SQLITE_PATH}")
    s_conn = sqlite3.connect(SQLITE_PATH)
    s_conn.row_factory = sqlite3.Row

    print("Conectando Postgres...")
    p_conn = psycopg2.connect(PG_URL)
    p_conn.autocommit = False
    p_cur = p_conn.cursor()

    try:
        for table in TABLE_ORDER:
            print(f"Migrando tabela: {table}")
            rows = fetch_all_sqlite(s_conn, table)
            if not rows:
                print("  Nenhum registro.")
                continue
            # usa a primeira linha para extrair cols
            cols = list(rows[0].keys())
            # converter e inserir
            ins_sql = build_insert_sql(table, cols)
            for row in rows:
                row_dict = dict(row)
                conv_row = convert_row(table, row_dict)
                values = [conv_row[c] for c in cols]
                p_cur.execute(ins_sql, values)
            # ajustar sequência
            id_col = ID_COLUMNS.get(table)
            if id_col:
                p_cur.execute(
                    f"SELECT setval(pg_get_serial_sequence(%s,%s), COALESCE((SELECT MAX({id_col}) FROM {table}), 1), TRUE)",
                    (table, id_col)
                )
            p_conn.commit()
            print(f"  OK: {len(rows)} registros.")
    except Exception as e:
        p_conn.rollback()
        raise
    finally:
        s_conn.close()
        p_conn.close()


if __name__ == '__main__':
    main()
