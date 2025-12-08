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