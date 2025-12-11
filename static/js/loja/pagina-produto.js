/* ================================================================= */
/* ARQUIVO: pagina-produto.js (Detalhes, Tamanho, Galeria, Avaliação) */
/* ================================================================= */

// 1. BANCO DE DADOS COMPLETO
const productsDB = {
    1: {
        id: 1,
        title: "Camiseta Cumaru",
        price: 89.90,
        description: "Modelagem oversized exclusiva, tecido 100% algodão premium e estampa em silk de alta definição. Conforto e atitude para suas produções.",
        images: ["/static/img/produtos-loja/camiseta1.1.png", "/static/img/produtos-loja/camiseta1.2.png", "/static/img/produtos-loja/camiseta1.png"],
        hasSizes: true,
        category: "vestuario"
    },
    2: {
        id: 2,
        title: "Moletom Cumaru",
        price: 119.90,
        description: "Moletom canguru com capuz, interior flanelado e acabamento reforçado. Perfeito para dias frios com muito estilo.",
        images: ["/static/img/produtos-loja/moletom1.png", "/static/img/produtos-loja/moletom.png", "/static/img/produtos-loja/moletom2.png"],
        hasSizes: true,
        category: "vestuario"
    },
    3: {
        id: 3,
        title: "Boné Dad Hat",
        price: 55.00,
        description: "Boné estilo Dad Hat com bordado frontal de alta qualidade. Fecho ajustável e tecido confortável.",
        images: ["/static/img/produtos-loja/bone.frontal.png", "/static/img/produtos-loja/bone.lateral.png", "/static/img/produtos-loja/bone.tras.png"],
        hasSizes: false,
        category: "acessorios"
    },
    4: {
        id: 4,
        title: "Copo Cumaru",
        price: 45.00,
        description: "Copo térmico de fibra de bambu com tampa de silicone. Ideal para café ou chá, mantendo a temperatura e o estilo.",
        images: ["/static/img/produtos-loja/copo.cumaru.png"],
        hasSizes: false,
        category: "acessorios"
    },
    5: {
        id: 5,
        title: "Chaveiro Metal",
        price: 25.00,
        description: "Chaveiro de metal com o logo da ProdCumaru em relevo. Um acessório durável e elegante.",
        images: ["/static/img/produtos-loja/chaveiro.cumaru.png"],
        hasSizes: false,
        category: "acessorios"
    },
    6: {
        id: 6,
        title: "Álbum",
        price: 15.00,
        description: "Álbum físico oficial. Encarte especial com letras e fotos exclusivas da produção.",
        images: ["/static/img/produtos-loja/album.png"],
        hasSizes: false,
        category: "acessorios"
    }
};

