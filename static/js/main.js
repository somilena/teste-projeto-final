// --- EFEITO DA NAVBAR AO ROLAR (JÁ EXISTIA) ---
const cabecalho = document.querySelector(".cabecalho");
if (cabecalho) {
  function verificarRolagem() {
    // Verifica se estamos na home (que tem a classe .hero)
    const isHome = document.querySelector('.hero');

    if (window.scrollY > 50) {
      cabecalho.classList.add("scrolled");
    } else if (isHome) {
      // Se FOR a home, remove 'scrolled' ao voltar ao topo
      cabecalho.classList.remove("scrolled");
    }
    // Se NÃO for a home, o CSS global já cuida do fundo estático
  }

  // Adiciona o listener
  window.addEventListener("scroll", verificarRolagem);
}

/* ============================================= */
/* --- LÓGICA DO MENU MOBILE (O QUE FALTAVA) --- */
/* ============================================= */
document.addEventListener("DOMContentLoaded", () => {
  const botaoAbrir = document.getElementById("botao-abrir-menu");
  const botaoFechar = document.getElementById("botao-fechar-menu");
  const navbarMenu = document.getElementById("navbar-menu");

  // Verifica se os botões e o menu existem
  if (botaoAbrir && botaoFechar && navbarMenu) {

    // Abrir menu ao clicar no hamburger
    botaoAbrir.addEventListener("click", () => {
      navbarMenu.classList.add("ativo");
    });

    // Fechar menu ao clicar no "X"
    botaoFechar.addEventListener("click", () => {
      navbarMenu.classList.remove("ativo");
    });
  }
});

/* ============================================= */
/* --- MENU DE USUÁRIO LOGADO NA NAVBAR --- */
/* ============================================= */
function checkUserLoggedInNavbar() {
  const userData = JSON.parse(localStorage.getItem("prodcumaru_user"));
  const menuNaoLogado = document.getElementById("menu-nao-logado");
  const menuLogado = document.getElementById("menu-logado");
  const headerUserName = document.getElementById("header-user-name");

  if (userData) {
    // Usuário está logado
    if (menuNaoLogado) menuNaoLogado.style.display = "none";
    if (menuLogado) menuLogado.style.display = "block";
    if (headerUserName) headerUserName.textContent = userData.nome || "Usuário";
    console.log("✅ Usuário logado na navbar:", userData.nome);
  } else {
    // Usuário não está logado
    if (menuNaoLogado) menuNaoLogado.style.display = "block";
    if (menuLogado) menuLogado.style.display = "none";
  }
}

// Função para logout
window.logoutUsuario = async function () {
  try {
    // Chama API de logout para limpar sessão do servidor
    await fetch('/api/logout-cliente', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.log('Erro ao fazer logout no servidor:', error);
  }

  // Limpa localStorage
  localStorage.removeItem("prodcumaru_user");
  localStorage.removeItem("prodcumaru_pedidos");
  localStorage.removeItem("prodcumaru_agendamentos");
  window.location.href = "/";
};

// Executar ao carregar a página
document.addEventListener("DOMContentLoaded", checkUserLoggedInNavbar);