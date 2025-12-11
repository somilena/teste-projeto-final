// --- FUNÇÕES GLOBAIS DE SINCRONIZAÇÃO ---
function getCart() {
  return JSON.parse(localStorage.getItem('epent_cart') || '[]');
}

function saveCart(cart) {
  localStorage.setItem('epent_cart', JSON.stringify(cart));
}

// --- FUNÇÃO PARA RENDERIZAR O CARRINHO A PARTIR DO LOCALSTORAGE ---
/* Substitua a função renderCartFromLocalStorage existente por esta: */

function renderCartFromLocalStorage() {
  const cart = getCart();
  const tableBody = document.getElementById('cart-table-body');

  // Limpa o conteúdo
  tableBody.innerHTML = '';

  if (cart.length === 0) {
    tableBody.innerHTML =
      '<tr><td colspan="4" style="text-align:center; padding: 40px; color: #fff;">Seu carrinho está vazio.</td></tr>';
    return;
  }

  cart.forEach(item => {
    const itemTotalPrice = item.price * item.qty;
    const row = document.createElement('tr');
    row.className = 'cart-item-row';
    row.setAttribute('data-key', item.key);

    // --- ALTERAÇÃO: Adiciona o HTML do tamanho (variant) ---
    const variantHtml = item.variant 
        ? `<div style="font-size: 13px; color: #888; margin-top: 4px;">Tamanho: <strong style="color: #ccc;">${item.variant}</strong></div>` 
        : '';

    row.innerHTML = `
      <td class="product-cell">
        <button type="button" class="remove-item-btn"><i class="fas fa-trash-alt"></i></button>
        
        <img src="${item.image}" alt="${item.title}">
        
        <div style="display:flex; flex-direction:column; justify-content:center;">
            <a href="pagina-produto.html" class="product-name-link">${item.title}</a>
            ${variantHtml}
        </div>
      </td>
      <td class="product-price" data-price="${item.price}">R$ ${item.price.toFixed(2).replace('.', ',')}</td>
      <td class="product-quantity">
        <input type="number" class="quantity-input" value="${item.qty}" min="1">
      </td>
      <td class="product-subtotal">R$ ${itemTotalPrice.toFixed(2).replace('.', ',')}</td>
    `;
    tableBody.appendChild(row);
  });
}

// --- FUNÇÃO PARA ATUALIZAR TOTAIS (Modificada para ler os dados corretos) ---
function updateCartTotals() {
  let subtotal = 0;
  const items = document.querySelectorAll('.cart-item-row');

  if (items.length === 0) {
    document.getElementById('totals-subtotal').textContent = '$ 0,00';
    document.getElementById('totals-total').textContent = '$ 0,00';
    // Garante que a mensagem de vazio apareça se o último item for removido
    if (!document.querySelector('#cart-table-body tr')) {
      document.getElementById('cart-table-body').innerHTML =
        '<tr><td colspan="4" style="text-align:center; padding: 40px;">Seu carrinho está vazio.</td></tr>';
    }
    return;
  }

  items.forEach((row) => {
    const price = parseFloat(row.querySelector('.product-price').dataset.price);
    const qty = parseInt(row.querySelector('.quantity-input').value);
    const itemTotal = price * qty;

    // Atualiza o subtotal da linha
    row.querySelector('.product-subtotal').textContent = `$ ${itemTotal.toFixed(2).replace('.', ',')}`;
    subtotal += itemTotal;
  });

  // Atualiza o box de Total
  document.getElementById('totals-subtotal').textContent = `$ ${subtotal.toFixed(2).replace('.', ',')}`;
  document.getElementById('totals-total').textContent = `$ ${subtotal.toFixed(2).replace('.', ',')}`;
}

// --- EVENTOS (DOM CONTENT LOADED) ---
document.addEventListener('DOMContentLoaded', () => {

  // 1. RENDERIZA O CARRINHO DO LOCALSTORAGE (A CORREÇÃO PRINCIPAL)
  renderCartFromLocalStorage();

  // 2. Carrega os totais iniciais com base nos itens renderizados
  updateCartTotals();

  // 3. Botão de Remover Item (AGORA SINCRONIZADO)
  document.getElementById('cart-table-body').addEventListener('click', (e) => {
    if (e.target.classList.contains('remove-item-btn')) {
      const row = e.target.closest('.cart-item-row');
      if (row) {
        const key = row.dataset.key;

        // Remove do localStorage
        let cart = getCart();
        cart = cart.filter(item => item.key !== key);
        saveCart(cart);

        // Remove do DOM
        row.remove();
        updateCartTotals();
      }
    }
  });

  // 4. Botão de Atualizar Carrinho (AGORA SINCRONIZADO)
  const btnUpdate = document.querySelector('.btn-update-cart');
  if (btnUpdate) {
    btnUpdate.addEventListener('click', () => {
      let cart = getCart();
      const rows = document.querySelectorAll('.cart-item-row');

      rows.forEach(row => {
        const key = row.dataset.key;
        const newQty = parseInt(row.querySelector('.quantity-input').value);
        const itemInCart = cart.find(item => item.key === key);
        if (itemInCart) {
          itemInCart.qty = newQty;
        }
      });

      saveCart(cart);
      updateCartTotals();

      alert('Carrinho atualizado!');
    });
  }

  // 5. Botão de Aplicar Cupom (Sem mudanças na lógica)
  const btnCoupon = document.querySelector('.btn-apply-coupon');
  if (btnCoupon) {
    btnCoupon.addEventListener('click', () => {
      const couponCode = document.getElementById('coupon-code').value;
      if (couponCode) {
        alert(`Cupom "${couponCode}" aplicado (simulação)!`);
      } else {
        alert('Por favor, insira um código de cupom.');
      }
    });
  }

  // 6. Mudar quantidade (AGORA SINCRONIZADO)
  document.getElementById('cart-table-body').addEventListener('change', (e) => {
    if (e.target.classList.contains('quantity-input')) {
      const row = e.target.closest('.cart-item-row');
      const key = row.dataset.key;
      const newQty = parseInt(e.target.value);

      let cart = getCart();
      const itemInCart = cart.find(item => item.key === key);

      if (itemInCart) {
        itemInCart.qty = newQty;
      }

      saveCart(cart);
      updateCartTotals(); // Atualiza totais automaticamente
    }
  });
});