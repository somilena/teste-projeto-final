import urllib.request, urllib.parse, json, sys

def post_json(url, data):
    try:
        req = urllib.request.Request(url, data=json.dumps(data).encode('utf-8'), headers={'Content-Type': 'application/json'})
        with urllib.request.urlopen(req, timeout=10) as r:
            body = r.read().decode('utf-8')
            print('\nPOST', url, r.status)
            print(body)
            return json.loads(body) if body else None
    except Exception as e:
        print('POST ERROR', url, e)
        return None


def put_json(url, data):
    try:
        req = urllib.request.Request(url, data=json.dumps(data).encode('utf-8'), headers={'Content-Type': 'application/json'}, method='PUT')
        with urllib.request.urlopen(req, timeout=10) as r:
            body = r.read().decode('utf-8')
            print('\nPUT', url, r.status)
            print(body)
            return json.loads(body) if body else None
    except Exception as e:
        print('PUT ERROR', url, e)
        return None


def get_json(url):
    try:
        with urllib.request.urlopen(url, timeout=10) as r:
            body = r.read().decode('utf-8')
            print('\nGET', url, r.status)
            return json.loads(body)
    except Exception as e:
        print('GET ERROR', url, e)
        return None


def post_form(url, form):
    try:
        data = urllib.parse.urlencode(form).encode('utf-8')
        req = urllib.request.Request(url, data=data)
        with urllib.request.urlopen(req, timeout=10) as r:
            body = r.read().decode('utf-8')
            print('\nPOST-FORM', url, r.status)
            print(body[:500])
            return body
    except Exception as e:
        print('POST-FORM ERROR', url, e)
        return None


if __name__ == '__main__':
    base = 'http://127.0.0.1:5001'

    # 1) Create funcionário via API
    novo = {
        'nome': 'Teste API',
        'cpf': '123.456.789-00',
        'email': 'teste@local',
        'tel_cel': '(11)99999-0000',
        'cargo': 'Editor',
        'senha_aces': 'secret'
    }
    post_json(base + '/api/funcionarios', novo)

    # 2) Get funcionarios
    funcs = get_json(base + '/api/funcionarios') or []
    print('\nFuncionários (últimos 3):')
    for f in funcs[-3:]:
        print(f)

    if not funcs:
        print('Nenhum funcionário encontrado. Abortando testes de edição/deleção.')
        sys.exit(0)

    new_id = funcs[-1].get('id_funcionarios')
    print('\nNovo ID criado:', new_id)

    # 3) Update funcionário (usar PUT)
    atualizado = {
        'nome': 'Teste API Edit',
        'cpf': '123.456.789-00',
        'email': 'teste-edit@local',
        'tel_cel': '(11)98888-0000',
        'cargo': 'Admin'
    }
    put_json(base + f'/api/funcionarios/{new_id}', atualizado)

    # 4) Delete funcionário
    try:
        req = urllib.request.Request(base + f'/api/funcionarios/{new_id}', method='DELETE')
        with urllib.request.urlopen(req, timeout=10) as r:
            print('\nDELETE funcionario', new_id, r.status)
    except Exception as e:
        print('DELETE ERROR', e)

    # 5) Create receita via form
    form = {
        'origem': 'Venda Teste',
        'cliente': 'Cliente Teste',
        'valor': '123.45',
        'data_emissao': '2025-12-09',
        'data_agendada': '2025-12-10',
        'obs': 'teste'
    }
    post_form(base + '/gestao/receita/nova', form)

    # 6) Get receitas and delete last
    recs = get_json(base + '/api/financas/Receita') or []
    print('\nReceitas (últimas 3):')
    for r in recs[-3:]:
        print(r)

    if recs:
        new_fin = recs[-1].get('id_financas')
        print('\nNovo id_financas:', new_fin)
        try:
            req = urllib.request.Request(base + f'/api/financas/{new_fin}', method='DELETE')
            with urllib.request.urlopen(req, timeout=10) as r:
                print('\nDELETE financa', new_fin, r.status)
        except Exception as e:
            print('DELETE FIN ERROR', e)
    else:
        print('Nenhuma receita encontrada para deletar.')
