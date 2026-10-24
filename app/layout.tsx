import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Diários FF",
  description: "Chat e comunidades de Free Fire - grupos e diários",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">{children}</body>
    </html>
  );
}
