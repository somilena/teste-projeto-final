document.addEventListener("DOMContentLoaded", () => {
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

      // --- LÓGICAS ESPECÍFICAS POR ABA ---

      // 1. Se for Agendamentos: Reseta o calendário para o mês atual
      if (paginaAlvoID === "agendamentos") {
        dataExibida = new Date();
        dataSelecionada = null;
        renderizarCalendario();
      }

      // 2. NOVO: Se for Editar Site: Força o clique na sub-aba "Home"
      if (paginaAlvoID === "editar-site") {
        const btnSubHome = document.querySelector('.botao-sub-aba[data-alvo="sub-home"]');
        if (btnSubHome) {
          btnSubHome.click(); // Simula o clique para resetar a visualização
        }
      }
    });
  });

  // =================================================================
  // 2. SISTEMA DE LOGS (GLOBAL)
  // =================================================================
  const tabelaLogsBody = document.querySelector("#tabela-logs tbody");

  // Simulação de banco de dados de logs
  let logsSistema = [
    { data: new Date().toLocaleString(), usuario: "Admin", acao: "Sistema iniciado." }
  ];

  // Função Global para registrar ações
  window.registrarLog = function (descricaoAcao, usuario = "Admin") {
    const dataAtual = new Date().toLocaleString();

    // Adiciona no início do array (mais recente primeiro)
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

  // Função para limpar logs
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
  let agendamentos = [
    {
      data: new Date(2025, 9, 25),
      titulo: "Gravação 'Podcast X'",
      tipo: "gravacao",
      obs: "Trazer equipamentos extras."
    }
  ];

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
  // 4. LÓGICA DE FUNCIONÁRIOS
  // =================================================================
  const modalFuncionario = document.getElementById("modal-novo-funcionario");
  const botaoAbrirModalFuncionario = document.getElementById("botao-novo-funcionario");
  const botaoFecharModalFuncionario = document.getElementById("modal-fechar-funcionario");
  const formFuncionario = document.getElementById("form-novo-funcionario");
  const secaoFuncionarios = document.getElementById("secao-funcionarios");
  const containerBlocosFuncionarios = document.getElementById("container-blocos-funcionarios");

  const modalDetalhesFuncionario = document.getElementById("modal-detalhes-funcionario");
  const botaoFecharModalDetalhes = document.getElementById("modal-fechar-detalhes-funcionario");
  const spanNomeDetalhes = document.getElementById("modal-detalhes-nome");
  const spanEmailDetalhes = document.getElementById("modal-detalhes-email");
  const spanCargoDetalhes = document.getElementById("modal-detalhes-cargo");
  const spanTelefoneDetalhes = document.getElementById("modal-detalhes-telefone");

  let funcionarios = [];

  const abrirModalFuncionario = () => { modalFuncionario.style.display = "flex"; };
  const fecharModalFuncionario = () => {
    modalFuncionario.style.display = "none";
    formFuncionario.reset();
  };
  const fecharModalDetalhesFuncionario = () => { modalDetalhesFuncionario.style.display = "none"; };

  if (botaoAbrirModalFuncionario) botaoAbrirModalFuncionario.addEventListener("click", abrirModalFuncionario);
  if (botaoFecharModalFuncionario) botaoFecharModalFuncionario.addEventListener("click", fecharModalFuncionario);
  if (modalFuncionario) modalFuncionario.addEventListener("click", (e) => { if (e.target === modalFuncionario) fecharModalFuncionario(); });

  if (botaoFecharModalDetalhes) botaoFecharModalDetalhes.addEventListener("click", fecharModalDetalhesFuncionario);
  if (modalDetalhesFuncionario) modalDetalhesFuncionario.addEventListener("click", (e) => { if (e.target === modalDetalhesFuncionario) fecharModalDetalhesFuncionario(); });

  if (formFuncionario) {
    formFuncionario.addEventListener("submit", (e) => {
      e.preventDefault();
      const nome = document.getElementById("funcionario-nome").value;
      const email = document.getElementById("funcionario-email").value;
      const senha = document.getElementById("funcionario-senha").value;
      const confirmarSenha = document.getElementById("funcionario-confirmar-senha").value;
      const cargo = document.getElementById("funcionario-cargo").value;
      const telefone = document.getElementById("funcionario-telefone").value;

      if (senha !== confirmarSenha) {
        alert("As senhas não coincidem.");
        return;
      }
      funcionarios.push({ nome, email, cargo, telefone });
      atualizarTabelaFuncionarios();
      fecharModalFuncionario();
    });
  }

  function atualizarTabelaFuncionarios() {
    if (!containerBlocosFuncionarios) return;
    containerBlocosFuncionarios.innerHTML = "";

    if (funcionarios.length === 0) {
      containerBlocosFuncionarios.innerHTML = `<p class="placeholder-blocos">Nenhum funcionário cadastrado.</p>`;
    } else {
      funcionarios.forEach((func, index) => {
        const blocoHTML = `
          <div class="bloco-funcionario" data-index="${index}">
            <button class="botao-acao apagar-funcionario" data-index="${index}" title="Apagar funcionário">
              <i class="ph-fill ph-trash"></i>
            </button>
            <h3>${func.nome}</h3>
            <p class="email-funcionario">${func.email}</p>
            <span class="cargo-funcionario">${func.cargo}</span>
          </div>
        `;
        containerBlocosFuncionarios.insertAdjacentHTML('beforeend', blocoHTML);
      });
    }
  }

  if (secaoFuncionarios) {
    secaoFuncionarios.addEventListener("click", (e) => {
      const btnApagar = e.target.closest(".apagar-funcionario");
      const bloco = e.target.closest(".bloco-funcionario");

      if (btnApagar) {
        e.stopPropagation();
        const index = parseInt(btnApagar.dataset.index, 10);
        if (confirm(`Apagar ${funcionarios[index].nome}?`)) {
          funcionarios.splice(index, 1);
          atualizarTabelaFuncionarios();
        }
      } else if (bloco) {
        const index = parseInt(bloco.dataset.index, 10);
        const func = funcionarios[index];
        if (func) {
          spanNomeDetalhes.textContent = func.nome;
          spanEmailDetalhes.textContent = func.email;
          spanCargoDetalhes.textContent = func.cargo;
          spanTelefoneDetalhes.textContent = func.telefone || "Não informado";
          modalDetalhesFuncionario.style.display = "flex";
        }
      }
    });
  }

 // =================================================================
  // 5. LÓGICA FINANCEIRA (Receitas e Despesas) - COM BUSCA EM AMBOS
  // =================================================================
  
  // --- REFERÊNCIAS DESPESAS ---
  const formDespesa = document.getElementById("form-nova-despesa");
  const tabelaDespesaBody = document.querySelector("#tabela-despesas tbody");
  const totalDespesaEl = document.getElementById("despesa-total");
  const inputBuscaDespesa = document.getElementById("busca-despesa"); // Busca Despesa
  let despesas = [];

  // --- REFERÊNCIAS RECEITAS ---
  const formReceita = document.getElementById("form-nova-receita");
  const tabelaReceitaBody = document.querySelector("#tabela-receitas tbody");
  const totalReceitaEl = document.getElementById("receita-total");
  const faturamentoDashboard = document.getElementById("faturamento-dashboard");
  const inputBuscaReceita = document.getElementById("busca-receita"); // Busca Receita
  let receitas = [];

  // 1. SUBMIT NOVA DESPESA
  if (formDespesa) {
    formDespesa.addEventListener("submit", (e) => {
      e.preventDefault();
      const nome = document.getElementById("despesa-nome").value;
      const dataEmissao = document.getElementById("despesa-data-emissao").value;
      const dataVencimento = document.getElementById("despesa-data-vencimento").value;
      const valor = parseFloat(document.getElementById("despesa-valor").value);
      const status = document.getElementById("despesa-status").value;

      if (!nome || !dataEmissao || isNaN(valor)) return;
      
      despesas.push({ nome, dataEmissao, dataVencimento, valor, status });
      
      if(window.registrarLog) window.registrarLog(`Adicionou despesa: ${nome} - R$ ${valor}`);

      atualizarTabelaDespesas();
      formDespesa.reset();
    });
  }

  // 2. SUBMIT NOVA RECEITA
  if (formReceita) {
    formReceita.addEventListener("submit", (e) => {
      e.preventDefault();
      const origem = document.getElementById("receita-origem").value;
      const cliente = document.getElementById("receita-cliente").value;
      const dataEmissao = document.getElementById("receita-data-emissao").value;
      const dataAgendada = document.getElementById("receita-data-agendada").value;
      const valor = parseFloat(document.getElementById("receita-valor").value);

      if (!origem || !cliente || !dataEmissao || isNaN(valor)) return;
      
      receitas.push({ origem, cliente, dataEmissao, dataAgendada, valor });
      
      if(window.registrarLog) window.registrarLog(`Adicionou receita: ${origem} - R$ ${valor}`);

      atualizarTabelaReceitas();
      formReceita.reset();
    });
  }

  // 3. LISTENERS DE BUSCA (INPUT)
  if (inputBuscaReceita) {
    inputBuscaReceita.addEventListener("input", atualizarTabelaReceitas);
  }
  if (inputBuscaDespesa) {
    inputBuscaDespesa.addEventListener("input", atualizarTabelaDespesas);
  }

  // 4. ATUALIZAR TABELA DESPESAS (COM FILTRO)
  function atualizarTabelaDespesas() {
    if (!tabelaDespesaBody) return;
    
    // Verifica atrasos (lógica de data)
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
    
    // Pega termo de busca
    const termo = inputBuscaDespesa ? inputBuscaDespesa.value.toLowerCase() : "";

    despesas.forEach((despesa, index) => {
      const textoNome = despesa.nome.toLowerCase();

      // Filtra pelo nome
      if (termo === "" || textoNome.includes(termo)) {
          totalFiltrado += despesa.valor;

          const linha = document.createElement("tr");
          if(despesa.status === 'atrasado') linha.classList.add('atrasado');

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
            <td>R$ ${despesa.valor.toFixed(2)}</td>
            <td>
              <button class="botao-acao apagar-despesa" data-index="${index}"><i class="ph-fill ph-trash"></i></button>
            </td>
          `;
          tabelaDespesaBody.appendChild(linha);
      }
    });
    
    // Total mostra a soma dos itens visíveis na busca
    if (totalDespesaEl) totalDespesaEl.textContent = `R$ ${totalFiltrado.toFixed(2)}`;
  }

  // 5. ATUALIZAR TABELA RECEITAS (COM FILTRO)
  function atualizarTabelaReceitas() {
    if (!tabelaReceitaBody) return;
    tabelaReceitaBody.innerHTML = "";
    
    let totalFiltrado = 0;
    let totalGeral = 0;
    
    const termo = inputBuscaReceita ? inputBuscaReceita.value.toLowerCase() : "";

    receitas.forEach((receita, index) => {
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

  // 6. EVENTOS DE TABELA (DELEGAÇÃO)
  if (tabelaDespesaBody) {
    // Mudar Status
    tabelaDespesaBody.addEventListener("change", (e) => {
      if (e.target.classList.contains("status-select-despesa")) {
        const index = parseInt(e.target.dataset.index, 10);
        const novoStatus = e.target.value;
        if (despesas[index]) despesas[index].status = novoStatus;
        
        const linha = e.target.closest('tr');
        if(novoStatus === 'atrasado') linha.classList.add('atrasado');
        else linha.classList.remove('atrasado');
        
        if(window.registrarLog) window.registrarLog(`Alterou status da despesa "${despesas[index].nome}" para ${novoStatus}`);
      }
    });

    // Apagar Despesa
    tabelaDespesaBody.addEventListener("click", (e) => {
      const btn = e.target.closest(".apagar-despesa");
      if (btn) {
        if(confirm("Deseja apagar esta despesa?")) {
            const index = parseInt(btn.dataset.index, 10);
            if(window.registrarLog) window.registrarLog(`Removeu despesa: ${despesas[index].nome}`);
            despesas.splice(index, 1);
            atualizarTabelaDespesas();
        }
      }
    });
  }

  if (tabelaReceitaBody) {
    // Apagar Receita
    tabelaReceitaBody.addEventListener("click", (e) => {
      const btn = e.target.closest(".apagar-receita");
      if (btn) {
        if(confirm("Deseja apagar esta receita?")) {
            const index = parseInt(btn.dataset.index, 10);
            if(window.registrarLog) window.registrarLog(`Removeu receita: ${receitas[index].origem}`);
            receitas.splice(index, 1);
            atualizarTabelaReceitas();
        }
      }
    });
  }
  // =================================================================
  // 6. LÓGICA DE PRODUTOS (COM LOGS E STATUS EDITÁVEL)
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

      // LOG
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
    // Listener: Mudar Status
    tabelaProdutosBody.addEventListener("change", (e) => {
      if (e.target.classList.contains("status-select-produto")) {
        const index = parseInt(e.target.dataset.index, 10);
        const novoStatus = e.target.value;

        if (produtos[index]) {
          produtos[index].status = novoStatus;
          // LOG
          registrarLog(`Alterou status de "${produtos[index].nome}" para ${novoStatus.toUpperCase()}`);
        }

        e.target.classList.remove('status-disponivel', 'status-indisponivel');
        if (novoStatus === 'disponivel') {
          e.target.classList.add('status-disponivel');
        } else {
          e.target.classList.add('status-indisponivel');
        }
      }
    });

    // Listener: Apagar Produto
    tabelaProdutosBody.addEventListener("click", (e) => {
      const btn = e.target.closest(".apagar-produto");
      if (btn) {
        if (confirm("Deseja remover este produto do site?")) {
          const index = parseInt(btn.dataset.index, 10);
          const nomeProd = produtos[index].nome;
          produtos.splice(index, 1);

          // LOG
          registrarLog(`Removeu produto: ${nomeProd}`);

          atualizarTabelaProdutos();
        }
      }
    });
  }

  // =================================================================
  // 7. LÓGICA DA SUB-ABA GALERIA (CRUD COM LOGS)
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
        // MODO EDIÇÃO
        const itemAtual = galeriaItems[parseInt(indexEdicao)];
        if (file) {
          urlFinal = URL.createObjectURL(file);
        } else {
          urlFinal = itemAtual.fotoURL;
        }
        galeriaItems[indexEdicao] = { titulo, link, fotoURL: urlFinal };

        // LOG
        registrarLog(`Editou item da galeria: ${titulo}`);
        alert("Item atualizado com sucesso!");
      } else {
        // MODO ADIÇÃO
        if (file) {
          urlFinal = URL.createObjectURL(file);
        } else {
          urlFinal = "https://via.placeholder.com/300x200?text=Sem+Imagem";
        }
        galeriaItems.push({ titulo, link, fotoURL: urlFinal });

        // LOG
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

          // LOG
          registrarLog(`Removeu item da galeria: ${tituloItem}`);

          renderizarGaleria();
          if (inputGaleriaIndex.value === index) resetarFormularioGaleria();
        }
      }
    });
  }

  if (btnCancelarGaleria) {
    btnCancelarGaleria.addEventListener("click", resetarFormularioGaleria);
  }

  function resetarFormularioGaleria() {
    formGaleria.reset();
    inputGaleriaIndex.value = "";
    avisoImagem.style.display = "none";
    btnSalvarGaleria.querySelector("span").textContent = "Adicionar Item";
    btnCancelarGaleria.style.display = "none";
  }

  // =================================================================
  // 8. LÓGICA DA SUB-ABA HOME (CRUD COMPLETO POR WIDGET)
  // =================================================================

  // Objeto para armazenar os dados de cada seção da Home
  let homeData = {
    banner: [],
    video: [],
    podcast_destaque: [],
    episodios: [],
    apresentadores: [],
    membros: [],
    depoimentos: [],
    parceiros: []
  };

  const gridHome = document.getElementById("grid-home-widgets");

  // Função para renderizar as mini-listas dentro de cada widget
  function renderizarHomeWidgets() {
    if (!gridHome) return;

    // Para cada chave no objeto de dados
    Object.keys(homeData).forEach(categoria => {
      // Encontra o cartão correspondente no HTML
      const cartao = gridHome.querySelector(`.cartao[data-categoria="${categoria}"]`);
      if (!cartao) return;

      const containerLista = cartao.querySelector(".lista-home-items");
      if (!containerLista) return;

      containerLista.innerHTML = ""; // Limpa lista

      // Renderiza itens
      homeData[categoria].forEach((item, index) => {
        const itemDiv = document.createElement("div");
        // Estilo inline para a lista ficar bonita dentro do card
        itemDiv.style.display = "flex";
        itemDiv.style.alignItems = "center";
        itemDiv.style.justifyContent = "space-between";
        itemDiv.style.background = "var(--cor-fundo-principal)";
        itemDiv.style.padding = "8px";
        itemDiv.style.borderRadius = "6px";
        itemDiv.style.marginTop = "8px";
        itemDiv.style.border = "1px solid var(--cor-borda)";

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

  // Event Delegation para cliques no Grid Home (Adicionar, Editar, Apagar)
  if (gridHome) {
    gridHome.addEventListener("click", (e) => {
      const target = e.target;

      // 1. BOTÃO ADICIONAR / SALVAR
      const btnSalvar = target.closest(".btn-salvar-home");
      if (btnSalvar) {
        const cartao = btnSalvar.closest(".cartao");
        const categoria = cartao.dataset.categoria;

        // Inputs
        const inputTitulo = cartao.querySelector(".home-input-titulo");
        const inputFile = cartao.querySelector(".home-input-file");
        const inputDesc = cartao.querySelector(".home-input-desc"); // Apenas depoimentos tem esse
        const inputIndex = cartao.querySelector(".home-edit-index");

        if (!inputTitulo || inputTitulo.value.trim() === "") {
          alert("O título/nome é obrigatório.");
          return;
        }

        const titulo = inputTitulo.value;
        const descricao = inputDesc ? inputDesc.value : "";
        const file = inputFile.files[0];
        const indexEdicao = inputIndex.value;

        let urlFinal = "https://via.placeholder.com/50?text=IMG";

        // Se for Edição
        if (indexEdicao !== "") {
          const itemAtual = homeData[categoria][parseInt(indexEdicao)];
          if (file) {
            urlFinal = URL.createObjectURL(file);
          } else {
            urlFinal = itemAtual.fotoURL; // Mantém antiga
          }

          homeData[categoria][parseInt(indexEdicao)] = { titulo, descricao, fotoURL: urlFinal };
          registrarLog(`Editou item na Home (${categoria}): ${titulo}`);

          // Reseta botão para modo "Adicionar"
          btnSalvar.querySelector("span").textContent = "Adicionar";
          btnSalvar.classList.remove("modo-edicao"); // Opcional, para estilo
          inputIndex.value = "";
          alert("Atualizado com sucesso!");

        } else {
          // Modo Novo Cadastro
          if (file) {
            urlFinal = URL.createObjectURL(file);
          }

          homeData[categoria].push({ titulo, descricao, fotoURL: urlFinal });
          registrarLog(`Adicionou à Home (${categoria}): ${titulo}`);
        }

        // Limpa campos
        inputTitulo.value = "";
        if (inputDesc) inputDesc.value = "";
        inputFile.value = ""; // Limpa input file

        renderizarHomeWidgets();
      }

      // 2. BOTÃO EDITAR (Lápis na lista)
      const btnEditar = target.closest(".editar-home");
      if (btnEditar) {
        const categoria = btnEditar.dataset.cat;
        const index = btnEditar.dataset.index;
        const item = homeData[categoria][index];
        const cartao = gridHome.querySelector(`.cartao[data-categoria="${categoria}"]`);

        // Popula os campos do cartão
        const inputTitulo = cartao.querySelector(".home-input-titulo");
        const inputDesc = cartao.querySelector(".home-input-desc");
        const inputIndex = cartao.querySelector(".home-edit-index");
        const btnSalvar = cartao.querySelector(".btn-salvar-home");

        inputTitulo.value = item.titulo;
        if (inputDesc) inputDesc.value = item.descricao || "";
        inputIndex.value = index;

        // Muda visualmente o botão para indicar edição
        btnSalvar.querySelector("span").textContent = "Salvar Alteração";

        // Foca no input
        inputTitulo.focus();
      }

      // 3. BOTÃO APAGAR (Lixeira na lista)
      const btnApagar = target.closest(".apagar-home");
      if (btnApagar) {
        if (confirm("Remover este item da Home?")) {
          const categoria = btnApagar.dataset.cat;
          const index = parseInt(btnApagar.dataset.index);

          const nomeItem = homeData[categoria][index].titulo;
          homeData[categoria].splice(index, 1);

          registrarLog(`Removeu da Home (${categoria}): ${nomeItem}`);

          // Se estava editando este item, cancela a edição
          const cartao = gridHome.querySelector(`.cartao[data-categoria="${categoria}"]`);
          const inputIndex = cartao.querySelector(".home-edit-index");
          if (inputIndex.value == index) {
            cartao.querySelector(".btn-salvar-home span").textContent = "Adicionar";
            cartao.querySelector(".home-input-titulo").value = "";
            inputIndex.value = "";
          }

          renderizarHomeWidgets();
        }
      }
    });
  }

  // Inicializa a Home vazia (ou carrega dados se tivesse backend)
  renderizarHomeWidgets();

  // =================================================================
  // 9. NAVEGAÇÃO DE SUB-ABAS (Editar Site)
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

  // Renderizações Iniciais
  renderizarLogs();
  atualizarTabelaFuncionarios();
  atualizarTabelaReceitas();
  atualizarTabelaDespesas();
  renderizarGaleria(); // Galeria Inicia
});