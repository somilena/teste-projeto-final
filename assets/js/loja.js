/* ========== Product data (17 produtos, imagens do site original) ========== */
const PRODUCTS = [
    {id:1, title:"Album", price:15.00, image:"https://fse.catchthemes.com/epentatonic/wp-content/uploads/sites/33/2022/04/album-1-1-1-300x300.png", sale:false, rating:4, date:"2022-04-01"},
    {id:2, title:"Beanie", price:18.00, oldPrice:20.00, image:"https://fse.catchthemes.com/epentatonic/wp-content/uploads/sites/33/2022/04/beanie-300x300.png", sale:true, rating:4.5, date:"2022-03-12"},
    {id:3, title:"Beanie with Logo", price:18.00, oldPrice:20.00, image:"https://fse.catchthemes.com/epentatonic/wp-content/uploads/sites/33/2022/04/headphone-300x300.png", sale:true, rating:4.1, date:"2022-03-15"},
    {id:4, title:"Belt", price:55.00, image:"https://fse.catchthemes.com/epentatonic/wp-content/uploads/sites/33/2022/04/belt-300x300.png", sale:true, rating:3.8, date:"2022-02-20"},
    {id:5, title:"Cap", price:16.00, oldPrice:18.00, image:"https://fse.catchthemes.com/epentatonic/wp-content/uploads/sites/33/2022/04/cap-300x300.png", sale:true, rating:4.2, date:"2022-01-22"},
    {id:6, title:"Hoodie", priceRange:[42.00,45.00], image:"https://fse.catchthemes.com/epentatonic/wp-content/uploads/sites/33/2022/04/hoodie-1-300x300.png", sale:true, variants:["P","M","G"], rating:4.6, date:"2022-05-01"}, /* Traduzido variantes para P, M, G */
    {id:7, title:"Hoodie with Logo", price:45.00, image:"https://fse.catchthemes.com/epentatonic/wp-content/uploads/sites/33/2022/04/hoodie-2-300x300.png", rating:4.7, date:"2022-05-02"},
    {id:8, title:"Hoodie with Zipper", price:45.00, image:"https://fse.catchthemes.com/epentatonic/wp-content/uploads/sites/33/2022/04/hoodie-black-300x300.png", rating:4.0, date:"2022-05-03"},
    {id:9, title:"Logo Collection", priceRange:[18.00,45.00], image:"https://fse.catchthemes.com/epentatonic/wp-content/uploads/sites/33/2022/04/logo-collection-300x300.png", sale:true, variants:["Preto","Verde","Amarelo"], rating:3.9, date:"2021-12-04"}, /* Traduzido variantes para cores */
    {id:10, title:"Long Sleeve Tee", price:25.00, image:"https://fse.catchthemes.com/epentatonic/wp-content/uploads/sites/33/2022/04/long-sleeve-tee-300x300.png", rating:4.3, date:"2022-02-11"},
    {id:11, title:"Polo", price:20.00, image:"https://fse.catchthemes.com/epentatonic/wp-content/uploads/sites/33/2022/04/polo-300x300.png", rating:4.1, date:"2022-03-29"},
    {id:12, title:"Single", price:2.00, oldPrice:3.00, image:"https://fse.catchthemes.com/epentatonic/wp-content/uploads/sites/33/2022/04/single-300x300.png", sale:true, rating:3.5, date:"2021-11-10"},
    {id:13, title:"Sunglasses", price:90.00, image:"https://fse.catchthemes.com/epentatonic/wp-content/uploads/sites/33/2022/04/sunglasses-300x300.png", rating:4.8, date:"2022-06-01"},
    {id:14, title:"T-Shirt", price:18.00, image:"https://fse.catchthemes.com/epentatonic/wp-content/uploads/sites/33/2022/04/tshirt-300x300.png", rating:4.0, date:"2022-04-14"},
    {id:15, title:"T-Shirt with Logo", price:18.00, image:"https://fse.catchthemes.com/epentatonic/wp-content/uploads/sites/33/2022/04/tshirt-logo-300x300.png", rating:4.2, date:"2022-04-16"},
    {id:16, title:"V-Neck T-Shirt", priceRange:[15.00,20.00], image:"https://fse.catchthemes.com/epentatonic/wp-content/uploads/sites/33/2022/04/v-neck-300x300.png", variants:["Branca","Cinza"], rating:4.0, date:"2021-10-05"}, /* Traduzido variantes para cores */
    {id:17, title:"Camera", price:120.00, oldPrice:150.00, image:"https://fse.catchthemes.com/epentatonic/wp-content/uploads/sites/33/2022/04/camera-300x300.png", sale:true, rating:4.6, date:"2022-07-01"}
];

