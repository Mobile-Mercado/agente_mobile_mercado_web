export type SmsAuthGuardResult =
  | { ok: true }
  | { ok: false; reason: "cooldown"; retryAfterMs: number }
  | { ok: false; reason: "hourly-limit" | "daily-limit" | "invalid-phone" | "guard-unavailable" };

// Consulta a trava do servidor antes de disparar signInWithPhoneNumber/WhatsApp.
// Sem essa checagem, o unico controle de envio ficava no navegador (localStorage),
// que nao impede um bot ou varias abas de esgotar a cota de SMS.
export async function requestSmsSendPermission(phone: string): Promise<SmsAuthGuardResult> {
  try {
    const response = await fetch("/api/auth/sms/request-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone }),
    });
    const data = await response.json().catch(() => ({}));

    if (response.ok && data?.ok) return { ok: true };
    if (data?.reason === "cooldown") {
      return { ok: false, reason: "cooldown", retryAfterMs: Number(data.retryAfterMs) || 0 };
    }
    if (data?.reason === "hourly-limit" || data?.reason === "daily-limit" || data?.reason === "invalid-phone") {
      return { ok: false, reason: data.reason };
    }
    return { ok: false, reason: "guard-unavailable" };
  } catch {
    return { ok: false, reason: "guard-unavailable" };
  }
}

export function smsAuthGuardMessage(result: Extract<SmsAuthGuardResult, { ok: false }>): string {
  if (result.reason === "cooldown") {
    const seconds = Math.max(1, Math.ceil(result.retryAfterMs / 1000));
    return `Aguarde ${seconds}s antes de solicitar outro código.`;
  }
  if (result.reason === "hourly-limit" || result.reason === "daily-limit") {
    return "Muitas tentativas de envio de código no momento. Tente novamente mais tarde.";
  }
  if (result.reason === "invalid-phone") {
    return "Número inválido. Confira o DDD e os dígitos.";
  }
  return "Não foi possível validar o envio agora. Tente novamente em instantes.";
}
