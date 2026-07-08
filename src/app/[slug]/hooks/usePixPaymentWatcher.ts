import { useEffect, useRef } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Mensagem } from "../types";

export function usePixPaymentWatcher(
  pendingPixOrderId: string | null,
  setPendingPixOrderId: (id: string | null) => void,
  setMensagens: (updater: (prev: Mensagem[]) => Mensagem[]) => void
): void {
  const pixPaidNotifiedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!pendingPixOrderId) return;

    const unsub = onSnapshot(doc(db, "PurchaseRequests", pendingPixOrderId), (snap) => {
      if (!snap.exists() || pixPaidNotifiedRef.current.has(pendingPixOrderId)) return;

      const data = snap.data() as { paymentStatus?: string; orderNumber?: string; total?: number };
      const paymentStatus = String(data.paymentStatus ?? "").toLowerCase();
      if (paymentStatus !== "paid") return;

      pixPaidNotifiedRef.current.add(pendingPixOrderId);
      setPendingPixOrderId(null);
      setMensagens((prev) => [
        ...prev,
        {
          id: `pix-paid-${pendingPixOrderId}`,
          role: "assistant" as const,
          content: `✅ PIX do pedido #${data.orderNumber ?? ""} confirmado com sucesso!\n\nSeu pedido já foi recebido e seguirá para preparação.`,
          timestamp: new Date(),
          suggestions: ["Continuar comprando"],
        },
      ]);
    });

    return () => unsub();
  }, [pendingPixOrderId, setPendingPixOrderId, setMensagens]);
}
