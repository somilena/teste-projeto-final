document.addEventListener("DOMContentLoaded", () => {
    // Captura parâmetros da URL
    const urlParams = new URLSearchParams(window.location.search);
    const isLogout = urlParams.get('logout');

    // Verifica se usuário já está logado via localStorage
    // MAS NÃO redireciona se estiver vindo de um logout
    const usuarioLogado = localStorage.getItem('prodcumaru_user');
    if (usuarioLogado && !isLogout) {
        const nextParam = urlParams.get('next') || '/portal';
        window.location.href = nextParam;
        return; // Para execução do resto do script
    }

    // Inicializa EmailJS quando disponível
    if (typeof emailjs !== "undefined") {
        emailjs.init({ publicKey: "goVdFclsaAUdwx1uQ" });
    } else {
        console.warn("EmailJS não carregado na página de login.");
    }

    // Captura parâmetro ?next para redirecionar após login
    const nextParam = urlParams.get('next');
    if (nextParam) {
        sessionStorage.setItem('prodcumaru_next', nextParam);
    }

    const destinoPosLogin = () => sessionStorage.getItem('prodcumaru_next') || '/portal';

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
        if (cartaoAutenticacao) cartaoAutenticacao.scrollIntoView({ behavior: 'smooth' });
    }

    // Navegação Login <-> Cadastro
    if (linkIrCadastro && linkIrLogin) {
        linkIrCadastro.addEventListener("click", (e) => {
            e.preventDefault();
            if (areaLogin) areaLogin.classList.remove("ativa");
            if (areaRecuperacao) areaRecuperacao.classList.remove("ativa");
            if (areaCadastro) areaCadastro.classList.add("ativa");
            rolarParaTopo();
        });

        linkIrLogin.addEventListener("click", (e) => {
            e.preventDefault();
            if (areaCadastro) areaCadastro.classList.remove("ativa");
            if (areaRecuperacao) areaRecuperacao.classList.remove("ativa");
            if (areaLogin) areaLogin.classList.add("ativa");
            rolarParaTopo();
        });
    }

    // Navegação Recuperação (Preservada)
    if (linkEsqueciSenha) {
        linkEsqueciSenha.addEventListener("click", (e) => {
            e.preventDefault();
            if (areaLogin) areaLogin.classList.remove("ativa");
            if (areaCadastro) areaCadastro.classList.remove("ativa");
            if (areaRecuperacao) areaRecuperacao.classList.add("ativa");
            rolarParaTopo();
        });
    }

    if (linkVoltarRec) {
        linkVoltarRec.addEventListener("click", (e) => {
            e.preventDefault();
            if (areaRecuperacao) areaRecuperacao.classList.remove("ativa");
            if (areaLogin) areaLogin.classList.add("ativa");
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
            if (e.target.value === "pf") {
                camposPF.style.display = "block";
                camposPJ.style.display = "none";
                // Limpa validações ao trocar
                if (inputCNPJ) { inputCNPJ.value = ""; resetFeedback(inputCNPJ, "feedback-cnpj"); }
            } else {
                camposPF.style.display = "none";
                camposPJ.style.display = "block";
                // Limpa validações ao trocar
                if (inputCPF) { inputCPF.value = ""; resetFeedback(inputCPF, "feedback-cpf"); }
            }
        });
    });

    // --- HELPER: RESETAR FEEDBACK VISUAL ---
    function resetFeedback(input, feedbackId) {
        input.style.borderColor = "var(--cor-borda)";
        const feedback = document.getElementById(feedbackId);
        if (feedback) feedback.style.display = "none";
    }

    function showFeedback(input, feedbackId, isValid) {
        const feedback = document.getElementById(feedbackId);
        if (isValid) {
            input.style.borderColor = "var(--cor-sucesso)";
            if (feedback) feedback.style.display = "none";
        } else {
            input.style.borderColor = "var(--cor-erro)";
            if (feedback) feedback.style.display = "block";
        }
    }

    // --- VALIDAÇÃO DE DATA DE NASCIMENTO ---
    function validarDataNascimento(data) {
        if (!data) return false;

        const partes = data.split('-');
        const ano = parseInt(partes[0], 10);
        const mes = parseInt(partes[1], 10);
        const dia = parseInt(partes[2], 10);

        // Verifica se o ano está entre 1900 e o ano atual - 18
        const anoAtual = new Date().getFullYear();
        const anoMinimo = 1900;
        const anoMaximo = anoAtual - 18; // Maioridade

        if (ano < anoMinimo || ano > anoMaximo) {
            return false;
        }

        // Verifica se é uma data válida
        const dataNasc = new Date(ano, mes - 1, dia);
        return dataNasc.getFullYear() === ano && dataNasc.getMonth() === mes - 1 && dataNasc.getDate() === dia;
    }

    // --- VALIDAÇÃO DE CARTÃO DE CRÉDITO (Luhn Algorithm) ---
    function validarCartao(numero) {
        numero = numero.replace(/\D/g, '');
        if (numero.length < 13 || numero.length > 19) return false;

        let soma = 0;
        let dobro = false;

        for (let i = numero.length - 1; i >= 0; i--) {
            let digito = parseInt(numero.charAt(i), 10);

            if (dobro) {
                digito *= 2;
                if (digito > 9) {
                    digito -= 9;
                }
            }

            soma += digito;
            dobro = !dobro;
        }

        return (soma % 10) === 0;
    }

    function validarValidadeCartao(mes, ano) {
        const mesAtual = new Date().getMonth() + 1;
        const anoAtual = new Date().getFullYear() % 100; // Últimos 2 dígitos

        const mesNum = parseInt(mes, 10);
        const anoNum = parseInt(ano, 10);

        if (anoNum > anoAtual) return true;
        if (anoNum === anoAtual && mesNum >= mesAtual) return true;

        return false;
    }

    // Validar campo de data de nascimento
    const inputDataNasc = document.getElementById('nascimento-cliente-cadastro');
    if (inputDataNasc) {
        inputDataNasc.addEventListener('blur', () => {
            if (inputDataNasc.value && !validarDataNascimento(inputDataNasc.value)) {
                alert('❌ Data de nascimento inválida! Você deve ter pelo menos 18 anos.');
                inputDataNasc.value = '';
                inputDataNasc.focus();
            }
        });
    }

    // --- VALIDAÇÃO CPF ---
    function validarCPF(cpf) {
        cpf = cpf.replace(/[^\d]+/g, '');
        if (cpf == '') return false;
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
        for (let i = 0; i < 9; i++) add += parseInt(cpf.charAt(i)) * (10 - i);
        let rev = 11 - (add % 11);
        if (rev == 10 || rev == 11) rev = 0;
        if (rev != parseInt(cpf.charAt(9))) return false;
        add = 0;
        for (let i = 0; i < 10; i++) add += parseInt(cpf.charAt(i)) * (11 - i);
        rev = 11 - (add % 11);
        if (rev == 10 || rev == 11) rev = 0;
        if (rev != parseInt(cpf.charAt(10))) return false;
        return true;
    }

    if (inputCPF) {
        inputCPF.addEventListener("input", (e) => {
            let v = e.target.value.replace(/\D/g, "");
            if (v.length > 11) v = v.slice(0, 11);

            v = v.replace(/(\d{3})(\d)/, "$1.$2");
            v = v.replace(/(\d{3})(\d)/, "$1.$2");
            v = v.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
            e.target.value = v;

            if (v.length === 14) {
                const valido = validarCPF(v);
                showFeedback(inputCPF, "feedback-cpf", valido);
            } else {
                resetFeedback(inputCPF, "feedback-cpf");
            }
        });

        inputCPF.addEventListener("blur", () => {
            if (inputCPF.value.length > 0 && inputCPF.value.length < 14) {
                showFeedback(inputCPF, "feedback-cpf", false);
            } else if (inputCPF.value.length === 14) {
                showFeedback(inputCPF, "feedback-cpf", validarCPF(inputCPF.value));
            }
        });
    }

    // --- VALIDAÇÃO CNPJ ---
    function validarCNPJ(cnpj) {
        cnpj = cnpj.replace(/[^\d]+/g, '');
        if (cnpj == '') return false;
        if (cnpj.length != 14) return false;
        if (/^(\d)\1+$/.test(cnpj)) return false;

        let tamanho = cnpj.length - 2
        let numeros = cnpj.substring(0, tamanho);
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
        numeros = cnpj.substring(0, tamanho);
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

    if (inputCNPJ) {
        inputCNPJ.addEventListener("input", (e) => {
            let v = e.target.value.replace(/\D/g, "");
            if (v.length > 14) v = v.slice(0, 14);

            v = v.replace(/^(\d{2})(\d)/, "$1.$2");
            v = v.replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3");
            v = v.replace(/\.(\d{3})(\d)/, ".$1/$2");
            v = v.replace(/(\d{4})(\d)/, "$1-$2");
            e.target.value = v;

            if (v.length === 18) {
                const valido = validarCNPJ(v);
                showFeedback(inputCNPJ, "feedback-cnpj", valido);
            } else {
                resetFeedback(inputCNPJ, "feedback-cnpj");
            }
        });

        inputCNPJ.addEventListener("blur", () => {
            if (inputCNPJ.value.length > 0 && inputCNPJ.value.length < 18) {
                showFeedback(inputCNPJ, "feedback-cnpj", false);
            } else if (inputCNPJ.value.length === 18) {
                showFeedback(inputCNPJ, "feedback-cnpj", validarCNPJ(inputCNPJ.value));
            }
        });
    }

    // --- MÁSCARA DE TELEFONE ---
    const inputTel = document.getElementById("telefone-cliente-cadastro");
    if (inputTel) {
        inputTel.addEventListener("input", (e) => {
            let v = e.target.value.replace(/\D/g, "");
            if (v.length > 11) v = v.slice(0, 11);
            if (v.length > 10) v = v.replace(/^(\d{2})(\d{5})(\d{4}).*/, "($1) $2-$3");
            else if (v.length > 5) v = v.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, "($1) $2-$3");
            else if (v.length > 2) v = v.replace(/^(\d{2})(\d{0,5}).*/, "($1) $2");
            else v = v.replace(/^(\d*)/, "($1");
            e.target.value = v;
        });
    }

    // --- BUSCA CEP (ViaCEP) ---
    const inputCEP = document.getElementById("cep-cliente-cadastro");
    if (inputCEP) {
        inputCEP.addEventListener("input", (e) => {
            let v = e.target.value.replace(/\D/g, "");
            if (v.length > 8) v = v.slice(0, 8);
            if (v.length > 5) v = v.replace(/^(\d{5})(\d)/, "$1-$2");
            e.target.value = v;
        });

        inputCEP.addEventListener("blur", async () => {
            const cep = inputCEP.value.replace(/\D/g, "");
            const feedback = document.getElementById("feedback-cep");

            if (cep.length === 8) {
                if (feedback) { feedback.style.display = "block"; feedback.innerText = "Buscando..."; }
                try {
                    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
                    const data = await response.json();
                    if (!data.erro) {
                        if (document.getElementById("logradouro-cliente-cadastro")) document.getElementById("logradouro-cliente-cadastro").value = data.logradouro;
                        if (document.getElementById("bairro-cliente-cadastro")) document.getElementById("bairro-cliente-cadastro").value = data.bairro;
                        if (document.getElementById("cidade-cliente-cadastro")) document.getElementById("cidade-cliente-cadastro").value = data.localidade;
                        if (document.getElementById("estado-cliente-cadastro")) document.getElementById("estado-cliente-cadastro").value = data.uf;
                        if (feedback) feedback.style.display = "none";
                        document.getElementById("numero-cliente-cadastro").focus();
                    } else {
                        if (feedback) feedback.innerText = "CEP não encontrado.";
                    }
                } catch (e) {
                    if (feedback) feedback.innerText = "Erro ao buscar CEP.";
                }
            }
        });
    }

    // --- VALIDAÇÃO DE SENHA (REQUISITOS) ---
    const senhaCadastro = document.getElementById("senha-cliente-cadastro");
    const confirmCadastro = document.getElementById("confirmar-senha-cliente-cadastro");
    const listaReq = document.getElementById("lista-requisitos-senha");
    const matchError = document.getElementById("erro-senha-confirmacao");

    const reqLength = document.getElementById("requisito-tamanho");
    const reqUpper = document.getElementById("requisito-maiuscula");
    const reqLower = document.getElementById("requisito-minuscula");
    const reqSymbol = document.getElementById("requisito-simbolo");
    const reqNumber = document.getElementById("requisito-numero");

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

    if (senhaCadastro) {
        senhaCadastro.addEventListener("input", () => {
            const val = senhaCadastro.value;

            if (val.length > 0) listaReq.classList.add("visivel");
            else listaReq.classList.remove("visivel");

            updateReqStatus(reqLength, val.length >= 8 && val.length <= 70);
            updateReqStatus(reqUpper, /[A-Z]/.test(val));
            updateReqStatus(reqLower, /[a-z]/.test(val));
            updateReqStatus(reqSymbol, /[*!#$%&+\-\/:;=?@\\|]/.test(val));
            updateReqStatus(reqNumber, /[0-9]/.test(val));

            if (confirmCadastro.value.length > 0) checkMatch();
        });
    }

    function checkMatch() {
        if (senhaCadastro.value === confirmCadastro.value) {
            matchError.style.display = "none";
            confirmCadastro.style.borderColor = "var(--cor-sucesso)";
        } else {
            matchError.style.display = "block";
            confirmCadastro.style.borderColor = "var(--cor-erro)";
        }
    }
    if (confirmCadastro) confirmCadastro.addEventListener("input", checkMatch);

    // --- SUBMIT CADASTRO ---
    const formCadastro = document.querySelector("#area-cadastro .formulario-autenticacao");
    const modalSucesso = document.getElementById("modal-sucesso");
    const btnFecharModal = document.getElementById("btn-fechar-modal");

    if (formCadastro) {
        formCadastro.addEventListener("submit", async (e) => {
            e.preventDefault();

            // Verificação Final: Tipo de Pessoa
            const tipo = document.querySelector('input[name="tipo-pessoa"]:checked').value;

            if (tipo === "pf") {
                if (!validarCPF(inputCPF.value)) {
                    alert("CPF inválido! Verifique o número digitado.");
                    inputCPF.focus();
                    return;
                }

                // Valida data de nascimento
                const dataNasc = document.getElementById('nascimento-cliente-cadastro').value;
                if (!validarDataNascimento(dataNasc)) {
                    alert("Data de nascimento inválida! Você deve ter pelo menos 18 anos.");
                    return;
                }
            } else {
                if (!validarCNPJ(inputCNPJ.value)) {
                    alert("CNPJ inválido! Verifique o número digitado.");
                    inputCNPJ.focus();
                    return;
                }
            }

            // Verificação Final: Senha
            if (senhaCadastro.value !== confirmCadastro.value) {
                alert("As senhas não coincidem.");
                return;
            }

            // Preparar dados para envio
            const btnSubmit = formCadastro.querySelector("button");
            btnSubmit.disabled = true;
            btnSubmit.innerText = "Cadastrando...";

            const dadosCadastro = {
                tipo_pessoa: tipo,
                email: document.getElementById('email-cliente-cadastro').value,
                telefone: document.getElementById('telefone-cliente-cadastro').value,
                cep: document.getElementById('cep-cliente-cadastro').value,
                logradouro: document.getElementById('logradouro-cliente-cadastro').value,
                numero: document.getElementById('numero-cliente-cadastro').value,
                bairro: document.getElementById('bairro-cliente-cadastro').value,
                cidade: document.getElementById('cidade-cliente-cadastro').value,
                estado: document.getElementById('estado-cliente-cadastro').value,
                senha: senhaCadastro.value
            };

            if (tipo === 'pf') {
                dadosCadastro.nome = document.getElementById('nome-cliente-cadastro').value;
                dadosCadastro.cpf = inputCPF.value;
                dadosCadastro.data_nasc = document.getElementById('nascimento-cliente-cadastro').value;
            } else {
                dadosCadastro.razao_social = document.getElementById('razao-social-cadastro').value;
                dadosCadastro.cnpj = inputCNPJ.value;
            }

            try {
                const response = await fetch('/api/cadastro-cliente', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(dadosCadastro)
                });

                const data = await response.json();

                if (data.success) {
                    // Mostra modal de sucesso
                    if (modalSucesso) modalSucesso.classList.add("visivel");
                } else {
                    alert(data.message || "Erro ao cadastrar. Tente novamente.");
                    btnSubmit.disabled = false;
                    btnSubmit.innerText = "Criar Conta";
                }
            } catch (error) {
                console.error('Erro no cadastro:', error);
                alert("Erro ao tentar cadastrar. Tente novamente.");
                btnSubmit.disabled = false;
                btnSubmit.innerText = "Criar Conta";
            }
        });
    }

    if (btnFecharModal) {
        btnFecharModal.addEventListener("click", () => {
            if (modalSucesso) modalSucesso.classList.remove("visivel");
            formCadastro.reset();
            // Volta para login
            if (areaCadastro && areaLogin) {
                areaCadastro.classList.remove("ativa");
                areaLogin.classList.add("ativa");
            }
        });
    }

    // --- SUBMIT LOGIN ---
    const formLogin = document.querySelector("#area-login .formulario-autenticacao");
    if (formLogin) {
        formLogin.addEventListener("submit", async (e) => {
            e.preventDefault();

            const email = document.getElementById('email-cliente-login').value;
            const senha = document.getElementById('senha-cliente-login').value;
            const btnSubmit = formLogin.querySelector("button");

            btnSubmit.disabled = true;
            btnSubmit.innerText = "Entrando...";

            try {
                const response = await fetch('/api/login-cliente', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, senha })
                });

                const data = await response.json();

                if (data.success) {
                    alert("Login efetuado com sucesso!");
                    // Salva dados do usuário no localStorage
                    localStorage.setItem('prodcumaru_user', JSON.stringify(data.user));
                    // Redireciona para a rota informada em ?next ou portal
                    const destino = destinoPosLogin();
                    sessionStorage.removeItem('prodcumaru_next');
                    window.location.href = destino;
                } else {
                    alert(data.message || "Email ou senha incorretos");
                    btnSubmit.disabled = false;
                    btnSubmit.innerText = "Entrar";
                }
            } catch (error) {
                console.error('Erro no login:', error);
                alert("Erro ao tentar fazer login. Tente novamente.");
                btnSubmit.disabled = false;
                btnSubmit.innerText = "Entrar";
            }
        });
    }

    // --- SUBMIT RECUPERAÇÃO DE SENHA (Preservado) ---
    const formRecuperacao = document.querySelector("#area-recuperacao .formulario-autenticacao");
    if (formRecuperacao) {
        formRecuperacao.addEventListener("submit", (e) => {
            e.preventDefault();
            const emailInput = document.getElementById("email-recuperacao");
            const btnSubmit = formRecuperacao.querySelector("button");
            const textoOriginalBtn = btnSubmit.innerText;

            btnSubmit.innerText = "Enviando...";
            btnSubmit.disabled = true;
            btnSubmit.style.opacity = "0.7";

            const templateParams = {
                user_email: emailInput.value, // To Email deve ser esta variável no EmailJS
                nome_cliente: emailInput.value || "Cliente",
                link_recuperacao: window.location.origin + "/redefinir-senha.html"
            };

            const SERVICE_ID_RESET = window.EMAILJS_SERVICE_ID_RESET || 'service_gbumuq7';
            const TEMPLATE_ID_RESET = window.EMAILJS_TEMPLATE_ID_RESET || 'template_pn7tk3g';

            emailjs.send(SERVICE_ID_RESET, TEMPLATE_ID_RESET, templateParams)
                .then(function (response) {
                    alert(`Enviamos um link de recuperação para ${emailInput.value}. Verifique sua caixa de entrada e spam.`);
                    formRecuperacao.reset();
                    if (areaRecuperacao) areaRecuperacao.classList.remove("ativa");
                    if (areaLogin) areaLogin.classList.add("ativa");
                }, function (error) {
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