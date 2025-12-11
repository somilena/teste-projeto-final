/* ================================================================= */
/* ARQUIVO: loja.js (Carrinho Global, Renderização da Loja, Drawer) */
/* ================================================================= */

/* --- 1. BANCO DE DADOS (Com Categorias, mas visual unificado) --- */
const productsData = [
  {
    id: 1,
    title: "Camiseta Oversized",
    price: 89.90,
    image: "/static/img/produtos-loja/camiseta1.1.png",
    images: ["/static/img/produtos-loja/camiseta1.1.png", "/static/img/produtos-loja/camiseta1.2.png", "/static/img/produtos-loja/camiseta1.png"],
    variants: ["P", "M", "G", "GG"],
    category: "vestuario"
  },
  {
    id: 2,
    title: "Moletom Cumaru",
    price: 119.90,
    image: "/static/img/produtos-loja/moletom1.png",
    images: ["/static/img/produtos-loja/moletom1.png", "/static/img/produtos-loja/moletom.png", "/static/img/produtos-loja/moletom2.png"],
    variants: ["P", "M", "G", "GG"],
    category: "vestuario"
  },
  {
    id: 3,
    title: "Boné Dad Hat",
    price: 55.00,
    image: "/static/img/produtos-loja/bone.frontal.png",
    images: ["/static/img/produtos-loja/bone.frontal.png", "/static/img/produtos-loja/bone.lateral.png", "/static/img/produtos-loja/bone.tras.png"],
    variants: null,
    category: "acessorios"
  },
  {
    id: 4,
    title: "Copo Cumaru",
    price: 45.00,
    image: "/static/img/produtos-loja/copo.cumaru.png",
    images: ["/static/img/produtos-loja/copo.cumaru.png"],
    variants: null,
    category: "acessorios"
  },
  {
    id: 5,
    title: "Chaveiro Metal",
    price: 25.00,
    image: "/static/img/produtos-loja/chaveiro.cumaru.png",
    images: ["/static/img/produtos-loja/chaveiro.cumaru.png"],
    variants: null,
    category: "acessorios"
  },
  {
    id: 6,
    title: "Álbum",
    price: 15.00,
    image: "/static/img/produtos-loja/album.png",
    images: ["/static/img/produtos-loja/album.png"],
    variants: null,
    category: "acessorios"
  }
];

/* --- 2. GERENCIAMENTO DO CARRINHO (CRUD) --- */
function getCart() {
  return JSON.parse(localStorage.getItem("epent_cart") || "[]");
}

function saveCart(cart) {
  localStorage.setItem("epent_cart", JSON.stringify(cart));
  updateCartUI();
}

let state = {
  products: productsData,
  cart: getCart(),
};

// Função Global: Adicionar ao Carrinho
function addToCart(p, qty = 1, variant = null) {
  const key = variant ? `${p.id}::${variant}` : `${p.id}`;
  const existing = state.cart.find((i) => i.key === key);

  if (existing) {
    existing.qty += qty;
  } else {
    state.cart.push({
      key,
      id: p.id,
      title: p.title,
      price: p.price,
      image: p.image,
      qty,
      variant
    });
  }
  saveCart(state.cart);
}

function removeFromCart(key) {
  state.cart = state.cart.filter((i) => i.key !== key);
  saveCart(state.cart);
}

function changeQty(key, change) {
  const item = state.cart.find((i) => i.key === key);
  if (item) {
    item.qty += change;
    if (item.qty <= 0) removeFromCart(key);
    else saveCart(state.cart);
  }
}

function formatBRL(n) {
  return `R$ ${n.toFixed(2).replace(".", ",")}`;
}

/* --- 3. INTERFACE DO CARRINHO (SIDEBAR) --- */
function updateCartUI() {
  const totalQty = state.cart.reduce((s, i) => s + i.qty, 0);
  const cartCount = document.getElementById("cart-count");
  if (cartCount) {
    cartCount.textContent = totalQty;
    cartCount.style.display = totalQty > 0 ? "flex" : "none";
  }

  const container = document.getElementById("cart-items");
  if (container) {
    container.innerHTML = "";

    if (state.cart.length === 0) {
      container.innerHTML = '<div style="padding:40px 0; text-align:center; color:#888;">Seu carrinho está vazio.</div>';
    } else {
      state.cart.forEach((item) => {
        const variantHtml = item.variant
          ? `<span style="display:block; font-size:12px; color:#c9c9c9; margin-top:2px;">Tamanho: <strong>${item.variant}</strong></span>`
          : '';

        const div = document.createElement("div");
        div.className = "cart-item";
        div.innerHTML = `
            <img src="${item.image}" alt="${item.title}">
            <div class="item-info">
                <a href="${(window.ROUTES && window.ROUTES.produtoPrefix) ? window.ROUTES.produtoPrefix + item.id : '/produto/' + item.id}" class="item-title">${item.title}</a>
                ${variantHtml}
                <span class="item-unit-price">${formatBRL(item.price)}</span>
                <div class="qty">
                    <button class="btn dec" onclick="changeQty('${item.key}', -1)">-</button>
                    <span>${item.qty}</span>
                    <button class="btn inc" onclick="changeQty('${item.key}', 1)">+</button>
                </div>
            </div>
            <div class="item-price-and-remove">
                <span class="item-total-price">${formatBRL(item.price * item.qty)}</span>
                <a href="#" class="remove-link" onclick="removeFromCart('${item.key}')">
                  <i class="fas fa-trash-alt"></i>
                </a>
            </div>
        `;
        container.appendChild(div);
      });
    }

    const subtotalEl = document.getElementById("cart-subtotal");
    const totalEl = document.getElementById("cart-total");
    if (subtotalEl) {
      const totalVal = state.cart.reduce((s, i) => s + i.price * i.qty, 0);
      subtotalEl.textContent = formatBRL(totalVal);
      if (totalEl) totalEl.textContent = formatBRL(totalVal);
    }
  }
}

