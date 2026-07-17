"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { bus } from "@/lib/bus";

interface TransitionCtx {
  navigate: (href: string, label?: string) => void;
}

const Ctx = createContext<TransitionCtx>({ navigate: () => {} });

export function useTransition() {
  return useContext(Ctx);
}

function labelFor(href: string): string {
  if (href === "/") return "Home";
  const seg = href.split("/").filter(Boolean);
  if (seg[0] === "work" && seg.length > 1) return seg[1].replace(/-/g, " ");
  return seg[0] ?? "Home";
}

export default function TransitionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const curtainRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const covering = useRef(false);
  // Initialized to the mount pathname: the effect only acts when the path
  // actually CHANGES, which also makes it StrictMode-safe (a double-run on
  // mount sees the same pathname and bails out both times).
  const prevPathname = useRef(pathname);

  // Park the curtain below the viewport. Done with GSAP (not an inline
  // transform) so yPercent tweens don't stack on top of a baked-in pixel
  // offset. The preloader covers the first paint, so no flash is visible.
  useGSAP(() => {
    gsap.set(curtainRef.current, { yPercent: 120, visibility: "visible" });
  });

  // Reveal the freshly mounted page once the route has changed.
  // (The initial load is revealed by the preloader instead.)
  useEffect(() => {
    if (prevPathname.current === pathname) return;
    prevPathname.current = pathname;
    window.scrollTo(0, 0);
    requestAnimationFrame(() => ScrollTrigger.refresh());

    if (!covering.current) {
      // Browser back/forward without our curtain — just re-arm entrances.
      bus.reveal();
      return;
    }
    covering.current = false;
    const curtain = curtainRef.current!;
    gsap
      .timeline()
      .to(curtain, {
        yPercent: -120,
        duration: 1,
        ease: "power4.inOut",
        delay: 0.25,
        onStart: () => bus.reveal(),
      })
      .set(curtain, { yPercent: 120 });
  }, [pathname]);

  const navigate = useCallback(
    (href: string, label?: string) => {
      if (covering.current) return;
      if (href === window.location.pathname) return;
      covering.current = true;
      bus.cover();
      if (labelRef.current) {
        labelRef.current.textContent = label ?? labelFor(href);
      }
      const curtain = curtainRef.current!;
      gsap
        .timeline()
        .set(curtain, { yPercent: 120 })
        .to(curtain, { yPercent: 0, duration: 0.8, ease: "power4.inOut" })
        .call(() => router.push(href));
    },
    [router]
  );

  return (
    <Ctx.Provider value={{ navigate }}>
      {children}
      {/* Curved curtain used for page transitions */}
      <div
        ref={curtainRef}
        aria-hidden
        className="curtain-panel fixed z-[90] pointer-events-none"
        style={{
          top: "-20lvh",
          left: "-10vw",
          width: "120vw",
          height: "140lvh",
          visibility: "hidden",
        }}
      >
        <div
          className="absolute flex items-center justify-center"
          style={{ top: "20lvh", left: "10vw", width: "100vw", height: "100lvh" }}
        >
          <span
            ref={labelRef}
            className="display text-bone capitalize"
            style={{ fontSize: "clamp(3rem, 9vw, 9rem)" }}
          />
        </div>
      </div>
    </Ctx.Provider>
  );
}
