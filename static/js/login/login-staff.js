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
    formLogin.addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = document.getElementById('email-staff-login').value;
      const senha = document.getElementById('senha-staff-login').value;
      const btnSubmit = formLogin.querySelector("button");

      btnSubmit.disabled = true;
      btnSubmit.innerText = "Entrando...";

      try {
        const response = await fetch('/api/login-staff', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, senha })
        });

        let data = {};
        try {
          data = await response.json();
        } catch (e) {
          console.error('Erro ao parsear JSON:', e);
          data = { success: false, message: 'Erro ao processar resposta do servidor' };
        }

        if (response.ok && data.success) {
          alert("Login de Staff efetuado com sucesso!");
          // Salva dados do staff no localStorage
          localStorage.setItem('prodcumaru_staff', JSON.stringify(data.user));
          // Redireciona para o sistema de gestão
          window.location.replace("/gestao");
        } else {
          // Erro na resposta ou dados inválidos
          const mensagem = data.message || "Credenciais inválidas";
          console.warn('Login falhou:', { status: response.status, data });
          alert(mensagem);
          btnSubmit.disabled = false;
          btnSubmit.innerText = "Entrar";
          // Limpa os inputs
          document.getElementById('email-staff-login').value = '';
          document.getElementById('senha-staff-login').value = '';
          // Foca no campo de email para facilitar nova tentativa
          document.getElementById('email-staff-login').focus();
        }
      } catch (error) {
        console.error('Erro no login:', error);
        alert("Erro ao tentar fazer login. Tente novamente.");
        btnSubmit.disabled = false;
        btnSubmit.innerText = "Entrar";
        // Limpa os inputs
        document.getElementById('email-staff-login').value = '';
        document.getElementById('senha-staff-login').value = '';
        // Foca no campo de email
        document.getElementById('email-staff-login').focus();
      }
    });
  }

  // Corrige botão preso em "Entrando..." ao voltar no navegador (bfcache/pageshow)
  window.addEventListener('pageshow', (event) => {
    const form = document.querySelector("#area-login .formulario-autenticacao");
    if (!form) return;
    const btn = form.querySelector('button');
    if (btn) {
      btn.disabled = false;
      btn.innerText = 'Entrar';
    }
  });
});