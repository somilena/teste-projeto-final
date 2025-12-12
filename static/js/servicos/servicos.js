/* ================================================================= */
/* 1. LÓGICA DE FILTRAGEM (BOTÕES) */
/* ================================================================= */

function checkUserStatusServicos() {
  const userData = JSON.parse(localStorage.getItem("prodcumaru_user"));
  const loginPrompt = document.getElementById("login-prompt-servicos");
  const userSummaryCard = document.getElementById("user-summary-card-servicos");
  const tabsPessoa = document.getElementById("tabs-pessoa-servicos");
  const areaSenha = document.querySelector(".area-senha-cadastro");

  const nomeInput = document.getElementById("nome-cliente");
  const emailInput = document.getElementById("email-cliente");
  const telefoneInput = document.getElementById("telefone-cliente");
  const cpfInput = document.getElementById("cpf-cliente");

  if (userData) {
    console.log("✅ Usuário logado identificado:", userData.nome);

    // Preenche campos automaticamente
    if (nomeInput) nomeInput.value = userData.nome || "";
    if (emailInput) emailInput.value = userData.email || "";
    if (telefoneInput) telefoneInput.value = userData.telefone || "";
    if (cpfInput) cpfInput.value = userData.cpf || "";

    // Cria card resumo
    if (userSummaryCard) {
      userSummaryCard.style.display = "block";
      userSummaryCard.innerHTML = `
        <div style="background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%); padding: 20px; border-radius: 12px; border-left: 4px solid var(--accent); margin-bottom: 20px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
            <h4 style="color: var(--accent); margin: 0; font-size: 16px;">📋 Seus Dados</h4>
            <button type="button" onclick="toggleFormServicos()" style="background: none; border: 1px solid var(--accent); color: var(--accent); padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 600;">
              ✏️ Alterar
            </button>
          </div>
          <div style="display: grid; gap: 8px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <i class="fas fa-user" style="color: var(--accent); width: 16px;"></i>
              <span style="color: var(--white);">${userData.nome}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <i class="fas fa-envelope" style="color: var(--accent); width: 16px;"></i>
              <span style="color: var(--muted); font-size: 14px;">${userData.email}</span>
            </div>
            ${userData.telefone ? `
            <div style="display: flex; align-items: center; gap: 8px;">
              <i class="fas fa-phone" style="color: var(--accent); width: 16px;"></i>
              <span style="color: var(--muted); font-size: 14px;">${userData.telefone}</span>
            </div>
            ` : ''}
          </div>
        </div>
      `;
    }

    // Oculta elementos desnecessários para usuário logado
    const formGroups = document.querySelectorAll('.form-group');
    formGroups.forEach(group => {
      const label = group.querySelector('label');
      if (label && (label.textContent.includes('Nome') || label.textContent.includes('CPF') ||
        label.textContent.includes('E-mail') || label.textContent.includes('Telefone'))) {
        group.style.display = 'none';
        // Remove required dos campos ocultos
        const inputs = group.querySelectorAll('input');
        inputs.forEach(input => input.removeAttribute('required'));
      }
    });

    if (tabsPessoa) {
      tabsPessoa.style.display = 'none';
      // Remove required dos campos de PF/PJ
      const inputs = tabsPessoa.querySelectorAll('input');
      inputs.forEach(input => input.removeAttribute('required'));
    }

    if (areaSenha) {
      areaSenha.style.display = 'none';
      // Remove required dos campos de senha
      const senhaInputs = areaSenha.querySelectorAll('input[type="password"]');
      senhaInputs.forEach(input => input.removeAttribute('required'));
    }

    if (loginPrompt) loginPrompt.style.display = 'none';

  } else {
    // Usuário não logado - mostra prompt de login
    console.log("ℹ️ Usuário não logado");
    if (loginPrompt) loginPrompt.style.display = 'block';
    if (userSummaryCard) userSummaryCard.style.display = 'none';
  }
}

