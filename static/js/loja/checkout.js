console.log('🚀 checkout.js carregado!');

document.addEventListener("DOMContentLoaded", () => {
    console.log('✅ DOMContentLoaded disparado');

    // 1. Carrega carrinho
    let cart = JSON.parse(localStorage.getItem("epent_cart")) || [];
    console.log('🛒 Carrinho carregado:', cart.length, 'itens');
    let shippingCost = 0; // Variável global de frete

    // Chamada inicial para verificar se já existe usuário logado
    checkUserStatus();

    // =========================================================
    // --- LÓGICA DE USUÁRIO (CENÁRIOS A, B e C) ---
    // =========================================================

    function checkUserStatus() {
        // Tenta pegar o usuário do localStorage (salvo no login)
        const userData = JSON.parse(localStorage.getItem("prodcumaru_user"));

        const passwordBox = document.querySelector(".portal-access-box");
        const loginRow = document.querySelector(".checkout-login-row");
        const billingSection = document.querySelector(".billing-details-col");

        if (userData) {
            console.log("Usuário logado identificado:", userData.nome);

            // 1. Preencher campos automaticamente
            if (document.getElementById('full-name')) document.getElementById('full-name').value = userData.nome || "";
            if (document.getElementById('email')) document.getElementById('email').value = userData.email || "";
            if (document.getElementById('phone')) document.getElementById('phone').value = userData.telefone || "";

            // Se tiver endereço salvo:
            if (userData.endereco) {
                if (document.getElementById('postcode')) document.getElementById('postcode').value = userData.endereco.cep || "";
                if (document.getElementById('address-1')) document.getElementById('address-1').value = userData.endereco.rua || "";
                if (document.getElementById('address-number')) document.getElementById('address-number').value = userData.endereco.numero || "";
                if (document.getElementById('address-district')) document.getElementById('address-district').value = userData.endereco.bairro || "";
                if (document.getElementById('city')) document.getElementById('city').value = userData.endereco.cidade || "";
                if (document.getElementById('state')) document.getElementById('state').value = userData.endereco.estado || "";

                // Disparar o evento 'blur' do CEP para calcular frete automaticamente
                if (document.getElementById('postcode') && document.getElementById('postcode').value) {
                    document.getElementById('postcode').dispatchEvent(new Event('blur'));
                }
            }

            // 2. Esconder seção de criar senha (já tem conta)
            if (passwordBox) passwordBox.style.display = "none";

            // 3. Remover a obrigatoriedade dos campos de senha
            const passInput = document.getElementById('account-password');
            const confirmInput = document.getElementById('account-password-confirm');
            if (passInput) passInput.removeAttribute('required');
            if (confirmInput) confirmInput.removeAttribute('required');

            // 4. Esconder link de login e seletor PF/PJ
            if (loginRow) loginRow.style.display = "none";

            // 4.1 Se o usuário tem tipo salvo, aplicar PF/PJ
            if (userData.tipo && typeof userData.tipo === 'string') {
                const tipoNormalizado = userData.tipo.toLowerCase();
                if (tipoNormalizado === 'pj' || tipoNormalizado === 'juridica' || tipoNormalizado === 'juridico') {
                    setPersonType('pj');
                } else {
                    setPersonType('pf');
                }
            }

            // 5. NOVO: Adicionar resumo do usuário e ocultar formulário
            if (billingSection) {
                // Criar card de resumo do usuário
                const userSummaryCard = document.createElement('div');
                userSummaryCard.className = 'user-summary-card';
                userSummaryCard.innerHTML = `
                    <div class="user-summary-header">
                        <i class="fas fa-user-check"></i>
                        <div>
                            <h3>Olá, ${userData.nome}!</h3>
                            <p>Seus dados estão salvos</p>
                        </div>
                    </div>
                    <div class="user-summary-info">
                        <div class="info-row">
                            <i class="fas fa-envelope"></i>
                            <span>${userData.email}</span>
                        </div>
                        ${userData.telefone ? `
                        <div class="info-row">
                            <i class="fas fa-phone"></i>
                            <span>${userData.telefone}</span>
                        </div>
                        ` : ''}
                        ${userData.endereco ? `
                        <div class="info-row">
                            <i class="fas fa-map-marker-alt"></i>
                            <span>${userData.endereco.rua}, ${userData.endereco.numero} - ${userData.endereco.cidade}/${userData.endereco.estado}</span>
                        </div>
                        ` : ''}
                    </div>
                    <button type="button" class="btn-edit-data" onclick="toggleBillingForm()">
                        <i class="fas fa-edit"></i> Alterar dados
                    </button>
                `;

                // Inserir o card antes do formulário
                const formFields = billingSection.querySelectorAll('.form-field, .form-row');
                billingSection.insertBefore(userSummaryCard, billingSection.children[1]);

                // Ocultar todos os campos do formulário, mantendo loginRow e senha escondidos sempre
                formFields.forEach(field => {
                    if (!field.classList.contains('user-summary-card')) {
                        field.style.display = 'none';
                        // Remove required de campos ocultos
                        const inputs = field.querySelectorAll('input, select, textarea');
                        inputs.forEach(input => input.removeAttribute('required'));
                    }
                });
                if (loginRow) loginRow.style.display = 'none';
                if (passwordBox) passwordBox.style.display = 'none';

                // Criar função global para toggle
                window.toggleBillingForm = function () {
                    const isHidden = formFields[0].style.display === 'none';
                    formFields.forEach(field => {
                        if (!field.classList.contains('user-summary-card')) {
                            field.style.display = isHidden ? 'block' : 'none';

                            // Se está mostrando, adiciona required nos campos importantes
                            if (isHidden) {
                                const inputs = field.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"]');
                                inputs.forEach(input => {
                                    // Adiciona required exceto para campos opcionais
                                    if (input.id !== 'address-2') { // complemento é opcional
                                        input.setAttribute('required', 'required');
                                    }
                                });
                            } else {
                                // Se está ocultando, remove required
                                const inputs = field.querySelectorAll('input, select, textarea');
                                inputs.forEach(input => input.removeAttribute('required'));
                            }
                        }
                    });
                    // Garantir que login e senha continuem ocultos
                    if (loginRow) loginRow.style.display = 'none';
                    if (passwordBox) passwordBox.style.display = 'none';

                    const btnEdit = document.querySelector('.btn-edit-data');
                    if (btnEdit) {
                        btnEdit.innerHTML = isHidden ?
                            '<i class="fas fa-check"></i> Confirmar alterações' :
                            '<i class="fas fa-edit"></i> Alterar dados';
                    }
                };
            }

        } else {
            // Cenário C: Novo Usuário - adiciona required nos campos de senha
            if (passwordBox) {
                passwordBox.style.display = "block";
                const passwordField = document.getElementById('account-password');
                const confirmPasswordField = document.getElementById('account-password-confirm');
                if (passwordField) passwordField.setAttribute('required', 'required');
                if (confirmPasswordField) confirmPasswordField.setAttribute('required', 'required');
            }
        }
    }

    // =========================================================
    // --- LÓGICA DE PESSOA FÍSICA / JURÍDICA (TOGGLE) ---
    // =========================================================
    const btnPF = document.getElementById('btn-pf');
    const btnPJ = document.getElementById('btn-pj');
    const inputType = document.getElementById('person-type');

    const labelName = document.getElementById('label-name');
    const inputName = document.getElementById('full-name');

    const labelDoc = document.getElementById('label-doc');
    const inputDoc = document.getElementById('doc-number');
    const errorDoc = document.getElementById('doc-error');

    function setPersonType(type) {
        if (type === 'pf') {
            btnPF.classList.add('active');
            btnPJ.classList.remove('active');
            inputType.value = 'pf';

            labelName.innerHTML = 'Nome Completo <span>*</span>';
            inputName.placeholder = 'Digite seu nome completo';

            labelDoc.innerHTML = 'CPF <span>*</span>';
            inputDoc.placeholder = '000.000.000-00';
            inputDoc.maxLength = 14;
            errorDoc.innerText = "CPF inválido";
        } else {
            btnPJ.classList.add('active');
            btnPF.classList.remove('active');
            inputType.value = 'pj';

            labelName.innerHTML = 'Razão Social <span>*</span>';
            inputName.placeholder = 'Razão Social da Empresa';

            labelDoc.innerHTML = 'CNPJ <span>*</span>';
            inputDoc.placeholder = '00.000.000/0000-00';
            inputDoc.maxLength = 18;
            errorDoc.innerText = "CNPJ inválido";
        }

        // Limpa campo e erro ao trocar
        inputDoc.value = '';
        errorDoc.style.display = 'none';
        inputDoc.style.borderColor = '#333';
    }

    if (btnPF && btnPJ) {
        btnPF.addEventListener('click', () => setPersonType('pf'));
        btnPJ.addEventListener('click', () => setPersonType('pj'));
    }

    // =========================================================
    // --- MÁSCARAS E VALIDAÇÃO (CPF/CNPJ/TELEFONE) ---
    // =========================================================

    // Máscara de Telefone
    const phoneInput = document.getElementById("phone");
    if (phoneInput) {
        phoneInput.addEventListener('input', function (e) {
            let value = e.target.value.replace(/\D/g, "");
            if (value.length > 11) value = value.slice(0, 11);
            if (value.length > 10) {
                value = value.replace(/^(\d{2})(\d{5})(\d{4}).*/, "($1) $2-$3");
            } else if (value.length > 5) {
                value = value.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, "($1) $2-$3");
            } else if (value.length > 2) {
                value = value.replace(/^(\d{2})(\d{0,5}).*/, "($1) $2");
            } else {
                value = value.replace(/^(\d*)/, "($1");
            }
            e.target.value = value;
        });
    }

    // Funções Auxiliares de Validação
    function validarCPF(cpf) {
        cpf = cpf.replace(/[^\d]+/g, '');
        if (cpf == '') return false;
        if (cpf.length != 11 || /^(\d)\1{10}$/.test(cpf)) return false;
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

    function validarCNPJ(cnpj) {
        cnpj = cnpj.replace(/[^\d]+/g, '');
        if (cnpj == '') return false;
        if (cnpj.length != 14) return false;
        // Validação simples de tamanho e dígitos repetidos
        if (/^(\d)\1+$/.test(cnpj)) return false;

        // Algoritmo de validação
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

    function validateDocumentField() {
        if (!inputDoc) return true;
        const rawValue = inputDoc.value.replace(/\D/g, "");
        const type = inputType.value; // 'pf' ou 'pj'
        let isValid = false;

        if (rawValue.length === 0) {
            inputDoc.style.borderColor = "#333";
            errorDoc.style.display = "none";
            return false;
        }

        if (type === 'pf') {
            if (rawValue.length === 11) isValid = validarCPF(rawValue);
        } else {
            if (rawValue.length === 14) isValid = validarCNPJ(rawValue);
        }

        if (isValid) {
            inputDoc.style.borderColor = "#2ecc71"; // Verde
            errorDoc.style.display = "none";
        } else {
            inputDoc.style.borderColor = "#ff5555"; // Vermelho
            errorDoc.style.display = "block";
            errorDoc.innerText = (type === 'pf') ? "CPF Inválido" : "CNPJ Inválido";
        }
        return isValid;
    }

    // Aplicar Máscara ao Digitar
    if (inputDoc) {
        inputDoc.addEventListener('input', (e) => {
            let v = e.target.value.replace(/\D/g, "");
            const type = inputType.value;

            if (type === 'pf') {
                // Máscara CPF: 000.000.000-00
                if (v.length > 11) v = v.slice(0, 11);
                v = v.replace(/(\d{3})(\d)/, "$1.$2");
                v = v.replace(/(\d{3})(\d)/, "$1.$2");
                v = v.replace(/(\d{3})(\d{1,2})$/, "$1-$2");

                e.target.value = v;

                if (v.length === 14) validateDocumentField();
                else {
                    inputDoc.style.borderColor = "#333";
                    errorDoc.style.display = "none";
                }
            } else {
                // Máscara CNPJ: 00.000.000/0000-00
                if (v.length > 14) v = v.slice(0, 14);
                v = v.replace(/^(\d{2})(\d)/, "$1.$2");
                v = v.replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3");
                v = v.replace(/\.(\d{3})(\d)/, ".$1/$2");
                v = v.replace(/(\d{4})(\d)/, "$1-$2");

                e.target.value = v;

                if (v.length === 18) validateDocumentField();
                else {
                    inputDoc.style.borderColor = "#333";
                    errorDoc.style.display = "none";
                }
            }
        });

        inputDoc.addEventListener('blur', () => {
            if (inputDoc.value.length > 0) validateDocumentField();
        });
    }

    // =========================================================
    // --- CÁLCULO DE FRETE (VIACEP) ---
    // =========================================================
    const cepInput = document.getElementById("postcode");
    const shippingElement = document.getElementById("order-shipping");

    if (cepInput) {
        cepInput.addEventListener("blur", async () => {
            const cep = cepInput.value.replace(/\D/g, "");
            if (cep.length === 8) {
                if (shippingElement) shippingElement.innerText = "Calculando...";
                try {
                    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
                    const data = await response.json();

                    if (!data.erro) {
                        // Preenche endereço
                        if (document.getElementById("address-1")) document.getElementById("address-1").value = data.logradouro;
                        if (document.getElementById("address-district")) document.getElementById("address-district").value = data.bairro;
                        if (document.getElementById("city")) document.getElementById("city").value = data.localidade;
                        if (document.getElementById("state")) document.getElementById("state").value = data.uf;
                        if (document.getElementById("address-number")) document.getElementById("address-number").focus();

                        // Simulação de frete fixo
                        shippingCost = 25.00;
                        if (shippingElement) shippingElement.innerText = `R$ ${shippingCost.toFixed(2).replace('.', ',')}`;
                    } else {
                        alert("CEP não encontrado.");
                        shippingCost = 0;
                        if (shippingElement) shippingElement.innerText = "CEP inválido";
                    }
                } catch (error) {
                    shippingCost = 0;
                    if (shippingElement) shippingElement.innerText = "Erro no cálculo";
                }
                updateOrderTotal();
            }
        });
    }

    // =========================================================
    // --- RENDERIZAR RESUMO DO PEDIDO ---
    // =========================================================
    const orderItemsContainer = document.getElementById("order-items-body");
    const orderTotalElement = document.getElementById("order-total");
    const orderSubtotalElement = document.getElementById("order-subtotal");
    const installmentsSelect = document.getElementById("installments");

    function renderCheckoutItems() {
        if (!orderItemsContainer) return;
        orderItemsContainer.innerHTML = "";
        let itemsTotal = 0;

        if (cart.length === 0) {
            orderItemsContainer.innerHTML = '<tr><td colspan="2" style="text-align:center; padding:20px;">Seu carrinho está vazio.</td></tr>';
        } else {
            cart.forEach((item) => {
                const itemTotal = item.price * item.qty;
                itemsTotal += itemTotal;

                const variantText = item.variant ? ` - ${item.variant}` : '';

                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>
                        <div style="display: flex; align-items: center; gap: 15px;">
                            <img src="${item.image}" alt="${item.title}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px; background: #222;">
                            <div>
                                <strong style="font-size: 13px; display: block; color: var(--white);">${item.title}${variantText}</strong>
                                <small style="color: var(--muted);">Qtd: ${item.qty}</small>
                            </div>
                        </div>
                    </td>
                    <td style="font-weight: 500; color: var(--muted);">R$ ${itemTotal.toFixed(2).replace(".", ",")}</td>
                `;
                orderItemsContainer.appendChild(row);
            });
        }
        if (orderSubtotalElement) orderSubtotalElement.textContent = `R$ ${itemsTotal.toFixed(2).replace(".", ",")}`;
        updateOrderTotal();
    }

    function updateOrderTotal() {
        let itemsTotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
        let finalTotal = itemsTotal + shippingCost;

        if (orderTotalElement) orderTotalElement.textContent = `R$ ${finalTotal.toFixed(2).replace(".", ",")}`;

        if (installmentsSelect) {
            for (let i = 1; i <= 3; i++) {
                const val = finalTotal / i;
                const opt = installmentsSelect.querySelector(`option[value="${i}"]`);
                if (opt) opt.textContent = `${i}x de R$ ${val.toFixed(2).replace('.', ',')} (sem juros)`;
            }
        }
    }

    renderCheckoutItems();

    // =========================================================
    // --- VALIDAÇÃO DE SENHA ---
    // =========================================================
    const passInput = document.getElementById("account-password");
    const confirmInput = document.getElementById("account-password-confirm");
    const listaReq = document.getElementById("password-requirements");

    if (passInput) {
        passInput.addEventListener("input", () => {
            const val = passInput.value;
            if (val.length > 0) listaReq.classList.add("visivel");
            else listaReq.classList.remove("visivel");

            // Validações visuais
            updateReqStatus(document.getElementById("req-length"), val.length >= 8 && val.length <= 70);
            updateReqStatus(document.getElementById("req-upper"), /[A-Z]/.test(val));
            updateReqStatus(document.getElementById("req-lower"), /[a-z]/.test(val));
            updateReqStatus(document.getElementById("req-symbol"), /[*!#$%&+\-\/:;=?@\\|]/.test(val));
            updateReqStatus(document.getElementById("req-number"), /[0-9]/.test(val));
        });
    }

    function updateReqStatus(element, isValid) {
        if (!element) return;
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

    // =========================================================
    // --- PAGAMENTO E SUBMIT DO PEDIDO (CORRIGIDO) ---
    // =========================================================

    // Toggle Visual Cartão/Pix
    const radiosPayment = document.querySelectorAll('input[name="payment_method"]');
    const detailsCard = document.getElementById("details-card");
    const detailsPix = document.getElementById("details-pix");
    const cardInputs = detailsCard ? detailsCard.querySelectorAll('input[type="text"]') : [];

    // Inicial: nenhum pagamento selecionado, esconde cartão e remove required
    if (detailsCard) detailsCard.style.display = "none";
    cardInputs.forEach(input => input.removeAttribute("required"));
    if (detailsPix) detailsPix.style.display = "none";

    if (radiosPayment.length > 0) {
        radiosPayment.forEach(r => {
            r.addEventListener("change", (e) => {
                if (e.target.value === 'card') {
                    if (detailsCard) detailsCard.style.display = "block";
                    if (detailsPix) detailsPix.style.display = "none";
                    cardInputs.forEach(input => input.setAttribute("required", "true"));
                } else {
                    if (detailsCard) detailsCard.style.display = "none";
                    if (detailsPix) {
                        detailsPix.style.display = "block";
                        const pixKey = 'c' + Math.random().toString(16).substr(2, 8).toUpperCase();
                        detailsPix.innerHTML = `
                            <p style="font-size:14px; color: var(--muted); margin-top:10px;">
                                <i class="fas fa-qrcode"></i> Use a chave aleatória abaixo:
                            </p>
                            <div style="background: var(--bg); padding: 10px; border: 1px dashed var(--accent); margin-top: 10px; text-align: center; border-radius: 4px;">
                                <strong style="color: var(--white);">${pixKey}</strong>
                            </div>
                        `;
                    }
                    cardInputs.forEach(input => input.removeAttribute("required"));
                }
            });
        });
    }

    const checkoutForm = document.querySelector(".checkout-form");
    const successModal = document.getElementById("success-modal");

    console.log('🔍 Procurando formulário .checkout-form:', checkoutForm ? 'ENCONTRADO' : 'NÃO ENCONTRADO');
    console.log('🔍 Procurando modal #success-modal:', successModal ? 'ENCONTRADO' : 'NÃO ENCONTRADO');

    if (checkoutForm) {
        console.log('✅ Registrando evento de submit no formulário');
        checkoutForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            console.log('=== INICIANDO CHECKOUT ===');

            // Verifica se usuário está logado
            const userData = JSON.parse(localStorage.getItem("prodcumaru_user"));
            console.log('👤 Usuário logado:', userData ? 'SIM' : 'NÃO');

            // Log de campos obrigatórios visíveis
            const requiredFields = checkoutForm.querySelectorAll('[required]');
            console.log('📋 Total de campos obrigatórios:', requiredFields.length);
            if (requiredFields.length > 0) {
                console.log('⚠️ Campos obrigatórios encontrados:');
                requiredFields.forEach(field => {
                    const isVisible = field.offsetParent !== null;
                    console.log(`  - ${field.id || field.name}: ${isVisible ? 'VISÍVEL' : 'OCULTO'} - valor: "${field.value}"`);
                });
            }

            // 1. Validar CPF/CNPJ apenas se usuário NÃO está logado
            if (!userData) {
                if (!validateDocumentField()) {
                    alert("Documento inválido. Verifique o CPF/CNPJ.");
                    inputDoc.focus();
                    return;
                }
                console.log('✓ CPF/CNPJ válido');
            } else {
                console.log('✓ Usuário logado - validação de documento pulada');
            }

            // 2. Montar dados REAIS do pedido
            const metodoPagamentoRadio = document.querySelector('input[name="payment_method"]:checked');
            if (!metodoPagamentoRadio) {
                alert("Selecione uma forma de pagamento (Cartão ou Pix)");
                return;
            }
            console.log('✓ Forma de pagamento selecionada');
            const nomePagamento = metodoPagamentoRadio.nextElementSibling.innerText.trim();

            const itemsSubtotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
            const totalFinal = itemsSubtotal + shippingCost;

            const tipoPessoa = document.getElementById('person-type') ? document.getElementById('person-type').value : 'pf';

            // Dados do pedido - usa dados do usuário logado se disponível, senão pega do formulário
            let dadosPedido;

            if (userData) {
                console.log('✓ Usando dados do usuário logado');
                dadosPedido = {
                    nome: userData.nome,
                    email: userData.email,
                    telefone: userData.telefone || '',
                    cpf: userData.cpf || '',
                    cnpj: userData.cnpj || '',
                    cep: userData.endereco?.cep || '',
                    logradouro: userData.endereco?.rua || '',
                    numero: userData.endereco?.numero || '',
                    bairro: userData.endereco?.bairro || '',
                    complemento: userData.endereco?.complemento || '',
                    cidade: userData.endereco?.cidade || '',
                    estado: userData.endereco?.estado || '',
                    observacao: nomePagamento,
                    subtotal: itemsSubtotal,
                    frete: shippingCost,
                    total: totalFinal,
                    forma_pagamento: nomePagamento,
                    produtos: cart.map(item => ({
                        id: item.id,
                        nome: item.title,
                        quantidade: item.qty,
                        preco: item.price
                    }))
                };
            } else {
                console.log('✓ Usando dados do formulário (novo usuário)');
                dadosPedido = {
                    nome: document.getElementById('full-name').value,
                    email: document.getElementById('email').value,
                    telefone: document.getElementById('phone').value,
                    cpf: tipoPessoa === 'pf' ? document.getElementById('doc-number').value : '',
                    cnpj: tipoPessoa === 'pj' ? document.getElementById('doc-number').value : '',
                    cep: document.getElementById('postcode').value,
                    logradouro: document.getElementById('address-1').value,
                    numero: document.getElementById('address-number').value,
                    bairro: document.getElementById('address-district').value,
                    complemento: document.getElementById('address-2') ? document.getElementById('address-2').value : '',
                    cidade: document.getElementById('city').value,
                    estado: document.getElementById('state').value,
                    observacao: nomePagamento,
                    subtotal: itemsSubtotal,
                    frete: shippingCost,
                    total: totalFinal,
                    forma_pagamento: nomePagamento,
                    produtos: cart.map(item => ({
                        id: item.id,
                        nome: item.title,
                        quantidade: item.qty,
                        preco: item.price
                    }))
                };
            }

            // Desabilita botão para evitar duplo clique
            const btnSubmit = checkoutForm.querySelector('button[type="submit"]');
            if (btnSubmit) {
                btnSubmit.disabled = true;
                btnSubmit.textContent = "Processando...";
            }

            console.log('📦 Dados do pedido:', dadosPedido);

            try {
                // 3. Envia para o backend
                console.log('📡 Enviando para /api/pedido...');
                const response = await fetch('/api/pedido', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(dadosPedido)
                });

                console.log('📥 Resposta recebida:', response.status, response.statusText);

                // Tenta ler JSON; se falhar, lança texto da resposta
                let resultado;
                try {
                    resultado = await response.json();
                    console.log('📋 Resultado JSON:', resultado);
                } catch (err) {
                    console.error('❌ Erro ao parsear JSON:', err);
                    const texto = await response.text();
                    console.error('📄 Resposta em texto:', texto);
                    throw new Error(texto || 'Erro desconhecido ao processar pedido');
                }

                console.log('🔍 Verificando resposta:', { ok: response.ok, status: response.status, resultado });

                if (resultado.success) {
                    console.log('✅ PEDIDO APROVADO! Número:', resultado.numero_pedido);

                    // Limpa carrinho
                    localStorage.removeItem("epent_cart");

                    // Mostra modal de sucesso
                    console.log('🎉 Tentando abrir modal...');
                    const modalElement = document.getElementById("success-modal");
                    console.log('📍 Elemento modal encontrado:', modalElement);

                    if (modalElement) {
                        // Preenche email no modal se existir
                        const emailElement = document.getElementById("modal-user-email");
                        if (emailElement) {
                            emailElement.textContent = dadosPedido.email;
                        }

                        // Adiciona classe open
                        modalElement.classList.add("open");
                        console.log('✓ Classe "open" adicionada:', modalElement.classList.contains('open'));
                        console.log('✓ Classes do modal:', modalElement.className);

                        // Envia e-mail de confirmação em background
                        const dadosDoEmail = {
                            cliente: dadosPedido.nome,
                            email: dadosPedido.email,
                            numero: resultado.numero_pedido,
                            produtos: cart.map(item => ({
                                nome: item.title,
                                quantidade: item.qty,
                                preco: item.price
                            })),
                            subtotal: itemsSubtotal,
                            frete: shippingCost,
                            total: totalFinal,
                            pagamento: nomePagamento,
                            endereco: `${dadosPedido.logradouro}, ${dadosPedido.numero} - ${dadosPedido.bairro}, ${dadosPedido.cidade}/${dadosPedido.estado}`,
                            data: new Date().toLocaleDateString('pt-BR')
                        };
                        enviarConfirmacaoCompra(dadosDoEmail);

                    } else {
                        console.error('❌ Modal #success-modal NÃO encontrado no DOM!');
                        alert('Pedido realizado com sucesso! Número: ' + resultado.numero_pedido);
                    }

                } else {
                    console.error('❌ Pedido rejeitado:', resultado);
                    alert("Erro ao processar pedido: " + (resultado.message || 'Erro desconhecido'));
                    if (btnSubmit) {
                        btnSubmit.disabled = false;
                        btnSubmit.textContent = "Finalizar Pedido";
                    }
                }
            } catch (error) {
                console.error("❌ ERRO CRÍTICO:", error);
                alert("Erro ao processar pedido: " + error.message);
                if (btnSubmit) {
                    btnSubmit.disabled = false;
                    btnSubmit.textContent = "Finalizar Pedido";
                }
            }
        });
    }
});

// --- HELPERS ---
const formatarMoeda = (valor) => {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

/**
 * Função principal para processar e enviar os e-mails (ADM e Cliente)
 */
function enviarConfirmacaoCompra(pedido) {

    // 1. Gerar o HTML da lista de produtos (Linhas da Tabela)
    let produtosHTML = "";

    if (pedido.produtos && Array.isArray(pedido.produtos)) {
        pedido.produtos.forEach(prod => {
            produtosHTML += `
                <tr>
                    <td>${prod.nome}</td>
                    <td>${prod.quantidade}</td>
                    <td>${formatarMoeda(prod.preco)}</td>
                </tr>
            `;
        });
    }

    // 2. Preparar os parâmetros (DADOS)
    // Note que adicionamos 'user_email' para o template do cliente funcionar
    const templateParams = {
        user_email: pedido.email, // IMPORTANTE: É assim que o EmailJS sabe para quem enviar o 2º email
        cliente: pedido.cliente,
        numero_pedido: pedido.numero,
        data: pedido.data,
        pagamento: pedido.pagamento,
        endereco: pedido.endereco,
        produtos: produtosHTML,
        subtotal: formatarMoeda(pedido.subtotal),
        frete: formatarMoeda(pedido.frete),
        total: formatarMoeda(pedido.total)
    };

    // 3. Configurações dos IDs
    const SERVICE_ID = window.EMAILJS_SERVICE_ID || "service_uxchflv";

    // Template para o ADMINISTRADOR e para o CLIENTE (ambos usando template_o9o56ce)
    const TEMPLATE_ID_ADM = window.EMAILJS_TEMPLATE_ID_ADMIN || "template_o9o56ce";
    const TEMPLATE_ID_CLIENTE = window.EMAILJS_TEMPLATE_ID_CLIENTE || "template_o9o56ce";

    // Verifica se o emailjs foi carregado
    if (typeof emailjs !== 'undefined') {
        if (window.EMAILJS_PUBLIC_KEY) {
            emailjs.init({ publicKey: window.EMAILJS_PUBLIC_KEY });
        }

        // --- ENVIO 1: Para o Administrador ---
        emailjs.send(SERVICE_ID, TEMPLATE_ID_ADM, templateParams)
            .then(function (response) {
                console.log('E-mail ADM enviado com sucesso!');
            }, function (error) {
                console.error('Erro ao enviar e-mail ADM:', error);
            });

        // --- ENVIO 2: Para o Cliente ---
        // Só envia se tivermos o ID do novo template configurado
        if (TEMPLATE_ID_CLIENTE && TEMPLATE_ID_CLIENTE !== "COLOQUE_O_ID_DO_NOVO_TEMPLATE_AQUI") {
            emailjs.send(SERVICE_ID, TEMPLATE_ID_CLIENTE, templateParams)
                .then(function (response) {
                    console.log('E-mail Cliente enviado com sucesso!');
                }, function (error) {
                    console.error('Erro ao enviar e-mail Cliente:', error);
                });
        } else {
            console.warn("Template de cliente não configurado (EMAILJS_TEMPLATE_ID_CLIENTE). Apenas email do ADM será enviado.");
        }

    } else {
        console.warn("EmailJS não carregado. Nenhum e-mail será enviado.");
    }
}