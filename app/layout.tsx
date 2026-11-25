import type { Metadata } from "next";
import { Courier_Prime, Inter, Newsreader } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DemoBanner } from "@/components/shared/demo-banner";
import { PUBLIC_SITE_URL } from "@/lib/constants";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const newsreader = Newsreader({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

const courier = Courier_Prime({
  variable: "--font-typewriter",
  weight: ["400", "700"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(PUBLIC_SITE_URL),
  title: {
    default: "GRO-THERP — Casting & Model Agency",
    template: "%s · GRO-THERP",
  },
  description:
    "An editorial casting agency representing distinctive faces and connecting talent with ambitious clients.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${newsreader.variable} ${courier.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <TooltipProvider>
          <DemoBanner />
          {children}
          <Toaster position="bottom-right" />
        </TooltipProvider>
      </body>
    </html>
  );
}
