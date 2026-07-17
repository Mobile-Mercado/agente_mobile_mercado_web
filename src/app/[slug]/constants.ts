import { FLOW_STATES, FlowState } from "@/lib/buildSystemPrompt";

// Sequência para calcular progresso da barra
export const CHECKOUT_SEQUENCE: FlowState[] = [
  FLOW_STATES.CHECKING_SAVED_ADDRESS,
  FLOW_STATES.COLLECTING_STREET,
  FLOW_STATES.COLLECTING_NUMBER,
  FLOW_STATES.COLLECTING_NEIGHBORHOOD,
  FLOW_STATES.COLLECTING_CITY,
  FLOW_STATES.COLLECTING_STATE,
  FLOW_STATES.COLLECTING_ZIPCODE,
  FLOW_STATES.ASKING_SAVE_ADDRESS,
  FLOW_STATES.COLLECTING_PAYMENT,
  FLOW_STATES.COLLECTING_CARD_BRAND,
  FLOW_STATES.COLLECTING_CHANGE,
  FLOW_STATES.COLLECTING_CPF,
  FLOW_STATES.CONFIRMING_ORDER,
];

export const ESTADO_LABEL: Record<FlowState, string> = {
  collecting_name:          "Nome",
  browsing:                 "Navegando",
  checking_saved_address:   "Endereço",
  collecting_street:        "Rua",
  collecting_number:        "Número",
  collecting_neighborhood:  "Bairro",
  collecting_city:          "Cidade",
  collecting_state:         "Estado",
  collecting_zipcode:       "CEP",
  asking_save_address:      "Salvar endereço",
  collecting_payment:       "Pagamento",
  collecting_card_brand:    "Bandeira",
  collecting_change:        "Troco",
  collecting_cpf:                "CPF",
  collecting_cpf_onboarding:     "CPF (cadastro)",
  confirming_order:              "Confirmando pedido",
};

// ============================================================
// TOUR ONBOARDING
// ============================================================
export const TOUR_KEY = "agente_tour_visto";
export const chatHistoryKey = (slug: string, userId: string) => `chat_msgs_${slug}_${userId}`;
export const CHAT_HISTORY_MAX = 100;
export const CHAT_HISTORY_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export const TOUR_STEPS = [
  {
    emoji: "👋",
    titulo: "Bem-vindo ao Assistente!",
    desc: "Sou seu assistente de vendas inteligente. Posso ajudar a encontrar produtos, montar e finalizar seu pedido pelo chat.",
  },
  {
    emoji: "🔍",
    titulo: "Peça vários produtos de uma vez",
    desc: `Digite algo como "quero 2 ovos, macarrão e um toddy" — eu encontro tudo, mostro os preços e adiciono ao carrinho.`,
  },
  {
    emoji: "🛒",
    titulo: "Acompanhe seu carrinho",
    desc: "Toque no ícone do carrinho para ver os itens. O pedido é finalizado diretamente aqui no chat, sem sair da página.",
  },
  {
    emoji: "💾",
    titulo: "Conversa salva automaticamente",
    desc: "Pode fechar o app e voltar depois — sua conversa fica salva. Use o ícone 🗑️ no topo para limpar e começar uma nova.",
  },
];
