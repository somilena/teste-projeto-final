document.addEventListener("DOMContentLoaded", () => {
  const areaLogin = document.getElementById("area-login");
  const areaCadastro = document.getElementById("area-cadastro");
  const linkIrCadastro = document.getElementById("link-ir-cadastro");
  const linkIrLogin = document.getElementById("link-ir-login");
  const subtituloPrincipal = document.getElementById(
    "subtitulo-login-cadastro"
  );
  // const linkVoltar = document.querySelector('.link-voltar'); // Descomente se for usar

  // Função para alternar entre login e cadastro
  function alternarFormularios(mostrarLogin) {
    if (mostrarLogin) {
      areaLogin.classList.add("ativa");
      areaCadastro.classList.remove("ativa");
      subtituloPrincipal.textContent = "Acesse sua conta profissional";
    } else {
      areaLogin.classList.remove("ativa");
      areaCadastro.classList.add("ativa");
      subtituloPrincipal.textContent = "Cadastre-se como profissional";
    }
  }

  // Event listeners para os links de alternância
  if (linkIrCadastro) {
    linkIrCadastro.addEventListener("click", (e) => {
      e.preventDefault();
      alternarFormularios(false); // Mostra o cadastro
    });
  }

  if (linkIrLogin) {
    linkIrLogin.addEventListener("click", (e) => {
      e.preventDefault();
      alternarFormularios(true); // Mostra o login
    });
  }

  // Lógica para mostrar/esconder senha
  document.querySelectorAll(".mostrar-senha").forEach((toggle) => {
    toggle.addEventListener("click", () => {
      const targetId = toggle.getAttribute("data-target");
      const inputSenha = document.getElementById(targetId);
      if (inputSenha.type === "password") {
        inputSenha.type = "text";
        toggle.innerHTML = '<i class="ph-bold ph-eye-slash"></i>';
      } else {
        inputSenha.type = "password";
        toggle.innerHTML = '<i class="ph-bold ph-eye"></i>';
      }
    });
  });

  // Lógica para envio de formulário (simulação)
  document
    .querySelector("#area-login .formulario-autenticacao")
    .addEventListener("submit", (e) => {
      e.preventDefault();
      alert(
        "Login de Staff efetuado (simulação)! Redirecionando para o Dashboard..."
      );
      window.location.href = "/pages/gestao/gestao.html"; // Redireciona para o dashboard principal
    });

  document
    .querySelector("#area-cadastro .formulario-autenticacao")
    .addEventListener("submit", (e) => {
      e.preventDefault();
      alert(
        "Cadastro de Staff realizado (simulação)! Você já pode fazer login."
      );
      alternarFormularios(true); // Volta para a tela de login
    });
});
