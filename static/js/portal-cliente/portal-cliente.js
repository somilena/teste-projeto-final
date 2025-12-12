document.addEventListener("DOMContentLoaded", () => {
  // --- 0. LÓGICA DE TEMA (CLARO/ESCURO) ---
  const btnTema = document.getElementById("btn-tema-toggle");
  const body = document.body;
  const iconeTema = btnTema.querySelector("i");
  const textoTema = btnTema.querySelector("span");

  // Verifica preferência salva
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

  // ... (RESTO DO CÓDIGO JS MANTIDO IGUAL AO PASSO ANTERIOR) ...
  // (Copie aqui todo o conteúdo do portal-cliente.js anterior,
  //  a partir de "--- 1. CARREGAR DADOS DO USUÁRIO ---")

  // --- 1. CARREGAR DADOS DO USUÁRIO ---
  const usuario =
    JSON.parse(sessionStorage.getItem("usuario_logado")) ||
    JSON.parse(localStorage.getItem("usuario_logado_demo")) ||
    {};

  // Preencher Perfil
  if (usuario.nome) {
    document.getElementById("nome-perfil-topo").textContent = usuario.nome;
    document.getElementById("input-nome").value = usuario.nome;
    document.getElementById("nome-header").textContent =
      usuario.nome.split(" ")[0];
  }
  if (usuario.email)
    document.getElementById("input-email").value = usuario.email;
  if (usuario.telefone)
    document.getElementById("input-telefone").value = usuario.telefone;

  // Carregar Foto
  const fotoSalva = localStorage.getItem("prodcumaru_user_foto");
  if (fotoSalva) {
    const imgHeader = document.getElementById("img-perfil-header");
    const imgGrande = document.getElementById("img-perfil-grande");
    if (imgHeader) imgHeader.src = fotoSalva;
    if (imgGrande) imgGrande.src = fotoSalva;
  }

  // --- 2. CARREGAR AGENDAMENTOS (Do Banco de Dados via API) ---
  const listaBody = document.getElementById("lista-agendamentos-body");

  async function carregarAgendamentos() {
    try {
      const response = await fetch('/api/meus-agendamentos');
      const data = await response.json();

      if (data.success && data.agendamentos) {
        renderizarAgendamentos(data.agendamentos);
      } else {
        // Se não estiver logado, tenta localStorage como fallback
        const agendamentosLocal = JSON.parse(localStorage.getItem("prodcumaru_agendamentos")) || [];
        renderizarAgendamentos(agendamentosLocal);
      }
    } catch (error) {
      console.error("Erro ao carregar agendamentos:", error);
      // Fallback para localStorage em caso de erro
      const agendamentosLocal = JSON.parse(localStorage.getItem("prodcumaru_agendamentos")) || [];
      renderizarAgendamentos(agendamentosLocal);
    }
  }

  function renderizarAgendamentos(agendamentos) {
    if (!listaBody) return;

    listaBody.innerHTML = "";

    if (agendamentos.length === 0) {
      listaBody.innerHTML =
        '<div class="aviso-lista-vazia">Você ainda não tem agendamentos.</div>';
    } else {
      agendamentos.reverse().forEach((agenda) => {
        const ativo = podeReagendar(agenda.data);
        const classeBtn = ativo ? "" : "desativado";
        const textoBtn = ativo ? "Reagendar" : "Fixo (< 48h)";

        const html = `
          <div class="agendamento-row">
              <div class="agendamento-data">
                  <strong>${agenda.data}</strong>
                  <span>ID: #${agenda.id.toString().slice(-4)}</span>
              </div>
              <div class="agendamento-servico">${agenda.servico}</div>
              <div><span class="status-badge confirmado">${agenda.status}</span></div>
              <div>
                  <button class="btn-reagendar ${classeBtn}" 
                          onclick="abrirReagendamento('${agenda.id}', '${agenda.servico}')">
                      ${textoBtn}
                  </button>
              </div>
          </div>
        `;
        listaBody.insertAdjacentHTML("beforeend", html);
      });
    }
  }

  const podeReagendar = (dataTexto) => {
    try {
      const partes = dataTexto.split(" às ");
      const dataPartes = partes[0].split("/");
      const horaPartes = partes[1] ? partes[1].split(":") : ["00", "00"];

      const dataAgendamento = new Date(
        dataPartes[2],
        dataPartes[1] - 1,
        dataPartes[0],
        horaPartes[0],
        horaPartes[1]
      );
      const agora = new Date();

      const diferenca = dataAgendamento - agora;
      const horasRestantes = diferenca / (1000 * 60 * 60);

      return horasRestantes > 48;
    } catch (e) {
      return true;
    }
  };

  // Carrega os agendamentos quando a página carregar
  carregarAgendamentos();

  // --- 3. NAVEGAÇÃO ---
  const navItems = document.querySelectorAll(".nav-item");
  const secoes = document.querySelectorAll(".secao-conteudo");
  const tituloPagina = document.getElementById("titulo-pagina");

  const mostrarSecao = (idSecao) => {
    secoes.forEach((sec) => sec.classList.add("oculto"));
    const alvo = document.getElementById(idSecao);
    if (alvo) alvo.classList.remove("oculto");
  };

  navItems.forEach((item) => {
    item.addEventListener("click", (e) => {
      if (item.querySelector("a")) return;
      e.preventDefault();
      const pagina = item.dataset.pagina;

      navItems.forEach((n) => n.classList.remove("ativo"));
      item.classList.add("ativo");

      if (pagina === "agendamentos") {
        mostrarSecao("secao-agendamentos");
        tituloPagina.textContent = "Meus Agendamentos";
      } else if (pagina === "compras") {
        mostrarSecao("secao-compras");
        tituloPagina.textContent = "Minhas Compras";
        renderizarMinhasCompras();
      } else if (pagina === "perfil") {
        mostrarSecao("secao-perfil");
        tituloPagina.textContent = "Meu Perfil";
      }
    });
  });

  // --- 4. RENDERIZAR MINHAS COMPRAS (Do Banco de Dados via API) ---
  async function renderizarMinhasCompras() {
    const listBody = document.getElementById("lista-compras-body");
    if (!listBody) return;

    try {
      const response = await fetch('/api/meus-pedidos');
      const data = await response.json();

      let pedidos = [];
      if (data.success && data.pedidos) {
        pedidos = data.pedidos;
      } else {
        // Fallback para localStorage
        pedidos = JSON.parse(localStorage.getItem("prodcumaru_pedidos")) || [];
      }

      listBody.innerHTML = "";

      if (pedidos.length === 0) {
        listBody.innerHTML = `
          <div style="grid-column: 1/-1; padding: 40px; text-align: center; color: var(--cor-text-muted);">
            <i class="ph-bold ph-shopping-bag-open" style="font-size: 48px; margin-bottom: 16px; opacity: 0.5;"></i>
            <p>Você ainda não fez nenhuma compra.</p>
            <a href="/loja" style="color: var(--cor-primaria); text-decoration: none; margin-top: 16px; display: inline-block;">
              Explorar Loja →
            </a>
          </div>
        `;
        return;
      }

      pedidos.forEach((pedido, index) => {
        const dataFormatada = new Date(pedido.data || Date.now()).toLocaleDateString('pt-BR');
        const statusClass = pedido.status === 'Pago' ? 'pago' : 'pendente';

        const html = `
          <div class="compra-row" style="grid-template-columns: 1fr 1fr 1fr 1fr 1fr;">
            <span class="compra-info">#${pedido.id || index + 1001}</span>
            <span class="compra-info">${dataFormatada}</span>
            <span class="compra-info">R$ ${parseFloat(pedido.valor || 0).toFixed(2)}</span>
            <span class="status-badge ${statusClass}">${pedido.status || 'Pendente'}</span>
            <div class="compra-acoes">
              <button class="btn-acao" onclick="abrirDetalhesCompra(${index})" title="Detalhes">
                <i class="ph-bold ph-eye"></i>
              </button>
              <button class="btn-acao" onclick="abrirReembolso(${index})" title="Solicitar Reembolso" style="color: #ff6b6b;">
                <i class="ph-bold ph-arrow-u-left"></i>
              </button>
            </div>
          </div>
        `;
        listBody.insertAdjacentHTML("beforeend", html);
      });
    } catch (error) {
      console.error("Erro ao carregar pedidos:", error);
      // Fallback para localStorage em caso de erro
      const pedidosLocal = JSON.parse(localStorage.getItem("prodcumaru_pedidos")) || [];
      // ... resto do código de renderização igual
    }
  }

  // Funções globais para compras
  window.abrirDetalhesCompra = function (index) {
    const pedidos = JSON.parse(localStorage.getItem("prodcumaru_pedidos")) || [];
    const pedido = pedidos[index];
    alert(`Pedido #${pedido.id || index + 1001}\n\nValor: R$ ${pedido.valor}\nData: ${pedido.data}\nStatus: ${pedido.status}`);
  };

  window.abrirReembolso = function (index) {
    const pedidos = JSON.parse(localStorage.getItem("prodcumaru_pedidos")) || [];
    const pedido = pedidos[index];
    const motivo = prompt(`Solicitar reembolso para Pedido #${pedido.id || index + 1001}\n\nMotivo do reembolso:`);

    if (motivo) {
      // Salva solicitação de reembolso
      let reembolsos = JSON.parse(localStorage.getItem("prodcumaru_reembolsos")) || [];
      reembolsos.push({
        pedidoId: pedido.id || index + 1001,
        motivo: motivo,
        dataSolicitacao: new Date().toLocaleDateString(),
        status: 'Aguardando Análise'
      });
      localStorage.setItem("prodcumaru_reembolsos", JSON.stringify(reembolsos));
      alert("✅ Solicitação de reembolso enviada! Você será contatado em breve.");
      renderizarMinhasCompras();
    }
  };

  // --- 5. MODAL E PERFIL ---
  const modal = document.getElementById("modal-reagendamento");
  const btnFecharModal = document.getElementById("modal-fechar");

  window.abrirReagendamento = (id, nomeServico) => {
    document.getElementById("modal-nome-servico").textContent = nomeServico;
    modal.classList.add("modal-visivel");
  };

  if (btnFecharModal)
    btnFecharModal.onclick = () => modal.classList.remove("modal-visivel");
  window.onclick = (e) => {
    if (e.target == modal) modal.classList.remove("modal-visivel");
  };

  const formReagendamento = document.getElementById("form-reagendamento");
  if (formReagendamento) {
    formReagendamento.onsubmit = (e) => {
      e.preventDefault();
      alert(
        "Solicitação enviada! Nossa equipe confirmará o novo horário em breve."
      );
      modal.classList.remove("modal-visivel");
    };
  }

  const inputFoto = document.getElementById("input-foto");
  if (inputFoto) {
    inputFoto.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function (ev) {
          const imgData = ev.target.result;
          const imgG = document.getElementById("img-perfil-grande");
          const imgH = document.getElementById("img-perfil-header");
          if (imgG) imgG.src = imgData;
          if (imgH) imgH.src = imgData;
          localStorage.setItem("prodcumaru_user_foto", imgData);
        };
        reader.readAsDataURL(file);
      }
    });
  }

  const btnSalvar = document.getElementById("btn-salvar-perfil");
  if (btnSalvar) {
    btnSalvar.addEventListener("click", () => {
      usuario.nome = document.getElementById("input-nome").value;
      usuario.telefone = document.getElementById("input-telefone").value;
      sessionStorage.setItem("usuario_logado", JSON.stringify(usuario));
      document.getElementById("nome-header").textContent =
        usuario.nome.split(" ")[0];
      alert("Dados atualizados!");
    });
  }

  // --- 6. BOTÃO NOVO AGENDAMENTO ---
  const btnNovoAgendamento = document.getElementById("btn-novo-agendamento-portal");
  const modalNovoAgendamento = document.getElementById("modal-novo-agendamento");
  const btnFecharNovoModal = document.getElementById("modal-fechar-novo");

  console.log("Botão Novo Agendamento encontrado:", btnNovoAgendamento);

  if (btnNovoAgendamento) {
    btnNovoAgendamento.addEventListener("click", () => {
      console.log("Abrindo modal de novo agendamento");
      if (modalNovoAgendamento) {
        modalNovoAgendamento.classList.add("modal-visivel");
      }
    });
  } else {
    console.error("Botão Novo Agendamento NÃO encontrado!");
  }

  // Fechar modal de novo agendamento
  if (btnFecharNovoModal) {
    btnFecharNovoModal.onclick = () => {
      modalNovoAgendamento.classList.remove("modal-visivel");
    };
  }

  // Clicar fora do modal fecha
  window.addEventListener("click", (e) => {
    if (e.target === modalNovoAgendamento) {
      modalNovoAgendamento.classList.remove("modal-visivel");
    }
  });

  // Processar formulário de novo agendamento
  const formNovoAgendamento = document.getElementById("form-novo-agendamento");
  if (formNovoAgendamento) {
    formNovoAgendamento.addEventListener("submit", async (e) => {
      e.preventDefault();

      const servico = document.getElementById("novo-servico").value;
      const data = document.getElementById("novo-data").value;
      const horario = document.getElementById("novo-horario").value;
      const pagamento = document.getElementById("novo-pagamento").value;
      const obs = document.getElementById("novo-obs").value;

      // Extrai o valor do serviço
      const valorMatch = servico.match(/R\$ ([\d.,]+)/);
      const valor = valorMatch ? valorMatch[1].replace('.', '').replace(',', '.') : '0';

      // Formata data para exibição (DD/MM/YYYY)
      const dataObj = new Date(data + 'T00:00:00');
      const dataFormatada = dataObj.toLocaleDateString('pt-BR') + ' às ' + horario;

      // Prepara dados do usuário
      const userData = JSON.parse(localStorage.getItem("prodcumaru_user")) || {};

      // Cria objeto do agendamento
      const novoAgendamento = {
        nome: userData.nome || 'Cliente',
        email: userData.email || '',
        telefone: userData.telefone || '',
        servico: servico.split(' - ')[0],
        data: data,
        horario: horario,
        pagamento: pagamento,
        valor: valor,
        obs: obs || '',
        tipo_cliente: userData.tipo || 'pf'
      };

      try {
        // Envia para o backend
        const response = await fetch('/api/agendamentos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(novoAgendamento)
        });

        const result = await response.json();

        if (result.success) {
          // Fecha modal
          modalNovoAgendamento.classList.remove("modal-visivel");

          // Mostra mensagem de sucesso
          alert("✅ Agendamento realizado com sucesso!\n\nServiço: " + novoAgendamento.servico + "\nData: " + dataFormatada + "\nPagamento: " + pagamento.toUpperCase());

          // Recarrega lista de agendamentos
          carregarAgendamentos();
        } else {
          alert("❌ Erro ao criar agendamento: " + (result.message || 'Erro desconhecido'));
        }
      } catch (error) {
        console.error("Erro ao salvar agendamento:", error);
        alert("❌ Erro ao conectar com o servidor. Tente novamente.");
      }
    });
  }

  // --- 7. BOTÃO SAIR (LOGOUT) ---
  const btnSairPortal = document.getElementById("btn-sair-portal");
  if (btnSairPortal) {
    btnSairPortal.addEventListener("click", async (e) => {
      e.preventDefault();

      // Limpa todos os dados do localStorage PRIMEIRO
      localStorage.removeItem("prodcumaru_user");
      localStorage.removeItem("prodcumaru_pedidos");
      localStorage.removeItem("prodcumaru_agendamentos");
      localStorage.removeItem("prodcumaru_reembolsos");
      localStorage.removeItem("prodcumaru_user_foto");
      sessionStorage.clear();

      try {
        // Chama API de logout para limpar sessão do servidor
        await fetch('/api/logout-cliente', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (error) {
        console.log('Erro ao fazer logout no servidor:', error);
      }

      // Redireciona para login com parâmetro logout para evitar loop
      window.location.href = "/login-cliente?logout=1";
    });
  }
});
