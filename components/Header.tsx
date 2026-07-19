"use client";

import { useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { getLenis } from "@/lib/lenis-store";
import TransitionLink from "@/components/TransitionLink";
import LocalTime from "@/components/LocalTime";
import ThemeToggle from "@/components/ThemeToggle";
import { useHeaderContent } from "@/hooks/useContent";
import { useIsTouch } from "@/hooks/useIsTouch";

/** Animated thumbnail that grows in width at the left of a menu item on
 *  hover, pushing the label right. Accepts a looping video or a .gif URL. */
function MenuPreview({ src, alt }: { src?: string; alt: string }) {
  if (!src) return null;
  return (
    <span className="menu-preview" aria-hidden>
      {src.endsWith(".gif") ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} />
      ) : (
        <video src={src} muted loop playsInline autoPlay preload="metadata" />
      )}
    </span>
  );
}

export default function Header() {
  const { data: header } = useHeaderContent();
  const isTouch = useIsTouch();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  useGSAP(
    () => {
      const menu = menuRef.current!;
      gsap.set(menu, { yPercent: -120 });
      tlRef.current = gsap
        .timeline({ paused: true })
        .set(menu, { pointerEvents: "auto" })
        .to(menu, { yPercent: 0, duration: 0.9, ease: "power4.inOut" })
        .fromTo(
          ".menu-link-inner",
          { yPercent: 115 },
          {
            yPercent: 0,
            duration: 0.9,
            ease: "power4.out",
            stagger: 0.07,
          },
          "-=0.35"
        )
        .fromTo(
          ".menu-meta",
          { opacity: 0, y: 12 },
          { opacity: 1, y: 0, duration: 0.5, ease: "power2.out", stagger: 0.05 },
          "<+0.15"
        );
    },
    { scope: menuRef, dependencies: [header.navigationItems.length] }
  );

  const toggle = (next: boolean) => {
    setOpen(next);
    const tl = tlRef.current;
    if (!tl) return;
    if (next) {
      getLenis()?.stop();
      tl.timeScale(1).play();
    } else {
      getLenis()?.start();
      tl.timeScale(1.6).reverse();
      gsap.set(menuRef.current, { pointerEvents: "none", delay: 0.6 });
    }
  };

  const onNavClick = () => {
    // Let the transition curtain take over, then quietly close the menu.
    setOpen(false);
    getLenis()?.start();
    gsap.delayedCall(0.9, () => {
      tlRef.current?.progress(0).pause();
      gsap.set(menuRef.current, { pointerEvents: "none" });
    });
  };

  return (
    <>
      <header
        className="fixed top-0 left-0 z-[70] w-full px-[4vw] py-5 flex items-center justify-between"
        style={{ color: open ? "#EFEEEC" : "var(--fg)" }}
      >
        <TransitionLink
          href="/"
          label="Home"
          onClick={() => open && onNavClick()}
          className="label-mono text-[0.8rem]! font-bold tracking-[0.1em]"
        >
          {header.logoText}
          <sup>®</sup>
        </TransitionLink>

        <div className="flex items-center gap-6">
          <LocalTime className="label-mono opacity-60 hidden md:block" />
          <ThemeToggle />
          <TransitionLink
            href="/contact"
            label="Contact"
            onClick={() => open && onNavClick()}
            className="btn-pill hidden sm:inline-flex"
            style={{ transition: "none" }}
          >
            {header.contactButtonLabel}
          </TransitionLink>
          <button
            onClick={() => toggle(!open)}
            aria-label={open ? "Close menu" : "Open menu"}
            className="relative h-10 w-10 flex flex-col items-center justify-center gap-[6px] cursor-pointer"
          >
            <span
              className="block h-[2px] w-7 bg-current transition-transform duration-500"
              style={{
                transform: open ? "translateY(4px) rotate(45deg)" : "none",
              }}
            />
            <span
              className="block h-[2px] w-7 bg-current transition-transform duration-500"
              style={{
                transform: open ? "translateY(-4px) rotate(-45deg)" : "none",
              }}
            />
          </button>
        </div>
      </header>

      {/* Fullscreen menu */}
      <div
        ref={menuRef}
        className="curtain-panel fixed z-[60] pointer-events-none"
        style={{
          top: "-20lvh",
          left: "-10vw",
          width: "120vw",
          height: "140lvh",
          background: "#1C1C1C",
        }}
      >
        <div
          className="absolute flex flex-col justify-between px-[4vw] pt-28 pb-8 text-bone"
          style={{
            top: "20lvh",
            left: "10vw",
            width: "100vw",
            height: "100lvh",
          }}
        >
          <nav className="flex flex-col">
            {header.navigationItems.map((item, i) => (
              <div key={item.pageUrl} className="overflow-hidden">
                <div className="menu-link-inner">
                  <TransitionLink
                    href={item.pageUrl}
                    label={item.pageLabel}
                    onClick={onNavClick}
                    className="group relative flex items-center gap-4 py-1"
                  >
                    <span className="label-mono opacity-40 w-8 shrink-0">
                      0{i + 1}
                    </span>
                    {/* Hover preview pushes the label right as it grows —
                        only useful with a real pointer. On touch a tap would
                        leave it stuck open and shove the label off-screen,
                        so we skip it entirely. */}
                    {!isTouch && (
                      <MenuPreview
                        src={item.hoverPreviewVideoUrl}
                        alt={item.pageLabel}
                      />
                    )}
                    <span
                      className="display"
                      style={{ fontSize: "clamp(3rem, 9vh, 7rem)" }}
                    >
                      {item.pageLabel}
                    </span>
                  </TransitionLink>
                </div>
              </div>
            ))}
          </nav>

          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="menu-meta flex flex-col gap-1">
              <span className="label-mono opacity-40">
                {header.menuContactSectionLabel}
              </span>
              <a
                href={`mailto:${header.contactEmail}`}
                className="link-underline label-mono text-sm!"
              >
                {header.contactEmail}
              </a>
            </div>
            <div className="menu-meta flex gap-6">
              {header.socialLinks.map((social) => (
                <a
                  key={social.platformName}
                  href={social.profileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="link-underline label-mono"
                >
                  {social.platformName}
                </a>
              ))}
            </div>
            <LocalTime className="menu-meta label-mono opacity-40" />
          </div>
        </div>
      </div>
    </>
  );
}
