import os
import sys

# Caminho do projeto na conta prodprojetofinal
sys.path.insert(0, '/home/prodprojetofinal/prodcumaru')

# Variáveis de ambiente (substitua FLASK_SECRET_KEY por um segredo forte)
os.environ['FLASK_SECRET_KEY'] = '1234'
os.environ['DATABASE_URL'] = 'postgresql://neondb_owner:npg_jPQK7MltTb8O@ep-crimson-firefly-acsbxp68-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'

# Importa a app pública
from app import app as application