// Função global para alternar exibição do formulário
window.toggleFormServicos = function () {
  const formGroups = document.querySelectorAll('.form-group');
  const isHidden = formGroups[0].style.display === 'none';

  formGroups.forEach(group => {
    const label = group.querySelector('label');
    if (label && (label.textContent.includes('Nome') || label.textContent.includes('CPF') ||
      label.textContent.includes('E-mail') || label.textContent.includes('Telefone'))) {
      group.style.display = isHidden ? 'block' : 'none';

      // Adiciona/Remove required baseado em visibilidade
      const inputs = group.querySelectorAll('input');
      inputs.forEach(input => {
        if (isHidden) {
          input.setAttribute('required', 'required');
        } else {
          input.removeAttribute('required');
        }
      });
    }
  });

  const tabsPessoa = document.getElementById("tabs-pessoa-servicos");
  const areaSenha = document.querySelector(".area-senha-cadastro");

  if (tabsPessoa) {
    tabsPessoa.style.display = 'none'; // Sempre oculto para usuário logado
  }
  if (areaSenha) {
    areaSenha.style.display = 'none'; // Sempre oculto para usuário logado
  }
};

document.addEventListener("DOMContentLoaded", () => {
  // Verifica se usuário está logado e preenche dados automaticamente
  checkUserStatusServicos();

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
  console.log("📋 Formulário encontrado:", formAgendamento ? "✅ SIM" : "❌ NÃO");

  if (formAgendamento) {
    formAgendamento.addEventListener("submit", async (e) => {
      e.preventDefault();
      console.log("✅ Submit do formulário acionado!");

      // Verifica se usuário está logado
      const userData = JSON.parse(localStorage.getItem("prodcumaru_user"));

      console.log("🚀 Iniciando submit do agendamento...");
      console.log("👤 Dados do usuário:", userData);

      // 1. Coleta os dados
      const nomeInput = document.getElementById("nome-cliente");
      const emailInput = document.getElementById("email-cliente");
      const telefoneInput = document.getElementById("telefone-cliente");

      // --- NOVA VERIFICAÇÃO DE SENHA (Pula se usuário já está logado) ---
      const senhaInput = document.getElementById("senha-cliente");
      const confirmaSenhaInput = document.getElementById("confirma-senha-cliente");

      if (!userData && senhaInput && confirmaSenhaInput) {
        const senha = senhaInput.value;
        const confirmaSenha = confirmaSenhaInput.value;

        if (senha !== confirmaSenha) {
          alert("As senhas não coincidem! Por favor, verifique.");
          confirmaSenhaInput.value = "";
          confirmaSenhaInput.focus();
          return; // PARE TUDO!
        }
      }

      // 2. Coleta os dados do agendamento - usa localStorage se disponível
      let nome, email, telefone;

      if (userData) {
        // Usuário logado: usa dados do localStorage
        nome = userData.nome || "Cliente";
        email = userData.email || "";
        telefone = userData.telefone || "";
        console.log("✅ Usando dados do localStorage");
      } else {
        // Usuário não logado: usa dados do formulário
        nome = nomeInput ? nomeInput.value : "Cliente";
        email = emailInput ? emailInput.value : "";
        telefone = telefoneInput ? telefoneInput.value : "";
        console.log("📝 Usando dados do formulário");

        // Valida campos obrigatórios para não-logados
        if (!nome || !email || !telefone) {
          alert("Por favor, preencha seu nome, email e telefone!");
          return;
        }
      }

      const servico = resumoServico ? resumoServico.textContent : "Serviço";
      const data = resumoData ? resumoData.textContent : "";
      const valor = resumoValor ? resumoValor.textContent.replace(/[^\d,]/g, '').replace(',', '.') : "0";

      console.log("📦 Dados a enviar:", { nome, email, telefone, servico, data, valor });

      // Valida se foi selecionado serviço e data
      if (!servico || servico === "Serviço" || !data) {
        alert("Por favor, selecione um serviço e uma data!");
        return;
      }

      // 3. Pega método de pagamento selecionado
      const metodoPagamento = inputMetodoPagamento ? inputMetodoPagamento.value : "Não informado";

      // Desabilita o botão de submit para evitar duplo clique
      const btnSubmit = formAgendamento.querySelector('button[type="submit"]');
      if (btnSubmit) {
        btnSubmit.disabled = true;
        btnSubmit.textContent = "Processando...";
      }

      try {
        // 4. Envia para o backend
        const response = await fetch('/api/agendamento-publico', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nome: nome,
            email: email,
            telefone: telefone,
            servico: servico,
            data: data,
            valor: valor,
            forma_pagamento: metodoPagamento,
            observacao: ''
          })
        });

        const resultado = await response.json();
        console.log("✅ Resposta do servidor:", resultado);

        if (resultado.success) {
          console.log("🎉 Agendamento criado com sucesso!");
          // 5. Salva também no localStorage para o portal-cliente funcionar offline
          let agendamentos = JSON.parse(localStorage.getItem("prodcumaru_agendamentos")) || [];
          const novoAgendamento = {
            id: resultado.id,
            clienteEmail: email,
            servico: servico,
            data: data,
            valor: "R$ " + valor,
            status: "Confirmado",
            dataCriacao: new Date().toLocaleDateString(),
          };
          agendamentos.push(novoAgendamento);
          localStorage.setItem("prodcumaru_agendamentos", JSON.stringify(agendamentos));

          // 6. Sucesso: Mostrar Tela de Confirmação
          const containerAgendamento = document.querySelector(".container-agendamento-completo");
          const telaConfirmacao = document.getElementById("tela-confirmacao");
          const emailConfirmacao = document.getElementById("email-confirmacao-texto");

          if (containerAgendamento) containerAgendamento.style.display = "none";
          if (emailConfirmacao) emailConfirmacao.textContent = email;
          if (telaConfirmacao) telaConfirmacao.style.display = "block";

          window.scrollTo({ top: 0, behavior: "smooth" });

          // 7. Envia e-mail de confirmação ao cliente via EmailJS (se configurado)
          try {
            if (typeof emailjs !== 'undefined') {
              const SERVICE_ID = window.EMAILJS_SERVICE_ID || 'service_uxchflv';
              const TEMPLATE_ID = window.EMAILJS_TEMPLATE_ID_AGENDAMENTO_CLIENTE || 'template_hk0zoyo';
              const params = {
                user_email: email,
                cliente: nome,
                servico: servico,
                data: data,
                valor: typeof valor === 'number' ? valor.toFixed(2) : valor
              };
              if (TEMPLATE_ID !== 'COLOQUE_O_ID_DO_TEMPLATE_AGENDAMENTO') {
                if (window.EMAILJS_PUBLIC_KEY) {
                  try { emailjs.init({ publicKey: window.EMAILJS_PUBLIC_KEY }); } catch (e) { }
                }
                emailjs.send(SERVICE_ID, TEMPLATE_ID, params)
                  .then(() => console.log('📧 Email de agendamento enviado ao cliente'),
                    (err) => console.warn('Falha ao enviar email de agendamento:', err));
              } else {
                console.warn('Template de agendamento do cliente não configurado (EMAILJS_TEMPLATE_ID_AGENDAMENTO_CLIENTE).');
              }
            } else {
              console.warn('EmailJS indisponível nesta página.');
            }
          } catch (mailErr) {
            console.warn('Erro ao tentar enviar email de agendamento:', mailErr);
          }

        } else {
          console.error("❌ Erro no servidor:", resultado.message);
          alert("Erro ao criar agendamento: " + resultado.message);
          if (btnSubmit) {
            btnSubmit.disabled = false;
            btnSubmit.textContent = "Confirmar e Pagar";
          }
        }

      } catch (error) {
        console.error('❌ Erro ao enviar agendamento:', error);
        alert("Erro ao processar agendamento. Verifique o console para detalhes.\n\nErro: " + error.message);
        if (btnSubmit) {
          btnSubmit.disabled = false;
          btnSubmit.textContent = "Confirmar e Pagar";
        }
      }
    });
  }
});
