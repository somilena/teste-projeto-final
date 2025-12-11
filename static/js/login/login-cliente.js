document.addEventListener("DOMContentLoaded", () => {
  
    // --- ALTERNÂNCIA ENTRE TELA DE LOGIN, CADASTRO E RECUPERAÇÃO ---
    const areaLogin = document.getElementById("area-login");
    const areaCadastro = document.getElementById("area-cadastro");
    const areaRecuperacao = document.getElementById("area-recuperacao"); // Preservado
    const cartaoAutenticacao = document.querySelector('.cartao-autenticacao');

    const linkIrCadastro = document.getElementById("link-ir-cadastro");
    const linkIrLogin = document.getElementById("link-ir-login");
    const linkEsqueciSenha = document.getElementById("link-esqueci-senha"); // Preservado
    const linkVoltarRec = document.getElementById("link-voltar-login-rec"); // Preservado
    
    // Helper para rolar suavemente
    function rolarParaTopo() {
        if(cartaoAutenticacao) cartaoAutenticacao.scrollIntoView({behavior: 'smooth'});
    }

    // Navegação Login <-> Cadastro
    if(linkIrCadastro && linkIrLogin) {
        linkIrCadastro.addEventListener("click", (e) => {
          e.preventDefault();
          if(areaLogin) areaLogin.classList.remove("ativa");
          if(areaRecuperacao) areaRecuperacao.classList.remove("ativa");
          if(areaCadastro) areaCadastro.classList.add("ativa");
          rolarParaTopo();
        });
  
        linkIrLogin.addEventListener("click", (e) => {
          e.preventDefault();
          if(areaCadastro) areaCadastro.classList.remove("ativa");
          if(areaRecuperacao) areaRecuperacao.classList.remove("ativa");
          if(areaLogin) areaLogin.classList.add("ativa");
          rolarParaTopo();
        });
    }

    // Navegação Recuperação (Preservada)
    if(linkEsqueciSenha) {
        linkEsqueciSenha.addEventListener("click", (e) => {
            e.preventDefault();
            if(areaLogin) areaLogin.classList.remove("ativa");
            if(areaCadastro) areaCadastro.classList.remove("ativa");
            if(areaRecuperacao) areaRecuperacao.classList.add("ativa");
            rolarParaTopo();
        });
    }

    if(linkVoltarRec) {
        linkVoltarRec.addEventListener("click", (e) => {
            e.preventDefault();
            if(areaRecuperacao) areaRecuperacao.classList.remove("ativa");
            if(areaLogin) areaLogin.classList.add("ativa");
            rolarParaTopo();
        });
    }
  
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
  
    // --- ALTERNÂNCIA PF / PJ ---
    const radiosTipo = document.querySelectorAll('input[name="tipo-pessoa"]');
    const camposPF = document.getElementById("campos-pf");
    const camposPJ = document.getElementById("campos-pj");
    const inputCPF = document.getElementById("cpf-cliente-cadastro");
    const inputCNPJ = document.getElementById("cnpj-cliente-cadastro");
  
    radiosTipo.forEach(radio => {
        radio.addEventListener("change", (e) => {
            if(e.target.value === "pf") {
                camposPF.style.display = "block";
                camposPJ.style.display = "none";
                // Limpa validações ao trocar
                if(inputCNPJ) { inputCNPJ.value = ""; resetFeedback(inputCNPJ, "feedback-cnpj"); }
            } else {
                camposPF.style.display = "none";
                camposPJ.style.display = "block";
                // Limpa validações ao trocar
                if(inputCPF) { inputCPF.value = ""; resetFeedback(inputCPF, "feedback-cpf"); }
            }
        });
    });
  
    // --- HELPER: RESETAR FEEDBACK VISUAL ---
    function resetFeedback(input, feedbackId) {
        input.style.borderColor = "var(--cor-borda)"; 
        const feedback = document.getElementById(feedbackId);
        if(feedback) feedback.style.display = "none";
    }
  
    function showFeedback(input, feedbackId, isValid) {
        const feedback = document.getElementById(feedbackId);
        if(isValid) {
            input.style.borderColor = "var(--cor-sucesso)"; 
            if(feedback) feedback.style.display = "none";
        } else {
            input.style.borderColor = "var(--cor-erro)"; 
            if(feedback) feedback.style.display = "block";
        }
    }
  
    // --- VALIDAÇÃO CPF ---
    function validarCPF(cpf) {
        cpf = cpf.replace(/[^\d]+/g,'');
        if(cpf == '') return false;
        if (cpf.length != 11 || 
            cpf == "00000000000" || 
            cpf == "11111111111" || 
            cpf == "22222222222" || 
            cpf == "33333333333" || 
            cpf == "44444444444" || 
            cpf == "55555555555" || 
            cpf == "66666666666" || 
            cpf == "77777777777" || 
            cpf == "88888888888" || 
            cpf == "99999999999")
                return false;
        let add = 0;
        for (let i=0; i < 9; i ++) add += parseInt(cpf.charAt(i)) * (10 - i);
        let rev = 11 - (add % 11);
        if (rev == 10 || rev == 11) rev = 0;
        if (rev != parseInt(cpf.charAt(9))) return false;
        add = 0;
        for (let i = 0; i < 10; i ++) add += parseInt(cpf.charAt(i)) * (11 - i);
        rev = 11 - (add % 11);
        if (rev == 10 || rev == 11) rev = 0;
        if (rev != parseInt(cpf.charAt(10))) return false;
        return true;
    }
  
    if(inputCPF) {
        inputCPF.addEventListener("input", (e) => {
            let v = e.target.value.replace(/\D/g,"");
            if(v.length > 11) v = v.slice(0,11);
            
            v = v.replace(/(\d{3})(\d)/, "$1.$2");
            v = v.replace(/(\d{3})(\d)/, "$1.$2");
            v = v.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
            e.target.value = v;
  
            if(v.length === 14) {
                const valido = validarCPF(v);
                showFeedback(inputCPF, "feedback-cpf", valido);
            } else {
                resetFeedback(inputCPF, "feedback-cpf");
            }
        });
  
        inputCPF.addEventListener("blur", () => {
            if(inputCPF.value.length > 0 && inputCPF.value.length < 14) {
                showFeedback(inputCPF, "feedback-cpf", false);
            } else if(inputCPF.value.length === 14) {
                 showFeedback(inputCPF, "feedback-cpf", validarCPF(inputCPF.value));
            }
        });
    }
  
    // --- VALIDAÇÃO CNPJ ---
    function validarCNPJ(cnpj) {
        cnpj = cnpj.replace(/[^\d]+/g,'');
        if(cnpj == '') return false;
        if (cnpj.length != 14) return false;
        if (/^(\d)\1+$/.test(cnpj)) return false;
  
        let tamanho = cnpj.length - 2
        let numeros = cnpj.substring(0,tamanho);
        let digitos = cnpj.substring(tamanho);
        let soma = 0;
        let pos = tamanho - 7;
        for (let i = tamanho; i >= 1; i--) {
            soma += numeros.charAt(tamanho - i) * pos--;
            if (pos < 2) pos = 9;
        }
        let resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
        if (resultado != digitos.charAt(0)) return false;
  
        tamanho = tamanho + 1;
        numeros = cnpj.substring(0,tamanho);
        soma = 0;
        pos = tamanho - 7;
        for (let i = tamanho; i >= 1; i--) {
            soma += numeros.charAt(tamanho - i) * pos--;
            if (pos < 2) pos = 9;
        }
        resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
        if (resultado != digitos.charAt(1)) return false;
        return true;
    }
  
    if(inputCNPJ) {
        inputCNPJ.addEventListener("input", (e) => {
            let v = e.target.value.replace(/\D/g,"");
            if(v.length > 14) v = v.slice(0,14);
            
            v = v.replace(/^(\d{2})(\d)/, "$1.$2");
            v = v.replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3");
            v = v.replace(/\.(\d{3})(\d)/, ".$1/$2");
            v = v.replace(/(\d{4})(\d)/, "$1-$2");
            e.target.value = v;
  
            if(v.length === 18) {
                const valido = validarCNPJ(v);
                showFeedback(inputCNPJ, "feedback-cnpj", valido);
            } else {
                resetFeedback(inputCNPJ, "feedback-cnpj");
            }
        });
  
        inputCNPJ.addEventListener("blur", () => {
            if(inputCNPJ.value.length > 0 && inputCNPJ.value.length < 18) {
                showFeedback(inputCNPJ, "feedback-cnpj", false);
            } else if(inputCNPJ.value.length === 18) {
                 showFeedback(inputCNPJ, "feedback-cnpj", validarCNPJ(inputCNPJ.value));
            }
        });
    }
  
    // --- MÁSCARA DE TELEFONE ---
    const inputTel = document.getElementById("telefone-cliente-cadastro");
    if(inputTel) {
        inputTel.addEventListener("input", (e) => {
           let v = e.target.value.replace(/\D/g,"");
           if(v.length > 11) v = v.slice(0,11);
           if(v.length > 10) v = v.replace(/^(\d{2})(\d{5})(\d{4}).*/, "($1) $2-$3");
           else if(v.length > 5) v = v.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, "($1) $2-$3");
           else if(v.length > 2) v = v.replace(/^(\d{2})(\d{0,5}).*/, "($1) $2");
           else v = v.replace(/^(\d*)/, "($1");
           e.target.value = v;
        });
    }
  
    // --- BUSCA CEP (ViaCEP) ---
    const inputCEP = document.getElementById("cep-cliente-cadastro");
    if(inputCEP) {
        inputCEP.addEventListener("input", (e) => {
            let v = e.target.value.replace(/\D/g,"");
            if(v.length > 8) v = v.slice(0,8);
            if(v.length > 5) v = v.replace(/^(\d{5})(\d)/, "$1-$2");
            e.target.value = v;
        });
        
        inputCEP.addEventListener("blur", async () => {
            const cep = inputCEP.value.replace(/\D/g, "");
            const feedback = document.getElementById("feedback-cep");
            
            if (cep.length === 8) {
                if(feedback) { feedback.style.display = "block"; feedback.innerText = "Buscando..."; }
                try {
                    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
                    const data = await response.json();
                    if (!data.erro) {
                        if(document.getElementById("logradouro-cliente-cadastro")) document.getElementById("logradouro-cliente-cadastro").value = data.logradouro;
                        if(document.getElementById("bairro-cliente-cadastro")) document.getElementById("bairro-cliente-cadastro").value = data.bairro;
                        if(document.getElementById("cidade-cliente-cadastro")) document.getElementById("cidade-cliente-cadastro").value = data.localidade;
                        if(document.getElementById("estado-cliente-cadastro")) document.getElementById("estado-cliente-cadastro").value = data.uf;
                        if(feedback) feedback.style.display = "none";
                        document.getElementById("numero-cliente-cadastro").focus();
                    } else {
                        if(feedback) feedback.innerText = "CEP não encontrado.";
                    }
                } catch (e) {
                    if(feedback) feedback.innerText = "Erro ao buscar CEP.";
                }
            }
        });
    }
  
    // --- VALIDAÇÃO DE SENHA (REQUISITOS) ---
    const senhaCadastro = document.getElementById("senha-cliente-cadastro");
    const confirmCadastro = document.getElementById("confirmar-senha-cliente-cadastro");
    const listaReq = document.getElementById("password-requirements");
    const matchError = document.getElementById("password-match-error");
  
    const reqLength = document.getElementById("req-length");
    const reqUpper = document.getElementById("req-upper");
    const reqLower = document.getElementById("req-lower");
    const reqSymbol = document.getElementById("req-symbol");
    const reqNumber = document.getElementById("req-number");
  
    function updateReqStatus(element, isValid) {
        if (isValid) {
            element.classList.remove("invalid");
            element.classList.add("valid");
            element.querySelector("i").className = "fas fa-check-circle";
        } else {
            element.classList.remove("valid");
            element.classList.add("invalid");
            element.querySelector("i").className = "fas fa-times-circle";
        }
    }
  
    if(senhaCadastro) {
        senhaCadastro.addEventListener("input", () => {
            const val = senhaCadastro.value;
            
            if(val.length > 0) listaReq.classList.add("visivel");
            else listaReq.classList.remove("visivel");
  
            updateReqStatus(reqLength, val.length >= 8 && val.length <= 70);
            updateReqStatus(reqUpper, /[A-Z]/.test(val));
            updateReqStatus(reqLower, /[a-z]/.test(val));
            updateReqStatus(reqSymbol, /[*!#$%&+\-\/:;=?@\\|]/.test(val));
            updateReqStatus(reqNumber, /[0-9]/.test(val));
            
            if(confirmCadastro.value.length > 0) checkMatch();
        });
    }
  
    function checkMatch() {
        if(senhaCadastro.value === confirmCadastro.value) {
            matchError.style.display = "none";
            confirmCadastro.style.borderColor = "var(--cor-sucesso)";
        } else {
            matchError.style.display = "block";
            confirmCadastro.style.borderColor = "var(--cor-erro)";
        }
    }
    if(confirmCadastro) confirmCadastro.addEventListener("input", checkMatch);
  
    // --- SUBMIT CADASTRO ---
    const formCadastro = document.querySelector("#area-cadastro .formulario-autenticacao");
    const modalSucesso = document.getElementById("modal-sucesso");
    const btnFecharModal = document.getElementById("btn-fechar-modal");
  
    if(formCadastro) {
        formCadastro.addEventListener("submit", (e) => {
            e.preventDefault();
            
            // Verificação Final: Tipo de Pessoa
            const tipo = document.querySelector('input[name="tipo-pessoa"]:checked').value;
            
            if(tipo === "pf") {
                if(!validarCPF(inputCPF.value)) {
                    alert("CPF inválido! Verifique o número digitado.");
                    inputCPF.focus();
                    return;
                }
            } else {
                if(!validarCNPJ(inputCNPJ.value)) {
                    alert("CNPJ inválido! Verifique o número digitado.");
                    inputCNPJ.focus();
                    return;
                }
            }
  
            // Verificação Final: Senha
            if(senhaCadastro.value !== confirmCadastro.value) {
                alert("As senhas não coincidem.");
                return;
            }
            
            // Se tudo ok, mostra modal
            if(modalSucesso) modalSucesso.classList.add("visivel");
        });
    }
  
    if(btnFecharModal) {
        btnFecharModal.addEventListener("click", () => {
            if(modalSucesso) modalSucesso.classList.remove("visivel");
            formCadastro.reset();
            // Volta para login
            if(areaCadastro && areaLogin) {
                areaCadastro.classList.remove("ativa");
                areaLogin.classList.add("ativa");
            }
        });
    }
    
    // --- SUBMIT LOGIN ---
    const formLogin = document.querySelector("#area-login .formulario-autenticacao");
    if(formLogin) {
        formLogin.addEventListener("submit", (e) => {
            e.preventDefault();
            alert("Login efetuado com sucesso! Redirecionando...");
        });
    }

    // --- SUBMIT RECUPERAÇÃO DE SENHA (Preservado) ---
    const formRecuperacao = document.querySelector("#area-recuperacao .formulario-autenticacao");
    if(formRecuperacao) {
        formRecuperacao.addEventListener("submit", (e) => {
            e.preventDefault();
            const emailInput = document.getElementById("email-recuperacao");
            const btnSubmit = formRecuperacao.querySelector("button");
            const textoOriginalBtn = btnSubmit.innerText;

            btnSubmit.innerText = "Enviando...";
            btnSubmit.disabled = true;
            btnSubmit.style.opacity = "0.7";

            const templateParams = {
                to_email: emailInput.value, 
                nome_cliente: "Cliente", 
                link_recuperacao: window.location.origin + "/redefinir-senha.html" 
            };

            emailjs.send('service_gbumuq7', 'template_pn7tk3g', templateParams)
                .then(function(response) {
                    alert(`Enviamos um link de recuperação para ${emailInput.value}. Verifique sua caixa de entrada e spam.`);
                    formRecuperacao.reset();
                    if(areaRecuperacao) areaRecuperacao.classList.remove("ativa");
                    if(areaLogin) areaLogin.classList.add("ativa");
                }, function(error) {
                    alert("Ocorreu um erro ao enviar o e-mail. Verifique a conexão e tente novamente.");
                })
                .finally(() => {
                    btnSubmit.innerText = textoOriginalBtn;
                    btnSubmit.disabled = false;
                    btnSubmit.style.opacity = "1";
                });
        });
    }
});