/* --- 4. RENDERIZAÇÃO DA PÁGINA "LOJA" (VISUAL ORIGINAL - GRADE ÚNICA) --- */
function renderProducts() {
  const grid = document.getElementById("products-grid");
  if (!grid) return;

  grid.innerHTML = "";

  // Renderiza TODOS os produtos juntos, sem separar por categoria visualmente
  state.products.forEach((p) => {
    const el = document.createElement("article");
    el.className = "product";
    el.dataset.id = p.id;

    // Monta carrossel de imagens
    let imagesHtml = '';
    const imgsToRender = (p.images && p.images.length > 0) ? p.images : [p.image];
    imgsToRender.forEach((src, index) => {
      const activeClass = index === 0 ? 'active' : '';
      imagesHtml += `<img src="${src}" alt="${p.title}" class="${activeClass}">`;
    });

    // Gera o HTML do card
    el.innerHTML = `
        <div class="thumb" data-id="${p.id}">
            ${imagesHtml}
        </div>
        
        <div class="product-info-row">
            <h3><a href="${(window.ROUTES && window.ROUTES.produtoPrefix) ? window.ROUTES.produtoPrefix + p.id : '/produto/' + p.id}" class="product-title-link">${p.title}</a></h3>
            <div class="price-info">
                <span class="price">${formatBRL(p.price)}</span>
            </div>
        </div>
        
        <div class="price-row"> 
           <button class="btn btn-produto btn-add-home" data-id="${p.id}">ADICIONAR AO CARRINHO</button>
        </div>

        <div class="add-to-cart-message-loja">
            <i class="fas fa-check-circle"></i> Adicionado
        </div>
    `;
    grid.appendChild(el);
  });

  initProductHover();
  setupAddButtons();
}

function setupAddButtons() {
  const addButtons = document.querySelectorAll('.btn-add-home');
  addButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();

      const id = parseInt(btn.dataset.id);
      const product = state.products.find(p => p.id === id);

      if (product) {
        addToCart(product);
        const card = btn.closest('.product');
        const message = card.querySelector('.add-to-cart-message-loja');

        if (message) {
          message.classList.add('show');
          setTimeout(() => {
            message.classList.remove('show');
          }, 3000);
        }
      }
    });
  });
}

// Efeito de Hover nas imagens da loja
function initProductHover() {
  const products = document.querySelectorAll('.product');
  products.forEach(product => {
    const thumb = product.querySelector('.thumb');
    if (!thumb) return;

    thumb.style.cursor = "pointer";
    thumb.addEventListener("click", () => {
      const id = product.dataset.id;
      const prefix = (window.ROUTES && window.ROUTES.produtoPrefix) ? window.ROUTES.produtoPrefix : '/produto/';
      window.location.href = prefix + id;
    });

    const images = thumb.querySelectorAll('img');
    if (images.length <= 1) return;

    let interval;
    product.addEventListener('mouseenter', () => {
      interval = setInterval(() => {
        let activeIndex = 0;
        images.forEach((img, idx) => {
          if (img.classList.contains('active')) activeIndex = idx;
          img.classList.remove('active');
        });
        let nextIndex = (activeIndex + 1) % images.length;
        images[nextIndex].classList.add('active');
      }, 1200);
    });

    product.addEventListener('mouseleave', () => {
      clearInterval(interval);
      images.forEach(img => img.classList.remove('active'));
      if (images.length > 0) images[0].classList.add('active');
    });
  });
}

/* --- 5. GAVETA (DRAWER) --- */
function setupDrawer() {
  const drawer = document.getElementById("cart-drawer");
  const backdrop = document.getElementById("cart-backdrop");

  window.openCart = function () {
    if (drawer) { drawer.classList.add("open"); drawer.setAttribute("aria-hidden", "false"); }
    if (backdrop) backdrop.classList.add("open");
  }
  window.closeCart = function () {
    if (drawer) { drawer.classList.remove("open"); drawer.setAttribute("aria-hidden", "true"); }
    if (backdrop) backdrop.classList.remove("open");
  }

  const openBtn = document.getElementById("open-cart");
  if (openBtn) openBtn.onclick = (e) => { e.preventDefault(); openCart(); };

  const closeBtn = document.getElementById("close-cart");
  if (closeBtn) closeBtn.onclick = closeCart;

  if (backdrop) backdrop.onclick = closeCart;
}

// Inicialização
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("products-grid")) {
    renderProducts();
  }
  setupDrawer();
  updateCartUI();

  window.changeQty = changeQty;
  window.removeFromCart = removeFromCart;
  window.addToCart = addToCart;
});