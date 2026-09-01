type TimestampLike = { toMillis(): number };

type MomentoOuNulo = TimestampLike | number | null | undefined;

export interface DadosPrecoProduto {
  currentPrice?: number | null;
  agranelValue?: number | null;
  promotionalPrice?: number | null;
  promotionStartAt?: MomentoOuNulo;
  promotionEndAt?: MomentoOuNulo;
}

function paraMillis(momento: MomentoOuNulo): number | null {
  if (momento === null || momento === undefined) return null;
  if (typeof momento === 'number') return momento;
  return momento.toMillis();
}

function promocaoComecou(dados: DadosPrecoProduto, agoraMillis: number): boolean {
  const inicio = paraMillis(dados.promotionStartAt);
  return inicio === null || inicio <= agoraMillis;
}

function promocaoNaoExpirou(dados: DadosPrecoProduto, agoraMillis: number): boolean {
  const fim = paraMillis(dados.promotionEndAt);
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
