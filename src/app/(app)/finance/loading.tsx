export default function Loading() {
  return (
    <div style={{ padding: "20px 20px 24px", display: "flex", flexDirection: "column", gap: 22 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div className="skeleton" style={{ height: 11, width: 60 }} />
        <div className="skeleton" style={{ height: 28, width: 160 }} />
      </div>
      <div className="skeleton" style={{ height: 10, borderRadius: 999 }} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div className="skeleton" style={{ height: 90, borderRadius: 16 }} />
        <div className="skeleton" style={{ height: 90, borderRadius: 16 }} />
      </div>
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="skeleton" style={{ height: 48, borderRadius: 12 }} />
      ))}
      <div className="skeleton" style={{ height: 120, borderRadius: 16 }} />
    </div>
  );
}