/* ========== App state (Estado global) ========== */
const PAGE_SIZE = 16;
let state = {
    products: [...PRODUCTS],
    page: 1,
    sort: 'default',
    // O carrinho salva no localStorage para persistir entre recargas
    cart: JSON.parse(localStorage.getItem('epent_cart') || '[]')
};

/* ========== Helpers ========== */
const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));
function formatBRL(n){
    // Mantendo o símbolo '$' para replicar o design visual.
    return `$ ${n.toFixed(2).replace('.', ',').replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.')}`;
}
function getPrice(p){
    if(p.price) return p.price;
    if(Array.isArray(p.priceRange)) return p.priceRange[0];
    return 0;
}

/* ========== Render products (Renderiza produtos na grade da loja) ========== */
function renderProducts(){
    const grid = $('#products-grid');
    grid.innerHTML = '';
    
    // Lógica de ordenação
    let prod = [...state.products];
    if(state.sort === 'price-asc') prod.sort((a,b)=> (getPrice(a) - getPrice(b)));
    if(state.sort === 'price-desc') prod.sort((a,b)=> (getPrice(b) - getPrice(a)));
    if(state.sort === 'new') prod.sort((a,b)=> new Date(b.date) - new Date(a.date));
    if(state.sort === 'rating') prod.sort((a,b)=> (b.rating || 0) - (a.rating || 0));
    
    // Lógica de paginação
    const total = prod.length;
    const pages = Math.ceil(total / PAGE_SIZE);
    if(state.page > pages) state.page = pages || 1;
    const start = (state.page - 1) * PAGE_SIZE;
    const pageItems = prod.slice(start, start + PAGE_SIZE);

    pageItems.forEach(p=>{
        const el = document.createElement('article');
        el.className = 'product';
        el.innerHTML = `
            <div class="thumb" data-id="${p.id}" ${p.variants ? 'data-variant-opener="true"' : 'data-variant-opener="false"'}>
                ${p.sale ? '<span class="badge">PROMOÇÃO!</span>' : ''} <img src="${p.image}" alt="${p.title}">
            </div>
            <h3>${p.title}</h3>
            <div class="price-row">
                <div class="price-info">
                    ${p.oldPrice ? `<span class="old-price">${formatBRL(p.oldPrice)}</span> ` : ''}
                    ${Array.isArray(p.priceRange) ? `<span class="price">${formatBRL(p.priceRange[0])} – ${formatBRL(p.priceRange[1])}</span>` : `<span class="price">${formatBRL(p.price)}</span>`}
                </div>
                ${p.variants ? `<button class="btn select-options" data-id="${p.id}">SELECIONAR OPÇÕES</button>` : `<button class="btn add-to-cart" data-id="${p.id}">ADICIONAR AO CARRINHO</button>`}
            </div>
        `;
        grid.appendChild(el);
    });

    // Atualiza texto dos resultados
    $('#results-info').textContent = `Mostrando ${start+1}–${start + pageItems.length} de ${total} resultados`;

    renderPagination(Math.ceil(total / PAGE_SIZE));
    attachProductEvents();
}

/* ========== Pagination (Paginação) ========== */
function renderPagination(totalPages){
    const pag = $('#pagination');
    pag.innerHTML = '';
    if(totalPages <= 1) return;
    for(let i=1;i<=totalPages;i++){
        const btn = document.createElement('div');
        btn.className = 'page-item' + (i===state.page ? ' active' : '');
        btn.textContent = i;
        btn.addEventListener('click', ()=> {
            state.page = i;
            renderProducts();
            window.scrollTo({top:0, behavior:'smooth'});
        });
        pag.appendChild(btn);
    }
    // Adiciona a seta para a próxima página (se houver)
    if(state.page < totalPages){
        const next = document.createElement('div');
        next.className = 'page-item';
        next.innerHTML = '<i class="fa fa-arrow-right"></i>';
        next.addEventListener('click', ()=> {
            state.page++; renderProducts(); window.scrollTo({top:0, behavior:'smooth'});
        });
        pag.appendChild(next);
    }
}

