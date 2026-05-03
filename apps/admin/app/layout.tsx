import type { ReactNode } from "react";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
          background: "#FBF8F1",
          color: "#1F2A26",
        }}
      >
        {children}
      </body>
    </html>
  );
}