document.addEventListener("DOMContentLoaded", () => {

    // --- 2. CARREGAR DADOS DO PRODUTO ATUAL ---
    const path = window.location.pathname;
    const productId = parseInt(path.split('/').pop()) || 1;
    const product = productsDB[productId];

    if (product) {
        // Preencher Textos
        document.querySelector(".product-info-area h1").textContent = product.title;
        document.querySelector(".sale-price").textContent = "R$ " + product.price.toFixed(2).replace('.', ',');
        document.querySelector(".description-short").textContent = product.description;

        // Exibir categoria
        const catDisplay = document.getElementById("category-display");
        if (catDisplay) catDisplay.textContent = product.category === "vestuario" ? "Vestuário" : "Acessórios";

        // Atualizar Breadcrumb
        const breadcrumbSpan = document.querySelector(".breadcrumb span");
        if (breadcrumbSpan) breadcrumbSpan.textContent = product.title;

        // Preencher Imagem Principal
        const mainImg = document.getElementById("product-image-main");
        if (mainImg) mainImg.src = product.images[0];

        // Gerar Miniaturas
        const thumbsContainer = document.querySelector(".product-thumbs-column");
        if (thumbsContainer) {
            thumbsContainer.innerHTML = "";
            product.images.forEach((src, index) => {
                const img = document.createElement("img");
                img.src = src;
                img.className = `thumb-item ${index === 0 ? 'active' : ''}`;
                img.onclick = function () { window.changeImage(this); };
                thumbsContainer.appendChild(img);
            });
        }

        // Opções de Tamanho
        const optionsDiv = document.querySelector(".product-options");
        if (optionsDiv) {
            optionsDiv.style.display = product.hasSizes ? "block" : "none";
        }

        // --- 3. RENDERIZAR PRODUTOS RELACIONADOS ---
        renderRelatedProducts(productId);
    }

    // --- 4. FUNÇÃO DE TROCA DE IMAGEM ---
    window.changeImage = function (element) {
        document.getElementById("product-image-main").src = element.src;
        document.querySelectorAll(".thumb-item").forEach(t => t.classList.remove("active"));
        element.classList.add("active");
    };

    // --- 5. LÓGICA DE SELEÇÃO DE TAMANHO ---
    const sizeBtns = document.querySelectorAll(".size-btn");
    const sizeDisplay = document.getElementById("selected-size-display");
    const errorMsg = document.getElementById("size-error-msg");
    let selectedSize = null;

    sizeBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            sizeBtns.forEach(b => b.classList.remove("selected"));
            btn.classList.add("selected");
            selectedSize = btn.dataset.size;
            if (sizeDisplay) {
                sizeDisplay.textContent = selectedSize;
                sizeDisplay.style.color = "#fff";
                sizeDisplay.style.fontWeight = "700";
            }
            if (errorMsg) errorMsg.style.display = "none";
        });
    });

    // --- 6. ADICIONAR AO CARRINHO (Botão Principal) ---
    const productForm = document.querySelector(".quantity-control");
    const successMessage = document.getElementById("add-to-cart-message");

    if (productForm) {
        productForm.addEventListener("submit", (e) => {
            e.preventDefault();

            if (product.hasSizes && !selectedSize) {
                if (errorMsg) {
                    errorMsg.style.display = "block";
                    errorMsg.parentElement.animate([
                        { transform: 'translateX(0)' }, { transform: 'translateX(-5px)' },
                        { transform: 'translateX(5px)' }, { transform: 'translateX(0)' }
                    ], { duration: 300 });
                }
                return;
            }

            const qtyInput = document.getElementById("qty-input");
            const qty = qtyInput ? parseInt(qtyInput.value) : 1;

            if (typeof addToCart === 'function') {
                addToCart({
                    id: product.id,
                    title: product.title,
                    price: product.price,
                    image: product.images[0]
                }, qty, selectedSize);

                if (successMessage) {
                    successMessage.classList.add("show");
                    setTimeout(() => successMessage.classList.remove("show"), 3000);
                }
            }
        });
    }

    // --- 7. HELPER: RENDERIZAR RELACIONADOS (Texto Alterado) ---
    function renderRelatedProducts(currentId) {
        const grid = document.getElementById("related-grid");
        if (!grid) return;

        grid.innerHTML = "";
        const currentProduct = productsDB[currentId];

        if (!currentProduct || !currentProduct.category) return;

        // FILTRO: Mesma categoria, diferente ID
        const related = Object.values(productsDB)
            .filter(p => p.id !== currentId && p.category === currentProduct.category)
            .slice(0, 4);

        if (related.length === 0) {
            grid.innerHTML = '<p style="color:#777; width:100%;">Não há outros produtos relacionados nesta categoria.</p>';
            return;
        }

        related.forEach(p => {
            const article = document.createElement("article");
            article.className = "product";

            // ✅ LINKS CORRIGIDOS AQUI
            article.innerHTML = `
                <div class="thumb" onclick="(function(){ const pref=(window.ROUTES&&window.ROUTES.produtoPrefix)?window.ROUTES.produtoPrefix:'/produto/'; window.location.href=pref+'${p.id}'; })()" style="cursor:pointer">
                    <img src="${p.images[0]}" alt="${p.title}" class="active" style="width:100%; height:100%; object-fit:cover;">
                </div>
                
                <div class="product-info-row">
                    <h3><a href="${(window.ROUTES && window.ROUTES.produtoPrefix) ? window.ROUTES.produtoPrefix + p.id : '/produto/' + p.id}" class="product-title-link">${p.title}</a></h3>
                    <div class="price-info"><span class="price">R$ ${p.price.toFixed(2).replace('.', ',')}</span></div>
                </div>
                
                <div class="price-row" style="width: 100%; margin-top: 6px;"> 
                    <a href="${(window.ROUTES && window.ROUTES.produtoPrefix) ? window.ROUTES.produtoPrefix + p.id : '/produto/' + p.id}" class="btn btn-produto" style="text-decoration: none; display: flex; justify-content: center; align-items: center;">VER DETALHES</a>
                </div>
            `;
            grid.appendChild(article);
        });
    }

    // --- 8. FUNCIONALIDADES EXTRAS (ABAS, LIGHTBOX) ---
    const tabLinks = document.querySelectorAll(".tab-link");
    tabLinks.forEach(link => {
        link.addEventListener("click", () => {
            document.querySelectorAll(".tab-link, .tab-content").forEach(el => el.classList.remove("active"));
            link.classList.add("active");
            document.getElementById(link.dataset.tab).classList.add("active");
        });
    });

    const lightbox = document.getElementById("image-lightbox");
    const openBtn = document.getElementById("open-lightbox");
    const closeBtn = document.getElementById("lightbox-close");

    if (openBtn && lightbox) {
        openBtn.addEventListener("click", (e) => {
            e.preventDefault();
            document.getElementById("lightbox-image").src = document.getElementById("product-image-main").src;
            lightbox.classList.add("open");
        });
        closeBtn.addEventListener("click", () => lightbox.classList.remove("open"));
        lightbox.addEventListener("click", (e) => { if (e.target === lightbox) lightbox.classList.remove("open"); });
    }

    // --- 9. LÓGICA DE AVALIAÇÃO (ESTRELAS) ---
    const starInputs = document.querySelectorAll(".star-rating-input i");
    const ratingHiddenInput = document.getElementById("rating");

    if (starInputs.length > 0 && ratingHiddenInput) {
        starInputs.forEach(star => {
            star.addEventListener("click", function () {
                const value = this.getAttribute("data-rating");
                ratingHiddenInput.value = value;

                // Atualiza visualmente as estrelas
                starInputs.forEach(s => {
                    if (s.getAttribute("data-rating") <= value) {
                        s.classList.remove("far");
                        s.classList.add("fas");
                    } else {
                        s.classList.remove("fas");
                        s.classList.add("far");
                    }
                });
            });
        });
    }

    // --- 10. SUBMIT AVALIAÇÃO (ADICIONAR COMENTÁRIO) ---
    const reviewForm = document.querySelector(".review-form");
    const reviewList = document.querySelector(".review-list");

    if (reviewForm && reviewList) {
        reviewForm.addEventListener("submit", (e) => {
            e.preventDefault();

            // Pega valores
            const ratingVal = document.getElementById("rating").value || 5;
            const commentVal = document.getElementById("comment").value;
            const authorVal = document.getElementById("author").value;

            // Remove aviso "Não há avaliações"
            const noReviewMsg = reviewList.querySelector(".no-reviews");
            if (noReviewMsg) {
                noReviewMsg.remove();
            }

            // Gera estrelas
            let starsHtml = "";
            for (let i = 1; i <= 5; i++) {
                if (i <= ratingVal) starsHtml += '<i class="fas fa-star"></i>';
                else starsHtml += '<i class="far fa-star"></i>';
            }

            // Cria novo item
            const newReview = document.createElement("div");
            newReview.className = "review-item";
            newReview.innerHTML = `
                <div class="review-item-main">
                    <div class="review-avatar"><i class="fas fa-user-circle"></i></div>
                    <div class="review-content">
                        <div class="review-meta">
                            <span class="review-author">${authorVal}</span>
                            <div class="star-rating">${starsHtml}</div>
                        </div>
                        <div class="review-text"><p>${commentVal}</p></div>
                    </div>
                </div>
            `;

            reviewList.prepend(newReview);
            reviewForm.reset();
            starInputs.forEach(s => {
                s.classList.remove("fas");
                s.classList.add("far");
            });

            alert("Obrigado pela sua avaliação!");
        });
    }
});