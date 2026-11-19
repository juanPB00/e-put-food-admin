import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const font = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font" });
export const metadata: Metadata = { title: "E-put Food", description: "Rasa rumahan, hangat di setiap perjalanan." };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className={font.variable}>{children}</body>
    </html>
  );
}
