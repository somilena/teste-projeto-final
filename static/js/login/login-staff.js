document.addEventListener("DOMContentLoaded", () => {
  
  // --- MOSTRAR/ESCONDER SENHA ---
  document.querySelectorAll(".mostrar-senha").forEach((toggle) => {
    toggle.addEventListener("click", () => {
      const targetId = toggle.getAttribute("data-target");
      const inputSenha = document.getElementById(targetId);
      if (inputSenha.type === "password") {
        inputSenha.type = "text";
        toggle.innerHTML = '<i class="fas fa-eye-slash"></i>';
      } else {
        inputSenha.type = "password";
        toggle.innerHTML = '<i class="far fa-eye"></i>';
      }
    });
  });

  // --- LOGIN SUBMIT ---
  const formLogin = document.querySelector("#area-login .formulario-autenticacao");
  if (formLogin) {
      formLogin.addEventListener("submit", (e) => {
          e.preventDefault();
          // Aqui entraria a lógica real de autenticação (fetch/axios)
          alert("Login de Staff efetuado (simulação)! Redirecionando...");
          window.location.href = "/pages/gestao/gestao.html";
      });
  }
});