"use client";
import React, { useState, useEffect } from "react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Check, Copy, Loader2, LogOut, MapPin, Package, Save, SlidersHorizontal, X, User } from "lucide-react";
import type { EnderecoSalvo } from "@/lib/buildSystemPrompt";
import { buscarPedidosDoUsuario, type Pedido } from "@/services/firestore";
import styles from "./SettingsPanel.module.css";

const EMPTY_ENDERECO: EnderecoSalvo = {
  street: "", number: "", neighborhood: "", city: "", state: "", zipCode: "",
};

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  precisaLogin: boolean;
  isGuestMode: boolean;
  nomeCliente: string;
  userCpf: string;
  userPhone: string;
  companyId?: string;
  userDocId?: string | null;
  enderecoSalvo: EnderecoSalvo | null;
  onSalvarPerfil: (dados: { nome: string; cpf: string; telefone: string }) => Promise<void>;
  onSalvarEndereco: (end: EnderecoSalvo) => Promise<void>;
  onLogout: () => void;
  carouselEnabled: boolean;
  onCarouselChange: (val: boolean) => void;
  wordKeysEnabled: boolean;
  onWordKeysChange: (val: boolean) => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  isOpen,
  onClose,
  precisaLogin,
  isGuestMode,
  nomeCliente,
  userCpf,
  userPhone,
  companyId = "",
  userDocId = null,
  enderecoSalvo,
  onSalvarPerfil,
  onSalvarEndereco,
  onLogout,
  carouselEnabled,
  onCarouselChange,
  wordKeysEnabled,
  onWordKeysChange,
}) => {
  const [editNome, setEditNome]   = useState("");
  const [editCpf, setEditCpf]     = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editEnd, setEditEnd]     = useState<EnderecoSalvo>(EMPTY_ENDERECO);
  const [salvandoPerfil, setSalvandoPerfil]   = useState(false);
  const [salvandoEnd, setSalvandoEnd]         = useState(false);
  const [feedbackPerfil, setFeedbackPerfil]   = useState("");
  const [feedbackEnd, setFeedbackEnd]         = useState("");
  const [pedidos, setPedidos]                 = useState<Pedido[]>([]);
  const [carregandoPedidos, setCarregandoPedidos] = useState(false);
  const [acaoPedidoId, setAcaoPedidoId]       = useState<string | null>(null);
  const [feedbackPedido, setFeedbackPedido]   = useState("");
  const [pixCopiadoId, setPixCopiadoId]       = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setEditNome(nomeCliente);
      setEditCpf(userCpf);
      setEditPhone(userPhone);
      setEditEnd(enderecoSalvo ?? EMPTY_ENDERECO);
      setFeedbackPerfil("");
      setFeedbackEnd("");
      setFeedbackPedido("");
    }
  }, [isOpen, nomeCliente, userCpf, userPhone, enderecoSalvo]);

  useEffect(() => {
    if (!isOpen || precisaLogin || !companyId || !userDocId) {
      setPedidos([]);
      return;
    }

    let ativo = true;
    setCarregandoPedidos(true);
    buscarPedidosDoUsuario(companyId, userDocId, 10)
      .then((lista) => {
        if (ativo) setPedidos(lista);
      })
      .catch((error) => {
        console.error("Erro ao buscar pedidos:", error);
        if (ativo) setFeedbackPedido("Erro ao carregar pedidos.");
      })
      .finally(() => {
        if (ativo) setCarregandoPedidos(false);
      });

    return () => { ativo = false; };
  }, [companyId, isOpen, precisaLogin, userDocId]);

  const handleSalvarPerfil = async () => {
    setSalvandoPerfil(true);
    setFeedbackPerfil("");
    try {
      await onSalvarPerfil({ nome: editNome.trim(), cpf: editCpf.trim(), telefone: editPhone.trim() });
      setFeedbackPerfil("Salvo!");
      setTimeout(() => setFeedbackPerfil(""), 2000);
    } catch {
      setFeedbackPerfil("Erro ao salvar.");
    } finally {
      setSalvandoPerfil(false);
    }
  };

  const handleSalvarEndereco = async () => {
    setSalvandoEnd(true);
    setFeedbackEnd("");
    try {
      await onSalvarEndereco(editEnd);
      setFeedbackEnd("Salvo!");
      setTimeout(() => setFeedbackEnd(""), 2000);
    } catch {
      setFeedbackEnd("Erro ao salvar.");
    } finally {
      setSalvandoEnd(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      onClose();
      onLogout();
    } catch (error) {
      console.error("Erro ao sair:", error);
    }
  };

  const statusLimpo = (status: string) => status.replace(/^PurchaseStatus\./, "");

  const labelStatus = (status: string) => {
    const clean = statusLimpo(status);
    const labels: Record<string, string> = {
      waitingForOrderPayment: "Aguardando pagamento",
      waitingForPayment: "Aguardando pagamento",
      pending: "Pendente",
      accepted: "Aceito",
      preparing: "Preparando",
      delivering: "Em entrega",
      delivered: "Entregue",
      canceled: "Cancelado",
      refundRequested: "Reembolso solicitado",
    };
    return labels[clean] ?? (clean || "Status indisponivel");
  };

  const acaoPedido = (pedido: Pedido) => {
    const clean = statusLimpo(pedido.currentPurchaseStatus);
    if (clean === "waitingForOrderPayment" || clean === "waitingForPayment") return "Cancelar pedido";
    if (clean === "pending") return "Cancelar pedido";
    if (["accepted", "preparing", "delivering", "delivered"].includes(clean)) return "Solicitar cancelamento";
    return "";
  };

  const formatarData = (value: unknown) => {
    const date =
      value && typeof value === "object" && "toDate" in value && typeof (value as { toDate: () => Date }).toDate === "function"
        ? (value as { toDate: () => Date }).toDate()
        : null;
    return date ? date.toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }) : "";
  };

  const copiarPix = async (pedido: Pedido) => {
    if (!pedido.paymentPixCopyPasteKey) return;
    await navigator.clipboard.writeText(pedido.paymentPixCopyPasteKey);
    setPixCopiadoId(pedido.id);
    window.setTimeout(() => setPixCopiadoId(null), 1600);
  };

  const handleAcaoPedido = async (pedido: Pedido) => {
    const label = acaoPedido(pedido);
    if (!label || !userDocId) return;

    const motivo = window.prompt(`${label} #${pedido.orderNumber}. Informe o motivo:`);
    if (motivo === null) return;

    setAcaoPedidoId(pedido.id);
    setFeedbackPedido("");
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch("/api/pedidos/acao", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ pedidoId: pedido.id, userDocId, motivo }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Erro ao processar pedido.");
      setFeedbackPedido(data.message || "Solicitacao registrada.");
      if (typeof data.updatedStatus === "string") {
        setPedidos((prev) => prev.map((item) => (
          item.id === pedido.id ? { ...item, currentPurchaseStatus: data.updatedStatus } : item
        )));
      }
      if (companyId) setPedidos(await buscarPedidosDoUsuario(companyId, userDocId, 10));
    } catch (error) {
      const message = error instanceof TypeError
        ? "Nao foi possivel conectar ao servidor de pedidos. Publique a versao atual no Firebase/Render e tente novamente."
        : error instanceof Error
          ? error.message
          : "Erro ao processar pedido.";
      setFeedbackPedido(message);
    } finally {
      setAcaoPedidoId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className={styles.backdrop} onClick={onClose} />
      <div className={`${styles.panel} ${styles.panelOpen}`}>
        <div className={styles.panelHeader}>
          <span className={styles.panelTitle}>Configurações</span>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Fechar">
            <X size={20} />
          </button>
        </div>

        <div className={styles.body}>
          {!precisaLogin && (
            <>
              {/* Dados pessoais */}
              <div className={styles.section}>
                <div className={styles.sectionTitle}>
                  <Package size={15} />
                  <span>Pedidos</span>
                </div>
                {feedbackPedido && <div className={styles.orderFeedback}>{feedbackPedido}</div>}
                {carregandoPedidos ? (
                  <div className={styles.orderEmpty}>
                    <Loader2 size={16} className={styles.spin} />
                    Carregando pedidos...
                  </div>
                ) : pedidos.length === 0 ? (
                  <div className={styles.orderEmpty}>Nenhum pedido encontrado nesta conta.</div>
                ) : (
                  <div className={styles.orderList}>
                    {pedidos.map((pedido) => {
                      const buttonLabel = acaoPedido(pedido);
                      const qrSrc = pedido.paymentPixQrCodeUrl || pedido.paymentPixQrCode || "";
                      return (
                        <div className={styles.orderCard} key={pedido.id}>
                          <div className={styles.orderTop}>
                            <div>
                              <div className={styles.orderNumber}>Pedido #{pedido.orderNumber}</div>
                              <div className={styles.orderDate}>{formatarData(pedido.createdAt)}</div>
                            </div>
                            <span className={styles.orderStatus}>{labelStatus(pedido.currentPurchaseStatus)}</span>
                          </div>
                          <div className={styles.orderMeta}>
                            <span>Total: <b>R$ {Number(pedido.total ?? 0).toFixed(2).replace(".", ",")}</b></span>
                            <span>Entrega: {formatarData(pedido.estimatedTimeDelivery?.date ?? pedido.scheduling) || `${pedido.estimatedTimeDelivery?.intervalMinutes ?? 60} min`}</span>
                          </div>
                          <div className={styles.orderItems}>
                            {pedido.productsCart?.slice(0, 3).map((item, idx) => (
                              <span key={`${pedido.id}-${idx}`}>{item.quantity}x {item.product?.name ?? "Produto"}</span>
                            ))}
                          </div>
                          {pedido.paymentPixCopyPasteKey && (
                            <div className={styles.pixBox}>
                              {qrSrc && <img src={qrSrc} alt="QR Code Pix" className={styles.pixImage} />}
                              <textarea className={styles.pixTextarea} value={pedido.paymentPixCopyPasteKey} readOnly />
                              <button className={styles.pixCopyBtn} onClick={() => copiarPix(pedido)}>
                                {pixCopiadoId === pedido.id ? <Check size={14} /> : <Copy size={14} />}
                                {pixCopiadoId === pedido.id ? "Copiado" : "Copiar Pix"}
                              </button>
                            </div>
                          )}
                          {buttonLabel && (
                            <button
                              className={styles.orderActionBtn}
                              onClick={() => handleAcaoPedido(pedido)}
                              disabled={acaoPedidoId === pedido.id}
                            >
                              {acaoPedidoId === pedido.id ? "Processando..." : buttonLabel}
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className={styles.divider} />

              {/* Dados pessoais */}
              <div className={styles.section}>
                <div className={styles.sectionTitle}>
                  <User size={15} />
                  <span>Dados Pessoais</span>
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Nome</label>
                  <input className={styles.input} type="text" value={editNome}
                    onChange={(e) => setEditNome(e.target.value)}
                    placeholder="Como você gostaria de ser chamado?" />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>CPF</label>
                  <input className={styles.input} type="text" value={editCpf}
                    onChange={(e) => setEditCpf(e.target.value)}
                    placeholder="000.000.000-00" inputMode="numeric" />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Telefone</label>
                  <input className={styles.input} type="tel" value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="+55 (00) 00000-0000" inputMode="tel" />
                </div>
                <div className={styles.saveRow}>
                  {feedbackPerfil && <span className={styles.feedback}>{feedbackPerfil}</span>}
                  <button className={styles.saveBtn} onClick={handleSalvarPerfil} disabled={salvandoPerfil}>
                    <Save size={14} />
                    {salvandoPerfil ? "Salvando..." : "Salvar dados"}
                  </button>
                </div>
              </div>

              <div className={styles.divider} />

              {/* Endereço */}
              <div className={styles.section}>
                <div className={styles.sectionTitle}>
                  <MapPin size={15} />
                  <span>Endereço de Entrega</span>
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Rua / Avenida</label>
                  <input className={styles.input} type="text" value={editEnd.street}
                    onChange={(e) => setEditEnd((p) => ({ ...p, street: e.target.value }))}
                    placeholder="Ex: Rua das Flores" />
                </div>
                <div className={styles.fieldRow}>
                  <div className={styles.field} style={{ flex: 2 }}>
                    <label className={styles.label}>Bairro</label>
                    <input className={styles.input} type="text" value={editEnd.neighborhood}
                      onChange={(e) => setEditEnd((p) => ({ ...p, neighborhood: e.target.value }))}
                      placeholder="Bairro" />
                  </div>
                  <div className={styles.field} style={{ flex: 1 }}>
                    <label className={styles.label}>Número</label>
                    <input className={styles.input} type="text" value={editEnd.number}
                      onChange={(e) => setEditEnd((p) => ({ ...p, number: e.target.value }))}
                      placeholder="Nº" />
                  </div>
                </div>
                <div className={styles.fieldRow}>
                  <div className={styles.field} style={{ flex: 2 }}>
                    <label className={styles.label}>Cidade</label>
                    <input className={styles.input} type="text" value={editEnd.city}
                      onChange={(e) => setEditEnd((p) => ({ ...p, city: e.target.value }))}
                      placeholder="Cidade" />
                  </div>
                  <div className={styles.field} style={{ flex: 1 }}>
                    <label className={styles.label}>Estado</label>
                    <input className={styles.input} type="text" value={editEnd.state}
                      onChange={(e) => setEditEnd((p) => ({ ...p, state: e.target.value }))}
                      placeholder="UF" maxLength={2} />
                  </div>
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>CEP</label>
                  <input className={styles.input} type="text" value={editEnd.zipCode}
                    onChange={(e) => setEditEnd((p) => ({ ...p, zipCode: e.target.value }))}
                    placeholder="00000-000" inputMode="numeric" />
                </div>
                <div className={styles.saveRow}>
                  {feedbackEnd && <span className={styles.feedback}>{feedbackEnd}</span>}
                  <button className={styles.saveBtn} onClick={handleSalvarEndereco} disabled={salvandoEnd}>
                    <Save size={14} />
                    {salvandoEnd ? "Salvando..." : "Salvar endereço"}
                  </button>
                </div>
              </div>

              <div className={styles.divider} />

              {/* Configurações de teste — só modo convidado */}
              {isGuestMode && (
                <>
                  <div className={styles.section}>
                    <div className={styles.sectionTitle}>
                      <SlidersHorizontal size={15} />
                      <span>Configurações de Teste</span>
                    </div>
                    <label className={styles.toggleRow}>
                      <span className={styles.toggleLabel}>Carrossel horizontal de produtos</span>
                      <input type="checkbox" className={styles.checkbox}
                        checked={carouselEnabled}
                        onChange={(e) => onCarouselChange(e.target.checked)} />
                    </label>
                    <label className={styles.toggleRow}>
                      <span className={styles.toggleLabel}>Busca por wordKeys/searchIndex</span>
                      <input type="checkbox" className={styles.checkbox}
                        checked={wordKeysEnabled}
                        onChange={(e) => onWordKeysChange(e.target.checked)} />
                    </label>
                  </div>
                  <div className={styles.divider} />
                </>
              )}


              {/* Logout */}
              <button className={styles.logoutBtn} onClick={handleLogout}>
                <LogOut size={16} />
                <span>Sair da conta</span>
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default SettingsPanel;
