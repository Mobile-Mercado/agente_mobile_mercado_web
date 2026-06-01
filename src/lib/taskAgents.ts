import type { CartItem, FlowState, NivelConfianca, Produto } from "@/lib/buildSystemPrompt";
import { FLOW_STATES } from "@/lib/buildSystemPrompt";
import {
  calcularScorePorTags,
  corrigirTextoBusca,
  detectarBuscaPorMarca,
  detectarContexto,
  detectarNomeContexto,
  ehBuscaPuraporMarca,
  extrairPalavrasBaseBusca,
  filtrarProdutos,
  filtrarProdutosWordKeys,
  normalizar,
  produtoCobreTermos,
  buscarProdutosPorMarca,
} from "@/lib/productSearch";
import {
  ehAcaoContinuarComprando,
  ehIntencaoCheckout,
  ehIntencaoSemProduto,
  ehSaudacaoCurta,
} from "@/lib/chatUtils";

export type TaskAgentKind =
  | "checkout"
  | "continue_shopping"
  | "collecting_data"
  | "order_confirmation"
  | "saved_address"
  | "brand_search"
  | "situational_context"
  | "product_search"
  | "small_talk"
  | "support";

export interface TaskAgentDecision {
  kind: TaskAgentKind;
  shouldUseLLM: boolean;
  promptHint: string;
}

export interface ProductDiscoveryResult {
  produtosFoco: Produto[];
  produtosMatchDireto: Produto[];
  contextoDetectado?: string;
  nivelConfianca?: NivelConfianca;
}

interface OrchestratorInput {
  texto: string;
  flowState: FlowState;
  carrinho: CartItem[];
  produtos: Produto[];
}

interface ProductDiscoveryInput {
  texto: string;
  produtos: Produto[];
  wordKeysEnabled: boolean;
  ultimosProdutosMostrados: Produto[];
}

export function runTaskOrchestrator({
  texto,
  flowState,
  carrinho,
  produtos,
}: OrchestratorInput): TaskAgentDecision {
  if (flowState === FLOW_STATES.CHECKING_SAVED_ADDRESS) {
    return decision("saved_address", true, "Resolver se o cliente quer usar endereco salvo ou informar um novo.");
  }

  if (flowState === FLOW_STATES.CONFIRMING_ORDER) {
    return decision("order_confirmation", true, "Validar confirmacao ou cancelamento do pedido.");
  }

  if (flowState !== FLOW_STATES.BROWSING) {
    return decision("collecting_data", true, "Coletar somente o dado pedido pelo estado atual.");
  }

  if (ehIntencaoCheckout(texto)) {
    return decision(
      "checkout",
      carrinho.length > 0,
      "Cliente quer finalizar; respeitar pedido minimo e nao buscar produtos."
    );
  }

  if (ehAcaoContinuarComprando(texto)) {
    return decision("continue_shopping", false, "Responder localmente e manter navegacao.");
  }

  if (ehSaudacaoCurta(texto) || ehIntencaoSemProduto(texto)) {
    return decision("small_talk", true, "Responder breve e redirecionar para compra.");
  }

  if (detectarContexto(texto).length > 0) {
    return decision("situational_context", true, "Usar especialista de contexto para selecionar produtos relacionados.");
  }

  const marca = detectarBuscaPorMarca(texto);
  if (marca || ehBuscaPuraporMarca(texto, produtos)) {
    return decision("brand_search", true, "Usar especialista de marca antes da busca geral.");
  }

  return decision("product_search", true, "Usar especialista de produtos e passar somente candidatos relevantes.");
}

export function runProductDiscoveryAgent({
  texto,
  produtos,
  wordKeysEnabled,
  ultimosProdutosMostrados,
}: ProductDiscoveryInput): ProductDiscoveryResult {
  const buscar = (t: string, cat: Produto[]) =>
    wordKeysEnabled ? filtrarProdutosWordKeys(t, cat) : filtrarProdutos(t, cat);

  const termosContexto = detectarContexto(texto);
  const nomeContexto = detectarNomeContexto(texto);
  if (termosContexto.length > 0) {
    const porContexto: Produto[] = [];
    const ids = new Set<string>();
    for (const termo of termosContexto) {
      for (const p of buscar(termo, produtos).slice(0, 4)) {
        if (!ids.has(p.id)) {
          ids.add(p.id);
          porContexto.push(p);
        }
      }
      if (porContexto.length >= 20) break;
    }

    return {
      produtosFoco: porContexto.slice(0, 20),
      produtosMatchDireto: porContexto.slice(0, 20),
      contextoDetectado: nomeContexto ?? undefined,
      nivelConfianca: porContexto.length > 0 ? "alto" : undefined,
    };
  }

  const marcaDetectada = detectarBuscaPorMarca(texto);
  if (marcaDetectada) {
    const produtosMarca = buscarProdutosPorMarca(marcaDetectada, produtos);
    if (produtosMarca.length > 0) {
      const foco = produtosMarca.slice(0, 20);
      return {
        produtosFoco: foco,
        produtosMatchDireto: foco,
        nivelConfianca: "alto",
      };
    }
  }

  const textoFinal = corrigirTextoBusca(texto, produtos);
  const filtrado = buscar(textoFinal, produtos);
  if (filtrado.length > 0) {
    return {
      produtosFoco: filtrado.slice(0, 20),
      produtosMatchDireto: filtrado,
      nivelConfianca: "alto",
    };
  }

  const fallback = buscarFallbackCampos(textoFinal, produtos)
    .sort((a, b) => calcularScorePorTags(b, texto) - calcularScorePorTags(a, texto));
  if (fallback.length > 0) {
    const foco = fallback.slice(0, 20);
    return {
      produtosFoco: foco,
      produtosMatchDireto: foco,
      nivelConfianca: "medio",
    };
  }

  const palavrasBase = extrairPalavrasBaseBusca(texto);
  if (palavrasBase.length > 0) {
    const porTermoPrincipal = buscar(palavrasBase[0], produtos);
    if (porTermoPrincipal.length > 0) {
      return {
        produtosFoco: porTermoPrincipal.slice(0, 20),
        produtosMatchDireto: [],
        nivelConfianca: "baixo",
      };
    }
  }

  const confirmacaoObvia =
    ehSaudacaoCurta(texto) ||
    ["sim", "ok", "pode", "vamo", "cla", "1", "2", "3", "4", "5", "tudo", "todos"].some(
      (t) => normalizar(texto).trim().startsWith(t)
    );

  return {
    produtosFoco: confirmacaoObvia ? ultimosProdutosMostrados : [],
    produtosMatchDireto: [],
  };
}

export function hasCompleteProductCoverage(texto: string, produtos: Produto[]): boolean {
  const palavrasBusca = extrairPalavrasBaseBusca(texto);
  return palavrasBusca.length < 2 || produtos.some((p) => produtoCobreTermos(p, palavrasBusca));
}

function buscarFallbackCampos(texto: string, produtos: Produto[]): Produto[] {
  const palavras = extrairPalavrasBaseBusca(texto);
  if (palavras.length === 0) return [];

  return produtos
    .filter((p) => {
      const corpus = normalizar([
        p.name,
        p.description,
        p.category,
        p.subcategory,
        ...(p.tags ?? []),
        ...(p.searchIndex ?? []),
        ...(p.wordKeys ?? []),
      ].join(" "));
      return palavras.every((w) => corpus.includes(w));
    })
    .slice(0, 20);
}

function decision(kind: TaskAgentKind, shouldUseLLM: boolean, promptHint: string): TaskAgentDecision {
  return { kind, shouldUseLLM, promptHint };
}
