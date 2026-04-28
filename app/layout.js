import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/app/Context/AuthContext";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata = {
  title: "Critique.AI",
  description: "AI-based assignment feedback",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#F4F4F4] text-[#1A1A1A] font-inter">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
