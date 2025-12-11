// --- EFEITO DA NAVBAR AO ROLAR ---

// 1. Seleciona o elemento do cabeçalho no HTML
// Usamos 'document.querySelector' para pegar o elemento pela classe '.cabecalho'
// --- EFEITO DA NAVBAR AO ROLAR ---
const cabecalho = document.querySelector(".cabecalho");

function verificarRolagem() {
  // Se o usuário rolou mais de 50 pixels...
  if (window.scrollY > 50) {
    // ...adiciona a classe 'scrolled'.
    cabecalho.classList.add("scrolled");
  } else {
    // ...senão (se estiver no topo), remove a classe 'scrolled'.
    cabecalho.classList.remove("scrolled");
  }
}

window.addEventListener("scroll", verificarRolagem);

// 3. Adiciona um "ouvinte de evento" na janela.
// Isso diz ao navegador: "Ei, toda vez que o usuário rolar a página (evento 'scroll'),
// execute a função 'verificarRolagem' que acabamos de criar."
window.addEventListener("scroll", verificarRolagem);

/* ============================================= */
/* --- CÓDIGO DO CARROSSEL (ESTUDO DE CASO) --- */
/* ============================================= */

// Espera o DOM carregar para evitar erros
document.addEventListener("DOMContentLoaded", (event) => {
  // Seleciona os elementos que acabamos de criar no HTML
  const wrapper = document.querySelector(".case-studies-wrapper");
  const scrollLeftBtn = document.querySelector("#scroll-left");
  const scrollRightBtn = document.querySelector("#scroll-right");

  // Verifica se os elementos existem na página
  if (wrapper && scrollLeftBtn && scrollRightBtn) {
    // Evento de clique para o botão "Direita"
    scrollRightBtn.addEventListener("click", () => {
      // Rola o 'wrapper' para a direita em 400 pixels
      // (Você pode ajustar 400 para mais ou menos)
      wrapper.scrollLeft += 400;
    });

    // Evento de clique para o botão "Esquerda"
    scrollLeftBtn.addEventListener("click", () => {
      // Rola o 'wrapper' para a esquerda em 400 pixels
      wrapper.scrollLeft -= 400;
    });
  }
});

// --- BOTÃO VOLTAR AO TOPO (apenas na Home) ---
document.addEventListener('DOMContentLoaded', () => {
  const btnTopo = document.getElementById('btn-topo');
  console.log('btnTopo encontrado:', btnTopo);
  if (!btnTopo) {
    console.warn('Botão #btn-topo não encontrado no DOM');
    return;
  }

  function toggleBtnTopo() {
    if (window.scrollY > 50) {
      btnTopo.classList.add('show');
    } else {
      btnTopo.classList.remove('show');
    }
  }

  window.addEventListener('scroll', toggleBtnTopo);
  btnTopo.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // Estado inicial
  toggleBtnTopo();
});

/* ============================================= */
/* --- CÓDIGO DO CARROSSEL (NOSSOS PROGRAMAS) --- */
/* ============================================= */

// Espera o DOM carregar
document.addEventListener("DOMContentLoaded", (event) => {
  // Seleciona os elementos DESTE carrossel
  const programasWrapper = document.querySelector(".programas-wrapper");
  const programaScrollLeftBtn = document.querySelector("#programa-scroll-left");
  const programaScrollRightBtn = document.querySelector(
    "#programa-scroll-right"
  );

  // Verifica se os elementos existem
  if (programasWrapper && programaScrollLeftBtn && programaScrollRightBtn) {
    // Evento de clique para o botão "Direita"
    programaScrollRightBtn.addEventListener("click", () => {
      // Rola o 'programasWrapper' para a direita (largura de um card + gap)
      // Ajuste 380 + 30 = 410 se a largura do card mudar
      programasWrapper.scrollLeft += 410;
    });

    // Evento de clique para o botão "Esquerda"
    programaScrollLeftBtn.addEventListener("click", () => {
      programasWrapper.scrollLeft -= 410;
    });
  }
});
