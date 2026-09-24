/* Todos os preços são os valores do plano acadêmico, em centavos. */
(function (root) {
  'use strict';
  const products = [
    { id: 'barril', name: 'Café de Barril', category: 'coffee', price: 4990, size: '250 g', image: 'assets/gar-hero.webp', imageClass: 'barrel-image', badge: 'NOSSA ASSINATURA', subtitle: 'O café encontra uma nova história.', description: 'Café arábica com passagem, antes da torra, pelo barril de carvalho que recebeu pimenta biquinho. A assinatura da nossa proposta.', tags: ['Arábica', 'Passagem pelo carvalho'], coffee: true },
    { id: 'origem', name: 'Café de Origem', category: 'coffee', price: 3490, size: '250 g', image: 'assets/gar-cafe-origem.webp', imageClass: '', badge: '', subtitle: 'Um bom café. Do seu jeito.', description: 'Para quem quer o café sem a etapa de barril: nossa proposta de arábica do Sul de Minas, pronto para acompanhar o seu ritual de todo dia.', tags: ['Arábica', 'Sem passagem pelo barril'], coffee: true },
    { id: 'molho', name: 'Molho de Pimenta', category: 'sauce', price: 2490, size: '150 mL', image: 'assets/gar-molho-biquinho.webp', imageClass: '', badge: '', subtitle: 'A história começa à mesa.', description: 'Molho de pimenta biquinho BRS Moema. Sua proposta de produção inclui a passagem da massa de pimenta pelo carvalho, antes de o barril receber o café.', tags: ['Pimenta biquinho', 'BRS Moema'], coffee: false },
    { id: 'kit', name: 'Kit Encontro GAR', category: 'kit', price: 7256, originalPrice: 7480, size: '250 g + 150 mL', image: 'assets/gar-hero.webp', imageClass: 'kit-image', badge: '3% OFF', subtitle: 'Duas descobertas na mesma caixa.', description: 'Um Café de Barril de 250 g e um Molho de Pimenta de 150 mL. Conheça os dois produtos com 3% de desconto sobre a compra separada.', tags: ['Café de Barril', 'Molho de Pimenta'], coffee: true }
  ];
  const variants = ['Em grãos', 'Moído para coado'];
  const money = cents => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);
  const getProduct = id => products.find(p => p.id === id);
  function totals(cart, coupon = false, usePoints = false, points = 0) {
    const subtotal = cart.reduce((sum, item) => sum + getProduct(item.id).price * item.qty, 0);
    const couponDiscount = coupon ? Math.round(subtotal * 0.15) : 0;
    const blocks = !coupon && usePoints ? Math.max(0, Math.min(Math.floor(points / 100), Math.floor(Math.floor(subtotal * 0.1) / 300))) : 0;
    const pointsDiscount = blocks * 300;
    const netProducts = subtotal - couponDiscount - pointsDiscount;
    const shipping = subtotal > 0 ? 2500 : 0;
    return { subtotal, couponDiscount, pointsDiscount, usedPoints: blocks * 100, netProducts, shipping, total: netProducts + shipping, earnedPoints: Math.floor(netProducts / 100) };
  }
  function validCart(value) {
    if (!Array.isArray(value)) return [];
    const result = [];
    for (const item of value.slice(0, 30)) {
      const p = getProduct(item?.id);
      if (!p || !Number.isInteger(item.qty) || item.qty < 1) continue;
      const variant = p.coffee && variants.includes(item.variant) ? item.variant : p.coffee ? variants[0] : '150 mL';
      const found = result.find(v => v.id === p.id && v.variant === variant);
      if (found) found.qty = Math.min(99, found.qty + item.qty);
      else result.push({ id: p.id, variant, qty: Math.min(item.qty, 99) });
    }
    return result;
  }
  const api = { products, variants, money, getProduct, totals, validCart };
  root.GarStore = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
