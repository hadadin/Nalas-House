export default function Loading() {
  return (
    <div style={{ padding: "12px 20px 24px", display: "flex", flexDirection: "column", gap: 18 }}>
      {/* Heading */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div className="skeleton" style={{ height: 11, width: 60 }} />
        <div className="skeleton" style={{ height: 28, width: 200 }} />
      </div>
      {/* Sub-tabs */}
      <div className="skeleton" style={{ height: 40, width: 300, borderRadius: 999 }} />
      {/* Week days */}
      {[0, 1, 2, 3].map((i) => (
        <div key={i} style={{ paddingBottom: 20, borderBottom: "1px solid var(--line)" }}>
          <div className="skeleton" style={{ height: 22, width: 100, marginBottom: 14 }} />
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {["breakfast", "lunch", "dinner"].map((mt) => (
              <div key={mt} style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div className="skeleton" style={{ width: 54, height: 54, borderRadius: 12, flexShrink: 0 }} />
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                  <div className="skeleton" style={{ height: 9, width: 70 }} />
                  <div className="skeleton" style={{ height: 15, width: 150 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