/* ========== Attach events on product buttons (Anexa eventos nos botões de produto) ========== */
function attachProductEvents(){
    // Botão "Adicionar ao carrinho"
    $$('.add-to-cart').forEach(btn=>{
        btn.onclick = () => {
            const id = Number(btn.dataset.id);
            addToCart(id, 1);
        };
    });
    // Botão "Selecionar Opções"
    $$('.select-options').forEach(btn=>{
        btn.onclick = () => {
            const id = Number(btn.dataset.id);
            openOptionsModal(id);
        };
    });
    // Thumbnails que abrem o modal (para produtos com variantes)
    $$('.thumb').forEach(thumb=>{
        if(thumb.dataset.variantOpener === 'true'){
            thumb.onclick = () => {
                const id = Number(thumb.dataset.id);
                openOptionsModal(id);
            };
        }
    });
}

/* ========== Cart logic (Lógica do Carrinho) ========== */
function saveCart(){ localStorage.setItem('epent_cart', JSON.stringify(state.cart)); updateCartUI(); }

function addToCart(productId, qty = 1, variant=null){
    const p = PRODUCTS.find(x=>x.id===productId);
    if(!p) return;
    // Cria uma chave única para o item no carrinho (id + variante)
    const key = variant ? `${productId}::${variant}` : `${productId}`;
    const existing = state.cart.find(i=>i.key===key);
    
    // Define o preço base (usando o menor da faixa se for range)
    const price = p.price || (Array.isArray(p.priceRange) ? p.priceRange[0] : 0);

    if(existing){ existing.qty += qty; }
    else state.cart.push({key, id:productId, title:p.title, price, image:p.image, qty, variant});
    
    saveCart();
    openCart();
}

function removeFromCart(key){
    state.cart = state.cart.filter(i=>i.key !== key);
    saveCart();
}

function changeQty(key, qty){
    const it = state.cart.find(i=>i.key===key);
    if(!it) return;
    it.qty = Math.max(1, qty);
    saveCart();
}

function cartSubtotal(){
    return state.cart.reduce((s,i)=> s + (i.price * i.qty), 0);
}

/* ========== Cart UI (Interface do Carrinho) ========== */
function updateCartUI(){
    const count = state.cart.reduce((s,i)=> s + i.qty, 0);
    $('#cart-count').textContent = count;
    const container = $('#cart-items');
    container.innerHTML = '';
    if(state.cart.length === 0){
        container.innerHTML = '<div class="center muted" style="padding:40px 0">Seu carrinho está vazio.</div>'; // Traduzido
    } else {
        state.cart.forEach(item=>{
            const div = document.createElement('div');
            div.className = 'cart-item';
            div.innerHTML = `
                <img src="${item.image}" alt="">
                <div class="meta">
                    <h5>${item.title}${item.variant ? ' — ' + item.variant : ''}</h5>
                    <div class="qty">
                        <button class="btn dec" data-key="${item.key}">-</button>
                        <span style="padding:0 10px; color:#fff">${item.qty}</span>
                        <button class="btn inc" data-key="${item.key}">+</button>
                    </div>
                    <div style="font-size:13px;color:#fff;font-weight:700;margin-top:6px">${formatBRL(item.price)}</div>
                </div>
                <div>
                    <button class="btn remove" data-key="${item.key}" style="border-color:transparent; color:#777; font-size:14px" title="Remover"> <i class="fa fa-times"></i>
                    </button>
                </div>
            `;
            container.appendChild(div);
        });
    }
    $('#cart-subtotal').textContent = formatBRL(cartSubtotal());
}

/* ========== Cart drawer open/close (Abrir/Fechar Carrinho) ========== */
function openCart(){
    const drawer = $('#cart-drawer');
    drawer.classList.add('open');
    drawer.setAttribute('aria-hidden','false');
    updateCartUI();
}
function closeCart(){
    const drawer = $('#cart-drawer');
    drawer.classList.remove('open');
    drawer.setAttribute('aria-hidden','true');
}

/* ========== Modal (product options) (Modal de Opções de Produto) ========== */
let currentModalProduct = null;
let selectedVariant = null;

