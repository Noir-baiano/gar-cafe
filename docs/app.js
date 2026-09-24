(() => {
  'use strict';
  const { products, variants, money, getProduct, totals, validCart } = window.GarStore;
  const storageKey = 'gar-cafe-demo-v1';
  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];
  let state = { cart: [], points: 0, orders: 0, coupon: false, usePoints: false };
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    if (saved && typeof saved === 'object') state = {
      cart: validCart(saved.cart),
      points: Number.isInteger(saved.points) && saved.points >= 0 ? Math.min(saved.points, 10000000) : 0,
      orders: Number.isInteger(saved.orders) && saved.orders >= 0 ? Math.min(saved.orders, 1000000) : 0,
      coupon: saved.coupon === true && !saved.orders,
      usePoints: saved.usePoints === true && saved.coupon !== true
    };
  } catch { /* The store also works with storage disabled. */ }
  let toastTimer, activeProduct = null, detailQty = 1, lastOrder = null;
  let couponMessage = '';
  function persist() { try { localStorage.setItem(storageKey, JSON.stringify(state)); } catch { /* In-memory checkout remains available. */ } }
  function notify(message) {
    $('#toast').textContent = message;
    $('#toast').classList.add('visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => $('#toast').classList.remove('visible'), 3500);
  }
  function openDialog(id) {
    $$('dialog[open]').forEach(d => d.close());
    $(id).showModal();
    $(id).scrollTop = 0;
  }
  function updateGlobal() {
    const count = state.cart.reduce((sum, item) => sum + item.qty, 0);
    $$('[data-count]').forEach(el => { el.textContent = count; });
    $$('[data-cart]').forEach(el => el.setAttribute('aria-label', `Abrir sacola, ${count} ${count === 1 ? 'item' : 'itens'}`));
    $$('[data-points]').forEach(el => { el.textContent = state.points.toLocaleString('pt-BR'); });
    const remaining = 100 - (state.points % 100);
    $('#points-progress').style.width = `${Math.min(100, state.points)}%`;
    $('#points-message').textContent = state.points >= 100 ? `Você tem ${Math.floor(state.points / 100)} ${Math.floor(state.points / 100) === 1 ? 'resgate disponível' : 'resgates disponíveis'} de R$ 3. Consulte as regras.` : `Faltam ${remaining} pontos para o primeiro resgate.`;
    persist();
  }
  function renderProducts(filter = 'all') {
    const list = products.filter(p => filter === 'all' || p.category === filter);
    $('#collection-count').textContent = `${list.length} ${list.length === 1 ? 'descoberta' : 'descobertas'}`;
    $('#products').innerHTML = list.map(p => `<article class="product-card">
      <button class="product-image-button" data-product="${p.id}" aria-label="Conhecer ${p.name}">
        ${p.badge ? `<span class="product-badge ${p.id === 'kit' ? 'red' : ''}">${p.badge}</span>` : ''}
        <img src="${p.image}" class="${p.imageClass}" alt="${p.name}${p.id === 'kit' ? '' : ' GAR'}" loading="lazy" width="400" height="500">
        <span class="product-size">${p.size}</span>
      </button>
      <div class="product-card-title"><h3><button data-product="${p.id}">${p.name}</button></h3></div>
      <p class="subtitle">${p.subtitle}</p>
      <div class="price">${p.originalPrice ? `<s>${money(p.originalPrice)}</s>` : ''}<strong>${money(p.price)}</strong></div>
      <button class="product-add" data-product="${p.id}" aria-label="Escolher ${p.name}">Escolher ${p.id === 'kit' ? 'kit' : p.coffee ? 'café' : 'molho'}<span aria-hidden="true">+</span></button>
    </article>`).join('');
  }
  function showProduct(id) {
    const p = getProduct(id);
    if (!p) return;
    activeProduct = p;
    detailQty = 1;
    $('#product-detail').innerHTML = `<div class="product-detail-layout"><div class="detail-image-wrap"><img src="${p.image}" class="${p.imageClass}" alt="${p.name} GAR"></div><div class="detail-copy"><p class="eyebrow">${p.badge || 'NOSSA COLEÇÃO'} · ${p.size}</p><h2 id="product-title">${p.name}</h2><div class="detail-tags">${p.tags.map(tag => `<span>${tag}</span>`).join('')}</div><p>${p.description}</p><div class="detail-price">${p.originalPrice ? `<s>${money(p.originalPrice)}</s>` : ''}${money(p.price)}</div>${p.coffee ? `<label class="field-label" for="product-variant">Como você prefere o café?</label><select class="variant-select" id="product-variant">${variants.map(v => `<option>${v}</option>`).join('')}</select>` : '<p>Conteúdo: 1 frasco de 150 mL.</p>'}<div class="detail-buy-row"><div class="quantity-control" aria-label="Quantidade"><button data-detail-qty="-1" aria-label="Diminuir quantidade" disabled>−</button><output id="detail-quantity" aria-live="polite">1</output><button data-detail-qty="1" aria-label="Aumentar quantidade">+</button></div><button class="button" id="add-detail">Adicionar à sacola</button></div><p class="demo-note">Produto conceitual · compra demonstrativa, sem cobrança.</p></div></div>`;
    openDialog('#product-dialog');
  }
  function addItem(id, variant, qty = 1) {
    const p = getProduct(id);
    if (!p || !Number.isInteger(qty) || qty < 1 || qty > 99) throw new Error('Produto ou quantidade inválida. Use de 1 a 99 unidades.');
    const chosenVariant = p.coffee ? variant || variants[0] : '150 mL';
    if (p.coffee && !variants.includes(chosenVariant)) throw new Error('Escolha Em grãos ou Moído para coado.');
    const item = state.cart.find(item => item.id === id && item.variant === chosenVariant);
    if (item && item.qty + qty > 99) throw new Error('O limite desta demonstração é 99 unidades por opção.');
    if (item) item.qty += qty;
    else state.cart.push({ id, variant: chosenVariant, qty });
    couponMessage = '';
    updateGlobal();
  }
  function cartTotals() { return totals(state.cart, state.coupon, state.usePoints, state.points); }
  function totalsMarkup(t) {
    return `<div class="cart-totals"><div><span>Produtos</span><span>${money(t.subtotal)}</span></div>${t.couponDiscount ? `<div class="discount-row"><span>GAR15 · 15% de desconto</span><span>− ${money(t.couponDiscount)}</span></div>` : ''}${t.pointsDiscount ? `<div class="discount-row"><span>Clube GAR · ${t.usedPoints} pontos</span><span>− ${money(t.pointsDiscount)}</span></div>` : ''}<div><span>Frete demonstrativo</span><span>${money(t.shipping)}</span></div><div class="total-row"><span>Total</span><strong>${money(t.total)}</strong></div></div>`;
  }
  function renderCart() {
    if (!state.cart.length) {
      $('#cart-body').innerHTML = '<div class="cart-empty"><div class="empty-symbol" aria-hidden="true">g</div><h3>Seu próximo encontro<br>começa aqui.</h3><p>A sacola está vazia. Que tal conhecer o café de barril?</p><button class="button" data-browse>Explorar a coleção <span aria-hidden="true">↗</span></button></div>';
      return;
    }
    const t = cartTotals();
    const potential = totals(state.cart, false, true, state.points);
    const available = potential.usedPoints > 0;
    const message = couponMessage || (state.coupon ? 'GAR15 aplicado! 15% de desconto nos produtos.' : state.orders ? 'Cupom GAR15 disponível apenas na primeira compra.' : 'Primeira compra? Use GAR15 e ganhe 15%.');
    $('#cart-body').innerHTML = `<div class="cart-content"><div class="cart-items">${state.cart.map((item, index) => {
      const p = getProduct(item.id);
      return `<article class="cart-item"><div class="cart-item-image"><img src="${p.image}" class="${p.imageClass}" alt="${p.name}"></div><div><div class="cart-item-name"><h3>${p.name}</h3><strong>${money(p.price * item.qty)}</strong></div><p class="cart-item-meta">${p.size}${p.coffee ? ' · ' + item.variant : ''}</p><div class="cart-item-actions"><div class="quantity-control"><button data-qty="${index}" data-delta="-1" aria-label="Diminuir ${p.name}" ${item.qty === 1 ? 'disabled' : ''}>−</button><output aria-label="Quantidade de ${p.name}">${item.qty}</output><button data-qty="${index}" data-delta="1" aria-label="Aumentar ${p.name}" ${item.qty === 99 ? 'disabled' : ''}>+</button></div><button class="remove-item" data-remove="${index}" aria-label="Remover ${p.name}">Remover</button></div></div></article>`;
    }).join('')}</div><form class="coupon-form" id="coupon-form"><label class="field-label" for="coupon">Cupom de desconto</label><div class="coupon-row"><input id="coupon" name="coupon" placeholder="Digite seu cupom" maxlength="20" autocomplete="off" aria-describedby="coupon-message" value="${state.coupon ? 'GAR15' : ''}" ${state.coupon ? 'readonly' : ''}><button type="${state.coupon ? 'button' : 'submit'}" ${state.coupon ? 'data-remove-coupon' : ''}>${state.coupon ? 'Remover' : 'Aplicar'}</button></div><p id="coupon-message" class="field-message ${state.coupon ? 'success' : ''}" role="status">${message}</p></form><label class="points-option"><input id="use-points" type="checkbox" ${state.usePoints && !state.coupon ? 'checked' : ''} ${!available || state.coupon ? 'disabled' : ''}><span>${state.coupon ? 'Pontos e GAR15 não podem ser usados juntos.' : available ? `Usar ${potential.usedPoints} pontos por ${money(potential.pointsDiscount)} de desconto.` : `Seu saldo: ${state.points} pontos. Resgates a partir de 100 pontos, limitados a 10% dos produtos.`}</span></label>${totalsMarkup(t)}<p class="cart-shipping-note">Frete fixo usado apenas nesta apresentação.</p><button class="button checkout-button" id="start-checkout">Continuar para a compra <span aria-hidden="true">↗</span></button><p class="checkout-note">Demonstração acadêmica · nenhuma cobrança será feita.<br>Este pedido acumularia ${t.earnedPoints} pontos GAR.</p></div>`;
  }
  function showCart() { renderCart(); openDialog('#cart-dialog'); }
  function info(html) { $('#info-content').innerHTML = html; openDialog('#info-dialog'); }
  function showCheckout() {
    if (!state.cart.length) return showCart();
    const t = cartTotals();
    info(`<span class="demo-pill">COMPRA DEMONSTRATIVA</span><h2 id="info-title">Seu próximo<br>momento GAR.</h2><p>Confira o resumo e experimente a conclusão de um pedido. Não há pagamento, envio ou coleta de dados pessoais.</p>${totalsMarkup(t)}<div class="order-breakdown"><div><span>Pontos a ganhar</span><strong>${t.earnedPoints} pontos GAR</strong></div><div><span>Forma de pagamento</span><strong>Simulação</strong></div></div><button class="button" id="finish-order">Concluir compra demonstrativa</button><button class="button button-outline" data-cart>Voltar à sacola</button>`);
  }
  function finishOrder() {
    if (!state.cart.length) return;
    const t = cartTotals();
    lastOrder = { number: `GAR-DEMO-${String(state.orders + 1).padStart(3, '0')}`, items: state.cart.map(item => ({ ...item })), ...t };
    state.points = state.points - t.usedPoints + t.earnedPoints;
    state.orders += 1;
    state.cart = [];
    state.coupon = false;
    state.usePoints = false;
    couponMessage = '';
    updateGlobal();
    info(`<div class="success-mark" aria-hidden="true">✓</div><span class="demo-pill">PEDIDO DE DEMONSTRAÇÃO</span><h2 id="info-title">O primeiro gole<br>é só o começo.</h2><p>Simulação concluída! O pedido <strong>${lastOrder.number}</strong> foi registrado neste navegador. Nenhum valor foi cobrado e nenhum produto será enviado.</p><div class="order-breakdown"><div><span>Total simulado</span><strong>${money(t.total)}</strong></div><div><span>Pontos recebidos</span><strong>+ ${t.earnedPoints}</strong></div><div><span>Seu saldo no Clube GAR</span><strong>${state.points} pontos</strong></div></div><div class="order-actions"><button class="button" data-browse>Voltar à coleção</button><button class="button button-outline" id="copy-order">Copiar resumo</button></div><p id="copy-order-status" role="status"></p>`);
  }
  function showLoyalty() {
    info(`<p class="eyebrow">CLUBE GAR</p><h2 id="info-title">Você tem<br>${state.points} pontos GAR.</h2><p>Um bom motivo para o próximo encontro.</p><ul><li>R$ 1 em produtos, após os descontos, vale 1 ponto inteiro.</li><li>Cada 100 pontos podem virar R$ 3 de desconto.</li><li>O resgate é limitado a 10% do valor dos produtos.</li><li>Frete não recebe desconto nem gera pontos.</li><li>O cupom GAR15 e os pontos não são cumulativos.</li></ul><p>Nesta apresentação, o saldo é demonstrativo e fica somente neste navegador. Os pontos entram ao concluir uma compra simulada.</p><button class="button" data-browse>Explorar a coleção</button>`);
  }
  function showContact() {
    info('<p class="eyebrow">FALE COM A GAR</p><h2 id="info-title">Uma conversa<br>também conecta.</h2><p>O canal comercial será informado no lançamento. Por enquanto, você pode preparar e copiar uma mensagem para compartilhar com a equipe do projeto.</p><label class="field-label" for="contact-message">Sua mensagem</label><textarea id="contact-message" maxlength="2000">Olá, equipe GAR! Gostaria de conhecer melhor o Café de Barril e a proposta de vocês.</textarea><button class="button" id="copy-contact">Copiar mensagem</button><p id="contact-status" role="status">A mensagem não é enviada nem armazenada pelo site.</p>');
  }
  function showPrivacy() {
    info('<p class="eyebrow">SOBRE ESTA LOJA</p><h2 id="info-title">Uma ideia<br>em construção.</h2><p>Projeto acadêmico da disciplina de Gestão dos Negócios Agroindustriais. A GAR Café e os produtos apresentados fazem parte de uma proposta de negócio.</p><p>As imagens são representações conceituais. O processo no barril, o perfil sensorial e as especificações comerciais precisam ser validados antes de um lançamento real.</p><p>O site não processa pagamentos nem envia pedidos. Sacola, pontos e quantidade de compras simuladas são salvos somente neste navegador. Não há cadastro, rastreadores ou coleta de dados pessoais.</p><p>Para apagar esses dados, use “Reiniciar demonstração” no rodapé.</p><button class="button" data-close>Entendi</button>');
  }
  async function copyText(text) {
    if (!navigator.clipboard?.writeText) return false;
    try { await navigator.clipboard.writeText(text); return true; } catch { return false; }
  }
  document.addEventListener('click', async event => {
    const button = event.target.closest('button, a');
    if (!button) return;
    if (button.matches('[data-product]')) showProduct(button.dataset.product);
    else if (button.matches('[data-close]')) button.closest('dialog')?.close();
    else if (button.matches('[data-cart]')) showCart();
    else if (button.matches('[data-browse]')) { $$('dialog[open]').forEach(d => d.close()); $('#colecao').scrollIntoView({ behavior: 'smooth' }); }
    else if (button.matches('[data-filter]')) {
      $$('[data-filter]').forEach(el => { el.classList.toggle('active', el === button); el.setAttribute('aria-pressed', el === button ? 'true' : 'false'); });
      renderProducts(button.dataset.filter);
    } else if (button.matches('[data-detail-qty]')) {
      detailQty = Math.max(1, Math.min(99, detailQty + Number(button.dataset.detailQty)));
      $('#detail-quantity').textContent = detailQty;
      $('[data-detail-qty="-1"]').disabled = detailQty === 1;
      $('[data-detail-qty="1"]').disabled = detailQty === 99;
    } else if (button.id === 'add-detail') {
      const variant = activeProduct.coffee ? $('#product-variant').value : '150 mL';
      try { addItem(activeProduct.id, variant, detailQty); showCart(); } catch (error) { $('.detail-copy .demo-note').textContent = error.message; }
    } else if (button.matches('[data-qty]')) {
      const index = Number(button.dataset.qty);
      if (state.cart[index]) state.cart[index].qty = Math.max(1, Math.min(99, state.cart[index].qty + Number(button.dataset.delta)));
      updateGlobal(); renderCart();
      $(`[data-qty="${index}"][data-delta="${button.dataset.delta}"]`)?.focus();
    } else if (button.matches('[data-remove]')) {
      state.cart.splice(Number(button.dataset.remove), 1);
      updateGlobal(); renderCart();
      $('#cart-dialog .close-button').focus();
    } else if (button.matches('[data-remove-coupon]')) {
      state.coupon = false; couponMessage = ''; updateGlobal(); renderCart(); $('#coupon').focus();
    } else if (button.id === 'start-checkout') showCheckout();
    else if (button.id === 'finish-order') { button.disabled = true; finishOrder(); }
    else if (button.matches('[data-loyalty]')) showLoyalty();
    else if (button.matches('[data-contact]')) showContact();
    else if (button.matches('[data-privacy]')) showPrivacy();
    else if (button.matches('[data-copy-coupon]')) notify(await copyText('GAR15') ? 'Cupom GAR15 copiado. Seu primeiro encontro tem 15% OFF.' : 'Use o cupom GAR15 na sua primeira compra.');
    else if (button.id === 'copy-contact') {
      const message = $('#contact-message').value.trim();
      if (!message) { $('#contact-status').textContent = 'Escreva uma mensagem para copiar.'; $('#contact-message').focus(); return; }
      const ok = await copyText(message);
      $('#contact-status').textContent = ok ? 'Mensagem copiada! Ela não foi enviada pelo site.' : 'Selecione e copie o texto acima para compartilhar.';
      if (!ok) $('#contact-message').select();
    } else if (button.id === 'copy-order' && lastOrder) {
      const summary = `GAR Café — ${lastOrder.number}\nPEDIDO DEMONSTRATIVO, SEM COBRANÇA\n${lastOrder.items.map(item => `${item.qty} × ${getProduct(item.id).name} — ${item.variant}`).join('\n')}\nProdutos: ${money(lastOrder.subtotal)}\nDescontos: ${money(lastOrder.couponDiscount + lastOrder.pointsDiscount)}\nFrete demonstrativo: ${money(lastOrder.shipping)}\nTotal: ${money(lastOrder.total)}\nPontos recebidos: ${lastOrder.earnedPoints}`;
      $('#copy-order-status').textContent = await copyText(summary) ? 'Resumo copiado!' : 'Não foi possível copiar. O resumo está disponível acima.';
    } else if (button.matches('[data-reset]')) {
      info('<p class="eyebrow">DEMONSTRAÇÃO</p><h2 id="info-title">Começar de novo?</h2><p>Isso apaga a sacola, os pontos e as compras simuladas deste navegador. O cupom de primeira compra ficará disponível novamente.</p><button class="button" id="confirm-reset">Reiniciar demonstração</button><button class="button button-outline" data-close>Continuar como está</button>');
    } else if (button.id === 'confirm-reset') {
      state = { cart: [], points: 0, orders: 0, coupon: false, usePoints: false }; lastOrder = null; couponMessage = ''; updateGlobal(); $('#info-dialog').close(); notify('Demonstração reiniciada. Vamos ao primeiro encontro?');
    }
    if (button.matches('.menu-toggle')) {
      const expanded = button.getAttribute('aria-expanded') !== 'true';
      button.setAttribute('aria-expanded', String(expanded));
      button.setAttribute('aria-label', expanded ? 'Fechar menu' : 'Abrir menu');
      $('#mobile-nav').hidden = !expanded;
    } else if (button.closest('#mobile-nav')) {
      $('#mobile-nav').hidden = true;
      $('.menu-toggle').setAttribute('aria-expanded', 'false');
      $('.menu-toggle').setAttribute('aria-label', 'Abrir menu');
    }
  });
  document.addEventListener('submit', event => {
    if (event.target.id !== 'coupon-form') return;
    event.preventDefault();
    const coupon = $('#coupon').value.trim().toUpperCase();
    if (coupon !== 'GAR15') couponMessage = 'Cupom não encontrado. Confira o código GAR15.';
    else if (state.orders > 0) couponMessage = 'O GAR15 é válido apenas na primeira compra.';
    else { state.coupon = true; state.usePoints = false; couponMessage = ''; }
    updateGlobal(); renderCart(); $('#coupon').focus();
  });
  document.addEventListener('change', event => {
    if (event.target.id === 'use-points') { state.usePoints = event.target.checked && !state.coupon; updateGlobal(); renderCart(); $('#use-points').focus(); }
  });
  $$('dialog').forEach(dialog => {
    dialog.addEventListener('click', event => {
      const rect = dialog.getBoundingClientRect();
      if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) dialog.close();
    });
  });
  renderProducts(); updateGlobal();

  // Progressive enhancement: the regular interface works in all modern browsers.
  // These tools expose only the same visible, local demonstration cart.
  const context = document.modelContext;
  if (context?.registerTool) {
    const lifecycle = new AbortController();
    const readCart = () => ({ items: state.cart.map(item => ({ ...item, name: getProduct(item.id).name })), totalsInCents: cartTotals(), points: state.points, demonstration: true });
    const definitions = [
      { name: 'gar_list_products', title: 'Ver coleção GAR', description: 'Lista os quatro produtos da loja demonstrativa e seus preços em centavos de real.', inputSchema: { type: 'object', properties: {}, additionalProperties: false }, annotations: { readOnlyHint: true, untrustedContentHint: false }, execute: () => ({ products: products.map(({ id, name, price, size, coffee }) => ({ id, name, priceInCents: price, size, variants: coffee ? variants : ['150 mL'] })), demonstration: true }) },
      { name: 'gar_read_cart', title: 'Ver sacola GAR', description: 'Consulta os itens, totais e pontos da sacola demonstrativa neste navegador.', inputSchema: { type: 'object', properties: {}, additionalProperties: false }, annotations: { readOnlyHint: true, untrustedContentHint: false }, execute: readCart },
      { name: 'gar_add_to_cart', title: 'Adicionar à sacola GAR', description: 'Adiciona um produto à sacola demonstrativa e abre a sacola. Não conclui compra nem cobra valores.', inputSchema: { type: 'object', properties: { productId: { type: 'string', enum: products.map(p => p.id) }, variant: { type: 'string', enum: [...variants, '150 mL'] }, quantity: { type: 'integer', minimum: 1, maximum: 99 } }, required: ['productId', 'quantity'], additionalProperties: false }, annotations: { readOnlyHint: false, untrustedContentHint: false }, execute: input => { if (!input || typeof input !== 'object' || Object.keys(input).some(key => !['productId', 'variant', 'quantity'].includes(key))) throw new Error('Parâmetros inválidos.'); addItem(input.productId, input.variant, input.quantity); showCart(); return readCart(); } }
    ];
    for (const definition of definitions) {
      try { Promise.resolve(context.registerTool(definition, { signal: lifecycle.signal })).catch(() => {}); } catch { /* An unsupported tool API must never block the storefront. */ }
    }
    window.addEventListener('pagehide', () => lifecycle.abort(), { once: true });
  }
})();
