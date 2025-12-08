/* ================================================================= */
/* 1. LÓGICA DE FILTRAGEM (BOTÕES) */
/* ================================================================= */

document.addEventListener("DOMContentLoaded", () => {
  const botoesFiltro = document.querySelectorAll(".filtro-btn");
  const cartoesServico = document.querySelectorAll(".cartao-servico");

  // Verifica se os botões de filtro existem
  if (botoesFiltro.length > 0 && cartoesServico.length > 0) {
    botoesFiltro.forEach((botao) => {
      botao.addEventListener("click", () => {
        const filtro = botao.getAttribute("data-filtro");

        // 1. Atualiza o visual dos botões
        botoesFiltro.forEach((btn) => btn.classList.remove("ativo"));
        botao.classList.add("ativo");

        // 2. Mostra ou esconde os cartões
        cartoesServico.forEach((cartao) => {
          const tipoCartao = cartao.getAttribute("data-tipo");

          if (
            filtro === "todos" ||
            (tipoCartao && tipoCartao.includes(filtro))
          ) {
            cartao.style.display = "flex"; // Mostra o cartão
          } else {
            cartao.style.display = "none"; // Esconde o cartão
          }
        });
      });
    });
  }

  // =================================================================
  // 2. LÓGICA DE AGENDAMENTO E PAGAMENTO (NOVO)
  // =================================================================
  const secaoSelecaoServico = document.querySelector(".secao-selecao-servico");
  const secaoCalendario = document.getElementById("secao-calendario");
  const botaoVoltar = document.getElementById("botao-voltar-servicos");

  const containerHorarios = document.getElementById("container-horarios");
  const containerPagamento = document.getElementById("container-pagamento");

  // Elementos de Resumo
  const resumoServico = document.getElementById("resumo-servico");
  const servicoTituloTopo = document.getElementById(
    "servico-selecionado-titulo"
  );
  const resumoData = document.getElementById("resumo-data");
  const resumoValor = document.getElementById("resumo-valor");

  // Elementos de Pagamento (Novos)
  const tabsPagamento = document.querySelectorAll(".tab-pag");
  const areaCartao = document.getElementById("area-pagamento-cartao");
  const areaPix = document.getElementById("area-pagamento-pix");
  const grupoParcelas = document.getElementById("grupo-parcelas");
  const inputMetodoPagamento = document.getElementById("metodo-pagamento");
  const selectParcelas = document.getElementById("select-parcelas");

  const botoesAgendar = document.querySelectorAll(".botao-agendar");

  let servicoAtivo = null;
  let dataCalendarioAtual = new Date();
  let dataSelecionada = null;

  // AÇÃO: Clicar em "Agendar" no card
  if (botoesAgendar.length > 0) {
    botoesAgendar.forEach((botao) => {
      botao.addEventListener("click", () => {
        servicoAtivo = botao.getAttribute("data-servico");

        // Pega o nome e o preço do card
        const card = botao.closest(".cartao-servico");
        const nomeServico = card.querySelector("h3").textContent;
        const precoTexto = card.querySelector(".preco-servico").textContent;

        // Preenche o resumo inicial
        resumoServico.textContent = nomeServico;
        servicoTituloTopo.textContent = nomeServico;
        resumoValor.textContent = precoTexto; // Ex: "A partir de R$ 350"

        // Esconde Serviços -> Mostra Agendamento
        secaoSelecaoServico.style.display = "none";
        secaoCalendario.style.display = "block";

        // Reseta o estado do agendamento
        containerHorarios.style.display = "none";
        containerPagamento.style.display = "none";
        window.scrollTo({ top: 0, behavior: "smooth" });

        renderizarCalendario(dataCalendarioAtual);
      });
    });
  }

  // AÇÃO: Botão Voltar
  if (botaoVoltar) {
    botaoVoltar.addEventListener("click", () => {
      secaoCalendario.style.display = "none";
      secaoSelecaoServico.style.display = "block";
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  // --- LÓGICA DAS ABAS DE PAGAMENTO (Crédito / Débito / Pix) ---
  if (tabsPagamento.length > 0) {
    tabsPagamento.forEach((tab) => {
      tab.addEventListener("click", () => {
        // Visual dos botões
        tabsPagamento.forEach((t) => t.classList.remove("ativo"));
        tab.classList.add("ativo");

        const metodo = tab.getAttribute("data-metodo");

        // Garante que o inputMetodoPagamento exista antes de setar valor
        if (inputMetodoPagamento) inputMetodoPagamento.value = metodo;

        // Lógica de Exibição
        if (metodo === "credito") {
          areaCartao.style.display = "block";
          areaPix.style.display = "none";
          if (grupoParcelas) grupoParcelas.style.display = "block"; // Mostra parcelas
        } else if (metodo === "debito") {
          areaCartao.style.display = "block"; // Usa o mesmo form de cartão
          areaPix.style.display = "none";
          if (grupoParcelas) grupoParcelas.style.display = "none"; // Esconde parcelas (débito é à vista)
        } else if (metodo === "pix") {
          areaCartao.style.display = "none";
          areaPix.style.display = "block";
        }
      });
    });
  }

  // --- FUNÇÃO PARA CALCULAR PARCELAS ---
  function atualizarOpcoesParcelamento(valorTexto) {
    if (!selectParcelas) return;

    // Limpa o select
    selectParcelas.innerHTML = "";

    // Converte "A partir de R$ 350" para o número 350.00
    let valorLimpo = valorTexto.replace(/[^0-9,]/g, "").replace(",", ".");
    let valorTotal = parseFloat(valorLimpo);

    if (isNaN(valorTotal)) valorTotal = 0;

    // Cria as opções (ex: até 12x)
    for (let i = 1; i <= 12; i++) {
      let valorParcela = valorTotal / i;

      // Juros simples (exemplo: juros se for acima de 3x)
      if (i > 3) {
        valorParcela = valorParcela * 1.05;
      }

      const textoOpcao = `${i}x de ${valorParcela.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      })}`;
      const option = document.createElement("option");
      option.value = i;
      option.textContent = textoOpcao;
      selectParcelas.appendChild(option);
    }
  }

  // --- Lógica do Calendário ---
  const mesAnoAtualElement = document.getElementById("mes-ano-atual-publico");
  const gridDiasElement = document.querySelector(
    ".calendario-agendamento-grid-dias"
  );
  const botaoMesAnterior = document.getElementById("mes-anterior-publico");
  const botaoMesSeguinte = document.getElementById("mes-seguinte-publico");
  const gridHorariosElement = document.getElementById("grid-horarios");

  if (mesAnoAtualElement) {
    function renderizarCalendario(data) {
      const ano = data.getFullYear();
      const mes = data.getMonth();
      const primeiroDiaMes = new Date(ano, mes, 1);
      const ultimoDiaMes = new Date(ano, mes + 1, 0);
      const diasNoMes = ultimoDiaMes.getDate();
      const primeiroDiaSemana = primeiroDiaMes.getDay();

      mesAnoAtualElement.textContent = new Intl.DateTimeFormat("pt-BR", {
        month: "long",
        year: "numeric",
      }).format(data);
      gridDiasElement.innerHTML = "";

      for (let i = 0; i < primeiroDiaSemana; i++) {
        gridDiasElement.appendChild(document.createElement("div"));
      }
      for (let dia = 1; dia <= diasNoMes; dia++) {
        const diaElement = document.createElement("div");
        diaElement.classList.add("dia-agendamento");
        diaElement.textContent = dia;
        diaElement.addEventListener("click", () =>
          selecionarDia(diaElement, ano, mes, dia)
        );
        gridDiasElement.appendChild(diaElement);
      }
    }

    function selecionarDia(diaElement, ano, mes, dia) {
      document
        .querySelectorAll(".dia-agendamento")
        .forEach((d) => d.classList.remove("selecionado"));
      diaElement.classList.add("selecionado");

      dataSelecionada = new Date(ano, mes, dia);
      const dataFormatada = new Intl.DateTimeFormat("pt-BR", {
        dateStyle: "full",
      }).format(dataSelecionada);

      const tituloData = document.getElementById("data-selecionada-titulo");
      if (tituloData) tituloData.textContent = dataFormatada;

      // Mostra os horários
      containerHorarios.style.display = "block";
      renderizarHorariosDisponiveis();

      // Esconde pagamento se mudar o dia (para forçar reescolha de horário)
      containerPagamento.style.display = "none";
    }

    function renderizarHorariosDisponiveis() {
      gridHorariosElement.innerHTML = "";
      const horarios = [
        "09:00",
        "10:00",
        "11:00",
        "14:00",
        "15:00",
        "16:00",
        "17:00",
      ];

      horarios.forEach((hora) => {
        const btn = document.createElement("button");
        btn.classList.add("horario-btn");
        btn.textContent = hora;
        btn.addEventListener("click", () => selecionarHorario(btn, hora));
        gridHorariosElement.appendChild(btn);
      });
    }

    function selecionarHorario(btnElement, hora) {
      document
        .querySelectorAll(".horario-btn")
        .forEach((b) => b.classList.remove("selecionado"));
      btnElement.classList.add("selecionado");

      // Atualiza o resumo
      const dataCurta = dataSelecionada.toLocaleDateString("pt-BR");
      resumoData.textContent = `${dataCurta} às ${hora}`;

      // Mostra o container de pagamento
      containerPagamento.style.display = "block";

      // CALCULA AS PARCELAS AGORA (Baseado no valor do serviço selecionado)
      if (resumoValor) {
        atualizarOpcoesParcelamento(resumoValor.textContent);
      }

      // Scroll suave até o pagamento
      containerPagamento.scrollIntoView({ behavior: "smooth" });
    }

    // Navegação Mês
    if (botaoMesAnterior) {
      botaoMesAnterior.addEventListener("click", () => {
        dataCalendarioAtual.setMonth(dataCalendarioAtual.getMonth() - 1);
        renderizarCalendario(dataCalendarioAtual);
      });
    }
    if (botaoMesSeguinte) {
      botaoMesSeguinte.addEventListener("click", () => {
        dataCalendarioAtual.setMonth(dataCalendarioAtual.getMonth() + 1);
        renderizarCalendario(dataCalendarioAtual);
      });
    }
  }

  /* --- Lógica de Seleção PF / PJ (Cadastro) --- */
  const tabsPessoa = document.querySelectorAll(".tab-pessoa");
  const camposPF = document.getElementById("campos-pf");
  const camposPJ = document.getElementById("campos-pj");
  const inputTipoPessoa = document.getElementById("tipo-pessoa");

  if (tabsPessoa.length > 0) {
    tabsPessoa.forEach((tab) => {
      tab.addEventListener("click", () => {
        // Remove ativo de todos
        tabsPessoa.forEach((t) => t.classList.remove("ativo"));
        // Ativa o clicado
        tab.classList.add("ativo");

        const tipo = tab.getAttribute("data-target");
        if (inputTipoPessoa) inputTipoPessoa.value = tipo;

        if (tipo === "pf") {
          if (camposPF) camposPF.style.display = "block";
          if (camposPJ) camposPJ.style.display = "none";
          // Torna campos obrigatórios/opcionais dinamicamente
          const cpfInput = document.getElementById("cpf-cliente");
          const cnpjInput = document.getElementById("cnpj-cliente");
          if (cpfInput) cpfInput.required = true;
          if (cnpjInput) cnpjInput.required = false;
        } else {
          if (camposPF) camposPF.style.display = "none";
          if (camposPJ) camposPJ.style.display = "block";
          const cpfInput = document.getElementById("cpf-cliente");
          const cnpjInput = document.getElementById("cnpj-cliente");
          if (cpfInput) cpfInput.required = false;
          if (cnpjInput) cnpjInput.required = true;
        }
      });
    });
  }

  /* --- Lógica de Envio e Cadastro (Simulação de Backend) --- */
  const formAgendamento = document.getElementById("form-agendamento");

  if (formAgendamento) {
    formAgendamento.addEventListener("submit", (e) => {
      e.preventDefault();

      // 1. Coleta os dados
      const nomeInput = document.getElementById("nome-cliente");
      const emailInput = document.getElementById("email-cliente");
      const telefoneInput = document.getElementById("telefone-cliente");

      // --- NOVA VERIFICAÇÃO DE SENHA ---
      const senhaInput = document.getElementById("senha-cliente");
      const confirmaSenhaInput = document.getElementById(
        "confirma-senha-cliente"
      );

      if (senhaInput && confirmaSenhaInput) {
        const senha = senhaInput.value;
        const confirmaSenha = confirmaSenhaInput.value;

        if (senha !== confirmaSenha) {
          alert("As senhas não coincidem! Por favor, verifique.");
          confirmaSenhaInput.value = "";
          confirmaSenhaInput.focus();
          return; // PARE TUDO!
        }
      }

      // 2. Cria o objeto do Usuário (para login)
      const nome = nomeInput ? nomeInput.value : "Cliente";
      const email = emailInput ? emailInput.value : "";

      const novoUsuario = {
        nome: nome,
        email: email,
        tipo: inputTipoPessoa ? inputTipoPessoa.value : "pf",
        // (outros campos...)
      };

      // 3. Salva Usuário no "Banco de Dados" (LocalStorage)
      let usuarios =
        JSON.parse(localStorage.getItem("prodcumaru_usuarios")) || [];

      // Verifica se email já existe
      const usuarioExistente = usuarios.find((u) => u.email === email);
      if (usuarioExistente) {
        alert(
          "Este e-mail já possui cadastro! O agendamento será vinculado à sua conta existente."
        );
      } else {
        usuarios.push(novoUsuario);
        localStorage.setItem("prodcumaru_usuarios", JSON.stringify(usuarios));
      }

      // 4. Salva o Agendamento
      let agendamentos =
        JSON.parse(localStorage.getItem("prodcumaru_agendamentos")) || [];
      const novoAgendamento = {
        id: Date.now(),
        clienteEmail: email,
        servico: resumoServico ? resumoServico.textContent : "Serviço",
        data: resumoData ? resumoData.textContent : "",
        valor: resumoValor ? resumoValor.textContent : "",
        status: "Confirmado",
        dataCriacao: new Date().toLocaleDateString(),
      };
      agendamentos.push(novoAgendamento);
      localStorage.setItem(
        "prodcumaru_agendamentos",
        JSON.stringify(agendamentos)
      );

      // 5. Sucesso: Mostrar Tela de Confirmação

      // Esconde o formulário/grid
      document.querySelector(".container-agendamento-completo").style.display =
        "none";

      // Preenche o email na mensagem de sucesso
      document.getElementById("email-confirmacao-texto").textContent = email;

      // Mostra a tela de sucesso
      document.getElementById("tela-confirmacao").style.display = "block";

      // Scroll para o topo para o cliente ver a mensagem
      window.scrollTo({ top: 0, behavior: "smooth" });

      // (Opcional) Simula o login automático no SessionStorage para facilitar
      sessionStorage.setItem("usuario_logado", JSON.stringify(novoUsuario));
    });
  }
});
