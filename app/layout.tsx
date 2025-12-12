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

export const metadata: Metadata = {
  title: "Wishlist - Gusto ko ng ...",
  description:
    "Mag-wishlist na! ✨ Send links from Shopee/Lazada & we magically turn it into a shareable list. No awkward 'Ano gusto mo?' questions this Pasko!",
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
