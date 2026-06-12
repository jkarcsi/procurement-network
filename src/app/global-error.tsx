"use client";

// Last-resort error screen when the root layout itself fails to render.
export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="hu">
      <body style={{ fontFamily: "sans-serif", textAlign: "center", padding: "4rem 1rem" }}>
        <h1>Hiba történt</h1>
        <p>Váratlan hiba lépett fel. A hibát naplóztuk, és hamarosan javítjuk.</p>
        <button
          onClick={reset}
          style={{
            marginTop: "1rem",
            padding: "0.6rem 1.4rem",
            borderRadius: "0.5rem",
            border: "none",
            background: "#4f46e5",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          Újrapróbálom
        </button>
      </body>
    </html>
  );
}