function openOptionsModal(id){
    const p = PRODUCTS.find(x=>x.id===id);
    if(!p) return;
    
    currentModalProduct = p;
    selectedVariant = p.variants.length > 0 ? p.variants[0] : null; // Seleciona o primeiro por padrão

    $('#modal-title').textContent = 'Opções do Produto'; // Título do modal

    const content = $('#modal-content');
    content.innerHTML = `
        <div style="display:flex;gap:14px">
            <img src="${p.image}" alt="" style="width:140px;height:140px;object-fit:contain;background:#141414;padding:16px;border-radius:8px">
            <div>
                <div style="font-weight:700;color:#fff">${p.title}</div>
                <div style="margin-top:8px;font-weight:700;color:var(--white)">
                    ${Array.isArray(p.priceRange) ? formatBRL(p.priceRange[0]) + ' – ' + formatBRL(p.priceRange[1]) : formatBRL(p.price)}
                </div>
                <div style="margin-top:12px" id="variant-controls"></div>
                <div style="margin-top:20px"><label>Quantidade: <input type="number" id="modal-qty" min="1" value="1" style="width:70px;padding:6px;border-radius:6px;border:1px solid #333;background:#0e0e0e;color:var(--muted)"></label></div>
            </div>
        </div>
    `;
    
    // Renderiza variantes
    const vCont = $('#variant-controls');
    if(p.variants && p.variants.length){
        vCont.innerHTML = '<div style="color:#9b9b9b;margin-bottom:6px">Opção/Tamanho:</div><div style="display:flex;gap:10px">'; // Traduzido a label
        p.variants.forEach((v, idx)=>{
            const b = document.createElement('button');
            b.className = 'variant-btn';
            b.textContent = v;
            b.dataset.variant = v;
            if(idx===0) b.style.borderColor = 'var(--accent)';
            
            b.onclick = (e)=>{
                $$('.variant-btn').forEach(x=>x.style.borderColor='#2b2b2b');
                b.style.borderColor = 'var(--accent)';
                selectedVariant = v;
            };
            vCont.querySelector('div').appendChild(b);
        });
        vCont.innerHTML += '</div>';
    }
    
    $('#modal-backdrop').classList.add('open');
}

/* ========== Lifecycle & events (Ciclo de vida e eventos) ========== */
window.addEventListener('DOMContentLoaded', ()=> {
    renderProducts();
    updateCartUI(); // Popula o carrinho ao carregar a página
    
    // Evento de ordenação
    $('#sort-select').addEventListener('change', (e)=>{
        state.sort = e.target.value;
        state.page = 1;
        renderProducts();
    });

    // Abrir / fechar carrinho
    $('#open-cart').addEventListener('click', (e)=> {
        e.preventDefault();
        openCart();
    });
    $('#close-cart').addEventListener('click', (e)=> {
        e.preventDefault();
        closeCart();
    });

    // Eventos dos itens do carrinho (delegação)
    document.addEventListener('click', (e)=>{
        if(e.target.matches('.remove')){
            const key = e.target.dataset.key;
            removeFromCart(key);
        } else if(e.target.matches('.inc')){
            const key = e.target.dataset.key;
            const item = state.cart.find(i=>i.key===key);
            if(item) changeQty(key, item.qty+1);
        } else if(e.target.matches('.dec')){
            const key = e.target.dataset.key;
            const item = state.cart.find(i=>i.key===key);
            if(item) changeQty(key, item.qty-1);
        }
    });

    // Checkout (simulado)
    $('#checkout-btn').addEventListener('click', ()=>{
        if(state.cart.length === 0){ alert('Seu carrinho está vazio.'); return; } // Traduzido
        alert(`Compra simulada de ${formatBRL(cartSubtotal())} com sucesso! (Este é um site estático - integrações reais exigem um backend / gateway).`);
        state.cart = [];
        saveCart();
        closeCart();
    });

    // Modal fechar/adicionar
    $('#modal-close').addEventListener('click', ()=> { 
        $('#modal-backdrop').classList.remove('open'); 
        selectedVariant = null; // Limpa a seleção
    });
    
    $('#modal-add').addEventListener('click', ()=>{
        const qty = Number($('#modal-qty').value || 1);
        
        // Validação de variante
        if(currentModalProduct && currentModalProduct.variants && currentModalProduct.variants.length && !selectedVariant){
            alert('Por favor, escolha uma opção.'); // Traduzido
            return;
        }
        
        // Adiciona ao carrinho usando a variante selecionada
        addToCart(currentModalProduct.id, qty, selectedVariant);
        
        $('#modal-backdrop').classList.remove('open');
        selectedVariant = null; // Limpa a seleção
    });

    // Clicar fora do modal fecha
    $('#modal-backdrop').addEventListener('click', (e)=>{
        if(e.target === $('#modal-backdrop')){
            $('#modal-backdrop').classList.remove('open');
            selectedVariant = null;
        }
    });

    // Persistência do carrinho entre abas/janelas
    window.addEventListener('storage', (e)=>{
        if(e.key === 'epent_cart'){ state.cart = JSON.parse(e.newValue || '[]'); updateCartUI(); }
    });
});