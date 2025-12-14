import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CropImageProvider } from "@/components/providers/CropImageProvider";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// 1. Define your base URL (usually in layout.tsx, but works here too)
// This ensures relative links like '/api/og/default' become full URLs
const baseUrl = process.env.NEXT_PUBLIC_SITE_URL
  ? `https://${process.env.NEXT_PUBLIC_SITE_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl), // <--- Important for OG images
  title: "Wishlist - Gusto ko ng ...",
  description:
    "Mag-wishlist na! ✨ Send links from Tiktok/Shopee/Lazada & we magically turn it into a shareable list. No awkward 'Ano gusto mo?' questions this Pasko!",
  openGraph: {
    title: "Wishlist - Gusto ko ng ...",
    description: "Create your wishlist or become a Santa today!",
    type: "website",
    images: [
      {
        url: "/api/og/default", // <--- Points to your route handler
        width: 1200,
        height: 630,
        alt: "Create a Wishlist or Give Gifts",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/api/og/default"], // <--- Also good to set for Twitter
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="min-h-screen bg-linear-to-b from-base-300 to-base-100 text-base-content flex flex-col">
          <main className="max-w-4xl w-full mx-auto grow flex flex-col h-full">
            <CropImageProvider>{children}</CropImageProvider>
          </main>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
