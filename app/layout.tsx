import type { Metadata, Viewport } from "next";
import { Anton, Inter_Tight, Space_Mono } from "next/font/google";
import "./globals.css";
import TransitionProvider from "@/components/TransitionProvider";
import SmoothScroll from "@/components/SmoothScroll";
import Preloader from "@/components/Preloader";
import Cursor from "@/components/Cursor";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const anton = Anton({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-anton",
});

const interTight = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-inter-tight",
});

const spaceMono = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-space-mono",
});

export const metadata: Metadata = {
  title: "Javi Villasoler — Video Director & Editor",
  description:
    "Independent video director and editor based in Madrid. Brand films, music videos, commercials and documentaries crafted frame by frame.",
};

export const viewport: Viewport = {
  themeColor: "#131313",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${anton.variable} ${interTight.variable} ${spaceMono.variable} antialiased`}
    >
      <body>
        {/* Apply the persisted theme before first paint to avoid a flash */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{if(localStorage.getItem('theme')==='light')document.documentElement.dataset.theme='light'}catch(e){}",
          }}
        />
        <TransitionProvider>
          <SmoothScroll />
          <Preloader />
          <Cursor />
          <Header />
          <main>{children}</main>
          <Footer />
        </TransitionProvider>
      </body>
    </html>
  );
}
