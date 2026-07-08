import React from "react";

interface EmailPasswordCardProps {
  email: string;
  onChangeEmail: (val: string) => void;
  password: string;
  onChangePassword: (val: string) => void;
  authKeepLogged: boolean;
  onChangeKeepLogged: (val: boolean) => void;
  authAcceptTerms: boolean;
  onChangeAcceptTerms: (val: boolean) => void;
  errorMessage?: string;
  sending: boolean;
  onSubmit: () => void;
  onBack: () => void;
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  padding: "10px 12px",
  borderRadius: 8,
  border: "1px solid #d1d5db",
  fontSize: "0.9rem",
  color: "#374151",
};

const linkButtonStyle: React.CSSProperties = {
  background: "none",
  border: "none",
  color: "#6b7280",
  fontSize: "0.82rem",
  cursor: "pointer",
  textDecoration: "underline",
  padding: 0,
  textAlign: "left",
};

const EmailPasswordCard: React.FC<EmailPasswordCardProps> = ({
  email,
  onChangeEmail,
  password,
  onChangePassword,
  authKeepLogged,
  onChangeKeepLogged,
  authAcceptTerms,
  onChangeAcceptTerms,
  errorMessage,
  sending,
  onSubmit,
  onBack,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !sending) onSubmit();
  };

  return (
    <div style={{
      background: "#fff",
      borderRadius: 14,
      padding: "14px 16px",
      boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
      display: "flex",
      flexDirection: "column",
      gap: 12,
      maxWidth: 300,
    }}>
      <span style={{ fontSize: "0.88rem", color: "#374151", fontWeight: 600 }}>
        Entrar com e-mail e senha
      </span>

      <input
        type="email"
        placeholder="seu@email.com"
        value={email}
        onChange={(e) => onChangeEmail(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={sending}
        style={inputStyle}
      />

      <input
        type="password"
        placeholder="Senha (mínimo 6 caracteres)"
        value={password}
        onChange={(e) => onChangePassword(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={sending}
        style={inputStyle}
      />

      {errorMessage && (
        <span style={{ fontSize: "0.82rem", color: "#dc2626" }}>{errorMessage}</span>
      )}

      <label style={{ display: "flex", alignItems: "center", gap: 10, fontSize: "0.88rem", color: "#374151", cursor: "pointer" }}>
        <input
          type="checkbox"
          checked={authKeepLogged}
          onChange={(e) => onChangeKeepLogged(e.target.checked)}
          style={{ width: 18, height: 18, accentColor: "#193281", flexShrink: 0 }}
        />
        Continuar logado
      </label>

      <label style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: "0.88rem", color: "#374151", cursor: "pointer", lineHeight: 1.4 }}>
        <input
          type="checkbox"
          checked={authAcceptTerms}
          onChange={(e) => onChangeAcceptTerms(e.target.checked)}
          style={{ width: 18, height: 18, accentColor: "#193281", marginTop: 1, flexShrink: 0 }}
        />
        <span>
          Li e aceito os{" "}
          <a href="#" style={{ color: "#193281" }}>Termos de Uso</a>
          {" "}e a{" "}
          <a href="https://www.mobilemercado.com.br/declaracao-de-privacidade" style={{ color: "#193281" }} target="_blank" rel="noopener noreferrer">Política de Privacidade</a>
        </span>
      </label>

      <button
        onClick={onSubmit}
        disabled={sending}
        style={{
          background: "#193281",
          color: "#fff",
          border: "none",
          borderRadius: 8,
          padding: "10px 14px",
          fontSize: "0.9rem",
          fontWeight: 600,
          cursor: sending ? "not-allowed" : "pointer",
          opacity: sending ? 0.7 : 1,
        }}
      >
        {sending ? "Entrando…" : "Continuar"}
      </button>

      <button onClick={onBack} disabled={sending} style={linkButtonStyle}>
        Voltar
      </button>
    </div>
  );
};

export default EmailPasswordCard;
