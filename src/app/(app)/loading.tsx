export default function Loading() {
  return (
    <div style={{ padding: "20px 20px 24px", display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Heading */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div className="skeleton" style={{ height: 11, width: 80 }} />
        <div className="skeleton" style={{ height: 30, width: 220 }} />
      </div>
      {/* Hero card */}
      <div className="skeleton" style={{ height: 130, borderRadius: 20 }} />
      {/* Section */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div className="skeleton" style={{ height: 11, width: 60 }} />
        {[1, 2, 3].map((i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "10px 0" }}>
            <div className="skeleton" style={{ width: 52, height: 52, borderRadius: 12, flexShrink: 0 }} />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
              <div className="skeleton" style={{ height: 10, width: 60 }} />
              <div className="skeleton" style={{ height: 16, width: 160 }} />
            </div>
          </div>
        ))}
      </div>
      {/* Task preview */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div className="skeleton" style={{ height: 11, width: 80 }} />
        {[1, 2].map((i) => (
          <div key={i} className="skeleton" style={{ height: 56, borderRadius: 14 }} />
        ))}
      </div>
    </div>
  );
}
