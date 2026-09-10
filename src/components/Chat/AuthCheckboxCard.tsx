import React, { useRef, useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

interface AuthCheckboxCardProps {
  authKeepLogged: boolean;
  onChangeKeepLogged: (val: boolean) => void;
  authAcceptTerms: boolean;
  onChangeAcceptTerms: (val: boolean) => void;
  authSending: boolean;
  resendDisabled?: boolean;
  resendLabel?: string;
  onResend: () => void;
  showEmailFallback?: boolean;
  onEmailFallbackClick?: () => void;
  code?: string;
  onChangeCode?: (val: string) => void;
  onSubmitCode?: () => void;
  codeError?: string;
}

const AuthCheckboxCard: React.FC<AuthCheckboxCardProps> = ({
  authKeepLogged,
  onChangeKeepLogged,
  authAcceptTerms,
  onChangeAcceptTerms,
  authSending,
  resendDisabled = false,
  resendLabel = "Reenviar código",
  onResend,
  showEmailFallback = false,
  onEmailFallbackClick,
  code = "",
  onChangeCode,
  onSubmitCode,
  codeError = "",
}) => {
  const isResendDisabled = authSending || resendDisabled;
  const inputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (onChangeCode) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [onChangeCode]);

  const handleDigitChange = (val: string) => {
    const cleaned = val.replace(/\D/g, "").slice(0, 6);
    onChangeCode?.(cleaned);
  };

  const isComplete = code.length === 6;
  const canSubmit = isComplete && !authSending;

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 16,
        padding: "16px 18px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        display: "flex",
        flexDirection: "column",
        gap: 12,
        maxWidth: 320,
        width: "100%",
        border: "1px solid #e2e8f0",
      }}
    >
      {/* Bloco do Código de 6 Dígitos */}
      {onChangeCode && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#1e293b" }}>
              Código de verificação
            </span>
            <span style={{ fontSize: "0.78rem", color: isComplete ? "#16a34a" : "#64748b", fontWeight: 500 }}>
              {code.length}/6 dígitos
            </span>
          </div>

          {/* Slots interativos com input invisível sobreposto */}
          <div
            style={{
              position: "relative",
              width: "100%",
              cursor: "text",
            }}
            onClick={() => inputRef.current?.focus()}
          >
            <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
              {[0, 1, 2, 3, 4, 5].map((i) => {
                const char = code[i] || "";
                const isCurrent = (i === code.length || (i === 5 && isComplete)) && isFocused;
                return (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      height: 48,
                      borderRadius: 8,
                      border: `2px solid ${
                        isCurrent
                          ? "#193281"
                          : char
                          ? "#3b82f6"
                          : "#cbd5e1"
                      }`,
                      background: isCurrent ? "#fff" : char ? "#eff6ff" : "#f8fafc",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.3rem",
                      fontWeight: 700,
                      color: "#1e293b",
                      boxShadow: isCurrent
                        ? "0 0 0 3px rgba(25, 50, 129, 0.12)"
                        : "none",
                      transition: "all 0.15s ease",
                    }}
                  >
                    {char || (isCurrent ? (
                      <span
                        style={{
                          display: "inline-block",
                          width: 2,
                          height: 20,
                          backgroundColor: "#193281",
                          animation: "auth-cursor-blink 1s step-end infinite",
                        }}
                      />
                    ) : (
                      <span style={{ color: "#94a3b8", fontSize: "0.9rem" }}>-</span>
                    ))}
                  </div>
                );
              })}
            </div>

            {/* Input real sobreposto */}
            <input
              ref={inputRef}
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]*"
              maxLength={6}
              value={code}
              onChange={(e) => handleDigitChange(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && canSubmit) {
                  e.preventDefault();
                  onSubmitCode?.();
                }
              }}
              autoFocus
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                opacity: 0,
                fontSize: "16px",
                cursor: "text",
                zIndex: 2,
              }}
              aria-label="Código de verificação de 6 dígitos"
            />
          </div>

          {codeError && (
            <p style={{ margin: 0, fontSize: "0.82rem", color: "#dc2626", fontWeight: 500 }}>
              {codeError}
            </p>
          )}

          {/* Botão de confirmação no próprio card */}
          {onSubmitCode && (
            <button
              type="button"
              onClick={onSubmitCode}
              disabled={!canSubmit}
              style={{
                marginTop: 2,
                width: "100%",
                padding: "11px 16px",
                borderRadius: 8,
                border: "none",
                background: canSubmit ? "#193281" : "#94a3b8",
                color: "#fff",
                fontSize: "0.92rem",
                fontWeight: 600,
                cursor: canSubmit ? "pointer" : "not-allowed",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                transition: "background 0.2s",
              }}
            >
              {authSending ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Verificando...
                </>
              ) : (
                "Confirmar código"
              )}
            </button>
          )}
        </div>
      )}

      {/* Checkboxes */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10, borderTop: onChangeCode ? "1px solid #f1f5f9" : "none", paddingTop: onChangeCode ? 8 : 0 }}>
        <label style={{ display: "flex", alignItems: "center", gap: 10, fontSize: "0.86rem", color: "#374151", cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={authKeepLogged}
            onChange={(e) => onChangeKeepLogged(e.target.checked)}
            style={{ width: 18, height: 18, accentColor: "#193281", flexShrink: 0 }}
          />
          Continuar logado
        </label>

        <label style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: "0.86rem", color: "#374151", cursor: "pointer", lineHeight: 1.4 }}>
          <input
            type="checkbox"
            checked={authAcceptTerms}
            onChange={(e) => onChangeAcceptTerms(e.target.checked)}
            style={{ width: 18, height: 18, accentColor: "#193281", marginTop: 1, flexShrink: 0 }}
          />
          <span>
            Li e aceito os{" "}
            <a href="#" style={{ color: "#193281", textDecoration: "underline" }}>Termos de Uso</a>
            {" "}e a{" "}
            <a href="https://www.mobilemercado.com.br/declaracao-de-privacidade" style={{ color: "#193281", textDecoration: "underline" }} target="_blank" rel="noopener noreferrer">Política de Privacidade</a>
          </span>
        </label>
      </div>

      {/* Links de suporte */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6, paddingTop: 2 }}>
        <button
          onClick={onResend}
          disabled={isResendDisabled}
          style={{
            background: "none",
            border: "none",
            color: isResendDisabled ? "#9ca3af" : "#193281",
            fontSize: "0.82rem",
            cursor: isResendDisabled ? "not-allowed" : "pointer",
            textDecoration: "underline",
            padding: 0,
            textAlign: "left",
            fontWeight: 500,
          }}
        >
          {resendLabel}
        </button>

        {showEmailFallback && onEmailFallbackClick && (
          <button
            onClick={onEmailFallbackClick}
            style={{
              background: "none",
              border: "none",
              color: "#6b7280",
              fontSize: "0.82rem",
              cursor: "pointer",
              textDecoration: "underline",
              padding: 0,
              textAlign: "left",
            }}
          >
            Não recebeu o código? Entrar com e-mail e senha
          </button>
        )}
      </div>

      {/* Animação do cursor piscante */}
      <style>{`
        @keyframes auth-cursor-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default AuthCheckboxCard;
