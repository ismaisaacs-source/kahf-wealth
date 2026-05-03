const cards = [
  ["Users", "Premium members, support flags, and deletion requests."],
  ["Estate handoffs", "Queued, failed, and under-review attorney submissions."],
  ["Methodology", "Dated screening and trust content versioning."],
  ["Audit logs", "Sensitive operational visibility for internal staff."],
];

export default function AdminHomePage() {
  return (
    <main style={{ padding: 32 }}>
      <h1 style={{ color: "#10382F" }}>Kahf Wealth Admin</h1>
      <p>
        Secure operational dashboard for subscriptions, methodology updates,
        estate handoffs, and audit-friendly internal review.
      </p>
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 16,
          marginTop: 24,
        }}
      >
        {cards.map(([title, body]) => (
          <article
            key={title}
            style={{
              background: "#FFFFFF",
              border: "1px solid #D7D3C8",
              borderRadius: 18,
              padding: 20,
            }}
          >
            <h2>{title}</h2>
            <p>{body}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
