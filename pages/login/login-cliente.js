document.addEventListener("DOMContentLoaded", () => {
  // Inicializa o EmailJS
  emailjs.init("sKNWZz25ssC3juxgY"); // Substitua pela sua Public Key do EmailJS

  // Seletores atualizados para os IDs do cliente
  const areaLogin = document.getElementById("area-login");
  const areaCadastro = document.getElementById("area-cadastro");
  const linkIrCadastro = document.getElementById("link-ir-cadastro");
  const linkIrLogin = document.getElementById("link-ir-login");
  const subtituloPrincipal = document.getElementById(
    "subtitulo-login-cadastro"
  );

  // --- INÍCIO: NOVOS SELETORES PF/PJ ---
  const radioTipoPF = document.getElementById("tipo-pf");
  const radioTipoPJ = document.getElementById("tipo-pj");
  const camposPF = document.getElementById("campos-pf");
  const camposPJ = document.getElementById("campos-pj");

  // Inputs obrigatórios que mudam
  const nomePF = document.getElementById("nome-cliente-cadastro");
  const cpfPF = document.getElementById("cpf-cliente-cadastro");
  const nascimentoPF = document.getElementById("nascimento-cliente-cadastro");
  const razaoSocPJ = document.getElementById("razao-social-cadastro");
  const cnpjPJ = document.getElementById("cnpj-cliente-cadastro");
  // --- FIM: NOVOS SELETORES PF/PJ ---

  // --- INÍCIO: NOVOS SELETORES DE ENDEREÇO ---
  const inputCEP = document.getElementById("cep-cliente-cadastro");
  const btnBuscarCEP = document.getElementById("botao-buscar-cep");
  const inputLogradouro = document.getElementById("logradouro-cliente-cadastro");
  const inputNumero = document.getElementById("numero-cliente-cadastro");
  const inputBairro = document.getElementById("bairro-cliente-cadastro");
  const inputCidade = document.getElementById("cidade-cliente-cadastro");
  const inputEstado = document.getElementById("estado-cliente-cadastro");
  // --- FIM: NOVOS SELETORES DE ENDEREÇO ---

  // --- INÍCIO: NOVOS SELETORES DE FEEDBACK ---
  const feedbackCPF = document.getElementById("feedback-cpf");
  const feedbackCNPJ = document.getElementById("feedback-cnpj");
  // --- FIM: NOVOS SELETORES DE FEEDBACK ---

  // Função para alternar entre login e cadastro
  function alternarFormularios(mostrarLogin) {
    if (mostrarLogin) {
      areaLogin.classList.add("ativa");
      areaCadastro.classList.remove("ativa");
      subtituloPrincipal.textContent = "Acesse seus projetos e agendamentos";
    } else {
      areaLogin.classList.remove("ativa");
      areaCadastro.classList.add("ativa");
      subtituloPrincipal.textContent = "Crie sua conta de cliente";
    }
  }

  // Event listeners para os links de alternância (lógica idêntica)
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

  // Lógica para mostrar/esconder senha (lógica idêntica)
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

  // --- INÍCIO: LÓGICA DO SELETOR PF/PJ ---
  function atualizarTipoPessoa(tipo) {
    if (tipo === "pf") {
      camposPF.style.display = "block";
      camposPJ.style.display = "none";
      // Define campos PF como obrigatórios
      nomePF.required = true;
      cpfPF.required = true;
      nascimentoPF.required = true;
      // Define campos PJ como não obrigatórios
      razaoSocPJ.required = false;
      cnpjPJ.required = false;
      // Limpa validação de CNPJ se estava visível
      cnpjPJ.classList.remove("invalido");
      feedbackCNPJ.classList.remove("visivel");
    } else { // tipo === "pj"
      camposPF.style.display = "none";
      camposPJ.style.display = "block";
      // Define campos PF como não obrigatórios
      nomePF.required = false;
      cpfPF.required = false;
      nascimentoPF.required = false;
      // Define campos PJ como obrigatórios
      razaoSocPJ.required = true;
      cnpjPJ.required = true;
      // Limpa validação de CPF se estava visível
      cpfPF.classList.remove("invalido");
      feedbackCPF.classList.remove("visivel");
    }
  }

  if (radioTipoPF) {
    radioTipoPF.addEventListener("change", () => atualizarTipoPessoa("pf"));
  }
  if (radioTipoPJ) {
    radioTipoPJ.addEventListener("change", () => atualizarTipoPessoa("pj"));
  }
  
  // Garante o estado inicial correto (PF)
  if (camposPF) { // Verifica se estamos na página certa
    atualizarTipoPessoa("pf");
  }
  // --- FIM: LÓGICA DO SELETOR PF/PJ ---

  // --- INÍCIO: MÁSCARA DE TELEFONE ---
  const inputTelefone = document.getElementById('telefone-cliente-cadastro');

  if (inputTelefone) {
    inputTelefone.addEventListener('input', (e) => {
      let value = e.target.value.replace(/\D/g, ''); 
      value = value.substring(0, 11); 
      let formattedValue = '';
      if (value.length > 10) {
        formattedValue = value.replace(/^(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
      } else if (value.length > 6) {
        formattedValue = value.replace(/^(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
      } else if (value.length > 2) {
        formattedValue = value.replace(/^(\d{2})(\d{0,5})/, '($1) $2');
      } else if (value.length > 0) {
        formattedValue = value.replace(/^(\d{0,2})/, '($1');
      }
      e.target.value = formattedValue;
    });
  }
  // --- FIM: MÁSCARA DE TELEFONE ---

  // --- INÍCIO: MÁSCARA DE CPF ---
  if (cpfPF) {
    cpfPF.addEventListener('input', (e) => {
      let value = e.target.value.replace(/\D/g, ''); // Só números
      value = value.substring(0, 11);
      
      let formattedValue = value;
      if (value.length > 9) {
        formattedValue = value.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
      } else if (value.length > 6) {
        formattedValue = value.replace(/^(\d{3})(\d{3})(\d{3})/, '$1.$2.$3');
      } else if (value.length > 3) {
        formattedValue = value.replace(/^(\d{3})(\d{3})/, '$1.$2');
      }
      e.target.value = formattedValue;
    });
  }
  // --- FIM: MÁSCARA DE CPF ---

  // --- INÍCIO: MÁSCARA DE CNPJ ---
  if (cnpjPJ) {
    cnpjPJ.addEventListener('input', (e) => {
      let value = e.target.value.replace(/\D/g, ''); // Só números
      value = value.substring(0, 14);

      let formattedValue = value;
      if (value.length > 12) {
        formattedValue = value.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
      } else if (value.length > 8) {
        formattedValue = value.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})/, '$1.$2.$3/$4');
      } else if (value.length > 5) {
        formattedValue = value.replace(/^(\d{2})(\d{3})(\d{3})/, '$1.$2.$3');
      } else if (value.length > 2) {
        formattedValue = value.replace(/^(\d{2})(\d{3})/, '$1.$2');
      }
      e.target.value = formattedValue;
    });
  }
  // --- FIM: MÁSCARA DE CNPJ ---

  // --- INÍCIO: MÁSCARA E BUSCA DE CEP ---
  if (inputCEP) {
    // 1. Máscara do CEP
    inputCEP.addEventListener('input', (e) => {
      let value = e.target.value.replace(/\D/g, ''); // Remove não-números
      value = value.substring(0, 8); // Limita a 8 dígitos
      if (value.length > 5) {
        value = value.replace(/^(\d{5})(\d{0,3})/, '$1-$2'); // Formato 00000-000
      }
      e.target.value = value;
    });

    // 2. Lógica de Busca (API ViaCEP)
    const buscarEnderecoPorCEP = async (cep) => {
      const cepLimpo = cep.replace(/\D/g, ''); // Garante que só números sejam enviados
      if (cepLimpo.length !== 8) {
        alert("CEP inválido. Deve conter 8 dígitos.");
        return;
      }

      try {
        const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
        const data = await response.json();

        if (data.erro) {
          alert("CEP não encontrado.");
          inputLogradouro.value = "";
          inputBairro.value = "";
          inputCidade.value = "";
          inputEstado.value = "";
        } else {
          // Preenche os campos
          inputLogradouro.value = data.logradouro;
          inputBairro.value = data.bairro;
          inputCidade.value = data.localidade;
          inputEstado.value = data.uf;
          // Foca no campo "Número", que o usuário deve preencher
          inputNumero.focus(); 
        }
      } catch (error) {
        alert("Erro ao buscar o CEP. Tente novamente.");
        console.error("Erro na API ViaCEP:", error);
      }
    };

    // Adiciona o evento ao botão
    if (btnBuscarCEP) {
      btnBuscarCEP.addEventListener('click', () => {
        buscarEnderecoPorCEP(inputCEP.value);
      });
    }
  }
  // --- FIM: MÁSCARA E BUSCA DE CEP ---

  // --- INÍCIO: FUNÇÕES DE VALIDAÇÃO CPF/CNPJ (Lógica de cálculo) ---

  function validarCPF(cpf) {
    cpf = cpf.replace(/\D/g, ''); // Remove não-números
    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false; // Verifica tamanho e se é '000...'

    let soma = 0;
    let resto;

    for (let i = 1; i <= 9; i++) {
      soma += parseInt(cpf.substring(i - 1, i)) * (11 - i);
    }
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.substring(9, 10))) return false;

    soma = 0;
    for (let i = 1; i <= 10; i++) {
      soma += parseInt(cpf.substring(i - 1, i)) * (12 - i);
    }
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.substring(10, 11))) return false;

    return true;
  }

  function validarCNPJ(cnpj) {
    cnpj = cnpj.replace(/\D/g, '');
    if (cnpj.length !== 14 || /^(\d)\1{13}$/.test(cnpj)) return false;

    let tamanho = cnpj.length - 2;
    let numeros = cnpj.substring(0, tamanho);
    let digitos = cnpj.substring(tamanho);
    let soma = 0;
    let pos = tamanho - 7;

    for (let i = tamanho; i >= 1; i--) {
      soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
      if (pos < 2) pos = 9;
    }
    let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    if (resultado !== parseInt(digitos.charAt(0))) return false;

    tamanho = tamanho + 1;
    numeros = cnpj.substring(0, tamanho);
    soma = 0;
    pos = tamanho - 7;
    for (let i = tamanho; i >= 1; i--) {
      soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
      if (pos < 2) pos = 9;
    }
    resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    if (resultado !== parseInt(digitos.charAt(1))) return false;

    return true;
  }
  // --- FIM: FUNÇÕES DE VALIDAÇÃO CPF/CNPJ (Lógica de cálculo) ---

  // --- INÍCIO: FUNÇÕES DE VALIDAÇÃO DE CAMPO (UI) ---
  function validarCampoCPF() {
    const valor = cpfPF.value;
    // Só valida se o campo estiver completamente preenchido (14 chars com máscara)
    if (valor.length === 0) { 
        cpfPF.classList.remove("invalido");
        feedbackCPF.classList.remove("visivel");
        return true; // Campo vazio é "válido" (o 'required' cuida disso no submit)
    }
    
    if (validarCPF(valor)) {
        // Válido
        cpfPF.classList.remove("invalido");
        feedbackCPF.classList.remove("visivel");
        return true;
    } else {
        // Inválido
        cpfPF.classList.add("invalido");
        feedbackCPF.classList.add("visivel");
        return false;
    }
  }

  function validarCampoCNPJ() {
    const valor = cnpjPJ.value;
    if (valor.length === 0) {
        cnpjPJ.classList.remove("invalido");
        feedbackCNPJ.classList.remove("visivel");
        return true;
    }

    if (validarCNPJ(valor)) {
        // Válido
        cnpjPJ.classList.remove("invalido");
        feedbackCNPJ.classList.remove("visivel");
        return true;
    } else {
        // Inválido
        cnpjPJ.classList.add("invalido");
        feedbackCNPJ.classList.add("visivel");
        return false;
    }
  }
  
  // Adiciona os eventos de 'blur' (ao sair do campo)
  if(cpfPF) cpfPF.addEventListener('blur', validarCampoCPF);
  if(cnpjPJ) cnpjPJ.addEventListener('blur', validarCampoCNPJ);
  // --- FIM: FUNÇÕES DE VALIDAÇÃO DE CAMPO (UI) ---

  // Lógica para envio de formulário de login
  const formLogin = document.querySelector("#area-login .formulario-autenticacao");
  if (formLogin) {
    formLogin.addEventListener("submit", (e) => {
      e.preventDefault();
      alert(
        "Login de Cliente efetuado (simulação)! Redirecionando para o Portal do Cliente..."
      );
      window.location.href = "/pages/portal-cliente/portal-cliente.html";
    });
  }

  // Lógica para envio de formulário de cadastro COM ENVIO DE E-MAIL
  const formCadastro = document.querySelector("#area-cadastro .formulario-autenticacao");
  if (formCadastro) {
    formCadastro.addEventListener("submit", (e) => {
      e.preventDefault();

      // Validação do formulário
      let formValido = true;
      if (radioTipoPF.checked) {
        if (!validarCampoCPF()) {
          formValido = false;
          cpfPF.focus();
        }
      } else if (radioTipoPJ.checked) {
        if (!validarCampoCNPJ()) {
          formValido = false;
          cnpjPJ.focus();
        }
      }
      
      const primeiroCampoInvalido = formCadastro.querySelector(':invalid');
      
      if (!formValido) {
        alert("CPF/CNPJ inválido. Por favor, verifique o campo em vermelho.");
        return;
      }
      
      if (primeiroCampoInvalido) {
        alert("Por favor, preencha todos os campos obrigatórios (*).");
        primeiroCampoInvalido.focus();
        return;
      }

      // --- ENVIO DE E-MAIL DE CONFIRMAÇÃO ---
      const nomeCliente = nomePF.value || razaoSocPJ.value;
      const emailCliente = document.getElementById("email-cliente-cadastro").value;
      const tipoCliente = radioTipoPF.checked ? "Pessoa Física" : "Pessoa Jurídica";
      const telefoneCliente = document.getElementById("telefone-cliente-cadastro").value;

      // Prepara os parâmetros para o template do EmailJS
      const templateParams = {
        nome_cliente: nomeCliente,
        email_cliente: emailCliente,
        tipo_cliente: tipoCliente,
        telefone_cliente: telefoneCliente,
        data_cadastro: new Date().toLocaleDateString('pt-BR'),
        hora_cadastro: new Date().toLocaleTimeString('pt-BR'),
        assunto: "Confirmação de Cadastro - SGA Cumaru Produções"
      };

      // Desativa o botão para evitar cliques duplos
      const submitButton = formCadastro.querySelector('.botao-autenticacao');
      const originalText = submitButton.textContent;
      submitButton.disabled = true;
      submitButton.textContent = 'Enviando...';

      // Envia o e-mail usando EmailJS
      // IMPORTANTE: Substitua pelas suas credenciais do EmailJS
      emailjs.send('service_6krepp3', 'template_2x1dy0g', templateParams, 'sKNWZz25ssC3juxgY')
        .then((response) => {
          console.log('E-mail de confirmação enviado!', response.status, response.text);
          
          // Sucesso - mostra mensagem e redireciona para login
          alert("Cadastro realizado com sucesso! Um e-mail de confirmação foi enviado para " + emailCliente);
          
          // Limpa o formulário e volta para o login
          alternarFormularios(true);
          formCadastro.reset();
          atualizarTipoPessoa("pf");
          
        }, (error) => {
          console.error('Falha no envio do e-mail:', error);
          
          // Ainda assim o cadastro é considerado realizado, mas avisa sobre o e-mail
          alert("Cadastro realizado! (Obs: Houve um erro ao enviar o e-mail de confirmação). Você já pode fazer login.");
          
          // Limpa o formulário e volta para o login
          alternarFormularios(true);
          formCadastro.reset();
          atualizarTipoPessoa("pf");
        })
        .finally(() => {
          // Re-ativa o botão em qualquer caso
          submitButton.disabled = false;
          submitButton.textContent = originalText;
        });
    });
  }
});