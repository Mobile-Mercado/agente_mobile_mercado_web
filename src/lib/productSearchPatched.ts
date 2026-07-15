import type { Produto } from "@/lib/buildSystemPrompt";
import * as original from "./productSearch";

export * from "./productSearch";

type MedidaBase = "ml" | "g";
type MedidaNormalizada = { valor: number; base: MedidaBase };

const MEDIDA_RE = /(\d+(?:[.,]\d+)?)\s*(ml|l|lt|litro|litros|kg|kgs|quilo|quilos|g|gr|grama|gramas|mg)\b/gi;

function normalizarMedida(valor: number, unidadeRaw: string): MedidaNormalizada | null {
  const unidade = original.normalizar(unidadeRaw);

  if (unidade === "ml") return { valor, base: "ml" };
  if (["l", "lt", "litro", "litros"].includes(unidade)) {
    return { valor: valor * 1000, base: "ml" };
  }
  if (unidade === "mg") return { valor: valor / 1000, base: "g" };
  if (["g", "gr", "grama", "gramas"].includes(unidade)) {
    return { valor, base: "g" };
  }
  if (["kg", "kgs", "quilo", "quilos"].includes(unidade)) {
    return { valor: valor * 1000, base: "g" };
  }

  return null;
}

function extrairMedidas(texto: string): MedidaNormalizada[] {
  const medidas: MedidaNormalizada[] = [];
  const normalizado = original.normalizar(texto || "");

  for (const match of normalizado.matchAll(MEDIDA_RE)) {
    const valor = Number(String(match[1]).replace(",", "."));
    if (!Number.isFinite(valor)) continue;

    const medida = normalizarMedida(valor, match[2] ?? "");
    if (medida) medidas.push(medida);
  }

  return medidas;
}

function produtoTemMedidaExata(produto: Produto, medidaBusca: MedidaNormalizada): boolean {
  const textos = [
    produto.name,
    ...(produto.tags ?? []),
    ...(produto.wordKeys ?? []),
    ...(produto.searchIndex ?? []),
  ];

  return textos
    .flatMap(extrairMedidas)
    .some((medidaProduto) =>
      medidaProduto.base === medidaBusca.base &&
      Math.abs(medidaProduto.valor - medidaBusca.valor) < 0.001
    );
}

/**
 * Mantém a busca original, mas transforma a medida explicitamente solicitada
 * em requisito. Ex.: "arroz 5kg" não pode retornar arroz de 1kg como se fosse
 * uma correspondência válida. Quando não existe a medida exata, o chamador
 * recebe uma lista vazia e pode seguir para o fallback de alternativas.
 */
export function filtrarProdutos(texto: string, produtos: Produto[]): Produto[] {
  const resultados = original.filtrarProdutos(texto, produtos);
  const medidaBusca = extrairMedidas(texto)[0];

  if (!medidaBusca) return resultados;

  return resultados.filter((produto) => produtoTemMedidaExata(produto, medidaBusca));
}

export function filtrarProdutosWordKeys(texto: string, produtos: Produto[]): Produto[] {
  return filtrarProdutos(texto, produtos);
}
