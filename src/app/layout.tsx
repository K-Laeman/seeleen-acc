import type { Metadata } from "next";
import { Noto_Sans_Thai } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import Providers from "@/components/Providers";
import { Toaster } from "@/components/ui/sonner";

const notoSansThai = Noto_Sans_Thai({
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-noto-sans-thai",
});

export const metadata: Metadata = {
  title: "Fired Chicken - ระบบบัญชี",
  description: "ระบบบัญชีและงบกำไรขาดทุนสำหรับร้าน Fired Chicken",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th" suppressHydrationWarning>
      <body className={`${notoSansThai.variable} ${notoSansThai.className}`}>
        <Providers>
          <div className="flex h-screen bg-background">
            <Sidebar />
            <main className="flex-1 overflow-auto">
              <div className="p-4 pt-16 lg:pt-6 xl:pt-8 lg:p-6 xl:p-8 max-w-[1600px] mx-auto">
                {children}
              </div>
            </main>
          </div>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}

