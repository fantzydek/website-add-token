import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Token Manager — Neobrutalism",
  description: "Kelola Telegram Bot Token dengan aman. Admin & User roles.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-neo-cream text-neo-black antialiased neo-grid">
        {children}
      </body>
    </html>
  );
}
