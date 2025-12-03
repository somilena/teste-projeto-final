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

  const botoesAgendar = document.querySelectorAll(".botao-agendar");

  let servicoAtivo = null;
  let precoServico = "R$ 0,00";
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

  // --- Lógica do Calendário ---
  // (Mantenha as variáveis de calendário existentes aqui: mesAnoAtualElement, etc.)
  const mesAnoAtualElement = document.getElementById("mes-ano-atual-publico");
  const gridDiasElement = document.querySelector(
    ".calendario-agendamento-grid-dias"
  );
  const botaoMesAnterior = document.getElementById("mes-anterior-publico");
  const botaoMesSeguinte = document.getElementById("mes-seguinte-publico");
  const gridHorariosElement = document.getElementById("grid-horarios");

  if (mesAnoAtualElement) {
    // ... (Função renderizarCalendario igual ao anterior) ...
    function renderizarCalendario(data) {
      // (Copie a lógica de renderizar dias aqui, é a mesma)
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
      document.getElementById("data-selecionada-titulo").textContent =
        dataFormatada;

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

      // Atualiza o resumo e mostra o pagamento
      const dataCurta = dataSelecionada.toLocaleDateString("pt-BR");
      resumoData.textContent = `${dataCurta} às ${hora}`;

      containerPagamento.style.display = "block";
      // Scroll suave até o pagamento
      containerPagamento.scrollIntoView({ behavior: "smooth" });
    }

    // Navegação Mês
    botaoMesAnterior.addEventListener("click", () => {
      dataCalendarioAtual.setMonth(dataCalendarioAtual.getMonth() - 1);
      renderizarCalendario(dataCalendarioAtual);
    });
    botaoMesSeguinte.addEventListener("click", () => {
      dataCalendarioAtual.setMonth(dataCalendarioAtual.getMonth() + 1);
      renderizarCalendario(dataCalendarioAtual);
    });

    // Finalizar (Apenas alerta por enquanto)
    const formAgendamento = document.getElementById("form-agendamento");
    if (formAgendamento) {
      formAgendamento.addEventListener("submit", (e) => {
        e.preventDefault();
        alert("Agendamento realizado com sucesso! Entraremos em contato.");
        window.location.href = "/index.html"; // Redireciona para home
      });
    }
  }
});
