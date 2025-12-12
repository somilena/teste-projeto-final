# =============================================
# SISTEMA DE PERMISSÕES - ProdCumaru
# =============================================

# Mapeamento de Níveis Numéricos para Strings
NIVEL_MAP = {
    1: 'adm',
    2: 'editor',
    3: 'rh',
    4: 'juridico',
    5: 'contabilidade',
    '1': 'adm',
    '2': 'editor',
    '3': 'rh',
    '4': 'juridico',
    '5': 'contabilidade',
    'adm': 'adm',
    'editor': 'editor',
    'rh': 'rh',
    'juridico': 'juridico',
    'contabilidade': 'contabilidade'
}

# Definição de Níveis de Acesso
NIVEIS = {
    'adm': {
        'label': 'Administrador',
        'descricao': 'Acesso total ao sistema',
        'permissoes': [
            'dashboard',
            'receitas',
            'despesas',
            'agendamentos',
            'pedidos',
            'clientes',
            'contratos',
            'funcionarios',
            'editar_site'
        ]
    },
    'editor': {
        'label': 'Editor',
        'descricao': 'Pode editar e adicionar conteúdo ao site',
        'permissoes': [
            'editar_site'
        ]
    },
    'rh': {
        'label': 'RH',
        'descricao': 'Gerencia funcionários e seus contratos',
        'permissoes': [
            'dashboard',
            'funcionarios',
            'contratos'  # Apenas contratos de funcionários
        ]
    },
    'juridico': {
        'label': 'Jurídico',
        'descricao': 'Gerencia contratos de clientes',
        'permissoes': [
            'dashboard',
            'contratos'  # Apenas contratos de clientes
        ]
    },
    'contabilidade': {
        'label': 'Contabilidade',
        'descricao': 'Gerencia receitas e despesas',
        'permissoes': [
            'dashboard',
            'receitas',
            'despesas'
        ]
    }
}

def normalizar_nivel(nivel):
    """
    Normaliza o nível (converte número para string se necessário)
    
    Args:
        nivel: int ou str representando o nível
    
    Returns:
        str: O nível normalizado em string
    """
    if nivel in NIVEL_MAP:
        return NIVEL_MAP[nivel]
    return 'adm'  # padrão

def verificar_permissao(nivel, secao):
    """
    Verifica se um nível de acesso tem permissão para acessar uma seção
    
    Args:
        nivel (str ou int): O nível de acesso do usuário
        secao (str): A seção que se quer acessar
    
    Returns:
        bool: True se tem permissão, False caso contrário
    """
    nivel_norm = normalizar_nivel(nivel)
    if nivel_norm not in NIVEIS:
        return False
    
    return secao in NIVEIS[nivel_norm]['permissoes']

def obter_secoes_permitidas(nivel):
    """
    Retorna lista de todas as seções que o usuário tem permissão de acessar
    
    Args:
        nivel (str ou int): O nível de acesso do usuário
    
    Returns:
        list: Lista de seções permitidas
    """
    nivel_norm = normalizar_nivel(nivel)
    if nivel_norm not in NIVEIS:
        return []
    
    return NIVEIS[nivel_norm]['permissoes']

def obter_label_nivel(nivel):
    """Retorna o label (nome amigável) de um nível"""
    nivel_norm = normalizar_nivel(nivel)
    if nivel_norm in NIVEIS:
        return NIVEIS[nivel_norm]['label']
    return 'Desconhecido'

def listar_niveis_disponiveis():
    """Retorna lista de todos os níveis disponíveis"""
    return list(NIVEIS.keys())
