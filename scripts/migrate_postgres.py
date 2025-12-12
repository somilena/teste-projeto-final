import os
import sys
import psycopg2

from psycopg2 import sql


def run_sql_file(conn, path):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    with conn.cursor() as cur:
        cur.execute(content)
    conn.commit()


def main():
    dsn = os.environ.get('DATABASE_URL')
    if not dsn:
        print('ERROR: Set DATABASE_URL env var to your Neon Postgres URL with sslmode=require', file=sys.stderr)
        sys.exit(1)

    sql_path = os.path.join(os.path.dirname(__file__), '..', 'db', 'init_postgres.sql')
    sql_path = os.path.abspath(sql_path)
    if not os.path.exists(sql_path):
        print(f'ERROR: SQL file not found: {sql_path}', file=sys.stderr)
        sys.exit(1)

    try:
        conn = psycopg2.connect(dsn)
        # Ensure autocommit off to run whole script atomically
        conn.autocommit = False
        run_sql_file(conn, sql_path)
        print('Migration applied successfully.')
    except Exception as e:
        print('Migration failed:', e, file=sys.stderr)
        sys.exit(2)
    finally:
        try:
            conn.close()
        except Exception:
            pass


if __name__ == '__main__':
    main()
