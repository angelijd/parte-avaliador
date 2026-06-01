import { useState } from "react";

const COLORS = {
  P: { main: "#0F6E56", light: "#E1F5EE", label: "Papel" },
  A: { main: "#BA7517", light: "#FAEEDA", label: "Ação" },
  R: { main: "#185FA5", light: "#E6F1FB", label: "Resultado" },
  T: { main: "#993556", light: "#FBEAF0", label: "Tom" },
  E: { main: "#5F5E5A", light: "#F1EFE8", label: "Exclusões" },
};

const NOTA_CONFIG = {
  bom:      { label: "Bom",             emoji: "✦", bg: "#E1F5EE", color: "#0F6E56", border: "#5DCAA5" },
  mediano:  { label: "Mediano",         emoji: "◈", bg: "#FAEEDA", color: "#BA7517", border: "#EF9F27" },
  melhorar: { label: "Precisa melhorar",emoji: "◇", bg: "#FCEBEB", color: "#A32D2D", border: "#F09595" },
};

const STATUS = {
  presente: { label: "Presente", color: "#0F6E56", bg: "#E1F5EE" },
  parcial:  { label: "Parcial",  color: "#BA7517", bg: "#FAEEDA" },
  ausente:  { label: "Ausente",  color: "#A32D2D", bg: "#FCEBEB" },
};

