type TimestampLike = { toMillis(): number };

type TimestampSerializado = { _seconds: number; _nanoseconds?: number };

type MomentoOuNulo = TimestampLike | TimestampSerializado | number | null | undefined;

export interface DadosPrecoProduto {
  currentPrice?: number | null;
  agranelValue?: number | null;
  promotionalPrice?: number | null;
  promotionStartAt?: MomentoOuNulo;
  promotionEndAt?: MomentoOuNulo;
}

const MOMENTO_INVALIDO = Symbol('momento_invalido');

function ehTimestampComToMillis(momento: unknown): momento is TimestampLike {
  return typeof (momento as TimestampLike)?.toMillis === 'function';
}

function ehTimestampSerializado(momento: unknown): momento is TimestampSerializado {
  return (
    typeof momento === 'object' &&
    momento !== null &&
    typeof (momento as TimestampSerializado)._seconds === 'number'
  );
}

function paraMillis(momento: MomentoOuNulo): number | null | typeof MOMENTO_INVALIDO {
  if (momento === null || momento === undefined) return null;
  if (typeof momento === 'number') return momento;
  if (ehTimestampComToMillis(momento)) return momento.toMillis();
  if (ehTimestampSerializado(momento)) {
    const nanossegundos = momento._nanoseconds ?? 0;
    return momento._seconds * 1000 + Math.floor(nanossegundos / 1_000_000);
  }
  return MOMENTO_INVALIDO;
}

function promocaoComecou(dados: DadosPrecoProduto, agoraMillis: number): boolean {
  const inicio = paraMillis(dados.promotionStartAt);
  if (inicio === MOMENTO_INVALIDO) return false;
  return inicio === null || inicio <= agoraMillis;
}

function promocaoNaoExpirou(dados: DadosPrecoProduto, agoraMillis: number): boolean {
  const fim = paraMillis(dados.promotionEndAt);
  if (fim === MOMENTO_INVALIDO) return false;
  return fim === null || fim >= agoraMillis;
}

function promocaoTemPrecoValido(dados: DadosPrecoProduto): boolean {
  const { promotionalPrice, currentPrice } = dados;
  if (promotionalPrice === null || promotionalPrice === undefined) return false;
  if (!(promotionalPrice > 0)) return false;
  return promotionalPrice < (currentPrice ?? 0);
}

export function promocaoEstaAtiva(dados: DadosPrecoProduto, agora: Date = new Date()): boolean {
  const agoraMillis = agora.getTime();
  return (
    promocaoTemPrecoValido(dados) &&
    promocaoComecou(dados, agoraMillis) &&
    promocaoNaoExpirou(dados, agoraMillis)
  );
}

export default function precoVigente(dados: DadosPrecoProduto, agora: Date = new Date()): number {
  if (promocaoEstaAtiva(dados, agora)) {
    return dados.promotionalPrice as number;
  }
  return dados.currentPrice ?? dados.agranelValue ?? 0;
}
