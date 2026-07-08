import { RecaptchaVerifier } from "firebase/auth";
import { Produto } from "@/lib/buildSystemPrompt";

declare global {
  interface Window {
    grecaptcha?: { reset: (widgetId?: number) => void };
    recaptchaVerifier?: RecaptchaVerifier;
    recaptchaWidgetId?: number;
  }
}

export type ListaFlowStage =
  | "await_confirm"
  | "await_mode"
  | "selecting_variant"
  | "await_next_item";

export interface ListaPedidoItem {
  termoOriginal: string;
  termoBusca: string;
  quantidade: number;
  candidatos: Produto[];
  selecionadoId?: string;
  cancelado?: boolean;
}

export interface ListaPedidoState {
  stage: ListaFlowStage;
  itens: ListaPedidoItem[];
  currentIndex: number;
}

export interface ItemUnicoQuantidadeState {
  termoBusca: string;
  termoDisplay: string;
  quantidade: number;
  stage: "confirm_single" | "choose_other";
  candidatos: Produto[];
  produtoSugerido?: Produto;
}

export interface CategoriaPaginadaState {
  categoria: string;
  produtosTodos: Produto[];  // todos os produtos da categoria (embaralhados)
  paginaAtual: number;       // qual página estamos (0, 1, 2, ...)
  ITENS_POR_PAGINA: number;  // sempre 6
}

export interface Mensagem {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  produtosCard?: Produto[]; // cards de produto exibidos junto à mensagem
  termoBusca?: string;      // termo usado para buscar esses produtos (para paginação)
  maxProdutos?: number;     // quantos produtos estão visíveis (começa em 6, cresce +6 por clique)
  suggestions?: string[];   // chips clicáveis gerados pelo [SUGGEST:...] do agente
  authCheckboxCard?: boolean; // card especial com checkboxes de login
  emailPasswordCard?: boolean; // card especial com formulário de e-mail/senha (fallback de SMS)
  isWelcomeCard?: boolean;    // card de apresentação inicial estilizado
  skeletonCardCount?: number; // quantidade de skeleton cards durante streaming
}
