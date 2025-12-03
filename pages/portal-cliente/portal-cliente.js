document.addEventListener("DOMContentLoaded", () => {
  // =================================================================
  // 1. LÓGICA DE NAVEGAÇÃO (Troca de Abas/Seções)
  // =================================================================
  const itensMenu = document.querySelectorAll(".item-menu");
  const paginasConteudo = document.querySelectorAll(".pagina-conteudo");

  itensMenu.forEach((item) => {
    item.addEventListener("click", (evento) => {
      evento.preventDefault();
      const paginaAlvoID = item.getAttribute("data-pagina");

      // Atualiza Menu
      itensMenu.forEach((i) => i.classList.remove("ativo"));
      item.classList.add("ativo");

      // Atualiza Conteúdo
      paginasConteudo.forEach((pagina) => pagina.classList.remove("ativa"));
      const secaoAlvo = document.getElementById("secao-" + paginaAlvoID);
      if (secaoAlvo) {
        secaoAlvo.classList.add("ativa");
      }
    });
  });

  // =================================================================
  // 2. LÓGICA DAS REGRAS DE NEGÓCIO (24h e 7 dias)
  // =================================================================

  // ATENÇÃO: Definimos a data "atual" como 25 de Outubro de 2025 (como no chat)
  // para que a simulação funcione com os dados do HTML.
  const dataAtualSimulada = new Date("2025-10-25T20:00:00"); // 8 da noite

  function checarRegrasDosBotoes() {
    // --- Regra 1: Reagendamento (24 horas) ---
    const agendamentos = document.querySelectorAll("[data-data-agendamento]");
    agendamentos.forEach((linha) => {
      const dataAgendamento = new Date(linha.dataset.dataAgendamento);

      // Calcula a diferença em horas
      const diffMilissegundos = dataAgendamento - dataAtualSimulada;
      const diffHoras = diffMilissegundos / (1000 * 60 * 60);

      // Se a diferença for menor que 24h (ou já passou)
      if (diffHoras < 24) {
        const botaoReagendar = linha.querySelector(".botao-reagendar");
        const botaoCancelar = linha.querySelector(".botao-cancelar");

        if (botaoReagendar) botaoReagendar.classList.add("desativado");
        if (botaoCancelar) botaoCancelar.classList.add("desativado");
      }
    });

    // --- Regra 2: Reembolso (7 dias) ---
    const compras = document.querySelectorAll("[data-data-compra]");
    compras.forEach((linha) => {
      const dataCompra = new Date(linha.dataset.dataCompra);

      // Calcula a diferença em dias
      const diffMilissegundos = dataAtualSimulada - dataCompra;
      const diffDias = diffMilissegundos / (1000 * 60 * 60 * 24);

      // Se a diferença for maior que 7 dias
      if (diffDias > 7) {
        const botaoReembolso = linha.querySelector(".botao-reembolso");
        if (botaoReembolso) {
          botaoReembolso.classList.add("desativado");
        }
      }
    });
  }

  // Roda a verificação assim que a página carrega
  checarRegrasDosBotoes();

  // =================================================================
  // 3. LÓGICA DO MODAL (POP-UP) DE REAGENDAMENTO
  // =================================================================
  const modal = document.getElementById("modal-reagendamento");
  const botoesAbrirModal = document.querySelectorAll(".botao-reagendar");
  const botaoFecharModal = document.getElementById("modal-fechar");
  const formReagendamento = document.getElementById("form-reagendamento");

  const abrirModal = (e) => {
    // Impede de abrir se o botão estiver desativado
    if (e.target.classList.contains("desativado")) return;
    modal.style.display = "flex";
  };

  const fecharModal = () => {
    modal.style.display = "none";
  };

  botoesAbrirModal.forEach((btn) => btn.addEventListener("click", abrirModal));
  botaoFecharModal.addEventListener("click", fecharModal);

  modal.addEventListener("click", (evento) => {
    if (evento.target === modal) fecharModal();
  });

  formReagendamento.addEventListener("submit", (e) => {
    e.preventDefault();
    alert("Solicitação de reagendamento enviada com sucesso!");
    fecharModal();
  });
});
