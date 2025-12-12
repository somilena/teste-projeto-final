document.addEventListener("DOMContentLoaded", () => {

  // =================================================================
  // 0. SISTEMA DE PERMISSÕES
  // =================================================================
  const permissoesEfetivas = Array.isArray(window.permissoes) ? window.permissoes : [];
  const nivelUsuario = typeof window.nivelUsuario === 'string' ? window.nivelUsuario : null;

  // Fallback somente para ADM: se vier vazio, aplica todas as permissões
  if (nivelUsuario === 'adm' && permissoesEfetivas.length === 0) {
    console.warn('⚠️ Sem permissões para ADM. Aplicando todas por fallback.');
    permissoesEfetivas.push('dashboard', 'receitas', 'despesas', 'agendamentos', 'pedidos', 'clientes', 'contratos', 'funcionarios', 'editar_site');
  }

  // DEBUG
  console.log('🔍 DEBUG Permissões:', { permissoes: permissoesEfetivas, nivelUsuario });

  // Função para verificar permissão
  function temPermissao(secao) {
    return permissoesEfetivas.includes(secao);
  }

  // Oculta seções do menu que o usuário não tem permissão
  const itensMenuOcultos = {
    'receitas': 'item-receitas',
    'despesas': 'item-despesas',
    'agendamentos': 'item-agendamentos',
    'pedidos': 'item-pedidos',
    'clientes': 'item-clientes',
    'contratos': 'item-contratos',
    'funcionarios': 'item-funcionarios',
    'editar_site': 'item-editar-site'
  };

  // Para admin, não ocultamos nada
  if (nivelUsuario !== 'adm') {
    Object.entries(itensMenuOcultos).forEach(([permissao, id]) => {
      const elemento = document.getElementById(id);
      if (elemento && !temPermissao(permissao)) {
        console.log(`❌ Ocultando: ${id} (permissão: ${permissao})`);
        elemento.style.display = 'none';
      } else {
        console.log(`✅ Mostrando: ${id} (permissão: ${permissao})`);
      }
    });
  }

  // =================================================================
  // 1. LÓGICA DE TEMA (CLARO/ESCURO)
  // =================================================================
  const btnTema = document.getElementById("btn-tema-toggle");
  const body = document.body;

  if (btnTema) {
    const iconeTema = btnTema.querySelector("i");
    const textoTema = btnTema.querySelector("span");

    // Verifica preferência salva no LocalStorage
    const temaSalvo = localStorage.getItem("prodcumaru_tema");

    if (temaSalvo === "dark") {
      body.classList.add("dark-mode");
      iconeTema.classList.replace("ph-moon", "ph-sun");
      textoTema.textContent = "Modo Claro";
    }

    btnTema.addEventListener("click", () => {
      body.classList.toggle("dark-mode");

      if (body.classList.contains("dark-mode")) {
        localStorage.setItem("prodcumaru_tema", "dark");
        iconeTema.classList.replace("ph-moon", "ph-sun");
        textoTema.textContent = "Modo Claro";
      } else {
        localStorage.setItem("prodcumaru_tema", "light");
        iconeTema.classList.replace("ph-sun", "ph-moon");
        textoTema.textContent = "Modo Escuro";
      }
    });
  }

  // =================================================================
  // 1. LÓGICA DE NAVEGAÇÃO (Troca de Abas/Seções do Menu Principal)
  // =================================================================
  const itensMenu = document.querySelectorAll(".item-menu");
  const paginasConteudo = document.querySelectorAll(".pagina-conteudo");

  itensMenu.forEach((item) => {
    item.addEventListener("click", (evento) => {
      evento.preventDefault();
      let paginaAlvoID = item.getAttribute("data-pagina");
      // Mapear ids de página para chaves de permissão (trocar '-' por '_')
      const chavePermissao = paginaAlvoID.replace(/-/g, '_');

      // Verifica permissão antes de navegar
      if (paginaAlvoID !== "visao-geral" && nivelUsuario !== 'adm' && !temPermissao(chavePermissao)) {
        console.warn(`Acesso negado à seção: ${paginaAlvoID}`);
        alert("Você não tem permissão para acessar esta seção.");
        return;
      }

      // Atualiza Menu (Visual do item ativo na esquerda)
      itensMenu.forEach((i) => i.classList.remove("ativo"));
      item.classList.add("ativo");

      // Atualiza Conteúdo (Mostra a seção correspondente)
      paginasConteudo.forEach((pagina) => pagina.classList.remove("ativa"));
      const secaoAlvo = document.getElementById("secao-" + paginaAlvoID);
      if (secaoAlvo) {
        secaoAlvo.classList.add("ativa");
      }

      // --- LÓGICAS ESPECÍFICAS POR ABA ---

      // 1. Se for Agendamentos: Reseta o calendário para o mês atual
      if (paginaAlvoID === "agendamentos") {
        dataExibida = new Date();
        dataSelecionada = null;
        renderizarCalendario();
      }

      // 2. Se for Editar Site: Força o clique na sub-aba "Home"
      if (paginaAlvoID === "editar-site") {
        const btnSubHome = document.querySelector('.botao-sub-aba[data-alvo="sub-home"]');
        if (btnSubHome) {
          btnSubHome.click();
        }
      }
    });
  });

  // =================================================================
  // 2. SISTEMA DE LOGS (GLOBAL)
  // =================================================================
  const tabelaLogsBody = document.querySelector("#tabela-logs tbody");

  let logsSistema = [
    { data: new Date().toLocaleString(), usuario: "Admin", acao: "Sistema iniciado." }
  ];

  window.registrarLog = function (descricaoAcao, usuario = "Admin") {
    const dataAtual = new Date().toLocaleString();
    logsSistema.unshift({
      data: dataAtual,
      usuario: usuario,
      acao: descricaoAcao
    });
    renderizarLogs();
  };

  function renderizarLogs() {
    if (!tabelaLogsBody) return;
    tabelaLogsBody.innerHTML = "";
    logsSistema.forEach(log => {
      const linha = document.createElement("tr");
      linha.innerHTML = `
            <td style="font-size: 14px; color: var(--cor-text-muted);">${log.data}</td>
            <td><span style="background: var(--cor-bg-hover); color: var(--cor-text-main); padding: 2px 8px; border-radius: 4px; font-weight: 600; font-size: 12px; border: 1px solid var(--cor-borda);">${log.usuario}</span></td>
            <td>${log.acao}</td>
        `;
      tabelaLogsBody.appendChild(linha);
    });
  }

  window.limparLogs = function () {
    if (confirm("Deseja limpar todo o histórico de logs?")) {
      logsSistema = [];
      renderizarLogs();
    }
  };

  // =================================================================
  // 3. LÓGICA DO CALENDÁRIO E AGENDAMENTOS
  // =================================================================
  const modalAgendamento = document.getElementById("modal-agendamento");
  const botoesAbrirModalAgendamento = [
    document.getElementById("botao-novo-agendamento-rapido"),
    document.getElementById("botao-novo-agendamento-calendario"),
  ];
  const botaoFecharModalAgendamento = document.getElementById("modal-fechar-agendamento");
  const formAgendamento = document.getElementById("form-novo-agendamento");
  const inputDataAgendamento = document.getElementById("agendamento-data");
  const inputTituloAgendamento = document.getElementById("agendamento-titulo");
  const inputTipoAgendamento = document.getElementById("agendamento-tipo");
  const inputObsAgendamento = document.getElementById("agendamento-obs");

  const modalDetalhesAgendamento = document.getElementById("modal-detalhes-agendamento");
  const botaoFecharDetalhesAgendamento = document.getElementById("modal-fechar-detalhes-agendamento");
  const spanDetalhesTitulo = document.getElementById("detalhes-agendamento-titulo");
  const spanDetalhesData = document.getElementById("detalhes-agendamento-data");
  const spanDetalhesTipo = document.getElementById("detalhes-agendamento-tipo");
  const spanDetalhesObs = document.getElementById("detalhes-agendamento-obs");

  const botaoMesAnterior = document.getElementById("mes-anterior");
  const botaoMesSeguinte = document.getElementById("mes-seguinte");
  const mesAnoAtualEl = document.getElementById("mes-ano-atual");
  const calendarioGrid = document.querySelector(".calendario-grid-dias");

  let dataExibida = new Date();
  let dataSelecionada = null;

  // Carrega agendamentos do backend se disponível
  let agendamentos = [];
  if (window.dadosIniciais && window.dadosIniciais.agendamentos) {
    console.log('📦 Dados brutos de agendamentos:', window.dadosIniciais.agendamentos);

    agendamentos = window.dadosIniciais.agendamentos.map(a => {
      // data_agend está no formato YYYY-MM-DD e horario pode ser "10:00" ou "10:00:00"
      const dataStr = a.data_agend;
      const horaStr = a.horario || '00:00';
      const dataCompleta = new Date(dataStr + 'T' + horaStr);

      console.log(`  Processando: ${a.nome} - data_agend: "${dataStr}", horario: "${horaStr}", Date criado: ${dataCompleta}`);

      return {
        data: dataCompleta,
        titulo: a.nome || a.nome_cliente || 'Agendamento',
        tipo: a.servico || a.tipo_servico || 'reuniao',
        obs: a.obs || a.observacoes || `Email: ${a.email} | Telefone: ${a.tel_cel}`,
        id: a.id_reg_agendamentos || null
      };
    });
    console.log(`✅ ${agendamentos.length} agendamentos carregados do banco de dados`);
    agendamentos.forEach(a => console.log(`  📍 ${a.titulo} em ${a.data.toLocaleDateString('pt-BR')} às ${a.data.toLocaleTimeString('pt-BR')}`));

    // Renderiza lista completa de agendamentos
    renderizarListaAgendamentos();
  } else {
    console.warn('⚠️ Nenhum dado inicial de agendamentos encontrado');
    // Tentar carregar via API de gestão
    (async () => {
      try {
        const resp = await fetch('/api/agendamentos');
        const json = await resp.json();
        if (json.success && Array.isArray(json.agendamentos)) {
          agendamentos = json.agendamentos.map(a => {
            const dataStr = a.data_agend || a.data;
            const horaStr = a.horario || '00:00';
            const dataCompleta = new Date(dataStr + 'T' + horaStr);
            return {
              data: dataCompleta,
              titulo: a.nome || 'Agendamento',
              tipo: a.servico || 'reuniao',
              obs: a.obs || `Email: ${a.email} | Telefone: ${a.tel_cel}`,
              id: a.id_reg_agendamentos || null
            };
          });
          renderizarListaAgendamentos();
          renderizarCalendario();
        }
      } catch (e) {
        console.error('Erro ao carregar agendamentos da gestão:', e);
      }
    })();
  }

  function renderizarListaAgendamentos() {
    const listaContainer = document.getElementById('lista-agendamentos-completa');
    if (!listaContainer) return;

    if (agendamentos.length === 0) {
      listaContainer.innerHTML = '<p style="color: var(--muted);">Nenhum agendamento cadastrado.</p>';
      return;
    }

    // Ordena por data (mais próximo primeiro)
    const agendamentosOrdenados = [...agendamentos].sort((a, b) => a.data - b.data);

    listaContainer.innerHTML = agendamentosOrdenados.map((ag, index) => `
      <div style="background: var(--bg); padding: 15px; border-radius: 8px; border-left: 4px solid var(--accent);">
        <div style="display: flex; justify-content: space-between; align-items: start;">
          <div>
            <strong style="color: var(--white); font-size: 16px;">${ag.titulo}</strong>
            <p style="color: var(--muted); margin: 5px 0; font-size: 14px;">
              📅 ${ag.data.toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              às ${ag.data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </p>
            <p style="color: var(--muted); font-size: 13px; margin-top: 8px;">
              <strong>Tipo:</strong> ${ag.tipo} ${ag.obs ? `<br><strong>Obs:</strong> ${ag.obs}` : ''}
            </p>
          </div>
          <button onclick="irParaDataAgendamento(${index})" 
                  style="background: var(--accent); color: var(--dark); border: none; padding: 8px 12px; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: bold;">
            Ver no Calendário
          </button>
        </div>
      </div>
    `).join('');
  }

  // Função global para ir para a data do agendamento
  window.irParaDataAgendamento = function (index) {
    const agendamento = agendamentos[index];
    if (!agendamento) return;

    // Ajusta o calendário para o mês do agendamento
    dataExibida = new Date(agendamento.data);
    dataSelecionada = new Date(agendamento.data);
    renderizarCalendario();

    // Muda para a aba do calendário
    const abaCalendario = document.querySelector('.aba-btn[data-aba="calendario"]');
    if (abaCalendario) abaCalendario.click();

    // Scroll suave para o calendário
    setTimeout(() => {
      document.querySelector('.container-calendario')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  // Controle das abas de agendamento
  const abasBtns = document.querySelectorAll('.aba-btn');
  abasBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const abaAlvo = btn.dataset.aba;

      // Remove classe ativa de todos os botões
      abasBtns.forEach(b => {
        b.classList.remove('aba-ativa');
        b.style.color = 'var(--cor-text-muted)';
        b.style.borderBottomColor = 'transparent';
      });

      // Adiciona classe ativa no botão clicado
      btn.classList.add('aba-ativa');
      btn.style.color = 'var(--cor-primaria)';
      btn.style.borderBottomColor = 'var(--cor-primaria)';

      // Esconde todos os conteúdos
      document.querySelectorAll('.aba-conteudo').forEach(conteudo => {
        conteudo.style.display = 'none';
      });

      // Mostra o conteúdo da aba selecionada
      const conteudoAlvo = document.getElementById(`aba-${abaAlvo}-conteudo`);
      if (conteudoAlvo) conteudoAlvo.style.display = 'block';
    });
  });

  // Controle das abas de receitas (Compras/Agendamentos/Manual)
  const abasReceitasBtns = document.querySelectorAll('.aba-receita-btn');
  abasReceitasBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const abaAlvo = btn.dataset.aba;

      // Remove classe ativa de todos os botões
      abasReceitasBtns.forEach(b => {
        b.classList.remove('aba-ativa');
        b.style.color = 'var(--cor-text-muted)';
        b.style.borderBottomColor = 'transparent';
      });

      // Adiciona classe ativa no botão clicado
      btn.classList.add('aba-ativa');
      btn.style.color = 'var(--cor-primaria)';
      btn.style.borderBottomColor = 'var(--cor-primaria)';

      // Esconde todos os conteúdos de receitas
      document.querySelectorAll('#secao-receitas .conteudo-aba').forEach(conteudo => {
        conteudo.style.display = 'none';
      });

      // Mostra o conteúdo da aba selecionada
      const conteudoAlvo = document.getElementById(`aba-${abaAlvo}-conteudo`);
      if (conteudoAlvo) conteudoAlvo.style.display = 'block';
    });
  });

  // Controle das abas de contratos (Clientes/Funcionários)
  const abasContratosBtns = document.querySelectorAll('.aba-contrato-btn');
  abasContratosBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const abaAlvo = btn.dataset.aba;

      // Remove classe ativa de todos os botões
      abasContratosBtns.forEach(b => {
        b.classList.remove('aba-ativa');
        b.style.color = 'var(--cor-text-muted)';
        b.style.borderBottomColor = 'transparent';
      });

      // Adiciona classe ativa no botão clicado
      btn.classList.add('aba-ativa');
      btn.style.color = 'var(--cor-primaria)';
      btn.style.borderBottomColor = 'var(--cor-primaria)';

      // Esconde todos os conteúdos
      document.querySelectorAll('.aba-contrato-conteudo').forEach(conteudo => {
        conteudo.style.display = 'none';
      });

      // Mostra o conteúdo da aba selecionada
      const conteudoAlvo = document.getElementById(`aba-contratos-${abaAlvo}`);
      if (conteudoAlvo) conteudoAlvo.style.display = 'block';
    });
  });

  // =============================
  // Funcionários - carregar lista
  // =============================
  async function carregarFuncionariosGestao() {
    try {
      const resp = await fetch('/api/funcionarios');
      const json = await resp.json();
      if (json.success) {
        const lista = json.funcionarios || [];
        const cont = document.getElementById('lista-funcionarios');
        if (cont) {
          cont.innerHTML = lista.map(f => `
            <div class="func-row">
              <span>${f.nome}</span>
              <span>${f.email}</span>
              <span>${f.cargo || ''}</span>
              <span>${f.status}</span>
            </div>
          `).join('');
        }
      }
    } catch (e) {
      console.error('Erro ao carregar funcionários:', e);
    }
  }

  // Quando entrar na aba funcionários, carregar
  const itemFunc = document.getElementById('item-funcionarios');
  if (itemFunc) {
    itemFunc.addEventListener('click', () => {
      if (temPermissao('funcionarios')) carregarFuncionariosGestao();
    });
  }

  const abrirModalAgendamento = () => {
    if (dataSelecionada) {
      inputDataAgendamento.value = dataSelecionada.toISOString().split('T')[0];
    } else {
      inputDataAgendamento.value = '';
    }
    if (modalAgendamento) modalAgendamento.style.display = "flex";
  };

  const fecharModalAgendamento = () => {
    if (modalAgendamento) modalAgendamento.style.display = "none";
    if (formAgendamento) formAgendamento.reset();
  };

  const abrirModalDetalhesAgendamento = (agendamento) => {
    if (!modalDetalhesAgendamento) return;
    spanDetalhesTitulo.textContent = agendamento.titulo;
    spanDetalhesData.textContent = agendamento.data.toLocaleDateString('pt-BR');
    let tipoFormatado = agendamento.tipo || "Não especificado";
    if (tipoFormatado === 'gravacao') tipoFormatado = 'Gravação';
    if (tipoFormatado === 'mixagem') tipoFormatado = 'Mixagem';
    if (tipoFormatado === 'reuniao') tipoFormatado = 'Reunião';
    spanDetalhesTipo.textContent = tipoFormatado;
    spanDetalhesObs.textContent = agendamento.obs || "Nenhuma observação.";
    modalDetalhesAgendamento.style.display = "flex";
  };

  const fecharModalDetalhesAgendamento = () => {
    if (modalDetalhesAgendamento) modalDetalhesAgendamento.style.display = "none";
  };

  if (botoesAbrirModalAgendamento.length > 0) {
    botoesAbrirModalAgendamento.forEach((btn) => {
      if (btn) btn.addEventListener("click", abrirModalAgendamento);
    });
  }

  if (botaoFecharModalAgendamento) botaoFecharModalAgendamento.addEventListener("click", fecharModalAgendamento);
  if (modalAgendamento) {
    modalAgendamento.addEventListener("click", (evento) => {
      if (evento.target === modalAgendamento) fecharModalAgendamento();
    });
  }

  if (botaoFecharDetalhesAgendamento) botaoFecharDetalhesAgendamento.addEventListener("click", fecharModalDetalhesAgendamento);
  if (modalDetalhesAgendamento) {
    modalDetalhesAgendamento.addEventListener("click", (evento) => {
      if (evento.target === modalDetalhesAgendamento) fecharModalDetalhesAgendamento();
    });
  }

  function isMesmoDia(data1, data2) {
    if (!data1 || !data2) return false;
    return (
      data1.getFullYear() === data2.getFullYear() &&
      data1.getMonth() === data2.getMonth() &&
      data1.getDate() === data2.getDate()
    );
  }

  function renderizarCalendario() {
    if (!calendarioGrid) return;
    calendarioGrid.innerHTML = "";

    const mes = dataExibida.getMonth();
    const ano = dataExibida.getFullYear();
    const hoje = new Date();

    if (mesAnoAtualEl) {
      mesAnoAtualEl.textContent = dataExibida.toLocaleDateString("pt-BR", {
        month: "long",
        year: "numeric",
      }).replace(/^\w/, (c) => c.toUpperCase());
    }

    const primeiroDiaSemana = new Date(ano, mes, 1).getDay();
    const ultimoDiaMes = new Date(ano, mes + 1, 0).getDate();
    const ultimoDiaMesAnterior = new Date(ano, mes, 0).getDate();

    for (let i = primeiroDiaSemana; i > 0; i--) {
      const dia = ultimoDiaMesAnterior - i + 1;
      const diaEl = document.createElement("div");
      diaEl.className = "dia-calendario passado";
      diaEl.innerHTML = `<span class="numero-dia">${dia}</span>`;
      calendarioGrid.appendChild(diaEl);
    }

    for (let dia = 1; dia <= ultimoDiaMes; dia++) {
      const dataCompleta = new Date(ano, mes, dia);
      const diaEl = document.createElement("div");
      diaEl.className = "dia-calendario";
      diaEl.dataset.date = dataCompleta.toISOString();
      diaEl.innerHTML = `<span class="numero-dia">${dia}</span>`;

      if (isMesmoDia(dataCompleta, hoje)) diaEl.classList.add("hoje");
      if (isMesmoDia(dataCompleta, dataSelecionada)) diaEl.classList.add("selecionado");

      // Debug: verifica agendamentos para este dia
      const agendamentosDoDia = agendamentos.filter(evento => isMesmoDia(evento.data, dataCompleta));

      agendamentos.forEach((evento, index) => {
        if (isMesmoDia(evento.data, dataCompleta)) {
          const eventoEl = document.createElement("div");
          eventoEl.className = "evento-calendario";
          eventoEl.dataset.index = index;
          eventoEl.style.cursor = "pointer";
          eventoEl.innerHTML = `
            <span class="titulo-evento" title="${evento.titulo}">${evento.titulo}</span>
            <button class="apagar-evento" data-index="${index}" title="Apagar evento">&times;</button>
          `;
          diaEl.appendChild(eventoEl);
          console.log(`📅 Agendamento "${evento.titulo}" adicionado ao dia ${dia}/${mes + 1}/${ano}`);
        }
      });

      diaEl.addEventListener("click", (e) => {
        if (!e.target.closest('.evento-calendario')) {
          dataSelecionada = new Date(diaEl.dataset.date);
          renderizarCalendario();
        }
      });
      calendarioGrid.appendChild(diaEl);
    }

    const totalDiasGrid = calendarioGrid.children.length;
    const diasRestantes = (totalDiasGrid > 35) ? 42 - totalDiasGrid : 35 - totalDiasGrid;

    for (let i = 1; i <= diasRestantes; i++) {
      const diaEl = document.createElement("div");
      diaEl.className = "dia-calendario futuro";
      diaEl.innerHTML = `<span class="numero-dia">${i}</span>`;
      calendarioGrid.appendChild(diaEl);
    }
  }

  if (botaoMesAnterior) {
    botaoMesAnterior.addEventListener("click", () => {
      dataExibida.setMonth(dataExibida.getMonth() - 1);
      renderizarCalendario();
    });
  }

  if (botaoMesSeguinte) {
    botaoMesSeguinte.addEventListener("click", () => {
      dataExibida.setMonth(dataExibida.getMonth() + 1);
      renderizarCalendario();
    });
  }

  if (formAgendamento) {
    formAgendamento.addEventListener("submit", (evento) => {
      evento.preventDefault();
      const titulo = inputTituloAgendamento.value;
      const dataString = inputDataAgendamento.value;
      const tipo = inputTipoAgendamento ? inputTipoAgendamento.value : "geral";
      const obs = inputObsAgendamento ? inputObsAgendamento.value : "";

      if (!titulo || !dataString) return;

      const novaData = new Date(dataString + 'T00:00:00');
      agendamentos.push({ data: novaData, titulo: titulo, tipo: tipo, obs: obs });

      fecharModalAgendamento();
      dataExibida = new Date(novaData.getFullYear(), novaData.getMonth(), 1);
      dataSelecionada = novaData;

      renderizarCalendario();
      atualizarWidgetEventosHoje(); // Atualiza visão geral
    });
  }

  if (calendarioGrid) {
    calendarioGrid.addEventListener("click", (evento) => {
      const botaoApagar = evento.target.closest(".apagar-evento");
      const eventoClicado = evento.target.closest(".evento-calendario");

      if (botaoApagar) {
        evento.stopPropagation();
        const index = parseInt(botaoApagar.dataset.index, 10);
        if (confirm("Deseja excluir este agendamento?")) {
          agendamentos.splice(index, 1);
          renderizarCalendario();
          atualizarWidgetEventosHoje(); // Atualiza visão geral
        }
      }
      else if (eventoClicado) {
        evento.stopPropagation();
        const index = parseInt(eventoClicado.dataset.index, 10);
        const agendamento = agendamentos[index];
        if (agendamento) abrirModalDetalhesAgendamento(agendamento);
      }
    });
  }

  // =================================================================
  // 4. LÓGICA DE FUNCIONÁRIOS (COM EDIÇÃO E TABELA)
  // =================================================================
  const modalFuncionario = document.getElementById("modal-novo-funcionario");
  const botaoAbrirModalFuncionario = document.getElementById("botao-novo-funcionario");
  const botaoFecharModalFuncionario = document.getElementById("modal-fechar-funcionario");
  const formFuncionario = document.getElementById("form-novo-funcionario");
  const secaoFuncionarios = document.getElementById("secao-funcionarios");

  const tabelaFuncionariosBody = document.querySelector("#tabela-funcionarios tbody");
  const inputBuscaFuncionario = document.getElementById("busca-funcionario");

  const inputIndexEdicao = document.getElementById("funcionario-index-edicao");
  const tituloModalFuncionario = document.getElementById("titulo-modal-funcionario");
  const btnSalvarFuncionario = document.getElementById("btn-salvar-funcionario");
  const inputNomeFunc = document.getElementById("funcionario-nome");
  const inputCpfFunc = document.getElementById("funcionario-cpf");
  const inputEmailFunc = document.getElementById("funcionario-email");
  const inputCargoFunc = document.getElementById("funcionario-cargo");
  const inputNivelFunc = document.getElementById("funcionario-nivel");
  const inputTelFunc = document.getElementById("funcionario-telefone");
  const inputSenhaFunc = document.getElementById("funcionario-senha");
  const inputConfSenhaFunc = document.getElementById("funcionario-confirmar-senha");

  const modalDetalhesFuncionario = document.getElementById("modal-detalhes-funcionario");
  const botaoFecharModalDetalhes = document.getElementById("modal-fechar-detalhes-funcionario");

  let funcionarios = [];

  const abrirModalParaCriar = () => {
    formFuncionario.reset();
    inputIndexEdicao.value = "";
    tituloModalFuncionario.textContent = "Novo Funcionário";
    btnSalvarFuncionario.textContent = "Salvar Funcionário";
    inputSenhaFunc.required = true;
    inputConfSenhaFunc.required = true;
    modalFuncionario.style.display = "flex";
  };

  const abrirModalParaEditar = (index) => {
    const func = funcionarios[index];
    inputIndexEdicao.value = index;
    inputNomeFunc.value = func.nome;
    inputCpfFunc.value = func.cpf;
    inputEmailFunc.value = func.email;
    inputCargoFunc.value = func.cargo;
    inputNivelFunc.value = func.nivel || "editor";
    inputTelFunc.value = func.telefone || "";
    inputSenhaFunc.value = "";
    inputConfSenhaFunc.value = "";
    inputSenhaFunc.required = false;
    inputConfSenhaFunc.required = false;
    tituloModalFuncionario.textContent = "Editar Funcionário";
    btnSalvarFuncionario.textContent = "Atualizar Dados";
    modalFuncionario.style.display = "flex";
  };

  const fecharModalFuncionario = () => {
    modalFuncionario.style.display = "none";
    formFuncionario.reset();
  };

  const fecharModalDetalhesFuncionario = () => { modalDetalhesFuncionario.style.display = "none"; };

  if (botaoAbrirModalFuncionario) botaoAbrirModalFuncionario.addEventListener("click", abrirModalParaCriar);
  if (botaoFecharModalFuncionario) botaoFecharModalFuncionario.addEventListener("click", fecharModalFuncionario);

  if (modalFuncionario) {
    modalFuncionario.addEventListener("click", (e) => {
      if (e.target === modalFuncionario) fecharModalFuncionario();
    });
  }

  if (botaoFecharModalDetalhes) botaoFecharModalDetalhes.addEventListener("click", fecharModalDetalhesFuncionario);
  if (modalDetalhesFuncionario) {
    modalDetalhesFuncionario.addEventListener("click", (e) => {
      if (e.target === modalDetalhesFuncionario) fecharModalDetalhesFuncionario();
    });
  }

  if (inputCpfFunc) {
    inputCpfFunc.addEventListener('input', (e) => {
      let value = e.target.value.replace(/\D/g, '');
      value = value.substring(0, 11);
      let formattedValue = value;
      if (value.length > 9) formattedValue = value.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
      else if (value.length > 6) formattedValue = value.replace(/^(\d{3})(\d{3})(\d{3})/, '$1.$2.$3');
      else if (value.length > 3) formattedValue = value.replace(/^(\d{3})(\d{3})/, '$1.$2');
      e.target.value = formattedValue;
    });
  }

  if (formFuncionario) {
    formFuncionario.addEventListener("submit", (e) => {
      e.preventDefault();

      const index = inputIndexEdicao.value;
      const nome = inputNomeFunc.value;
      const cpf = inputCpfFunc.value;
      const email = inputEmailFunc.value;
      const cargo = inputCargoFunc.value;
      const nivel = inputNivelFunc.value;
      const telefone = inputTelFunc.value;
      const senha = inputSenhaFunc.value;
      const confirmarSenha = inputConfSenhaFunc.value;

      if (senha !== confirmarSenha) {
        alert("As senhas não coincidem.");
        return;
      }
      if (cpf.length < 14) {
        alert("CPF incompleto.");
        return;
      }

      const dadosFuncionario = { nome, cpf, email, cargo, nivel, telefone };

      if (index !== "") {
        funcionarios[parseInt(index)] = dadosFuncionario;
        if (window.registrarLog) window.registrarLog(`Funcionário atualizado: ${nome}`);
        alert("Funcionário atualizado com sucesso!");
      } else {
        if (!senha) { alert("Senha é obrigatória para novos cadastros."); return; }

        // Envia para o servidor
        const formData = new FormData();
        formData.append('nome', nome);
        formData.append('cpf', cpf);
        formData.append('email', email);
        formData.append('cargo', cargo);
        formData.append('nivel', nivel);
        formData.append('telefone', telefone);
        formData.append('senha', senha);

        fetch('/gestao/funcionario/novo', {
          method: 'POST',
          body: formData
        })
          .then(response => {
            if (response.ok) {
              location.reload();
            } else {
              alert('Erro ao salvar funcionário');
            }
          })
          .catch(error => {
            console.error('Erro:', error);
            alert('Erro ao salvar funcionário');
          });
      }

      atualizarTabelaFuncionarios();
      fecharModalFuncionario();
    });
  }

  function atualizarTabelaFuncionarios() {
    if (!tabelaFuncionariosBody) return;

    tabelaFuncionariosBody.innerHTML = "";
    const termo = inputBuscaFuncionario ? inputBuscaFuncionario.value.toLowerCase() : "";

    funcionarios.forEach((func, index) => {
      const textoNome = func.nome.toLowerCase();
      const textoCargo = func.cargo.toLowerCase();
      const textoCpf = func.cpf.replace(/\D/g, '');

      if (termo === "" || textoNome.includes(termo) || textoCargo.includes(termo) || textoCpf.includes(termo)) {

        const linha = document.createElement("tr");
        const cargoFormatado = func.cargo.charAt(0).toUpperCase() + func.cargo.slice(1);

        linha.innerHTML = `
          <td><strong>${func.nome}</strong></td>
          <td>${func.cpf}</td>
          <td>
             <span style="background: var(--cor-bg-hover); color: var(--cor-text-main); padding: 2px 8px; border-radius: 4px; font-weight: 600; font-size: 12px; border: 1px solid var(--cor-borda);">
               ${cargoFormatado}
             </span>
          </td>
          <td>${func.email}</td>
          <td>${func.telefone || "-"}</td>
          <td>
            <button class="botao-acao editar-funcionario" data-index="${index}" title="Editar">
              <i class="ph-fill ph-pencil-simple"></i>
            </button>
            <button class="botao-acao apagar-funcionario" data-index="${index}" title="Apagar" style="margin-left: 10px;">
              <i class="ph-fill ph-trash"></i>
            </button>
          </td>
        `;
        tabelaFuncionariosBody.appendChild(linha);
      }
    });
  }

  if (inputBuscaFuncionario) {
    inputBuscaFuncionario.addEventListener("input", atualizarTabelaFuncionarios);
  }

  if (secaoFuncionarios) {
    secaoFuncionarios.addEventListener("click", (e) => {
      const btnEditar = e.target.closest(".editar-funcionario");
      const btnApagar = e.target.closest(".apagar-funcionario");

      if (btnEditar) {
        e.stopPropagation();
        const index = parseInt(btnEditar.dataset.index, 10);
        abrirModalParaEditar(index);
      }
      else if (btnApagar) {
        e.stopPropagation();
        const index = parseInt(btnApagar.dataset.index, 10);
        const nomeFunc = funcionarios[index].nome;
        if (confirm(`Tem certeza que deseja apagar ${nomeFunc}?`)) {
          funcionarios.splice(index, 1);
          if (window.registrarLog) window.registrarLog(`Funcionário removido: ${nomeFunc}`);
          atualizarTabelaFuncionarios();
        }
      }
    });
  }

  // =================================================================
  // 5. LÓGICA FINANCEIRA (Receitas e Despesas)
  // =================================================================

  const formDespesa = document.getElementById("form-nova-despesa");
  const tabelaDespesaBody = document.querySelector("#tabela-despesas tbody");
  const totalDespesaEl = document.getElementById("despesa-total");
  const inputBuscaDespesa = document.getElementById("busca-despesa");

  // Carrega despesas do backend se disponível
  let despesas = [];
  if (window.dadosIniciais && window.dadosIniciais.despesas) {
    despesas = window.dadosIniciais.despesas.map(d => ({
      nome: d.nome || 'Sem informação',
      dataEmissao: d.data_emissao || '',
      dataVencimento: d.data_vencimento || '',
      valor: parseFloat(d.valor_total || 0),
      status: d.status || 'Pendente',
      obs: d.obs || '',
      id: d.id_financas || null
    }));
    console.log(`✅ ${despesas.length} despesas carregadas do banco de dados`);
  }

  const formReceita = document.getElementById("form-nova-receita");
  const tabelaReceitaBody = document.querySelector("#tabela-receitas tbody");
  const totalReceitaEl = document.getElementById("receita-total");
  const faturamentoDashboard = document.getElementById("faturamento-dashboard");
  const inputBuscaReceita = document.getElementById("busca-receita");

  // Carrega receitas do backend se disponível
  let receitas = [];
  if (window.dadosIniciais && window.dadosIniciais.receitas) {
    receitas = window.dadosIniciais.receitas.map(r => ({
      origem: r.nome || r.origem || 'Sem informação',
      cliente: r.cliente_ass || r.cliente || 'Sem informação',
      dataEmissao: r.data_emissao || '',
      dataAgendada: r.data_vencimento || r.data_agendada || '',
      valor: parseFloat(r.valor_total || 0),
      obs: r.obs || '',
      id: r.id_financas || null
    }));
    console.log(`✅ ${receitas.length} receitas carregadas do banco de dados`);
  }

  if (formDespesa) {
    formDespesa.addEventListener("submit", (e) => {
      e.preventDefault();
      const nome = document.getElementById("despesa-nome").value;
      const dataEmissao = document.getElementById("despesa-data-emissao").value;
      const dataVencimento = document.getElementById("despesa-data-vencimento").value;
      const valor = parseFloat(document.getElementById("despesa-valor").value);
      const status = document.getElementById("despesa-status").value;
      const obs = document.getElementById("despesa-obs").value;

      if (!nome || !dataEmissao || isNaN(valor)) return;

      despesas.push({ nome, dataEmissao, dataVencimento, valor, status, obs });

      if (window.registrarLog) window.registrarLog(`Adicionou despesa: ${nome} - R$ ${valor}`);

      atualizarTabelaDespesas();
      formDespesa.reset();
    });
  }

  if (formReceita) {
    formReceita.addEventListener("submit", (e) => {
      e.preventDefault();
      const origem = document.getElementById("receita-origem").value;
      const cliente = document.getElementById("receita-cliente").value;
      const dataEmissao = document.getElementById("receita-data-emissao").value;
      const dataAgendada = document.getElementById("receita-data-agendada").value;
      const valor = parseFloat(document.getElementById("receita-valor").value);
      const obs = document.getElementById("receita-obs").value;

      if (!origem || !cliente || !dataEmissao || isNaN(valor)) return;

      receitas.push({ origem, cliente, dataEmissao, dataAgendada, valor, obs });

      if (window.registrarLog) window.registrarLog(`Adicionou receita: ${origem} - R$ ${valor}`);

      atualizarTabelaReceitas();
      atualizarTabelaComprasLoja();
      atualizarTabelaAgendamentosReceita();
      formReceita.reset();
    });
  }

  // Adiciona listeners de busca para as novas tabelas
  if (inputBuscaReceita) inputBuscaReceita.addEventListener("input", atualizarTabelaReceitas);
  const inputBuscaCompras = document.getElementById("busca-compras-loja");
  if (inputBuscaCompras) inputBuscaCompras.addEventListener("input", atualizarTabelaComprasLoja);
  const inputBuscaAgend = document.getElementById("busca-agendamentos-receita");
  if (inputBuscaAgend) inputBuscaAgend.addEventListener("input", atualizarTabelaAgendamentosReceita);
  if (inputBuscaDespesa) inputBuscaDespesa.addEventListener("input", atualizarTabelaDespesas);

  function atualizarTabelaDespesas() {
    if (!tabelaDespesaBody) return;

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    despesas.forEach(despesa => {
      if (despesa.status === 'a_pagar' && despesa.dataVencimento) {
        const partes = despesa.dataVencimento.split('-');
        const vencimento = new Date(partes[0], partes[1] - 1, partes[2]);
        if (vencimento < hoje) despesa.status = 'atrasado';
      }
    });

    tabelaDespesaBody.innerHTML = "";
    let totalFiltrado = 0;
    const termo = inputBuscaDespesa ? inputBuscaDespesa.value.toLowerCase() : "";

    despesas.forEach((despesa, index) => {
      const textoNome = despesa.nome.toLowerCase();
      if (termo === "" || textoNome.includes(termo)) {
        totalFiltrado += despesa.valor;
        const linha = document.createElement("tr");

        // Aplica classes de status com cores
        if (despesa.status === 'atrasado') linha.classList.add('atrasado');
        else if (despesa.status === 'pago') linha.classList.add('pago');
        else if (despesa.status === 'a_pagar') linha.classList.add('a-pagar');

        const selectAPagar = (despesa.status === 'a_pagar') ? 'selected' : '';
        const selectPago = (despesa.status === 'pago') ? 'selected' : '';
        const selectAtrasado = (despesa.status === 'atrasado') ? 'selected' : '';

        linha.innerHTML = `
            <td>${despesa.nome}</td>
            <td>${despesa.dataEmissao}</td>
            <td>${despesa.dataVencimento}</td>
            <td>
              <select class="status-select-despesa" data-index="${index}">
                <option value="a_pagar" ${selectAPagar}>A Pagar</option>
                <option value="pago" ${selectPago}>Pago</option>
                <option value="atrasado" ${selectAtrasado}>Atrasado</option>
              </select>
            </td>
            <td style="color: var(--cor-text-muted); font-size: 14px;">${despesa.obs || "-"}</td>
            <td>R$ ${despesa.valor.toFixed(2)}</td>
            <td>
              <button class="botao-acao apagar-despesa" data-index="${index}"><i class="ph-fill ph-trash"></i></button>
            </td>
          `;
        tabelaDespesaBody.appendChild(linha);
      }
    });

    if (totalDespesaEl) totalDespesaEl.textContent = `R$ ${totalFiltrado.toFixed(2)}`;
    atualizarAlertaAtrasos();
  }

  // Função para renderizar compras da loja
  function atualizarTabelaComprasLoja() {
    const tabelaComprasBody = document.querySelector("#tabela-compras-loja tbody");
    const totalComprasEl = document.getElementById("total-compras-loja");
    const inputBuscaCompras = document.getElementById("busca-compras-loja");

    if (!tabelaComprasBody) return;
    tabelaComprasBody.innerHTML = "";

    let totalFiltrado = 0;
    const termo = inputBuscaCompras ? inputBuscaCompras.value.toLowerCase() : "";

    // Filtra receitas que vêm da loja (origem contém "Pedido")
    const comprasLoja = receitas.filter(r => r.origem.toLowerCase().includes('pedido'));

    comprasLoja.forEach((receita) => {
      const textoOrigem = receita.origem.toLowerCase();
      const textoCliente = receita.cliente.toLowerCase();

      if (termo === "" || textoOrigem.includes(termo) || textoCliente.includes(termo)) {
        totalFiltrado += receita.valor;
        const linha = document.createElement("tr");
        linha.classList.add('pago'); // Pedidos sempre pagos

        linha.innerHTML = `
          <td>${receita.origem}</td>
          <td>${receita.cliente}</td>
          <td>${receita.dataEmissao}</td>
          <td>R$ ${receita.valor.toFixed(2)}</td>
          <td><span class="badge-status pago">Pago</span></td>
        `;
        tabelaComprasBody.appendChild(linha);
      }
    });

    if (totalComprasEl) totalComprasEl.textContent = `R$ ${totalFiltrado.toFixed(2)}`;
  }

  // Função para renderizar agendamentos do site
  function atualizarTabelaAgendamentosReceita() {
    const tabelaAgendBody = document.querySelector("#tabela-agendamentos-receita tbody");
    const totalAgendEl = document.getElementById("total-agendamentos-receita");
    const inputBuscaAgend = document.getElementById("busca-agendamentos-receita");

    if (!tabelaAgendBody) return;
    tabelaAgendBody.innerHTML = "";

    let totalFiltrado = 0;
    const termo = inputBuscaAgend ? inputBuscaAgend.value.toLowerCase() : "";

    // Filtra receitas que vêm de agendamentos (origem não contém "Pedido")
    const agendamentosReceita = receitas.filter(r => !r.origem.toLowerCase().includes('pedido'));

    agendamentosReceita.forEach((receita) => {
      const textoOrigem = receita.origem.toLowerCase();
      const textoCliente = receita.cliente.toLowerCase();

      if (termo === "" || textoOrigem.includes(termo) || textoCliente.includes(termo)) {
        totalFiltrado += receita.valor;
        const linha = document.createElement("tr");
        linha.classList.add('pago');

        linha.innerHTML = `
          <td>${receita.origem}</td>
          <td>${receita.cliente}</td>
          <td>${receita.dataEmissao}</td>
          <td>R$ ${receita.valor.toFixed(2)}</td>
          <td><span class="badge-status pago">Confirmado</span></td>
        `;
        tabelaAgendBody.appendChild(linha);
      }
    });

    if (totalAgendEl) totalAgendEl.textContent = `R$ ${totalFiltrado.toFixed(2)}`;
  }

  function atualizarTabelaReceitas() {
    if (!tabelaReceitaBody) return;
    tabelaReceitaBody.innerHTML = "";

    let totalFiltrado = 0;
    let totalGeral = 0;
    const termo = inputBuscaReceita ? inputBuscaReceita.value.toLowerCase() : "";

    // Mostra apenas receitas manuais (não são de pedido nem agendamento)
    const receitasManuais = receitas.filter(r =>
      !r.origem.toLowerCase().includes('pedido') &&
      !r.origem.toLowerCase().includes('agendamento')
    );

    receitasManuais.forEach((receita, index) => {
      totalGeral += receita.valor;
      const textoOrigem = receita.origem.toLowerCase();
      const textoCliente = receita.cliente.toLowerCase();

      if (termo === "" || textoOrigem.includes(termo) || textoCliente.includes(termo)) {
        totalFiltrado += receita.valor;
        const linha = document.createElement("tr");

        linha.innerHTML = `
            <td>${receita.origem}</td>
            <td>${receita.cliente}</td>
            <td>${receita.dataEmissao}</td>
            <td>${receita.dataAgendada}</td>
            <td style="color: var(--cor-text-muted); font-size: 14px;">${receita.obs || "-"}</td>
            <td>R$ ${receita.valor.toFixed(2)}</td>
            <td>
              <button class="botao-acao apagar-receita" data-index="${index}"><i class="ph-fill ph-trash"></i></button>
            </td>
          `;
        tabelaReceitaBody.appendChild(linha);
      }
    });

    if (totalReceitaEl) totalReceitaEl.textContent = `R$ ${totalFiltrado.toFixed(2)}`;
    if (faturamentoDashboard) faturamentoDashboard.textContent = `R$ ${totalGeral.toFixed(2)}`;
  }

  if (tabelaDespesaBody) {
    tabelaDespesaBody.addEventListener("change", (e) => {
      if (e.target.classList.contains("status-select-despesa")) {
        const index = parseInt(e.target.dataset.index, 10);
        const novoStatus = e.target.value;
        if (despesas[index]) despesas[index].status = novoStatus;
        const linha = e.target.closest('tr');

        // Remove todas as classes de status antes
        linha.classList.remove('atrasado', 'pago', 'a-pagar');

        // Adiciona a classe correspondente ao novo status
        if (novoStatus === 'atrasado') linha.classList.add('atrasado');
        else if (novoStatus === 'pago') linha.classList.add('pago');
        else if (novoStatus === 'a_pagar') linha.classList.add('a-pagar');

        if (window.registrarLog) window.registrarLog(`Alterou status da despesa "${despesas[index].nome}" para ${novoStatus}`);
        atualizarAlertaAtrasos();
      }
    });
    tabelaDespesaBody.addEventListener("click", async (e) => {
      const btn = e.target.closest(".apagar-despesa");
      if (btn) {
        if (confirm("Deseja apagar esta despesa?")) {
          const index = parseInt(btn.dataset.index, 10);
          const despesa = despesas[index];

          // Se tem ID, deleta do banco
          if (despesa.id) {
            try {
              const response = await fetch(`/gestao/despesa/excluir/${despesa.id}`, {
                method: 'POST'
              });
              if (!response.ok) throw new Error('Erro ao excluir');
              console.log(`✅ Despesa "${despesa.nome}" excluída do banco de dados`);
            } catch (error) {
              console.error('Erro ao excluir despesa:', error);
              alert('Erro ao excluir despesa do banco de dados');
              return;
            }
          }

          despesas.splice(index, 1);
          if (window.registrarLog) window.registrarLog(`Removeu despesa: ${despesa.nome}`);
          atualizarTabelaDespesas();
        }
      }
    });
  }

  if (tabelaReceitaBody) {
    tabelaReceitaBody.addEventListener("click", async (e) => {
      const btn = e.target.closest(".apagar-receita");
      if (btn) {
        if (confirm("Deseja apagar esta receita?")) {
          const index = parseInt(btn.dataset.index, 10);
          const receita = receitas[index];

          // Se tem ID, deleta do banco
          if (receita.id) {
            try {
              const response = await fetch(`/gestao/receita/excluir/${receita.id}`, {
                method: 'POST'
              });
              if (!response.ok) throw new Error('Erro ao excluir');
              console.log(`✅ Receita "${receita.origem}" excluída do banco de dados`);
            } catch (error) {
              console.error('Erro ao excluir receita:', error);
              alert('Erro ao excluir receita do banco de dados');
              return;
            }
          }

          receitas.splice(index, 1);
          if (window.registrarLog) window.registrarLog(`Removeu receita: ${receita.origem}`);
          atualizarTabelaReceitas();
        }
      }
    });
  }

  // =================================================================
  // 6. LÓGICA DE PRODUTOS
  // =================================================================
  const formProduto = document.getElementById("form-novo-produto");
  const tabelaProdutosBody = document.querySelector("#tabela-produtos tbody");
  let produtos = [];

  if (formProduto) {
    formProduto.addEventListener("submit", (e) => {
      e.preventDefault();
      const nome = document.getElementById("produto-nome").value;
      const codigo = document.getElementById("produto-codigo").value;
      const tamanho = document.getElementById("produto-tamanho").value;
      const preco = parseFloat(document.getElementById("produto-preco").value);
      const status = document.getElementById("produto-status").value;
      const descricao = document.getElementById("produto-descricao").value;
      const inputFoto = document.getElementById("produto-foto");

      let fotoURL = "";
      if (inputFoto.files && inputFoto.files[0]) {
        fotoURL = URL.createObjectURL(inputFoto.files[0]);
      } else {
        fotoURL = "https://via.placeholder.com/50";
      }

      produtos.push({ nome, codigo, tamanho, preco, status, descricao, fotoURL });
      registrarLog(`Adicionou produto: ${nome} (${codigo})`);
      atualizarTabelaProdutos();
      formProduto.reset();
    });
  }

  function atualizarTabelaProdutos() {
    if (!tabelaProdutosBody) return;
    tabelaProdutosBody.innerHTML = "";
    produtos.forEach((prod, index) => {
      const linha = document.createElement("tr");
      const classeStatus = prod.status === 'disponivel' ? 'status-disponivel' : 'status-indisponivel';
      const selDisponivel = prod.status === 'disponivel' ? 'selected' : '';
      const selIndisponivel = prod.status === 'indisponivel' ? 'selected' : '';

      linha.innerHTML = `
        <td><img src="${prod.fotoURL}" alt="${prod.nome}" class="img-produto-tabela" style="width: 40px; height: 40px; object-fit: cover; border-radius: 4px;"></td>
        <td>${prod.codigo}</td>
        <td>
          <strong>${prod.nome}</strong><br>
          <small style="color: var(--cor-text-muted);">${prod.descricao.substring(0, 30)}...</small>
        </td>
        <td>${prod.tamanho}</td>
        <td>R$ ${prod.preco.toFixed(2)}</td>
        <td>
          <select class="status-select-produto ${classeStatus}" data-index="${index}">
            <option value="disponivel" ${selDisponivel}>Disponível</option>
            <option value="indisponivel" ${selIndisponivel}>Indisponível</option>
          </select>
        </td>
        <td>
          <button class="botao-acao apagar-produto" data-index="${index}" title="Remover Produto">
            <i class="ph-fill ph-trash"></i>
          </button>
        </td>
      `;
      tabelaProdutosBody.appendChild(linha);
    });
  }

  if (tabelaProdutosBody) {
    tabelaProdutosBody.addEventListener("change", (e) => {
      if (e.target.classList.contains("status-select-produto")) {
        const index = parseInt(e.target.dataset.index, 10);
        const novoStatus = e.target.value;
        if (produtos[index]) {
          produtos[index].status = novoStatus;
          registrarLog(`Alterou status de "${produtos[index].nome}" para ${novoStatus.toUpperCase()}`);
        }
        e.target.classList.remove('status-disponivel', 'status-indisponivel');
        if (novoStatus === 'disponivel') e.target.classList.add('status-disponivel');
        else e.target.classList.add('status-indisponivel');
      }
    });
    tabelaProdutosBody.addEventListener("click", (e) => {
      const btn = e.target.closest(".apagar-produto");
      if (btn) {
        if (confirm("Deseja remover este produto do site?")) {
          const index = parseInt(btn.dataset.index, 10);
          const nomeProd = produtos[index].nome;
          produtos.splice(index, 1);
          registrarLog(`Removeu produto: ${nomeProd}`);
          atualizarTabelaProdutos();
        }
      }
    });
  }

  // =================================================================
  // 7. LÓGICA DA SUB-ABA GALERIA
  // =================================================================
  const formGaleria = document.getElementById("form-galeria");
  const gridGaleria = document.getElementById("grid-galeria-items");
  const btnSalvarGaleria = document.getElementById("btn-salvar-galeria");
  const btnCancelarGaleria = document.getElementById("btn-cancelar-galeria");
  const avisoImagem = document.getElementById("aviso-imagem-atual");
  const inputGaleriaIndex = document.getElementById("galeria-index-edicao");
  const inputGaleriaTitulo = document.getElementById("galeria-titulo");
  const inputGaleriaLink = document.getElementById("galeria-link");
  const inputGaleriaImagem = document.getElementById("galeria-imagem");

  let galeriaItems = [
    {
      titulo: "Bastidores Clip",
      link: "https://instagram.com",
      fotoURL: "https://via.placeholder.com/300x200?text=Foto+1"
    }
  ];

  function renderizarGaleria() {
    if (!gridGaleria) return;
    gridGaleria.innerHTML = "";
    galeriaItems.forEach((item, index) => {
      const card = document.createElement("div");
      card.className = "cartao";
      card.style.display = "flex";
      card.style.flexDirection = "column";
      card.style.justifyContent = "space-between";
      card.innerHTML = `
        <div style="margin-bottom: 15px;">
            <img src="${item.fotoURL}" alt="${item.titulo}" style="width: 100%; height: 150px; object-fit: cover; border-radius: 8px; margin-bottom: 10px;">
            <h3 style="font-size: 18px; margin-bottom: 5px;">${item.titulo}</h3>
            <a href="${item.link}" target="_blank" style="color: var(--cor-primaria); font-size: 14px; text-decoration: none;">
               ${item.link ? 'Acessar Link <i class="ph-bold ph-arrow-square-out"></i>' : 'Sem link'}
            </a>
        </div>
        <div style="display: flex; gap: 10px; margin-top: 10px;">
            <button class="botao-principal editar-galeria" data-index="${index}" style="font-size: 14px; padding: 8px; flex: 1; justify-content: center;">
                <i class="ph-fill ph-pencil-simple"></i> Editar
            </button>
            <button class="botao-principal apagar-galeria" data-index="${index}" style="font-size: 14px; padding: 8px; background-color: #ff6b6b; color: white; flex: 0;">
                <i class="ph-fill ph-trash"></i>
            </button>
        </div>
      `;
      gridGaleria.appendChild(card);
    });
  }

  if (formGaleria) {
    formGaleria.addEventListener("submit", (e) => {
      e.preventDefault();
      const indexEdicao = inputGaleriaIndex.value;
      const titulo = inputGaleriaTitulo.value;
      const link = inputGaleriaLink.value;
      const file = inputGaleriaImagem.files[0];
      let urlFinal = "";

      if (indexEdicao !== "") {
        const itemAtual = galeriaItems[parseInt(indexEdicao)];
        if (file) urlFinal = URL.createObjectURL(file);
        else urlFinal = itemAtual.fotoURL;
        galeriaItems[indexEdicao] = { titulo, link, fotoURL: urlFinal };
        registrarLog(`Editou item da galeria: ${titulo}`);
        alert("Item atualizado com sucesso!");
      } else {
        if (file) urlFinal = URL.createObjectURL(file);
        else urlFinal = "https://via.placeholder.com/300x200?text=Sem+Imagem";
        galeriaItems.push({ titulo, link, fotoURL: urlFinal });
        registrarLog(`Adicionou item à galeria: ${titulo}`);
      }
      renderizarGaleria();
      resetarFormularioGaleria();
    });
  }

  function prepararEdicao(index) {
    const item = galeriaItems[index];
    inputGaleriaIndex.value = index;
    inputGaleriaTitulo.value = item.titulo;
    inputGaleriaLink.value = item.link;
    inputGaleriaImagem.value = "";
    avisoImagem.style.display = "block";
    btnSalvarGaleria.querySelector("span").textContent = "Atualizar Item";
    btnCancelarGaleria.style.display = "flex";
    formGaleria.scrollIntoView({ behavior: "smooth" });
  }

  if (gridGaleria) {
    gridGaleria.addEventListener("click", (e) => {
      const btnEditar = e.target.closest(".editar-galeria");
      const btnApagar = e.target.closest(".apagar-galeria");
      if (btnEditar) {
        const index = btnEditar.dataset.index;
        prepararEdicao(index);
      }
      if (btnApagar) {
        if (confirm("Tem certeza que deseja apagar este item?")) {
          const index = btnApagar.dataset.index;
          const tituloItem = galeriaItems[index].titulo;
          galeriaItems.splice(index, 1);
          registrarLog(`Removeu item da galeria: ${tituloItem}`);
          renderizarGaleria();
          if (inputGaleriaIndex.value === index) resetarFormularioGaleria();
        }
      }
    });
  }

  if (btnCancelarGaleria) btnCancelarGaleria.addEventListener("click", resetarFormularioGaleria);

  function resetarFormularioGaleria() {
    formGaleria.reset();
    inputGaleriaIndex.value = "";
    avisoImagem.style.display = "none";
    btnSalvarGaleria.querySelector("span").textContent = "Adicionar Item";
    btnCancelarGaleria.style.display = "none";
  }

  // =================================================================
  // 8. LÓGICA DA SUB-ABA HOME (ATUALIZADA COM LINKS)
  // =================================================================
  let homeData = {
    banner: [], video: [], podcast_destaque: [], episodios: [], apresentadores: [], membros: [], depoimentos: [], parceiros: []
  };

  const gridHome = document.getElementById("grid-home-widgets");

  function renderizarHomeWidgets() {
    if (!gridHome) return;
    Object.keys(homeData).forEach(categoria => {
      const cartao = gridHome.querySelector(`.cartao[data-categoria="${categoria}"]`);
      if (!cartao) return;
      const containerLista = cartao.querySelector(".lista-home-items");
      if (!containerLista) return;
      containerLista.innerHTML = "";
      homeData[categoria].forEach((item, index) => {
        const itemDiv = document.createElement("div");
        itemDiv.style.cssText = "display:flex; align-items:center; justify-content:space-between; background:var(--cor-bg-hover); padding:8px; border-radius:6px; margin-top:8px; border:1px solid var(--cor-borda);";

        // Exibe ícone de link se houver link salvo
        const iconeLink = item.link ? `<i class="ph-fill ph-link" style="font-size: 12px; color: var(--cor-primaria);" title="${item.link}"></i>` : '';

        itemDiv.innerHTML = `
                <div style="display:flex; align-items:center; gap:8px; overflow: hidden;">
                    <img src="${item.fotoURL}" style="width: 30px; height: 30px; border-radius: 4px; object-fit: cover; flex-shrink: 0;">
                    <div style="display:flex; flex-direction:column; overflow: hidden;">
                        <span style="font-size: 13px; font-weight: 600; white-space: nowrap; text-overflow: ellipsis; overflow: hidden;">
                           ${item.titulo} ${iconeLink}
                        </span>
                        ${item.descricao ? `<span style="font-size: 10px; color: var(--cor-text-muted);">${item.descricao.substring(0, 15)}...</span>` : ''}
                    </div>
                </div>
                <div style="display:flex; gap: 5px; flex-shrink: 0;">
                    <button class="editar-home" data-cat="${categoria}" data-index="${index}" style="border:none; background:none; color:var(--cor-primaria); cursor:pointer;"><i class="ph-bold ph-pencil-simple"></i></button>
                    <button class="apagar-home" data-cat="${categoria}" data-index="${index}" style="border:none; background:none; color:#ff6b6b; cursor:pointer;"><i class="ph-bold ph-trash"></i></button>
                </div>
            `;
        containerLista.appendChild(itemDiv);
      });
    });
  }

  if (gridHome) {
    gridHome.addEventListener("click", (e) => {
      const target = e.target;

      // --- AÇÃO DE SALVAR/ADICIONAR ---
      const btnSalvar = target.closest(".btn-salvar-home");
      if (btnSalvar) {
        const cartao = btnSalvar.closest(".cartao");
        const categoria = cartao.dataset.categoria;

        // Inputs
        const inputTitulo = cartao.querySelector(".home-input-titulo");
        const inputFile = cartao.querySelector(".home-input-file");
        const inputDesc = cartao.querySelector(".home-input-desc");
        const inputLink = cartao.querySelector(".home-input-link"); // NOVO INPUT
        const inputIndex = cartao.querySelector(".home-edit-index");

        if (!inputTitulo || inputTitulo.value.trim() === "") { alert("O título/nome é obrigatório."); return; }

        const titulo = inputTitulo.value;
        const descricao = inputDesc ? inputDesc.value : "";
        const link = inputLink ? inputLink.value : ""; // Captura o link
        const file = inputFile.files[0];
        const indexEdicao = inputIndex.value;
        let urlFinal = "https://via.placeholder.com/50?text=IMG";

        if (indexEdicao !== "") {
          // Edição
          const itemAtual = homeData[categoria][parseInt(indexEdicao)];
          if (file) urlFinal = URL.createObjectURL(file);
          else urlFinal = itemAtual.fotoURL;

          // Salva com o link
          homeData[categoria][parseInt(indexEdicao)] = { titulo, descricao, link, fotoURL: urlFinal };

          registrarLog(`Editou item na Home (${categoria}): ${titulo}`);
          btnSalvar.querySelector("span").textContent = "Adicionar";
          inputIndex.value = "";
          alert("Atualizado com sucesso!");
        } else {
          // Novo
          if (file) urlFinal = URL.createObjectURL(file);

          // Salva com o link
          homeData[categoria].push({ titulo, descricao, link, fotoURL: urlFinal });

          registrarLog(`Adicionou à Home (${categoria}): ${titulo}`);
        }

        // Limpa campos
        inputTitulo.value = "";
        if (inputDesc) inputDesc.value = "";
        if (inputLink) inputLink.value = ""; // Limpa o link
        inputFile.value = "";

        renderizarHomeWidgets();
      }

      // --- AÇÃO DE EDITAR ---
      const btnEditar = target.closest(".editar-home");
      if (btnEditar) {
        const categoria = btnEditar.dataset.cat;
        const index = btnEditar.dataset.index;
        const item = homeData[categoria][index];
        const cartao = gridHome.querySelector(`.cartao[data-categoria="${categoria}"]`);

        // Preenche campos
        cartao.querySelector(".home-input-titulo").value = item.titulo;
        if (cartao.querySelector(".home-input-desc")) cartao.querySelector(".home-input-desc").value = item.descricao || "";

        // Preenche o link se o campo existir neste cartão
        if (cartao.querySelector(".home-input-link")) cartao.querySelector(".home-input-link").value = item.link || "";

        cartao.querySelector(".home-edit-index").value = index;
        cartao.querySelector(".btn-salvar-home span").textContent = "Salvar Alteração";
        cartao.querySelector(".home-input-titulo").focus();
      }

      // --- AÇÃO DE APAGAR ---
      const btnApagar = target.closest(".apagar-home");
      if (btnApagar) {
        if (confirm("Remover este item da Home?")) {
          const categoria = btnApagar.dataset.cat;
          const index = parseInt(btnApagar.dataset.index);
          const nomeItem = homeData[categoria][index].titulo;
          homeData[categoria].splice(index, 1);
          registrarLog(`Removeu da Home (${categoria}): ${nomeItem}`);
          renderizarHomeWidgets();
        }
      }
    });
  }
  // =================================================================
  // 9. NAVEGAÇÃO DE SUB-ABAS
  // =================================================================
  const botoesSubAba = document.querySelectorAll(".botao-sub-aba");
  const conteudosSubAba = document.querySelectorAll(".conteudo-sub-aba");

  botoesSubAba.forEach(botao => {
    botao.addEventListener("click", () => {
      botoesSubAba.forEach(b => b.classList.remove("ativo"));
      conteudosSubAba.forEach(c => c.classList.remove("ativo"));
      botao.classList.add("ativo");
      const alvoId = botao.getAttribute("data-alvo");
      const conteudoAlvo = document.getElementById(alvoId);
      if (conteudoAlvo) {
        conteudoAlvo.classList.add("ativo");
      }
    });
  });

  // =================================================================
  // 10. LÓGICA DO WIDGET "EVENTOS DE HOJE" (ATUALIZADA COM CSS DINÂMICO)
  // =================================================================
  function atualizarWidgetEventosHoje() {
    const containerEventos = document.getElementById("lista-eventos-hoje");
    const spanData = document.getElementById("data-hoje-extenso");

    if (!containerEventos) return;

    const hoje = new Date();

    if (spanData) {
      spanData.textContent = hoje.toLocaleDateString("pt-BR", { weekday: 'long', day: 'numeric', month: 'long' });
    }

    containerEventos.innerHTML = "";
    const eventosDoDia = agendamentos.filter(agendamento => isMesmoDia(agendamento.data, hoje));

    if (eventosDoDia.length === 0) {
      containerEventos.innerHTML = `
        <div style="text-align: center; padding: 20px 0; color: var(--cor-text-muted);">
           <i class="ph-fill ph-calendar-slash" style="font-size: 32px; margin-bottom: 8px; display: block; opacity: 0.5;"></i>
           Nenhum agendamento para hoje.
        </div>
      `;
    } else {
      eventosDoDia.forEach(evento => {
        // Normaliza o tipo para usar na classe CSS
        const tipoOriginal = evento.tipo || "geral";
        const tipoClass = `tipo-${tipoOriginal.toLowerCase()}`;

        // Formata o nome para exibição
        let nomeTipoExibicao = tipoOriginal;
        if (tipoOriginal === 'gravacao') nomeTipoExibicao = 'Gravação';
        else if (tipoOriginal === 'mixagem') nomeTipoExibicao = 'Mixagem';
        else if (tipoOriginal === 'reuniao') nomeTipoExibicao = 'Reunião';
        else {
          nomeTipoExibicao = tipoOriginal.charAt(0).toUpperCase() + tipoOriginal.slice(1);
        }

        const item = document.createElement("div");
        item.className = "evento-item";

        item.innerHTML = `
            <div>
                <span class="evento-titulo">${evento.titulo}</span>
                <span style="font-size: 12px; color: var(--cor-text-muted); display: block; margin-top: 4px;">${evento.obs ? evento.obs : 'Sem observações'}</span>
            </div>
            <div class="tipo-evento ${tipoClass}">
                ${nomeTipoExibicao}
            </div>
        `;
        containerEventos.appendChild(item);
      });
    }
  }

  // =================================================================
  // 11. LÓGICA DO ALERTA DE ATRASOS (Visão Geral)
  // =================================================================
  function atualizarAlertaAtrasos() {
    const alerta = document.getElementById("alerta-contas-atrasadas");
    if (!alerta) return;

    // A função atualizarTabelaDespesas já atualiza os status baseada na data
    const temAtraso = despesas.some(d => d.status === 'atrasado');

    if (temAtraso) {
      alerta.style.display = "flex";
    } else {
      alerta.style.display = "none";
    }
  }

  // =================================================================
  // 12. LÓGICA DE CLIENTES (LISTAGEM, BUSCA E EDIÇÃO)
  // =================================================================
  const tabelaClientesBody = document.querySelector("#tabela-clientes tbody");
  const inputBuscaCliente = document.getElementById("busca-cliente");

  const modalEditarCliente = document.getElementById("modal-editar-cliente");
  const btnFecharModalCliente = document.getElementById("modal-fechar-editar-cliente");
  const formEditarCliente = document.getElementById("form-editar-cliente");

  const divCamposPF = document.getElementById("campos-edit-pf");
  const divCamposPJ = document.getElementById("campos-edit-pj");

  const inputEditIndex = document.getElementById("edit-cliente-index");
  const inputEditTipo = document.getElementById("edit-cliente-tipo-atual");
  const inputEditNome = document.getElementById("edit-cliente-nome");
  const inputEditCPF = document.getElementById("edit-cliente-cpf");
  const inputEditNascimento = document.getElementById("edit-cliente-nascimento");
  const inputEditRazao = document.getElementById("edit-cliente-razao");
  const inputEditCNPJ = document.getElementById("edit-cliente-cnpj");
  const inputEditEmail = document.getElementById("edit-cliente-email");
  const inputEditTelefone = document.getElementById("edit-cliente-telefone");
  const inputEditCEP = document.getElementById("edit-cliente-cep");
  const inputEditLogradouro = document.getElementById("edit-cliente-logradouro");
  const inputEditNumero = document.getElementById("edit-cliente-numero");
  const inputEditBairro = document.getElementById("edit-cliente-bairro");
  const inputEditCidade = document.getElementById("edit-cliente-cidade");
  const inputEditUF = document.getElementById("edit-cliente-uf");
  const inputEditSenha = document.getElementById("edit-cliente-senha");

  // Carrega clientes do backend se disponível
  let listaClientes = [];
  if (window.dadosIniciais && window.dadosIniciais.clientes) {
    listaClientes = window.dadosIniciais.clientes.map(c => {
      if (c.tipo === 'PF') {
        return {
          tipo: "PF",
          nome: c.nome,
          cpf: c.doc || c.cpf || '',
          nascimento: c.data_nasc || '',
          email: c.email,
          telefone: c.tel_cel || '',
          cep: c.cep || '',
          logradouro: c.logradouro || '',
          numero: c.numero || '',
          bairro: c.bairro || '',
          cidade: c.cidade || '',
          uf: c.estado || '',
          senha: '***' // Não exibir senha real
        };
      } else {
        return {
          tipo: "PJ",
          razao: c.nome,
          cnpj: c.doc || c.cnpj || '',
          email: c.email,
          telefone: c.tel_cel || '',
          cep: c.cep || '',
          logradouro: c.logradouro || '',
          numero: c.numero || '',
          bairro: c.bairro || '',
          cidade: c.cidade || '',
          uf: c.estado || '',
          senha: '***' // Não exibir senha real
        };
      }
    });
    console.log(`✅ ${listaClientes.length} clientes carregados do banco de dados`);
  }

  function atualizarTabelaClientes() {
    if (!tabelaClientesBody) return;
    tabelaClientesBody.innerHTML = "";
    const termo = inputBuscaCliente ? inputBuscaCliente.value.toLowerCase() : "";

    listaClientes.forEach((cliente, index) => {
      const displayNome = cliente.tipo === "PF" ? cliente.nome : cliente.razao;
      const displayDoc = cliente.tipo === "PF" ? cliente.cpf : cliente.cnpj;

      const textoNome = displayNome.toLowerCase();
      const textoEmail = cliente.email.toLowerCase();
      const textoDoc = displayDoc.replace(/\D/g, '');

      if (termo === "" || textoNome.includes(termo) || textoEmail.includes(termo) || textoDoc.includes(termo)) {
        const linha = document.createElement("tr");

        // Verifica se cliente fez compra na loja
        const comprouLoja = receitas.some(r =>
          r.cliente.toLowerCase() === displayNome.toLowerCase() &&
          r.origem.toLowerCase().includes('pedido')
        );

        // Verifica se cliente fez agendamento
        const fezAgendamento = receitas.some(r =>
          r.cliente.toLowerCase() === displayNome.toLowerCase() &&
          !r.origem.toLowerCase().includes('pedido')
        );

        // Cria badges de atividade
        let badgesAtividade = '';
        if (comprouLoja) {
          badgesAtividade += '<span class="badge-atividade loja" title="Comprou na Loja">🛒 Loja</span>';
        }
        if (fezAgendamento) {
          badgesAtividade += '<span class="badge-atividade agendamento" title="Fez Agendamento">📅 Agendou</span>';
        }

        linha.innerHTML = `
            <td>
                <strong>${displayNome}</strong><br>
                <small style="color: var(--cor-text-muted); font-size: 12px;">${displayDoc}</small>
                <div style="margin-top: 4px;">${badgesAtividade}</div>
            </td>
            <td>${cliente.email}</td>
            <td>${cliente.telefone}</td>
            <td>
                <span style="background: var(--cor-bg-hover); color: var(--cor-text-main); padding: 2px 8px; border-radius: 4px; font-weight: 600; font-size: 12px; border: 1px solid var(--cor-borda);">
                    ${cliente.tipo}
                </span>
            </td>
            <td>
              <button class="botao-acao editar-cliente" data-index="${index}" title="Editar Cliente">
                <i class="ph-fill ph-pencil-simple"></i>
              </button>
              <button class="botao-acao apagar-cliente" data-index="${index}" title="Remover Cliente" style="margin-left: 8px;">
                <i class="ph-fill ph-trash"></i>
              </button>
            </td>
          `;
        tabelaClientesBody.appendChild(linha);
      }
    });
  }

  function abrirModalEditarCliente(index) {
    const cliente = listaClientes[index];

    divCamposPF.style.display = "none";
    divCamposPJ.style.display = "none";

    inputEditIndex.value = index;
    inputEditTipo.value = cliente.tipo;
    inputEditEmail.value = cliente.email;
    inputEditTelefone.value = cliente.telefone || "";
    inputEditCEP.value = cliente.cep || "";
    inputEditLogradouro.value = cliente.logradouro || "";
    inputEditNumero.value = cliente.numero || "";
    inputEditBairro.value = cliente.bairro || "";
    inputEditCidade.value = cliente.cidade || "";
    inputEditUF.value = cliente.uf || "";
    inputEditSenha.value = cliente.senha || "";

    if (cliente.tipo === "PF") {
      divCamposPF.style.display = "block";
      inputEditNome.value = cliente.nome;
      inputEditCPF.value = cliente.cpf;
      inputEditNascimento.value = cliente.nascimento || "";

      inputEditRazao.required = false;
      inputEditCNPJ.required = false;
      inputEditNome.required = true;
    } else {
      divCamposPJ.style.display = "block";
      inputEditRazao.value = cliente.razao;
      inputEditCNPJ.value = cliente.cnpj;

      inputEditNome.required = false;
      inputEditCPF.required = false;
      inputEditRazao.required = true;
    }

    modalEditarCliente.style.display = "flex";
  }

  if (formEditarCliente) {
    formEditarCliente.addEventListener("submit", (e) => {
      e.preventDefault();

      const index = inputEditIndex.value;
      const tipo = inputEditTipo.value;
      // Valida data de nascimento se PF
      if (tipo === "PF" && inputEditNascimento.value) {
        const partes = inputEditNascimento.value.split('-');
        const ano = parseInt(partes[0], 10);
        if (ano < 1900 || ano > new Date().getFullYear() - 18) {
          alert('❌ Data de nascimento inválida! Você deve ter pelo menos 18 anos e a data deve estar entre 1900 e ' + (new Date().getFullYear() - 18));
          return;
        }
      }


      const clienteAtualizado = {
        ...listaClientes[index],
        tipo: tipo,
        email: inputEditEmail.value,
        telefone: inputEditTelefone.value,
        cep: inputEditCEP.value,
        logradouro: inputEditLogradouro.value,
        numero: inputEditNumero.value,
        bairro: inputEditBairro.value,
        cidade: inputEditCidade.value,
        uf: inputEditUF.value,
        senha: inputEditSenha.value
      };

      if (tipo === "PF") {
        clienteAtualizado.nome = inputEditNome.value;
        clienteAtualizado.cpf = inputEditCPF.value;
        clienteAtualizado.nascimento = inputEditNascimento.value;
      } else {
        clienteAtualizado.razao = inputEditRazao.value;
        clienteAtualizado.cnpj = inputEditCNPJ.value;
      }

      listaClientes[index] = clienteAtualizado;

      if (window.registrarLog) window.registrarLog(`Cliente editado: ${tipo === 'PF' ? clienteAtualizado.nome : clienteAtualizado.razao}`);

      atualizarTabelaClientes();
      modalEditarCliente.style.display = "none";
      alert("Dados do cliente atualizados com sucesso!");
    });
  }

  if (btnFecharModalCliente) {
    btnFecharModalCliente.addEventListener("click", () => {
      modalEditarCliente.style.display = "none";
    });
  }
  if (modalEditarCliente) {
    modalEditarCliente.addEventListener("click", (e) => {
      if (e.target === modalEditarCliente) modalEditarCliente.style.display = "none";
    });
  }

  if (tabelaClientesBody) {
    tabelaClientesBody.addEventListener("click", (e) => {
      const btnEditar = e.target.closest(".editar-cliente");
      if (btnEditar) {
        const index = parseInt(btnEditar.dataset.index);
        abrirModalEditarCliente(index);
      }

      const btnApagar = e.target.closest(".apagar-cliente");
      if (btnApagar) {
        if (confirm("Deseja remover este cliente da base?")) {
          const index = parseInt(btnApagar.dataset.index);
          const nomeRemovido = listaClientes[index].tipo === 'PF' ? listaClientes[index].nome : listaClientes[index].razao;
          listaClientes.splice(index, 1);
          if (window.registrarLog) window.registrarLog(`Cliente removido: ${nomeRemovido}`);
          atualizarTabelaClientes();
        }
      }
    });
  }

  if (inputBuscaCliente) inputBuscaCliente.addEventListener("input", atualizarTabelaClientes);

  // =================================================================
  // LÓGICA DO NOVO CLIENTE (MODAL E CEP) - Implementação da última requisição
  // =================================================================
  const modalNovoCliente = document.getElementById("modal-novo-cliente");
  const btnAbrirNovoCliente = document.getElementById("btn-novo-cliente");
  const btnFecharNovoCliente = document.getElementById("modal-fechar-novo-cliente");
  const formNovoCliente = document.getElementById("form-novo-cliente");

  // Inputs do formulário
  const inputNovoCEP = document.getElementById("novo-cliente-cep");
  const inputNovoLogradouro = document.getElementById("novo-cliente-logradouro");
  const inputNovoBairro = document.getElementById("novo-cliente-bairro");
  const inputNovoCidade = document.getElementById("novo-cliente-cidade");
  const inputNovoUF = document.getElementById("novo-cliente-uf");
  const inputNovoNumero = document.getElementById("novo-cliente-numero");

  const inputNovoCPF = document.getElementById("novo-cliente-cpf");
  const inputNovoTelefone = document.getElementById("novo-cliente-telefone");

  // 1. Abrir e Fechar Modal
  if (btnAbrirNovoCliente) {
    btnAbrirNovoCliente.addEventListener("click", () => {
      formNovoCliente.reset(); // Limpa o formulário ao abrir
      modalNovoCliente.style.display = "flex";
    });
  }

  if (btnFecharNovoCliente) {
    btnFecharNovoCliente.addEventListener("click", () => {
      modalNovoCliente.style.display = "none";
    });
  }

  if (modalNovoCliente) {
    modalNovoCliente.addEventListener("click", (e) => {
      if (e.target === modalNovoCliente) modalNovoCliente.style.display = "none";
    });
  }

  // 2. Máscaras Simples (CPF e Telefone)
  if (inputNovoCPF) {
    inputNovoCPF.addEventListener('input', (e) => {
      let v = e.target.value.replace(/\D/g, '');
      if (v.length > 11) v = v.substring(0, 11);
      v = v.replace(/(\d{3})(\d)/, '$1.$2');
      v = v.replace(/(\d{3})(\d)/, '$1.$2');
      v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
      e.target.value = v;
    });
  }

  if (inputNovoTelefone) {
    inputNovoTelefone.addEventListener('input', (e) => {
      let v = e.target.value.replace(/\D/g, '');
      v = v.replace(/^(\d{2})(\d)/g, '($1) $2');
      v = v.replace(/(\d)(\d{4})$/, '$1-$2');
      e.target.value = v;
    });
  }

  // 3. Busca Automática de CEP (ViaCEP)
  if (inputNovoCEP) {
    inputNovoCEP.addEventListener("blur", async () => {
      let cep = inputNovoCEP.value.replace(/\D/g, '');

      if (cep.length === 8) {
        // Feedback visual de carregamento (opcional)
        inputNovoLogradouro.placeholder = "Buscando...";

        try {
          const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
          const data = await response.json();

          if (!data.erro) {
            inputNovoLogradouro.value = data.logradouro;
            inputNovoBairro.value = data.bairro;
            inputNovoCidade.value = data.localidade;
            inputNovoUF.value = data.uf;
            inputNovoNumero.focus(); // Foca no número para o usuário digitar
          } else {
            alert("CEP não encontrado.");
            inputNovoLogradouro.value = "";
            inputNovoBairro.value = "";
            inputNovoCidade.value = "";
            inputNovoUF.value = "";
          }
        } catch (error) {
          console.error("Erro ao buscar CEP:", error);
          alert("Erro ao buscar o CEP.");
        }
        inputNovoLogradouro.placeholder = ""; // Limpa placeholder
      }
    });

    // Máscara CEP
    inputNovoCEP.addEventListener('input', (e) => {
      let v = e.target.value.replace(/\D/g, '');
      if (v.length > 5) v = v.replace(/^(\d{5})(\d)/, '$1-$2');
      e.target.value = v;
    });
  }

  // 4. Salvar Cliente (Adicionar à lista)
  if (formNovoCliente) {
    formNovoCliente.addEventListener("submit", (e) => {
      e.preventDefault();

      const senha = document.getElementById("novo-cliente-senha").value;
      const confSenha = document.getElementById("novo-cliente-confirmar-senha").value;

      if (senha !== confSenha) {
        alert("As senhas não coincidem.");
        return;
      }

      // Cria objeto do cliente
      const novoCliente = {
        tipo: "PF", // Assumindo PF pelo formulário simplificado
        nome: document.getElementById("novo-cliente-nome").value,
        cpf: inputNovoCPF.value,
        nascimento: document.getElementById("novo-cliente-nascimento").value,
        email: document.getElementById("novo-cliente-email").value,
        telefone: inputNovoTelefone.value,
        cep: inputNovoCEP.value,
        logradouro: inputNovoLogradouro.value,
        numero: inputNovoNumero.value,
        bairro: inputNovoBairro.value,
        cidade: inputNovoCidade.value,
        uf: inputNovoUF.value,
        senha: senha
      };

      // Adiciona à lista global (mockada no gestao.js)
      listaClientes.push(novoCliente);

      // Atualiza a tabela e fecha
      if (window.registrarLog) window.registrarLog(`Novo cliente cadastrado: ${novoCliente.nome}`);
      atualizarTabelaClientes();
      modalNovoCliente.style.display = "none";
      alert("Cliente cadastrado com sucesso!");
    });
  }


  // Inicializa tabela
  atualizarTabelaClientes();

  // =================================================================
  // LÓGICA DE CONTRATOS (Clientes e Funcionários)
  // =================================================================

  let contratos = [];
  if (window.dadosIniciais && window.dadosIniciais.contratos) {
    contratos = window.dadosIniciais.contratos.map(c => ({
      id: c.id_contratos,
      cliente: c.cliente_ass || 'Sem informação',
      titulo: c.titulo_doc || 'Contrato',
      arquivo: c.arquivo || '',
      tipo: c.cliente_ass && c.cliente_ass.includes('Funcionário') ? 'funcionario' : 'cliente' // Simples heurística
    }));
    console.log(`✅ ${contratos.length} contratos carregados do banco de dados`);
  }

  function renderizarContratosClientes() {
    const tabelaBody = document.querySelector("#tabela-contratos-clientes tbody");
    if (!tabelaBody) return;

    tabelaBody.innerHTML = "";
    const contratosClientes = contratos.filter(c => c.tipo === 'cliente');

    if (contratosClientes.length === 0) {
      tabelaBody.innerHTML = '<tr><td colspan="4" style="text-align:center; color: var(--cor-text-muted);">Nenhum contrato de cliente cadastrado</td></tr>';
      return;
    }

    contratosClientes.forEach(contrato => {
      const linha = document.createElement("tr");
      linha.innerHTML = `
        <td>${contrato.titulo}</td>
        <td>${contrato.cliente}</td>
        <td>-</td>
        <td>
          <button class="botao-acao" onclick="window.open('/static/uploads/contratos/${contrato.arquivo}', '_blank')" title="Visualizar">
            <i class="ph-fill ph-file-pdf"></i>
          </button>
          <button class="botao-acao" onclick="excluirContrato(${contrato.id}, 'cliente')" title="Excluir">
            <i class="ph-fill ph-trash"></i>
          </button>
        </td>
      `;
      tabelaBody.appendChild(linha);
    });
  }

  function renderizarContratosFuncionarios() {
    const tabelaBody = document.querySelector("#tabela-contratos-funcionarios tbody");
    if (!tabelaBody) return;

    tabelaBody.innerHTML = "";
    const contratosFuncionarios = contratos.filter(c => c.tipo === 'funcionario');

    if (contratosFuncionarios.length === 0) {
      tabelaBody.innerHTML = '<tr><td colspan="4" style="text-align:center; color: var(--cor-text-muted);">Nenhum contrato de funcionário cadastrado</td></tr>';
      return;
    }

    contratosFuncionarios.forEach(contrato => {
      const linha = document.createElement("tr");
      linha.innerHTML = `
        <td>${contrato.titulo}</td>
        <td>${contrato.cliente}</td>
        <td>-</td>
        <td>
          <button class="botao-acao" onclick="window.open('/static/uploads/contratos/${contrato.arquivo}', '_blank')" title="Visualizar">
            <i class="ph-fill ph-file-pdf"></i>
          </button>
          <button class="botao-acao" onclick="excluirContrato(${contrato.id}, 'funcionario')" title="Excluir">
            <i class="ph-fill ph-trash"></i>
          </button>
        </td>
      `;
      tabelaBody.appendChild(linha);
    });
  }

  window.excluirContrato = function (id, tipo) {
    if (confirm('Deseja excluir este contrato?')) {
      // Remove do array local
      const index = contratos.findIndex(c => c.id === id);
      if (index !== -1) {
        contratos.splice(index, 1);
        console.log(`✅ Contrato ${id} excluído`);

        // Re-renderiza as tabelas
        renderizarContratosClientes();
        renderizarContratosFuncionarios();
      }
    }
  };

  // --- INICIALIZAÇÕES FINAIS ---
  renderizarLogs();
  atualizarTabelaFuncionarios();
  atualizarTabelaReceitas();
  atualizarTabelaComprasLoja(); // Renderiza compras da loja
  atualizarTabelaAgendamentosReceita(); // Renderiza agendamentos como receitas
  atualizarTabelaDespesas();
  renderizarCalendario(); // Carrega calendário com agendamentos do banco
  renderizarContratosClientes(); // Carrega contratos de clientes
  renderizarContratosFuncionarios(); // Carrega contratos de funcionários
  renderizarGaleria();
  renderizarHomeWidgets();
  atualizarWidgetEventosHoje();
  atualizarTabelaClientes();

  // Inicializa primeira aba de receitas como ativa
  const primeiraAbaReceita = document.querySelector('.aba-receita-btn.aba-ativa');
  if (primeiraAbaReceita) {
    primeiraAbaReceita.style.color = 'var(--cor-primaria)';
    primeiraAbaReceita.style.borderBottomColor = 'var(--cor-primaria)';
  }
});