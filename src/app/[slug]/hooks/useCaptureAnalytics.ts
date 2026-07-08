import { useCallback, useEffect, useRef, type MutableRefObject } from "react";
import type { User } from "firebase/auth";
import { registrarCapturaDadosAgente, type AgenteCaptureEventType } from "@/services/firestore";

interface UseCaptureAnalyticsResult {
  registrarCaptura: (
    eventType: AgenteCaptureEventType,
    eventKey: string,
    metadata?: Record<string, unknown>
  ) => void;
  capturaSessionIdRef: MutableRefObject<string>;
  capturaOrderCompletedRef: MutableRefObject<boolean>;
}

export function useCaptureAnalytics(
  companyId: string,
  rawSlug: string,
  authLoading: boolean,
  user: User | null,
  userDocId: string | null
): UseCaptureAnalyticsResult {
  const isGuestMode = process.env.NEXT_PUBLIC_GUEST_MODE === 'true';

  const capturaVisitorIdRef = useRef<string>('');
  const capturaSessionIdRef = useRef<string>('');
  const capturaUserDocIdRef = useRef<string | null>(null);
  const capturaOrderCompletedRef = useRef(false);
  const capturaEnteredWithoutLoginRef = useRef(false);

  const registrarCaptura = useCallback((
    eventType: AgenteCaptureEventType,
    eventKey: string,
    metadata?: Record<string, unknown>
  ) => {
    const visitorId = capturaVisitorIdRef.current;
    const sessionId = capturaSessionIdRef.current;
    if (!visitorId || !sessionId) return;

    registrarCapturaDadosAgente({
      eventId: `${companyId}:${eventKey}`,
      eventType,
      companyId,
      visitorId,
      sessionId,
      userDocId: capturaUserDocIdRef.current,
      metadata,
    }).catch(console.error);
  }, [companyId]);

  // -------- Visitante/sessão + registro de visita --------
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const makeId = () =>
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

    const visitorKey = 'agente_capturas_visitor_id';
    let visitorId = localStorage.getItem(visitorKey);
    if (!visitorId) {
      visitorId = makeId();
      localStorage.setItem(visitorKey, visitorId);
    }

    const sessionKey = `agente_capturas_session_id:${companyId}`;
    let sessionId = sessionStorage.getItem(sessionKey);
    const isNewSession = !sessionId;
    if (!sessionId) {
      sessionId = makeId();
      sessionStorage.setItem(sessionKey, sessionId);
    }

    capturaVisitorIdRef.current = visitorId;
    capturaSessionIdRef.current = sessionId;

    if (!isNewSession) return;

    const countKey = `agente_capturas_visit_count:${companyId}:${visitorId}`;
    const visitCount = Number(localStorage.getItem(countKey) ?? '0') + 1;
    localStorage.setItem(countKey, String(visitCount));

    registrarCaptura('site_visit', `${sessionId}:site_visit`, {
      rawSlug,
      path: window.location.pathname,
      visitCount,
    });
  }, [companyId, rawSlug, registrarCaptura]);

  useEffect(() => {
    capturaUserDocIdRef.current = userDocId;
  }, [userDocId]);

  useEffect(() => {
    if (authLoading || isGuestMode || capturaEnteredWithoutLoginRef.current) return;
    const needsLogin = !user || user.isAnonymous;
    if (!needsLogin) return;
    // So marca que a tela de login foi exibida; o evento so e registrado
    // se a pessoa sair sem concluir (ver registrarSaida abaixo).
    capturaEnteredWithoutLoginRef.current = true;
  }, [authLoading, isGuestMode, user]);

  useEffect(() => {
    const registrarSaida = () => {
      if (capturaEnteredWithoutLoginRef.current && !capturaUserDocIdRef.current) {
        registrarCaptura('login_failed', `${capturaSessionIdRef.current}:login_failed:abandoned`, {
          reason: 'abandoned_login_screen',
        });
      }
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') registrarSaida();
    };

    window.addEventListener('pagehide', registrarSaida);
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      window.removeEventListener('pagehide', registrarSaida);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [registrarCaptura]);

  return { registrarCaptura, capturaSessionIdRef, capturaOrderCompletedRef };
}
