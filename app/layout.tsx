import type { Metadata, Viewport } from "next";
import { Archivo, Roboto_Serif } from "next/font/google";
import "./globals.css";
import TransitionProvider from "@/components/TransitionProvider";
import SmoothScroll from "@/components/SmoothScroll";
import Preloader from "@/components/Preloader";
import Cursor from "@/components/Cursor";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// The site's two typefaces (tokens in globals.css): a variable-width
// grotesque for everything sans and a compressed serif for accents. In the
// hero headline their weight reacts to the cursor (see HeroTitle.tsx).
const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-flex",
});

const robotoSerif = Roboto_Serif({
  subsets: ["latin"],
  axes: ["wdth", "opsz"],
  variable: "--font-flex-serif",
});

export const metadata: Metadata = {
  title: "Javi Villalba Soler — Video Director & Editor",
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
      className={`${archivo.variable} ${robotoSerif.variable} antialiased`}
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
