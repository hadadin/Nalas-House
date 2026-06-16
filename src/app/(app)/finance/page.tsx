export default function FinancePage() {
  return (
    <div style={{ padding: "20px 20px 24px", display: "flex", flexDirection: "column", gap: 22 }}>
      <div>
        <div style={{ fontSize: 12, color: "var(--coral)", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4 }}>Budget</div>
        <div className="serif" style={{ fontSize: 28, fontWeight: 700, color: "var(--ink)" }}>Finance <em style={{ fontWeight: 500 }}>&amp; spending.</em></div>
      </div>

      {/* Budget bar */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <span style={{ fontSize: 12, fontWeight: 700 }}>Monthly budget</span>
          <span style={{ fontSize: 12, color: "var(--ink2)" }}>₪6,240 / ₪12,000</span>
        </div>
        <div style={{ height: 10, background: "var(--warmer)", borderRadius: 999, overflow: "hidden", display: "flex" }}>
          {[
            { width: 15, color: "#4E9A5B" },
            { width: 7.5, color: "var(--coral)" },
            { width: 10, color: "var(--blue)" },
            { width: 19.5, color: "var(--purple)" },
          ].map((s, i) => (
            <div key={i} style={{ width: `${s.width}%`, background: s.color, height: "100%" }} />
          ))}
        </div>
      </div>

      {/* Stats grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {[
          { label: "Spent", value: "₪6,240", sub: "this month" },
          { label: "Remaining", value: "₪5,760", sub: "of ₪12,000" },
        ].map((x) => (
          <div key={x.label} style={{ background: "var(--surface)", borderRadius: 16, padding: 18, border: "1px solid var(--line)" }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "var(--ink3)", textTransform: "uppercase" }}>{x.label}</div>
            <div className="serif" style={{ fontSize: 26, fontWeight: 700, color: "var(--coral)", marginTop: 6 }}>{x.value}</div>
            <div style={{ fontSize: 11, color: "var(--ink3)" }}>{x.sub}</div>
          </div>
        ))}
      </div>

      {/* By category */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "var(--ink3)", textTransform: "uppercase", marginBottom: 10 }}>By category</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {[
            { label: "Groceries", value: "₪1,800", color: "#4E9A5B" },
            { label: "Dining out", value: "₪900", color: "var(--coral)" },
            { label: "Utilities", value: "₪1,200", color: "var(--blue)" },
            { label: "Other", value: "₪2,340", color: "var(--purple)" },
          ].map((cat) => (
            <div key={cat.label} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: "var(--surface)", borderRadius: 12, border: "1px solid var(--line)" }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: cat.color, flexShrink: 0 }} />
              <span style={{ fontWeight: 600, fontSize: 14 }}>{cat.label}</span>
              <div style={{ flex: 1 }} />
              <span style={{ fontWeight: 700, fontSize: 14 }}>{cat.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Upload CTA */}
      <div style={{ background: "var(--brand)", borderRadius: 16, padding: "18px 20px" }}>
        <div className="serif" style={{ fontSize: 18, fontWeight: 700, color: "var(--on-brand)", marginBottom: 4 }}>Upload a statement</div>
        <div style={{ fontSize: 13, color: "var(--on-brand)", opacity: 0.8, marginBottom: 14, lineHeight: 1.5 }}>
          Export a PDF or CSV from your bank. AI parses &amp; categorises every transaction automatically.
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button style={{ background: "var(--green)", color: "var(--on-green)", border: "none", borderRadius: 999, padding: "9px 18px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Upload PDF</button>
          <button style={{ background: "var(--surface)", color: "var(--ink)", border: "1.5px solid var(--line)", borderRadius: 999, padding: "9px 18px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Upload CSV</button>
        </div>
      </div>

      <div style={{ textAlign: "center", padding: "12px 0 4px", fontSize: 12, color: "var(--ink3)" }}>
        Finance features coming soon — this screen shows example data.
      </div>
    </div>
  );
}
