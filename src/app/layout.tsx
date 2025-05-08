import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import BodyContent from "@/components/BodyContent";

const poppins = Poppins({ 
  weight: ['300', '400', '500', '600', '700'],
  subsets: ["latin"],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Plan2Plate - Your Recipe Companion",
  description: "Discover and create amazing recipes with Plan2Plate",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${poppins.className} min-h-screen bg-gradient-to-br from-amber-50 via-white to-amber-100`}>
        <BodyContent>{children}</BodyContent>
      </body>
    </html>
  );
}
