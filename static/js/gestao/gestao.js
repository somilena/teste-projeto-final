document.addEventListener("DOMContentLoaded", () => {
  // =================================================================
  // 0. LÓGICA DE TEMA (CLARO/ESCURO)
  // =================================================================
  const btnTema = document.getElementById("btn-tema-toggle");
  if (btnTema) {
    const body = document.body;
    const iconeTema = btnTema.querySelector("i");
    const textoTema = btnTema.querySelector("span");

    // Verifica preferência salva
    const temaSalvo = localStorage.getItem("prodcumaru_tema");
    if (temaSalvo === "dark") {
      body.classList.add("dark-mode");
      if (iconeTema) iconeTema.classList.replace("ph-moon", "ph-sun");
      if (textoTema) textoTema.textContent = "Modo Claro";
    }

    btnTema.addEventListener("click", () => {
      body.classList.toggle("dark-mode");

      if (body.classList.contains("dark-mode")) {
        localStorage.setItem("prodcumaru_tema", "dark");
        if (iconeTema) iconeTema.classList.replace("ph-moon", "ph-sun");
        if (textoTema) textoTema.textContent = "Modo Claro";
      } else {
        localStorage.setItem("prodcumaru_tema", "light");
        if (iconeTema) iconeTema.classList.replace("ph-sun", "ph-moon");
        if (textoTema) textoTema.textContent = "Modo Escuro";
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
      const paginaAlvoID = item.getAttribute("data-pagina");

      // Atualiza Menu (Visual do item ativo na esquerda)
      itensMenu.forEach((i) => i.classList.remove("ativo"));
      item.classList.add("ativo");

      // Atualiza Conteúdo (Mostra a seção correspondente)
      paginasConteudo.forEach((pagina) => pagina.classList.remove("ativa"));
      const secaoAlvo = document.getElementById("secao-" + paginaAlvoID);
      if (secaoAlvo) {
        secaoAlvo.classList.add("ativa");
      }

      // Atualiza título na topbar
      const tituloPagina = document.getElementById("titulo-pagina");
      if (tituloPagina) {
        const textoItem = item.querySelector("span");
        if (textoItem) {
          tituloPagina.textContent = textoItem.textContent;
        }
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
            <td style="font-size: 14px; color: var(--cor-texto-secundario);">${log.data}</td>
            <td><span style="background: var(--cor-acento-secundario); color: #111; padding: 2px 8px; border-radius: 4px; font-weight: 600; font-size: 12px;">${log.usuario}</span></td>
            <td>${log.acao}</td>
        `;
      tabelaLogsBody.appendChild(linha);
    });
  }

  // =====================
  // Toasts / Feedback UX
  // =====================
  function getToastContainer() {
    let c = document.getElementById('toast-container');
    if (!c) {
      c = document.createElement('div');
      c.id = 'toast-container';
      document.body.appendChild(c);
    }
    return c;
  }

  function showToast(message, type = 'info', small = '') {
    const container = getToastContainer();
    const t = document.createElement('div');
    t.className = `toast ${type}`;
    t.innerHTML = `<div>${message}</div>` + (small ? `<small>${small}</small>` : '');
    container.appendChild(t);
    setTimeout(() => {
      t.style.opacity = '0';
      setTimeout(() => t.remove(), 400);
    }, 4000);
    return t;
  }

  function setButtonLoading(btn, loading, textBackup) {
    if (!btn) return;
    if (loading) {
      btn.dataset._oldText = btn.textContent;
      btn.disabled = true;
      btn.textContent = textBackup || 'Aguarde...';
    } else {
      btn.disabled = false;
      btn.textContent = btn.dataset._oldText || textBackup || 'Salvar';
      delete btn.dataset._oldText;
    }
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
  let agendamentos = [];

  // Carregar agendamentos do banco de dados
  async function carregarAgendamentos() {
    try {
      const response = await fetch('/api/agendamentos');
      if (!response.ok) throw new Error('Erro ao carregar agendamentos');
      const dados = await response.json();
      agendamentos = dados.map(ag => ({
        id: ag.id_reg_agendamentos,
        data: new Date(ag.data_agend),
        titulo: ag.nome,
        tipo: ag.servico,
        obs: ag.obs,
        ...ag
      }));
      renderizarCalendario();
      atualizarWidgetEventosHoje();
    } catch (erro) {
      console.error('Erro ao carregar agendamentos:', erro);
    }
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
      atualizarWidgetEventosHoje(); // <--- ATUALIZA VISÃO GERAL
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
          atualizarWidgetEventosHoje(); // <--- ATUALIZA VISÃO GERAL
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

  // ATUALIZADO: Agora usa tabela em vez de container de blocos
  const tabelaFuncionariosBody = document.querySelector("#tabela-funcionarios tbody");
  const inputBuscaFuncionario = document.getElementById("busca-funcionario");

  // Elementos do Formulário
  const inputIndexEdicao = document.getElementById("funcionario-index-edicao");
  const tituloModalFuncionario = document.getElementById("titulo-modal-funcionario");
  const btnSalvarFuncionario = document.getElementById("btn-salvar-funcionario");
  const inputNomeFunc = document.getElementById("funcionario-nome");
  const inputCpfFunc = document.getElementById("funcionario-cpf");
  const inputEmailFunc = document.getElementById("funcionario-email");
  const inputCargoFunc = document.getElementById("funcionario-cargo");
  const inputTelFunc = document.getElementById("funcionario-tel-cel");
  const inputSenhaFunc = document.getElementById("funcionario-senha");
  const inputConfSenhaFunc = document.getElementById("funcionario-confirmar-senha");

  // Detalhes (pode ser usado via tabela ou removido se preferir só tabela)
  const modalDetalhesFuncionario = document.getElementById("modal-detalhes-funcionario");
  const botaoFecharModalDetalhes = document.getElementById("modal-fechar-detalhes-funcionario");

  let funcionarios = [];

  // Carregar funcionários do banco de dados
  async function carregarFuncionarios() {
    try {
      const response = await fetch('/api/funcionarios');
      if (!response.ok) throw new Error('Erro ao carregar funcionários');
      funcionarios = await response.json();
      funcionarios = funcionarios.map(func => ({
        ...func,
        nome: func.nome,
        cpf: func.cpf,
        email: func.email,
        cargo: func.cargo,
        telefone: func.tel_cel
      }));
      atualizarTabelaFuncionarios();
    } catch (erro) {
      console.error('Erro ao carregar funcionários:', erro);
    }
  }

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
    formFuncionario.addEventListener("submit", async (e) => {
      e.preventDefault();

      const index = inputIndexEdicao.value;
      const nome = inputNomeFunc.value;
      const cpf = inputCpfFunc.value;
      const email = inputEmailFunc.value;
      const cargo = inputCargoFunc.value;
      const telefone = inputTelFunc.value;
      const senha = inputSenhaFunc.value;
      const confirmarSenha = inputConfSenhaFunc.value;

      if (senha && senha !== confirmarSenha) {
        showToast("As senhas não coincidem.", "error");
        return;
      }
      if (cpf.length < 14) {
        showToast("CPF incompleto.", "error");
        return;
      }

      const dadosFuncionario = { nome, cpf, email, cargo, tel_cel: telefone };
      if (senha) dadosFuncionario.senha = senha;

      if (index !== "") {
        // Atualizar funcionário existente via PUT
        const funcId = funcionarios[parseInt(index)].id_funcionarios;
        try {
          setButtonLoading(btnSalvarFuncionario, true, 'Atualizando...');
          const response = await fetch(`/api/funcionarios/${funcId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dadosFuncionario)
          });

          if (!response.ok) throw new Error('Erro ao atualizar funcionário');

          if (window.registrarLog) window.registrarLog(`Funcionário atualizado: ${nome}`);
          showToast("Funcionário atualizado com sucesso!", "success");
          await carregarFuncionarios();
        } catch (erro) {
          console.error('Erro:', erro);
          showToast("Erro ao atualizar funcionário.", "error", erro.message || '');
        } finally {
          setButtonLoading(btnSalvarFuncionario, false);
        }
      } else {
        // Novo funcionário
        if (!senha) { showToast("Senha é obrigatória para novos cadastros.", "error"); return; }
        dadosFuncionario.senha_aces = senha;
        dadosFuncionario.data_admis = new Date().toISOString().split('T')[0];
        dadosFuncionario.log_aces = "web";
        dadosFuncionario.nivel_aces = 1;
        dadosFuncionario.status = "Ativo";

        try {
          setButtonLoading(btnSalvarFuncionario, true, 'Cadastrando...');
          const response = await fetch('/api/funcionarios', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dadosFuncionario)
          });

          if (!response.ok) throw new Error('Erro ao criar funcionário');

          if (window.registrarLog) window.registrarLog(`Funcionário cadastrado: ${nome}`);
          showToast("Funcionário cadastrado com sucesso!", "success");
          await carregarFuncionarios();
        } catch (erro) {
          console.error('Erro:', erro);
          showToast("Erro ao cadastrar funcionário.", "error", erro.message || '');
        } finally {
          setButtonLoading(btnSalvarFuncionario, false);
        }
      }

      fecharModalFuncionario();
    });
  }

  // ATUALIZADO: Renderiza em Tabela
  function atualizarTabelaFuncionarios() {
    if (!tabelaFuncionariosBody) return;

    tabelaFuncionariosBody.innerHTML = "";
    const termo = inputBuscaFuncionario ? inputBuscaFuncionario.value.toLowerCase() : "";

    funcionarios.forEach((func, index) => {
      const textoNome = func.nome.toLowerCase();
      const textoCargo = func.cargo.toLowerCase();
      const textoCpf = (func.cpf || "").replace(/\D/g, '');

      if (termo === "" || textoNome.includes(termo) || textoCargo.includes(termo) || textoCpf.includes(termo)) {

        const linha = document.createElement("tr");
        const cargoFormatado = func.cargo.charAt(0).toUpperCase() + func.cargo.slice(1);

        linha.innerHTML = `
          <td><strong>${func.nome}</strong></td>
          <td>${func.cpf}</td>
          <td>
             <span style="background: var(--cor-acento-secundario); color: #111; padding: 2px 8px; border-radius: 4px; font-weight: 600; font-size: 12px;">
               ${cargoFormatado}
             </span>
          </td>
          <td>${func.email}</td>
          <td>${func.tel_cel || func.telefone || "-"}</td>
          <td>
            <button class="botao-acao editar-funcionario" data-id="${func.id_funcionarios}" data-index="${index}" title="Editar">
              <i class="ph-fill ph-pencil-simple"></i>
            </button>
            <button class="botao-acao apagar-funcionario" data-id="${func.id_funcionarios}" data-index="${index}" title="Apagar" style="margin-left: 10px;">
              <i class="ph-fill ph-trash"></i>
            </button>
          </td>
        `;
        tabelaFuncionariosBody.appendChild(linha);
      }
    });
  }

  // Listener para busca de funcionários
  if (inputBuscaFuncionario) {
    inputBuscaFuncionario.addEventListener("input", atualizarTabelaFuncionarios);
  }

  if (secaoFuncionarios) {
    secaoFuncionarios.addEventListener("click", async (e) => {
      const btnEditar = e.target.closest(".editar-funcionario");
      const btnApagar = e.target.closest(".apagar-funcionario");

      if (btnEditar) {
        e.stopPropagation();
        const index = parseInt(btnEditar.dataset.index, 10);
        abrirModalParaEditar(index);
      }
      else if (btnApagar) {
        e.stopPropagation();
        const funcId = btnApagar.dataset.id || parseInt(btnApagar.dataset.index, 10);
        const nomeFunc = funcionarios[funcId]?.nome || funcionarios[parseInt(btnApagar.dataset.index)]?.nome;
        if (confirm(`Tem certeza que deseja apagar ${nomeFunc}?`)) {
          try {
            const response = await fetch(`/api/funcionarios/${funcId}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Erro ao deletar funcionário');
            if (window.registrarLog) window.registrarLog(`Funcionário removido: ${nomeFunc}`);
            showToast('Funcionário removido.', 'success');
            carregarFuncionarios();
          } catch (erro) {
            console.error('Erro ao deletar funcionário:', erro);
            showToast('Erro ao deletar funcionário', 'error', erro.message || '');
          }
        }
      }
    });
  }

  // =================================================================
  // 5. LÓGICA FINANCEIRA (Receitas e Despesas) - COM OBS E ALERTA
  // =================================================================

  const formDespesa = document.getElementById("form-nova-despesa");
  const tabelaDespesaBody = document.querySelector("#tabela-despesas tbody");
  const totalDespesaEl = document.getElementById("despesa-total");
  const inputBuscaDespesa = document.getElementById("busca-despesa");
  let despesas = [];

  // Carregar despesas do banco de dados
  async function carregarDespesas() {
    try {
      const response = await fetch('/api/financas/Despesa');
      if (!response.ok) throw new Error('Erro ao carregar despesas');
      despesas = await response.json();
      atualizarTabelaDespesas();
    } catch (erro) {
      console.error('Erro ao carregar despesas:', erro);
    }
  }

  const formReceita = document.getElementById("form-nova-receita");
  const tabelaReceitaBody = document.querySelector("#tabela-receitas tbody");
  const totalReceitaEl = document.getElementById("receita-total");
  const faturamentoDashboard = document.getElementById("faturamento-dashboard");
  const inputBuscaReceita = document.getElementById("busca-receita");
  let receitas = [];

  // Carregar receitas do banco de dados
  async function carregarReceitas() {
    try {
      const response = await fetch('/api/financas/Receita');
      if (!response.ok) throw new Error('Erro ao carregar receitas');
      receitas = await response.json();
      atualizarTabelaReceitas();
    } catch (erro) {
      console.error('Erro ao carregar receitas:', erro);
    }
  }

  if (formDespesa) {
    formDespesa.addEventListener("submit", async (e) => {
      e.preventDefault();
      const formData = new FormData(formDespesa);

      const btn = formDespesa.querySelector('button[type=submit]');
      try {
        setButtonLoading(btn, true, 'Enviando...');
        const response = await fetch('/gestao/despesa/nova', {
          method: 'POST',
          body: formData,
          credentials: 'same-origin'
        });

        if (!response.ok) throw new Error('Erro ao salvar despesa');

        if (window.registrarLog) window.registrarLog(`Adicionou despesa via formulário`);
        formDespesa.reset();
        await carregarDespesas();
        showToast('Despesa adicionada com sucesso!', 'success');
      } catch (erro) {
        console.error('Erro ao enviar despesa:', erro);
        showToast('Erro ao adicionar despesa. Veja o console para detalhes.', 'error', erro.message || '');
      } finally {
        setButtonLoading(btn, false);
      }
    });
  }

  if (formReceita) {
    formReceita.addEventListener("submit", async (e) => {
      e.preventDefault();
      const formData = new FormData(formReceita);

      const btn = formReceita.querySelector('button[type=submit]');
      try {
        setButtonLoading(btn, true, 'Enviando...');
        const response = await fetch('/gestao/receita/nova', {
          method: 'POST',
          body: formData,
          credentials: 'same-origin'
        });

        if (!response.ok) throw new Error('Erro ao salvar receita');

        if (window.registrarLog) window.registrarLog(`Adicionou receita via formulário`);
        formReceita.reset();
        await carregarReceitas();
        showToast('Receita adicionada com sucesso!', 'success');
      } catch (erro) {
        console.error('Erro ao enviar receita:', erro);
        showToast('Erro ao adicionar receita. Veja o console para detalhes.', 'error', erro.message || '');
      } finally {
        setButtonLoading(btn, false);
      }
    });
  }

  if (inputBuscaReceita) inputBuscaReceita.addEventListener("input", atualizarTabelaReceitas);
  if (inputBuscaDespesa) inputBuscaDespesa.addEventListener("input", atualizarTabelaDespesas);

  function atualizarTabelaDespesas() {
    if (!tabelaDespesaBody) return;

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    despesas.forEach(despesa => {
      if (despesa.status === 'A Pagar' && despesa.data_vencimento) {
        const partes = despesa.data_vencimento.split('-');
        const vencimento = new Date(partes[0], partes[1] - 1, partes[2]);
        if (vencimento < hoje) despesa.status = 'Atrasado';
      }
    });

    tabelaDespesaBody.innerHTML = "";
    let totalFiltrado = 0;
    const termo = inputBuscaDespesa ? inputBuscaDespesa.value.toLowerCase() : "";

    despesas.forEach((despesa, index) => {
      const textoNome = despesa.nome.toLowerCase();
      if (termo === "" || textoNome.includes(termo)) {
        totalFiltrado += parseFloat(despesa.valor_total || 0);
        const linha = document.createElement("tr");
        if (despesa.status === 'Atrasado') linha.classList.add('atrasado');

        const selectAPagar = (despesa.status === 'A Pagar') ? 'selected' : '';
        const selectPago = (despesa.status === 'Pago') ? 'selected' : '';
        const selectAtrasado = (despesa.status === 'Atrasado') ? 'selected' : '';

        // NOVO: Coluna de Obs incluída
        linha.innerHTML = `
            <td>${despesa.nome}</td>
            <td>${despesa.data_emissao}</td>
            <td>${despesa.data_vencimento}</td>
            <td>
              <select class="status-select-despesa" data-index="${index}" data-id="${despesa.id_financas}">
                <option value="A Pagar" ${selectAPagar}>A Pagar</option>
                <option value="Pago" ${selectPago}>Pago</option>
                <option value="Atrasado" ${selectAtrasado}>Atrasado</option>
              </select>
            </td>
            <td style="color: var(--cor-texto-secundario); font-size: 14px;">${despesa.obs || "-"}</td>
            <td>R$ ${parseFloat(despesa.valor_total || 0).toFixed(2)}</td>
            <td>
              <button class="botao-acao apagar-despesa" data-id="${despesa.id_financas}" data-index="${index}"><i class="ph-fill ph-trash"></i></button>
            </td>
          `;
        tabelaDespesaBody.appendChild(linha);
      }
    });

    if (totalDespesaEl) totalDespesaEl.textContent = `R$ ${totalFiltrado.toFixed(2)}`;

    // Verifica alerta de atraso após atualizar status
    atualizarAlertaAtrasos();
  }

  function atualizarTabelaReceitas() {
    if (!tabelaReceitaBody) return;
    tabelaReceitaBody.innerHTML = "";

    let totalFiltrado = 0;
    let totalGeral = 0;
    const termo = inputBuscaReceita ? inputBuscaReceita.value.toLowerCase() : "";

    receitas.forEach((receita, index) => {
      totalGeral += parseFloat(receita.valor_total || 0);
      const textoOrigem = receita.nome.toLowerCase();
      const textoCliente = (receita.cliente_ass || "").toLowerCase();

      if (termo === "" || textoOrigem.includes(termo) || textoCliente.includes(termo)) {
        totalFiltrado += parseFloat(receita.valor_total || 0);
        const linha = document.createElement("tr");

        // NOVO: Coluna de Obs incluída
        linha.innerHTML = `
            <td>${receita.nome}</td>
            <td>${receita.cliente_ass || "-"}</td>
            <td>${receita.data_emissao}</td>
            <td>${receita.data_vencimento}</td>
            <td style="color: var(--cor-texto-secundario); font-size: 14px;">${receita.obs || "-"}</td>
            <td>R$ ${parseFloat(receita.valor_total || 0).toFixed(2)}</td>
            <td>
              <button class="botao-acao apagar-receita" data-id="${receita.id_financas}" data-index="${index}"><i class="ph-fill ph-trash"></i></button>
            </td>
          `;
        tabelaReceitaBody.appendChild(linha);
      }
    });

    if (totalReceitaEl) totalReceitaEl.textContent = `R$ ${totalFiltrado.toFixed(2)}`;
    if (faturamentoDashboard) faturamentoDashboard.textContent = `R$ ${totalFiltrado.toFixed(2)}`;
  }

  if (tabelaDespesaBody) {
    tabelaDespesaBody.addEventListener("change", (e) => {
      if (e.target.classList.contains("status-select-despesa")) {
        const index = parseInt(e.target.dataset.index, 10);
        const novoStatus = e.target.value;
        if (despesas[index]) despesas[index].status = novoStatus;
        const linha = e.target.closest('tr');
        if (novoStatus === 'atrasado') linha.classList.add('atrasado');
        else linha.classList.remove('atrasado');
        if (window.registrarLog) window.registrarLog(`Alterou status da despesa "${despesas[index].nome}" para ${novoStatus}`);

        atualizarAlertaAtrasos(); // Atualiza alerta ao mudar status manualmente
      }
    });
    tabelaDespesaBody.addEventListener("click", async (e) => {
      const btn = e.target.closest(".apagar-despesa");
      if (btn) {
        if (confirm("Deseja apagar esta despesa?")) {
          const finId = btn.dataset.id || parseInt(btn.dataset.index, 10);
          try {
            const response = await fetch(`/api/financas/${finId}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Erro ao deletar despesa');
            if (window.registrarLog) window.registrarLog(`Removeu despesa`);
            showToast('Despesa removida.', 'success');
            carregarDespesas();
          } catch (erro) {
            console.error('Erro ao deletar despesa:', erro);
            showToast('Erro ao deletar despesa', 'error', erro.message || '');
          }
        }
      }
    });
  }

  if (tabelaReceitaBody) {
    tabelaReceitaBody.addEventListener("click", async (e) => {
      const btn = e.target.closest(".apagar-receita");
      if (btn) {
        if (confirm("Deseja apagar esta receita?")) {
          const finId = btn.dataset.id || parseInt(btn.dataset.index, 10);
          try {
            const response = await fetch(`/api/financas/${finId}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Erro ao deletar receita');
            if (window.registrarLog) window.registrarLog(`Removeu receita`);
            showToast('Receita removida.', 'success');
            carregarReceitas();
          } catch (erro) {
            console.error('Erro ao deletar receita:', erro);
            showToast('Erro ao deletar receita', 'error', erro.message || '');
          }
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
        <td><img src="${prod.fotoURL}" alt="${prod.nome}" class="img-produto-tabela"></td>
        <td>${prod.codigo}</td>
        <td>
          <strong>${prod.nome}</strong><br>
          <small style="color: var(--cor-texto-secundario);">${prod.descricao.substring(0, 30)}...</small>
        </td>
        <td>${prod.tamanho}</td>
        <td>R$ ${prod.preco.toFixed(2)}</td>
        <td>
          <select class="status-select-produto ${classeStatus}" data-index="${index}" 
                  style="background-color: transparent; border: 1px solid var(--cor-borda); padding: 5px; border-radius: 4px; font-family: inherit;">
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
            <a href="${item.link}" target="_blank" style="color: var(--cor-acento-secundario); font-size: 14px; text-decoration: none;">
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
        showToast("Item atualizado com sucesso!", "success");
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
  // 8. LÓGICA DA SUB-ABA HOME
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
        itemDiv.style.cssText = "display:flex; align-items:center; justify-content:space-between; background:var(--cor-fundo-principal); padding:8px; border-radius:6px; margin-top:8px; border:1px solid var(--cor-borda);";
        itemDiv.innerHTML = `
                <div style="display:flex; align-items:center; gap:8px; overflow: hidden;">
                    <img src="${item.fotoURL}" style="width: 30px; height: 30px; border-radius: 4px; object-fit: cover; flex-shrink: 0;">
                    <div style="display:flex; flex-direction:column; overflow: hidden;">
                        <span style="font-size: 13px; font-weight: 600; white-space: nowrap; text-overflow: ellipsis; overflow: hidden;">${item.titulo}</span>
                        ${item.descricao ? `<span style="font-size: 10px; color: var(--cor-texto-secundario);">${item.descricao.substring(0, 15)}...</span>` : ''}
                    </div>
                </div>
                <div style="display:flex; gap: 5px; flex-shrink: 0;">
                    <button class="editar-home" data-cat="${categoria}" data-index="${index}" style="border:none; background:none; color:var(--cor-acento-secundario); cursor:pointer;"><i class="ph-bold ph-pencil-simple"></i></button>
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
      const btnSalvar = target.closest(".btn-salvar-home");
      if (btnSalvar) {
        const cartao = btnSalvar.closest(".cartao");
        const categoria = cartao.dataset.categoria;
        const inputTitulo = cartao.querySelector(".home-input-titulo");
        const inputFile = cartao.querySelector(".home-input-file");
        const inputDesc = cartao.querySelector(".home-input-desc");
        const inputIndex = cartao.querySelector(".home-edit-index");

        if (!inputTitulo || inputTitulo.value.trim() === "") { showToast("O título/nome é obrigatório.", "error"); return; }
        const titulo = inputTitulo.value;
        const descricao = inputDesc ? inputDesc.value : "";
        const file = inputFile.files[0];
        const indexEdicao = inputIndex.value;
        let urlFinal = "https://via.placeholder.com/50?text=IMG";

        if (indexEdicao !== "") {
          const itemAtual = homeData[categoria][parseInt(indexEdicao)];
          if (file) urlFinal = URL.createObjectURL(file);
          else urlFinal = itemAtual.fotoURL;
          homeData[categoria][parseInt(indexEdicao)] = { titulo, descricao, fotoURL: urlFinal };
          registrarLog(`Editou item na Home (${categoria}): ${titulo}`);
          btnSalvar.querySelector("span").textContent = "Adicionar";
          inputIndex.value = "";
          showToast("Atualizado com sucesso!", "success");
        } else {
          if (file) urlFinal = URL.createObjectURL(file);
          homeData[categoria].push({ titulo, descricao, fotoURL: urlFinal });
          registrarLog(`Adicionou à Home (${categoria}): ${titulo}`);
        }
        inputTitulo.value = "";
        if (inputDesc) inputDesc.value = "";
        inputFile.value = "";
        renderizarHomeWidgets();
      }

      const btnEditar = target.closest(".editar-home");
      if (btnEditar) {
        const categoria = btnEditar.dataset.cat;
        const index = btnEditar.dataset.index;
        const item = homeData[categoria][index];
        const cartao = gridHome.querySelector(`.cartao[data-categoria="${categoria}"]`);
        cartao.querySelector(".home-input-titulo").value = item.titulo;
        if (cartao.querySelector(".home-input-desc")) cartao.querySelector(".home-input-desc").value = item.descricao || "";
        cartao.querySelector(".home-edit-index").value = index;
        cartao.querySelector(".btn-salvar-home span").textContent = "Salvar Alteração";
        cartao.querySelector(".home-input-titulo").focus();
      }

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
  // 10. LÓGICA DO WIDGET "EVENTOS DE HOJE" (Visão Geral)
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
        <div style="text-align: center; padding: 20px 0; color: var(--cor-texto-secundario);">
           <i class="ph-fill ph-calendar-slash" style="font-size: 32px; margin-bottom: 8px; display: block; opacity: 0.5;"></i>
           Nenhum agendamento para hoje.
        </div>
      `;
    } else {
      eventosDoDia.forEach(evento => {
        let corTipo = "var(--cor-acento-secundario)";
        let nomeTipo = evento.tipo || "Geral";

        if (nomeTipo === 'gravacao') nomeTipo = 'Gravação';
        if (nomeTipo === 'mixagem') nomeTipo = 'Mixagem';
        if (nomeTipo === 'reuniao') { nomeTipo = 'Reunião'; corTipo = "#d98236"; }

        const item = document.createElement("div");
        item.style.cssText = `
            background-color: var(--cor-fundo-principal); 
            border: 1px solid var(--cor-borda); 
            border-left: 4px solid ${corTipo};
            padding: 12px; 
            border-radius: 6px; 
            display: flex; 
            justify-content: space-between; 
            align-items: center;
        `;
        item.innerHTML = `
            <div>
                <strong style="display: block; font-size: 15px;">${evento.titulo}</strong>
                <span style="font-size: 12px; color: var(--cor-texto-secundario);">${evento.obs ? evento.obs : 'Sem observações'}</span>
            </div>
            <span style="font-size: 11px; text-transform: uppercase; font-weight: 700; background: #333; padding: 4px 8px; border-radius: 4px;">
                ${nomeTipo}
            </span>
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

  // Elementos do Modal de Edição
  const modalEditarCliente = document.getElementById("modal-editar-cliente");
  const btnFecharModalCliente = document.getElementById("modal-fechar-editar-cliente");
  const formEditarCliente = document.getElementById("form-editar-cliente");

  // Containers de campos específicos
  const divCamposPF = document.getElementById("campos-edit-pf");
  const divCamposPJ = document.getElementById("campos-edit-pj");

  // Inputs do Modal
  const inputEditIndex = document.getElementById("edit-cliente-index");
  const inputEditTipo = document.getElementById("edit-cliente-tipo-atual");
  // PF
  const inputEditNome = document.getElementById("edit-cliente-nome");
  const inputEditCPF = document.getElementById("edit-cliente-cpf");
  const inputEditNascimento = document.getElementById("edit-cliente-nascimento");
  // PJ
  const inputEditRazao = document.getElementById("edit-cliente-razao");
  const inputEditCNPJ = document.getElementById("edit-cliente-cnpj");
  // Comuns
  const inputEditEmail = document.getElementById("edit-cliente-email");
  const inputEditTelefone = document.getElementById("edit-cliente-telefone");
  const inputEditCEP = document.getElementById("edit-cliente-cep");
  const inputEditLogradouro = document.getElementById("edit-cliente-logradouro");
  const inputEditNumero = document.getElementById("edit-cliente-numero");
  const inputEditBairro = document.getElementById("edit-cliente-bairro");
  const inputEditCidade = document.getElementById("edit-cliente-cidade");
  const inputEditUF = document.getElementById("edit-cliente-uf");
  const inputEditSenha = document.getElementById("edit-cliente-senha");

  // Lista de clientes carregada do banco de dados
  let listaClientes = [];

  // Carregar clientes do banco de dados
  async function carregarClientes() {
    try {
      const response = await fetch('/api/clientes');
      if (!response.ok) throw new Error('Erro ao carregar clientes');
      const dados = await response.json();
      listaClientes = dados.map(cli => ({
        id: cli.id,
        tipo: cli.tipo,
        nome: cli.nome || cli.razao_social,
        razao: cli.razao_social,
        email: cli.email,
        telefone: cli.tel_cel,
        cep: cli.cep,
        logradouro: cli.logradouro,
        numero: cli.numero,
        bairro: cli.bairro,
        cidade: cli.cidade,
        uf: cli.estado,
        cpf: cli.cpf,
        cnpj: cli.cnpj,
        ...cli
      }));
      atualizarTabelaClientes();
    } catch (erro) {
      console.error('Erro ao carregar clientes:', erro);
    }
  }

  function atualizarTabelaClientes() {
    if (!tabelaClientesBody) return;
    tabelaClientesBody.innerHTML = "";
    const termo = inputBuscaCliente ? inputBuscaCliente.value.toLowerCase() : "";

    listaClientes.forEach((cliente, index) => {
      // Define nome e documento baseado no tipo para exibição na tabela
      const displayNome = cliente.tipo === "PF" ? cliente.nome : (cliente.nome || cliente.razao_social);
      const displayDoc = cliente.tipo === "PF" ? cliente.cpf : cliente.cnpj;

      const textoNome = displayNome.toLowerCase();
      const textoEmail = (cliente.email || "").toLowerCase();
      const textoDoc = (displayDoc || "").replace(/\D/g, '');

      if (termo === "" || textoNome.includes(termo) || textoEmail.includes(termo) || textoDoc.includes(termo)) {
        const linha = document.createElement("tr");
        const corBadge = cliente.tipo === 'PJ' ? '#d98236' : 'var(--cor-acento-secundario)';

        linha.innerHTML = `
            <td>
                <strong>${displayNome}</strong><br>
                <small style="color: var(--cor-texto-secundario); font-size: 12px;">${displayDoc}</small>
            </td>
            <td>${cliente.email}</td>
            <td>${cliente.tel_cel || cliente.telefone}</td>
            <td>
                <span style="background: ${corBadge}; color: #111; padding: 2px 8px; border-radius: 4px; font-weight: 600; font-size: 12px;">
                    ${cliente.tipo}
                </span>
            </td>
            <td>
              <button class="botao-acao editar-cliente" data-id="${cliente.id}" data-index="${index}" title="Editar Cliente">
                <i class="ph-fill ph-pencil-simple"></i>
              </button>
              <button class="botao-acao apagar-cliente" data-id="${cliente.id}" data-index="${index}" title="Remover Cliente" style="margin-left: 8px;">
                <i class="ph-fill ph-trash"></i>
              </button>
            </td>
          `;
        tabelaClientesBody.appendChild(linha);
      }
    });
  }

  // Função para abrir o modal e preencher dados
  function abrirModalEditarCliente(index) {
    const cliente = listaClientes[index];

    // Reseta display
    divCamposPF.style.display = "none";
    divCamposPJ.style.display = "none";

    // Preenche dados comuns
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

    // Lógica condicional PF vs PJ
    if (cliente.tipo === "PF") {
      divCamposPF.style.display = "block";
      inputEditNome.value = cliente.nome;
      inputEditCPF.value = cliente.cpf;
      inputEditNascimento.value = cliente.nascimento || "";

      // Remove obrigatoriedade de campos PJ
      inputEditRazao.required = false;
      inputEditCNPJ.required = false;
      // Adiciona obrigatoriedade PF (opcional, conforme sua regra de negócio)
      inputEditNome.required = true;
    } else {
      divCamposPJ.style.display = "block";
      inputEditRazao.value = cliente.razao;
      inputEditCNPJ.value = cliente.cnpj;

      // Remove obrigatoriedade de campos PF
      inputEditNome.required = false;
      inputEditCPF.required = false;
      // Adiciona obrigatoriedade PJ
      inputEditRazao.required = true;
    }

    modalEditarCliente.style.display = "flex";
  }

  // Evento de Submit do Formulário de Edição
  if (formEditarCliente) {
    formEditarCliente.addEventListener("submit", async (e) => {
      e.preventDefault();

      const index = inputEditIndex.value;
      const tipo = inputEditTipo.value;
      const cliId = listaClientes[index].id;

      // Objeto base atualizado
      const clienteAtualizado = {
        tipo: tipo,
        email: inputEditEmail.value,
        telefone: inputEditTelefone.value,
        cep: inputEditCEP.value,
        logradouro: inputEditLogradouro.value,
        numero: inputEditNumero.value,
        bairro: inputEditBairro.value,
        cidade: inputEditCidade.value,
        uf: inputEditUF.value
      };

      if (tipo === "PF") {
        clienteAtualizado.nome = inputEditNome.value;
        clienteAtualizado.cpf = inputEditCPF.value;
        clienteAtualizado.nascimento = inputEditNascimento.value;
      } else {
        clienteAtualizado.razao = inputEditRazao.value;
        clienteAtualizado.cnpj = inputEditCNPJ.value;
      }

      // Envia para o servidor via AJAX
      try {
        const response = await fetch(`/api/clientes/${cliId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(clienteAtualizado)
        });

        if (!response.ok) throw new Error('Erro ao atualizar cliente');

        if (window.registrarLog) window.registrarLog(`Cliente editado: ${tipo === 'PF' ? clienteAtualizado.nome : clienteAtualizado.razao}`);

        carregarClientes();
        modalEditarCliente.style.display = "none";
        showToast("Dados do cliente atualizados com sucesso!", "success");
      } catch (erro) {
        console.error('Erro ao atualizar cliente:', erro);
        showToast('Erro ao atualizar cliente', 'error', erro.message || '');
      }
    });
  }

  // Eventos de Fechar Modal
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

  // Eventos na Tabela (Editar e Excluir)
  if (tabelaClientesBody) {
    tabelaClientesBody.addEventListener("click", async (e) => {
      // Botão Editar
      const btnEditar = e.target.closest(".editar-cliente");
      if (btnEditar) {
        const index = parseInt(btnEditar.dataset.index);
        abrirModalEditarCliente(index);
      }

      // Botão Excluir
      const btnApagar = e.target.closest(".apagar-cliente");
      if (btnApagar) {
        if (confirm("Deseja remover este cliente da base?")) {
          const index = parseInt(btnApagar.dataset.index);
          const cliente = listaClientes[index];
          const nomeRemovido = cliente.tipo === 'PF' ? cliente.nome : cliente.razao;
          const cliId = cliente.id;

          try {
            const response = await fetch(`/api/clientes/${cliId}`, {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ tipo: cliente.tipo })
            });
            if (!response.ok) throw new Error('Erro ao deletar cliente');
            if (window.registrarLog) window.registrarLog(`Cliente removido: ${nomeRemovido}`);
            showToast('Cliente removido.', 'success');
            carregarClientes();
          } catch (erro) {
            console.error('Erro ao deletar cliente:', erro);
            showToast('Erro ao deletar cliente', 'error', erro.message || '');
          }
        }
      }
    });
  }

  if (inputBuscaCliente) inputBuscaCliente.addEventListener("input", atualizarTabelaClientes);

  // Inicializa tabela
  atualizarTabelaClientes();

  // =================================================================
  // 13. LÓGICA DE NOVO CLIENTE (MODAL)
  // =================================================================
  const modalNovoCliente = document.getElementById("modal-novo-cliente");
  const botaoAbrirModalCliente = document.getElementById("botao-novo-cliente");
  const botaoFecharModalCliente = document.getElementById("modal-fechar-cliente");
  const formNovoCliente = document.getElementById("form-novo-cliente");
  const btnSalvarCliente = document.getElementById("btn-salvar-cliente");

  // Função para alternar campos PF/PJ
  window.toggleCamposCliente = function () {
    const tipoPF = document.getElementById("tipo-pf-modal");
    const tipoPJ = document.getElementById("tipo-pj-modal");
    const camposPF = document.getElementById("campos-pf-modal");
    const camposPJ = document.getElementById("campos-pj-modal");

    if (!tipoPF || !camposPF) return;

    if (tipoPF.checked) {
      camposPF.style.display = "block";
      if (camposPJ) camposPJ.style.display = "none";
      const nome = document.getElementById("cliente-nome");
      const cpf = document.getElementById("cliente-cpf");
      const nasc = document.getElementById("cliente-nascimento");
      const razao = document.getElementById("cliente-razao-social");
      const cnpj = document.getElementById("cliente-cnpj");
      if (nome) nome.required = true;
      if (cpf) cpf.required = true;
      if (nasc) nasc.required = true;
      if (razao) razao.required = false;
      if (cnpj) cnpj.required = false;
    } else {
      if (camposPF) camposPF.style.display = "none";
      if (camposPJ) camposPJ.style.display = "block";
      const nome = document.getElementById("cliente-nome");
      const cpf = document.getElementById("cliente-cpf");
      const nasc = document.getElementById("cliente-nascimento");
      const razao = document.getElementById("cliente-razao-social");
      const cnpj = document.getElementById("cliente-cnpj");
      if (nome) nome.required = false;
      if (cpf) cpf.required = false;
      if (nasc) nasc.required = false;
      if (razao) razao.required = true;
      if (cnpj) cnpj.required = true;
    }
  };

  const abrirModalNovoCliente = () => {
    if (formNovoCliente) formNovoCliente.reset();
    document.getElementById("tipo-pf-modal").checked = true;
    toggleCamposCliente();
    if (modalNovoCliente) modalNovoCliente.style.display = "flex";
  };

  const fecharModalNovoCliente = () => {
    if (modalNovoCliente) modalNovoCliente.style.display = "none";
    if (formNovoCliente) formNovoCliente.reset();
  };

  if (botaoAbrirModalCliente) botaoAbrirModalCliente.addEventListener("click", abrirModalNovoCliente);
  if (botaoFecharModalCliente) botaoFecharModalCliente.addEventListener("click", fecharModalNovoCliente);

  if (modalNovoCliente) {
    modalNovoCliente.addEventListener("click", (e) => {
      if (e.target === modalNovoCliente) fecharModalNovoCliente();
    });
  }

  // Formatação de CPF
  const inputCpfCliente = document.getElementById("cliente-cpf");
  if (inputCpfCliente) {
    inputCpfCliente.addEventListener('input', (e) => {
      let value = e.target.value.replace(/\D/g, '');
      value = value.substring(0, 11);
      let formattedValue = value;
      if (value.length > 9) formattedValue = value.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
      else if (value.length > 6) formattedValue = value.replace(/^(\d{3})(\d{3})(\d{3})/, '$1.$2.$3');
      else if (value.length > 3) formattedValue = value.replace(/^(\d{3})(\d{3})/, '$1.$2');
      e.target.value = formattedValue;
    });
  }

  // Formatação de CNPJ
  const inputCnpjCliente = document.getElementById("cliente-cnpj");
  if (inputCnpjCliente) {
    inputCnpjCliente.addEventListener('input', (e) => {
      let value = e.target.value.replace(/\D/g, '');
      value = value.substring(0, 14);
      let formattedValue = value;
      if (value.length > 12) formattedValue = value.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
      else if (value.length > 8) formattedValue = value.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})/, '$1.$2.$3/$4');
      else if (value.length > 5) formattedValue = value.replace(/^(\d{2})(\d{3})(\d{3})/, '$1.$2.$3');
      else if (value.length > 2) formattedValue = value.replace(/^(\d{2})(\d{3})/, '$1.$2');
      e.target.value = formattedValue;
    });
  }

  // Formatação de CEP
  const inputCepCliente = document.getElementById("cliente-cep");
  if (inputCepCliente) {
    inputCepCliente.addEventListener('input', (e) => {
      let value = e.target.value.replace(/\D/g, '');
      value = value.substring(0, 8);
      if (value.length > 5) value = value.replace(/^(\d{5})(\d{3})/, '$1-$2');
      e.target.value = value;
    });
  }

  // Formatação de Telefone
  const inputTelCliente = document.getElementById("cliente-telefone");
  if (inputTelCliente) {
    inputTelCliente.addEventListener('input', (e) => {
      let value = e.target.value.replace(/\D/g, '');
      value = value.substring(0, 11);
      let formattedValue = value;
      if (value.length > 10) formattedValue = value.replace(/^(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
      else if (value.length > 6) formattedValue = value.replace(/^(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
      else if (value.length > 2) formattedValue = value.replace(/^(\d{2})(\d{0,4})/, '($1) $2');
      e.target.value = formattedValue;
    });
  }

  // Submit do formulário
  if (formNovoCliente) {
    formNovoCliente.addEventListener("submit", async (e) => {
      e.preventDefault();

      const formData = new FormData(formNovoCliente);

      try {
        setButtonLoading(btnSalvarCliente, true, 'Salvando...');
        const response = await fetch('/gestao/cliente/salvar', {
          method: 'POST',
          body: formData,
          credentials: 'same-origin'
        });

        if (!response.ok) throw new Error('Erro ao salvar cliente');

        if (window.registrarLog) {
          const tipo = formData.get('tipo-pessoa') === 'pf' ? 'PF' : 'PJ';
          const nome = formData.get('tipo-pessoa') === 'pf' ? formData.get('nome') : formData.get('razao_social');
          window.registrarLog(`Cliente cadastrado (${tipo}): ${nome}`);
        }

        showToast('Cliente cadastrado com sucesso!', 'success');
        fecharModalNovoCliente();
        await carregarClientes();
      } catch (erro) {
        console.error('Erro ao salvar cliente:', erro);
        showToast('Erro ao cadastrar cliente.', 'error', erro.message || '');
      } finally {
        setButtonLoading(btnSalvarCliente, false);
      }
    });
  }

  // --- INICIALIZAÇÕES FINAIS ---
  renderizarLogs();

  // Carregar dados do banco de dados
  carregarFuncionarios();
  carregarReceitas();
  carregarDespesas();
  carregarAgendamentos();
  carregarClientes();

  renderizarGaleria();
  renderizarHomeWidgets();
  atualizarWidgetEventosHoje(); // Widget Visão Geral
});
