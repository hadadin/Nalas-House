export default function Loading() {
  return (
    <div style={{ padding: "20px 20px 24px", display: "flex", flexDirection: "column", gap: 22 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div className="skeleton" style={{ height: 11, width: 100 }} />
        <div className="skeleton" style={{ height: 28, width: 180 }} />
      </div>
      <div className="skeleton" style={{ height: 84, borderRadius: 18 }} />
      <div className="skeleton" style={{ height: 70, borderRadius: 14 }} />
      {[1, 2, 3].map((i) => (
        <div key={i} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div className="skeleton" style={{ height: 11, width: 120 }} />
          <div style={{ display: "flex", gap: 8 }}>
            <div className="skeleton" style={{ height: 36, width: 90, borderRadius: 999 }} />
            <div className="skeleton" style={{ height: 36, width: 80, borderRadius: 999 }} />
          </div>
        </div>
      ))}
    </div>
  );
}
