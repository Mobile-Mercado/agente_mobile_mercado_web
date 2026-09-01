import test from 'node:test';
import assert from 'node:assert/strict';
import precoVigente, { promocaoEstaAtiva } from './src/services/precoVigente.ts';

const agora = new Date('2026-09-01T12:00:00Z');
const timestamp = (iso: string) => ({ toMillis: () => new Date(iso).getTime() });

test('sem promocao usa o currentPrice', () => {
  const preco = precoVigente({ currentPrice: 10 }, agora);
  assert.equal(preco, 10);
});

test('promocao ativa usa o promotionalPrice', () => {
  const preco = precoVigente({ currentPrice: 10, promotionalPrice: 7 }, agora);
  assert.equal(preco, 7);
});

test('promotionalPrice igual ao currentPrice e ignorado', () => {
  const preco = precoVigente({ currentPrice: 10, promotionalPrice: 10 }, agora);
  assert.equal(preco, 10);
});

test('promotionalPrice acima do currentPrice e ignorado', () => {
  const preco = precoVigente({ currentPrice: 10, promotionalPrice: 12 }, agora);
  assert.equal(preco, 10);
});

test('promocao expirada e ignorada', () => {
  const dados = {
    currentPrice:      10,
    promotionalPrice:  7,
    promotionEndAt:    timestamp('2026-08-31T12:00:00Z'),
  };
  assert.equal(precoVigente(dados, agora), 10);
});

test('promocao que ainda nao comecou e ignorada', () => {
  const dados = {
    currentPrice:      10,
    promotionalPrice:  7,
    promotionStartAt:  timestamp('2026-09-02T12:00:00Z'),
  };
  assert.equal(precoVigente(dados, agora), 10);
});

test('promotionStartAt e promotionEndAt como Timestamp cobrindo o momento atual', () => {
  const dados = {
    currentPrice:      10,
    promotionalPrice:  7,
    promotionStartAt:  timestamp('2026-09-01T00:00:00Z'),
    promotionEndAt:    timestamp('2026-09-01T23:59:59Z'),
  };
  assert.equal(precoVigente(dados, agora), 7);
});

test('promotionStartAt e promotionEndAt como numero em epoch milissegundos', () => {
  const dados = {
    currentPrice:      10,
    promotionalPrice:  7,
    promotionStartAt:  new Date('2026-09-01T00:00:00Z').getTime(),
    promotionEndAt:    new Date('2026-09-01T23:59:59Z').getTime(),
  };
  assert.equal(precoVigente(dados, agora), 7);
});

test('promotionStartAt e promotionEndAt nulos nao bloqueiam a promocao', () => {
  const dados = {
    currentPrice:      10,
    promotionalPrice:  7,
    promotionStartAt:  null,
    promotionEndAt:    null,
  };
  assert.equal(precoVigente(dados, agora), 7);
});

test('produto sem currentPrice cai para o agranelValue', () => {
  const preco = precoVigente({ agranelValue: 3.5 }, agora);
  assert.equal(preco, 3.5);
});

test('produto sem nenhum preco cai para zero', () => {
  const preco = precoVigente({}, agora);
  assert.equal(preco, 0);
});

test('promocaoEstaAtiva exposta reflete o mesmo criterio', () => {
  assert.equal(promocaoEstaAtiva({ currentPrice: 10, promotionalPrice: 7 }, agora), true);
  assert.equal(promocaoEstaAtiva({ currentPrice: 10, promotionalPrice: 10 }, agora), false);
});
