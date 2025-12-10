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

  // --- 2. CARREGAR AGENDAMENTOS (Com Regra de 48h) ---
  const listaBody = document.getElementById("lista-agendamentos-body");
  const agendamentos =
    JSON.parse(localStorage.getItem("prodcumaru_agendamentos")) || [];

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

  if (listaBody) {
    listaBody.innerHTML = "";

    if (agendamentos.length === 0) {
      listaBody.innerHTML =
        '<div style="padding: 30px; text-align: center; color: var(--cor-text-muted);">Você ainda não tem agendamentos.</div>';
    } else {
      agendamentos.reverse().forEach((agenda, index) => {
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
                      <div><span class="status-badge confirmado">${agenda.status
          }</span></div>
                      <div>
                          <button class="btn-reagendar ${classeBtn}" 
                                  onclick="abrirReagendamento('${agenda.id
          }', '${agenda.servico}')">
                              ${textoBtn}
                          </button>
                      </div>
                  </div>
              `;
        listaBody.insertAdjacentHTML("beforeend", html);
      });
    }
  }

  // --- 3. NAVEGAÇÃO ---
  const navItems = document.querySelectorAll(".nav-item");
  const secoes = document.querySelectorAll(".secao-conteudo");
  const tituloPagina = document.getElementById("titulo-pagina");

  navItems.forEach((item) => {
    item.addEventListener("click", (e) => {
      if (item.querySelector("a")) return;
      e.preventDefault();
      const pagina = item.dataset.pagina;

      navItems.forEach((n) => n.classList.remove("ativo"));
      item.classList.add("ativo");
      secoes.forEach((sec) => (sec.style.display = "none"));

      if (pagina === "agendamentos") {
        document.getElementById("secao-agendamentos").style.display = "block";
        tituloPagina.textContent = "Meus Agendamentos";
      } else if (pagina === "perfil") {
        document.getElementById("secao-perfil").style.display = "block";
        tituloPagina.textContent = "Meu Perfil";
      }
    });
  });

  // --- 5. MODAL E PERFIL ---
  const modal = document.getElementById("modal-reagendamento");
  const btnFecharModal = document.getElementById("modal-fechar");

  window.abrirReagendamento = (id, nomeServico) => {
    document.getElementById("modal-nome-servico").textContent = nomeServico;
    modal.style.display = "flex";
  };

  if (btnFecharModal)
    btnFecharModal.onclick = () => (modal.style.display = "none");
  window.onclick = (e) => {
    if (e.target == modal) modal.style.display = "none";
  };

  const formReagendamento = document.getElementById("form-reagendamento");
  if (formReagendamento) {
    formReagendamento.onsubmit = (e) => {
      e.preventDefault();
      alert(
        "Solicitação enviada! Nossa equipe confirmará o novo horário em breve."
      );
      modal.style.display = "none";
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
});
