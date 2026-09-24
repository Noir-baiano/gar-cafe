const test = require('node:test');
const assert = require('node:assert/strict');
const { totals, validCart } = require('../docs/store.js');
const kit = [{ id: 'kit', qty: 1, variant: 'Em grãos' }];
test('kit mantém os 3% e recebe 15% de primeira compra, sem descontar frete', () => {
  const result = totals(kit, true);
  assert.equal(result.subtotal, 7256);
  assert.equal(result.couponDiscount, 1088);
  assert.equal(result.netProducts, 6168);
  assert.equal(result.total, 8668);
  assert.equal(result.earnedPoints, 61);
});
test('pontos respeitam blocos de 100 e limite de 10%, sem acumular com GAR15', () => {
  const result = totals(kit, false, true, 500);
  assert.equal(result.usedPoints, 200);
  assert.equal(result.pointsDiscount, 600);
  assert.equal(result.total, 9156);
  assert.equal(totals(kit, true, true, 500).usedPoints, 0);
  assert.equal(totals([{ id: 'molho', qty: 1 }], false, true, 500).usedPoints, 0);
});
test('sacola vazia não tem frete nem desconto e unidades se somam em centavos', () => {
  assert.equal(totals([], true, true, 500).total, 0);
  const result = totals([{ id: 'barril', qty: 2 }, { id: 'molho', qty: 1 }], true);
  assert.equal(result.subtotal, 12470);
  assert.equal(result.couponDiscount, 1871);
  assert.equal(result.total, 13099);
});
test('dados locais inválidos não alteram preços nem injetam conteúdo', () => {
  const result = validCart([{ id: 'unknown', qty: 1 }, { id: 'barril', qty: -2 }, { id: 'barril', qty: 1, variant: '<script>' }, { id: 'barril', qty: 999, variant: 'Em grãos' }]);
  assert.deepEqual(result, [{ id: 'barril', qty: 99, variant: 'Em grãos' }]);
  assert.deepEqual(validCart({}), []);
});
