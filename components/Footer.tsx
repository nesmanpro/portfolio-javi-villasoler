"use client";

import { getLenis } from "@/lib/lenis-store";
import SplitReveal from "@/components/SplitReveal";
import TransitionLink from "@/components/TransitionLink";
import LocalTime from "@/components/LocalTime";
import { useFooterContent } from "@/hooks/useContent";

export default function Footer() {
  const { data: footer } = useFooterContent();

  const toTop = () => {
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(0, { duration: 1.4 });
    else window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer
      data-theme-section="dark"
      className="relative px-[4vw] pt-[18vh] pb-8 flex flex-col justify-between min-h-[92svh]"
    >
      <div>
        <SplitReveal as="p" className="label-mono opacity-50 mb-8" type="lines">
          {footer.ctaEyebrowText}
        </SplitReveal>
        <TransitionLink
          href="/contact"
          label="Contact"
          data-cursor="Say hi"
          className="block"
        >
          <SplitReveal
            as="h2"
            type="lines"
            stagger={0.1}
            className="display"
            key={`${footer.ctaTitleLine1}-${footer.ctaTitleLine2}`}
          >
            <span
              className="block"
              style={{ fontSize: "clamp(3.5rem, 13vw, 16rem)" }}
            >
              {footer.ctaTitleLine1}
            </span>
            <span
              className="block"
              style={{ fontSize: "clamp(3.5rem, 13vw, 16rem)" }}
            >
              {footer.ctaTitleLine2}
              <sup className="text-[0.3em] align-super">©</sup>
            </span>
          </SplitReveal>
        </TransitionLink>
        <a
          href={`mailto:${footer.contactEmail}`}
          className="link-underline label-mono text-sm! mt-10 inline-block"
        >
          {footer.contactEmail}
        </a>
      </div>

      <div
        className="mt-24 border-t pt-6 flex flex-wrap items-center justify-between gap-4"
        style={{ borderColor: "var(--line)" }}
      >
        <span className="label-mono opacity-50">{footer.copyrightText}</span>
        <LocalTime className="label-mono opacity-50 hidden sm:block" />
        <div className="flex gap-5">
          {footer.socialLinks.map((social) => (
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
        <button
          onClick={toTop}
          className="label-mono link-underline cursor-pointer"
        >
          {footer.backToTopLabel}
        </button>
      </div>
    </footer>
  );
}
