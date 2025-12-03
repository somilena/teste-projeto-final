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

          if (filtro === "todos" || (tipoCartao && tipoCartao.includes(filtro))) {
            cartao.style.display = "flex"; // Mostra o cartão
          } else {
            cartao.style.display = "none"; // Esconde o cartão
          }
        });
      });
    });
  }

  // =================================================================
  // 2. LÓGICA DE AGENDAMENTO (CÓDIGO ANTIGO)
  // =================================================================
  const secaoSelecaoServico = document.querySelector(".secao-selecao-servico");
  const secaoCalendario = document.getElementById("secao-calendario");
  const servicoSelecionadoTitulo = document.getElementById(
    "servico-selecionado-titulo"
  );

  // (Verifica se secaoCalendario existe antes de continuar)
  if (secaoCalendario) {
    const dataSelecionadaTitulo = document.getElementById(
      "data-selecionada-titulo"
    );
    const gridServicos = document.querySelector(".grid-servicos");
    const botoesAgendar = document.querySelectorAll(".botao-agendar");

    let servicoAtivo = null;
    let dataCalendarioAtual = new Date();
    let dataSelecionada = null;
    let horarioSelecionado = null;

    // LÓGICA DE SELEÇÃO DE SERVIÇO (Botões "Agendar")
    if (botoesAgendar.length > 0 && secaoCalendario) {
      botoesAgendar.forEach((botao) => {
        botao.addEventListener("click", () => {
          servicoAtivo = botao.getAttribute("data-servico");
          servicoSelecionadoTitulo.textContent = formatarNomeServico(servicoAtivo);

          if (servicoAtivo === "musica" || servicoAtivo === "assinatura") {
            alert(
              "Sua solicitação de orçamento foi enviada! Entraremos em contato."
            );
            return;
          }

          secaoSelecaoServico.style.display = "none";
          secaoCalendario.style.display = "block";
          window.scrollTo({ top: secaoCalendario.offsetTop - 100, behavior: 'smooth' });

          renderizarCalendario(dataCalendarioAtual);
        });
      });
    }

    function formatarNomeServico(servico) {
      const botao = document.querySelector(`.botao-agendar[data-servico="${servico}"]`);
      if (botao) {
        const cartao = botao.closest('.cartao-servico');
        if (cartao) {
          return cartao.querySelector('h3').textContent;
        }
      }
      return "Serviço"; // Fallback
    }

    // LÓGICA DO CALENDÁRIO
    const mesAnoAtualElement = document.getElementById("mes-ano-atual-publico");
    const gridDiasElement = document.querySelector(
      ".calendario-agendamento-grid-dias"
    );
    const botaoMesAnterior = document.getElementById("mes-anterior-publico");
    const botaoMesSeguinte = document.getElementById("mes-seguinte-publico");
    const gridHorariosElement = document.getElementById("grid-horarios");
    const botaoConfirmarAgendamento = document.getElementById(
      "botao-confirmar-agendamento"
    );

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
        mesAnoAtualElement.textContent =
          mesAnoAtualElement.textContent.charAt(0).toUpperCase() +
          mesAnoAtualElement.textContent.slice(1);

        gridDiasElement.innerHTML = "";

        for (let i = 0; i < primeiroDiaSemana; i++) {
          const divVazia = document.createElement("div");
          gridDiasElement.appendChild(divVazia);
        }

        for (let dia = 1; dia <= diasNoMes; dia++) {
          const diaElement = document.createElement("div");
          diaElement.classList.add("dia-agendamento");
          diaElement.textContent = dia;
          const dataAtualDoDia = new Date(ano, mes, dia);
          dataAtualDoDia.setHours(0, 0, 0, 0);
          const hoje = new Date();
          hoje.setHours(0, 0, 0, 0);
          const umAnoFrente = new Date();
          umAnoFrente.setFullYear(hoje.getFullYear() + 1);

          if (dataAtualDoDia < hoje || dataAtualDoDia > umAnoFrente) {
            diaElement.classList.add("inativo");
          } else {
            diaElement.addEventListener("click", () =>
              selecionarDia(diaElement, ano, mes, dia)
            );
          }
          gridDiasElement.appendChild(diaElement);
        }
      }

      function selecionarDia(diaElement, ano, mes, dia) {
        document
          .querySelectorAll(".dia-agendamento")
          .forEach((d) => d.classList.remove("selecionado"));
        diaElement.classList.add("selecionado");
        dataSelecionada = new Date(ano, mes, dia);
        dataSelecionadaTitulo.textContent = new Intl.DateTimeFormat("pt-BR", {
          dateStyle: "full",
        }).format(dataSelecionada);
        renderizarHorariosDisponiveis();
      }

      function renderizarHorariosDisponiveis() {
        gridHorariosElement.innerHTML = "";
        const horarios = [
          "09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00",
        ];
        horarios.forEach((hora) => {
          const btn = document.createElement("button");
          btn.classList.add("horario-btn");
          btn.textContent = hora;
          btn.setAttribute("data-hora", hora);
          if (servicoAtivo === "basico" && hora === "10:00") {
            btn.classList.add("indisponivel");
          } else if (servicoAtivo === "standard" && hora === "14:00") {
            btn.classList.add("indisponivel");
          } else {
            btn.addEventListener("click", () => selecionarHorario(btn));
          }
          gridHorariosElement.appendChild(btn);
        });
        horarioSelecionado = null;
        botaoConfirmarAgendamento.style.display = "none";
      }

      function selecionarHorario(btnElement) {
        document
          .querySelectorAll(".horario-btn")
          .forEach((b) => b.classList.remove("selecionado"));
        btnElement.classList.add("selecionado");
        horarioSelecionado = btnElement.getAttribute("data-hora");
        botaoConfirmarAgendamento.style.display = "block";
      }

      botaoMesAnterior.addEventListener("click", () => {
        dataCalendarioAtual.setMonth(dataCalendarioAtual.getMonth() - 1);
        renderizarCalendario(dataCalendarioAtual);
      });

      botaoMesSeguinte.addEventListener("click", () => {
        dataCalendarioAtual.setMonth(dataCalendarioAtual.getMonth() + 1);
        renderizarCalendario(dataCalendarioAtual);
      });

      botaoConfirmarAgendamento.addEventListener("click", () => {
        if (dataSelecionada && horarioSelecionado && servicoAtivo) {
          const dataHoraFinal = `${dataSelecionada.toLocaleDateString(
            "pt-BR"
          )} às ${horarioSelecionado}`;
          alert(
            `Agendamento confirmado!\nServiço: ${formatarNomeServico(
              servicoAtivo
            )}\nData e Hora: ${dataHoraFinal}\nEntraremos em contato para mais detalhes.`
          );

          secaoCalendario.style.display = 'none';
          secaoSelecaoServico.style.display = 'block';
          window.scrollTo({ top: secaoSelecaoServico.offsetTop - 100, behavior: 'smooth' });
          servicoAtivo = null;
          dataSelecionada = null;
          horarioSelecionado = null;

        } else {
          alert("Por favor, selecione uma data e um horário para o agendamento.");
        }
      });
    } // Fim do if (mesAnoAtualElement)
  } // Fim do if (secaoCalendario)
});