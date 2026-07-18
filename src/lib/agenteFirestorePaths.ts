export const AGENTES_COLLECTION = "Agentes";
export const AGENTE_VENDAS_DOC = "AgenteVendas";
export const LEGACY_AGENTE_VENDAS_COLLECTION = "AgenteVendas";

export const AGENTE_USERS_COLLECTION = "Usuarios";
export const AGENTE_CONVERSAS_COLLECTION = "conversas";
export const AGENTE_MENSAGENS_COLLECTION = "mensagens";
export const AGENTE_EXEMPLOS_COLLECTION = "ExemplosConversa";
export const AGENTE_CAPTURE_EVENTS_COLLECTION = "CapturasDados";
export const AGENTE_CAPTURE_METRICS_COLLECTION = "MetricasCapturasPorEstabelecimento";
export const AGENTE_RESPONSE_TIMES_COLLECTION = "TemposResposta";
export const AGENTE_FEEDBACKS_COLLECTION = "NotasEFeedbacks";
export const AGENTE_SEARCH_TERMS_COLLECTION = "TermosBuscadosPorEstabelecimento";
export const AGENTE_SEARCH_TERMS_SUBCOLLECTION = "termos";

function cleanDocId(value: string): string {
  return value.replace(/\//g, "_").slice(0, 500);
}

export function agenteBasePath(): [string, string] {
  return [AGENTES_COLLECTION, AGENTE_VENDAS_DOC];
}

export function agenteUserPath(userId: string): [string, string, string, string] {
  return [...agenteBasePath(), AGENTE_USERS_COLLECTION, userId];
}

export function agenteConversasPath(userId: string): [string, string, string, string, string] {
  return [...agenteUserPath(userId), AGENTE_CONVERSAS_COLLECTION];
}

export function agenteConversaPath(userId: string, conversaId: string): [string, string, string, string, string, string] {
  return [...agenteConversasPath(userId), conversaId];
}

export function agenteMensagensPath(userId: string, conversaId: string): [string, string, string, string, string, string, string] {
  return [...agenteConversaPath(userId, conversaId), AGENTE_MENSAGENS_COLLECTION];
}

export function legacyAgenteUserPath(userId: string): [string, string] {
  return [LEGACY_AGENTE_VENDAS_COLLECTION, userId];
}

export function legacyAgenteConversasPath(userId: string): [string, string, string] {
  return [...legacyAgenteUserPath(userId), AGENTE_CONVERSAS_COLLECTION];
}

export function legacyAgenteConversaPath(userId: string, conversaId: string): [string, string, string, string] {
  return [...legacyAgenteConversasPath(userId), conversaId];
}

export function legacyAgenteMensagensPath(userId: string, conversaId: string): [string, string, string, string, string] {
  return [...legacyAgenteConversaPath(userId, conversaId), AGENTE_MENSAGENS_COLLECTION];
}

export function agenteCaptureEventDocId(companyId: string, eventId: string): string {
  return cleanDocId(`${companyId}__${eventId}`);
}

export function agenteResponseTimeDocId(companyId: string, eventId: string): string {
  return cleanDocId(`${companyId}__${eventId}`);
}
