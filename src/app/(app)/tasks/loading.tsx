export default function Loading() {
  return (
    <div style={{ padding: "20px 20px 24px", display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div className="skeleton" style={{ height: 11, width: 80 }} />
        <div className="skeleton" style={{ height: 28, width: 200 }} />
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <div className="skeleton" style={{ height: 38, width: 90, borderRadius: 999 }} />
        <div className="skeleton" style={{ height: 38, width: 80, borderRadius: 999, marginLeft: "auto" }} />
      </div>
      <div className="skeleton" style={{ height: 8, borderRadius: 999 }} />
      {["Monday", "Wednesday", "Friday"].map((day) => (
        <div key={day}>
          <div className="skeleton" style={{ height: 20, width: 80, marginBottom: 10 }} />
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[1, 2].map((i) => (
              <div key={i} className="skeleton" style={{ height: 58, borderRadius: 14 }} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
