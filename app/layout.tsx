import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BOSS Prototype Hub",
  description: "Business Operations Support Systems — PT Bussan Auto Finance",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="h-full">
      <body className="h-full bg-[--color-page-bg] antialiased" style={{ fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
        {children}
      </body>
    </html>
  );
}