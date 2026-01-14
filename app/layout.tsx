import type { Metadata } from "next";
import { Inter, Playfair_Display, Lora } from "next/font/google";
import "./globals.css";

// Font for body text
const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter"
});

// Font for quotes - elegant serif
const playfair = Playfair_Display({ 
  subsets: ["latin"],
  variable: "--font-playfair"
});

// Alternative: Lora is also beautiful for quotes
const lora = Lora({ 
  subsets: ["latin"],
  variable: "--font-lora"
});

export const metadata: Metadata = {
  title: "Quote Collection",
  description: "Personal quote collection and review app",
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: 'cover'
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Quote Collection'
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${playfair.variable} ${lora.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}