import os
import sys

# Caminho do projeto na conta sistga
sys.path.insert(0, '/home/sistga/sistga')

# Variáveis de ambiente (substitua GESTAO_SECRET_KEY por um segredo forte)
os.environ['GESTAO_SECRET_KEY'] = '1234'
os.environ['DATABASE_URL'] = 'postgresql://neondb_owner:npg_jPQK7MltTb8O@ep-crimson-firefly-acsbxp68-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'

# Importa a app de gestão
from app_gestao import app as application