export default function App() {
  const [prompt, setPrompt]       = useState("");
  const [resultado, setResultado] = useState(null);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState(null);

  async function avaliar() {
    if (!prompt.trim() || prompt.trim().length < 10) return;
    setLoading(true);
    setError(null);
    setResultado(null);

    try {
      const res = await fetch("/api/avaliar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Erro na avaliação");
      }

      const parsed = await res.json();
      setResultado(parsed);
    } catch (e) {
      setError(e.message || "Algo deu errado. Tenta de novo.");
    } finally {
      setLoading(false);
    }
  }

  function resetar() {
    setPrompt("");
    setResultado(null);
    setError(null);
  }

  const notaCfg = resultado ? NOTA_CONFIG[resultado.nota] : null;

  return (
    <div style={{ minHeight: "100vh", background: "#FAFAF8", fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif" }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        textarea:focus { outline: none; }
        button:focus   { outline: none; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%      { opacity: 0.4; }
        }
        .fade-up   { animation: fadeUp 0.4s ease forwards; }
        .fade-up-1 { animation: fadeUp 0.4s 0.05s ease both; }
        .fade-up-2 { animation: fadeUp 0.4s 0.10s ease both; }
        .fade-up-3 { animation: fadeUp 0.4s 0.15s ease both; }
        .fade-up-4 { animation: fadeUp 0.4s 0.20s ease both; }
        .fade-up-5 { animation: fadeUp 0.4s 0.25s ease both; }
        .btn-avaliar {
          background: #04342C; color: #fff; border: none; border-radius: 8px;
          padding: 14px 32px; font-size: 15px; font-weight: 500; cursor: pointer;
          transition: background 0.15s, transform 0.1s; font-family: inherit; letter-spacing: 0.01em;
        }
        .btn-avaliar:hover    { background: #0F6E56; }
        .btn-avaliar:active   { transform: scale(0.98); }
        .btn-avaliar:disabled { background: #B4B2A9; cursor: not-allowed; }
        .btn-novo {
          background: transparent; color: #5F5E5A; border: 1px solid #D3D1C7;
          border-radius: 8px; padding: 12px 24px; font-size: 14px; font-weight: 400;
          cursor: pointer; transition: all 0.15s; font-family: inherit;
        }
        .btn-novo:hover { background: #F1EFE8; color: #2C2C2A; }
        .parte-tag {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 3px 10px; border-radius: 20px; font-size: 12px; font-weight: 500;
        }
      `}</style>

      {/* Header */}
      <div style={{ background: "#04342C", padding: "36px 40px 32px", borderBottom: "1px solid #0F6E56" }}>
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <h1 style={{ fontFamily: "'Lora', serif", fontSize: 36, fontWeight: 600, color: "#E1F5EE", lineHeight: 1.2 }}>
            Avaliador de Prompts
          </h1>
        </div>
      </div>

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "32px 40px 60px" }}>

        {/* Legenda */}
        {!resultado && (
          <div className="fade-up" style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
            {Object.entries(COLORS).map(([k, v]) => (
              <div key={k} style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "5px 12px", background: v.light,
                borderRadius: 20, border: `1px solid ${v.main}22`,
              }}>
                <span style={{ fontWeight: 600, color: v.main, fontSize: 13 }}>{k}</span>
                <span style={{ fontSize: 12, color: v.main }}>{v.label}</span>
              </div>
            ))}
          </div>
        )}

        {/* Input */}
        {!resultado && (
          <div className="fade-up-1">
            <div style={{
              background: "#fff", border: "1px solid #D3D1C7",
              borderRadius: 12, overflow: "hidden", marginBottom: 16,
            }}>
              <textarea
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) avaliar(); }}
                placeholder={"Cole ou escreva o seu prompt aqui...\n\nEx: me ajuda a escrever um e-mail para um cliente"}
                rows={6}
                style={{
                  width: "100%", border: "none", padding: "20px 20px 16px",
                  fontSize: 15, lineHeight: 1.7, color: "#2C2C2A",
                  background: "transparent", resize: "none", fontFamily: "inherit",
                }}
              />
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "10px 16px", borderTop: "1px solid #F1EFE8", background: "#FAFAF8",
              }}>
                <span style={{ fontSize: 12, color: "#888780" }}>{prompt.length} caracteres</span>
                <button className="btn-avaliar" onClick={avaliar} disabled={loading || prompt.trim().length < 10}>
                  {loading ? "Avaliando..." : "Avaliar prompt →"}
                </button>
              </div>
            </div>
            {error && <p style={{ fontSize: 13, color: "#A32D2D", marginTop: 8 }}>{error}</p>}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: "center", padding: "48px 0" }}>
            <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 16 }}>
              {["P","A","R","T","E"].map((l, i) => (
                <div key={l} style={{
                  width: 36, height: 36, borderRadius: 8,
                  background: COLORS[l].light, display: "flex",
                  alignItems: "center", justifyContent: "center",
                  fontWeight: 600, fontSize: 14, color: COLORS[l].main,
                  animation: "pulse 1.4s ease infinite",
                  animationDelay: `${i * 0.15}s`,
                }}>{l}</div>
              ))}
            </div>
            <p style={{ fontSize: 14, color: "#888780" }}>Analisando seu prompt...</p>
          </div>
        )}

        {/* Resultado */}
        {resultado && notaCfg && (
          <div>
            {/* Nota */}
            <div className="fade-up" style={{
              background: notaCfg.bg, border: `1px solid ${notaCfg.border}`,
              borderRadius: 12, padding: "20px 24px", marginBottom: 20,
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <div>
                <p style={{ fontSize: 12, color: notaCfg.color, fontWeight: 500, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.08em" }}>Avaliação</p>
                <p style={{ fontFamily: "'Lora', serif", fontSize: 22, fontWeight: 600, color: notaCfg.color }}>
                  {notaCfg.emoji} {notaCfg.label}
                </p>
              </div>
              <button className="btn-novo" onClick={resetar}>Novo prompt</button>
            </div>

            {/* Prompt original */}
            <div className="fade-up-1" style={{
              background: "#fff", border: "1px solid #D3D1C7",
              borderRadius: 12, padding: "16px 20px", marginBottom: 20,
            }}>
              <p style={{ fontSize: 11, fontWeight: 500, color: "#888780", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Seu prompt</p>
              <p style={{ fontSize: 14, color: "#444441", lineHeight: 1.7, fontStyle: "italic" }}>{prompt}</p>
            </div>

            {/* Diagnóstico */}
            <div className="fade-up-2" style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 12, fontWeight: 500, color: "#888780", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>Diagnóstico por parte</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {Object.entries(resultado.partes).map(([letra, dado]) => {
                  const cfg = COLORS[letra];
                  const st  = STATUS[dado.status];
                  return (
                    <div key={letra} style={{
                      background: "#fff", border: "1px solid #D3D1C7",
                      borderRadius: 10, padding: "12px 16px",
                      display: "flex", alignItems: "flex-start", gap: 12,
                    }}>
                      <div style={{
                        width: 32, height: 32, minWidth: 32, borderRadius: 8,
                        background: cfg.light, display: "flex", alignItems: "center",
                        justifyContent: "center", fontWeight: 600, fontSize: 14, color: cfg.main, marginTop: 1,
                      }}>{letra}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                          <span style={{ fontSize: 14, fontWeight: 500, color: "#2C2C2A" }}>{cfg.label}</span>
                          <span className="parte-tag" style={{ background: st.bg, color: st.color }}>{st.label}</span>
                        </div>
                        {dado.encontrado
                          ? <p style={{ fontSize: 13, color: "#5F5E5A", fontStyle: "italic", lineHeight: 1.5 }}>"{dado.encontrado}"</p>
                          : <p style={{ fontSize: 13, color: "#B4B2A9", lineHeight: 1.5 }}>Não identificado no prompt</p>
                        }
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Melhorias */}
            {resultado.melhorias?.length > 0 && (
              <div className="fade-up-3" style={{ marginBottom: 20 }}>
                <p style={{ fontSize: 12, fontWeight: 500, color: "#888780", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
                  {resultado.melhorias.length === 1 ? "1 sugestão de melhoria" : `${resultado.melhorias.length} sugestões de melhoria`}
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {resultado.melhorias.map((m, i) => {
                    const cfg = COLORS[m.parte];
                    return (
                      <div key={i} style={{
                        background: cfg.light, border: `1px solid ${cfg.main}33`,
                        borderRadius: 10, padding: "14px 16px",
                        display: "flex", gap: 12, alignItems: "flex-start",
                      }}>
                        <div style={{
                          width: 28, height: 28, minWidth: 28, borderRadius: 6,
                          background: cfg.main, display: "flex", alignItems: "center",
                          justifyContent: "center", fontWeight: 600, fontSize: 13, color: "#fff", marginTop: 1,
                        }}>{m.parte}</div>
                        <div>
                          <p style={{ fontSize: 12, fontWeight: 500, color: cfg.main, marginBottom: 3 }}>{COLORS[m.parte].label}</p>
                          <p style={{ fontSize: 14, color: "#2C2C2A", lineHeight: 1.6 }}>{m.sugestao}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Prompt melhorado */}
            {resultado.prompt_melhorado && (
              <div className="fade-up-4" style={{
                background: "#fff", border: "1px solid #5DCAA5",
                borderRadius: 12, overflow: "hidden", marginBottom: 24,
              }}>
                <div style={{
                  background: "#E1F5EE", padding: "10px 16px",
                  borderBottom: "1px solid #5DCAA5",
                }}>
                  <span style={{ fontSize: 11, fontWeight: 500, color: "#0F6E56", textTransform: "uppercase", letterSpacing: "0.08em" }}>Prompt melhorado</span>
                </div>
                <div style={{ padding: "16px 20px" }}>
                  <p style={{ fontSize: 14, color: "#2C2C2A", lineHeight: 1.8 }}>{resultado.prompt_melhorado}</p>
                </div>
              </div>
            )}

            <div className="fade-up-5" style={{ textAlign: "center" }}>
              <button className="btn-novo" onClick={resetar}>← Avaliar outro prompt</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
